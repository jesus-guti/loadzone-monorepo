"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import type { MinutesPromptState } from "@/features/minutes/minutes-prompt-types";

type MinutesPromptContextValue = {
  readonly state: MinutesPromptState;
  readonly dialogOpen: boolean;
  readonly openDialog: (sessionId?: string) => void;
  readonly closeDialog: () => void;
  readonly initialSessionId: string | null;
};

const MinutesPromptContext = createContext<MinutesPromptContextValue | null>(
  null,
);

export function MinutesPromptProvider({
  state,
  children,
}: {
  readonly state: MinutesPromptState;
  readonly children: ReactNode;
}): ReactElement {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialSessionId, setInitialSessionId] = useState<string | null>(null);

  const openDialog = useCallback((sessionId?: string) => {
    setInitialSessionId(sessionId ?? null);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setInitialSessionId(null);
  }, []);

  const value = useMemo(
    () => ({
      state,
      dialogOpen,
      openDialog,
      closeDialog,
      initialSessionId,
    }),
    [state, dialogOpen, openDialog, closeDialog, initialSessionId],
  );

  return (
    <MinutesPromptContext.Provider value={value}>
      {children}
    </MinutesPromptContext.Provider>
  );
}

export function useMinutesPrompt(): MinutesPromptContextValue {
  const value = useContext(MinutesPromptContext);
  if (!value) {
    throw new Error("useMinutesPrompt requires MinutesPromptProvider");
  }
  return value;
}
