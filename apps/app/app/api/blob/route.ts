import { currentUser } from "@repo/auth/server";
import { getPrivateBlob, isPrivateImagePathname } from "@repo/storage";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authenticatedUser = await currentUser();
  if (!authenticatedUser) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const pathname = request.nextUrl.searchParams.get("pathname");
  if (!pathname || !isPrivateImagePathname(pathname)) {
    return NextResponse.json({ error: "Ruta de blob no válida." }, { status: 400 });
  }

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
