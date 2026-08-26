/**
 * Player PWA SW uses cache-first for `/_next/*`. Turbopack reuses the same
 * CSS chunk URL across HMR, so a cached stylesheet in local `next dev`
 * looks like “CSS failed to load”. Production hashed URLs change per deploy.
 */
export function shouldRegisterPlayerServiceWorker(nodeEnv: string): boolean {
  return nodeEnv !== "development";
}

export function shouldCacheNextStaticAssets(hostname: string): boolean {
  return hostname !== "localhost" && hostname !== "127.0.0.1";
}
