"use client";

import { TextAaIcon, UserMinusIcon } from "@phosphor-icons/react";
import { cn } from "@repo/design-system/lib/utils";
import { type ReactNode, useState, useSyncExternalStore } from "react";
import { wellnessValueClass } from "@/features/wellness/components/team-wellness-workspace.utils";
import { rpeTrafficTone } from "@/features/wellness/components/wellness-scales/metric-scales";
import {
  type AcBand,
  abbreviatePlayerName,
  acBand,
  anchorDayKey,
  type DayColumn,
  type Microcycle,
  type MicrocycleSheet,
} from "./microcycles";
import { CargaSheetScroll } from "./sheet-scroll";

type NameMode = "full" | "short" | "hidden";

function subscribeCompact(onStoreChange: () => void): () => void {
  const media = window.matchMedia("(max-width: 767px)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function useCompactViewport(): boolean {
  return useSyncExternalStore(
    subscribeCompact,
    () => window.matchMedia("(max-width: 767px)").matches,
    () => true
  );
}

const BAND_CLASS: Record<AcBand, string> = {
  bajo: "text-text-secondary",
  optimo: "text-success",
  transicion: "text-premium",
  peligro: "text-danger",
};

const COL = "min-w-24 px-3 text-center";
const STICKY_NAME =
  "sticky left-0 z-10 bg-bg-primary text-left font-medium text-text-primary";

function nameColumnClass(mode: NameMode): string {
  if (mode === "short") {
    return "w-[5.5rem] max-w-[5.5rem] px-2";
  }
  return "min-w-36 px-6";
}
const STICKY_HEAD = "sticky top-0 z-20 align-bottom";
const TODAY_COL = "bg-brand/10";
const WEEK_STRIPE = "bg-bg-secondary";

function weekMarks(microcycles: readonly Microcycle[]): {
  striped: ReadonlySet<string>;
  starts: ReadonlySet<string>;
} {
  const striped = new Set<string>();
  const starts = new Set<string>();
  for (const microcycle of microcycles) {
    microcycle.days.forEach((day, index) => {
      if (microcycle.index % 2 === 0) {
        striped.add(day.key);
      }
      if (index === 0 && microcycle.index > 1) {
        starts.add(day.key);
      }
    });
  }
  return { striped, starts };
}

function daySurface(
  key: string,
  today: string,
  marks: { striped: ReadonlySet<string>; starts: ReadonlySet<string> }
): string {
  return cn(
    marks.striped.has(key) && WEEK_STRIPE,
    marks.starts.has(key) && "border-l border-border-primary",
    key === today && TODAY_COL
  );
}

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

function RpeCell({ value }: { readonly value: number | null }) {
  if (value === null) {
    return <span className="text-text-tertiary">—</span>;
  }

  const level = Math.min(10, Math.max(0, Math.round(value)));
  return (
    <span
      aria-label={`RPE ${level} de 10`}
      className={cn(
        "font-semibold tabular-nums",
        wellnessValueClass(rpeTrafficTone(level))
      )}
    >
      {level}
    </span>
  );
}

function DayHead({ day }: { readonly day: DayColumn }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={cn(
          "text-[11px] uppercase tracking-[0.14em] text-text-secondary",
          (day.weekday === "S" || day.weekday === "D") && "font-extrabold"
        )}
      >
        {day.weekday}
      </span>
      <span className="text-text-primary">{day.dateLabel}</span>
    </div>
  );
}

function SummaryRows({
  days,
  microcycles,
  today,
  names,
  marks,
}: {
  readonly days: readonly DayColumn[];
  readonly microcycles: readonly Microcycle[];
  readonly today: string;
  readonly names: NameMode;
  readonly marks: { striped: ReadonlySet<string>; starts: ReadonlySet<string> };
}) {
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
          {names === "hidden" ? null : (
            <th
              className={cn(
                STICKY_NAME,
                nameColumnClass(names),
                "truncate border-t border-border-secondary py-2 text-[11px] uppercase tracking-[0.14em] text-text-secondary"
              )}
              title={row.label}
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
          )}
          {days.map((day) => (
            <td
              className={cn(
                COL,
                "border-t border-border-secondary py-2 text-text-primary",
                daySurface(day.key, today, marks)
              )}
              key={day.key}
            >
              {row.cell(day)}
            </td>
          ))}
        </tr>
      ))}
      <tr>
        {names === "hidden" ? null : (
          <th
            className={cn(
              STICKY_NAME,
              nameColumnClass(names),
              "truncate border-t border-border-secondary py-2 text-[11px] uppercase tracking-[0.14em] text-text-secondary"
            )}
            title="Sumatorio del microciclo"
          >
            Sumatorio
          </th>
        )}
        {microcycles.map((microcycle) => (
          <td
            className={cn(
              "border-t border-border-secondary px-3 py-2 text-center font-semibold tabular-nums text-text-primary",
              microcycle.index % 2 === 0 && WEEK_STRIPE,
              microcycle.index > 1 && "border-l border-border-primary"
            )}
            colSpan={microcycle.days.length}
            key={microcycle.index}
          >
            {microcycle.loadSum}
          </td>
        ))}
      </tr>
    </>
  );
}

function DayHistogram({
  days,
  today,
  names,
  marks,
}: {
  readonly days: readonly DayColumn[];
  readonly today: string;
  readonly names: NameMode;
  readonly marks: { striped: ReadonlySet<string>; starts: ReadonlySet<string> };
}) {
  const max = Math.max(...days.map((day) => day.teamLoad), 1);

  return (
    <tr>
      {names === "hidden" ? null : (
        <th
          className={cn(
            STICKY_NAME,
            nameColumnClass(names),
            "truncate border-t border-border-secondary py-3 align-bottom text-[11px] uppercase tracking-[0.14em] text-text-secondary"
          )}
          title="Carga media"
        >
          Carga media
        </th>
      )}
      {days.map((day) => {
        const height = Math.max(16, (day.teamLoad / max) * 128);
        return (
          <td
            className={cn(
              COL,
              "border-t border-border-secondary py-3 align-bottom",
              daySurface(day.key, today, marks)
            )}
            key={day.key}
          >
            <div className="flex h-36 flex-col items-center justify-end gap-1">
              <span className="text-xs tabular-nums text-text-secondary">
                {day.teamLoad}
              </span>
              <div
                className="w-4 min-h-4 rounded-sm bg-brand"
                style={{ height: `${height}px` }}
              />
            </div>
          </td>
        );
      })}
    </tr>
  );
}

function NameModeButton({
  pressed,
  label,
  onClick,
  children,
}: {
  readonly pressed: boolean;
  readonly label: string;
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs",
        pressed
          ? "border-brand bg-brand/10 text-text-brand"
          : "border-border-secondary bg-bg-primary text-text-secondary"
      )}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

export function MicrocycleSheetView({
  sheet,
  today,
}: {
  readonly sheet: MicrocycleSheet;
  readonly today: string;
}) {
  const compact = useCompactViewport();
  const [override, setOverride] = useState<NameMode | null>(null);
  const names = override ?? (compact ? "short" : "full");
  const marks = weekMarks(sheet.microcycles);

  if (sheet.players.length === 0) {
    return (
      <p className="px-6 py-4 text-sm text-text-secondary">
        Añade jugadores al equipo para ver la carga del microciclo.
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-border-secondary px-3 py-2">
        <NameModeButton
          label="Abreviar nombres"
          onClick={() => setOverride(names === "short" ? "full" : "short")}
          pressed={names === "short"}
        >
          <TextAaIcon className="size-3.5" weight="bold" />
          Abreviar
        </NameModeButton>
        <NameModeButton
          label="Ocultar nombres"
          onClick={() => setOverride(names === "hidden" ? "full" : "hidden")}
          pressed={names === "hidden"}
        >
          <UserMinusIcon className="size-3.5" weight="bold" />
          Ocultar
        </NameModeButton>
      </div>
      <CargaSheetScroll anchorDay={anchorDayKey(sheet.days, today)}>
        <table
          className={cn(
            "border-separate border-spacing-0 text-sm",
            names === "hidden" ? "w-full" : "w-max"
          )}
        >
          <thead>
            <tr>
              {names === "hidden" ? null : (
                <th
                  className={cn(
                    STICKY_NAME,
                    STICKY_HEAD,
                    nameColumnClass(names),
                    "z-30 truncate bg-bg-primary py-2 text-[11px] uppercase tracking-[0.14em] text-text-secondary"
                  )}
                  data-carga-name=""
                >
                  Jugador
                </th>
              )}
              {sheet.microcycles.map((microcycle) => (
                <th
                  className={cn(
                    STICKY_HEAD,
                    "px-3 py-2 text-center",
                    microcycle.index % 2 === 0 ? WEEK_STRIPE : "bg-bg-primary",
                    microcycle.index > 1 && "border-l border-border-primary"
                  )}
                  colSpan={7}
                  key={microcycle.index}
                >
                  <span className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">
                    Microciclo {microcycle.index}
                  </span>
                </th>
              ))}
            </tr>
            <tr>
              {names === "hidden" ? null : (
                <th
                  className={cn(
                    STICKY_NAME,
                    STICKY_HEAD,
                    nameColumnClass(names),
                    "z-30 bg-bg-primary py-2"
                  )}
                />
              )}
              {sheet.days.map((day) => (
                <th
                  className={cn(
                    STICKY_HEAD,
                    COL,
                    "border-b border-border-secondary py-2 text-center font-normal",
                    day.key === today
                      ? TODAY_COL
                      : marks.striped.has(day.key)
                        ? WEEK_STRIPE
                        : "bg-bg-primary",
                    marks.starts.has(day.key) &&
                      "border-l border-border-primary"
                  )}
                  data-carga-day={day.key}
                  key={day.key}
                >
                  <DayHead day={day} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.players.map((player) => (
              <tr key={player.id}>
                {names === "hidden" ? null : (
                  <th
                    className={cn(
                      STICKY_NAME,
                      nameColumnClass(names),
                      "truncate border-t border-border-secondary py-2"
                    )}
                    title={player.name}
                  >
                    {names === "short"
                      ? abbreviatePlayerName(player.name)
                      : player.name}
                  </th>
                )}
                {player.rpe.map((value, index) => (
                  <td
                    className={cn(
                      COL,
                      "border-t border-border-secondary py-2 text-text-primary",
                      sheet.days[index]
                        ? daySurface(sheet.days[index].key, today, marks)
                        : false
                    )}
                    key={sheet.days[index]?.key ?? index}
                  >
                    <RpeCell value={value} />
                  </td>
                ))}
              </tr>
            ))}
            <SummaryRows
              days={sheet.days}
              marks={marks}
              microcycles={sheet.microcycles}
              names={names}
              today={today}
            />
            <DayHistogram
              days={sheet.days}
              marks={marks}
              names={names}
              today={today}
            />
          </tbody>
        </table>
      </CargaSheetScroll>
    </div>
  );
}
