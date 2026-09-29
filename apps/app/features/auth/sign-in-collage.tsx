const frames = [
  { label: "Carga", caption: "Microciclo y agudo/crónico" },
  { label: "Sesiones", caption: "Calendario alrededor del partido" },
  { label: "Check-in", caption: "Wellness del día" },
] as const;

export function SignInCollage() {
  return (
    <div className="relative hidden h-full min-h-dvh overflow-hidden border-r border-border-secondary bg-bg-secondary lg:block">
      <div className="flex h-full flex-col justify-center gap-4 px-10">
        {frames.map((frame, index) => (
          <article
            className="rounded-2xl border border-border-secondary bg-bg-primary p-4"
            key={frame.label}
            style={{ marginLeft: index * 28 }}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
              {frame.label}
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">{frame.caption}</p>
            <div className="mt-4 space-y-2">
              <div className="h-2 w-3/4 rounded-full bg-brand/25" />
              <div className="h-2 w-1/2 rounded-full bg-border-secondary" />
              <div className="h-16 rounded-lg border border-border-secondary bg-bg-secondary" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
