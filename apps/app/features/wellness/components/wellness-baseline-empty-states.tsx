import { CalendarBlankIcon, PlusIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@repo/design-system/components/button";
import Link from "next/link";

type WellnessBaselineEmptyStatesProps = {
  needsSeason: boolean;
  needsPlayers: boolean;
};

/**
 * Operational Baseline empty states for staff Wellness.
 * Renders only from JES-82 resolver flags — callers must not invent parallel predicates.
 * When both flags are true, Season stacks above Players.
 */
export function WellnessBaselineEmptyStates({
  needsSeason,
  needsPlayers,
}: WellnessBaselineEmptyStatesProps): React.JSX.Element | null {
  if (!needsSeason && !needsPlayers) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {needsSeason ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border-secondary bg-bg-secondary/30 p-12 text-center">
          <CalendarBlankIcon
            className="mb-4 size-12 text-text-secondary"
            weight="regular"
          />
          <h3 className="text-lg font-semibold text-text-primary">
            No hay temporada activa
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Crea una temporada para enmarcar el wellness diario del equipo.
          </p>
          <Button
            className="mt-4"
            size="sm"
            render={
              <Link href="/seasons/new">
                <PlusIcon className="mr-1 size-4" />
                Crear temporada
              </Link>
            }
          />
        </div>
      ) : null}

      {needsPlayers ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border-secondary bg-bg-secondary/30 p-12 text-center">
          <h3 className="text-lg font-semibold text-text-primary">
            No hay jugadores
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Añade al menos un jugador al equipo activo para ver wellness y
            check-ins.
          </p>
          <Button
            className="mt-4"
            size="sm"
            render={
              <Link href="/players/new">
                <PlusIcon className="mr-1 size-4" />
                Añadir jugador
              </Link>
            }
          />
        </div>
      ) : null}
    </div>
  );
}
