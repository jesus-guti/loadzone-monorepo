import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";

type LastSessionExercise = {
  id: string;
  name: string;
  durationMinutes: number;
};

export type LastSessionData = {
  id: string;
  title: string;
  type: "TRAINING" | "MATCH" | "RECOVERY" | "OTHER";
  startsAt: Date;
  endsAt: Date;
  exercises: LastSessionExercise[];
};

const TYPE_LABEL: Record<LastSessionData["type"], string> = {
  TRAINING: "Entreno",
  MATCH: "Partido",
  RECOVERY: "Recuperación",
  OTHER: "Otro",
};

function formatRelative(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

type LastSessionCardProps = {
  readonly session: LastSessionData | null;
};

export function LastSessionCard({ session }: LastSessionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Última sesión</CardTitle>
        {session ? (
          <CardAction>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/sessions/${session.id}`}>Ver detalle</Link>
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {session ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="font-medium text-text-primary">{session.title}</p>
              <p className="text-xs text-text-secondary">
                {formatRelative(session.startsAt)}
              </p>
            </div>
            <Badge variant="secondary">{TYPE_LABEL[session.type]}</Badge>
            {session.exercises.length > 0 ? (
              <ul className="space-y-1.5 border-t border-border-secondary pt-3 text-sm">
                {session.exercises.slice(0, 5).map((exercise) => (
                  <li
                    className="flex items-center justify-between gap-3"
                    key={exercise.id}
                  >
                    <span className="truncate text-text-primary">
                      {exercise.name}
                    </span>
                    <span className="shrink-0 text-xs text-text-secondary">
                      {exercise.durationMinutes} min
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-t border-border-secondary pt-3 text-sm text-text-secondary">
                Sin ejercicios registrados.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            Aún no hay sesiones para este equipo.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
