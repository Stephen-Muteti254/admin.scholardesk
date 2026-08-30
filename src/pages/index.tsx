import { Link } from "@tanstack/react-router";
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
import {
  licenses,
  orders,
  requestTypeLabels,
  revenueSeries,
  requestVolumeSeries,
  serviceRequests,
} from "@/data/admin/mock";

function Dashboard() {
  const openRequests = serviceRequests.filter(
    (r) => !["completed", "cancelled", "refunded"].includes(r.status),
  );
  const revenue = revenueSeries.at(-1)!;
  const total = revenue.materials + revenue.services + revenue.stealth;

  return (
    <>      <AdminLayout>
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
          <StatCard label="Revenue (Jul)" value={formatMoney(total)} delta="+14.2%" hint="vs June" icon={<CreditCard className="h-4 w-4" />} />
          <StatCard label="Open requests" value={String(openRequests.length)} delta="+6" hint="last 24h" icon={<LifeBuoy className="h-4 w-4" />} />
          <StatCard label="Material sales" value={formatMoney(revenue.materials)} delta="+12.8%" hint="Jul" icon={<BookOpen className="h-4 w-4" />} />
          <StatCard label="Active licences" value={String(licenses.filter((l) => l.status === "active").length)} delta="+2" hint="ExamStealth" icon={<Bot className="h-4 w-4" />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card xl:col-span-2">
            <h2 className="text-sm font-semibold">Revenue by line</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="materials" stackId="1" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.35} />
                  <Area type="monotone" dataKey="services" stackId="1" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.35} />
                  <Area type="monotone" dataKey="stealth" stackId="1" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.35} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold">Request funnel (7 days)</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestVolumeSeries}>
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
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="text-sm font-semibold">Needs attention</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/exam-help">View queue</Link>
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {openRequests.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {requestTypeLabels[r.type]} · {r.customer.name} · {relativeTime(r.createdAt)}
                    </p>
                  </div>
                  <StatusBadge value={r.status} />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="text-sm font-semibold">Latest orders</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/orders">All orders</Link>
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {orders.slice(0, 5).map((o) => (
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
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default Dashboard;
