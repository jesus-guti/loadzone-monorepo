# Persist DailyEntry against a Questionnaire Version

Labels: `wayfinder:grilling`  
Status: open  
Blocked by: none (research closed; PRE/POST closed)

## Question

What schema (plan only) stores a **Questionnaire Version** as a snapshot of a **Pre-session form** and a **Post-session form**, binds each **DailyEntry** to that Version, keeps **WellnessMetric**s first-class for load/care (including a metric placed on both forms), and stores **Custom Question** answers — without stretching `FormTemplate` / `FormQuestion` / `FormAssignment`?

Product law: [PRE and POST questions on a Questionnaire Version](02-pre-post-on-a-version.md). Type catalog: [Question types for Custom Questions vs WellnessMetric](01-question-types.md). Replace or drop the current form-engine tables; `DailyEntry.formSubmissionId` as a single FK is known to be insufficient (PRE then POST overwrite). Team-owned; publish = new immutable Version; no draft row; one DailyEntry per player and date.
