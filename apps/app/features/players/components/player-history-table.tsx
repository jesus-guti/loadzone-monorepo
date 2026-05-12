"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import type { RiskLevel } from "@repo/database";

type PlayerHistoryRow = {
  readonly date: string;
  readonly preFilledAt: Date | null;
  readonly postFilledAt: Date | null;
  readonly recovery: number | null;
  readonly energy: number | null;
  readonly soreness: number | null;
  readonly sleepHours: number | null;
  readonly sleepQuality: number | null;
  readonly rpe: number | null;
  readonly duration: number | null;
  readonly physioAlert: boolean;
  readonly riskLevel: RiskLevel | null;
};

type PlayerHistoryTableProperties = {
  readonly rows: PlayerHistoryRow[];
};

function getRiskVariant(
  riskLevel: RiskLevel | null
): "default" | "secondary" | "destructive" | "outline" {
  switch (riskLevel) {
    case "CRITICAL":
    case "HIGH":
      return "destructive";
    case "MODERATE":
      return "secondary";
    case "LOW":
      return "default";
    default:
      return "outline";
  }
}

function getRiskLabel(riskLevel: RiskLevel | null): string {
  switch (riskLevel) {
    case "CRITICAL":
      return "Crítico";
    case "HIGH":
      return "Alto";
    case "MODERATE":
      return "Moderado";
    case "LOW":
      return "Bajo";
    default:
      return "Sin datos";
  }
}

function formatMetric(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return String(value);
}

function formatSleepSummary(row: PlayerHistoryRow): string {
  if (row.sleepHours === null && row.sleepQuality === null) {
    return "—";
  }
  return `${row.sleepHours ?? "—"} h / ${row.sleepQuality ?? "—"}`;
}

const headClass =
  "text-xs font-medium uppercase tracking-wide text-text-secondary";

type HistoryRowProps = {
  readonly row: PlayerHistoryRow;
};

function PlayerHistoryTableRow({ row }: HistoryRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {new Date(row.date).toLocaleDateString("es-ES")}
      </TableCell>
      <TableCell>
        <Badge variant={row.preFilledAt ? "default" : "outline"}>
          {row.preFilledAt ? "Sí" : "No"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={row.postFilledAt ? "default" : "outline"}>
          {row.postFilledAt ? "Sí" : "No"}
        </Badge>
      </TableCell>
      <TableCell>{formatMetric(row.recovery)}</TableCell>
      <TableCell>{formatMetric(row.energy)}</TableCell>
      <TableCell>{formatMetric(row.soreness)}</TableCell>
      <TableCell>{formatSleepSummary(row)}</TableCell>
      <TableCell>{formatMetric(row.rpe)}</TableCell>
      <TableCell>{formatMetric(row.duration)}</TableCell>
      <TableCell>
        <Badge variant={row.physioAlert ? "destructive" : "outline"}>
          {row.physioAlert ? "Sí" : "No"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getRiskVariant(row.riskLevel)}>
          {getRiskLabel(row.riskLevel)}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

export function PlayerHistoryTable({
  rows,
}: PlayerHistoryTableProperties) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
        Historial diario
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-text-secondary">
          Todavía no hay registros diarios en tabla.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={headClass}>Fecha</TableHead>
              <TableHead className={headClass}>Pre sesión</TableHead>
              <TableHead className={headClass}>Post sesión</TableHead>
              <TableHead className={headClass}>Recuperación</TableHead>
              <TableHead className={headClass}>Energía</TableHead>
              <TableHead className={headClass}>Agujetas</TableHead>
              <TableHead className={headClass}>Sueño</TableHead>
              <TableHead className={headClass}>RPE</TableHead>
              <TableHead className={headClass}>Duración</TableHead>
              <TableHead className={headClass}>Alerta</TableHead>
              <TableHead className={headClass}>Riesgo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <PlayerHistoryTableRow key={row.date} row={row} />
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
