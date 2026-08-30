import { Skeleton } from "@/components/ui/skeleton";
import { BadgeSkeleton } from "@/components/skeletons/BadgeSkeleton";

export function MaterialsTableSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b p-4">
        <Skeleton className="h-10 w-80" />
      </div>

      <div>
        {Array.from({
          length: 8,
        }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-7 items-center gap-6 border-b p-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3 w-32" />
            </div>
            <BadgeSkeleton />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
