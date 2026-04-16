"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
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
  return value == null ? "—" : String(value);
}

export function PlayerHistoryTable({
  rows,
}: PlayerHistoryTableProperties) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial diario</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-xl bg-muted/50 p-8 text-center text-muted-foreground">
            No hay historial suficiente para mostrar en tabla.
          </div>
        ) : (
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Pre</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Recovery</TableHead>
                  <TableHead>Energía</TableHead>
                  <TableHead>Agujetas</TableHead>
                  <TableHead>Sueño</TableHead>
                  <TableHead>RPE</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Alerta</TableHead>
                  <TableHead>Riesgo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.date}>
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
                    <TableCell>
                      {row.sleepHours == null && row.sleepQuality == null
                        ? "—"
                        : `${row.sleepHours ?? "—"} h / ${row.sleepQuality ?? "—"}`}
                    </TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
