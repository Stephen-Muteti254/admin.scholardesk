import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="space-y-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    );
}