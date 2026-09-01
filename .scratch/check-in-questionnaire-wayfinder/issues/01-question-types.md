# Question types for Custom Questions vs WellnessMetric

Labels: `wayfinder:research`  
Status: closed  
Blocked by: none

## Question

What question/input types should a Check-in Questionnaire support for **WellnessMetric** items vs **Custom Question**s?

Ground this in (1) primary docs for Google Forms / similar builders (question types, not UI chrome), (2) LoadZone’s existing `FormQuestionType` (`SCALE`, `NUMBER`, `BOOLEAN`, `TEXT`, `SINGLE_SELECT`) and `FormQuestion.mappingKey`, (3) current DailyEntry fields (recovery, energy, soreness, sleepHours, sleepQuality, rpe, duration) and how player check-in inputs work today.

The product already decided: opinionated WellnessMetrics stay for load/care/charts; Custom Questions accumulate and CSV-export only. This ticket must recommend a type catalog and call out gaps (e.g. 1–5 vs 1–X, icon pickers, graded difficulty) vs inventing types the existing form engine cannot store.

## Answer

Keep the existing `FormQuestionType` enum. **WellnessMetric**s (and `rpe`) have locked type+range from today’s seeds; staff may omit them, not change type. **Custom Question**s: `SCALE` (2–11 steps; icons/letters are presentation), `NUMBER`, `SINGLE_SELECT`, `BOOLEAN`, `TEXT`. `mappingKey` set = metric; null = custom. `duration` is not a live player question. No new types (multi-select, file, grids). Detail: [research/question-types.md](../research/question-types.md).
