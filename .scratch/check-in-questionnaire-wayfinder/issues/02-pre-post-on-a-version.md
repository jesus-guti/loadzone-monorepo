# PRE and POST questions on a Questionnaire Version

Labels: `wayfinder:grilling`  
Status: closed  
Claimed by: me  
Blocked by: none

## Question

A **Questionnaire Version** declares which items are PRE-session and which are POST-session (not two DailyEntries). What are the product rules?

Cover: may the same **WellnessMetric** or **Custom Question** appear in both moments? Must PRE include a minimum set? If a short Preset omits POST RPE/duration, is POST empty or still present with fewer items? How does this sit next to existing `FormAssignment.fillMoment` (`PRE_SESSION` / `POST_SESSION`)?

## Answer

Two forms per Version (before / after Session), fully assignable and duplicable. Defaults + load rule + empty-form obligations: [resolutions/02-pre-post-on-a-version.md](../resolutions/02-pre-post-on-a-version.md).
