# JES-45 — Configure Reminder Consent by Age Band

Planning map for Linear [JES-45](https://linear.app/jesus-guti-workspace/issue/JES-45/configure-reminder-consent-by-age-band).  
Parent: [JES-37 Implement LoadZone Design Direction](https://linear.app/jesus-guti-workspace/issue/JES-37/implement-loadzone-design-direction).  
Doctrine: SPEC §5 · [reminders-streaks-and-health-escalation.md](../design-direction-wayfinder/artifacts/reminders-streaks-and-health-escalation.md) · DD-06 map HITL A locked.  
Blocked by: [JES-43](https://linear.app/jesus-guti-workspace/issue/JES-43/configure-age-band-cutoffs-and-guardian-policy) (Age Band cutoffs + Guardian policy surface).  
Blocks: [JES-47](https://linear.app/jesus-guti-workspace/issue/JES-47/deliver-rate-limited-guardian-care-alerts), [JES-48](https://linear.app/jesus-guti-workspace/issue/JES-48/enforce-anti-nag-reminder-bounds).

**Status:** HITL locked · implementing · **plan:** `hitl` · **risk:** alto · **HITL count:** 3

## Destination

Staff-configurable **Reminder Consent** defaults × Age Band on Team/Club policy, plus Player Web Push subscription UX that opts in / opts out / reflects Guardian-controlled consent under resolved Age Band rules — without implementing anti-nag schedulers (JES-48), Care Alert delivery (JES-47), or Guardian auth.

## Notes

- **Domain:** root `CONTEXT.md` — **Player**, **Team**, **PushSubscription** (browser push ≠ public access token). Age Band / Reminder Consent glossary may still be pending W0d; vocabulary follows SPEC §10 / DD-06.
- **Locked doctrine (do not reopen):** SPEC §5 consent×band matrix; configurability override (defaults only, never fixed-only); Player primary operator; miss path ≠ Care Alert; no SMS-to-Player default; Guardian delivery mech remains fog.
- **Code precedent (read-only):**
  - `@repo/push-notifications` — `subscribePush` / `unsubscribePush` / `sendPushToPlayer` (VAPID).
  - `apps/api/app/api/push/subscribe/route.ts` — resolves Player by `token`, upserts `PushSubscription` by endpoint; no Age Band / consent gate today.
  - `apps/player` — `PushPrompt` (always offers “Activar” when unsupported≠true and not already subscribed); `sw.js` push handler; token posted in subscribe body; `TokenPersistence` posts token to SW.
  - `Team` already has `preSessionReminderMinutes` / `postSessionReminderMinutes`; settings via `apps/app/features/settings` — no Reminder Consent / Age Band fields yet (JES-43 owns cutoffs + Guardian receive layer).
- **Security standing rule:** never expose or log player tokens (responses, UI, analytics, error payloads). Treat public player flows as security-sensitive.
- **Autonomy:** `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. Security/consent → `hitl`. Do not implement or commit from this planning wave.
- **Dependency:** implement after JES-43 policy substrate exists (or soft-stack merge tip). Consent defaults attach beside Age Band / Guardian policy; Player runtime reads resolved band from JES-43.

## Decisions so far

### Auto

1. **[auto] Defaults = SPEC §5 matrix** — Seed Reminder Consent defaults exactly as locked:

   | Age Band | Player reminders | Guardian miss + Care Alert receives |
   |---|---|---|
   | Assisted | Guardian consents | On (Guardian consents at setup) |
   | Guided | Player may opt in; Guardian can revoke Player push | On when layer active |
   | Independent 16–17 | Player consents | Only if club enables layer; then Guardian consents |
   | Independent 18+ | Player consents | Off by default |

2. **[auto] Always staff-retunable** — Consent×band values are policy defaults on Team/Club settings, never hard-coded fixed-only constants (configurability override).
3. **[auto] Reuse PushSubscription substrate** — Extend existing Web Push package + player subscribe route + `PushPrompt`; do not invent a second push stack.
4. **[auto] Token hygiene** — Keep token as player auth for subscribe (current pattern); never echo tokens in API error bodies, logs, UI copy, analytics, or staff surfaces. Prefer `playerId` internally after resolution.
5. **[auto] Server-side consent gate** — Subscribe (and any unsubscribe-by-player) must resolve Age Band + Reminder Consent policy before mutating `PushSubscription`; client-only gating is insufficient.
6. **[auto] Calm degradation** — Permission denial, missing VAPID, unsupported `PushManager`, and Guardian-blocked states hide or replace the CTA calmly (Spanish invitational copy); no modal spam, no guilt, no token leakage.
7. **[auto] Scope split with siblings** — This issue does **not** implement anti-nag caps/quiet hours (JES-48) or Guardian Care Alert / miss delivery pipelines (JES-47). Staff re-nudge remains existing ops control, still not a Guardian approval gate.
8. **[auto] Staff never “consents for” body data** — Staff configure defaults and timing; they do not substitute for Player/Guardian Reminder Consent on the Player’s wellness body data.
9. **[auto] Tests required** — Authorization on settings mutations; policy resolution per band; consent-transition cases (opt-in, opt-out, Guardian-blocked / Assisted no-independent-opt-in, Independent 16–17 layer off/on); subscribe rejected when policy forbids.
10. **[auto] UI conventions** — Player copy Spanish; staff settings use semantic tokens + invisible data-surface patterns; push chrome stays app-local (not `@repo/design-system` kit).

### Assume

11. **[assume] Team-scoped Reminder Consent policy** — Persist consent×band defaults on the active **Team** (same locus as reminder minute settings and expected JES-43 Age Band policy), not Club-only. Club-wide later can copy defaults into teams.  
    **Revert:** Club-level policy with optional Team override if multi-team clubs demand one knob.
12. **[assume] Effective consent = band policy ⊕ optional per-player flags (HITL C)** — Runtime: resolve Player Age Band (JES-43) → apply Team Reminder Consent row for that band → apply any per-player revoke/grant flags chosen in HITL C → decide whether `PushPrompt` may request permission / subscribe.  
    **Revert:** policy-defaults-only (no per-player flags) if HITL C chooses subscription-presence-only.
13. **[assume] Extend `PushPrompt` into consent-aware states** — Single app-local component (or thin sibling) covering: offer opt-in, already subscribed + opt-out, Assisted/Guardian-blocked calm note (no independent CTA), permission denied / unsupported calm note. Shown on today’s session surface as today.  
    **Revert:** split opt-in vs settings-row components if density or Assisted copy needs a dedicated surface.
14. **[assume] Opt-out deletes `PushSubscription` row(s) for that Player endpoint** — Unsubscribe removes the browser subscription + DB row; re-opt-in goes through consent gate again. Soft “paused” flag deferred.  
    **Revert:** soft-disable flag keeping endpoint if re-subscribe friction proves too high.
15. **[assume] Guardian miss/Care Alert receive toggles are policy fields only here** — Staff can retune the Guardian-receive defaults from the matrix; actual Guardian notification send is JES-47.  
    **Revert:** hide Guardian-receive knobs from this issue’s UI if JES-43 already exposes the full receive/escalation panel and duplication confuses staff — then JES-45 only owns Player-reminder consent columns + push UX.

### Hitl (locked 2026-08-04 — JES-45: ok)

16. **[hitl] Assisted consent + device subscribe** — Staff captures Guardian consent; adult-present device may subscribe; no independent child CTA (Option 1).
17. **[hitl] Guided Guardian revoke** — Staff supervision revoke + Player self opt-out; no Guardian portal (Option 1).
18. **[hitl] Consent persistence** — Team defaults + compact per-Player Reminder Consent state; PushSubscription = transport only (Option 2).

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | SPEC §5 default matrix | `auto` | Locked DD-06 HITL A / SPEC §5 |
| 2 | Staff-retunable defaults | `auto` | Configurability override locked |
| 3 | Reuse PushSubscription stack | `auto` | Code precedent |
| 4 | Token hygiene | `auto` | Standing security rule + AC |
| 5 | Server-side consent gate | `auto` | Security enforcement of policy |
| 6 | Calm degradation UX | `auto` | SPEC channels + AC |
| 7 | No anti-nag / Care Alert send | `auto` | Blocks JES-47/48; scope hygiene |
| 8 | Staff ≠ body-data consenter | `auto` | DD-06 locked wording |
| 9 | Auth / policy / transition tests | `auto` | AC |
| 10 | Spanish + semantic tokens + app-local push UI | `auto` | Repo conventions |
| 11 | Team-scoped policy locus | `assume` | Contained; matches Team reminder fields; reversible |
| 12 | Resolution pipeline shape | `assume` | Contained; depends on HITL C |
| 13 | Consent-aware PushPrompt | `assume` | Contained feature UX; reversible |
| 14 | Opt-out deletes subscription | `assume` | Contained; reversible |
| 15 | Guardian receive = policy fields only | `assume` | Contained; JES-47 owns send |
| 16 | Assisted subscribe under Guardian fog | `hitl` | Security / minors consent / externo |
| 17 | Guided revoke without Guardian portal | `hitl` | Security / consent / product capability |
| 18 | Consent persistence schema | `hitl` | Shared contract + consent semantics |

## HITL recommendations (for orchestrator → human)

### A. Assisted Player push while Guardian auth is fog

**Question:** For Assisted (Guardian consents; Player does not independently opt in), how may a `PushSubscription` be created before a Guardian product exists?

**Recommend: Option 1 — Staff-recorded Guardian consent + adult-present device subscribe**

- Staff (roster / Parental Supervision setup from JES-43 adjacency) records that the Guardian consented to Player reminders for that Assisted Player (or team-band default “Guardian consents” plus an explicit per-player “Guardian consent captured” flag).
- Browser permission + `PushSubscription` may then be created on the device used for Assisted Check-in (adult expected present) — CTA copy addresses the adult helper, not “the child opted in alone.”
- Independent Player opt-in CTA stays hidden for Assisted.

| Option | Meaning |
|---|---|
| **1 (recommend)** | Staff captures Guardian consent; adult-present device may subscribe |
| 2 | No Assisted push until Guardian auth/contact exists (Assisted = in-app calm reminders only) |
| 3 | Team-band default alone allows any Assisted device to subscribe without per-player consent capture |

**Why 1:** Matches SPEC (“Guardian consents”; adult present) without inventing Guardian login; keeps a real audit flag for minors; Option 3 is too weak for consent; Option 2 starves Assisted adherence until a fog dependency lands.

### B. Guided Guardian revoke without Guardian portal

**Question:** How does “Guardian can revoke Player push” work in v1?

**Recommend: Option 1 — Staff supervision revoke control + Player self opt-out**

- Guided Player may opt in / opt out in `apps/player` when policy allows.
- Staff can mark Player reminders **revoked under supervision** on the player/roster or policy surface (temporary stand-in for Guardian revoke). That blocks subscribe and deletes existing `PushSubscription` rows for that Player.
- True Guardian-facing revoke waits for Guardian auth (out of scope); do not build magic-link Guardian portal here.

| Option | Meaning |
|---|---|
| **1 (recommend)** | Staff revoke-as-supervision + Player opt-out |
| 2 | Defer revoke entirely; only Player opt-out until Guardian surface |
| 3 | Minimal Guardian magic-link revoke in this issue |

**Why 1:** Preserves the Guided supervision control from SPEC without expanding into Guardian auth fog (Option 3); Option 2 drops a locked capability with no staff escape hatch when a Guardian asks the club to stop pushes.

### C. Consent state persistence model

**Question:** What is stored beyond Team Reminder Consent defaults and `PushSubscription` rows?

**Recommend: Option 2 — Team defaults + compact per-Player Reminder Consent state**

- **Team:** JSON/columns for consent×band defaults (Player reminders mode + Guardian receive defaults), seeded from SPEC §5; staff-editable.
- **Player:** small explicit state enum (e.g. `eligible` / `opted_in` / `opted_out` / `guardian_blocked` / `assisted_guardian_granted`) consumed by subscribe gate and `PushPrompt`. `PushSubscription` remains the transport substrate, not the sole consent ledger.
- Migrations documented; existing teams get SPEC defaults; existing subscriptions remain until policy forbids (then delete on revoke/block).

| Option | Meaning |
|---|---|
| 1 | Team defaults only; subscription presence = opted in |
| **2 (recommend)** | Team defaults + per-Player Reminder Consent state |
| 3 | Full ConsentEvent audit log table in this issue |

**Why 2:** Guided revoke and Assisted Guardian-granted need durable state even when no push endpoint exists yet; Option 1 cannot express “revoked but browser still could subscribe”; Option 3 is irreversible weight beyond this slice (can graduate later).

## Not yet specified / deferred

- Guardian auth, contact channels, and Care Alert / miss **send** pipelines → JES-47 (+ Guardian fog).
- Anti-nag caps, quiet hours, staff re-nudge bounds → JES-48.
- Legal/jurisdictional marketing-style push copy for minors (policy fog from DD-06).
- Exact Spanish microcopy for Assisted adult-helper vs Guided/Independent (implementer drafts; content-design review optional).
- Age Band assignment/persistence (DOB vs manual) → owned by JES-43.
- Club vs Team inheritance UI polish if assume #11 is later reverted.

## Out of scope

- Implementing reminder schedulers, streak engines, or Care Alert delivery.
- Guardian portal / co-experience app.
- SMS-to-Player.
- Design-system promotion of push chrome.
- Reopening SPEC §5 matrix values (locked); only staff retune knobs + UX/persistence for those knobs.

## Acceptance checklist (for implementer after HITL lock)

- [x] Defaults match Assisted / Guided / Independent youth / Independent majority matrix (JES-43 cutoffs)
- [x] Staff can retune consent defaults without code changes
- [x] Player push opt-in/out respects resolved Age Band + Guardian policy (incl. HITL A/B)
- [x] Permission denial / unavailable / blocked states degrade calmly; tokens never exposed
- [x] Authorization, policy-resolution, and consent-transition tests cover each band

## Handoff for implementer (after human answers A/B/C)

1. Record HITL answers in **Decisions so far**; do not reopen auto/assume unless user revokes by number.
2. Soft-stack or merge JES-43 tip for Age Band + Guardian policy substrate before coding.
3. Add Team Reminder Consent defaults + Player consent state (per HITL C); seed SPEC defaults for existing teams.
4. Gate `POST /api/push/subscribe` (and opt-out path); evolve `PushPrompt` states; Spanish calm copy.
5. Staff settings section beside JES-43 Age Band / Guardian policy; semantic tokens; no token display.
6. Tests per AC; no scheduler/Care Alert send work.

## Human review

- **Orchestrator:** awaiting answers for HITL A/B/C (recommendations above).
- Suggested accept phrase: `JES-45: ok` (accept all auto/assume + A/B/C as recommended) or `JES-45: A → <option>`, etc.

### Human review (2026-08-04)
- **JES-45: ok** — accept HITL recommendations:
  - A → staff captures Guardian consent for Assisted; adult-present device may subscribe; no independent child CTA
  - B → staff supervision revoke + Player self opt-out; no Guardian portal
  - C → Team defaults + compact per-Player Reminder Consent state; PushSubscription = transport only
- Blocked by JES-43 until policy lands.
