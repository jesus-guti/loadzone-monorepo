import { NextResponse } from "next/server";
import { getExerciseLibraryPayload } from "@/features/exercises/queries/get-exercise-library";
import { isExerciseLibrarySortKey } from "@/features/exercises/exercise-library-sort-filter";
import type { ExerciseLibrarySortKey } from "@/features/exercises/types";
import { getCurrentStaffContext } from "@/lib/auth-context";

function parseSort(value: string | null): ExerciseLibrarySortKey {
  if (value !== null && isExerciseLibrarySortKey(value)) {
    return value;
  }
  return "updated_desc";
}

export async function GET(request: Request): Promise<NextResponse> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.club) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sort = parseSort(searchParams.get("sort"));

  const payload = await getExerciseLibraryPayload({
    clubId: staffContext.club.id,
    membershipId: staffContext.membershipId,
    sort,
  });

  return NextResponse.json(payload);
}
