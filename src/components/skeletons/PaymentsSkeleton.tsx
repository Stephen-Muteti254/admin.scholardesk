import { Skeleton } from "@/components/ui/skeleton";
import { BadgeSkeleton } from "@/components/skeletons/BadgeSkeleton";
import { AvatarSkeleton } from "@/components/skeletons/AvatarSkeleton";

export function PaymentsSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b p-4">
        <Skeleton className="h-10 w-80" />
      </div>

      <div>
        {Array.from({ length: 8 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-7 items-center gap-6 border-b p-4"
          >
            <div className="flex items-center gap-3">
              <AvatarSkeleton />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-24" />
            <BadgeSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}