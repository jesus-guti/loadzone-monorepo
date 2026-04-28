import "server-only";

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "./generated/client";
import { keys } from "./keys";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: keys().DATABASE_URL });

export const database = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = database;
}

type BaseFormTemplateDefinition = {
  code: string;
  name: string;
  kind: "WELLNESS" | "TQR" | "RPE";
  fillMoment: "PRE_SESSION" | "POST_SESSION";
  questions: Array<{
    key: string;
    label: string;
    type: "SCALE" | "NUMBER";
    order: number;
    minValue?: string;
    maxValue?: string;
    step?: string;
    mappingKey: string;
  }>;
};

const BASE_FORM_TEMPLATES: BaseFormTemplateDefinition[] = [
  {
    code: "system-wellness-pre",
    name: "Wellness Base",
    kind: "WELLNESS",
    fillMoment: "PRE_SESSION",
    questions: [
      {
        key: "recovery",
        label: "Recuperación (TQR)",
        type: "SCALE",
        order: 1,
        minValue: "0",
        maxValue: "10",
        step: "1",
        mappingKey: "recovery",
      },
      {
        key: "energy",
        label: "Nivel de energía",
        type: "SCALE",
        order: 2,
        minValue: "1",
        maxValue: "5",
        step: "1",
        mappingKey: "energy",
      },
      {
        key: "soreness",
        label: "Agujetas / Dolor muscular",
        type: "SCALE",
        order: 3,
        minValue: "1",
        maxValue: "5",
        step: "1",
        mappingKey: "soreness",
      },
      {
        key: "sleepHours",
        label: "Horas de sueño",
        type: "NUMBER",
        order: 4,
        minValue: "0",
        maxValue: "24",
        step: "0.5",
        mappingKey: "sleepHours",
      },
      {
        key: "sleepQuality",
        label: "Calidad del sueño",
        type: "SCALE",
        order: 5,
        minValue: "1",
        maxValue: "5",
        step: "1",
        mappingKey: "sleepQuality",
      },
    ],
  },
  {
    code: "system-tqr-pre",
    name: "TQR Base",
    kind: "TQR",
    fillMoment: "PRE_SESSION",
    questions: [
      {
        key: "recovery",
        label: "Recuperación (TQR)",
        type: "SCALE",
        order: 1,
        minValue: "0",
        maxValue: "10",
        step: "1",
        mappingKey: "recovery",
      },
    ],
  },
  {
    code: "system-rpe-post",
    name: "RPE Base",
    kind: "RPE",
    fillMoment: "POST_SESSION",
    questions: [
      {
        key: "rpe",
        label: "Esfuerzo percibido (RPE - Borg)",
        type: "SCALE",
        order: 1,
        minValue: "0",
        maxValue: "10",
        step: "1",
        mappingKey: "rpe",
      },
      {
        key: "duration",
        label: "Duración de la sesión (minutos)",
        type: "NUMBER",
        order: 2,
        minValue: "1",
        maxValue: "600",
        step: "1",
        mappingKey: "duration",
      },
    ],
  },
];

export async function ensureBaseFormTemplates(): Promise<void> {
  for (const template of BASE_FORM_TEMPLATES) {
    await database.formTemplate.upsert({
      where: { code: template.code },
      create: {
        code: template.code,
        name: template.name,
        kind: template.kind,
        fillMoment: template.fillMoment,
        isSystem: true,
        questions: {
          create: template.questions.map((question) => ({
            key: question.key,
            label: question.label,
            type: question.type,
            order: question.order,
            minValue: question.minValue,
            maxValue: question.maxValue,
            step: question.step,
            mappingKey: question.mappingKey,
          })),
        },
      },
      update: {
        name: template.name,
        kind: template.kind,
        fillMoment: template.fillMoment,
        isSystem: true,
        isActive: true,
        questions: {
          deleteMany: {},
          create: template.questions.map((question) => ({
            key: question.key,
            label: question.label,
            type: question.type,
            order: question.order,
            minValue: question.minValue,
            maxValue: question.maxValue,
            step: question.step,
            mappingKey: question.mappingKey,
          })),
        },
      },
    });
  }
}

// biome-ignore lint/performance/noBarrelFile: re-exporting
export * from "./generated/client";
export * from "./risk";
