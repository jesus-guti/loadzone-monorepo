"use client";

import { Badge } from "@repo/design-system/components/badge";
import { Button } from "@repo/design-system/components/button";
import Link from "next/link";
import { useState } from "react";
import {
  countInclusiveCivilDays,
  playerProfileHref,
  truncateText,
} from "../lib/team-injuries-list";
import type {
  TeamInjuriesListPayload,
  TeamInjuryListItem,
  TeamPainAlertListItem,
} from "../types";
import { DismissPainAlertButton } from "./dismiss-pain-alert-button";
import {
  RegisterInjuryDialog,
  type RegisterInjuryDialogTarget,
} from "./register-injury-dialog";

function formatCivilDateEs(civilYmd: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(civilYmd);
  if (!match) {
    return civilYmd;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
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

function formatDaysOut(startDate: string, todayCivil: string): string {
  const days = countInclusiveCivilDays(startDate, todayCivil);
  if (days <= 0) {
    return "Aún no ha empezado";
  }
  if (days === 1) {
    return "1 día de baja";
  }
  return `${days} días de baja`;
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

function InjuryRow({
  injury,
  todayCivil,
}: {
  readonly injury: TeamInjuryListItem;
  readonly todayCivil: string;
}) {
  const regionText =
    injury.regionLabels.length > 0
      ? injury.regionLabels.join(", ")
      : "Sin zona";

  return (
    <li className="border-t border-border-secondary">
      <Link
        className="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 hover:bg-bg-tertiary/40"
        href={playerProfileHref(injury.playerId)}
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate font-medium text-text-primary">
              {injury.playerName}
            </span>
            <Badge variant="destructive">Lesionado</Badge>
          </div>
          <p className="truncate text-sm text-text-secondary">
            {regionText} · {formatDaysOut(injury.startDate, todayCivil)} ·{" "}
            {formatCivilDateEs(injury.startDate)}
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
  onRegister,
}: {
  readonly alert: TeamPainAlertListItem;
  readonly onRegister: (alert: TeamPainAlertListItem) => void;
}) {
  return (
    <li className="border-t border-border-secondary">
      <div className="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Link
              className="truncate font-medium text-text-primary hover:underline"
              href={playerProfileHref(alert.playerId)}
            >
              {alert.playerName}
            </Link>
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
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            onClick={() => onRegister(alert)}
            size="sm"
            type="button"
          >
            Registrar lesión
          </Button>
          <DismissPainAlertButton painAlertId={alert.id} />
        </div>
      </div>
    </li>
  );
}

type TeamInjuriesListProps = {
  readonly data: TeamInjuriesListPayload;
  readonly todayCivil: string;
};

export function TeamInjuriesList({
  data,
  todayCivil,
}: TeamInjuriesListProps): React.JSX.Element {
  const [registerTarget, setRegisterTarget] =
    useState<RegisterInjuryDialogTarget | null>(null);

  const isFullyEmpty =
    data.painAlerts.length === 0 && data.activeInjuries.length === 0;

  const handleRegister = (alert: TeamPainAlertListItem): void => {
    setRegisterTarget({
      playerId: alert.playerId,
      playerName: alert.playerName,
      painAlertId: alert.id,
      prefillCause: alert.title,
      prefillStartDate: todayCivil,
      prefillRegionDetail: alert.bodyPart
        ? `Zona (jugador): ${alert.bodyPart}`
        : undefined,
    });
  };

  if (isFullyEmpty) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-border-secondary bg-bg-secondary/30 p-10 text-center">
        <h3 className="text-base font-semibold text-text-primary">
          Nadie lesionado
        </h3>
        <p className="mt-1 max-w-sm text-sm text-text-secondary">
          Los avisos aparecen cuando un jugador reporta molestias. Las lesiones
          oficiales se registran desde aquí o desde el perfil.
        </p>
        <Button
          className="mt-4"
          render={<Link href="/players">Ir a Jugadores</Link>}
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <SectionHeading>Pendiente de staff</SectionHeading>
        {data.painAlerts.length === 0 ? (
          <EmptySectionHint>No hay avisos pendientes.</EmptySectionHint>
        ) : (
          <ul className="list-none">
            {data.painAlerts.map((alert) => (
              <PainAlertRow
                alert={alert}
                key={alert.id}
                onRegister={handleRegister}
              />
            ))}
          </ul>
        )}
      </section>
      <section className="space-y-2">
        <SectionHeading>Lesionados ahora</SectionHeading>
        {data.activeInjuries.length === 0 ? (
          <EmptySectionHint>Nadie está lesionado hoy.</EmptySectionHint>
        ) : (
          <ul className="list-none">
            {data.activeInjuries.map((injury) => (
              <InjuryRow
                injury={injury}
                key={injury.id}
                todayCivil={todayCivil}
              />
            ))}
          </ul>
        )}
      </section>
      <RegisterInjuryDialog
        onOpenChange={(open) => {
          if (!open) {
            setRegisterTarget(null);
          }
        }}
        open={registerTarget !== null}
        target={registerTarget}
        todayCivil={todayCivil}
      />
    </div>
  );
}
