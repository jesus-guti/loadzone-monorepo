import { Spinner } from "@repo/design-system/components/spinner";

/**
 * First-paint staff shell while auth + GlobalSidebar resolve.
 * Empty sidebar slot + empty main card + centered loader — not a fake dashboard.
 */
export function StaffShellInitialLoader() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 bg-bg-secondary">
      <aside
        aria-hidden
        className="hidden shrink-0 md:block md:w-(--sidebar-width)"
      />
      <div className="relative flex min-h-0 w-full flex-1 flex-col bg-bg-primary md:m-2 md:ml-0 md:rounded-xl">
        <div className="flex flex-1 items-center justify-center p-6">
          <Spinner
            aria-label="Cargando"
            className="size-8 text-text-tertiary"
          />
        </div>
      </div>
    </div>
  );
}
