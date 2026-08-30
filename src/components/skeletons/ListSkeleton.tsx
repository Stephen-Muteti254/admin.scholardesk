import { Skeleton } from "@/components/ui/skeleton";
import { BadgeSkeleton } from "@/components/skeletons/BadgeSkeleton";

interface ListSkeletonProps {
  /** Number of placeholder rows to render. */
  rows?: number;
  /**
   * "badge" -> title + meta line + a trailing status badge
   *   (matches "Needs attention").
   * "value" -> title + meta line + a value + a trailing status badge
   *   (matches "Latest orders").
   */
  trailing?: "badge" | "value";
}

/**
 * Skeleton for the divide-y activity lists on the Dashboard
 * ("Needs attention", "Latest orders").
 */
export function ListSkeleton({ rows = 5, trailing = "badge" }: ListSkeletonProps) {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          {trailing === "value" && <Skeleton className="h-4 w-14" />}
          <BadgeSkeleton />
        </li>
      ))}
    </ul>
  );
}
