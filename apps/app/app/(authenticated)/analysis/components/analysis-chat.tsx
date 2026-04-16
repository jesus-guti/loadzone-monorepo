"use client";

import { CpuChipIcon, PaperAirplaneIcon } from "@heroicons/react/20/solid";
import { useChat } from "@repo/ai/lib/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { Thread } from "@repo/ai/components/thread";
import { Message } from "@repo/ai/components/message";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { useRef, useEffect, useState } from "react";

const SUGGESTIONS = [
  "¿Cómo está el equipo hoy?",
  "¿Hay algún jugador en riesgo de lesión?",
  "¿Qué anomalías detectas esta semana?",
  "Analiza la carga de entrenamiento del equipo",
];

export function AnalysisChat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="flex flex-1 flex-col rounded-xl border bg-card">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <CpuChipIcon className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Asistente de análisis</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Pregunta sobre el estado de tu equipo, jugadores en riesgo,
                tendencias de carga o cualquier dato de bienestar.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => sendMessage({ text: suggestion })}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <Thread>
            {messages.map((message: UIMessage) => (
              <Message key={message.id} data={message} />
            ))}
          </Thread>
        )}
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre tu equipo..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
