import { cn } from "@repo/design-system/lib/utils";
import type { ReactNode } from "react";
import {
  acBand,
  type AcBand,
  type DayColumn,
  type MicrocycleSheet,
} from "./microcycles";

const BAND_CLASS: Record<AcBand, string> = {
  bajo: "text-text-secondary",
  optimo: "text-success",
  transicion: "text-premium",
  peligro: "text-danger",
};

const COL = "min-w-24 px-3";
const STICKY_NAME =
  "sticky left-0 z-10 bg-bg-primary text-left font-medium text-text-primary";
const STICKY_HEAD = "sticky top-0 z-20 bg-bg-primary align-bottom";

function AcValue({ value }: { readonly value: number }) {
  return (
    <span className={cn("tabular-nums", BAND_CLASS[acBand(value)])}>
      {value.toFixed(2)}
    </span>
  );
}

function LoadNumber({
  value,
  jump,
}: {
  readonly value: number;
  readonly jump?: boolean;
}) {
  return (
    <span className="tabular-nums">
      {value}
      {jump ? (
        <span className="ml-1 text-danger" title="Subida del 15%">
          +15%
        </span>
      ) : null}
    </span>
  );
}

function DayHead({ day }: { readonly day: DayColumn }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">
        {day.weekday}
      </span>
      <span className="text-text-primary">{day.dateLabel}</span>
      {day.matchDay ? (
        <span className="text-[11px] font-medium text-brand">{day.matchDay}</span>
      ) : null}
    </div>
  );
}

function SummaryRows({ days }: { readonly days: readonly DayColumn[] }) {
  const rows: readonly {
    label: string;
    cell: (day: DayColumn) => ReactNode;
  }[] = [
    {
      label: "Tiempo",
      cell: (day) => (
        <span className="tabular-nums">
          {day.minutes === 0 ? (
            <span className="text-text-tertiary">0</span>
          ) : (
            `${day.minutes} min`
          )}
        </span>
      ),
    },
    {
      label: "Carga del día",
      cell: (day) => <LoadNumber jump={day.jump} value={day.teamLoad} />,
    },
    {
      label: "Aguda 7d",
      cell: (day) => <span className="tabular-nums">{day.acute}</span>,
    },
    {
      label: "Crónica 28d",
      cell: (day) => <span className="tabular-nums">{day.chronic}</span>,
    },
    {
      label: "A:C",
      cell: (day) => <AcValue value={day.ac} />,
    },
  ];

  return (
    <>
      {rows.map((row) => (
        <tr key={row.label}>
          <th
            className={cn(
              STICKY_NAME,
              "border-t border-border-secondary px-6 py-2 text-[11px] uppercase tracking-[0.14em] text-text-secondary"
            )}
          >
            {row.label === "A:C" ? (
              <span className="flex flex-col gap-0.5">
                <span>A:C</span>
                <span className="normal-case tracking-normal text-text-tertiary">
                  Punto dulce 0,8–1,3
                </span>
              </span>
            ) : (
              row.label
            )}
          </th>
          {days.map((day) => (
            <td
              key={day.key}
              className={cn(
                COL,
                "border-t border-border-secondary py-2 text-text-primary"
              )}
            >
              {row.cell(day)}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function DayHistogram({ days }: { readonly days: readonly DayColumn[] }) {
  const max = Math.max(...days.map((day) => day.teamLoad), 1);

  return (
    <div className="border-t border-border-secondary">
      <div className="flex w-max items-end">
        <div
          className={cn(
            STICKY_NAME,
            "flex min-w-36 items-end self-stretch px-6 py-3 text-[11px] uppercase tracking-[0.14em] text-text-secondary"
          )}
        >
          Carga media
        </div>
        {days.map((day) => (
          <div
            key={day.key}
            className={cn(COL, "flex flex-col items-start gap-1 py-3")}
          >
            <span className="text-xs tabular-nums text-text-secondary">
              {day.teamLoad}
            </span>
            <div className="flex h-24 items-end">
              <div
                className="w-8 min-h-2 rounded-sm bg-brand"
                style={{
                  height: `${Math.max(8, (day.teamLoad / max) * 96)}px`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MicrocycleSheetView({
  sheet,
}: {
  readonly sheet: MicrocycleSheet;
}) {
  if (sheet.players.length === 0) {
    return (
      <p className="px-6 py-4 text-sm text-text-secondary">
        Añade jugadores al equipo para ver la carga del microciclo.
      </p>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-max border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th
              className={cn(
                STICKY_NAME,
                STICKY_HEAD,
                "z-30 min-w-36 px-6 py-2 text-[11px] uppercase tracking-[0.14em] text-text-secondary"
              )}
            >
              Jugador
            </th>
            {sheet.microcycles.map((microcycle) => (
              <th
                key={microcycle.index}
                className={cn(STICKY_HEAD, "px-3 py-2 text-left")}
                colSpan={7}
              >
                <span className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">
                  Microciclo {microcycle.index}
                </span>
              </th>
            ))}
          </tr>
          <tr>
            <th className={cn(STICKY_NAME, STICKY_HEAD, "z-30 px-6 py-2")} />
            {sheet.days.map((day) => (
              <th
                key={day.key}
                className={cn(
                  STICKY_HEAD,
                  COL,
                  "border-b border-border-secondary py-2 text-left font-normal"
                )}
              >
                <DayHead day={day} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sheet.players.map((player) => (
            <tr key={player.id}>
              <th
                className={cn(
                  STICKY_NAME,
                  "border-t border-border-secondary px-6 py-2"
                )}
              >
                {player.name}
              </th>
              {player.loads.map((load, index) => (
                <td
                  key={sheet.days[index]?.key ?? index}
                  className={cn(
                    COL,
                    "border-t border-border-secondary py-2 text-text-primary tabular-nums"
                  )}
                >
                  {load === 0 ? (
                    <span className="text-text-tertiary">0</span>
                  ) : (
                    load
                  )}
                </td>
              ))}
            </tr>
          ))}
          <SummaryRows days={sheet.days} />
        </tbody>
      </table>
      <DayHistogram days={sheet.days} />
    </div>
  );
}
