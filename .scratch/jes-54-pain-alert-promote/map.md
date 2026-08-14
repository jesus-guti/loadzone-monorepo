# JES-54 — Pain Alert Sheet + staff promote to Injury

Status: planned  
Ticket: [Pain Alert Sheet + staff promote to Injury](https://linear.app/jesus-guti-workspace/issue/JES-54/pain-alert-sheet-staff-promote-to-injury)  
Parent: [Injury logging wayfinder](https://linear.app/jesus-guti-workspace/issue/JES-28) · [JES-33](https://linear.app/jesus-guti-workspace/issue/JES-33/decide-fate-of-player-injury-self-report)  
Blocked by: [JES-50](https://linear.app/jesus-guti-workspace/issue/JES-50/schema-injury-bodyregion-pain-alert-migrate-and-catalog)  
Related: [JES-51](https://linear.app/jesus-guti-workspace/issue/JES-51) (staff log Injury), [JES-52](https://linear.app/jesus-guti-workspace/issue/JES-52) (team list), [JES-47](https://linear.app/jesus-guti-workspace/issue/JES-47) (Care Alert hook)  
Branch / worktree: `jgutierrez/jes-54-pain-alert-promote` · `worktrees/rely/jes-54`

**Route:** `plan: auto` · **Risk:** medium · **HITL count:** 0

## Destination

Player session-footer Sheet remains a **Pain Alert** (aviso) intake path: persist only a Pain Alert, never an official **Injury**, never derive `INJURED`, never exempt wellness. Staff can **explicitly promote** a Pain Alert into an Injury via the staff create flow with prefilled cause/severity/notes when available; after promote the alert is no longer treated as an open official period. Care Alert evaluation stays hooked on player Pain Alert persist when Parental Supervision allows; staff promote / Injury create does **not** emit Care Alerts (JES-47 HITL C).

## Notes

- **Doctrine:** [SPEC.md](../injury-logging-wayfinder/SPEC.md) §3 Pain Alert · [player-injury-self-report-fate.md](../injury-logging-wayfinder/resolutions/player-injury-self-report-fate.md) (JES-33: A → pain alert) · [injury-domain-model.md](../injury-logging-wayfinder/resolutions/injury-domain-model.md) (Injury requires ≥1 BodyRegion + cause + startDate) · root `CONTEXT.md` Injury / Pain Alert.
- **Care Alerts (locked, do not reopen):** JES-47 HITL A/C — `INJURY_PAIN` from player Pain Alert (+ check-in flags); **no** Care Alert from staff-opened Injury. Hook already lives in `apps/player/.../save-injury.ts` → `evaluateAndEmitCareAlert({ signals: { painAlert } })`. JES-49: Guardian payload excludes title/description/severity; structured location only.
- **Code reality (this worktree, pre–JES-50):** Footer Sheet in `session-page.tsx` → `InjuryReportForm` → `saveInjuryReport` creates `InjuryReport` with `reportedByPlayer: true`. Sheet trigger/title still say “Reportar lesión”; CTA is already “Enviar aviso”. Staff `/injuries` still treats all `InjuryReport` rows as one list with REPORTED/UNDER_REVIEW/RESOLVED — no promote.
- **Sibling ownership:** JES-50 owns Pain Alert / Injury schema + status helpers. JES-51 owns Registrar lesión body-map create/close/edit. JES-52 owns team list + distinct badges (may stub promote). **This issue owns** player Sheet rewrite + real promote action + Care Alert hook documentation.
- **Soft-stack:** Implement after (or soft-merge tip of) JES-50. Soft-merge JES-51 tip if promote reuses profile create UI; soft-merge JES-52 if list hosts the CTA.
- **Autonomy:** `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. Planning only — no product code, no commit.
- **Design system:** Reuse existing `Sheet` / `Button` primitives; Spanish product copy; Phosphor via `/ssr` in RSC and client-safe imports in client forms; no new shared DS composites; no body-map on player.

## Decisions so far

### Auto

1. **[auto] Player persist = Pain Alert only** — `saveInjuryReport` (rename) must create/update **Pain Alert**, never `Injury`. No call to INJURED derive helpers on this path. Reason: JES-33 / SPEC §3 / AC.

2. **[auto] Keep session-footer Sheet + aviso framing** — Retain bottom Sheet entry from `session-page.tsx`. Align trigger/title/description Spanish copy away from “Reportar lesión” toward molestia / aviso (CTA already “Enviar aviso”). Do not add player body map. Reason: JES-33 locked; SPEC §3.

3. **[auto] Player form fields stay free-text intake** — Keep title (required), optional zona free text, severity, optional detalles. Do not bind player to BodyRegion catalog in v1. Reason: JES-33 keep Sheet; BodyRegion map is staff (JES-51).

4. **[auto] INJURED / exemption only after staff Injury exists** — Pain Alert alone must not change `Player.status` or wellness day state. Status derive stays on Injury create/close (JES-50 helpers); exemption display/reminders are JES-53 but this path must not invent exemption. Reason: AC + SPEC.

5. **[auto] Promote is explicit staff action that creates Injury** — One-click “become Injury” without staff confirming required Injury fields is forbidden (Injury needs ≥1 BodyRegion + cause + startDate). Promote opens/reuses the staff Injury create path (JES-51) with prefill, then save runs normal Injury create + status derive. Reason: JES-30 domain.

6. **[auto] Promote does not leave alert as official period** — After successful Injury create from promote, the Pain Alert must leave the open-triage set and must never be queryable as an active Injury / INJURED source. Reason: AC.

7. **[auto] Care Alert hook — document and keep on player path only** — Keep `evaluateAndEmitCareAlert` after successful Pain Alert persist (policy-gated). Document in code comment + this map: Parental Supervision Layer on ∧ Care receive → may emit `INJURY_PAIN`; staff promote / Injury create **must not** call Care Alert emit (JES-47 HITL C). Reason: issue What-to-build + locked HITL C.

8. **[auto] Boundary with JES-52 / JES-51** — JES-54 ships the promote server action + prefill wiring; JES-52 presents Pain Alerts distinctly and may host the CTA; JES-51 owns body-map create chrome. Do not rebuild a second staff Injury form inside this issue. Reason: BACKLOG IL-3b / JES-52 stub note.

9. **[auto] Soft-stack JES-50 before implement** — Schema/migration/Pain Alert model + Injury helpers come from JES-50. Soft-merge tip if needed. Reason: Linear blocked-by.

10. **[auto] Tests required** — (1) player submit creates Pain Alert, zero Injury rows, status unchanged; (2) promote creates Injury and alert is no longer open/official; (3) Care Alert evaluation still invoked on player path with `painAlert` signal shape; (4) promote/Injury create path does not emit Care Alert. Reason: AC + Care Alert contract.

11. **[auto] Internal rename** — Prefer `PainAlertForm` / `savePainAlert` (or equivalent) over `InjuryReport*` on the player path once schema lands. Reason: CONTEXT vocabulary; avoid half-dead InjuryReport naming.

12. **[auto] No DS promotion / no parent portal** — App-local player Sheet + staff feature actions only. Care Alerts already exist; do not invent Guardian UI. Reason: design-system ADR 0001; SPEC non-goals.

### Assume

13. **[assume] Post-promote Pain Alert state = promoted + link, not delete** — Persist a terminal triage state (e.g. `PROMOTED` / equivalent from JES-50) plus `promotedToInjuryId` (or FK). Retain row for staff audit/history; exclude from open triage.  
    **Revert:** soft-delete or `DISMISSED` without FK if JES-50 model uses a simpler enum; never keep promoted alerts in the “open official” Injury set.

14. **[assume] Prefill mapping (no fuzzy BodyRegion match)** — On promote: `cause` ← alert title; optional staff notes or detalle ← description; `severity` ← alert severity when present; `startDate` default today in `Team.timezone`; **BodyRegions left empty for staff to select** on the map (free-text `bodyPart` may show as hint copy only, not auto-mapped catalog ids).  
    **Revert:** add best-effort catalog match later if bodyPart strings prove reliable; never invent an `OTHER` region.

15. **[assume] Promote CTA placement** — Primary CTA on the Pain Alert row/section in team `/injuries` (JES-52 surface) and/or player profile triage; navigates to JES-51 Registrar lesión with prefill state (query/searchParams or server-loaded alert id).  
    **Revert:** inline promote dialog that embeds the same create action if navigation UX feels heavy — still one create path.

16. **[assume] Schema expectations for JES-50 (soft contract note, not owned here)** — Pain Alert must support: player create fields used today; triage/promoted state; optional link to Injury; query “open triage alerts” vs promoted. Injury create helpers already derive INJURED.  
    **Revert:** if JES-50 chooses reshape names/fields, adapt promote action mapping only — behavior above stays.

### HITL

None — doctrine (JES-33 / JES-30 / JES-47 C) + AC close the product surface. `plan: auto`.

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | Player → Pain Alert only | `auto` | JES-33 / AC |
| 2 | Keep Sheet; aviso copy | `auto` | JES-33 locked |
| 3 | Free-text player fields | `auto` | No player body map |
| 4 | No INJURED/exemption from alert | `auto` | AC / SPEC |
| 5 | Promote → staff Injury create | `auto` | JES-30 required fields |
| 6 | Alert leaves official/open period | `auto` | AC |
| 7 | Care Alert on player only; document | `auto` | JES-47 HITL C |
| 8 | Split vs JES-51/52 | `auto` | Backlog ownership |
| 9 | Soft-stack JES-50 | `auto` | Linear graph |
| 10 | Tests per AC + Care Alert | `auto` | AC |
| 11 | Rename player path symbols | `auto` | CONTEXT vocabulary |
| 12 | No DS / no Guardian portal | `auto` | ADR / SPEC |
| 13 | Promoted + FK, retain audit | `assume` | Contained; reversible |
| 14 | Prefill cause/sev; no region auto-map | `assume` | Contained; reversible |
| 15 | CTA on list/profile → create flow | `assume` | Contained; reversible |
| 16 | Soft schema expectations for JES-50 | `assume` | Parent owns schema |

## Care Alert hook (documentation deliverable)

| Path | Care Alert? | Notes |
|---|---|---|
| Player Pain Alert save | **Yes** (policy-gated) | Keep `evaluateAndEmitCareAlert` + calm confirm (“Tu equipo ya lo tiene”). Structured location only on Guardian payload (JES-49). |
| Staff promote → Injury | **No** | Create Injury via staff helpers only; do not pass `painAlert` or staff Injury into Care Alert emit (JES-47 HITL C). |
| Staff Registrar lesión (no promote) | **No** | Same as JES-47 C — out of this issue’s emit set. |

Implementer: leave a short English maintainer comment on both player save and promote action pointing at JES-47 HITL C + this table.

## Out of scope

- Schema/migration/catalog/status helpers (JES-50).
- Full Registrar lesión body-map chrome, close/edit/reopen (JES-51).
- Team list layout/badges beyond what’s needed to attach promote (JES-52).
- Wellness EXEMPTED / reminder suppression / streak freeze (JES-53) — only the guarantee that Pain Alert alone does not exempt.
- Profile injury history map (JES-55).
- Dismiss-without-promote / ignore triage flows (unless trivial alongside promote state).
- Fuzzy NLP BodyRegion mapping; player body map; parent injury portal.
- Reopening JES-47 Care Alert source set or quiet-hours rules.

## Implementation sketch (after JES-50)

1. Soft-merge JES-50 tip; confirm Pain Alert model + promoted link + Injury create helpers.
2. Player: rename form/action; write Pain Alert only; keep Care Alert evaluate; fix Sheet Spanish aviso copy; close Sheet on success.
3. Staff: `promotePainAlert` (or equivalent) loads alert → builds prefill → creates Injury via shared create path (or redirects into JES-51 UI with `painAlertId`); marks alert promoted + FK; revalidate `/injuries` + player profile.
4. Wire CTA from JES-52 list (or profile) to promote/prefill entry.
5. Tests per decision #10; assert no Care Alert emit on promote.
6. Maintainer comments for Care Alert hook table above.

## Human review

- **Orchestrator:** no HITL — ready to implement after JES-50 (soft-merge OK).
- Suggested accept phrase: `JES-54: ok` (accept all auto/assume).

### User acceptance

**User:** `JES-54: ok` (2026-08-04) — all auto/assume accepted; implement after soft-merge blocker tip.
