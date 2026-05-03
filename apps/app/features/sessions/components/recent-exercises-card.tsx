import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";

export type RecentExerciseEntry = {
  id: string;
  name: string;
  usageCount: number;
};

type RecentExercisesCardProps = {
  readonly exercises: ReadonlyArray<RecentExerciseEntry>;
};

export function RecentExercisesCard({
  exercises,
}: RecentExercisesCardProps) {
  return (
    <Card className="bevel-card rounded-lg border-border-tertiary bg-bg-primary p-5">
      <CardHeader className="px-0 pb-0">
        <CardTitle className="text-base font-semibold text-text-primary">
          Ejercicios recientes
        </CardTitle>
        <CardAction>
          <Button asChild size="sm" variant="ghost">
            <Link href="/exercises">Ver todos</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {exercises.length === 0 ? (
          <p className="mt-4 text-sm text-text-secondary">
            Crea tu primer ejercicio para empezar.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {exercises.map((exercise) => (
              <li
                className="flex items-center justify-between gap-3 py-1"
                key={exercise.id}
              >
                <Link
                  className="truncate text-text-primary hover:text-brand"
                  href={`/exercises/${exercise.id}`}
                >
                  {exercise.name}
                </Link>
                <span className="shrink-0 text-xs text-text-tertiary tabular-nums">
                  {exercise.usageCount} usos
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
