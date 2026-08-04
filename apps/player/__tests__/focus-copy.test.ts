import { describe, expect, it } from "vitest";
import {
  DEFAULT_AGE_BAND,
  FOCUS_COPY,
  isCareRelevantAnswer,
  resolveQuestionLabel,
  shouldShowAssistedPresence,
  shouldShowCareSilentNote,
} from "../app/[token]/lib/focus-copy";

describe("DEFAULT_AGE_BAND", () => {
  it("defaults production to Guided until staff settings exist", () => {
    expect(DEFAULT_AGE_BAND).toBe("guided");
  });
});

describe("resolveQuestionLabel", () => {
  it("maps known mappingKeys to the Guided register", () => {
    expect(resolveQuestionLabel("energy", "guided", "Energía")).toBe(
      "¿Cómo está tu energía?"
    );
    expect(resolveQuestionLabel("soreness", "guided", "Agujetas")).toBe(
      "¿Agujetas?"
    );
  });

  it("uses Assisted wording for care-relevant muscle pain", () => {
    expect(resolveQuestionLabel("soreness", "assisted", "Agujetas")).toBe(
      "¿Te duelen los músculos?"
    );
  });

  it("uses denser Independent wording when a mapped string exists", () => {
    expect(resolveQuestionLabel("energy", "independent", "Energía")).toBe(
      "¿Tu energía?"
    );
  });

  it("falls back to the template label for unknown keys", () => {
    expect(
      resolveQuestionLabel("customMood", "guided", "¿Cómo te sientes hoy?")
    ).toBe("¿Cómo te sientes hoy?");
    expect(resolveQuestionLabel(null, "guided", "Pregunta libre")).toBe(
      "Pregunta libre"
    );
  });
});

describe("parental see-only cues", () => {
  it("shows Assisted presence only for the Assisted band", () => {
    expect(shouldShowAssistedPresence("assisted")).toBe(true);
    expect(shouldShowAssistedPresence("guided")).toBe(false);
    expect(shouldShowAssistedPresence("independent")).toBe(false);
  });

  it("shows care silent note for Assisted/Guided when care fired", () => {
    expect(shouldShowCareSilentNote("assisted", true)).toBe(true);
    expect(shouldShowCareSilentNote("guided", true)).toBe(true);
    expect(shouldShowCareSilentNote("independent", true)).toBe(false);
    expect(shouldShowCareSilentNote("guided", false)).toBe(false);
  });

  it("treats high soreness as care-relevant", () => {
    expect(isCareRelevantAnswer("soreness", 4)).toBe(true);
    expect(isCareRelevantAnswer("soreness", 5)).toBe(true);
    expect(isCareRelevantAnswer("soreness", 3)).toBe(false);
    expect(isCareRelevantAnswer("energy", 5)).toBe(false);
    expect(isCareRelevantAnswer("soreness", null)).toBe(false);
  });
});

describe("FOCUS_COPY calm completion", () => {
  it("uses short Listo/Gracias voice without guilt", () => {
    expect(FOCUS_COPY.completionTitle.guided).toBe("¡Listo!");
    expect(FOCUS_COPY.completionBody.guided).toBe("Gracias.");
    expect(FOCUS_COPY.streakCalm(3)).toBe("3 días");
    expect(FOCUS_COPY.streakRestart).toBe("Empezamos de nuevo.");
  });
});
