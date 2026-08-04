/**
 * Focus OQAT step advance: prefer the next unanswered after `fromIndex`,
 * otherwise the first unanswered; when all answered, return `length`.
 */
export function nextFocusStepIndex(
  hasValues: readonly boolean[],
  fromIndex: number
): number {
  const nextUnanswered = hasValues.findIndex(
    (hasValue, index) => index > fromIndex && !hasValue
  );
  if (nextUnanswered !== -1) return nextUnanswered;

  const firstUnanswered = hasValues.findIndex((hasValue) => !hasValue);
  if (firstUnanswered !== -1) return firstUnanswered;

  return hasValues.length;
}
