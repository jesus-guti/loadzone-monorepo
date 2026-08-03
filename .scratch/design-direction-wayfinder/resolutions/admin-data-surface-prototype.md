# DD-04 — Admin data surface prototype reaction

**Ticket:** [Prototype the admin data surface](../design-direction-wayfinder/issues/04-prototype-the-admin-data-surface.md)  
**Verdict (2026-08-03):** **rejected as layout winner** — amend only sidebar icon size.

## Answer

Human reaction to the throwaway Wellness list prototype ([`../dd-04-admin-prototype/prototype/`](../dd-04-admin-prototype/prototype/)):

- **Reject** the prototype’s overall admin chrome / Wellness list layout as something to ship toward.
- **Keep** the current production `apps/app` look and data surfaces **as they are now** (exercise library / existing Wellness remain the live reference).
- **Keep from the prototype only:** **larger sidebar icons** (nav affordance size), nothing else.

DD-01 **doctrine** (invisible data surfaces, card exceptions, progressive interaction, light default) is **not** reopened by this reaction — only the throwaway layout is rejected as a pixel/layout winner. Implementation backlog must not treat DD-04 HTML as a screen to clone.

## Implications

- Soft visual accept for DD-04 → **closed: layout rejected**.
- Wave 1a (Wellness → invisible list from DD-04 evidence) → **deprioritize / do not clone DD-04**; optional later restyle only if staff ask, with live product as baseline.
- Narrow follow-up: bump Phosphor / sidebar icon size in `apps/app` shell when touching nav (not a full chrome redesign).
