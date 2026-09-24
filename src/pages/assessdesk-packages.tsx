import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, MoreHorizontal, Plus } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader, StatCard, StatusBadge, formatDate, formatDateTime } from "@/components/admin/AdminUI";
import { ALL, DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { TokensTableSkeleton } from "@/components/skeletons/TokensTableSkeleton";
import { LoadingOverlay } from "@/components/skeletons/LoadingOverlay";
import { useDebounce } from "@/hooks/useDebounce";
import {
  createPackage,
  getAssessDeskStatistics,
  listPackages,
  listPurchases,
  updatePackage,
  type AssessDeskPackage,
  type AssessDeskPurchase,
  type AssessDeskStatistics,
  type PackagePayload,
  type PurchaseStatus,
} from "@/services/assessdeskService";

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);

const apiMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? fallback;

type FormState = {
  name: string;
  description: string;
  questions: string;
  validity_days: string;
  price: string;
  currency: string;
  sort_order: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  questions: "",
  validity_days: "",
  price: "",
  currency: "KES",
  sort_order: "0",
  is_active: true,
};

function AssessDeskPackagesPage() {
  /* ---------- statistics ---------- */
  const [stats, setStats] = useState<AssessDeskStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStatistics = async () => {
    try {
      setStats(await getAssessDeskStatistics());
    } catch {
      toast.error("Unable to load AssessDesk statistics.");
    } finally {
      setStatsLoading(false);
    }
  };

  /* ---------- packages ---------- */
  const [packages, setPackages] = useState<AssessDeskPackage[]>([]);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [pkgRefreshing, setPkgRefreshing] = useState(false);
  const [pkgSearch, setPkgSearch] = useState("");
  const [busyPkgId, setBusyPkgId] = useState<string | null>(null);

  const loadPackages = async (initial = false) => {
    try {
      if (!initial) setPkgRefreshing(true);
      setPackages(await listPackages());
    } catch {
      toast.error("Unable to load packages.");
    } finally {
      setPkgLoading(false);
      setPkgRefreshing(false);
    }
  };

  /* ---------- purchases ---------- */
  const [purchases, setPurchases] = useState<AssessDeskPurchase[]>([]);
  const [purLoading, setPurLoading] = useState(true);
  const [purRefreshing, setPurRefreshing] = useState(false);
  const [purPage, setPurPage] = useState(1);
  const [purPages, setPurPages] = useState(1);
  const [purSearch, setPurSearch] = useState("");
  const [purStatus, setPurStatus] = useState(ALL);
  const debouncedPurSearch = useDebounce(purSearch, 300);
  const purFirst = useRef(true);

  const loadPurchases = async (initial = false) => {
    try {
      if (initial) setPurLoading(true);
      else setPurRefreshing(true);
      const res = await listPurchases({
        page: purPage,
        per_page: 20,
        search: debouncedPurSearch || undefined,
        status: purStatus === ALL ? undefined : (purStatus as PurchaseStatus),
      });
      setPurchases(res.items);
      setPurPages(res.pagination.pages || 1);
    } catch {
      toast.error("Unable to load purchases.");
    } finally {
      setPurLoading(false);
      setPurRefreshing(false);
    }
  };

  useEffect(() => {
    void loadStatistics();
    void loadPackages(true);
  }, []);

  useEffect(() => {
    void loadPurchases(purFirst.current);
    purFirst.current = false;
  }, [purPage, purStatus, debouncedPurSearch]);

  /* ---------- package dialog ---------- */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AssessDeskPackage | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: AssessDeskPackage) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      questions: String(p.questions),
      validity_days: String(p.validity_days),
      price: String(p.price),
      currency: p.currency,
      sort_order: String(p.sort_order),
      is_active: p.is_active,
    });
    setDialogOpen(true);
  };

  const savePackage = async () => {
    const payload: PackagePayload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      questions: Number(form.questions),
      validity_days: Number(form.validity_days),
      price: Number(form.price),
      currency: form.currency.trim().toUpperCase(),
      sort_order: Number(form.sort_order || 0),
      is_active: form.is_active,
    };
    if (!payload.name || !payload.questions || !payload.validity_days || Number.isNaN(payload.price)) {
      toast.error("Name, questions, validity and price are required.");
      return;
    }
    try {
      setSaving(true);
      if (editing) await updatePackage(editing.id, payload);
      else await createPackage(payload);
      setDialogOpen(false);
      await loadPackages();
      toast.success(editing ? "Package updated." : "Package created.");
    } catch (err) {
      toast.error(apiMessage(err, "Unable to save package."));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: AssessDeskPackage) => {
    try {
      setBusyPkgId(p.id);
      await updatePackage(p.id, { is_active: !p.is_active });
      await loadPackages();
      toast.success(p.is_active ? "Package hidden from the store." : "Package is now on sale.");
    } catch (err) {
      toast.error(apiMessage(err, "Unable to update package."));
    } finally {
      setBusyPkgId(null);
    }
  };

  /* ---------- columns ---------- */
  const pkgTerm = pkgSearch.trim().toLowerCase();
  const visiblePackages = packages.filter(
    (p) => pkgTerm === "" || `${p.name} ${p.description ?? ""}`.toLowerCase().includes(pkgTerm),
  );

  const packageColumns: Column<AssessDeskPackage>[] = [
    {
      key: "name",
      header: "Package",
      sortValue: (r) => r.name,
      render: (r) => (
        <div>
          <p className="font-medium">{r.name}</p>
          {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
        </div>
      ),
    },
    { key: "questions", header: "Questions", sortValue: (r) => r.questions, render: (r) => r.questions },
    {
      key: "validity",
      header: "Valid for",
      sortValue: (r) => r.validity_days,
      render: (r) => `${r.validity_days} day${r.validity_days === 1 ? "" : "s"}`,
    },
    { key: "price", header: "Price", sortValue: (r) => r.price, render: (r) => money(r.price, r.currency) },
    {
      key: "per",
      header: "Per question",
      sortValue: (r) => r.price / r.questions,
      render: (r) => money(r.price / r.questions, r.currency),
    },
    { key: "order", header: "Order", sortValue: (r) => r.sort_order, render: (r) => r.sort_order },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => (r.is_active ? 1 : 0),
      render: (r) => <StatusBadge value={r.is_active ? "active" : "inactive"} />,
    },
  ];

  const purchaseColumns: Column<AssessDeskPurchase>[] = [
    {
      key: "user",
      header: "Customer",
      sortValue: (r) => r.user?.email ?? "",
      render: (r) => (
        <div>
          <p className="text-sm">{r.user?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{r.user?.email}</p>
        </div>
      ),
    },
    {
      key: "package",
      header: "Package",
      sortValue: (r) => r.package_name ?? "",
      render: (r) => (
        <div>
          <p className="text-sm">{r.package_name ?? "—"}</p>
          <p className="font-mono text-xs text-muted-foreground">{r.reference}</p>
        </div>
      ),
    },
    { key: "questions", header: "Questions", sortValue: (r) => r.questions, render: (r) => r.questions },
    { key: "amount", header: "Amount", sortValue: (r) => r.amount, render: (r) => money(r.amount, r.currency) },
    {
      key: "created",
      header: "Started",
      sortValue: (r) => r.created_at ?? "",
      render: (r) => (r.created_at ? formatDateTime(r.created_at) : "—"),
    },
    {
      key: "paid",
      header: "Paid",
      sortValue: (r) => r.paid_at ?? "",
      render: (r) => (r.paid_at ? formatDate(r.paid_at) : "—"),
    },
    { key: "status", header: "Status", sortValue: (r) => r.status, render: (r) => <StatusBadge value={r.status} /> },
  ];

  const revenueText =
    stats && stats.revenue.length
      ? stats.revenue.map((r) => money(r.amount, r.currency)).join(" · ")
      : "No sales yet";

  return (
    <AdminLayout>
      <AdminPageHeader
        title="AssessDesk tokens & packages"
        description="Question packages sold on assessdesk.scholardesk.pro, Paystack purchases and credit usage."
        actions={
          <Button variant="hero" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New package
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading || !stats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Active users" value={String(stats.active_users)} hint={`${stats.accounts} accounts`} />
            <StatCard label="Questions sold" value={String(stats.questions_sold)} hint={revenueText} />
            <StatCard
              label="Used (7 days)"
              value={String(stats.questions_consumed_7d)}
              hint={`${stats.questions_outstanding} still unused`}
            />
            <StatCard label="Expiring (7 days)" value={String(stats.questions_expiring_7d)} hint="questions" />
          </>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Packages</h2>
        <DataTable
          initialLoading={pkgLoading}
          refreshing={pkgRefreshing}
          loadingSkeleton={<TokensTableSkeleton columns={7} rows={4} />}
          loadingOverlay={<LoadingOverlay />}
          rows={visiblePackages}
          columns={packageColumns}
          getId={(r) => r.id}
          searchText={(r) => `${r.name} ${r.description ?? ""}`}
          searchPlaceholder="Search packages…"
          page={1}
          totalPages={1}
          onPageChange={() => undefined}
          searchValue={pkgSearch}
          onSearchChange={setPkgSearch}
          emptyMessage="No packages yet. Create one to start selling."
          rowActions={(r) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Actions for ${r.name}`} disabled={busyPkgId === r.id}>
                  {busyPkgId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEdit(r)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => void toggleActive(r)}>
                  {r.is_active ? "Stop selling" : "Start selling"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Purchases</h2>
        <DataTable
          initialLoading={purLoading}
          refreshing={purRefreshing}
          loadingSkeleton={<TokensTableSkeleton columns={7} />}
          loadingOverlay={<LoadingOverlay />}
          rows={purchases}
          columns={purchaseColumns}
          getId={(r) => r.id}
          searchText={(r) => `${r.reference} ${r.user?.email ?? ""}`}
          searchPlaceholder="Search email or Paystack reference…"
          page={purPage}
          totalPages={purPages}
          onPageChange={setPurPage}
          searchValue={purSearch}
          onSearchChange={(v) => {
            setPurSearch(v);
            setPurPage(1);
          }}
          filters={[
            {
              key: "status",
              label: "Status",
              value: purStatus,
              onChange: (v) => {
                setPurStatus(v);
                setPurPage(1);
              },
              options: ["pending", "paid", "failed", "abandoned"].map((s) => ({ value: s, label: s })),
            },
          ]}
          emptyMessage="No purchases yet."
        />
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit package" : "New package"}</DialogTitle>
            <DialogDescription>
              Changes apply to new purchases only. Existing buyers keep what they paid for.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="pkg-name">Name</Label>
              <Input id="pkg-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pkg-desc">Description</Label>
              <Input
                id="pkg-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pkg-q">Questions</Label>
                <Input
                  id="pkg-q"
                  type="number"
                  min={1}
                  value={form.questions}
                  onChange={(e) => setForm({ ...form, questions: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pkg-v">Valid for (days)</Label>
                <Input
                  id="pkg-v"
                  type="number"
                  min={1}
                  value={form.validity_days}
                  onChange={(e) => setForm({ ...form, validity_days: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pkg-p">Price</Label>
                <Input
                  id="pkg-p"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pkg-c">Currency</Label>
                <Input
                  id="pkg-c"
                  maxLength={3}
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pkg-o">Display order</Label>
                <Input
                  id="pkg-o"
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                />
              </div>
              <div className="flex items-end gap-3 pb-2">
                <Switch
                  id="pkg-a"
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                <Label htmlFor="pkg-a">On sale</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="hero" onClick={() => void savePackage()} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} {editing ? "Save changes" : "Create package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default AssessDeskPackagesPage;
