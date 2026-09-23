import { useQuery } from "@tanstack/react-query";
import { Hand, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InterestListSkeleton } from "@/components/skeletons/InterestListSkeleton";
import { formatDateTime } from "@/components/admin/AdminUI";
import { listOrderInterests, type OrderInterest } from "@/services/orderInterestService";

/**
 * Shows the experts who registered interest in an order.
 *
 * Read-only matching aid: picking an expert here only pre-fills the
 * assignment form. Support can still assign anyone, and an order with no
 * interest at all is assigned exactly as before.
 */
export function OrderInterestPanel({
  orderId,
  enabled = true,
  selectedExpertId,
  onPick,
}: {
  orderId: string | null;
  enabled?: boolean;
  selectedExpertId?: string | null;
  onPick?: (interest: OrderInterest) => void;
}) {
  const query = useQuery({
    queryKey: ["orders", orderId, "interests"],
    queryFn: () => listOrderInterests(orderId as string),
    enabled: Boolean(orderId) && enabled,
    retry: false,
  });

  if (!orderId || !enabled) return null;

  const interests = query.data?.items ?? [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Expert interest</p>
        {interests.length > 0 && (
          <Badge variant="outline" className="font-medium">
            {interests.length} registered
          </Badge>
        )}
      </div>

      {query.isPending ? (
        <InterestListSkeleton />
      ) : query.isError ? (
        <p className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
          Interest could not be loaded. Assignment still works normally.
        </p>
      ) : interests.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          No expert has registered interest yet.
        </p>
      ) : (
        <ul className="max-h-56 divide-y divide-border overflow-y-auto rounded-lg border border-border">
          {interests.map((interest) => {
            const isSelected = selectedExpertId === interest.expertId;
            return (
              <li key={interest.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Hand className="h-3.5 w-3.5 text-muted-foreground" />
                    {interest.expertName}
                    {interest.isAvailable === false && (
                      <Badge variant="outline" className="font-medium">
                        Busy
                      </Badge>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[
                      interest.rating != null ? `${interest.rating.toFixed(1)}★` : null,
                      interest.completedOrders != null
                        ? `${interest.completedOrders} completed`
                        : null,
                      interest.activeAssignments != null
                        ? `${interest.activeAssignments} active`
                        : null,
                      `interested ${formatDateTime(interest.createdAt)}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {interest.specialities && interest.specialities.length > 0 && (
                    <p className="truncate text-xs text-muted-foreground">
                      {interest.specialities.slice(0, 4).join(", ")}
                    </p>
                  )}
                  {interest.note && (
                    <p className="mt-1 text-xs italic text-muted-foreground">“{interest.note}”</p>
                  )}
                </div>

                {onPick && (
                  <Button
                    variant={isSelected ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => onPick(interest)}
                  >
                    {isSelected ? (
                      <>
                        <Star className="h-4 w-4" /> Selected
                      </>
                    ) : (
                      "Use"
                    )}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Interest is advisory. You can assign any active expert regardless of who registered.
      </p>
    </div>
  );
}
