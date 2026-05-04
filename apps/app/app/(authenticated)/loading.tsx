import { Skeleton } from "@repo/design-system/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex min-h-svh bg-bg-secondary">

      <main className="flex min-h-svh flex-1 flex-col bg-bg-primary">
        <div className="border-b border-border-secondary px-4 py-4 md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-md md:hidden" />
            <Skeleton className="h-9 w-full max-w-xs" />
            <div className="ml-auto hidden gap-2 md:flex">
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-10 rounded-full" />
              <Skeleton className="h-9 w-10 rounded-full" />
            </div>
          </div>
          <div className="mt-4 space-y-2 border-t border-border-secondary pt-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-56" />
          </div>
        </div>

        <div className="space-y-6 p-4 md:p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
          <div className="grid gap-4 xl:grid-cols-2">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Loading;
