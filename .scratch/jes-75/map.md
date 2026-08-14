# JES-75 — Staff shell: single initial loader + route prefetch, drop page skeletons

Planning/implementation map for [Staff shell: single initial loader + route prefetch, drop page skeletons](https://linear.app/jesus-guti-workspace/issue/JES-75/staff-shell-single-initial-loader-route-prefetch-drop-page-skeletons).  
Route: `plan:auto` · Risk: medium · Area: `apps/app` authenticated shell.

## Destination

Staff navigations feel instant and calm: one initial shell loader (empty sidebar slot + empty main card + centered spinner), no multi-block fake-dashboard skeletons on route changes, primary nav prefetched via Next.js Link/router.

## Decisions so far

### Assumed (grilling — do not reopen)

1. **[assume] Scope = authenticated staff shell only** — Especially `app/(authenticated)/loading.tsx` and any feature full-page skeletons that mimic the whole layout. No player app changes.
2. **[assume] Prefetch = Next.js Link / `router.prefetch`** — Primary (and equivalent) nav destinations only; not a new data layer.
3. **[assume] In-component loading may remain** — Tables, dialogs, row actions keep spinners/skeletons. Ban is full-page generic skeletons after first paint.
4. **[assume] Initial load UI shape** — Empty sidebar slot + empty main card + centered loader in the main card (not multi-block fake dashboard).

### Auto (implementation)

5. **[auto] Initial loader = Suspense fallback around auth+shell; nested null Suspense around pages** — Outer fallback is empty sidebar slot + empty main card + centered `Spinner` while `getCurrentStaffContext` + `GlobalSidebar` resolve. Inner `<Suspense fallback={null}>` around `children` so soft navigations do not remount the empty shell. Delete route-level multi-block `loading.tsx`.
6. **[auto] Keep existing sidebar/mobile Link `prefetch` + mount `router.prefetch`** — Already present on primary/secondary/settings nav; do not invent a fetch cache.
7. **[auto] Update `loadzone-loading-ux.mdc`** — Staff shell: no full-page generic skeletons after first paint; prefer prefetch + previous UI; Spinner for the single initial shell wait; Skeletons only for in-component islands.

## Out of scope

- Player app loading.
- Sidebar content redesign (labels, IA, icons beyond prefetch).
- Removing dialog/table/row pending UI.
