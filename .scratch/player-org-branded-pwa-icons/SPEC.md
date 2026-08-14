# Player org-branded PWA icons — Specification

Status: **ready to implement**  
Date: 2026-08-11  
Map: [Player org-branded PWA icons](https://linear.app/jesus-guti-workspace/issue/JES-90/player-org-branded-pwa-icons) (JES-90)  
Assemble ticket: [Assemble branded PWA icons implementable spec](https://linear.app/jesus-guti-workspace/issue/JES-94/assemble-branded-pwa-icons-implementable-spec) (JES-94)

**Language:** English (this doc). Product UI copy remains **Spanish**.

This document is the **implementation-ready** contract for branded install icons and tab favicons on the player token PWA. It synthesizes locked wayfinder resolutions; it does **not** ship the feature by itself.

---

## 1. Purpose & destination

When a Player opens their token URL and adds LoadZone to the home screen (or views the tab), the launcher / favicon should show the **Club or Team crest** on an ambient gradient derived from that logo — not the generic LoadZone mark — whenever branded variants exist.

| Surface | In scope |
|---|---|
| Web App Manifest install icons (Android / Chromium) | Yes |
| `apple-touch-icon` (iOS Add to Home Screen) | Yes |
| Tab favicon on token routes | Yes |
| Manifest `name` / `short_name` | Stay **"LoadZone"** |
| Push notification icons (`sw.js`) | **No** (v1 cut) |

Domain vocabulary: **Club** and **Team** (no glossary term “organización”). Both may have `logoUrl`; cascade is Team → Club → LoadZone.

---

## 2. Standing locks (do not reopen)

| Lock | Source |
|---|---|
| Spec destination (not execution in this map) | Charting |
| Cascade **Team logo → Club logo → LoadZone** | Q2 |
| Surfaces = install + favicon only | Q3 |
| App label under icon stays **LoadZone** | Q4 |
| Generate PNG variants on logo upload; keep private Blob store for originals | Q5 |
| No product promise for post-install icon refresh | Q6 |
| Visual: ambient gradient from logo colors (spirit of `team-branding`) | Q7 |
| Club upload generates now; Team generation **hook contracted** for when Team upload UI exists | Q8 |
| Extract colors from logo at generation time (do not require `primaryColor` / `secondaryColor`) | Q9 |
| Second **public** Vercel Blob store (not mixed access on private store) | JES-91 |
| Look = **A padding + B gradient**; maskable uses **D safe-zone**; no plate (C) | JES-92 |
| Opaque HMAC paths; one resolved URL per size; absolute public base URL; 180 + favicon-from-192 | JES-93 |
| Store name `loadzone-pwa-icons`; envs wired locally + Vercel | JES-95 |

### V1 cuts (explicit non-goals)

- Push-notification icon branding.
- Renaming install label to Club/Team name.
- Promising icon refresh after install (iOS: remove/re-add; Android: best-effort platform behavior — note only in release notes / internal docs).
- Opening the private Blob store or changing `uploadImage` access modes.
- Team logo **upload UI** in this effort.
- Persisting extracted palette into unused `Club`/`Team` `primaryColor` / `secondaryColor`.
- New DB columns for icon URLs.
- **Backfill** job for clubs that already have logos (re-upload regenerates; optional later ticket).
- Staff-app favicon / install branding beyond triggering generation on Club logo upload.

---

## 3. Environment & storage

### Stores

| Store | Access | Role |
|---|---|---|
| Existing private Blob | private | Club/Team/Player/User images via `uploadImage` + `/api/blob` — **unchanged** |
| `loadzone-pwa-icons` | **public** | Generated PWA PNG variants only |

Research: [research-blob-public-icons.md](./research-blob-public-icons.md) (JES-91). Access is store-level and immutable; a pathname prefix cannot make private objects public.

### Environment variables

| Variable | Apps | Purpose |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | `apps/app` | Existing private store (unchanged) |
| `PWA_BLOB_READ_WRITE_TOKEN` | `apps/app` (write path) | Public store RW token |
| `PWA_BLOB_PUBLIC_BASE_URL` | `apps/app`, `apps/player` | CDN origin, e.g. `https://….public.blob.vercel-storage.com` (no trailing slash) |
| `PWA_ICON_PATH_SECRET` | `apps/app`, `apps/player` | HMAC secret for opaque path segments (same value both apps) |

Neon / `DATABASE_URL` is unrelated to Blob hosting. Staging tests use the staging deploy’s Vercel envs + whatever Neon branch that deploy already uses.

### `@repo/storage` additions

Add a **separate** helper (names illustrative): `uploadPublicPwaIcon` / `deletePublicPwaIcon` that:

1. Calls `put(pathname, body, { access: 'public', token: PWA_BLOB_READ_WRITE_TOKEN, addRandomSuffix: false, contentType: 'image/png', cacheControlMaxAge })`.
2. Returns the **absolute public URL** (do **not** run through private `resolveStorageUrl`).
3. Never changes `BLOB_STORE_ACCESS` or existing `uploadImage` call sites.

Wire `PWA_*` keys into `packages/storage/keys.ts` (and app `.env.example` when implementing).

---

## 4. Path convention & opaque ids

No DB URL columns. Paths live only on the public store:

```
pwa-icons/c/{opaqueHash}/180.png
pwa-icons/c/{opaqueHash}/192.png
pwa-icons/c/{opaqueHash}/512.png
pwa-icons/c/{opaqueHash}/512-maskable.png

pwa-icons/t/{opaqueHash}/…   # Team, when Team logo generation runs
```

### opaqueHash

```
opaqueHash = hex( HMAC-SHA256(PWA_ICON_PATH_SECRET, `${kind}:${entityId}`) ).slice(0, 32)
```

- `kind` is `club` or `team`.
- Truncation length: **32 hex chars** (16 bytes) — enough to avoid casual collision; stable across regenerations for the same entity.
- Staff (writer) and player (resolver) must share the same secret and algorithm.

Absolute URL:

```
{PWA_BLOB_PUBLIC_BASE_URL}/pwa-icons/{c|t}/{opaqueHash}/{filename}
```

### Replace semantics (v1)

On logo upload or delete, **overwrite** the fixed filenames above (`addRandomSuffix: false`). Do not timestamp path segments in v1. Rely on Blob `cacheControlMaxAge` (recommend ≤ 1 day for icons, or shorter if ops prefer faster CDN refresh). Document that iOS home-screen icons still won’t refresh without re-add.

---

## 5. Generation pipeline

### Trigger

| Event | Action |
|---|---|
| Club logo uploaded / replaced (`apps/app` club branding settings) | Fetch private logo bytes → generate 4 PNGs → `put` to public paths for that Club hash; delete previous public objects if hash somehow changed (it shouldn’t if id stable) |
| Club logo removed | Delete the four public objects for that Club hash |
| Team logo uploaded / replaced | **Same pipeline** when Team upload exists; **not** in UI scope of this effort — leave a named hook / shared function ready |
| Team logo removed | Delete Team public objects |

Generation runs **server-side** in the staff app after successful private `uploadImage` (or in the same action transaction boundary — prefer “after private upload succeeds”, best-effort log on public put failure so staff logo still saves).

### Visual recipe (locked)

Prototype: [prototype/](./prototype/) · branch `prototype/ambient-pwa-icons` · Vimenor gallery.

| Output | Canvas | Logo fraction | Gradient intensity | Plate |
|---|---|---|---|---|
| `180.png`, `192.png`, `512.png` (`purpose: any`) | square PNG, opaque | **0.82** (A) | **strong** (B) | none |
| `512-maskable.png` (`purpose: maskable`) | square PNG, opaque | **0.56** (D safe-zone) | **strong** (B) | none |

- Background: layered radial ambient gradients from dominant logo colors (port spirit of `apps/app/components/layouts/team-branding.tsx` / prototype `palette.mjs` + `generate.mjs`).
- Export **fully opaque** PNGs (no transparency) — required for reliable maskable / iOS behavior.
- Color extraction runs **server-side at generation** (v1: port/adapt prototype `palette.mjs`; sharing a package with client `team-branding` is optional later, not required).

### Fallback LoadZone assets

Ship real static files under `apps/player/public/` (referenced today but missing):

- `/icon-192.png`
- `/icon-512.png`

Optional: `/apple-touch-icon.png` (180) as static LoadZone default. Maskable may reuse `/icon-512.png` with `purpose: maskable` for the default-only case.

---

## 6. Player resolution & metadata wiring

### Cascade (server)

Given player token → Player → Team (+ Club):

1. If `Team.logoUrl` is set **and** public Team variants are expected to exist → use `pwa-icons/t/{hashTeam}/…`.
2. Else if `Club.logoUrl` is set → use `pwa-icons/c/{hashClub}/…`.
3. Else → static LoadZone `/icon-*.png`.

Emit **one URL per size** (do not list Team and Club as alternate manifest icons).

v1 practical note: until Team upload + generation ship, step 1 never wins in production; still implement the branch so the cascade is real.

### Existence check (v1)

Build absolute URLs from convention. Do **not** require DB flags. Optional cheap HEAD is **out of v1**; if variants were never generated (logo uploaded before feature), user sees broken icon until re-upload — acceptable under backfill cut. Prefer documenting “re-save club logo once after deploy”.

### Manifest (`apps/player/app/manifest.json/route.ts`)

Keep token-scoped `start_url` / `scope`. When token valid:

- `name` / `short_name`: `"LoadZone"`
- `icons`:
  - 192 `any` → resolved 192 URL
  - 512 `any` → resolved 512 URL
  - 512 `maskable` → resolved maskable URL

Resolve branding inside the route (load player by token → team/club ids → hashes → URLs), not only via query string beyond the existing token param.

### Token layout metadata (`apps/player/app/[token]/layout.tsx` `generateMetadata`)

- `manifest`: keep `/manifest.json?token=…`
- `icons` / favicon: 192 (and optionally 180) from resolved cascade
- `appleWebApp` / apple-touch: **180** from cascade
- `appleWebApp.title`: `"LoadZone"`

### Service worker

Leave `sw.js` notification `icon` / `badge` on LoadZone static paths (v1 cut).

---

## 7. Security

- Public icons are **intentionally** world-readable (OS installers fetch without cookies).
- Opaque HMAC paths avoid putting raw `clubId` / `teamId` on a public CDN if those ids later appear in other public APIs.
- Do not expose `PWA_ICON_PATH_SECRET` or RW tokens to the client bundle.
- Do not serve private logo bytes through a new anonymous proxy; only generated public PNGs.

---

## 8. Implementation sketch (suggested modules)

Non-normative layout for implementers:

| Piece | Suggested home |
|---|---|
| HMAC path helper | `@repo/storage` or small `@repo/storage/pwa-icons` util shared by app + player |
| Public put/del | `@repo/storage` new helpers |
| Palette + rasterize | `apps/app` server module (or `packages/storage` if pure Node) using `sharp` |
| Hook after club logo upload | `apps/app/features/settings/actions/…` (existing club logo action) |
| Manifest + metadata | `apps/player` as §6 |
| Static fallbacks | `apps/player/public/icon-192.png`, `icon-512.png` |

---

## 9. Acceptance criteria

1. After uploading a Club logo in staff settings, four public PNGs appear under `pwa-icons/c/{hash}/` on `loadzone-pwa-icons` and open without auth.
2. Player token session manifest `icons` and apple-touch / favicon point at those URLs (or LoadZone static if no club logo).
3. Home-screen add on Android uses branded 192/512; iOS A2HS uses branded 180 when supported.
4. Manifest name remains LoadZone.
5. Private logo upload path and `/api/blob` behavior unchanged for non-PWA images.
6. Removing Club logo removes (or stops resolving) branded public icons and falls back to LoadZone static.
7. Push notification icon still LoadZone default.

---

## 10. Test plan (manual)

1. Upload CF Vimenor (or any crest) as Club logo on staging/local with envs set.
2. Open public URLs for 180/192/512/maskable in a private window.
3. Open player token URL → inspect `<link rel="manifest">` and favicon / apple-touch.
4. Android Chrome install (or DevTools Application → Manifest).
5. iOS Safari Add to Home Screen — confirm crest (not LoadZone) when variants exist.
6. Delete Club logo → confirm fallback icons.
7. Confirm `sw.js` push still shows LoadZone icon.

---

## 11. Open follow-ups (post-spec, not blocking destination)

- One-shot **backfill** for existing `Club.logoUrl` rows.
- Team logo upload UI + call generation hook.
- Extract shared color-extraction package used by sidebar + generator.
- Shorter cache / versioned filenames if CDN stickiness bites.
- Dedicated 32×48 favicons if browsers mishandle 192 downscale.

---

## 12. Sources

| Artifact | Path / link |
|---|---|
| Map | [JES-90](https://linear.app/jesus-guti-workspace/issue/JES-90/player-org-branded-pwa-icons) |
| Blob research | [research-blob-public-icons.md](./research-blob-public-icons.md) · [JES-91](https://linear.app/jesus-guti-workspace/issue/JES-91) |
| Visual prototype | [prototype/](./prototype/) · [JES-92](https://linear.app/jesus-guti-workspace/issue/JES-92) |
| Wiring grilling | [JES-93](https://linear.app/jesus-guti-workspace/issue/JES-93) |
| Store provision | [JES-95](https://linear.app/jesus-guti-workspace/issue/JES-95) |
| Ambient UI reference | `apps/app/components/layouts/team-branding.tsx` |
| Current manifest | `apps/player/app/manifest.json/route.ts` |
