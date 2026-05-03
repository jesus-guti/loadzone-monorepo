import { database } from "@repo/database";
import type { ReactElement } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "@/components/layouts/header";
import { ExerciseForm } from "@/features/exercises";

export const metadata: Metadata = {
  title: "Ejercicio | LoadZone",
};

type PageProps = {
  params: Promise<{ exerciseId: string }>;
};

const ExerciseDetailPage = async ({
  params,
}: PageProps): Promise<ReactElement> => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.club) {
    notFound();
  }

  const { exerciseId } = await params;

  const exercise = await database.exercise.findFirst({
    where: {
      id: exerciseId,
      OR: [
        { clubId: staffContext.club.id },
        { isSystem: true },
      ],
    },
  });

  if (!exercise) {
    notFound();
  }

  return (
    <>
      <Header page={exercise.name} pages={["LoadZone", "Ejercicios"]} />
      <div className="mx-auto w-full max-w-3xl flex-1 p-4 md:p-6">
        <ExerciseForm
          defaults={{
            id: exercise.id,
            name: exercise.name,
            objectivesText: exercise.objectivesText,
            explanationText: exercise.explanationText,
            durationMinutes: exercise.durationMinutes,
            spaceWidthMeters: Number(exercise.spaceWidthMeters),
            spaceLengthMeters: Number(exercise.spaceLengthMeters),
            minPlayers: exercise.minPlayers,
            maxPlayers: exercise.maxPlayers,
            complexity: exercise.complexity,
            strategy: exercise.strategy,
            coordinativeSkill: exercise.coordinativeSkill,
            tacticalIntention: exercise.tacticalIntention,
            dynamicType: exercise.dynamicType,
            gameSituation: exercise.gameSituation,
            coordinationType: exercise.coordinationType,
            visibility: exercise.visibility,
            diagramData: exercise.diagramData ? JSON.stringify(exercise.diagramData) : undefined,
          }}
          mode="edit"
        />
      </div>
    </>
  );
};

export default ExerciseDetailPage;
