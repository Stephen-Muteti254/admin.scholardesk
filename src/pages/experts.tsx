import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader, StatCard, StatusBadge, formatDate, formatMoney } from "@/components/admin/AdminUI";
import { ALL, DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Expert } from "@/data/admin/mock";
import {
    type ExpertStatus,
    listExperts,
    deleteExpert,
    updateExpertStatus,
    bulkUpdateExpertStatus,
    getExpertStatistics,
} from "@/services/expertService";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { ExpertsTableSkeleton } from "@/components/skeletons/ExpertsTableSkeleton";
import { LoadingOverlay } from "@/components/skeletons/LoadingOverlay";
import { useDebounce } from "@/hooks/useDebounce";

function ExpertsPage() {
  const [rows, setRows] = useState<Expert[]>([]);
  const [busyRowId, setBusyRowId] = useState<string | null>(null);

  const [initialTableLoading, setInitialTableLoading] = useState(true);
  const [refreshingTable, setRefreshingTable] = useState(false);

  const [initialStatsLoading, setInitialStatsLoading] = useState(true);
  const [refreshingStats, setRefreshingStats] = useState(false);
  
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
      total: 0,
      active: 0,
      active_jobs: 0,
      payout_due: 0,
  });
  const [status, setStatus] = useState(ALL);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [direction, setDirection] =
      useState<"asc" | "desc">("desc");

  const debouncedSearch = useDebounce(search, 300);

  const updateStatus = async (
    id: string,
    status: ExpertStatus,
    message: string,
  ) => {
    try {
      setBusyRowId(id);
      await updateExpertStatus(id, status);
      setRows(rows =>
        rows.map(row =>
          row.id === id
            ? {
              ...row,
              status,
            }
            : row
        )
      );
      toast.success(message);
    }
    catch {
        toast.error("Unable to update expert.");
    }
    finally {
        setBusyRowId(null);
    }
  };

  const loadExperts = async (
    initial = false,
  ) => {
    try {
      
      if (initial)
        setInitialTableLoading(true);
      else
        setRefreshingTable(true);      
      setError(null);
      const response = await listExperts({
        page,
        per_page: perPage,
        search: debouncedSearch,
        status: status === ALL ? undefined : status,
        sort_by: sortBy,
        direction,
      });

      setRows(response.items);
      setPagination(response.pagination);

    } catch {
      setError("Unable to load experts");
      toast.error("Unable to load experts.");
    } finally {
      setInitialTableLoading(false);
      setRefreshingTable(false);
    }
  };


  const loadStatistics = async () => {
    try {
        setInitialStatsLoading(true);
        const response = await getExpertStatistics();
        setStatistics({
            total: response.total,
            active: response.active,
            active_jobs: response.active_jobs,
            payout_due: response.payout_due,
        });
    }
    catch {
        toast.error("Unable to load statistics.");
    }
    finally {
        setInitialStatsLoading(false);
    }
  };

  useEffect(() => {
    void loadStatistics();
  }, []);

  const isFirstLoad = useRef(true);

  useEffect(() => {
    loadExperts(isFirstLoad.current);
    isFirstLoad.current = false;
  }, [page, status, debouncedSearch, sortBy, direction]);


  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatus = (value: string) => {
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

  const handlePage = (page: number) => {
    setPage(page);
  };


  const columns: Column<Expert>[] = [
    { key: "name", header: "Expert", sortValue: (r) => r.name, render: (r) => (
      <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.email}</p></div>
    ) },
    { key: "spec", header: "Specialities", render: (r) => (
      <div className="flex flex-wrap gap-1">{r.specialities.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div>
    ) },
    { key: "rating", header: "Rating", sortValue: (r) => r.rating, render: (r) => r.rating.toFixed(1) },
    { key: "active", header: "Active jobs", sortValue: (r) => r.activeJobs, render: (r) => r.activeJobs },
    { key: "completed", header: "Completed", sortValue: (r) => r.completed, render: (r) => r.completed },
    { key: "payout", header: "Payout due", sortValue: (r) => r.payoutDue, render: (r) => formatMoney(r.payoutDue) },
    { key: "joined", header: "Joined", sortValue: (r) => r.joinedAt, render: (r) => formatDate(r.joinedAt) },
    { key: "status", header: "Status", sortValue: (r) => r.status, render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>      <AdminLayout>
        <AdminPageHeader
          title="Experts"
          description="Roster management, capacity and quality control."
          actions={<Button variant="hero" onClick={() => toast.success("Expert invitation sent")}><Plus className="h-4 w-4" /> Invite expert</Button>}
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
                label="Roster"
                value={String(statistics.total)}
              />
              <StatCard
                label="Active"
                value={String(statistics.active)}
              />
              <StatCard
                label="Live jobs"
                value={String(statistics.active_jobs)}
              />
              <StatCard
                label="Payouts due"
                value={formatMoney(statistics.payout_due)}
              />
            </>
          )}
        </div>

        <DataTable
          initialLoading={initialTableLoading}
          refreshing={refreshingTable}
          loadingSkeleton={
            <ExpertsTableSkeleton />
          }
          loadingOverlay={
            <LoadingOverlay/>
          }
          rows={rows}
          columns={columns}
          page={page}
          totalPages={pagination.pages}
          onPageChange={setPage}
          searchValue={search}
          onSearchChange={handleSearch}
          sortKey={sortBy}
          sortDirection={direction}
          onSortChange={(key, dir) => {
            setSortBy(key);
            setDirection(dir);
          }}
          getId={(r) => r.id}
          searchText={(r) => `${r.name} ${r.email} ${r.specialities.join(" ")}`}
          searchPlaceholder="Search experts…"
          filters={[{ key: "status", label: "Status", value: status, onChange: setStatus, options: ["active", "onboarding", "paused", "offboarded"].map((s) => ({ value: s, label: s })) }]}
          bulkActions={(ids, clear) => (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await bulkUpdateExpertStatus(ids, "active");
                    clear();
                    await Promise.all([
                      loadExperts(),
                      loadStatistics(),
                    ]);
                    toast.success("Experts activated");
                  } catch {
                    toast.error("Activation failed");
                  }
                }}
              >
                Activate
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await bulkUpdateExpertStatus(ids, "paused");
                    clear();
                    await Promise.all([
                      loadExperts(),
                      loadStatistics(),
                    ]);
                    toast.success("Experts paused");
                  } catch {
                    toast.error("Pause failed");
                  }
                }}
              >
                Pause
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
                  {
                    busyRowId === r.id
                      ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )
                      : (
                        <MoreHorizontal className="h-4 w-4" />
                      )
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.success("Expert profile opened")}>View profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("Assignment panel opened")}>Assign to request</DropdownMenuItem>
                <DropdownMenuItem
                  disabled={busyRowId === r.id}
                  onClick={() =>
                    updateStatus(
                      r.id,
                      "active",
                      "Expert activated"
                    )
                  }
                >
                  Activate
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={busyRowId === r.id}
                  onClick={() =>
                    updateStatus(
                      r.id,
                      "paused",
                      "Expert paused"
                    )
                  }
                >
                  Pause
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={busyRowId === r.id}
                  onClick={() =>
                    updateStatus(
                      r.id,
                      "offboarded",
                      "Expert offboarded"
                    )
                  }
                >
                  Offboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={async () => {
                    setBusyRowId(r.id);
                    try {
                      await deleteExpert(r.id);

                      await Promise.all([
                        loadExperts(),
                        loadStatistics(),
                      ]);

                      toast.success("Expert removed");

                    } catch {
                      toast.error("Delete failed");
                    }
                    finally {
                      setBusyRowId(null);
                    }
                }}>
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

export default ExpertsPage;
