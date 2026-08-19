"use client";

import { Button } from "@repo/design-system/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/dialog";
import { Input } from "@repo/design-system/components/input";
import { Label } from "@repo/design-system/components/label";
import { toast } from "@repo/design-system/components/sonner";
import { useState, useTransition } from "react";
import { exportTeamWellnessCsv } from "../actions/export-team-wellness-csv";
import { isExportDateRangeValid } from "../lib/team-wellness-csv";

type ExportWellnessCsvDialogProperties = {
  readonly defaultStartDate: string;
  readonly defaultEndDate: string;
};

function downloadCsvFile(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportWellnessCsvDialog({
  defaultStartDate,
  defaultEndDate,
}: ExportWellnessCsvDialogProperties) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [isPending, startTransition] = useTransition();

  const canConfirm = isExportDateRangeValid(startDate, endDate);

  const handleOpenChange = (open: boolean): void => {
    setIsOpen(open);
    if (open) {
      setStartDate(defaultStartDate);
      setEndDate(defaultEndDate);
    }
  };

  const handleExport = (): void => {
    if (!canConfirm) {
      return;
    }

    startTransition(async () => {
      const result = await exportTeamWellnessCsv(startDate, endDate);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      downloadCsvFile(result.filename, result.csv);
      setIsOpen(false);
    });
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            Exportar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar wellness</DialogTitle>
          <DialogDescription>
            Descarga las entradas diarias del equipo activo en el rango
            seleccionado.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="wellness-export-start">Fecha inicio</Label>
            <Input
              id="wellness-export-start"
              onChange={(event) => setStartDate(event.target.value)}
              type="date"
              value={startDate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wellness-export-end">Fecha fin</Label>
            <Input
              id="wellness-export-end"
              onChange={(event) => setEndDate(event.target.value)}
              type="date"
              value={endDate}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => setIsOpen(false)}
            type="button"
            variant="ghost"
          >
            Cancelar
          </Button>
          <Button
            disabled={!canConfirm || isPending}
            onClick={handleExport}
            type="button"
          >
            {isPending ? "Descargando..." : "Descargar CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
