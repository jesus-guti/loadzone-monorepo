import { streamText } from "@repo/ai";
import { models } from "@repo/ai/lib/models";
import {
  analyzeTeamWellness,
  getPlayerRiskProfile,
  detectAnomalies,
} from "@repo/ai/tools";
import { database } from "@repo/database";
import { convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { getCurrentStaffContext } from "@/lib/auth-context";

export async function POST(request: Request) {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.primaryTeam) {
    return new Response("Unauthorized", { status: 401 });
  }

  const team = await database.team.findUnique({
    where: { id: staffContext.primaryTeam.id },
    select: {
      id: true,
      name: true,
      seasons: {
        where: {
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
        take: 1,
        select: { id: true, name: true },
      },
    },
  });

  if (!team) {
    return new Response("Team not found", { status: 404 });
  }

  const activeSeason = team.seasons[0];

  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: models.chat,
    system: `Eres un asistente de análisis deportivo para el equipo "${team.name}".
Tu rol es ayudar al cuerpo técnico a entender el estado de bienestar y rendimiento de sus jugadores.

Contexto:
- Equipo: ${team.name}
- Team ID: ${team.id}
- Temporada activa: ${activeSeason?.name ?? "Sin temporada activa"} (ID: ${activeSeason?.id ?? "N/A"})

Reglas:
- Responde siempre en español
- Sé conciso y directo
- Usa datos concretos de las herramientas disponibles
- Prioriza las alertas y situaciones de riesgo
- Recomienda acciones específicas (reducir carga, programar fisio, dar descanso)
- Si no hay temporada activa, informa al usuario que debe crear una`,
    messages: convertToModelMessages(messages),
    tools: {
      analyzeTeamWellness,
      getPlayerRiskProfile,
      detectAnomalies,
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
