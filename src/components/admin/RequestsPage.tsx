import { useEffect, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, MoreHorizontal, Plus } from "lucide-react";
import { AdminLayout } from "./AdminLayout";
import {
  AdminPageHeader,
  StatCard,
  StatusBadge,
  formatDate,
  formatMoney,
  relativeTime,
} from "./AdminUI";
import { ALL, DataTable, type Column } from "./DataTable";
import { RequestWorkspace } from "./RequestWorkspace";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  admins,
  priorities,
  requestStatuses,
  requestTypeLabels,
  type RequestStatus,
  type RequestType,
  type ServiceRequest,
} from "@/data/admin/mock";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { RequestsTableSkeleton } from "@/components/skeletons/RequestsTableSkeleton";
import { LoadingOverlay } from "@/components/skeletons/LoadingOverlay";
import { useDebounce } from "@/hooks/useDebounce";
import { useInitialLoading } from "@/hooks/useInitialLoading";
import { useErrorToast } from "@/hooks/useErrorToast";
import {
  bulkDeleteRequests,
  bulkUpdateRequests,
  deleteRequest,
  exportRequests,
  getRequestStatistics,
  listRequests,
  sendRequestReminder,
  updateRequest,
} from "@/services/requestService";

const PER_PAGE = 20;

export function RequestsPage({
  title,
  description,
  types,
}: {
  title: string;
  description: string;
  types: RequestType[];
}) {
  const queryClient = useQueryClient();
  const typesKey = types.join(",");

  const [status, setStatus] = useState(ALL);
  const [priority, setPriority] = useState(ALL);
  const [owner, setOwner] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [active, setActive] = useState<ServiceRequest | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const listParams = {
    page,
    per_page: PER_PAGE,
    search: debouncedSearch || undefined,
    types: typesKey,
    type: type === ALL ? undefined : type,
    status: status === ALL ? undefined : status,
    priority: priority === ALL ? undefined : priority,
    assigned_to: owner === ALL ? undefined : owner,
    sort_by: sortBy,
    direction,
  };

  const requestsQuery = useQuery({
    queryKey: ["requests", listParams],
    queryFn: () => listRequests(listParams),
    placeholderData: keepPreviousData,
  });

  const statsQuery = useQuery({
    queryKey: ["requests", "statistics", typesKey],
    queryFn: () => getRequestStatistics({ types: typesKey }),
  });

  useErrorToast(requestsQuery.isError, `Unable to load ${title.toLowerCase()} requests.`);
  useErrorToast(statsQuery.isError, "Unable to load statistics.");

  const initialTableLoading = useInitialLoading(requestsQuery.isFetching);
  const initialStatsLoading = useInitialLoading(statsQuery.isFetching);

  const statistics = statsQuery.data ?? {
    total: 0,
    awaiting_triage: 0,
    open_pipeline: 0,
    completed: 0,
  };

  const rows = requestsQuery.data?.items ?? [];
  const pagination = requestsQuery.data?.pagination;

  // Keep the open workspace in sync with refreshed server data.
  useEffect(() => {
    if (!active) return;
    const fresh = rows.find((r) => r.id === active.id);
    if (fresh && fresh !== active) setActive(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestsQuery.data]);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["requests"] });
  };

  const change = (id: string, patch: Partial<ServiceRequest>) => {
    setActive((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
    updateRequest(id, patch as never)
      .then(refresh)
      .catch(() => toast.error("Unable to save changes"));
  };

  const remove = (id: string) => {
    setActive((prev) => (prev && prev.id === id ? null : prev));
    deleteRequest(id)
      .then(refresh)
      .catch(() => toast.error("Unable to delete request"));
  };

  const quickStatus = (row: ServiceRequest, next: RequestStatus) => {
    change(row.id, { status: next });
    toast.success(`${row.ref} → ${next.replace(/-/g, " ")}`);
  };

  const columns: Column<ServiceRequest>[] = [
    {
      key: "ref",
      header: "Request",
      sortValue: (r) => r.ref,
      render: (r) => (
        <div className="min-w-56">
          <p className="font-medium leading-tight">{r.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {r.ref} · {requestTypeLabels[r.type]}
          </p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortValue: (r) => r.customer.name,
      render: (r) => (
        <div>
          <p className="text-sm font-medium">{r.customer.name}</p>
          <p className="text-xs text-muted-foreground">{r.customer.country}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.status,
      render: (r) => <StatusBadge value={r.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      sortValue: (r) => r.priority,
      render: (r) => <StatusBadge value={r.priority} />,
    },
    {
      key: "owner",
      header: "Owner",
      sortValue: (r) => r.assignedTo ?? "zz",
      render: (r) => (
        <span className={r.assignedTo ? "text-sm" : "text-sm text-muted-foreground"}>
          {r.assignedTo ?? "Unassigned"}
        </span>
      ),
    },
    {
      key: "value",
      header: "Value",
      sortValue: (r) => r.quotes.at(-1)?.amount ?? r.budget ?? 0,
      render: (r) => (
        <span className="text-sm font-medium">
          {formatMoney(r.quotes.at(-1)?.amount ?? r.budget ?? 0)}
        </span>
      ),
    },
    {
      key: "deadline",
      header: "Deadline",
      sortValue: (r) => r.deadline,
      render: (r) => (
        <div className="text-sm">
          {formatDate(r.deadline)}
          <p className="text-xs text-muted-foreground">updated {relativeTime(r.updatedAt)}</p>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const blob = await exportRequests(listParams);
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "requests.csv";
                  link.click();
                  URL.revokeObjectURL(url);
                  toast.success("Export ready");
                } catch {
                  toast.error("Export failed");
                }
              }}
            >
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="hero" onClick={() => toast.success("Manual request form opened")}>
              <Plus className="h-4 w-4" /> New request
            </Button>
          </>
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
              label="Total requests"
              value={String(statistics.total)}
              hint="in this queue"
            />
            <StatCard
              label="Awaiting triage"
              value={String(statistics.awaiting_triage)}
              delta={statistics.awaiting_triage_delta}
              hint="today"
            />
            <StatCard
              label="Open pipeline"
              value={formatMoney(statistics.open_pipeline)}
              delta={statistics.open_pipeline_delta}
              hint="vs last week"
            />
            <StatCard
              label="Completed"
              value={String(statistics.completed)}
              hint="lifetime"
            />
          </>
        )}
      </div>

      <DataTable
        initialLoading={initialTableLoading}
        refreshing={requestsQuery.isFetching && !initialTableLoading}
        loadingSkeleton={<RequestsTableSkeleton />}
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
        searchText={(r) =>
          `${r.ref} ${r.title} ${r.customer.name} ${r.customer.email} ${r.subject} ${r.tags.join(" ")}`
        }
        searchPlaceholder="Search by ref, customer, subject…"
        onRowClick={setActive}
        filters={[
          {
            key: "status",
            label: "Status",
            value: status,
            onChange: (value) => {
              setStatus(value);
              setPage(1);
            },
            options: requestStatuses.map((s) => ({ value: s, label: s.replace(/-/g, " ") })),
          },
          {
            key: "priority",
            label: "Priority",
            value: priority,
            onChange: (value) => {
              setPriority(value);
              setPage(1);
            },
            options: priorities.map((p) => ({ value: p, label: p })),
          },
          {
            key: "owner",
            label: "Owner",
            value: owner,
            onChange: (value) => {
              setOwner(value);
              setPage(1);
            },
            options: admins.map((a) => ({ value: a, label: a })),
          },
          ...(types.length > 1
            ? [
                {
                  key: "type",
                  label: "Service",
                  value: type,
                  onChange: (value: string) => {
                    setType(value);
                    setPage(1);
                  },
                  options: types.map((t) => ({ value: t, label: requestTypeLabels[t] })),
                },
              ]
            : []),
        ]}
        bulkActions={(ids, clear) => (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await bulkUpdateRequests(ids, { status: "reviewing" });
                  clear();
                  refresh();
                  toast.success(`${ids.length} requests moved to reviewing`);
                } catch {
                  toast.error("Unable to update requests");
                }
              }}
            >
              Move to reviewing
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await bulkUpdateRequests(ids, { assignedTo: "Amara Okafor" });
                  clear();
                  refresh();
                  toast.success("Assigned to Amara Okafor");
                } catch {
                  toast.error("Unable to assign requests");
                }
              }}
            >
              Assign to me
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await bulkUpdateRequests(ids, { priority: "urgent" });
                  clear();
                  refresh();
                  toast.success("Priority raised to urgent");
                } catch {
                  toast.error("Unable to update priority");
                }
              }}
            >
              Flag urgent
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={async () => {
                try {
                  await bulkDeleteRequests(ids);
                  clear();
                  refresh();
                  toast.success(`${ids.length} requests deleted`);
                } catch {
                  toast.error("Unable to delete requests");
                }
              }}
            >
              Delete
            </Button>
          </>
        )}
        rowActions={(r) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${r.ref}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{r.ref}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setActive(r)}>Open workspace</DropdownMenuItem>
              <DropdownMenuItem onClick={() => quickStatus(r, "reviewing")}>
                Start review
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => quickStatus(r, "quoted")}>
                Mark quoted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => quickStatus(r, "in-progress")}>
                Mark in progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => quickStatus(r, "delivered")}>
                Mark delivered
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => quickStatus(r, "completed")}>
                Mark completed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await sendRequestReminder(r.id);
                    toast.success("Reminder email sent");
                  } catch {
                    toast.error("Unable to send reminder");
                  }
                }}
              >
                Send reminder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => quickStatus(r, "cancelled")}>
                Cancel request
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  remove(r.id);
                  toast.success(`${r.ref} deleted`);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        emptyMessage={
          requestsQuery.isError ? "Unable to load requests." : "No requests match these filters."
        }
      />

      <RequestWorkspace
        request={active}
        onClose={() => setActive(null)}
        onChange={change}
        onDelete={remove}
      />
    </AdminLayout>
  );
}
