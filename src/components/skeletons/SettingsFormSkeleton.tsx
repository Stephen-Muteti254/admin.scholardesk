import { Skeleton } from "@/components/ui/skeleton";

export function SettingsFormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="grid gap-5 rounded-xl border border-border bg-card p-6 shadow-card md:grid-cols-2">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SettingsToggleListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function TeamListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <ul className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </li>
        ))}
      </ul>
    </div>
  );
}
