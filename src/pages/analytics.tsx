import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader, StatCard, formatMoney } from "@/components/admin/AdminUI";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { ChartCardSkeleton } from "@/components/skeletons/ChartCardSkeleton";
import { useInitialLoading } from "@/hooks/useInitialLoading";
import { useErrorToast } from "@/hooks/useErrorToast";
import { getAnalyticsOverview, getAnalyticsStatistics } from "@/services/analyticsService";

function Analytics() {
  const statsQuery = useQuery({
    queryKey: ["analytics", "statistics"],
    queryFn: () => getAnalyticsStatistics(),
  });

  const overviewQuery = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => getAnalyticsOverview(),
  });

  useErrorToast(statsQuery.isError, "Unable to load analytics statistics.");
  useErrorToast(overviewQuery.isError, "Unable to load analytics overview.");

  const initialStatsLoading = useInitialLoading(statsQuery.isFetching);
  const initialOverviewLoading = useInitialLoading(overviewQuery.isFetching);

  const stats = statsQuery.data;
  const revenueTrend = overviewQuery.data?.revenueTrend ?? [];
  const requestFunnel = overviewQuery.data?.requestFunnel ?? [];
  const topMaterials = overviewQuery.data?.topMaterials ?? [];
  const topMax = topMaterials[0]?.revenue ?? 1;

  return (
    <AdminLayout>
      <AdminPageHeader title="Analytics" description="Performance across materials, services and licences." />

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
              label="Gross revenue (6mo)"
              value={formatMoney(stats?.gross_revenue ?? 0)}
              delta={stats?.gross_revenue_delta}
            />
            <StatCard
              label="Quote → paid"
              value={`${Math.round((stats?.conversion_rate ?? 0) * 100)}%`}
              delta={stats?.conversion_rate_delta}
              hint="conversion"
            />
            <StatCard
              label="Avg. order value"
              value={formatMoney(stats?.avg_order_value ?? 0)}
              delta={stats?.avg_order_value_delta}
            />
            <StatCard label="Completed jobs" value={String(stats?.completed_jobs ?? 0)} hint="all time" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {initialOverviewLoading ? (
          <ChartCardSkeleton />
        ) : (
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold">Service revenue trend</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="services" stroke="var(--chart-1)" strokeWidth={2} />
                  <Line type="monotone" dataKey="stealth" stroke="var(--chart-3)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {initialOverviewLoading ? (
          <ChartCardSkeleton />
        ) : (
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold">Weekly request funnel</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestFunnel}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="quoted" fill="var(--chart-2)" radius={4} />
                  <Bar dataKey="converted" fill="var(--chart-1)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold">Top materials by revenue</h2>
        {initialOverviewLoading ? (
          <ul className="mt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="hidden h-2 w-40 rounded-full sm:block" />
                <Skeleton className="h-4 w-16" />
              </li>
            ))}
          </ul>
        ) : topMaterials.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {overviewQuery.isError ? "Unable to load materials." : "No material sales yet."}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {topMaterials.map((m) => (
              <li key={m.id} className="flex items-center gap-4">
                <span className="min-w-0 flex-1 truncate text-sm">{m.title}</span>
                <div className="hidden h-2 w-40 overflow-hidden rounded-full bg-secondary sm:block">
                  <div
                    className="h-full bg-accent-gradient"
                    style={{ width: `${(m.revenue / topMax) * 100}%` }}
                  />
                </div>
                <span className="w-24 text-right text-sm font-medium">{formatMoney(m.revenue)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}

export default Analytics;