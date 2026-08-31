"use client";

import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import { Label } from "@repo/design-system/components/label";
import { Textarea } from "@repo/design-system/components/textarea";
import { toast } from "@repo/design-system/components/sonner";
import type { BodyMapView, BodyRegionCatalogId } from "@repo/database/body-region-catalog";
import { useActionState, useEffect, useState, type FormEvent } from "react";
import { DatePicker } from "@/components/date-picker";
import {
  createInjury,
  updateInjury,
  type InjuryActionResult,
} from "../actions/injury-actions";
import type { InjuryListItem } from "../types";
import { BodyMap } from "./body-map";

type InjuryLogFormProperties = {
  readonly playerId: string;
  readonly todayCivil: string;
  readonly mode: "create" | "edit";
  readonly initial?: InjuryListItem | null;
  readonly painAlertId?: string | null;
  readonly prefillCause?: string;
  readonly prefillStartDate?: string;
  readonly prefillRegionDetail?: string;
  readonly layout?: "page" | "dialog";
  readonly onCancel: () => void;
  readonly onSuccess: () => void;
};

const emptyResult: InjuryActionResult = { success: false };

export function InjuryLogForm({
  playerId,
  todayCivil,
  mode,
  initial = null,
  painAlertId = null,
  prefillCause,
  prefillStartDate,
  prefillRegionDetail,
  layout = "page",
  onCancel,
  onSuccess,
}: InjuryLogFormProperties) {
  const [view, setView] = useState<BodyMapView>("front");
  const [selectedIds, setSelectedIds] = useState<Set<BodyRegionCatalogId>>(
    () => new Set(initial?.regionIds ?? [])
  );
  const [regionsError, setRegionsError] = useState(false);
  const [startDate, setStartDate] = useState(
    initial?.startDate ?? prefillStartDate ?? todayCivil
  );
  const [cause, setCause] = useState(
    initial?.cause ?? prefillCause ?? ""
  );
  const [regionDetail, setRegionDetail] = useState(
    initial?.regionDetail ?? prefillRegionDetail ?? ""
  );

  const action = mode === "create" ? createInjury : updateInjury;
  const [state, formAction, pending] = useActionState(action, emptyResult);

  useEffect(() => {
    if (state.success) {
      toast.success(
        mode === "create" ? "Lesión registrada" : "Lesión actualizada"
      );
      onSuccess();
    }
    if (state.error) {
      toast.error(state.error);
    }
    // Intentionally omit onSuccess — parent setState is stable enough; avoid re-toast loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [state, mode]);

  const toggleRegion = (id: BodyRegionCatalogId): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setRegionsError(false);
  };

  const removeRegion = (id: BodyRegionCatalogId): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    if (selectedIds.size === 0) {
      event.preventDefault();
      setRegionsError(true);
    }
  };

  return (
    <section
      className={
        layout === "dialog" ? "space-y-4" : "space-y-4 border-t border-border-secondary pt-4"
      }
    >
      {layout === "page" ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-medium text-text-primary">
            {mode === "create" ? "Registrar lesión" : "Editar lesión"}
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <BodyMap
          selectedIds={selectedIds}
          onToggle={toggleRegion}
          onRemove={removeRegion}
          view={view}
          onViewChange={setView}
          showError={regionsError}
        />

        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="space-y-3"
        >
          <input type="hidden" name="playerId" value={playerId} />
          {mode === "create" && painAlertId ? (
            <input type="hidden" name="painAlertId" value={painAlertId} />
          ) : null}
          {mode === "edit" && initial ? (
            <input type="hidden" name="injuryId" value={initial.id} />
          ) : null}
          <input
            type="hidden"
            name="regionIds"
            value={JSON.stringify([...selectedIds])}
          />

          <div className="space-y-1.5">
            <Label htmlFor="injury-start-date">
              Fecha de inicio <span className="text-danger">*</span>
            </Label>
            <DatePicker
              id="injury-start-date"
              name="startDate"
              onChange={setStartDate}
              required
              value={startDate}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="injury-cause">
              Causa <span className="text-danger">*</span>
            </Label>
            <Input
              id="injury-cause"
              name="cause"
              required
              maxLength={500}
              placeholder="Ej. partido, entrenamiento…"
              autoComplete="off"
              value={cause}
              onChange={(event) => setCause(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="injury-region-detail">Detalle de zona</Label>
            <Textarea
              id="injury-region-detail"
              name="regionDetail"
              rows={2}
              maxLength={1000}
              placeholder="Opcional"
              value={regionDetail}
              onChange={(event) => setRegionDetail(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Guardar lesión"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={pending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
