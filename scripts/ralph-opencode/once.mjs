import {
  buildPrompt,
  getOrStartServer,
  getModelConfig,
  getAgentName,
  parseRalphArgs,
  printUsage,
} from "./shared.mjs";

async function main() {
  const [featureSlug] = parseRalphArgs(process.argv);

  if (!featureSlug) {
    printUsage("Usage: node ./ralph-opencode/once.mjs <feature-slug>");
    printUsage("       pnpm ralph-opencode:once previewer-live-sync");
    process.exit(1);
  }

  const { client, close } = await getOrStartServer();
  let session;

  try {
    const prompt = await buildPrompt({ featureSlug, mode: "once" });
    const agentName = getAgentName();
    const modelConfig = await getModelConfig(client);

    const sessionCreateResult = await client.session.create({
      body: { title: `ralph-opencode: ${featureSlug}` },
    });
    session = sessionCreateResult.data;

    process.stderr.write(`[opencode] session=${session.id} agent=${agentName}\n`);

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

    process.stderr.write(
      `[opencode] done cost=${info.cost} tokens=${info.tokens.input}+${info.tokens.output}\n`,
    );
  } finally {
    if (session) {
      await client.session.delete({ path: { id: session.id } }).catch(() => {});
    }
    close();
  }
}

await main();
