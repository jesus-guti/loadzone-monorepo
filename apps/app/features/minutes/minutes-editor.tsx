"use client";

import { Button } from "@repo/design-system/components/button";
import { type ReactElement, useState } from "react";
import {
  saveMatchLineup,
  saveMinutesPromptHour,
  saveSharedMinutes,
} from "@/features/minutes/actions";
import {
  DEFAULT_PROMPT_HOUR,
  DEFAULT_SHARED_MINUTES,
  FORMATION_LABEL,
  FORMATIONS,
  type Formation,
  minutesPlayedByPlayer,
  type SubstitutionInput,
} from "@/features/minutes/derive";

type PlayerOption = { readonly id: string; readonly name: string };

type EditorProps = {
  readonly sessionId: string;
  readonly isMatch: boolean;
  readonly sharedMinutes: number | null;
  readonly promptHour: number;
  readonly players: readonly PlayerOption[];
  readonly initialFormation: Formation;
  readonly initialStarters: readonly string[];
  readonly initialBench: readonly string[];
  readonly initialExtraTime: boolean;
  readonly initialStoppage: readonly [number, number, number, number];
  readonly initialSubs: readonly SubstitutionInput[];
};

function lineupRole(
  id: string,
  starters: readonly string[],
  bench: readonly string[]
): "starter" | "bench" | "out" {
  if (starters.includes(id)) {
    return "starter";
  }
  if (bench.includes(id)) {
    return "bench";
  }
  return "out";
}
function toggle(list: readonly string[], id: string, on: boolean): string[] {
  if (on) {
    return list.includes(id) ? [...list] : [...list, id];
  }
  return list.filter((item) => item !== id);
}

function PlayerLine(props: {
  readonly player: PlayerOption;
  readonly role: "starter" | "bench" | "out";
  readonly minutes: number | undefined;
  readonly onStarter: () => void;
  readonly onBench: () => void;
}): ReactElement {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span>
        {props.player.name}
        {props.role === "out" ? "" : ` · ${props.minutes ?? 0} min`}
      </span>
      <span className="flex gap-2">
        <Button
          onClick={props.onStarter}
          size="sm"
          type="button"
          variant={props.role === "starter" ? "default" : "outline"}
        >
          Titular
        </Button>
        <Button
          onClick={props.onBench}
          size="sm"
          type="button"
          variant={props.role === "bench" ? "default" : "outline"}
        >
          Banquillo
        </Button>
      </span>
    </li>
  );
}

export function MinutesEditor(props: EditorProps): ReactElement {
  const [shared, setShared] = useState(
    props.sharedMinutes ?? DEFAULT_SHARED_MINUTES
  );
  const [hour, setHour] = useState(props.promptHour || DEFAULT_PROMPT_HOUR);
  const [formation, setFormation] = useState<Formation>(props.initialFormation);
  const [starters, setStarters] = useState<string[]>([
    ...props.initialStarters,
  ]);
  const [bench, setBench] = useState<string[]>([...props.initialBench]);
  const [extraTime, setExtraTime] = useState(props.initialExtraTime);
  const [stops, setStops] = useState<number[]>([...props.initialStoppage]);
  const [subs, setSubs] = useState<SubstitutionInput[]>([...props.initialSubs]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const played = props.isMatch
    ? minutesPlayedByPlayer({
        starterIds: starters,
        benchIds: bench,
        substitutions: subs,
        stoppageFirst: stops[0] ?? 0,
        stoppageSecond: stops[1] ?? 0,
        extraTime,
        stoppageExtraFirst: stops[2] ?? 0,
        stoppageExtraSecond: stops[3] ?? 0,
      })
    : {};

  async function saveTraining(): Promise<void> {
    setPending(true);
    const result = await saveSharedMinutes({
      sessionId: props.sessionId,
      sharedMinutes: shared,
    });
    setPending(false);
    setMessage(
      result.success ? "Minutos guardados" : (result.error ?? "Error")
    );
  }

  async function saveLineup(): Promise<void> {
    setPending(true);
    const result = await saveMatchLineup({
      sessionId: props.sessionId,
      formation,
      starterIds: starters,
      benchIds: bench,
      extraTime,
      stoppageFirst: stops[0] ?? 0,
      stoppageSecond: stops[1] ?? 0,
      stoppageExtraFirst: stops[2] ?? 0,
      stoppageExtraSecond: stops[3] ?? 0,
      substitutions: subs,
    });
    setPending(false);
    setMessage(
      result.success ? "Alineación guardada" : (result.error ?? "Error")
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {props.isMatch ? (
        <>
          <label className="flex flex-col gap-2 text-sm">
            Formación
            <select
              className="h-10 rounded-sm border border-border-secondary bg-bg-primary px-3"
              onChange={(event) => {
                const next = FORMATIONS.find(
                  (item) => item === event.target.value
                );
                if (next) {
                  setFormation(next);
                }
              }}
              value={formation}
            >
              {FORMATIONS.map((item) => (
                <option key={item} value={item}>
                  {FORMATION_LABEL[item]}
                </option>
              ))}
            </select>
          </label>
          <ul className="flex flex-col gap-2">
            {props.players.map((player) => (
              <PlayerLine
                key={player.id}
                minutes={played[player.id]}
                onBench={() => {
                  setStarters((current) =>
                    current.filter((id) => id !== player.id)
                  );
                  setBench((current) =>
                    toggle(current, player.id, !bench.includes(player.id))
                  );
                }}
                onStarter={() => {
                  setBench((current) =>
                    current.filter((id) => id !== player.id)
                  );
                  setStarters((current) =>
                    toggle(current, player.id, !starters.includes(player.id))
                  );
                }}
                player={player}
                role={lineupRole(player.id, starters, bench)}
              />
            ))}
          </ul>
          <p className="text-sm text-text-secondary">
            Titulares: {starters.length}/11
          </p>
          <div className="grid grid-cols-2 gap-3">
            {["1ª parte", "2ª parte", "Prórroga 1", "Prórroga 2"].map(
              (label, index) => (
                <label className="flex flex-col gap-1 text-sm" key={label}>
                  Descuento {label}
                  <input
                    className="h-10 rounded-sm border border-border-secondary px-3"
                    max={20}
                    min={0}
                    onChange={(event) => {
                      const next = [...stops];
                      next[index] = Number(event.target.value);
                      setStops(next);
                    }}
                    type="number"
                    value={stops[index] ?? 0}
                  />
                </label>
              )
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              checked={extraTime}
              onChange={(event) => setExtraTime(event.target.checked)}
              type="checkbox"
            />
            Prórroga
          </label>
          <div className="flex flex-col gap-2">
            {subs.map((change, index) => (
              <div
                className="grid grid-cols-3 gap-2"
                key={`${change.playerOutId}-${index}`}
              >
                <input
                  className="h-10 rounded-sm border border-border-secondary px-2"
                  onChange={(event) => {
                    const next = [...subs];
                    const current = next[index];
                    if (!current) {
                      return;
                    }
                    next[index] = {
                      ...current,
                      minute: Number(event.target.value),
                    };
                    setSubs(next);
                  }}
                  type="number"
                  value={change.minute}
                />
                <select
                  className="h-10 rounded-sm border border-border-secondary px-2"
                  onChange={(event) => {
                    const next = [...subs];
                    const current = next[index];
                    if (!current) {
                      return;
                    }
                    next[index] = {
                      ...current,
                      playerOutId: event.target.value,
                    };
                    setSubs(next);
                  }}
                  value={change.playerOutId}
                >
                  {props.players.map((player) => (
                    <option key={player.id} value={player.id}>
                      Sale {player.name}
                    </option>
                  ))}
                </select>
                <select
                  className="h-10 rounded-sm border border-border-secondary px-2"
                  onChange={(event) => {
                    const next = [...subs];
                    const current = next[index];
                    if (!current) {
                      return;
                    }
                    next[index] = {
                      ...current,
                      playerInId:
                        event.target.value === "" ? null : event.target.value,
                    };
                    setSubs(next);
                  }}
                  value={change.playerInId ?? ""}
                >
                  <option value="">Expulsión</option>
                  {props.players.map((player) => (
                    <option key={player.id} value={player.id}>
                      Entra {player.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <Button
              onClick={() =>
                setSubs((current) => [
                  ...current,
                  {
                    minute: 60,
                    playerOutId: starters[0] ?? props.players[0]?.id ?? "",
                    playerInId: bench[0] ?? null,
                  },
                ])
              }
              type="button"
              variant="outline"
            >
              Añadir cambio
            </Button>
          </div>
          <Button
            disabled={pending || starters.length !== 11}
            onClick={() => {
              saveLineup().catch(() => setMessage("Error"));
            }}
            type="button"
          >
            Guardar alineación
          </Button>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShared((value) => Math.max(1, value - 5))}
            type="button"
            variant="outline"
          >
            −5
          </Button>
          <input
            className="h-10 w-20 rounded-sm border border-border-secondary px-3 text-center"
            max={300}
            min={1}
            onChange={(event) => setShared(Number(event.target.value))}
            type="number"
            value={shared}
          />
          <Button
            onClick={() => setShared((value) => Math.min(300, value + 5))}
            type="button"
            variant="outline"
          >
            +5
          </Button>
          <Button
            disabled={pending}
            onClick={() => {
              saveTraining().catch(() => setMessage("Error"));
            }}
            type="button"
          >
            Guardar minutos
          </Button>
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-text-secondary">
        Avisar a partir de las
        <input
          className="h-10 w-16 rounded-sm border border-border-secondary px-2"
          max={23}
          min={0}
          onChange={(event) => setHour(Number(event.target.value))}
          type="number"
          value={hour}
        />
        <Button
          onClick={() => {
            saveMinutesPromptHour({ promptHour: hour })
              .then((result) => {
                setMessage(
                  result.success ? "Hora guardada" : (result.error ?? "Error")
                );
              })
              .catch(() => setMessage("Error"));
          }}
          size="sm"
          type="button"
          variant="outline"
        >
          Guardar hora
        </Button>
      </label>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}
