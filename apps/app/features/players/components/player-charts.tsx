"use client";

import {
  RISK_THRESHOLDS,
  type RiskLevel,
} from "@repo/database/risk-thresholds";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/design-system/components/chart";
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
  rpe: { label: "RPE", color: "var(--chart-1)" },
  recovery: { label: "Recuperación", color: "var(--chart-2)" },
};

const loadConfig: ChartConfig = {
  energy: { label: "Energía", color: "var(--chart-3)" },
  soreness: { label: "Agujetas", color: "var(--chart-4)" },
};

const acwrConfig: ChartConfig = {
  acwr: { label: "ACWR", color: "var(--chart-1)" },
};

const sleepConfig: ChartConfig = {
  sleepHours: { label: "Horas", color: "var(--chart-5)" },
  sleepQuality: { label: "Calidad", color: "var(--chart-3)" },
};

type ChartBlockProperties = {
  readonly title: string;
  readonly hint?: string;
  readonly children: React.ReactNode;
};

function ChartBlock({
  title,
  hint,
  children,
}: ChartBlockProperties): React.JSX.Element {
  return (
    <div className="min-w-0 space-y-3">
      <div className="space-y-0.5">
        <h3 className="font-medium text-sm text-text-primary">{title}</h3>
        {hint ? (
          <p className="text-sm text-text-secondary">{hint}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function PlayerCharts({ entries, stats }: PlayerChartsProperties) {
  if (entries.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="font-medium text-text-secondary text-xs uppercase tracking-wide">
          Tendencias
        </h2>
        <p className="border border-border-secondary border-dashed p-8 text-center text-sm text-text-secondary">
          No hay registros diarios todavía. Cuando el jugador envíe wellness,
          verás aquí RPE, sueño y carga.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="font-medium text-text-secondary text-xs uppercase tracking-wide">
        Tendencias
      </h2>

      <div className="grid gap-8 xl:grid-cols-2">
        <ChartBlock title="RPE y recuperación">
          <ChartContainer className="h-64 w-full" config={rpeRecoveryConfig}>
            <BarChart data={entries}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis axisLine={false} dataKey="date" tickLine={false} />
              <YAxis domain={[0, 10]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="rpe"
                fill="var(--color-rpe)"
                radius={[4, 4, 0, 0]}
              />
              <Line
                dataKey="recovery"
                dot={false}
                stroke="var(--color-recovery)"
                strokeWidth={2}
                type="monotone"
              />
            </BarChart>
          </ChartContainer>
        </ChartBlock>

        <ChartBlock title="Energía y agujetas">
          <ChartContainer className="h-64 w-full" config={loadConfig}>
            <AreaChart data={entries}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis axisLine={false} dataKey="date" tickLine={false} />
              <YAxis domain={[1, 5]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="energy"
                fill="var(--color-energy)"
                fillOpacity={0.3}
                stackId="a"
                stroke="var(--color-energy)"
                type="monotone"
              />
              <Area
                dataKey="soreness"
                fill="var(--color-soreness)"
                fillOpacity={0.3}
                stackId="b"
                stroke="var(--color-soreness)"
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </ChartBlock>

        {stats.length > 0 ? (
          <ChartBlock
            hint="Por encima de la zona de riesgo, la carga aguda sube demasiado rápido frente a la crónica."
            title="Carga aguda frente a crónica (ACWR)"
          >
            <ChartContainer className="h-64 w-full" config={acwrConfig}>
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis axisLine={false} dataKey="date" tickLine={false} />
                <YAxis domain={[0, 3]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceArea
                  fill="var(--danger)"
                  fillOpacity={0.08}
                  y1={RISK_THRESHOLDS.acwr.high}
                  y2={3}
                />
                <ReferenceLine
                  label="Zona de riesgo"
                  stroke="var(--danger)"
                  strokeDasharray="3 3"
                  y={RISK_THRESHOLDS.acwr.high}
                />
                <ReferenceLine
                  label="Zona óptima"
                  stroke="var(--success)"
                  strokeDasharray="3 3"
                  y={0.8}
                />
                <Line
                  dataKey="acwr"
                  dot={false}
                  stroke="var(--color-acwr)"
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ChartContainer>
          </ChartBlock>
        ) : null}

        <ChartBlock hint="Barras: horas dormidas. Línea: calidad." title="Sueño">
          <ChartContainer className="h-64 w-full" config={sleepConfig}>
            <BarChart data={entries}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis axisLine={false} dataKey="date" tickLine={false} />
              <YAxis domain={[0, 12]} yAxisId="hours" />
              <YAxis domain={[1, 5]} orientation="right" yAxisId="quality" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="sleepHours"
                fill="var(--color-sleepHours)"
                radius={[4, 4, 0, 0]}
                yAxisId="hours"
              />
              <Line
                dataKey="sleepQuality"
                dot={false}
                stroke="var(--color-sleepQuality)"
                strokeWidth={2}
                type="monotone"
                yAxisId="quality"
              />
            </BarChart>
          </ChartContainer>
        </ChartBlock>
      </div>
    </section>
  );
}
