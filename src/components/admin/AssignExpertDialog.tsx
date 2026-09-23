import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/useDebounce";
import { listExperts } from "@/services/expertService";
import { assignExpert, type Order } from "@/services/orderService";
import { OrderInterestPanel } from "@/components/admin/OrderInterestPanel";

interface ExpertResult {
  id: string;
  name: string;
  email: string;
}

export function AssignExpertDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [selected, setSelected] = useState<ExpertResult | null>(null);
  const [budget, setBudget] = useState("");

  const searchQuery = useQuery({
    queryKey: ["experts", "search", debouncedSearch],
    queryFn: () =>
      listExperts({
        search: debouncedSearch,
        status: "active",
        per_page: 8,
      }),
    enabled: open && debouncedSearch.trim().length >= 2,
  });

  const results: ExpertResult[] = (searchQuery.data?.items ?? []).map(
    (e: { id: string; name: string; email: string }) => ({
      id: e.id,
      name: e.name,
      email: e.email,
    }),
  );

  const assignMutation = useMutation({
    mutationFn: () => {
      if (!order || !selected) throw new Error("Missing expert or order");
      return assignExpert(order.id, {
        expert_id: selected.id,
        budget: Number(budget),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(`${selected?.name} assigned to ${order?.ref}`);
      reset();
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === "object" && "response" in err
          ? // @ts-expect-error - axios error shape, not worth a full type here
            err.response?.data?.error?.message
          : undefined;
      toast.error(message || "Unable to assign expert");
    },
  });

  const reset = () => {
    setSearch("");
    setSelected(null);
    setBudget("");
  };

  const canSubmit = Boolean(selected) && Number(budget) > 0 && !assignMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign expert</DialogTitle>
          <DialogDescription>
            {order ? `Order ${order.ref} - ${order.materialTitle}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <OrderInterestPanel
            orderId={order?.id ?? null}
            enabled={open}
            selectedExpertId={selected?.id ?? null}
            onPick={(interest) => {
              setSelected({
                id: interest.expertId,
                name: interest.expertName,
                email: interest.expertEmail ?? "",
              });
              setSearch("");
            }}
          />

          <div className="space-y-2">
            <Label htmlFor="expert-search">Expert</Label>

            {selected ? (
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="expert-search"
                  className="pl-9"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="off"
                />

                {search.trim().length >= 2 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-card">
                    {searchQuery.isFetching ? (
                      <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching…
                      </div>
                    ) : results.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground">
                        No active experts match "{search}".
                      </p>
                    ) : (
                      <ul className="max-h-56 divide-y divide-border overflow-y-auto">
                        {results.map((expert) => (
                          <li key={expert.id}>
                            <button
                              type="button"
                              className="flex w-full items-center justify-between gap-2 p-3 text-left text-sm hover:bg-accent"
                              onClick={() => {
                                setSelected(expert);
                                setSearch("");
                              }}
                            >
                              <span>
                                <span className="block font-medium">{expert.name}</span>
                                <span className="block text-xs text-muted-foreground">
                                  {expert.email}
                                </span>
                              </span>
                              <Check className="h-4 w-4 opacity-0" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expert-budget">
              Budget {order?.currency ? `(${order.currency})` : ""}
            </Label>
            <Input
              id="expert-budget"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              What the platform pays the expert for this order - separate from
              what the customer was charged.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="hero"
            disabled={!canSubmit}
            onClick={() => assignMutation.mutate()}
          >
            {assignMutation.isPending ? "Assigning…" : "Assign expert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
