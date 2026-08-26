import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/table";
import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";
import {
  getLatestEntry,
  getRiskLabel,
} from "./team-wellness-workspace.utils";
import {
  EnergyScale,
  RecoveryScale,
  RiskScale,
  SorenessScale,
} from "./wellness-scales";

type TeamWellnessComparisonRowProperties = {
  readonly player: TeamWellnessPlayer;
  readonly wellnessLimits?: WellnessLimits | null;
};

function TeamWellnessComparisonRow({
  player,
  wellnessLimits,
}: TeamWellnessComparisonRowProperties) {
  const entry = getLatestEntry(player);
  const riskLevel = player.stats[0]?.riskLevel;
  const riskLabel = riskLevel ? getRiskLabel(riskLevel) : undefined;

  return (
    <TableRow className="border-0 hover:bg-bg-secondary/40">
      <TableCell className="py-2 pl-0">
        <Link
          className="font-medium text-text-primary hover:text-brand"
          href={`/players/${player.id}`}
        >
          {player.name}
        </Link>
      </TableCell>
      <TableCell
        className={cn(
          "hidden py-2 tabular-nums md:table-cell",
          entry?.preFilledAt ? "font-medium text-success" : "text-text-tertiary"
        )}
      >
        {entry?.preFilledAt ? "Sí" : "—"}
      </TableCell>
      <TableCell
        className={cn(
          "hidden py-2 tabular-nums md:table-cell",
          entry?.postFilledAt
            ? "font-medium text-success"
            : "text-text-tertiary"
        )}
      >
        {entry?.postFilledAt ? "Sí" : "—"}
      </TableCell>
      <TableCell className="hidden py-2 md:table-cell">
        <RecoveryScale
          alertAtOrBelow={wellnessLimits?.recovery ?? null}
          size="sm"
          value={entry?.recovery ?? null}
        />
      </TableCell>
      <TableCell className="hidden py-2 md:table-cell">
        <EnergyScale
          alertAtOrBelow={wellnessLimits?.energy ?? null}
          size="sm"
          value={entry?.energy ?? null}
        />
      </TableCell>
      <TableCell className="hidden py-2 md:table-cell">
        <SorenessScale
          alertAtOrAbove={wellnessLimits?.soreness ?? null}
          size="sm"
          value={entry?.soreness ?? null}
        />
      </TableCell>
      <TableCell className="py-2 pr-0">
        <RiskScale
          label={riskLabel}
          riskLevel={riskLevel}
          size="sm"
        />
      </TableCell>
    </TableRow>
  );
}

type TeamWellnessComparisonTableProperties = {
  readonly players: TeamWellnessPlayer[];
  readonly wellnessLimits?: WellnessLimits | null;
};

export function TeamWellnessComparisonTable({
  players,
  wellnessLimits,
}: TeamWellnessComparisonTableProperties) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-0 hover:bg-transparent">
          <TableHead className="pl-0">Jugador</TableHead>
          <TableHead className="">Pre</TableHead>
          <TableHead className="">Post</TableHead>
          <TableHead className="">Recuperación</TableHead>
          <TableHead className="">Energía</TableHead>
          <TableHead className="">Agujetas</TableHead>
          <TableHead className="">Riesgo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TeamWellnessComparisonRow
            key={player.id}
            player={player}
            wellnessLimits={wellnessLimits}
          />
        ))}
      </TableBody>
    </Table>
  );
}
