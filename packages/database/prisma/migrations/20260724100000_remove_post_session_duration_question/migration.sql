-- Duration is no longer collected from players on post-session forms.
-- Answers cascade-delete with the question.

DELETE FROM "FormQuestion"
WHERE ("key" = 'duration' OR "mappingKey" = 'duration')
  AND "templateId" IN (
    SELECT id FROM "FormTemplate" WHERE "code" = 'system-rpe-post'
  );
