import {
  buildPrompt,
  getOrStartServer,
  getModelConfig,
  getAgentName,
  parseRalphArgs,
  printUsage,
} from "./shared.mjs";

function parseIterations(value) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

function collectText(parts) {
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
}

async function main() {
  const [featureSlug, iterationsRaw] = parseRalphArgs(process.argv);
  const iterations = parseIterations(iterationsRaw);

  if (!featureSlug || !iterations) {
    printUsage("Usage: node ./ralph-opencode/afk.mjs <feature-slug> <iterations>");
    printUsage("       pnpm ralph-opencode:afk previewer-live-sync 5");
    process.exit(1);
  }

  const { client, close } = await getOrStartServer();
  const agentName = getAgentName();
  const modelConfig = await getModelConfig(client);

  try {
    for (let iteration = 1; iteration <= iterations; iteration += 1) {
      let session;

      try {
        const prompt = await buildPrompt({
          featureSlug,
          mode: "afk",
          iteration,
          iterations,
        });

        const sessionCreateResult = await client.session.create({
          body: { title: `ralph-opencode: ${featureSlug} iteration ${iteration}` },
        });
        session = sessionCreateResult.data;

        process.stderr.write(
          `[opencode] iteration ${iteration}/${iterations} session=${session.id} agent=${agentName}\n`,
        );

        const result = await client.session.prompt({
          throwOnError: true,
          path: { id: session.id },
          body: {
            parts: [{ type: "text", text: prompt }],
            agent: agentName,
            model: modelConfig,
          },
        });

        const { info, parts } = result.data;

        for (const part of parts) {
          if (part.type === "text") {
            process.stdout.write(part.text);
          }
        }
        process.stdout.write("\n");

        if (info.error) {
          process.stderr.write(`[opencode] run failed: ${session.id}\n`);
          process.exit(2);
        }

        const fullText = collectText(parts);

        if (fullText.includes("<promise>NO MORE TASKS</promise>")) {
          process.stderr.write(`[opencode] complete after ${iteration} iteration(s)\n`);
          return;
        }
      } finally {
        if (session) {
          await client.session.delete({ path: { id: session.id } }).catch(() => {});
        }
      }
    }
  } finally {
    close();
  }
}

await main();
