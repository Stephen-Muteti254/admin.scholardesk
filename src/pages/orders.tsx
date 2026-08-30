import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, MoreHorizontal } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  AdminPageHeader,
  StatCard,
  StatusBadge,
  formatDateTime,
  formatMoney,
} from "@/components/admin/AdminUI";
import { ALL, DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { OrdersTableSkeleton } from "@/components/skeletons/OrdersTableSkeleton";
import { LoadingOverlay } from "@/components/skeletons/LoadingOverlay";
import { useDebounce } from "@/hooks/useDebounce";
import { useInitialLoading } from "@/hooks/useInitialLoading";
import { useErrorToast } from "@/hooks/useErrorToast";
import {
  bulkResendReceipts,
  bulkUpdateOrders,
  deleteOrder,
  exportOrders,
  getOrderStatistics,
  listOrders,
  refundOrder,
  regenerateDownloadLink,
  resendReceipt,
  updateOrder,
  type Order,
  type OrderGateway,
  type OrderStatus,
} from "@/services/orderService";

const PER_PAGE = 20;

function OrdersPage() {
  const queryClient = useQueryClient();

  const [status, setStatus] = useState(ALL);
  const [gateway, setGateway] = useState(ALL);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [busyRowId, setBusyRowId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const listParams = {
    page,
    per_page: PER_PAGE,
    search: debouncedSearch || undefined,
    status: status === ALL ? undefined : (status as OrderStatus),
    gateway: gateway === ALL ? undefined : (gateway as OrderGateway),
    sort_by: sortBy,
    direction,
  };

  const ordersQuery = useQuery({
    queryKey: ["orders", listParams],
    queryFn: () => listOrders(listParams),
    placeholderData: keepPreviousData,
  });

  const statsQuery = useQuery({
    queryKey: ["orders", "statistics"],
    queryFn: getOrderStatistics,
  });

  useErrorToast(ordersQuery.isError, "Unable to load orders.");
  useErrorToast(statsQuery.isError, "Unable to load statistics.");

  const initialTableLoading = useInitialLoading(ordersQuery.isFetching);
  const initialStatsLoading = useInitialLoading(statsQuery.isFetching);

  const statistics = statsQuery.data ?? {
    paid: 0,
    gross: 0,
    pending: 0,
    disputed: 0,
  };

  const rows = ordersQuery.data?.items ?? [];
  const pagination = ordersQuery.data?.pagination;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const mutate = useMutation({
    mutationFn: async ({ run }: { run: () => Promise<unknown>; message: string }) => run(),
    onSuccess: (_data, variables) => {
      toast.success(variables.message);
      refresh();
    },
    onError: () => toast.error("Something went wrong. Please try again."),
    onSettled: () => setBusyRowId(null),
  });

  const runRowAction = (id: string, run: () => Promise<unknown>, message: string) => {
    setBusyRowId(id);
    mutate.mutate({ run, message });
  };

  const columns: Column<Order>[] = [
    {
      key: "ref",
      header: "Order",
      sortValue: (r) => r.ref,
      render: (r) => (
        <div>
          <p className="font-medium">{r.ref}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "item",
      header: "Order",
      sortValue: (r) => r.materialTitle,
      render: (r) => <span className="text-sm">{r.materialTitle}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      sortValue: (r) => r.customer.name,
      render: (r) => (
        <div>
          <p className="text-sm">{r.customer.name}</p>
          <p className="text-xs text-muted-foreground">{r.customer.email}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortValue: (r) => r.amount,
      render: (r) => formatMoney(r.amount),
    },
    { key: "gateway", header: "Gateway", sortValue: (r) => r.gateway, render: (r) => r.gateway },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.status,
      render: (r) => <StatusBadge value={r.status} />,
    },
  ];

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Orders"
        description="Closed customer engagements and purchases, with payment, refund and dispute handling."
        actions={
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const blob = await exportOrders(listParams);
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "orders.csv";
                link.click();
                URL.revokeObjectURL(url);
                toast.success("Export ready");
              } catch {
                toast.error("Export failed");
              }
            }}
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {initialStatsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Paid orders"
              value={String(statistics.paid)}
              delta={statistics.paid_delta}
              hint="this week"
            />
            <StatCard label="Gross" value={formatMoney(statistics.gross)} />
            <StatCard label="Pending" value={String(statistics.pending)} />
            <StatCard
              label="Disputes"
              value={String(statistics.disputed)}
              hint="needs evidence"
            />
          </>
        )}
      </div>

      <DataTable
        initialLoading={initialTableLoading}
        refreshing={ordersQuery.isFetching && !initialTableLoading}
        loadingSkeleton={<OrdersTableSkeleton />}
        loadingOverlay={<LoadingOverlay />}
        rows={rows}
        columns={columns}
        page={page}
        totalPages={pagination?.pages ?? 1}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        sortKey={sortBy}
        sortDirection={direction}
        onSortChange={(key, dir) => {
          setSortBy(key);
          setDirection(dir);
          setPage(1);
        }}
        getId={(r) => r.id}
        searchText={(r) => `${r.ref} ${r.materialTitle} ${r.customer.name} ${r.customer.email}`}
        searchPlaceholder="Search orders…"
        emptyMessage={
          ordersQuery.isError ? "Unable to load orders." : "No orders match these filters."
        }
        filters={[
          {
            key: "status",
            label: "Status",
            value: status,
            onChange: (value) => {
              setStatus(value);
              setPage(1);
            },
            options: ["paid", "pending", "failed", "refunded", "disputed"].map((s) => ({
              value: s,
              label: s,
            })),
          },
          {
            key: "gateway",
            label: "Gateway",
            value: gateway,
            onChange: (value) => {
              setGateway(value);
              setPage(1);
            },
            options: ["Stripe", "PayPal", "Bank Transfer", "Wise"].map((s) => ({
              value: s,
              label: s,
            })),
          },
        ]}
        bulkActions={(ids, clear) => (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await bulkResendReceipts(ids);
                  clear();
                  toast.success("Receipts resent");
                } catch {
                  toast.error("Unable to resend receipts");
                }
              }}
            >
              Resend receipts
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await bulkUpdateOrders(ids, { status: "paid" });
                  clear();
                  refresh();
                  toast.success("Marked paid");
                } catch {
                  toast.error("Unable to update orders");
                }
              }}
            >
              Mark paid
            </Button>
          </>
        )}
        rowActions={(r) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Actions for ${r.ref}`}
                disabled={busyRowId === r.id}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => runRowAction(r.id, () => resendReceipt(r.id), "Receipt resent")}
              >
                Resend receipt
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  runRowAction(r.id, () => updateOrder(r.id, { status: "paid" }), "Marked paid")
                }
              >
                Mark paid
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  runRowAction(
                    r.id,
                    () => regenerateDownloadLink(r.id),
                    "Download link regenerated",
                  )
                }
              >
                Regenerate download link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  runRowAction(
                    r.id,
                    () => refundOrder(r.id, { reason: "customer-request" }),
                    "Refund issued",
                  )
                }
              >
                Refund
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => runRowAction(r.id, () => deleteOrder(r.id), "Order removed")}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    </AdminLayout>
  );
}

export default OrdersPage;
