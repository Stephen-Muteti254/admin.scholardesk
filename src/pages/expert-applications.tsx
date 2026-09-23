import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader, StatCard, StatusBadge, formatDate } from "@/components/admin/AdminUI";
import { ALL, DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { LoadingOverlay } from "@/components/skeletons/LoadingOverlay";
import { useDebounce } from "@/hooks/useDebounce";
import { useErrorToast } from "@/hooks/useErrorToast";
import {
  approveApplication,
  applicationFileUrl,
  confirmDeposit,
  getApplicationStatistics,
  listApplications,
  markUnderReview,
  rejectApplication,
  type ApplicationStatus,
  type ExpertApplication,
} from "@/services/expertApplicationService";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: ALL, label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

function FileLink({ path, label }: { path: string | null | undefined; label: string }) {
  if (!path) return null;
  return (
    <a
      href={applicationFileUrl(path)}
      target="_blank"
      rel="noreferrer"
      className="text-sm text-primary underline underline-offset-2"
    >
      {label}
    </a>
  );
}

function ApplicationDetailDialog({
  application,
  open,
  onOpenChange,
  onChanged,
}: {
  application: ExpertApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: (app: ExpertApplication) => void;
}) {
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFeedback(application?.admin_feedback ?? "");
  }, [application?.id]);

  if (!application) return null;

  const run = async (action: () => Promise<ExpertApplication | { application: ExpertApplication }>, successMessage: string) => {
    setBusy(true);
    try {
      const result = await action();
      const updated = "application" in result ? result.application : result;
      onChanged(updated);
      toast.success(successMessage);
    } catch {
      toast.error("Action failed - please try again");
    } finally {
      setBusy(false);
    }
  };

  const samples = Object.entries(application.writing_samples || {});
  const proficiency = Array.isArray(application.proficiency_answers)
    ? application.proficiency_answers
    : Object.values(application.proficiency_answers || {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{application.applicant.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={application.status} />
            <span className="text-muted-foreground">{application.applicant.email}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
            <div><span className="text-muted-foreground">Country</span><p>{application.country || "—"}</p></div>
            <div><span className="text-muted-foreground">City</span><p>{application.city || "—"}</p></div>
            <div><span className="text-muted-foreground">Phone</span><p>{application.phone_number || "—"}</p></div>
            <div><span className="text-muted-foreground">Education</span><p>{application.education || "—"}</p></div>
            <div><span className="text-muted-foreground">Specialization</span><p>{application.specialization || "—"}</p></div>
            <div><span className="text-muted-foreground">Experience</span><p>{application.years_experience || "—"}</p></div>
          </div>

          {proficiency.length > 0 && (
            <div>
              <p className="mb-1 font-medium">Proficiency answers</p>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                {proficiency.map((a, i) => (
                  <li key={i}>{String(a)}</li>
                ))}
              </ul>
            </div>
          )}

          {samples.map(([promptId, text]) => (
            <div key={promptId}>
              <p className="mb-1 font-medium">Writing sample - {promptId}</p>
              <p className="whitespace-pre-wrap rounded-lg border border-border p-3 text-muted-foreground">{text}</p>
            </div>
          ))}

          {application.essay_text && (
            <div>
              <p className="mb-1 font-medium">
                Essay {application.selected_essay_topic ? `- ${application.selected_essay_topic}` : ""}
              </p>
              <p className="whitespace-pre-wrap rounded-lg border border-border p-3 text-muted-foreground">
                {application.essay_text}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <FileLink path={application.essay_file_path} label="Essay file" />
            <FileLink path={application.cv_file_path} label="CV" />
            {application.work_samples.map((p, i) => (
              <FileLink key={p} path={p} label={`Work sample ${i + 1}`} />
            ))}
            {application.degree_certificates.map((p, i) => (
              <FileLink key={p} path={p} label={`Certificate ${i + 1}`} />
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="app-feedback">Feedback to applicant</Label>
            <Textarea
              id="app-feedback"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Required when rejecting; optional when approving."
            />
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          {application.status === "submitted" && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => run(() => markUnderReview(application.id), "Marked under review")}
            >
              Mark under review
            </Button>
          )}

          {(application.status === "submitted" || application.status === "under_review") && (
            <>
              <Button
                variant="destructive"
                disabled={busy || !feedback.trim()}
                onClick={() => run(() => rejectApplication(application.id, feedback), "Application rejected")}
              >
                Reject
              </Button>
              <Button
                variant="hero"
                disabled={busy}
                onClick={() => run(() => approveApplication(application.id, feedback), "Application approved")}
              >
                Approve
              </Button>
            </>
          )}

          {application.status === "approved" && (
            <Button
              variant="hero"
              disabled={busy}
              onClick={() =>
                run(
                  () => confirmDeposit(application.id),
                  "Deposit confirmed - expert account activated",
                )
              }
            >
              Confirm deposit &amp; activate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ExpertApplicationsPage() {
  const [rows, setRows] = useState<ExpertApplication[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const [statLoading, setStatLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});

  const [status, setStatus] = useState(ALL);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [selected, setSelected] = useState<ExpertApplication | null>(null);

  useErrorToast(error, "Unable to load applications.");

  const load = async (initial = false) => {
    if (initial) setInitialLoading(true);
    else setRefreshing(true);
    setError(false);

    try {
      const response = await listApplications({
        page,
        per_page: 20,
        status: status === ALL ? undefined : (status as ApplicationStatus),
        search: debouncedSearch || undefined,
      });
      setRows(response.items);
      setPagination(response.pagination);
    } catch {
      setError(true);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load(rows.length === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    getApplicationStatistics()
      .then(setStats)
      .catch(() => undefined)
      .finally(() => setStatLoading(false));
  }, []);

  const columns: Column<ExpertApplication>[] = [
    { key: "name", header: "Applicant", render: (r) => (
      <div>
        <p className="font-medium">{r.applicant.name}</p>
        <p className="text-xs text-muted-foreground">{r.applicant.email}</p>
      </div>
    ) },
    { key: "specialization", header: "Specialization", render: (r) => r.specialization || "—" },
    { key: "country", header: "Country", render: (r) => r.country || "—" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
    { key: "created_at", header: "Submitted", render: (r) => formatDate(r.created_at) },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Expert applications"
          description="Review, approve or reject incoming expert applications."
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {statLoading ? (
            <>
              <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard label="Submitted" value={String(stats.submitted ?? 0)} />
              <StatCard label="Under review" value={String(stats.under_review ?? 0)} />
              <StatCard label="Approved" value={String(stats.approved ?? 0)} />
              <StatCard label="Rejected" value={String(stats.rejected ?? 0)} />
              <StatCard label="Withdrawn" value={String(stats.withdrawn ?? 0)} />
            </>
          )}
        </div>

        <div className="relative">
          {refreshing && <LoadingOverlay />}
          <DataTable
            rows={rows}
            columns={columns}
            getId={(r) => r.id}
            searchText={(r) => `${r.applicant.name} ${r.applicant.email}`}
            searchPlaceholder="Search by applicant name or email…"
            searchValue={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            filters={[
              {
                key: "status",
                label: "Status",
                value: status,
                options: STATUS_OPTIONS,
                onChange: (v) => { setStatus(v); setPage(1); },
              },
            ]}
            onRowClick={(r) => setSelected(r)}
            page={page}
            totalPages={pagination.pages}
            onPageChange={setPage}
            initialLoading={initialLoading}
            emptyMessage="No expert applications found."
          />
        </div>
      </div>

      <ApplicationDetailDialog
        application={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
        onChanged={(updated) => {
          setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          setSelected(updated);
        }}
      />
    </AdminLayout>
  );
}
