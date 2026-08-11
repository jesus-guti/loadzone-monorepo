# Research: public PWA icon Blob hosting vs private logos

**Ticket:** [JES-91](https://linear.app/jesus-guti-workspace/issue/JES-91/research-public-pwa-icon-blob-hosting-vs-private-logos)  
**Parent map:** [JES-90](https://linear.app/jesus-guti-workspace/issue/JES-90/player-org-branded-pwa-icons)  
**Date:** 2026-08-11  
**Worktree:** `/Users/jesus-guti/Code/personal/worktrees/loadzone/player-org-branded-icons`  
**Branch:** `research/pwa-icon-blob-hosting`

## Question

Can LoadZone keep club/team/player logos on the existing **private** Vercel Blob store while writing **public** PWA icon variants under a dedicated prefix (e.g. `pwa-icons/…`), without flipping access on current `uploadImage` call sites?

If a single store cannot mix access modes, what is the minimal second-store (or alternate public hosting) approach that still leaves private uploads unchanged?

## Verdict

**No — a pathname prefix cannot make objects public inside a private store.** Access mode is a store-level, immutable setting. Prefixes only organize objects; they do not change read delivery.

**Minimal path that leaves private uploads unchanged:** provision a **second Blob store with access `public`**, connect it to the same Vercel projects with a **distinct token env var**, and add a **separate** `@repo/storage` write helper that calls `put(..., { access: 'public', token: … })`. Keep `BLOB_STORE_ACCESS = "private"`, `uploadImage`, `getPrivateBlob`, and `/api/blob` exactly as they are today.

---

## Primary sources (Vercel Blob)

### Store-level access (immutable)

Official overview:

> Files are private or public **depending on the store you create**. The access mode defines how files are accessed and delivered. […] you **cannot change it after the creation of a blob store**.

Source: [Vercel Blob — Private and public storage](https://vercel.com/docs/vercel-blob#private-and-public-storage) (docs last updated 2026-07-15).

| | Private storage | Public storage |
| --- | --- | --- |
| Write | Authenticated | Authenticated |
| Read | Authenticated (token required) | Anyone with the URL |
| Delivery | Through Functions via `get()` | Direct blob URL |
| Best for | Sensitive / user content | Large media, images, public assets |

Same constraint in the first-party guide:

> Each store is either public or private, and you **cannot change its access mode after creating it**.

Source: [The Complete Guide to Vercel Blob](https://vercel.com/kb/guide/vercel-blob) (updated 2026-07-29).

### Explicit guidance when an app needs both modes

> You select a store's access mode, public or private, when you create it. **If your app needs both public and private files, provision two separate stores from the start.** Public blobs serve directly, and private blobs route their reads through the function.

Source: [How to upload and store files with Vercel](https://vercel.com/kb/guide/how-to-upload-and-store-files-with-vercel) (updated 2026-07-28).

### Multiple stores per project

Official overview also states:

- You can have one or more Vercel Blob stores per account  
- **You can use multiple Vercel Blob stores in one Vercel project**  
- Each store can be accessed by multiple projects  

Source: [Vercel Blob — Using Vercel Blob in your workflow](https://vercel.com/docs/vercel-blob#using-vercel-blob-in-your-workflow).

### SDK `access` is not a per-object override

The SDK requires `access: 'private' | 'public'` on `put` / `get` / `copy` / client `upload`, but:

> **While the store itself determines whether files are private or public**, most SDK methods require you to pass `access: 'private'` or `access: 'public'`. This makes it explicit in your code what kind of data access you're dealing with…

Source: [Using the Vercel Blob SDK — The `access` parameter](https://vercel.com/docs/vercel-blob/using-blob-sdk#the-access-parameter).

Implication for LoadZone: calling `put('pwa-icons/…', file, { access: 'public' })` against the **existing private store token** does **not** create a CDN-public object. The store’s mode wins; the SDK `access` flag must **match** that store. Public uploads need a public-store credential (and `access: 'public'`).

Returned URLs also encode the mode:

- Private: `https://<store>.private.blob.vercel-storage.com/<pathname>`  
- Public: `https://<store>.public.blob.vercel-storage.com/<pathname>`  

Source: SDK `put` examples / note in [using-blob-sdk](https://vercel.com/docs/vercel-blob/using-blob-sdk#put); public delivery docs in [Public Storage](https://vercel.com/docs/vercel-blob/public-storage).

### Prefixes are organizational only

Path prefixes (folders) are for pathname layout and `list({ prefix })` filtering — not ACL. Docs show `prefix` as a list filter and recommend folder segments in pathnames for organization; nowhere do they attach public/private to a prefix.

Sources: [Vercel Blob — Folders](https://vercel.com/docs/vercel-blob) / SDK [`list` `prefix`](https://vercel.com/docs/vercel-blob/using-blob-sdk#list).

### Auth for a second store without clobbering the first

Authentication priority for SDK calls ([using-blob-sdk — Authentication](https://vercel.com/docs/vercel-blob/using-blob-sdk#authentication)):

1. Explicit `token` option (**always wins**, including over OIDC)  
2. OIDC (`VERCEL_OIDC_TOKEN` + `BLOB_STORE_ID` / `storeId`)  
3. `process.env.BLOB_READ_WRITE_TOKEN`

When creating a store, the dashboard allows a **custom Environment Variable prefix** under Advanced Options (default `BLOB_READ_WRITE_TOKEN`). That is the intended way to connect a second store without overwriting the private store’s default token name.

Source: [using-blob-sdk — Create a Blob store](https://vercel.com/docs/vercel-blob/using-blob-sdk) step 5 (“update the prefix of the Environment Variable in Advanced Options”).

OIDC note: a connected project’s default `BLOB_STORE_ID` targets **one** store. For dual-store server uploads, prefer an **explicit read-write token** for the public store on every public `put`/`del`, so private OIDC/`BLOB_READ_WRITE_TOKEN` paths stay untouched.

---

## Local `@repo/storage` constraints

Inspected in this worktree:

| Piece | Behavior |
| --- | --- |
| `packages/storage/index.ts` | `BLOB_STORE_ACCESS = "private" as const` with comment that access **must match** the Vercel Blob store; `uploadImage` / `getPrivateBlob` always pass that constant |
| `packages/storage/shared.ts` | `resolveStorageUrl` rewrites private absolute URLs / pathnames to `/api/blob?pathname=…`; leaves other absolute URLs alone (so `.public.blob…` URLs would pass through) |
| `packages/storage/keys.ts` | Only `BLOB_READ_WRITE_TOKEN` today |
| `apps/app/app/api/blob/route.ts` | Staff `currentUser()` required; only allows pathnames matching `isPrivateImagePathname` (`clubs/` \| `teams/` \| `users/`) |
| Call sites | `uploadImage` used from club/team settings, player photo, profile — all private logo/avatar flows |
| Tests | `__tests__/upload-image-access.test.ts` asserts `access: "private"` and proxy URL shaping |
| Dependency | `@vercel/blob` `^2.3.3` (private storage supported; docs require SDK ≥ 2.3 for private) |

**Why “same store + `pwa-icons/` prefix” fails product-wise as well as platform-wise:**

1. Objects would still be `.private.blob…` and require authenticated `get()`.  
2. Staff `/api/blob` requires Clerk staff auth and rejects pathnames outside `clubs|teams|users` — unsuitable for player home-screen / OS installers fetching manifest icons anonymously.  
3. Opening a public proxy for private logos would undermine the private-store decision for those bytes.

`resolveStorageUrl` already treats non-private absolute URLs as displayable as-is, so **storing the public blob `url` (or a pathname convention that the player app resolves to that absolute URL)** does not require changing private logo display.

---

## Recommended approach (map decision)

### Do this

1. **Keep** the existing private Blob store + `uploadImage` / `BLOB_STORE_ACCESS` / `/api/blob` unchanged.  
2. **Create** a second Blob store with **Public** access (`vercel blob create-store … --access public` or dashboard).  
3. Connect it to `apps/app` and `apps/player` (and any env that generates icons) with a **non-default env prefix**, e.g. `PWA_BLOB_READ_WRITE_TOKEN` / `BLOB_PUBLIC_READ_WRITE_TOKEN`.  
4. Add a **new** storage API (name illustrative only — not implemented here), e.g. `uploadPublicPwaIcon` / `deletePublicPwaIcon`, that:
   - calls `put(pathname, body, { access: 'public', token: publicToken, addRandomSuffix: false, cacheControlMaxAge, contentType })`
   - returns the **absolute public URL** (do not run it through private `resolveStorageUrl` rewriting)
   - uses path convention `pwa-icons/{clubId|teamId}/…` **inside the public store** (prefix still useful for list/delete hygiene; access comes from the store, not the prefix)
5. Wire generation on Club logo upload (and contracted Team hook) to that helper only — **do not** change existing `uploadImage` call sites’ `access` option.

### Avoid

- Flipping the current store to public (would expose all logos/avatars).  
- Calling `access: 'public'` with the private store token expecting mixed objects.  
- Serving install icons through staff `/api/blob`.  
- Relying on short-lived signed URLs for PWA icons (installers need durable, unauthenticated URLs).

### Acceptable alternate (usually worse)

Host static LoadZone defaults under `apps/player/public` (already the fallback story). That does **not** replace dynamic club/team branded variants; it only covers the cascade tail. A public Blob store remains the right place for generated PNGs.

---

## Implications for JES-90 “Not yet specified”

| Open item | Research answer |
| --- | --- |
| Whether mixed public+private objects in one Vercel Blob store are allowed | **Not allowed.** Access is store-scoped and immutable. |
| Path convention `pwa-icons/…` | Still recommended, but as pathname layout **on a public store**, not as a way to “carve out” public objects from the private store. |
| Private logo uploads | **Unchanged** — no call-site access flip. |

Parent map should append under **Decisions so far** (parent session): second public Blob store + separate upload helper; keep private store/call sites as-is.

---

## Citations (quick list)

1. https://vercel.com/docs/vercel-blob#private-and-public-storage  
2. https://vercel.com/docs/vercel-blob#using-vercel-blob-in-your-workflow  
3. https://vercel.com/docs/vercel-blob/using-blob-sdk#the-access-parameter  
4. https://vercel.com/docs/vercel-blob/using-blob-sdk#authentication  
5. https://vercel.com/docs/vercel-blob/public-storage  
6. https://vercel.com/docs/vercel-blob/private-storage  
7. https://vercel.com/kb/guide/vercel-blob  
8. https://vercel.com/kb/guide/how-to-upload-and-store-files-with-vercel (“provision two separate stores”)  
9. Local: `packages/storage/index.ts`, `shared.ts`, `keys.ts`, `apps/app/app/api/blob/route.ts`
