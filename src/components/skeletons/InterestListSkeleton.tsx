import { Skeleton } from "@/components/ui/skeleton";
import { BadgeSkeleton } from "@/components/skeletons/BadgeSkeleton";

/** Skeleton for the expert-interest list inside the Assign expert dialog. */
export function InterestListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 p-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <BadgeSkeleton />
        </li>
      ))}
    </ul>
  );
}
