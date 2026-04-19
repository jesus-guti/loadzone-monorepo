"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { toast } from "@repo/design-system/components/ui/sonner";
import { useState, useTransition } from "react";
import type { AttendanceStatus } from "@repo/database";
import { setAttendance } from "../../actions/session-actions";

type AttendanceRow = {
  playerId: string;
  playerName: string;
  status: AttendanceStatus;
  minutesPlayed: number | null;
  startedMinute: number | null;
};

type AttendanceFormProps = {
  readonly sessionId: string;
  readonly isMatch: boolean;
  readonly initialRows: ReadonlyArray<AttendanceRow>;
};

const STATUS_OPTIONS: ReadonlyArray<{ value: AttendanceStatus; label: string }> =
  [
    { value: "PENDING", label: "Pendiente" },
    { value: "PRESENT", label: "Presente" },
    { value: "ABSENT", label: "Ausente" },
    { value: "LATE", label: "Tarde" },
    { value: "EXCUSED", label: "Justificado" },
  ];

export function AttendanceForm({
  sessionId,
  isMatch,
  initialRows,
}: AttendanceFormProps) {
  const [rows, setRows] = useState<AttendanceRow[]>(() =>
    initialRows.map((row) => ({ ...row }))
  );
  const [isPending, startTransition] = useTransition();

  function updateRow(playerId: string, patch: Partial<AttendanceRow>): void {
    setRows((prev) =>
      prev.map((row) => (row.playerId === playerId ? { ...row, ...patch } : row))
    );
  }

  function handleSave(): void {
    startTransition(async () => {
      const result = await setAttendance({
        sessionId,
        entries: rows.map((row) => ({
          playerId: row.playerId,
          status: row.status,
          minutesPlayed: isMatch ? row.minutesPlayed : null,
          startedMinute: isMatch ? row.startedMinute : null,
        })),
      });
      if (result.success) {
        toast.success("Asistencia actualizada.");
      } else {
        toast.error(result.error ?? "No se pudo guardar la asistencia.");
      }
    });
  }

  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-secondary">
        No hay jugadores en este equipo.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-lg border border-border-tertiary md:block">
        <table className="w-full text-sm">
          <thead className="bg-bg-secondary text-xs font-medium text-text-tertiary">
            <tr>
              <th className="px-4 py-3 text-left">Jugador</th>
              <th className="px-4 py-3 text-left">Estado</th>
              {isMatch ? (
                <>
                  <th className="px-4 py-3 text-left">Min. jugados</th>
                  <th className="px-4 py-3 text-left">Min. entrada</th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                className="border-t border-border-tertiary"
                key={row.playerId}
              >
                <td className="px-4 py-3 text-text-primary">{row.playerName}</td>
                <td className="px-4 py-3">
                  <Select
                    onValueChange={(value) =>
                      updateRow(row.playerId, {
                        status: value as AttendanceStatus,
                      })
                    }
                    value={row.status}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                {isMatch ? (
                  <>
                    <td className="px-4 py-3">
                      <Input
                        className="w-[100px] tabular-nums"
                        max={240}
                        min={0}
                        onChange={(event) =>
                          updateRow(row.playerId, {
                            minutesPlayed: event.target.value
                              ? Number(event.target.value)
                              : null,
                          })
                        }
                        type="number"
                        value={row.minutesPlayed ?? ""}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        className="w-[100px] tabular-nums"
                        max={240}
                        min={0}
                        onChange={(event) =>
                          updateRow(row.playerId, {
                            startedMinute: event.target.value
                              ? Number(event.target.value)
                              : null,
                          })
                        }
                        type="number"
                        value={row.startedMinute ?? ""}
                      />
                    </td>
                  </>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div
            className="space-y-3 rounded-lg border border-border-tertiary bg-bg-primary p-4"
            key={row.playerId}
          >
            <p className="text-base font-medium text-text-primary">
              {row.playerName}
            </p>
            <Select
              onValueChange={(value) =>
                updateRow(row.playerId, {
                  status: value as AttendanceStatus,
                })
              }
              value={row.status}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isMatch ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs text-text-tertiary">
                  Min. jugados
                  <Input
                    className="w-full tabular-nums"
                    max={240}
                    min={0}
                    onChange={(event) =>
                      updateRow(row.playerId, {
                        minutesPlayed: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                    type="number"
                    value={row.minutesPlayed ?? ""}
                  />
                </label>
                <label className="space-y-1 text-xs text-text-tertiary">
                  Min. entrada
                  <Input
                    className="w-full tabular-nums"
                    max={240}
                    min={0}
                    onChange={(event) =>
                      updateRow(row.playerId, {
                        startedMinute: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                    type="number"
                    value={row.startedMinute ?? ""}
                  />
                </label>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          className="w-full md:w-auto"
          disabled={isPending || rows.length === 0}
          onClick={handleSave}
        >
          {isPending ? "Guardando..." : "Guardar asistencia"}
        </Button>
      </div>
    </div>
  );
}
