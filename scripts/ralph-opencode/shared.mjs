import {
  buildPrompt,
  parseRalphArgs,
  printUsage,
  repoRoot,
  getRecentCommits,
  formatCursorSdkImportError,
} from "../ralph/shared.mjs";

import { createOpencode, createOpencodeClient } from "@opencode-ai/sdk";

export { buildPrompt, parseRalphArgs, printUsage, repoRoot, getRecentCommits, formatCursorSdkImportError };

const DEFAULT_SERVER_PORT = 4096;

function getRequestedModelRaw() {
  const raw = process.env.RALPH_OPENCODE_MODEL || process.env.OPENCODE_MODEL || "";
  return raw.trim();
}

export async function getModelConfig(client) {
  const raw = getRequestedModelRaw();
  if (!raw) return undefined;

  const parts = raw.split("/");
  const requestedProviderID = parts.length === 2 ? parts[0] : undefined;
  const requestedModelID = parts.length === 2 ? parts[1] : raw;

  const providersResult = await client.config.providers({ throwOnError: true });
  const providers = providersResult.data.providers ?? [];

  if (
    requestedProviderID &&
    providers.some(
      (provider) => provider.id === requestedProviderID && requestedModelID in provider.models,
    )
  ) {
    return { providerID: requestedProviderID, modelID: requestedModelID };
  }

  const matches = providers
    .filter((provider) => requestedModelID in provider.models)
    .map((provider) => ({ providerID: provider.id, modelID: requestedModelID }));

  if (matches.length === 1) {
    const [match] = matches;

    if (requestedProviderID && requestedProviderID !== match.providerID) {
      process.stderr.write(
        `[opencode] remapped model ${raw} -> ${match.providerID}/${match.modelID}\n`,
      );
    }

    return match;
  }

  if (matches.length > 1) {
    const opencodeGoMatch = matches.find((match) => match.providerID === "opencode-go");

    if (opencodeGoMatch) {
      process.stderr.write(
        `[opencode] remapped model ${raw} -> ${opencodeGoMatch.providerID}/${opencodeGoMatch.modelID}\n`,
      );
      return opencodeGoMatch;
    }
  }

  process.stderr.write(
    `[opencode] model ${raw} not found in server providers; using server default\n`,
  );
  return undefined;
}

export function getAgentName() {
  return process.env.RALPH_OPENCODE_AGENT || process.env.OPENCODE_AGENT || "build";
}

export async function getOrStartServer() {
  const port = Number(process.env.OPENCODE_SERVER_PORT) || DEFAULT_SERVER_PORT;

  try {
    const client = createOpencodeClient({
      baseUrl: `http://127.0.0.1:${port}`,
      directory: repoRoot,
    });
    await client.session.list();
    process.stderr.write(`[opencode] connected to existing server at 127.0.0.1:${port}\n`);
    return { client, close: () => {} };
  } catch {
    process.stderr.write("[opencode] starting server...\n");
  }

  const { client, server } = await createOpencode({
    hostname: "127.0.0.1",
    port: 0,
    config: {},
  });

  process.stderr.write(`[opencode] server started at ${server.url}\n`);
  return { client, close: () => server.close() };
}

export async function sendPrompt(client, sessionId, prompt, agentName, modelConfig) {
  const result = await client.session.prompt({
    throwOnError: true,
    path: { id: sessionId },
    body: {
      parts: [{ type: "text", text: prompt }],
      agent: agentName,
      model: modelConfig,
    },
  });

  return result.data;
}
