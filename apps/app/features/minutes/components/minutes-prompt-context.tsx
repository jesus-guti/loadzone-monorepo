"use client";

import {
  createContext,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  MinutesPromptState,
  PendingMinutesSession,
} from "@/features/minutes/load-minutes-prompt";

type MinutesPromptContextValue = {
  readonly state: MinutesPromptState;
  readonly dialogOpen: boolean;
  readonly selectedSessionId: string | null;
  readonly openDialog: (sessionId?: string) => void;
  readonly selectSession: (sessionId: string) => void;
  readonly closeDialog: () => void;
  readonly setDialogOpen: (open: boolean) => void;
  readonly selectedSession: PendingMinutesSession | null;
};

const MinutesPromptContext = createContext<MinutesPromptContextValue | null>(
  null
);

type MinutesPromptProviderProps = {
  readonly children: ReactNode;
  readonly state: MinutesPromptState;
};

export function MinutesPromptProvider({
  children,
  state,
}: MinutesPromptProviderProps): ReactElement {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  const openDialog = useCallback(
    (sessionId?: string) => {
      const fallback = state.pendingSessions[0]?.id ?? null;
      setSelectedSessionId(sessionId ?? fallback);
      setDialogOpen(true);
    },
    [state.pendingSessions]
  );

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const selectSession = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId);
  }, []);

  const selectedSession = useMemo(() => {
    if (!selectedSessionId) {
      return state.pendingSessions[0] ?? null;
    }
    return (
      state.pendingSessions.find((row) => row.id === selectedSessionId) ??
      state.pendingSessions[0] ??
      null
    );
  }, [selectedSessionId, state.pendingSessions]);

  const value = useMemo(
    (): MinutesPromptContextValue => ({
      state,
      dialogOpen,
      selectedSessionId,
      openDialog,
      selectSession,
      closeDialog,
      setDialogOpen,
      selectedSession,
    }),
    [
      closeDialog,
      dialogOpen,
      openDialog,
      selectSession,
      selectedSession,
      selectedSessionId,
      state,
    ]
  );

  return (
    <MinutesPromptContext.Provider value={value}>
      {children}
    </MinutesPromptContext.Provider>
  );
}

export function useMinutesPrompt(): MinutesPromptContextValue {
  const context = useContext(MinutesPromptContext);
  if (!context) {
    throw new Error(
      "useMinutesPrompt must be used within MinutesPromptProvider."
    );
  }
  return context;
}
