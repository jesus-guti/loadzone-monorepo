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
  const [rows, setRows] = useState<AttendanceRow[]>(() => initialRows.map((row) => ({ ...row })));
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

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-border-secondary">
        <table className="w-full text-sm">
          <thead className="bg-bg-secondary/50 text-[11px] uppercase tracking-[0.14em] text-text-tertiary">
            <tr>
              <th className="px-3 py-2 text-left">Jugador</th>
              <th className="px-3 py-2 text-left">Estado</th>
              {isMatch ? (
                <>
                  <th className="px-3 py-2 text-left">Min. jugados</th>
                  <th className="px-3 py-2 text-left">Min. entrada</th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  className="px-3 py-6 text-center text-text-secondary"
                  colSpan={isMatch ? 4 : 2}
                >
                  No hay jugadores en este equipo.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  className="border-t border-border-secondary"
                  key={row.playerId}
                >
                  <td className="px-3 py-2 text-text-primary">
                    {row.playerName}
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      onValueChange={(value) =>
                        updateRow(row.playerId, {
                          status: value as AttendanceStatus,
                        })
                      }
                      value={row.status}
                    >
                      <SelectTrigger className="h-8 w-[160px]">
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
                      <td className="px-3 py-2">
                        <Input
                          className="h-8 w-[100px]"
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
                      <td className="px-3 py-2">
                        <Input
                          className="h-8 w-[100px]"
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button disabled={isPending || rows.length === 0} onClick={handleSave}>
          {isPending ? "Guardando..." : "Guardar asistencia"}
        </Button>
      </div>
    </div>
  );
}
