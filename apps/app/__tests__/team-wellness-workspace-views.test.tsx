import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TeamWellnessWorkspace } from "@/features/wellness/components/team-wellness-workspace";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/features/wellness/actions/remind-pending-players", () => ({
  remindPendingWellnessPlayers: vi.fn(),
}));

const PLAYER_NAME_PATTERN = /Jugador Uno/;
const LISTA_TAB_PATTERN = /Lista/;

afterEach(() => {
  cleanup();
});

function createPlayer(
  overrides: Partial<TeamWellnessPlayer> = {}
): TeamWellnessPlayer {
  return {
    id: "player_1",
    imageUrl: null,
    name: "Jugador Uno",
    status: "AVAILABLE",
    currentStreak: 0,
    injuryExemptOnEvaluatedDay: false,
    entries: [],
    stats: [],
    ...overrides,
  };
}

describe("TeamWellnessWorkspace exclusive roster views", () => {
  it("places Tarjetas / Lista above the team summary", () => {
    const { container } = render(
      <TeamWellnessWorkspace
        evaluatedDate="2026-08-26"
        players={[createPlayer()]}
      />
    );

    const text = container.textContent ?? "";
    expect(text.indexOf("Tarjetas")).toBeLessThan(
      text.indexOf("Formularios pendientes")
    );
  });

  it("shows player cards and no comparison table in Tarjetas", () => {
    const { container } = render(
      <TeamWellnessWorkspace
        evaluatedDate="2026-08-26"
        players={[createPlayer()]}
      />
    );

    expect(screen.getByText("Formularios pendientes")).toBeDefined();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("list", { name: "Comparativa de bienestar" })).toBeNull();
    expect(container.querySelector('[data-slot="card"]')).not.toBeNull();
  });

  it("shows comparison table and mobile list with all metrics in Lista, not cards", () => {
    const { container } = render(
      <TeamWellnessWorkspace
        evaluatedDate="2026-08-26"
        players={[createPlayer()]}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: LISTA_TAB_PATTERN }));

    expect(screen.getByText("Formularios pendientes")).toBeDefined();
    expect(screen.getByRole("table")).toBeDefined();
    expect(
      within(screen.getByRole("table")).getByText("Jugador Uno")
    ).toBeDefined();
    expect(within(screen.getByRole("table")).getByText("Pre sesión")).toBeDefined();
    expect(within(screen.getByRole("table")).getByText("Post sesión")).toBeDefined();

    const list = screen.getByRole("list", { name: "Comparativa de bienestar" });
    expect(within(list).getByText("Jugador Uno")).toBeDefined();
    expect(within(list).getByText("Recuperación")).toBeDefined();
    expect(within(list).getByText("Energía")).toBeDefined();
    expect(within(list).getByText("Agujetas")).toBeDefined();
    expect(within(list).getByText("Sueño")).toBeDefined();
    expect(within(list).getByText("Calidad")).toBeDefined();
    expect(within(list).getByText("RPE")).toBeDefined();
    expect(within(list).getByText("Riesgo")).toBeDefined();
    expect(
      screen.queryByRole("button", { name: PLAYER_NAME_PATTERN })
    ).toBeNull();
    expect(container.querySelector('[data-slot="card"]')).toBeNull();
  });
});
