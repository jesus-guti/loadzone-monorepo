import { Badge } from "@repo/design-system/components/badge";
import { Button } from "@repo/design-system/components/button";
import Link from "next/link";
import {
  playerProfileHref,
  truncateText,
} from "../lib/team-injuries-list";
import type {
  TeamInjuriesListPayload,
  TeamInjuryListItem,
  TeamPainAlertListItem,
} from "../types";

function formatCivilDateEs(civilYmd: string): string {
  const [year, month, day] = civilYmd.split("-").map(Number);
  if (!year || !month || !day) {
    return civilYmd;
  }
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("es-ES", {
    timeZone: "UTC",
  });
}

function formatReportedAtEs(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function SectionHeading({ children }: { readonly children: string }) {
  return (
    <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
      {children}
    </h2>
  );
}

function EmptySectionHint({ children }: { readonly children: string }) {
  return (
    <p className="border-t border-border-secondary px-3 py-4 text-sm text-text-secondary">
      {children}
    </p>
  );
}

function InjuryRow({ injury }: { readonly injury: TeamInjuryListItem }) {
  const isOpen = injury.endDate === null;
  const regionText =
    injury.regionLabels.length > 0
      ? injury.regionLabels.join(", ")
      : "Sin zona";

  return (
    <li className="border-t border-border-secondary">
      <Link
        href={playerProfileHref(injury.playerId)}
        className="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 hover:bg-bg-tertiary/40"
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate font-medium text-text-primary">
              {injury.playerName}
            </span>
            <Badge variant={isOpen ? "destructive" : "outline"}>
              {isOpen ? "Activa" : "Alta"}
            </Badge>
          </div>
          <p className="truncate text-sm text-text-secondary">
            {regionText} · {formatCivilDateEs(injury.startDate)}
            {injury.endDate
              ? ` → ${formatCivilDateEs(injury.endDate)}`
              : null}
          </p>
          <p className="truncate text-sm text-text-primary">
            {truncateText(injury.cause, 100)}
          </p>
        </div>
      </Link>
    </li>
  );
}

function PainAlertRow({
  alert,
}: {
  readonly alert: TeamPainAlertListItem;
}) {
  return (
    <li className="border-t border-border-secondary">
      <div className="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 hover:bg-bg-tertiary/40">
        <Link
          href={playerProfileHref(alert.playerId)}
          className="min-w-0 flex-1 space-y-0.5"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate font-medium text-text-primary">
              {alert.playerName}
            </span>
            <Badge variant="secondary">Aviso</Badge>
          </div>
          <p className="truncate text-sm text-text-secondary">
            {formatReportedAtEs(alert.reportedAt)}
          </p>
          <p className="truncate text-sm text-text-primary">{alert.title}</p>
          {alert.summary ? (
            <p className="truncate text-sm text-text-secondary">
              {alert.summary}
            </p>
          ) : null}
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Button type="button" variant="outline" size="sm" disabled>
            Promover
          </Button>
          <span className="max-w-[10rem] text-right text-xs text-text-secondary">
            Disponible pronto
          </span>
        </div>
      </div>
    </li>
  );
}

function InjurySection({
  title,
  injuries,
  emptyHint,
}: {
  readonly title: string;
  readonly injuries: readonly TeamInjuryListItem[];
  readonly emptyHint: string;
}) {
  return (
    <section className="space-y-2">
      <SectionHeading>{title}</SectionHeading>
      {injuries.length === 0 ? (
        <EmptySectionHint>{emptyHint}</EmptySectionHint>
      ) : (
        <ul className="list-none">
          {injuries.map((injury) => (
            <InjuryRow key={injury.id} injury={injury} />
          ))}
        </ul>
      )}
    </section>
  );
}

function PainAlertSection({
  alerts,
}: {
  readonly alerts: readonly TeamPainAlertListItem[];
}) {
  return (
    <section className="space-y-2">
      <SectionHeading>Avisos de dolor</SectionHeading>
      {alerts.length === 0 ? (
        <EmptySectionHint>No hay avisos de dolor pendientes.</EmptySectionHint>
      ) : (
        <ul className="list-none">
          {alerts.map((alert) => (
            <PainAlertRow key={alert.id} alert={alert} />
          ))}
        </ul>
      )}
    </section>
  );
}

type TeamInjuriesListProps = {
  readonly data: TeamInjuriesListPayload;
};

export function TeamInjuriesList({ data }: TeamInjuriesListProps) {
  const isFullyEmpty =
    data.painAlerts.length === 0 &&
    data.activeInjuries.length === 0 &&
    data.closedInjuries.length === 0;

  if (isFullyEmpty) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-border-secondary bg-bg-secondary/30 p-10 text-center">
        <h3 className="text-base font-semibold text-text-primary">
          No hay lesiones ni avisos
        </h3>
        <p className="mt-1 max-w-sm text-sm text-text-secondary">
          Las lesiones oficiales se registran desde el perfil del jugador. Los
          avisos de dolor aparecen cuando un jugador los reporta.
        </p>
        <Button
          className="mt-4"
          size="sm"
          render={<Link href="/players">Ir a Jugadores</Link>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PainAlertSection alerts={data.painAlerts} />
      <InjurySection
        title="Lesiones activas"
        injuries={data.activeInjuries}
        emptyHint="No hay lesiones activas."
      />
      <InjurySection
        title="Histórico"
        injuries={data.closedInjuries}
        emptyHint="No hay lesiones en el histórico."
      />
    </div>
  );
}
