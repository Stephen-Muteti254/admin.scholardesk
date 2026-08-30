import { Loader2 } from "lucide-react";

export function LoadingOverlay() {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}