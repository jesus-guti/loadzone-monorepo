# QA Age Band staging session

Seeded: 2026-08-04T13:23:03.012Z
Club: **QA Age Band Staging** (`qa-age-band-staging`) · Team: **QA Parental Matrix** · Season: 2026/2027

## Staff login

- URL: http://localhost:3000/sign-in
- Email: `qa-staging@loadzone.local`
- Password: `LoadZoneQa!staging1`

## Player URLs

| Key | Cases | Resolved | URL |
|---|---|---|---|
| assisted | A1, C1 | ASSISTED | http://localhost:3003/cmseoan7v000fvzvtufu2jr3m |
| guided | A2, C2, B1, B4 | GUIDED | http://localhost:3003/cmseoanar000hvzvtibh3sxyi |
| guided-opted-in | C3, C6 | GUIDED | http://localhost:3003/cmseoancy000jvzvtrce72b6d |
| guided-opted-out | C4 | GUIDED | http://localhost:3003/cmseoanf5000lvzvt3003cdtl |
| guided-blocked | C4 | GUIDED | http://localhost:3003/cmseoanhc000nvzvthhdl60x1 |
| independent-youth | A3, C5-youth | INDEPENDENT | http://localhost:3003/cmseoanjk000pvzvttupp5y9n |
| independent-majority | A4, C5 | INDEPENDENT | http://localhost:3003/cmseoanls000rvzvtzgxwa8kq |
| override-assisted | A5 | ASSISTED | http://localhost:3003/cmseoano0000tvzvtr8urxe1x |
| unassigned | A6 | UNASSIGNED | http://localhost:3003/cmseoanqa000vvzvtjco10p5f |

## Machine context

Tokens + full matrix: `.scratch/qa-age-band/context.json` (gitignored).

Re-seed:

```bash
pnpm --filter @repo/database seed-age-band-qa
```
