"use client";

/**
 * PROTOTYPE (DD-05): three variants of player check-in + calm reward loop,
 * switchable via ?variant=A|B|C and ?band=assisted|guided|independent
 * on the existing /[token] route. In-memory stubs only — no save-entry.
 */

import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { useSearchParams } from "next/navigation";
import {
  DEMO_PLAYER_NAME,
  DEMO_TEAM_NAME,
  STUB_QUESTIONS,
  parseBand,
  parseVariant,
  type AgeBand,
  type PrototypeVariant,
} from "./constants";
import { PrototypeSwitcher } from "./switcher";
import { VariantAFocus } from "./variant-a-focus";
import { VariantBTimeline } from "./variant-b-timeline";
import { VariantCReward } from "./variant-c-reward";

type PrototypeCheckinLabProperties = {
  readonly token: string;
  readonly initialVariant: PrototypeVariant;
  readonly initialBand: AgeBand;
};

export function PrototypeCheckinLab({
  token,
  initialVariant,
  initialBand,
}: PrototypeCheckinLabProperties): JSX.Element {
  const searchParams = useSearchParams();
  const variant =
    parseVariant(searchParams.get("variant") ?? undefined) ?? initialVariant;
  const band = parseBand(searchParams.get("band") ?? initialBand);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(false);
  const [simulateMiss, setSimulateMiss] = useState(false);

  // Reset flow when variant or band changes so comparisons stay fair.
  useEffect(() => {
    setStep(0);
    setAnswers({});
    setCompleted(false);
  }, [variant, band]);

  const careTriggered = useMemo(() => {
    return STUB_QUESTIONS.some((question) => {
      if (!question.careRelevant || question.careThreshold == null) return false;
      const value = answers[question.id];
      return value !== undefined && value >= question.careThreshold;
    });
  }, [answers]);

  const onAnswer = useCallback((questionId: string, value: number) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      const answeredCount = Object.keys(next).length;
      if (answeredCount >= STUB_QUESTIONS.length) {
        setCompleted(true);
        setStep(STUB_QUESTIONS.length);
      } else {
        const nextIndex = STUB_QUESTIONS.findIndex((q) => q.id === questionId) + 1;
        setStep(nextIndex);
      }
      return next;
    });
  }, []);

  const onRestart = useCallback(() => {
    setStep(0);
    setAnswers({});
    setCompleted(false);
  }, []);

  const shared = {
    band,
    step,
    answers,
    completed,
    simulateMiss,
    careTriggered,
    onAnswer,
    onRestart,
  };

  return (
    <div className="min-h-[100dvh] bg-bg-secondary text-text-primary">
      <p className="sr-only">
        Prototipo DD-05. Token lab {token}. Jugador demo {DEMO_PLAYER_NAME},{" "}
        {DEMO_TEAM_NAME}. Variante {variant}, banda {band}.
      </p>

      {variant === "A" ? <VariantAFocus {...shared} /> : null}
      {variant === "B" ? <VariantBTimeline {...shared} /> : null}
      {variant === "C" ? <VariantCReward {...shared} /> : null}

      <PrototypeSwitcher
        variant={variant}
        band={band}
        simulateMiss={simulateMiss}
        onToggleMiss={() => setSimulateMiss((value) => !value)}
      />
    </div>
  );
}
