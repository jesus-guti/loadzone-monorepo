import { getOrStartServer } from "./shared.mjs";

async function main() {
  const { client, close } = await getOrStartServer();

  try {
    const result = await client.config.providers({ throwOnError: true });
    const providers = result.data;

    for (const provider of providers) {
      console.log(`\n${provider.name} (${provider.id})`);
      console.log(`  key: ${provider.key ? "set" : "not set"}`);

      for (const [modelId, model] of Object.entries(provider.models)) {
        const cost = model.cost;
        const costStr = cost ? `$${cost.input}/${cost.output} per 1M tokens` : "";
        const status = model.status === "active" ? "" : ` [${model.status}]`;
        console.log(`  - ${provider.id}/${modelId}${status}  ${costStr}`);
      }
    }
  } finally {
    close();
  }
}

await main();
