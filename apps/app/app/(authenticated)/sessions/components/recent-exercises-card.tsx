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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ejercicios recientes</CardTitle>
        <CardAction>
          <Button asChild size="sm" variant="ghost">
            <Link href="/exercises">Ver todos</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {exercises.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Crea tu primer ejercicio para empezar.
          </p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {exercises.map((exercise) => (
              <li
                className="flex items-center justify-between gap-3"
                key={exercise.id}
              >
                <Link
                  className="truncate text-text-primary hover:underline"
                  href={`/exercises/${exercise.id}`}
                >
                  {exercise.name}
                </Link>
                <span className="shrink-0 text-xs text-text-tertiary">
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
