import { Skeleton } from "@/components/ui/skeleton";

export function AvatarSkeleton() {
    return (
        <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
            </div>
        </div>
    );
}