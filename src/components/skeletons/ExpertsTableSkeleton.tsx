import { Skeleton } from "@/components/ui/skeleton";
import { BadgeSkeleton } from "@/components/skeletons/BadgeSkeleton";
import { AvatarSkeleton } from "@/components/skeletons/AvatarSkeleton";

export function ExpertsTableSkeleton() {
    return (
        <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b p-4">
                <Skeleton className="h-10 w-80" />
            </div>
            <div>
                {Array.from({ length: 8 }).map((_, row) => (
                    <div
                        key={row}
                        className="grid grid-cols-8 items-center gap-6 border-b p-4"
                    >
                        <AvatarSkeleton />
                        <Skeleton className="h-6 w-28 rounded-full" />
                        <Skeleton className="h-5 w-10" />
                        <Skeleton className="h-5 w-8" />
                        <Skeleton className="h-5 w-10" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                        <BadgeSkeleton />
                    </div>
                ))}
            </div>
        </div>
    );
}