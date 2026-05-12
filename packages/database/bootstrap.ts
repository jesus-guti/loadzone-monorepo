/**
 * Opt-in product bootstrap (DB writes beyond normal queries). Prefer `@repo/database` for reads/writes via `database`.
 */
import "server-only";

import { ensureBaseFormTemplatesWithDb } from "./bootstrap/base-form-templates";
import { database } from "./client";

export { ensureBaseFormTemplatesWithDb };

export async function ensureBaseFormTemplates(): Promise<void> {
  await ensureBaseFormTemplatesWithDb(database);
}
