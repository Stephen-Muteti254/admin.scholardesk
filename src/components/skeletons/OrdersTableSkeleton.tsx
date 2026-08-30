import { Skeleton } from "@/components/ui/skeleton";
import { BadgeSkeleton } from "@/components/skeletons/BadgeSkeleton";

export function OrdersTableSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b p-4">
        <Skeleton className="h-10 w-80" />
      </div>

      <div>
        {Array.from({ length: 8 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-6 items-center gap-6 border-b p-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-40" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <BadgeSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
