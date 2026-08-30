import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  AdminPageHeader,
  StatCard,
  StatusBadge,
  formatDate,
  formatMoney,
  relativeTime,
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
import { CustomersTableSkeleton } from "@/components/skeletons/CustomersTableSkeleton";
import { LoadingOverlay } from "@/components/skeletons/LoadingOverlay";
import { useDebounce } from "@/hooks/useDebounce";
import { useInitialLoading } from "@/hooks/useInitialLoading";
import { useErrorToast } from "@/hooks/useErrorToast";
import {
  bulkEmailCustomers,
  bulkUpdateCustomers,
  deleteCustomer,
  getCustomerStatistics,
  listCustomers,
  messageCustomer,
  updateCustomer,
  type Customer,
  type CustomerStatus,
} from "@/services/customerService";

const PER_PAGE = 20;

function CustomersPage() {
  const queryClient = useQueryClient();

  const [status, setStatus] = useState(ALL);
  const [country, setCountry] = useState(ALL);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("joinedAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [busyRowId, setBusyRowId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const listParams = {
    page,
    per_page: PER_PAGE,
    search: debouncedSearch || undefined,
    status: status === ALL ? undefined : (status as CustomerStatus),
    country: country === ALL ? undefined : country,
    sort_by: sortBy,
    direction,
  };

  const customersQuery = useQuery({
    queryKey: ["customers", listParams],
    queryFn: () => listCustomers(listParams),
    placeholderData: keepPreviousData,
  });

  const statsQuery = useQuery({
    queryKey: ["customers", "statistics"],
    queryFn: getCustomerStatistics,
  });

  useErrorToast(customersQuery.isError, "Unable to load customers.");
  useErrorToast(statsQuery.isError, "Unable to load statistics.");

  const initialTableLoading = useInitialLoading(customersQuery.isFetching);
  const initialStatsLoading = useInitialLoading(statsQuery.isFetching);

  const statistics = statsQuery.data ?? {
    total: 0,
    active: 0,
    lifetime_revenue: 0,
    restricted: 0,
  };

  const rows = customersQuery.data?.items ?? [];
  const pagination = customersQuery.data?.pagination;
  const countries =
    customersQuery.data?.countries ?? [...new Set(rows.map((r) => r.country))].sort();

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["customers"] });
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

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      sortValue: (r) => r.name,
      render: (r) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      ),
    },
    { key: "country", header: "Country", sortValue: (r) => r.country, render: (r) => r.country },
    {
      key: "requests",
      header: "Requests",
      sortValue: (r) => r.requests,
      render: (r) => r.requests,
    },
    { key: "orders", header: "Orders", sortValue: (r) => r.orders, render: (r) => r.orders },
    {
      key: "spend",
      header: "Lifetime spend",
      sortValue: (r) => r.spend,
      render: (r) => formatMoney(r.spend),
    },
    {
      key: "joined",
      header: "Joined",
      sortValue: (r) => r.joinedAt,
      render: (r) => formatDate(r.joinedAt),
    },
    {
      key: "active",
      header: "Last active",
      sortValue: (r) => r.lastActive,
      render: (r) => relativeTime(r.lastActive),
    },
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
        title="Customers"
        description="Accounts, spend history and moderation actions."
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
              label="Total customers"
              value={String(statistics.total)}
              delta={statistics.total_delta}
              hint="this month"
            />
            <StatCard label="Active" value={String(statistics.active)} />
            <StatCard
              label="Lifetime revenue"
              value={formatMoney(statistics.lifetime_revenue)}
            />
            <StatCard label="Restricted" value={String(statistics.restricted)} />
          </>
        )}
      </div>

      <DataTable
        initialLoading={initialTableLoading}
        refreshing={customersQuery.isFetching && !initialTableLoading}
        loadingSkeleton={<CustomersTableSkeleton />}
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
        searchText={(r) => `${r.name} ${r.email} ${r.country}`}
        searchPlaceholder="Search customers…"
        emptyMessage={
          customersQuery.isError ? "Unable to load customers." : "No customers match these filters."
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
            options: ["active", "pending", "suspended", "banned"].map((s) => ({
              value: s,
              label: s,
            })),
          },
          {
            key: "country",
            label: "Country",
            value: country,
            onChange: (value) => {
              setCountry(value);
              setPage(1);
            },
            options: countries.map((c) => ({ value: c, label: c })),
          },
        ]}
        bulkActions={(ids, clear) => (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await bulkEmailCustomers(ids);
                  clear();
                  toast.success(`Email sent to ${ids.length} customers`);
                } catch {
                  toast.error("Unable to send emails");
                }
              }}
            >
              Send email
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await bulkUpdateCustomers(ids, { status: "suspended" });
                  clear();
                  refresh();
                  toast.success("Accounts suspended");
                } catch {
                  toast.error("Unable to suspend accounts");
                }
              }}
            >
              Suspend
            </Button>
          </>
        )}
        rowActions={(r) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Actions for ${r.name}`}
                disabled={busyRowId === r.id}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href={`mailto:${r.email}`}>View profile</a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  runRowAction(
                    r.id,
                    () => messageCustomer(r.id, { body: "Hi, following up on your account." }),
                    "Message sent",
                  )
                }
              >
                Message customer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  runRowAction(
                    r.id,
                    () => updateCustomer(r.id, { status: "active" }),
                    "Account activated",
                  )
                }
              >
                Activate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  runRowAction(
                    r.id,
                    () => updateCustomer(r.id, { status: "suspended" }),
                    "Account suspended",
                  )
                }
              >
                Suspend
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  runRowAction(
                    r.id,
                    () => updateCustomer(r.id, { status: "banned" }),
                    "Account banned",
                  )
                }
              >
                Ban account
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => runRowAction(r.id, () => deleteCustomer(r.id), "Customer deleted")}
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

export default CustomersPage;
