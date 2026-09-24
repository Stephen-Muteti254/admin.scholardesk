import { Skeleton } from "@/components/ui/skeleton";
import { BadgeSkeleton } from "@/components/skeletons/BadgeSkeleton";
import { AvatarSkeleton } from "@/components/skeletons/AvatarSkeleton";

export function TokensTableSkeleton({ rows = 8, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b p-4">
        <Skeleton className="h-10 w-80" />
      </div>

      <div>
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="grid items-center gap-6 border-b p-4"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            <div className="flex items-center gap-3">
              <AvatarSkeleton />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            {Array.from({ length: Math.max(0, columns - 2) }).map((__, c) => (
              <Skeleton key={c} className="h-5 w-20" />
            ))}
            <BadgeSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
