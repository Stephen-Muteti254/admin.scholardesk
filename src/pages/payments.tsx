import {
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader, StatCard, StatusBadge, formatDate, formatMoney } from "@/components/admin/AdminUI";
import { ALL, DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Loader2 } from "lucide-react";

import {
  PaymentsSkeleton,
} from "@/components/skeletons/PaymentsSkeleton";

import {
  StatCardSkeleton,
} from "@/components/skeletons/StatCardSkeleton";

import {
  LoadingOverlay,
} from "@/components/skeletons/LoadingOverlay";

import {
  useDebounce,
} from "@/hooks/useDebounce";

import type {
  Payment,
  PaymentStatus,
} from "@/services/paymentsService";

import {
  listPayments,
  getPaymentStatistics,
  updatePayment,
  deletePayment,
  bulkUpdatePayments,
  bulkDeletePayments,
} from "@/services/paymentsService";

function PaymentsPage() {
  const [rows, setRows] = useState<Payment[]>([]);

  const [busyRowId, setBusyRowId] =
    useState<string | null>(null);

  const [initialTableLoading, setInitialTableLoading] =
    useState(true);

  const [refreshingTable, setRefreshingTable] =
    useState(false);

  const [initialStatsLoading, setInitialStatsLoading] =
    useState(true);

  const [status, setStatus] =
    useState(ALL);

  const [page, setPage] =
    useState(1);

  const [perPage] =
    useState(20);

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState("due_at");

  const [direction, setDirection] =
    useState<"asc" | "desc">("desc");

  const debouncedSearch =
    useDebounce(search, 300);

  const [pagination, setPagination] =
    useState({
      page: 1,
      pages: 1,
      total: 0,
    });

  const [statistics, setStatistics] =
    useState({
      total: 0,
      due_this_cycle: 0,
      paid_30_days: 0,
      on_hold: 0,
      experts_paid: 0,
    });

  const filtered = rows.filter((r) => status === ALL || r.status === status);
  const patch = (id: string, p: Partial<Payment>, message: string) => {
    void updatePayment(id, p as never).catch(() => {});
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));
    if (message) toast.success(message);
  };

  const loadStatistics = async () => {
    try {
      setInitialStatsLoading(true);

      const response =
        await getPaymentStatistics();

      setStatistics({
        total: response.total,
        due_this_cycle:
          response.due_this_cycle,
        paid_30_days:
          response.paid_30_days,
        on_hold:
          response.on_hold,
        experts_paid:
          response.experts_paid,
      });

    } catch {
      toast.error(
        "Unable to load payment statistics.",
      );
    } finally {
      setInitialStatsLoading(false);
    }
  };

  const loadPayments = async (
    initial = false,
  ) => {
    try {
      if (initial) {
        setInitialTableLoading(true);
      } else {
        setRefreshingTable(true);
      }

      const response =
        await listPayments({
          page,
          per_page: perPage,
          search: debouncedSearch,
          status:
            status === ALL
              ? undefined
              : (status as PaymentStatus),
          sort_by: sortBy,
          direction,
        });

      setRows(
        response.items,
      );

      setPagination(
        response.pagination,
      );

    } catch {
      toast.error(
        "Unable to load payments.",
      );
    } finally {
      setInitialTableLoading(false);
      setRefreshingTable(false);
    }
  };

  useEffect(() => {
    void loadStatistics();
  }, []);

  const isFirstLoad =
    useRef(true);

  useEffect(() => {
    void loadPayments(
      isFirstLoad.current,
    );

    isFirstLoad.current = false;
  }, [
    page,
    status,
    debouncedSearch,
    sortBy,
    direction,
  ]);

  const handleSearch = (
    value: string,
  ) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatus = (
    value: string,
  ) => {
    setStatus(value);
    setPage(1);
  };

  const handleSort = (
    key: string,
    direction: "asc" | "desc",
  ) => {
    setSortBy(key);
    setDirection(direction);
    setPage(1);
  };


  const changeStatus = async (
    id: string,
    nextStatus: PaymentStatus,
    message: string,
  ) => {
    try {
      setBusyRowId(id);

      await updatePayment(
        id,
        {
          status: nextStatus,
        },
      );

      await Promise.all([
        loadPayments(),
        loadStatistics(),
      ]);

      toast.success(message);

    } catch {
      toast.error(
        "Unable to update payment.",
      );
    } finally {
      setBusyRowId(null);
    }
  };

  const handleDelete = async (
    id: string,
  ) => {
    try {
      setBusyRowId(id);

      await deletePayment(id);

      await Promise.all([
        loadPayments(),
        loadStatistics(),
      ]);

      toast.success(
        "Payment deleted.",
      );

    } catch {
      toast.error(
        "Unable to delete payment.",
      );
    } finally {
      setBusyRowId(null);
    }
  };

  const columns: Column<Payment>[] = [
    {
      key: "expert",
      header: "Expert",
      sortValue: (r) => r.expert,
      render: (r) => (
        <div>
          <p className="font-medium">
            {r.expert}
          </p>

          <p className="text-xs text-muted-foreground">
            {r.expert_id}
          </p>
        </div>
      ),
    },

    {
      key: "period",
      header: "Period",
      sortValue: (r) => r.period_start,
      render: (r) => r.period,
    },

    {
      key: "jobs",
      header: "Jobs",
      sortValue: (r) => r.jobs,
      render: (r) => r.jobs,
    },

    {
      key: "amount",
      header: "Amount",
      sortValue: (r) => r.amount,
      render: (r) =>
        formatMoney(r.amount),
    },

    {
      key: "method",
      header: "Method",
      sortValue: (r) => r.method,
      render: (r) => r.method,
    },

    {
      key: "due_at",
      header: "Due",
      sortValue: (r) => r.due_at ?? "",
      render: (r) =>
        r.due_at
          ? formatDate(r.due_at)
          : "—",
    },

    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.status,
      render: (r) => (
        <StatusBadge
          value={r.status}
        />
      ),
    },
  ];

  return (
    <>      <AdminLayout>
        <AdminPageHeader title="Payments & payouts" description="Outgoing expert payments and settlement status." />
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
                label="Due this cycle"
                value={formatMoney(
                  statistics.due_this_cycle,
                )}
              />

              <StatCard
                label="Paid (30 days)"
                value={formatMoney(
                  statistics.paid_30_days,
                )}
              />

              <StatCard
                label="On hold"
                value={String(
                  statistics.on_hold,
                )}
              />

              <StatCard
                label="Experts paid"
                value={String(
                  statistics.experts_paid,
                )}
              />
            </>
          )}
        </div>

        <DataTable
          initialLoading={
            initialTableLoading
          }
          refreshing={
            refreshingTable
          }
          loadingSkeleton={
            <PaymentsSkeleton />
          }
          loadingOverlay={
            <LoadingOverlay />
          }
          rows={rows}
          columns={columns}
          page={page}
          totalPages={
            pagination.pages
          }
          onPageChange={
            setPage
          }
          searchValue={
            search
          }
          onSearchChange={
            handleSearch
          }
          sortKey={
            sortBy
          }
          sortDirection={
            direction
          }
          onSortChange={
            handleSort
          }
          getId={(r) => r.id}
          searchText={(r) =>
            `${r.expert} ${r.period} ${r.method}`
          }
          searchPlaceholder="Search payouts…"
          filters={[
            {
              key: "status",
              label: "Status",
              value: status,
              onChange: handleStatus,
              options: [
                "scheduled",
                "processing",
                "paid",
                "on-hold",
              ].map((value) => ({
                value,
                label: value,
              })),
            },
          ]}
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await bulkUpdatePayments({
                    ids,
                    status: "paid",
                  });

                  clear();

                  await Promise.all([
                    loadPayments(),
                    loadStatistics(),
                  ]);

                  toast.success(
                    `${ids.length} payouts released`,
                  );

                } catch {
                  toast.error(
                    "Unable to release payouts.",
                  );
                }
              }}
            >
              Release payouts
            </Button>
          )}
          rowActions={(r) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Actions for ${r.expert}`}
                  disabled={
                    busyRowId === r.id
                  }
                >
                  {busyRowId === r.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={
                    busyRowId === r.id
                  }
                  onClick={() =>
                    changeStatus(
                      r.id,
                      "processing",
                      "Payout processing",
                    )
                  }
                >
                  Process now
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled={
                    busyRowId === r.id
                  }
                  onClick={() =>
                    changeStatus(
                      r.id,
                      "paid",
                      "Marked paid",
                    )
                  }
                >
                  Mark paid
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled={
                    busyRowId === r.id
                  }
                  onClick={() =>
                    changeStatus(
                      r.id,
                      "on-hold",
                      "Payout held",
                    )
                  }
                >
                  Place on hold
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    toast.success(
                      "Remittance advice sent",
                    )
                  }
                >
                  Send remittance
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive"
                  disabled={
                    busyRowId === r.id
                  }
                  onClick={() =>
                    handleDelete(r.id)
                  }
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </AdminLayout>
    </>
  );
}

export default PaymentsPage;
