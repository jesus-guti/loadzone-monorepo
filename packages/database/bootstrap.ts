/**
 * Opt-in product bootstrap (DB writes beyond normal queries). Prefer `@repo/database` for reads/writes via `database`.
 *
 * System form templates (`system-wellness-pre`, `system-tqr-pre`, `system-rpe-post`) are inserted by Postgres migration
 * `packages/database/prisma/migrations/20260512183000_seed_base_form_templates` and mirrored in `bootstrap/base-form-templates.ts`.
 * Provision fresh databases with migrations (`pnpm exec prisma migrate deploy` against `packages/database/prisma/schema.prisma`).
 * Keeping `ensureBaseFormTemplates*` lets onboarding, staff mutations, or `pnpm bootstrap` refresh rows without attaching
 * that write workload to sensitive player token read routes.
 */
import "server-only";

import { ensureBaseFormTemplatesWithDb } from "./bootstrap/base-form-templates";
import { database } from "./client";

export { ensureBaseFormTemplatesWithDb };

export async function ensureBaseFormTemplates(): Promise<void> {
  await ensureBaseFormTemplatesWithDb(database);
}
