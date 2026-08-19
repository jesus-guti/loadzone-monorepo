import { database } from "@repo/database";
import { getPrivateBlob } from "@repo/storage";
import { toBlobDeleteTarget } from "@repo/storage/shared";
import { NextResponse, type NextRequest } from "next/server";

/** Must match `middleware.ts` and `app/lib/token-storage.ts`. */
const TOKEN_COOKIE = "lz_player_token";

type CromoMediaKind = "photo" | "crest";

function parseKind(raw: string | null): CromoMediaKind | null {
  if (raw === "photo" || raw === "crest") {
    return raw;
  }
  return null;
}

/**
 * Cookie-authed private blob proxy for Streak Cromo identity chrome.
 * Serves only this Player's photo or their Club crest — never Team logo.
 * Auth via `lz_player_token` (SameSite=Lax); never accept or log the token from the query string.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const kind = parseKind(request.nextUrl.searchParams.get("kind"));
  if (!kind) {
    return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 });
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const player = await database.player.findUnique({
    where: { token, isArchived: false },
    select: {
      imageUrl: true,
      team: {
        select: {
          club: {
            select: { logoUrl: true },
          },
        },
      },
    },
  });

  if (!player) {
    return new NextResponse("Not found", { status: 404 });
  }

  const stored =
    kind === "photo" ? player.imageUrl : player.team.club.logoUrl;

  if (!stored) {
    return new NextResponse("Not found", { status: 404 });
  }

  const pathname = toBlobDeleteTarget(stored);
  const result = await getPrivateBlob(
    pathname,
    request.headers.get("if-none-match") ?? undefined
  );

  if (!result) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (result.statusCode === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        "Cache-Control": "private, no-cache",
        ETag: result.blob.etag,
      },
    });
  }

  if (result.statusCode !== 200 || !result.stream) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Cache-Control": "private, no-cache",
      "Content-Type": result.blob.contentType,
      ETag: result.blob.etag,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
