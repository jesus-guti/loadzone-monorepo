import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExerciseLibraryListToolbar } from "@/features/exercises/components/exercise-library-list-toolbar";

afterEach(() => {
  cleanup();
});

function getHiddenInputValue(triggerId: string): string | undefined {
  const node: unknown = document.getElementById(`${triggerId}-hidden-input`);
  return node instanceof HTMLInputElement ? node.value : undefined;
}

describe("ExerciseLibraryListToolbar Select labels (JES-72)", () => {
  it("shows human labels in triggers, not raw enum/sort values", () => {
    const { rerender } = render(
      <ExerciseLibraryListToolbar
        onClearStrategyFilter={vi.fn()}
        onSearchChange={vi.fn()}
        onSortKeyChange={vi.fn()}
        onStrategyFilterChange={vi.fn()}
        search=""
        sortKey="name_asc"
        strategyFilter="POSITIONAL_PLAY"
      />
    );

    const strategyTrigger = screen.getByLabelText("Filtrar por estrategia");
    expect(strategyTrigger.textContent).toContain("Juego de posición");
    expect(strategyTrigger.textContent).not.toContain("POSITIONAL_PLAY");

    const sortTrigger = screen.getByLabelText("Ordenar lista de ejercicios");
    expect(sortTrigger.textContent).toContain("Nombre (A → Z)");
    expect(sortTrigger.textContent).not.toContain("name_asc");

    expect(getHiddenInputValue(strategyTrigger.id)).toBe("POSITIONAL_PLAY");

    rerender(
      <ExerciseLibraryListToolbar
        onClearStrategyFilter={vi.fn()}
        onSearchChange={vi.fn()}
        onSortKeyChange={vi.fn()}
        onStrategyFilterChange={vi.fn()}
        search=""
        sortKey="updated_desc"
        strategyFilter="CONSERVATION"
      />
    );

    expect(strategyTrigger.textContent).toContain("Conservación");
    expect(strategyTrigger.textContent).not.toContain("CONSERVATION");
    expect(sortTrigger.textContent).toContain(
      "Última modificación (recientes primero)"
    );
    expect(sortTrigger.textContent).not.toContain("updated_desc");

    expect(getHiddenInputValue(strategyTrigger.id)).toBe("CONSERVATION");
  });
});
