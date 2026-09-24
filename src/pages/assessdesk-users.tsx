import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, MoreHorizontal, Plus } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader, StatusBadge, formatDateTime, relativeTime } from "@/components/admin/AdminUI";
import { ALL, DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TokensTableSkeleton } from "@/components/skeletons/TokensTableSkeleton";
import { LoadingOverlay } from "@/components/skeletons/LoadingOverlay";
import { useDebounce } from "@/hooks/useDebounce";
import {
  createGrant,
  extendGrant,
  listAccounts,
  listGrants,
  revokeGrant,
  searchUsers,
  setAccountEnabled,
  type AssessDeskAccount,
  type AssessDeskGrant,
  type GrantSource,
  type GrantStatus,
  type ListGrantsParams,
  type UserLookup,
} from "@/services/assessdeskService";

const apiMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? fallback;

const SORT_KEYS: Record<string, NonNullable<ListGrantsParams["sort_by"]>> = {
  granted: "granted_at",
  expires: "expires_at",
  remaining: "questions_remaining",
  status: "status",
};

function AssessDeskUsersPage() {
  /* ---------- grants ---------- */
  const [grants, setGrants] = useState<AssessDeskGrant[]>([]);
  const [gLoading, setGLoading] = useState(true);
  const [gRefreshing, setGRefreshing] = useState(false);
  const [gPage, setGPage] = useState(1);
  const [gPages, setGPages] = useState(1);
  const [gSearch, setGSearch] = useState("");
  const [gStatus, setGStatus] = useState(ALL);
  const [gSource, setGSource] = useState(ALL);
  const [sortKey, setSortKey] = useState("granted");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [busyGrantId, setBusyGrantId] = useState<string | null>(null);
  const debouncedG = useDebounce(gSearch, 300);
  const gFirst = useRef(true);

  const loadGrants = async (initial = false) => {
    try {
      if (initial) setGLoading(true);
      else setGRefreshing(true);
      const res = await listGrants({
        page: gPage,
        per_page: 20,
        search: debouncedG || undefined,
        status: gStatus === ALL ? undefined : (gStatus as GrantStatus),
        source: gSource === ALL ? undefined : (gSource as GrantSource),
        sort_by: SORT_KEYS[sortKey] ?? "granted_at",
        direction,
      });
      setGrants(res.items);
      setGPages(res.pagination.pages || 1);
    } catch {
      toast.error("Unable to load grants.");
    } finally {
      setGLoading(false);
      setGRefreshing(false);
    }
  };

  useEffect(() => {
    void loadGrants(gFirst.current);
    gFirst.current = false;
  }, [gPage, gStatus, gSource, debouncedG, sortKey, direction]);

  /* ---------- accounts ---------- */
  const [accounts, setAccounts] = useState<AssessDeskAccount[]>([]);
  const [aLoading, setALoading] = useState(true);
  const [aRefreshing, setARefreshing] = useState(false);
  const [aPage, setAPage] = useState(1);
  const [aPages, setAPages] = useState(1);
  const [aSearch, setASearch] = useState("");
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const debouncedA = useDebounce(aSearch, 300);
  const aFirst = useRef(true);

  const loadAccounts = async (initial = false) => {
    try {
      if (initial) setALoading(true);
      else setARefreshing(true);
      const res = await listAccounts({ page: aPage, per_page: 20, search: debouncedA || undefined });
      setAccounts(res.items);
      setAPages(res.pagination.pages || 1);
    } catch {
      toast.error("Unable to load AssessDesk users.");
    } finally {
      setALoading(false);
      setARefreshing(false);
    }
  };

  useEffect(() => {
    void loadAccounts(aFirst.current);
    aFirst.current = false;
  }, [aPage, debouncedA]);

  /* ---------- grant actions ---------- */
  const runGrantAction = async (id: string, fn: () => Promise<unknown>, ok: string, fail: string) => {
    try {
      setBusyGrantId(id);
      await fn();
      await Promise.all([loadGrants(), loadAccounts()]);
      toast.success(ok);
    } catch (err) {
      toast.error(apiMessage(err, fail));
    } finally {
      setBusyGrantId(null);
    }
  };

  const toggleAccount = async (a: AssessDeskAccount) => {
    try {
      setBusyUserId(a.user_id);
      await setAccountEnabled(a.user_id, !a.enabled);
      await loadAccounts();
      toast.success(a.enabled ? "Access disabled and devices signed out." : "Access re-enabled.");
    } catch (err) {
      toast.error(apiMessage(err, "Unable to update access."));
    } finally {
      setBusyUserId(null);
    }
  };

  /* ---------- manual grant dialog ---------- */
  const [grantOpen, setGrantOpen] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const debouncedUserQuery = useDebounce(userQuery, 300);
  const [userResults, setUserResults] = useState<UserLookup[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserLookup | null>(null);
  const [grantQuestions, setGrantQuestions] = useState("");
  const [grantDays, setGrantDays] = useState("30");
  const [grantNote, setGrantNote] = useState("");
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    if (!grantOpen || selectedUser || debouncedUserQuery.trim().length < 2) {
      setUserResults([]);
      return;
    }
    let cancelled = false;
    setSearchingUsers(true);
    searchUsers(debouncedUserQuery.trim())
      .then((r) => !cancelled && setUserResults(r))
      .catch(() => !cancelled && toast.error("User search failed."))
      .finally(() => !cancelled && setSearchingUsers(false));
    return () => {
      cancelled = true;
    };
  }, [debouncedUserQuery, grantOpen, selectedUser]);

  const openGrant = (preset?: UserLookup) => {
    setSelectedUser(preset ?? null);
    setUserQuery("");
    setGrantQuestions("");
    setGrantDays("30");
    setGrantNote("");
    setGrantOpen(true);
  };

  const submitGrant = async () => {
    if (!selectedUser || Number(grantQuestions) < 1 || Number(grantDays) < 1) {
      toast.error("Pick a user and enter questions and validity.");
      return;
    }
    try {
      setGranting(true);
      await createGrant({
        user_id: selectedUser.id,
        questions: Number(grantQuestions),
        validity_days: Number(grantDays),
        note: grantNote.trim() || undefined,
      });
      setGrantOpen(false);
      await Promise.all([loadGrants(), loadAccounts()]);
      toast.success(`${grantQuestions} questions granted to ${selectedUser.email}.`);
    } catch (err) {
      toast.error(apiMessage(err, "Unable to grant questions."));
    } finally {
      setGranting(false);
    }
  };

  /* ---------- extend dialog ---------- */
  const [extendTarget, setExtendTarget] = useState<AssessDeskGrant | null>(null);
  const [extendHours, setExtendHours] = useState("72");

  const submitExtend = async () => {
    if (!extendTarget) return;
    const hours = Number(extendHours);
    if (!hours || hours < 1) {
      toast.error("Enter a number of hours.");
      return;
    }
    const target = extendTarget;
    setExtendTarget(null);
    await runGrantAction(target.id, () => extendGrant(target.id, hours), "Expiry extended.", "Unable to extend grant.");
  };

  /* ---------- columns ---------- */
  const grantColumns: Column<AssessDeskGrant>[] = [
    {
      key: "user",
      header: "User",
      render: (r) => (
        <div>
          <p className="text-sm">{r.user?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            {r.user?.email} · {r.user?.role}
          </p>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (r) => (
        <div>
          <p className="text-sm capitalize">{r.source}</p>
          {(r.package_name || r.note) && (
            <p className="text-xs text-muted-foreground">{r.package_name ?? r.note}</p>
          )}
        </div>
      ),
    },
    {
      key: "remaining",
      header: "Remaining",
      sortValue: (r) => r.questions_remaining,
      render: (r) => `${r.questions_remaining}/${r.questions_granted}`,
    },
    { key: "granted", header: "Granted", sortValue: (r) => r.granted_at, render: (r) => formatDateTime(r.granted_at) },
    {
      key: "expires",
      header: "Expires",
      sortValue: (r) => r.expires_at,
      render: (r) => (
        <div>
          <p className="text-sm">{formatDateTime(r.expires_at)}</p>
          {r.status === "grace" && (
            <p className="text-xs text-destructive">Grace until {formatDateTime(r.usable_until)}</p>
          )}
        </div>
      ),
    },
    { key: "status", header: "Status", sortValue: (r) => r.status, render: (r) => <StatusBadge value={r.status} /> },
  ];

  const accountColumns: Column<AssessDeskAccount>[] = [
    {
      key: "user",
      header: "User",
      sortValue: (r) => r.email,
      render: (r) => (
        <div>
          <p className="text-sm">{r.full_name}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Platform role", sortValue: (r) => r.role, render: (r) => <span className="capitalize">{r.role.replace("_", " ")}</span> },
    { key: "balance", header: "Questions left", sortValue: (r) => r.questions_remaining, render: (r) => r.questions_remaining },
    { key: "devices", header: "Devices", sortValue: (r) => r.active_devices, render: (r) => r.active_devices },
    {
      key: "seen",
      header: "Last seen",
      sortValue: (r) => r.last_seen_at ?? "",
      render: (r) => (r.last_seen_at ? relativeTime(r.last_seen_at) : "Never"),
    },
    {
      key: "status",
      header: "Access",
      sortValue: (r) => (r.enabled ? 1 : 0),
      render: (r) => <StatusBadge value={r.enabled ? "active" : "disabled"} />,
    },
  ];

  return (
    <AdminLayout>
      <AdminPageHeader
        title="AssessDesk users & grants"
        description="Every question batch with its UTC expiry and 3-hour grace window. Customers, experts and admins can all hold AssessDesk credit."
        actions={
          <Button variant="hero" onClick={() => openGrant()}>
            <Plus className="h-4 w-4" /> Grant questions
          </Button>
        }
      />

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Grants</h2>
        <DataTable
          initialLoading={gLoading}
          refreshing={gRefreshing}
          loadingSkeleton={<TokensTableSkeleton columns={6} />}
          loadingOverlay={<LoadingOverlay />}
          rows={grants}
          columns={grantColumns}
          getId={(r) => r.id}
          searchText={(r) => `${r.user?.email ?? ""} ${r.user?.name ?? ""}`}
          searchPlaceholder="Search user name or email…"
          page={gPage}
          totalPages={gPages}
          onPageChange={setGPage}
          searchValue={gSearch}
          onSearchChange={(v) => {
            setGSearch(v);
            setGPage(1);
          }}
          sortKey={sortKey}
          sortDirection={direction}
          onSortChange={(k, d) => {
            if (!SORT_KEYS[k]) return;
            setSortKey(k);
            setDirection(d);
            setGPage(1);
          }}
          filters={[
            {
              key: "status",
              label: "Status",
              value: gStatus,
              onChange: (v) => {
                setGStatus(v);
                setGPage(1);
              },
              options: ["active", "grace", "exhausted", "expired", "revoked"].map((s) => ({ value: s, label: s })),
            },
            {
              key: "source",
              label: "Source",
              value: gSource,
              onChange: (v) => {
                setGSource(v);
                setGPage(1);
              },
              options: ["starter", "purchase", "admin"].map((s) => ({ value: s, label: s })),
            },
          ]}
          emptyMessage="No grants match these filters."
          rowActions={(r) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Grant actions" disabled={busyGrantId === r.id}>
                  {busyGrantId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={r.status === "revoked" || r.status === "exhausted"}
                  onClick={() => {
                    setExtendHours("72");
                    setExtendTarget(r);
                  }}
                >
                  Extend expiry…
                </DropdownMenuItem>
                {r.user && (
                  <DropdownMenuItem
                    onClick={() =>
                      openGrant({ id: r.user!.id, full_name: r.user!.name, email: r.user!.email, role: r.user!.role })
                    }
                  >
                    Grant more to this user
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  disabled={r.status === "revoked"}
                  onClick={() =>
                    void runGrantAction(r.id, () => revokeGrant(r.id), "Grant revoked.", "Unable to revoke grant.")
                  }
                >
                  Revoke remaining
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Users</h2>
        <DataTable
          initialLoading={aLoading}
          refreshing={aRefreshing}
          loadingSkeleton={<TokensTableSkeleton columns={6} />}
          loadingOverlay={<LoadingOverlay />}
          rows={accounts}
          columns={accountColumns}
          getId={(r) => String(r.user_id)}
          searchText={(r) => `${r.full_name} ${r.email}`}
          searchPlaceholder="Search user name or email…"
          page={aPage}
          totalPages={aPages}
          onPageChange={setAPage}
          searchValue={aSearch}
          onSearchChange={(v) => {
            setASearch(v);
            setAPage(1);
          }}
          emptyMessage="No AssessDesk users yet."
          rowActions={(r) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Actions for ${r.email}`} disabled={busyUserId === r.user_id}>
                  {busyUserId === r.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => openGrant({ id: r.user_id, full_name: r.full_name, email: r.email, role: r.role })}
                >
                  Grant questions
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={r.enabled ? "text-destructive" : undefined}
                  onClick={() => void toggleAccount(r)}
                >
                  {r.enabled ? "Disable access & sign out devices" : "Re-enable access"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </section>

      {/* Manual grant */}
      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant questions</DialogTitle>
            <DialogDescription>
              Adds a new batch with its own expiry. Any platform user can receive AssessDesk credit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="grant-user">User</Label>
              {selectedUser ? (
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <div>
                    <p className="text-sm">{selectedUser.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser.email} · {selectedUser.role}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                    Change
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    id="grant-user"
                    placeholder="Search by name or email…"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                  />
                  {searchingUsers && <p className="text-xs text-muted-foreground">Searching…</p>}
                  {userResults.length > 0 && (
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                      {userResults.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          {u.full_name} <span className="text-xs text-muted-foreground">· {u.email} · {u.role}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grant-q">Questions</Label>
                <Input id="grant-q" type="number" min={1} value={grantQuestions} onChange={(e) => setGrantQuestions(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="grant-d">Valid for (days)</Label>
                <Input id="grant-d" type="number" min={1} value={grantDays} onChange={(e) => setGrantDays(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grant-n">Note (optional)</Label>
              <Input id="grant-n" value={grantNote} maxLength={255} onChange={(e) => setGrantNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantOpen(false)} disabled={granting}>
              Cancel
            </Button>
            <Button variant="hero" onClick={() => void submitGrant()} disabled={granting}>
              {granting && <Loader2 className="h-4 w-4 animate-spin" />} Grant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend */}
      <Dialog open={!!extendTarget} onOpenChange={(o) => !o && setExtendTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend expiry</DialogTitle>
            <DialogDescription>
              Currently expires {extendTarget ? formatDateTime(extendTarget.expires_at) : ""}. The 3-hour grace window
              moves with it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="extend-h">Add hours</Label>
            <Input id="extend-h" type="number" min={1} value={extendHours} onChange={(e) => setExtendHours(e.target.value)} />
            <div className="flex gap-2">
              {[24, 72, 168, 720].map((h) => (
                <Button key={h} variant="outline" size="sm" onClick={() => setExtendHours(String(h))}>
                  {h < 168 ? `${h}h` : `${h / 24}d`}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendTarget(null)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={() => void submitExtend()}>
              Extend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default AssessDeskUsersPage;
