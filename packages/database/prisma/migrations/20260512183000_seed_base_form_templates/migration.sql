-- Seeds system FormTemplate rows (codes system-wellness-pre, system-tqr-pre, system-rpe-post)
-- and FormQuestion rows. Idempotent ON CONFLICT: safe for databases that already had rows
-- from historical runtime upserts (@repo/database/bootstrap).
-- Canonical field list mirrors `packages/database/bootstrap/base-form-templates.ts`.

INSERT INTO "FormTemplate"
  ("id", "clubId", "name", "code", "kind", "fillMoment", "isSystem", "isActive", "version", "createdAt", "updatedAt")
VALUES
  ('seed_fmpt_wellness_pre', NULL, 'Wellness Base', 'system-wellness-pre', 'WELLNESS'::"FormTemplateKind",
   'PRE_SESSION'::"FormFillMoment", true, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_fmpt_tqr_pre', NULL, 'TQR Base', 'system-tqr-pre', 'TQR'::"FormTemplateKind",
   'PRE_SESSION'::"FormFillMoment", true, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_fmpt_rpe_post', NULL, 'RPE Base', 'system-rpe-post', 'RPE'::"FormTemplateKind",
   'POST_SESSION'::"FormFillMoment", true, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

-- system-wellness-pre questions
INSERT INTO "FormQuestion"
  ("id", "templateId", "key", "label", "type", "required", "order",
   "minValue", "maxValue", "step", "mappingKey", "createdAt", "updatedAt")
SELECT 'fq_wellness_recovery', t.id, 'recovery', 'Recuperación (TQR)', 'SCALE'::"FormQuestionType", true, 1,
  '0'::DECIMAL, '10'::DECIMAL, '1'::DECIMAL, 'recovery', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "FormTemplate" t WHERE t.code = 'system-wellness-pre'
ON CONFLICT ("templateId", "key") DO NOTHING;

INSERT INTO "FormQuestion"
  ("id", "templateId", "key", "label", "type", "required", "order",
   "minValue", "maxValue", "step", "mappingKey", "createdAt", "updatedAt")
SELECT 'fq_wellness_energy', t.id, 'energy', 'Nivel de energía', 'SCALE'::"FormQuestionType", true, 2,
  '1'::DECIMAL, '5'::DECIMAL, '1'::DECIMAL, 'energy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "FormTemplate" t WHERE t.code = 'system-wellness-pre'
ON CONFLICT ("templateId", "key") DO NOTHING;

INSERT INTO "FormQuestion"
  ("id", "templateId", "key", "label", "type", "required", "order",
   "minValue", "maxValue", "step", "mappingKey", "createdAt", "updatedAt")
SELECT 'fq_wellness_soreness', t.id, 'soreness', 'Agujetas / Dolor muscular', 'SCALE'::"FormQuestionType", true, 3,
  '1'::DECIMAL, '5'::DECIMAL, '1'::DECIMAL, 'soreness', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "FormTemplate" t WHERE t.code = 'system-wellness-pre'
ON CONFLICT ("templateId", "key") DO NOTHING;

INSERT INTO "FormQuestion"
  ("id", "templateId", "key", "label", "type", "required", "order",
   "minValue", "maxValue", "step", "mappingKey", "createdAt", "updatedAt")
SELECT 'fq_wellness_sleep_hours', t.id, 'sleepHours', 'Horas de sueño', 'NUMBER'::"FormQuestionType", true, 4,
  '0'::DECIMAL, '24'::DECIMAL, '0.5'::DECIMAL, 'sleepHours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "FormTemplate" t WHERE t.code = 'system-wellness-pre'
ON CONFLICT ("templateId", "key") DO NOTHING;

INSERT INTO "FormQuestion"
  ("id", "templateId", "key", "label", "type", "required", "order",
   "minValue", "maxValue", "step", "mappingKey", "createdAt", "updatedAt")
SELECT 'fq_wellness_sleep_quality', t.id, 'sleepQuality', 'Calidad del sueño', 'SCALE'::"FormQuestionType", true, 5,
  '1'::DECIMAL, '5'::DECIMAL, '1'::DECIMAL, 'sleepQuality', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "FormTemplate" t WHERE t.code = 'system-wellness-pre'
ON CONFLICT ("templateId", "key") DO NOTHING;

-- system-tqr-pre
INSERT INTO "FormQuestion"
  ("id", "templateId", "key", "label", "type", "required", "order",
   "minValue", "maxValue", "step", "mappingKey", "createdAt", "updatedAt")
SELECT 'fq_tqr_recovery', t.id, 'recovery', 'Recuperación (TQR)', 'SCALE'::"FormQuestionType", true, 1,
  '0'::DECIMAL, '10'::DECIMAL, '1'::DECIMAL, 'recovery', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "FormTemplate" t WHERE t.code = 'system-tqr-pre'
ON CONFLICT ("templateId", "key") DO NOTHING;

-- system-rpe-post
INSERT INTO "FormQuestion"
  ("id", "templateId", "key", "label", "type", "required", "order",
   "minValue", "maxValue", "step", "mappingKey", "createdAt", "updatedAt")
SELECT 'fq_rpe_rpe', t.id, 'rpe', 'Esfuerzo percibido (RPE - Borg)', 'SCALE'::"FormQuestionType", true, 1,
  '0'::DECIMAL, '10'::DECIMAL, '1'::DECIMAL, 'rpe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "FormTemplate" t WHERE t.code = 'system-rpe-post'
ON CONFLICT ("templateId", "key") DO NOTHING;

INSERT INTO "FormQuestion"
  ("id", "templateId", "key", "label", "type", "required", "order",
   "minValue", "maxValue", "step", "mappingKey", "createdAt", "updatedAt")
SELECT 'fq_rpe_duration', t.id, 'duration', 'Duración de la sesión (minutos)', 'NUMBER'::"FormQuestionType", true, 2,
  '1'::DECIMAL, '600'::DECIMAL, '1'::DECIMAL, 'duration', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "FormTemplate" t WHERE t.code = 'system-rpe-post'
ON CONFLICT ("templateId", "key") DO NOTHING;
