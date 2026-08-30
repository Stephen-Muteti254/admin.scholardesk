import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bot, BookOpen, CreditCard, LifeBuoy, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  AdminPageHeader,
  StatCard,
  StatusBadge,
  formatMoney,
  relativeTime,
} from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { ChartCardSkeleton } from "@/components/skeletons/ChartCardSkeleton";
import { ListSkeleton } from "@/components/skeletons/ListSkeleton";
import { useInitialLoading } from "@/hooks/useInitialLoading";
import { useErrorToast } from "@/hooks/useErrorToast";
import { getDashboardOverview, getDashboardStatistics } from "@/services/dashboardService";

function Dashboard() {
  const statsQuery = useQuery({
    queryKey: ["dashboard", "statistics"],
    queryFn: getDashboardStatistics,
  });

  const overviewQuery = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: getDashboardOverview,
  });

  useErrorToast(statsQuery.isError, "Unable to load dashboard statistics.");
  useErrorToast(overviewQuery.isError, "Unable to load dashboard overview.");

  const initialStatsLoading = useInitialLoading(statsQuery.isFetching);
  const initialOverviewLoading = useInitialLoading(overviewQuery.isFetching);

  const stats = statsQuery.data;
  const revenueSeries = overviewQuery.data?.revenueSeries ?? [];
  const requestFunnel = overviewQuery.data?.requestFunnel ?? [];
  const needsAttention = overviewQuery.data?.needsAttention ?? [];
  const latestOrders = overviewQuery.data?.latestOrders ?? [];

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Operations dashboard"
        description="Live view of every revenue line and service queue across ScholarEdge and ExamStealth."
        actions={
          <Button variant="hero" asChild>
            <Link to="/ai-requests">Go to service desk</Link>
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
              label="Revenue (this month)"
              value={formatMoney(stats?.revenue ?? 0)}
              delta={stats?.revenue_delta}
              hint="vs last month"
              icon={<CreditCard className="h-4 w-4" />}
            />
            <StatCard
              label="Open requests"
              value={String(stats?.open_requests ?? 0)}
              delta={stats?.open_requests_delta}
              hint="last 24h"
              icon={<LifeBuoy className="h-4 w-4" />}
            />
            <StatCard
              label="Material sales"
              value={formatMoney(stats?.material_sales ?? 0)}
              delta={stats?.material_sales_delta}
              hint="this month"
              icon={<BookOpen className="h-4 w-4" />}
            />
            <StatCard
              label="Active licences"
              value={String(stats?.active_licenses ?? 0)}
              delta={stats?.active_licenses_delta}
              hint="ExamStealth"
              icon={<Bot className="h-4 w-4" />}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {initialOverviewLoading ? (
            <ChartCardSkeleton />
          ) : (
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h2 className="text-sm font-semibold">Revenue by line</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueSeries}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="materials"
                      stackId="1"
                      stroke="var(--chart-1)"
                      fill="var(--chart-1)"
                      fillOpacity={0.35}
                    />
                    <Area
                      type="monotone"
                      dataKey="services"
                      stackId="1"
                      stroke="var(--chart-2)"
                      fill="var(--chart-2)"
                      fillOpacity={0.35}
                    />
                    <Area
                      type="monotone"
                      dataKey="stealth"
                      stackId="1"
                      stroke="var(--chart-3)"
                      fill="var(--chart-3)"
                      fillOpacity={0.35}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {initialOverviewLoading ? (
          <ChartCardSkeleton />
        ) : (
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold">Request funnel (7 days)</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestFunnel}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="requests" fill="var(--chart-2)" radius={4} />
                  <Bar dataKey="converted" fill="var(--chart-1)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="text-sm font-semibold">Needs attention</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/exam-help">View queue</Link>
            </Button>
          </div>
          {initialOverviewLoading ? (
            <ListSkeleton rows={5} trailing="badge" />
          ) : needsAttention.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              {overviewQuery.isError ? "Unable to load requests." : "Nothing needs attention right now."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {needsAttention.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.typeLabel} · {r.customer.name} · {relativeTime(r.createdAt)}
                    </p>
                  </div>
                  <StatusBadge value={r.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="text-sm font-semibold">Latest orders</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">All orders</Link>
            </Button>
          </div>
          {initialOverviewLoading ? (
            <ListSkeleton rows={5} trailing="value" />
          ) : latestOrders.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              {overviewQuery.isError ? "Unable to load orders." : "No orders yet."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {latestOrders.slice(0, 5).map((o) => (
                <li key={o.id} className="flex items-center gap-3 p-4">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{o.materialTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.ref} · {o.customer.name}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{formatMoney(o.amount)}</span>
                  <StatusBadge value={o.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;