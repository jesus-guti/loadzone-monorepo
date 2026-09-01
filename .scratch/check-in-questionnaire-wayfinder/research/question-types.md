# Question types: Custom Questions vs WellnessMetric

Ticket: [Question types for Custom Questions vs WellnessMetric](../issues/01-question-types.md)

Primary sources only. Product law from the map: **WellnessMetric**s feed load / care / charts; **Custom Question**s accumulate and CSV-export only.

## 1. Builder catalogs (third-party)

### Google Forms (Help + API)

[Google Docs Editors Help — Choose a type of question](https://support.google.com/docs/answer/7322334?hl=en) lists responder question types:

| Help type | What the respondent does |
| --- | --- |
| Short answer | One-line free text; optional character-count rules |
| Paragraph | Long free text; optional min/max character-count rules |
| Multiple choice | Pick one; optional “Other”; optional section branching |
| Checkboxes | Pick many; optional “Other”; optional section branching |
| Dropdown | Pick one; optional section branching |
| File upload | Upload files (Google Account; Drive folder; type/count/size limits) |
| Linear scale | Numeric rating: start at **0 or 1**, end on a whole number **2–10**, optional labels on each end |
| Rating | Icon rating: star / heart / thumbs up; whole number **3–10** |
| Multiple choice grid | One (or more) answers per row; shared columns |
| Checkbox grid | Multiple answers per row; shared columns |
| Date | `mm/dd/yyyy`; optional year or time |
| Time | Time of day **or** elapsed duration (Hrs Min Sec) |

The [Google Forms API `Question` resource](https://developers.google.com/workspace/forms/api/reference/rest/v1/forms#Question) is the machine catalog. `kind` is one of:

- `choiceQuestion` — `RADIO` / `CHECKBOX` / `DROP_DOWN`; options may include an image and an “Other”
- `textQuestion` — `paragraph` boolean (short vs long)
- `scaleQuestion` — `low`, `high`, optional `lowLabel` / `highLabel`
- `ratingQuestion` — `ratingScaleLevel` plus `iconType` `STAR` | `HEART` | `THUMB_UP`
- `dateQuestion`, `timeQuestion` (elapsed vs clock via `duration`), `fileUploadQuestion`
- `rowQuestion` — only inside a `QuestionGroupItem` grid

Non-question items (`pageBreakItem`, `textItem`, `imageItem`, `videoItem`) are layout, not answers.

**Implication for LoadZone:** 1–5 and 1–X (if X ≤ 10) are one type (linear scale), not two. “Pick X icons” is Help’s **Rating** (fixed icon set, 3–10), not an arbitrary icon library. Graded difficulty with custom labels is **linear scale + end labels**, or **multiple choice** if the steps are named options rather than consecutive integers. Google does not offer an unbounded 1–N scale in Help.

### Microsoft (Dynamics 365 Customer Voice)

[Question types available](https://learn.microsoft.com/en-us/dynamics365/customer-voice/available-question-types) (Microsoft Learn, Customer Voice): Choice (single or multiple; dropdown for single), Text (short/long; restrictions include Number / Email / regex), Rating (stars, numbers, or smileys; numbers/stars up to **10** levels, smileys up to **5**; optional labels), Date, Ranking, Likert, File upload, Net Promoter Score.

Microsoft documents that **changing rating levels after responses exist does not rewrite old answers** — the same coexistence problem this map already decided for Questionnaire Versions.

### Typeform (Create API)

[Create form](https://www.typeform.com/developers/create/reference/create-form/) `fields[].type` valid values include (among booking/payment types we can ignore): `short_text`, `long_text`, `number`, `yes_no`, `multiple_choice`, `picture_choice`, `dropdown`, `ranking`, `opinion_scale`, `rating`, `nps`, `date`, `file_upload`, `matrix`, `checkbox`, plus layout `statement` / `group`.

Constraints that matter here:

- `opinion_scale` and `rating`: `steps` minimum **5**, maximum **11**; `shape` is a fixed enum (`star`, `heart`, `thunderbolt`, …), not staff-uploaded art
- `picture_choice`: named choices with image attachments; single or multi via `allow_multiple_selection`
- Answers for `opinion_scale` are numbers ([Responses JSON](https://developers.typeform.com/developers/responses/JSON-response-explanation/))

**Implication:** “Escoger X iconos” in industry builders is either (a) a **rating** with a canned icon, or (b) **picture/choice** where each option is an image. It is not “pick any Phosphor icon as the scale widget” unless we invent that.

## 2. LoadZone form engine (Prisma)

Source: `packages/database/prisma/schema.prisma`.

`FormQuestionType`: `SCALE`, `NUMBER`, `BOOLEAN`, `TEXT`, `SINGLE_SELECT`. There is **no** `MULTI_SELECT`, `RATING_ICON`, `FILE`, `DATE`, or `LIKERT_GRID`.

`FormQuestion` already carries the knobs those types need: `minValue` / `maxValue` / `step` (Decimal), `options` (Json), `mappingKey` (optional string), `helpText`, `required`, `order`.

`FormAnswer.value` is `Json`.

`FormTemplateKind`: `WELLNESS`, `TQR`, `RPE`, `CUSTOM`. `FormFillMoment`: `PRE_SESSION`, `POST_SESSION` (`INJURY_REPORT` is dormant). `FormTemplate.version` is an `Int` defaulting to 1 (in-place integer, not an immutable published snapshot). `FormTemplate.clubId` is optional (system templates have no club). `FormAssignment` can bind a template to a `teamId` and a `fillMoment`.

`DailyEntry` still has first-class columns: `recovery`, `energy`, `soreness`, `sleepHours`, `sleepQuality`, `rpe`, `duration`, plus `formSubmissionId`.

Bootstrap seeds (`packages/database/bootstrap/base-form-templates.ts`) only use **SCALE** and **NUMBER**, and always set `mappingKey`:

| Template | Moment | Questions (type, range, mappingKey) |
| --- | --- | --- |
| `system-wellness-pre` | PRE | recovery SCALE 0–10; energy SCALE 1–5; soreness SCALE 1–5; sleepHours NUMBER 0–24 step 0.5; sleepQuality SCALE 1–5 |
| `system-tqr-pre` | PRE | recovery SCALE 0–10 |
| `system-rpe-post` | POST | rpe SCALE 0–10 |

No seed question maps `duration`. `BOOLEAN` / `TEXT` / `SINGLE_SELECT` are schema-ready and unused by system templates.

## 3. Player check-in UI vs those types

PRE (`apps/player/app/[token]/components/pre-session-form.tsx`) is **not** a generic type renderer. It looks up questions by `mappingKey` and hard-codes widgets:

| mappingKey | Template type | Widget | Presentation |
| --- | --- | --- | --- |
| `recovery` | SCALE 0–10 | `SliderInput` | Numeric slider, caption bands, end labels |
| `energy` | SCALE 1–5 | `ScaleInput` | Five buttons; **Phosphor battery icons** + Spanish labels (`ENERGY_ICONS` / `ENERGY_LABELS`) |
| `soreness` | SCALE 1–5 | `ScaleInput` | Five buttons; text labels only |
| `sleepHours` | NUMBER 0–24 step 0.5 | `ChipInput` | Preset chips 5 / 6 / 7 / 7.5 / 8 / 9 h plus min/max from the question |
| `sleepQuality` | SCALE 1–5 | `ScaleInput` | Five buttons; text labels |

POST (`post-session-form.tsx`) only renders `mappingKey === "rpe"` (`SliderInput` 0–10, Borg captions). It **filters out** `mappingKey === "duration"`.

Save path (`apps/player/app/[token]/actions/save-entry.ts`):

- `SCALE` and `NUMBER` parse as finite numbers; `BOOLEAN` as `rawValue === "true"`; everything else as string
- Questions with `mappingKey` or `key` `"duration"` are **skipped** (“Duration is no longer collected from the player”)
- Numeric `mappingKey` values are copied onto `DailyEntry` (`ProjectedMetrics`); `FormAnswer` rows are still written

`ScaleInput` builds `max - min + 1` integer buttons (so 1–X is already the widget if min/max say so). Grid is 5 columns when there are ≤5 options, else 6 / 11.

Load still uses POST `rpe` and `DailyEntry.duration`: `apps/api/app/cron/stats/route.ts` sets `srpe` to `rpe * duration` when both are present. Duration today is a DailyEntry column, not a live player question.

`WELLNESS_METRICS` in `packages/database/wellness-limits.ts` is `recovery | energy | soreness | sleepHours | sleepQuality` — **not** `rpe` / `duration`. Care-alert flag keys elsewhere still include `rpe` / `srpe`. The glossary’s “plus session RPE/duration on POST” is load math, not that limits array.

## 4. User wishes vs engines

Charting asked for: numeric 1–5, numeric 1–X, pick X icons, graded difficulty (letters / icons / options).

| Wish | Google / Typeform / Customer Voice | LoadZone today | Gap |
| --- | --- | --- | --- |
| 1–5 numeric | Linear scale / Rating / Customer Voice rating levels | `SCALE` min/max 1–5; energy/soreness/sleepQuality | None for storage. Presentation (icons vs digits vs letters) is **chrome on SCALE**, already true for energy. |
| 1–X numeric | Google linear scale **X ≤ 10** (Help); Typeform opinion_scale **5–11 steps**; Customer Voice rating **≤ 10** (smileys ≤ 5) | `SCALE`/`NUMBER` min/max unconstrained in Prisma; `ScaleInput` will render any integer span | Product should cap X (recommend **2–11**, matching Typeform’s upper bound and recovery/RPE 0–10). Unbounded X is not what builders ship. |
| Pick X icons | Google Rating (3 icons, 3–10); Typeform `rating` + `shape` enum or `picture_choice`; Customer Voice stars/smileys | Energy only: hardcoded `ENERGY_ICONS`. `options` Json unused by system templates | Do **not** add a new Prisma type for “icon scale”. Store as `SCALE` (value 1–N) plus presentation: either a **fixed palette** (like Typeform `shape`) or **per-option icons** in `options` Json (like picture_choice / Google choice+image). Arbitrary “any Phosphor icon per tick” is a presentation preset, not a fourth storage type. |
| Graded difficulty | Named choice (Google multiple choice / Typeform `multiple_choice`) **or** scale + labels | `SINGLE_SELECT` + `options` Json exists; unused in player check-in | If the value must stay an ordered integer for CSV/charts later → `SCALE` + `valueLabels`. If the value is a nominal label (A/B/C, “fácil/medio”) → `SINGLE_SELECT`. Letters-on-a-scale are labels, not a type. |
| Free number (hours, minutes) | Customer Voice Text+Number restriction; Typeform `number`; Google short answer + validation | `NUMBER` + min/max/step; sleepHours chips | Keep `NUMBER` for continuous quantities. Do not use `SCALE` for 0–24 sleep. |
| Yes/no | Typeform `yes_no`; Google two-option multiple choice | `BOOLEAN` in enum; no player widget | Fine for Custom Questions; not needed for WellnessMetrics. |
| Multi-select, file, date, ranking, NPS, grids | All three builders | **No enum member** | Out of catalog for this spec unless grilling expands scope. File/date/NPS do not help check-in. Multi-select would need `FormQuestionType` + answer Json shape. |

`BOOLEAN` / `TEXT` / `SINGLE_SELECT` are already persistable; the player check-in does not render them generically. That is a **runtime** gap, not a storage gap.

## 5. Recommended catalog (for persistence grilling)

Keep **one** `FormQuestionType` enum. Split **storage type** from **presentation**. `mappingKey` set ⇒ **WellnessMetric** (or `rpe` / `duration` load fields); `mappingKey` null ⇒ **Custom Question**.

### WellnessMetric (and POST load fields)

Locked types and ranges (from seeds + player UI). Presentation may vary; type and range must not, or load/care break.

| Key | Type | Range | Presentation today | Omit-able (short Preset) |
| --- | --- | --- | --- | --- |
| `recovery` | SCALE | 0–10 integer | Slider | yes |
| `energy` | SCALE | 1–5 integer | Icon scale | yes |
| `soreness` | SCALE | 1–5 integer | Labeled scale | yes |
| `sleepHours` | NUMBER | 0–24, step 0.5 | Chips | yes |
| `sleepQuality` | SCALE | 1–5 integer | Labeled scale | yes |
| `rpe` | SCALE | 0–10 integer | Slider (Borg) | yes |
| `duration` | not a live player question | DailyEntry `Int?` | Derived / session-side today | treat as load field, not a Custom Question |

Do not let staff change a WellnessMetric’s type or min/max. They may omit the item on a Version.

### Custom Question (staff-authored)

Allow only types the engine can store **and** that CSV can print as one cell:

| Type | Config | Answer | Covers user wish |
| --- | --- | --- | --- |
| `SCALE` | integer `min`/`max` with **max−min+1 between 2 and 11**; optional end labels; optional per-value labels; optional `presentation`: `digits` \| `icons` (palette or `options[].icon`) \| `letters` | number | 1–5, 1–X, icon pick, graded letters |
| `NUMBER` | `min`/`max`/`step` | number | free numeric 1–X beyond a button scale (e.g. hours) |
| `SINGLE_SELECT` | `options[]` `{ value, label, icon? }` | string (option value) | named difficulty / categories |
| `BOOLEAN` | none | boolean | yes/no |
| `TEXT` | optional max length | string | leftover; keep for CSV, not for “wellness scales” |

Do **not** add `MULTI_SELECT`, file, date, ranking, NPS, or Likert grids in this spec.

### Presentation vs type (the “chula” part)

Google Rating vs Linear scale, Typeform `rating` vs `opinion_scale`, and energy’s batteries are the same stored integer. Staff picking “iconos” should set `SCALE` + presentation, not a new enum value.

### Engine reuse

`FormQuestion` + `FormAnswer` already match this catalog. Gaps for the persist ticket: Team-owned immutable **Questionnaire Version** vs current `FormTemplate.version` Int and three system templates; generic player renderer for Custom Questions; `duration` as non-question load input.
