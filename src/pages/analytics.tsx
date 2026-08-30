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
import { materialRecords, requestVolumeSeries, revenueSeries, serviceRequests } from "@/data/admin/mock";

function Analytics() {
  const top = [...materialRecords].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  const converted = serviceRequests.filter((r) => r.status === "completed").length;

  return (
    <>      <AdminLayout>
        <AdminPageHeader title="Analytics" description="Performance across materials, services and licences." />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Gross revenue (6mo)" value={formatMoney(revenueSeries.reduce((s, r) => s + r.materials + r.services + r.stealth, 0))} delta="+18%" />
          <StatCard label="Quote → paid" value="63%" delta="+4pts" hint="conversion" />
          <StatCard label="Avg. order value" value={formatMoney(26)} delta="+3%" />
          <StatCard label="Completed jobs" value={String(converted)} hint="all time" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold">Service revenue trend</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueSeries}>
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
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold">Weekly request funnel</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestVolumeSeries}>
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
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold">Top materials by revenue</h2>
          <ul className="mt-4 space-y-3">
            {top.map((m) => (
              <li key={m.id} className="flex items-center gap-4">
                <span className="min-w-0 flex-1 truncate text-sm">{m.title}</span>
                <div className="hidden h-2 w-40 overflow-hidden rounded-full bg-secondary sm:block">
                  <div
                    className="h-full bg-accent-gradient"
                    style={{ width: `${(m.revenue / top[0].revenue) * 100}%` }}
                  />
                </div>
                <span className="w-24 text-right text-sm font-medium">{formatMoney(m.revenue)}</span>
              </li>
            ))}
          </ul>
        </div>
      </AdminLayout>
    </>
  );
}

export default Analytics;
