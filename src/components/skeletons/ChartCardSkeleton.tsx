import { Skeleton } from "@/components/ui/skeleton";

const BAR_HEIGHTS = [40, 65, 50, 80, 60, 95, 70];

/**
 * Skeleton for a chart card (area/bar/line charts on Dashboard & Analytics).
 * Mirrors the "rounded-xl border bg-card p-5 shadow-card" chart container
 * so there's no layout shift once the real <ResponsiveContainer> mounts.
 */
export function ChartCardSkeleton({ title = true }: { title?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      {title && <Skeleton className="h-4 w-40" />}
      <div className="mt-4 flex h-64 items-end gap-2">
        {BAR_HEIGHTS.map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
