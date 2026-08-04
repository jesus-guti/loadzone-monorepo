# Sports injury logging & availability patterns (wayfinder research)

**Ticket:** [JES-29](https://linear.app/jesus-guti-workspace/issue/JES-29/research-sports-injury-logging-and-availability-patterns)  
**Branch:** `research/sports-injury-logging-patterns`  
**Scope:** Primary-source patterns for staff injury logging (body maps / regions, date ranges, return-to-play) and how products treat availability / check-in / attendance while a player is injured — for LoadZone amateur football wellness (coach, physio, trainer), not elite medical EMR.

---

## Executive summary

High-trust sports platforms split into two layers that LoadZone should keep distinct:

1. **Injury / medical episode** — onset, body region(s), diagnosis depth, date range, rehab/RTP milestones, closure when the athlete is fully available again.
2. **Availability / participation status** — squad readiness for training and matches (often Available / Modified / Unavailable), which may be *derived from* medical records but is also overridable for non-medical reasons.

**Body maps** appear in two product families:

- **Athlete-reported soreness heat maps** (e.g. TeamBuildr AMS Body Heat Map): daily check-in pinpoints on a diagram with severity — monitoring and early warning, not the official injury record.
- **Clinician OSICS/OSIICS body diagrams** (Teamworks AMS / Kinduct lineage): staff select body area(s) on a diagram, then pick a sports-medicine code; multi-area supported via field config; used for EMR-style injury records and surveillance.

**Date range & return-to-play:** Elite tools treat injury as a **lifecycle** (onset → rehab phases → return-to-play / return-to-perform) with days-post-injury, milestones (gym → pitch → training → play), and explicit linkage of injury status to **availability** and **time-loss**. The IOC 2020 consensus defines severity via days the athlete is *unavailable* from onset until *fully available* — the same conceptual pair LoadZone needs as start/end of an official injury period.

**Check-in / wellness while injured:** Primary sources do **not** document a universal “auto-exempt daily wellness when injured” product rule. What they do show:

- **Availability is separate from wellness forms** (Teamworks Availability module imports medical status; Wellness module is athlete self-report of sleep/mood/soreness).
- **Status can be derived from overlapping injury records** using “worst status” (most restrictive), matching LoadZone’s preference that `INJURED` derives from ≥1 active injury.
- Amateur ops tools (Heja) treat **RSVP / attendance** as event-level availability with reminders — a different obligation surface than daily wellness check-ins.

**Transfermarkt** is useful only as **public history UX**: tabular episodes with injury label, from/until, days, games missed, plus seasonal aggregates — not a staff workflow.

**Borrow for LoadZone:** staff-owned episode with discrete multi-region catalog + body-map UX; open interval drives `INJURED` and **exempts DailyEntry obligation/reminders** while allowing voluntary check-in; keep availability/RTP phases lighter than Kitman/Smartabase EMR; use history body map with region counts (not OSICS codes).

---

## Body-map / region UX patterns

### Athlete soreness heat maps (monitoring, not official injury)

| Product | Pattern | Primary source |
| --- | --- | --- |
| **TeamBuildr AMS — Body Heat Map** | Athletes daily “pinpoint specific areas of discomfort” on a body diagram; rate pain from “a little sore” to “worst possible pain”; coaches see soreness/injury recovery patterns. Marketed as AMS monitoring, not clinician diagnosis. | [TeamBuildr Body Heat Map](https://www.teambuildr.com/body-heat-map); [AMS dashboards (Body Heat Map)](https://www.teambuildr.com/ams-dashboards); [Support: Body Heat Map overview](https://support.teambuildr.com/article/vu660a9ysf-recovery-radar-dashboard-overview) |
| **Teamworks AMS — Wellness module** | Athlete daily wellness includes “soreness scores, and specific soreness locations” with “soreness distribution mapping” on staff dashboards — again subjective monitoring, parallel to medical injury forms. | [Wellness Module](https://help.teamworks.com/ams/s/article/Wellness-module) |

**Implication for LoadZone:** Player self-report of pain location (if retained) should stay **signals / voluntary**, not the official injury period (standing pref). Staff body map is the SoT for episodes.

### Clinician body diagrams + coded regions (official injury)

| Product | Pattern | Primary source |
| --- | --- | --- |
| **Teamworks AMS (Kinduct lineage)** | **OSICS injury diagram** / **OSICS diagram with medical**: select areas on a body diagram; area highlights; choose OSICS v10 diagnosis from that area. Aimed at physios/doctors. Defaults to **max one area**; Advanced properties raise **Maximum number of items** for multi-region. Can split results into side, aspect, body area, diagnosis, medical code for surveillance. | [Injury and Illness Classification Fields](https://help.teamworks.com/ams/s/article/injury-and-illness-classification-fields); [Manipulate Injury Diagram Calculations…](https://help.teamworks.com/ams/s/article/manipulate-injury-diagram-calculations-to-report-on-injury-surveillance-metrics) |
| **Teamworks AMS — OSIICS field** | Search by OSIICS code, body area, or injury name (latest OSIICS version, e.g. v15 at time of help article) — diagram optional; still configurable multi-select. | Same help article |
| **OSIICS standard** | Body-region-first coding used widely in football and other sports; free for research/commercial use with acknowledgement; IOC-recommended sports coding family (with SMDCS). | [About OSIICS (John Orchard)](https://www.johnorchard.com/about-osiics.html); [BJSM OSIICS/SMDCS 2020](https://bjsm.bmj.com/content/54/7/372); [OSIICS v15 (JSHS)](https://doi.org/10.1016/j.jshs.2024.03.004) |

**AIS / national AMS practice (primary data dictionary excerpt):** Clinicians click a **body chart** for site, then injury type → more specific diagnosis → system assigns OSICS code — diagram-first discrete catalog, not free-text body part.  
Source: Australian AIS AMS injury record data dictionary (definitions of OSICS body-chart selection workflow), mirrored at [readkong summary of the AMS injury record](https://www.readkong.com/page/the-definitions-and-use-of-the-injury-record-within-the-7892309) (document is NSO/NIN AMS guidance; treat as standards-aligned primary practice description).

### Case / list UX without interactive body map

| Product | Pattern | Primary source |
| --- | --- | --- |
| **Orreco Medical Notes** | Squad **injury case** list; create injury/illness case with context (match/training, contact/non-contact, mechanism); standardized classifications; athlete status **Not training / Rehab / Monitor / Full Training**; coaches get “clarity on player availability.” No first-party claim of an interactive anatomical picker on the marketing page. | [Medical Notes Module](https://www.orreco.ai/modules/medical-notes) |
| **Kitman Labs Performance Medicine** | Full injury **lifecycle** EMR: onset → assessment → treatment → rehab → return-to-play; pathology-level tracking; availability monitoring connected to injury status; surveillance & time-loss — body diagram not highlighted as the hero UX on the EMR page (focus is workflow + linked availability). | [Sports EMR / Performance Medicine](https://www.kitmanlabs.com/electronic-medical-records-solutions/); [Platform](https://www.kitmanlabs.com/gb/platform/) |
| **PlayerData** | GPS + **player wellness surveys** (sleep, stress, soreness, nutrition); load to reduce injury risk; **no** first-party staff injury body-map / medical episode product in marketing/help sampled. | [Product – Teams](https://playerdata.com/en-gb/new-pages/product-teams); [EDGE Analyst blog](https://www.playerdata.com/blog/what-is-edge-edge-analyst); [Syracuse case (wellness + load)](https://playerdata.com/en-us/blog/two-seasons-zero-soft-tissue-injuries) |
| **Catapult** | Load / Player Load / ACWR for **injury risk reduction** and rehab **benchmarking against healthy baselines** — not anatomical injury logging. | [Injury risk reduction](https://support.catapultsports.com/hc/en-us/articles/360001236195-How-does-technology-help-with-injury-risk-reduction); [Injury rehabilitation support](https://support.catapultsports.com/hc/en-us/articles/360001236816-How-does-technology-help-with-injury-rehabilitation-support) |

### Public history UX reference (not staff workflow)

**Transfermarkt** player Injury history: table of Season | Injury | from | until | Days | Games missed; disclaimer that data is media-researched; seasonal totals (days, injury count, games missed). Body region is only implied by injury label text (e.g. “Hamstring injury”), not a hotspot map.  
Example: [Neymar – Injury history](https://www.transfermarkt.com/neymar/verletzungen/spieler/68290).

**LoadZone standing pref:** history **body map with counts** in destination is a better fit than Transfermarkt’s text table alone — combine map hotspots with episode list for staff.

---

## Date range & return-to-play

### Standards: onset → full availability = severity / time-loss

IOC 2020 consensus (primary):

- A **time-loss** health problem is one that leaves the athlete unable to complete current or future training/competition.
- Severity via time-loss: record **number of days the athlete is unavailable**, from **date of onset** until the athlete is **fully available** for training and competition.
- Count days from the day after onset the athlete cannot participate through the day before full availability; same-day return can be 0 days.

Sources: [BJSM IOC consensus 2020](https://bjsm.bmj.com/content/54/7/372); [PMC full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC7029549/).

This maps cleanly to LoadZone **start date + end/resolved date** on a staff-owned episode (without requiring IOC surveillance reporting).

### Product RTP / lifecycle patterns

| Product | Pattern | Primary source |
| --- | --- | --- |
| **Teamworks Smartabase — Rehab Tracker (football)** | Incident + when it occurred; **timeline of status changes**; **days post-injury**; phases/milestones e.g. return to gym → pitch → training → play (configurable); daily rehab plan + weekly summary; templates for speed. Goal: back to **full availability**. | [Smartabase for Football Clubs: Return to Play](https://teamworks.com/blog/smartabase-football-return-to-play/) |
| **Kitman Labs** | Injury lifecycle onset through RTP; structured RTP decisions; rehab plans with milestones/goals; “return to perform” framing (ready to perform, not merely cleared); links documentation to **availability** and daily status; time-loss analysis. | [EMR / Performance Medicine](https://www.kitmanlabs.com/electronic-medical-records-solutions/); [Return to Play? Return to Perform!](https://www.kitmanlabs.com/blog/return-to-perform/); [Rehab video page](https://www.kitmanlabs.com/video/performance-medicine-rehab/) |
| **Orreco** | Status ladder **Not training / Rehab / Monitor / Full Training** + “key scheduled dates” editable from multiple pages in Medical Notes. | [Medical Notes](https://www.orreco.ai/modules/medical-notes) |
| **Catapult** | Quantify rehab against **pre-injury performance baselines**; reintroduce load when risk is minimal — RTP as load readiness, not date-only. | [Catapult rehab support](https://support.catapultsports.com/hc/en-us/articles/360001236816-How-does-technology-help-with-injury-rehabilitation-support) |

**Implication for LoadZone:** Prefer a **simple closed interval** (start required; end when staff close / RTP) plus optional expected return. Do **not** build Smartabase-grade milestone engines or Kitman pathology EMR in v1 — amateur wellness. Optional later: light status ladder (e.g. align with existing `PlayerStatus.MODIFIED_TRAINING` vs `INJURED`).

---

## Availability vs check-in / attendance while injured

### Elite AMS: medical → availability (separate from wellness)

**Teamworks AMS Availability module** (primary help):

- Centralizes squad readiness by **importing medical statuses** and allowing **manual overrides** for non-medical factors (appointments, personal reasons).
- Availability form + dashboards (real-time squad status, position views, history).
- Roles: coaches, medical, managers, performance — plan training/matches from availability, not from opening the full medical chart.

Source: [Availability Module](https://help.teamworks.com/ams/s/article/Availability-Module).

**Linked calculations** (primary help): example use case — show **injury status and training restrictions from medical forms in daily availability assessments** so coaches see capabilities without full medical access.  
Source: [Link Values from Other Event Forms](https://help.teamworks.com/ams/s/article/linked-calculations).

**Athlete status configuration** (primary help) — critical pattern for LoadZone `INJURED` derivation:

- Status from a designated form field (e.g. Availability).
- Two aggregation modes:
  - **Most recent status** — daily/weekly check-ins.
  - **Worst status** — “when athletes have **multiple concurrent issues**… most restrictive current limitation”; example: two active injury records Modified + Unavailable → overall **Unavailable**.
- Visual status indicators (colored dots) for staff; scores worst=1 … best=higher.

Source: [Configure Athlete Status](https://help.teamworks.com/ams/s/article/configure-athlete-status).

**Conditional UI:** Reason / availability comment fields shown only when Availability is Modified or Unavailable — keep forms thin when Available.  
Source: [Control Field and Section Visibility…](https://help.teamworks.com/ams/s/article/Control-Field-and-Section-Visibility-During-Data-Entry).

**Wellness remains a separate event form** (sleep, mood, fatigue, soreness locations) — not described as auto-paused by injury in help articles reviewed. Alerts can fire on low wellness or new injury reports independently.  
Sources: [Wellness Module](https://help.teamworks.com/ams/s/article/Wellness-module); [Performance alert management](https://help.teamworks.com/ams/s/article/performance-alert-management).

**Kitman:** explicitly connects injury status, restrictions, and readiness to **availability monitoring** and “daily athlete status”; medical governance with role-based visibility.  
Source: [Kitman EMR checklist](https://www.kitmanlabs.com/electronic-medical-records-solutions/).

**BridgeAthletic:** coach-visible traffic-light **Green / Yellow / Red** participation readiness; athletes cannot see status; staff notified on change — availability signaling without tying to wellness form exemption.  
Source: [Updating Athlete Status](https://intercom.help/bridgeathletic/en/articles/10706535-updating-athlete-status).

### Amateur ops: attendance RSVP ≠ wellness obligation

**Heja** (App Store / product): players/parents **RSVP availability** for practices/games; app **reminds** people to reply; Pro adds attendance stats and stronger reminders. Injury is not a first-class medical object — unavailability is an RSVP state.  
Sources: [Heja home](https://app.heja.io/); [Heja pricing (RSVP + reminders)](https://app.heja.io/pricing); [App Store listing](https://apps.apple.com/qa/app/heja/id1157335714).

**Contrast for LoadZone:** DailyEntry is a **recurring wellness obligation**, not a per-session RSVP. Standing pref to **exempt obligation + reminders while injury is open**, while **allowing voluntary check-in**, is a LoadZone-specific product rule that elite AMS docs do not contradict — they simply keep wellness and medical/availability as separate forms. Exempting obligation is the amateur-friendly way to avoid false “NOT_COMPLETED” pressure during known time-loss.

### GPS / load products

PlayerData / Catapult emphasize **load + wellness surveys** to *prevent* injury and guide rehab intensity; they do not replace staff injury episode SoT. Availability of the athlete is inferred operationally by coaches from readiness data, not from a published “injured ⇒ skip survey” rule in sources above.

---

## Recommendations for LoadZone

Mapped to standing preferences and existing code hints (`InjuryReport`, `PlayerStatus.INJURED`, staff `/injuries`, player `save-injury`).

1. **Staff is source of truth for the official injury period**  
   Follow Teamworks/Kitman/Orreco: medical/staff episode owns onset and closure. Keep player self-report (if any) as **intake signal** pending staff confirmation — align with map out-of-scope “Player self-report as official injury period.”

2. **Open injury ⇒ DailyEntry obligation exemption + no reminders; voluntary check-in allowed**  
   Elite products separate wellness forms from availability; they do not force injured athletes off monitoring, but LoadZone’s obligation UX (streaks / NOT_COMPLETED) makes **exemption the right borrow**. Treat open episode as time-loss window (IOC onset→full availability). Do not block voluntary wellness.

3. **`INJURED` derived from ≥1 active injury**  
   Mirror Teamworks **worst-status / concurrent records** idea: any open staff episode ⇒ `PlayerStatus.INJURED` (or more restrictive than AVAILABLE). Closing the last open episode clears derived INJURED. Prefer derivation over manual status-only toggles for injury (status ladder for modified training can remain separate).

4. **Discrete multi-region body catalog; multi-region per episode**  
   Borrow Teamworks diagram pattern: **catalog of body areas** + hotspot UI; allow **multiple regions per episode** (their default is one; they expose max items — LoadZone should default to multi). Do **not** ship OSICS/OSIICS codes in product UI; optionally align region enum naming with OSIICS body-area parents for future analytics without clinician coding.

5. **Create from player profile; `/injuries` = team list**  
   Matches Orreco “athlete list + injury case view” and Kitman Medical Overview: profile for create/edit; team list for squad triage. Keep fields light vs EMR (min: player, regions, start, cause; optional severity/end/expected return).

6. **History body map with counts**  
   Stronger staff UX than Transfermarkt’s text-only history: aggregate closed+open episodes onto the same body asset with **counts per region** (destination pref). Supplement with Transfermarkt-like from/until/days on the episode row for scanability.

7. **Stay out of elite medical EMR**  
   Skip: pathology coding, SOAP/HEAP notes, concussion stage gates, VALD/GPS rehab trackers, league surveillance exports. Optional future: simple status ladder (INJURED vs MODIFIED_TRAINING) inspired by Orreco / BridgeAthletic traffic lights — only if coaches need partial participation without closing the injury.

8. **Availability vs attendance**  
   If LoadZone later adds session attendance, treat it like Heja RSVP (event-level), **orthogonal** to DailyEntry exemption. Do not conflate “injured” with “didn’t RSVP.”

---

## Sources

### Product / help / first-party marketing

- TeamBuildr Body Heat Map: https://www.teambuildr.com/body-heat-map  
- TeamBuildr AMS dashboards: https://www.teambuildr.com/ams-dashboards  
- TeamBuildr support Body Heat Map: https://support.teambuildr.com/article/vu660a9ysf-recovery-radar-dashboard-overview  
- Teamworks AMS — Injury/illness classification (OSICS diagrams): https://help.teamworks.com/ams/s/article/injury-and-illness-classification-fields  
- Teamworks AMS — Injury diagram reporting: https://help.teamworks.com/ams/s/article/manipulate-injury-diagram-calculations-to-report-on-injury-surveillance-metrics  
- Teamworks AMS — Configure athlete status: https://help.teamworks.com/ams/s/article/configure-athlete-status  
- Teamworks AMS — Availability module: https://help.teamworks.com/ams/s/article/Availability-Module  
- Teamworks AMS — Linked calculations: https://help.teamworks.com/ams/s/article/linked-calculations  
- Teamworks AMS — Conditional visibility: https://help.teamworks.com/ams/s/article/Control-Field-and-Section-Visibility-During-Data-Entry  
- Teamworks AMS — Wellness module: https://help.teamworks.com/ams/s/article/Wellness-module  
- Teamworks AMS — Performance alerts: https://help.teamworks.com/ams/s/article/performance-alert-management  
- Teamworks Smartabase RTP (football): https://teamworks.com/blog/smartabase-football-return-to-play/  
- Teamworks AMS product overview: https://teamworks.com/ams/  
- Kitman Performance Medicine / EMR: https://www.kitmanlabs.com/electronic-medical-records-solutions/  
- Kitman platform: https://www.kitmanlabs.com/gb/platform/  
- Kitman return-to-perform: https://www.kitmanlabs.com/blog/return-to-perform/  
- Kitman rehab: https://www.kitmanlabs.com/video/performance-medicine-rehab/  
- Orreco Medical Notes: https://www.orreco.ai/modules/medical-notes  
- PlayerData product (teams): https://playerdata.com/en-gb/new-pages/product-teams  
- PlayerData EDGE Analyst: https://www.playerdata.com/blog/what-is-edge-edge-analyst  
- PlayerData Syracuse case: https://playerdata.com/en-us/blog/two-seasons-zero-soft-tissue-injuries  
- Catapult injury risk reduction: https://support.catapultsports.com/hc/en-us/articles/360001236195-How-does-technology-help-with-injury-risk-reduction  
- Catapult rehab support: https://support.catapultsports.com/hc/en-us/articles/360001236816-How-does-technology-help-with-injury-rehabilitation-support  
- BridgeAthletic athlete status: https://intercom.help/bridgeathletic/en/articles/10706535-updating-athlete-status  
- Heja: https://app.heja.io/ · https://app.heja.io/pricing · https://apps.apple.com/qa/app/heja/id1157335714  
- Transfermarkt injury history (UX reference): https://www.transfermarkt.com/neymar/verletzungen/spieler/68290  

### Standards / classification

- John Orchard — About OSIICS: https://www.johnorchard.com/about-osiics.html  
- OSIICS downloads: https://www.johnorchard.com/osiics-downloads.html  
- BJSM — OSIICS/SMDCS revised 2020: https://bjsm.bmj.com/content/54/7/372  
- OSIICS Version 15 (JSHS): https://doi.org/10.1016/j.jshs.2024.03.004  
- IOC consensus injury/illness epidemiology 2020 (BJSM): https://bjsm.bmj.com/content/54/7/372  
- IOC consensus PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC7029549/  

### Notes on Kinduct naming

Kinduct’s AMS capabilities are documented today under **Teamworks AMS** help (OSICS body diagrams, athlete status, availability, wellness). Claims about Kinduct-as-brand above use Teamworks AMS primary help as the surviving product documentation surface.

---

*Research completed for JES-29. No product code changes.*
