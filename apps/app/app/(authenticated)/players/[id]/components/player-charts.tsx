"use client";

import type { RiskLevel } from "@repo/database";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/design-system/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

type EntryData = {
  date: string;
  recovery: number | null;
  energy: number | null;
  soreness: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  rpe: number | null;
  duration: number | null;
  srpe: number | null;
};

type StatsData = {
  date: string;
  acwr: number | null;
  acuteLoad: number | null;
  chronicLoad: number | null;
  riskLevel: RiskLevel | null;
  tqrAvg7d: number | null;
  rpeAvg7d: number | null;
};

type PlayerChartsProperties = {
  readonly entries: EntryData[];
  readonly stats: StatsData[];
};

const rpeRecoveryConfig: ChartConfig = {
  rpe: { label: "RPE", color: "hsl(var(--chart-1))" },
  recovery: { label: "Recuperación", color: "hsl(var(--chart-2))" },
};

const loadConfig: ChartConfig = {
  energy: { label: "Energía", color: "hsl(var(--chart-3))" },
  soreness: { label: "Agujetas", color: "hsl(var(--chart-4))" },
};

const acwrConfig: ChartConfig = {
  acwr: { label: "ACWR", color: "hsl(var(--chart-1))" },
};

const sleepConfig: ChartConfig = {
  sleepHours: { label: "Horas", color: "hsl(var(--chart-5))" },
  sleepQuality: { label: "Calidad", color: "hsl(var(--chart-3))" },
};

export function PlayerCharts({ entries, stats }: PlayerChartsProperties) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl bg-muted/50 p-8 text-center text-muted-foreground">
        No hay datos suficientes para mostrar gráficos.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>RPE y Recuperación</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={rpeRecoveryConfig} className="h-64 w-full">
            <BarChart data={entries}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="rpe"
                fill="var(--color-rpe)"
                radius={[4, 4, 0, 0]}
              />
              <Line
                dataKey="recovery"
                type="monotone"
                stroke="var(--color-recovery)"
                strokeWidth={2}
                dot={false}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Energía y Agujetas</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={loadConfig} className="h-64 w-full">
            <AreaChart data={entries}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis domain={[1, 5]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="energy"
                type="monotone"
                fill="var(--color-energy)"
                fillOpacity={0.3}
                stroke="var(--color-energy)"
                stackId="a"
              />
              <Area
                dataKey="soreness"
                type="monotone"
                fill="var(--color-soreness)"
                fillOpacity={0.3}
                stroke="var(--color-soreness)"
                stackId="b"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ACWR (Ratio Carga Aguda:Crónica)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={acwrConfig} className="h-64 w-full">
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 3]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceArea
                  y1={1.5}
                  y2={3}
                  fill="hsl(0, 84%, 60%)"
                  fillOpacity={0.08}
                />
                <ReferenceLine
                  y={1.5}
                  stroke="hsl(0, 84%, 60%)"
                  strokeDasharray="3 3"
                  label="Zona de riesgo"
                />
                <ReferenceLine
                  y={0.8}
                  stroke="hsl(142, 76%, 36%)"
                  strokeDasharray="3 3"
                  label="Zona óptima"
                />
                <Line
                  dataKey="acwr"
                  type="monotone"
                  stroke="var(--color-acwr)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sueño</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={sleepConfig} className="h-64 w-full">
            <BarChart data={entries}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis yAxisId="hours" domain={[0, 12]} />
              <YAxis yAxisId="quality" orientation="right" domain={[1, 5]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                yAxisId="hours"
                dataKey="sleepHours"
                fill="var(--color-sleepHours)"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="quality"
                dataKey="sleepQuality"
                type="monotone"
                stroke="var(--color-sleepQuality)"
                strokeWidth={2}
                dot={false}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
