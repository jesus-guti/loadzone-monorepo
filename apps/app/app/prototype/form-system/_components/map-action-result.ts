import type { FormActionResult } from "./types";

type RhfErrorTarget = {
  setError: (
    name: string,
    error: { type: string; message: string }
  ) => void;
};

/**
 * Maps FormActionResult into RHF setError (JES-68).
 * Prototype-local — SPEC may later host this next to Form*.
 */
export function mapFormActionResultToRhf(
  form: RhfErrorTarget,
  result: FormActionResult
): void {
  if (result.success) {
    return;
  }

  if (result.fieldErrors) {
    for (const [name, message] of Object.entries(result.fieldErrors)) {
      form.setError(name, { type: "server", message });
    }
  }

  if (result.formError) {
    form.setError("root", { type: "server", message: result.formError });
  }
}
