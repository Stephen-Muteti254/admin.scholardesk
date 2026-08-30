import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader, StatCard, StatusBadge, formatDate, relativeTime } from "@/components/admin/AdminUI";
import { ALL, DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { licenses as seed, type License } from "@/data/admin/mock";
import { deleteLicense, revokeLicense, updateLicense } from "@/services/adminService";

function StealthPage() {
  const [rows, setRows] = useState<License[]>(seed);
  const [status, setStatus] = useState(ALL);
  const [plan, setPlan] = useState(ALL);
  const [search, setSearch] = useState("");

  const term = search.trim().toLowerCase();
  const filtered = rows.filter(
    (r) =>
      (status === ALL || r.status === status) &&
      (plan === ALL || r.plan === plan) &&
      (term === "" ||
        `${r.key} ${r.customer} ${r.email} ${r.plan}`.toLowerCase().includes(term)),
  );
  const patch = (id: string, p: Partial<License>, message: string) => {
    void updateLicense(id, p as Record<string, unknown>).catch(() => {});
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));
    if (message) toast.success(message);
  };

  const columns: Column<License>[] = [
    { key: "key", header: "Licence", sortValue: (r) => r.key, render: (r) => (
      <div><p className="font-mono text-xs font-medium">{r.key}</p><p className="text-xs text-muted-foreground">{r.plan} · {r.os}</p></div>
    ) },
    { key: "customer", header: "Customer", sortValue: (r) => r.customer, render: (r) => (
      <div><p className="text-sm">{r.customer}</p><p className="text-xs text-muted-foreground">{r.email}</p></div>
    ) },
    { key: "devices", header: "Devices", sortValue: (r) => r.devices, render: (r) => `${r.devices}/${r.maxDevices}` },
    { key: "issued", header: "Issued", sortValue: (r) => r.issuedAt, render: (r) => formatDate(r.issuedAt) },
    { key: "expires", header: "Expires", sortValue: (r) => r.expiresAt, render: (r) => formatDate(r.expiresAt) },
    { key: "seen", header: "Last seen", sortValue: (r) => r.lastSeen, render: (r) => relativeTime(r.lastSeen) },
    { key: "status", header: "Status", sortValue: (r) => r.status, render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>      <AdminLayout>
        <AdminPageHeader
          title="ExamStealth licences"
          description="Desktop app entitlements, device binding and revocation controls."
          actions={<Button variant="hero" onClick={() => toast.success("Licence issued and emailed")}><Plus className="h-4 w-4" /> Issue licence</Button>}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Licences" value={String(rows.length)} />
          <StatCard label="Active" value={String(rows.filter((r) => r.status === "active").length)} delta="+2" />
          <StatCard label="Devices bound" value={String(rows.reduce((s, r) => s + r.devices, 0))} />
          <StatCard label="Revoked" value={String(rows.filter((r) => r.status === "revoked").length)} />
        </div>

        <DataTable
          page={1}
          totalPages={1}
          onPageChange={() => undefined}
          searchValue={search}
          onSearchChange={setSearch}
          rows={filtered}
          columns={columns}
          getId={(r) => r.id}
          searchText={(r) => `${r.key} ${r.customer} ${r.email} ${r.plan}`}
          searchPlaceholder="Search licence key or customer…"
          filters={[
            { key: "status", label: "Status", value: status, onChange: setStatus, options: ["active", "pending", "expired", "revoked"].map((s) => ({ value: s, label: s })) },
            { key: "plan", label: "Plan", value: plan, onChange: setPlan, options: ["Trial", "Single Exam", "Semester", "Enterprise"].map((s) => ({ value: s, label: s })) },
          ]}
          bulkActions={(ids, clear) => (
            <>
              <Button size="sm" variant="outline" onClick={() => { ids.forEach((id) => patch(id, { status: "active" }, "")); clear(); toast.success("Licences activated"); }}>Activate</Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => { ids.forEach((id) => { void revokeLicense(id).catch(() => {}); patch(id, { status: "revoked" }, ""); }); clear(); toast.success("Licences revoked"); }}>Revoke</Button>
            </>
          )}
          rowActions={(r) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Actions for ${r.key}`}><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => patch(r.id, { status: "active" }, "Licence activated")}>Activate</DropdownMenuItem>
                <DropdownMenuItem onClick={() => patch(r.id, { devices: 0 }, "Devices unbound")}>Reset device binding</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("Expiry extended by 30 days")}>Extend 30 days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("Setup instructions resent")}>Resend setup email</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { void revokeLicense(r.id).catch(() => {}); patch(r.id, { status: "revoked" }, "Licence revoked"); }}>Revoke</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => { void deleteLicense(r.id).catch(() => {}); setRows((p) => p.filter((x) => x.id !== r.id)); toast.success("Licence deleted"); }}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </AdminLayout>
    </>
  );
}

export default StealthPage;
