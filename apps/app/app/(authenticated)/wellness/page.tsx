import { toCivilDateString } from "@repo/database/recoverable-streak";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Header } from "@/components/layouts/header";
import {
  ExportWellnessCsvDialog,
  TeamWellnessWorkspace,
  WellnessBaselineEmptyStates,
  WellnessDateFilter,
} from "@/features/wellness";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { ACTIVE_WELLNESS_DATE_COOKIE_NAME } from "@/lib/auth-context";
import { resolveRecommendedSetup } from "@/lib/recommended-setup";
import { getTeamWellnessWorkspaceData } from "@/lib/team-wellness";

export const metadata: Metadata = {
  title: "Wellness | LoadZone",
  description: "Workspace diario del equipo activo",
};

/** Club facts unused for Operational Baseline gating; stubs satisfy the resolver input. */
const BASELINE_GATE_CLUB_FACTS = {
  hasClubLogo: false,
  hasAnySeason: false,
  hasAnyPlayer: false,
  hasMembershipExerciseFavorite: false,
  hasExerciseOnSession: false,
  hasAnySession: false,
} as const;

function parseWellnessDateValue(dateValue: string | null): Date | null {
  if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return null;
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
}

const WellnessPage = async () => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  const cookieStore = await cookies();
  const evaluatedDate = parseWellnessDateValue(
    cookieStore.get(ACTIVE_WELLNESS_DATE_COOKIE_NAME)?.value ?? null
  );

  const data = await getTeamWellnessWorkspaceData(
    staffContext.activeTeam.id,
    staffContext.activeSeason?.id,
    evaluatedDate
  );
  if (!data) {
    notFound();
  }

  const { needsSeason, needsPlayers } = resolveRecommendedSetup({
    clubFacts: BASELINE_GATE_CLUB_FACTS,
    // Panel chrome must not suppress baseline empty states (JES-84).
    panelChrome: "expanded",
    activeTeam: {
      hasActiveSeason: data.activeSeason !== null,
      hasPlayers: data.players.length > 0,
    },
  });

  const showBaselineEmpty = needsSeason || needsPlayers;
  const defaultStartDate = staffContext.activeSeason
    ? toCivilDateString(staffContext.activeSeason.startDate, "UTC")
    : "";
  const defaultEndDate = staffContext.activeSeason
    ? toCivilDateString(staffContext.activeSeason.endDate, "UTC")
    : "";

  return (
    <>
      <Header page="Wellness" pages={["LoadZone"]}>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <WellnessDateFilter initialDate={data.evaluatedDate} />
          <ExportWellnessCsvDialog
            defaultEndDate={defaultEndDate}
            defaultStartDate={defaultStartDate}
          />
        </div>
      </Header>
      <div className="flex flex-1 flex-col gap-6 px-4 pb-6 pt-2 md:gap-8 md:px-6">
        {showBaselineEmpty ? (
          <WellnessBaselineEmptyStates
            needsSeason={needsSeason}
            needsPlayers={needsPlayers}
          />
        ) : (
          <TeamWellnessWorkspace
            evaluatedDate={data.evaluatedDate}
            players={data.players}
            wellnessLimits={staffContext.activeTeam.wellnessLimits}
          />
        )}
      </div>
    </>
  );
};

export default WellnessPage;
