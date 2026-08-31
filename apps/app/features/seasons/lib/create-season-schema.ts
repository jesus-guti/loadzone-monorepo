import { z } from "zod";
import { seasonRangeError } from "./season-cycle";

export const createSeasonSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    startDate: z.string().min(1, "Fecha de inicio obligatoria"),
    endDate: z.string().min(1, "Fecha de fin obligatoria"),
    preSeasonEnd: z.string().min(1, "El fin de pretemporada es obligatorio"),
  })
  .superRefine((data, ctx) => {
    const message = seasonRangeError(data);
    if (message) {
      ctx.addIssue({ code: "custom", message });
    }
  });
