import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader, StatusBadge } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SettingsFormSkeleton,
  SettingsToggleListSkeleton,
  TeamListSkeleton,
} from "@/components/skeletons/SettingsFormSkeleton";
import {
  getSettings,
  inviteTeamMember,
  listTeam,
  removeTeamMember,
  updateSettings,
  type WorkspaceSettings,
} from "@/services/settingsService";
import { useErrorToast } from "@/hooks/useErrorToast";

const DEFAULT_SETTINGS: WorkspaceSettings = {
  general: {
    brand_name: "",
    support_email: "",
    default_currency: "USD",
    api_base_url: "",
    policy_note: "",
  },
  services: {
    quote_sla_minutes: 0,
    rush_surcharge_percent: 0,
    ai_report_base_price: 0,
    free_revisions: 0,
    auto_assign_by_speciality: false,
    require_quote_approval: false,
  },
  notifications: {
    new_request_email: false,
    quote_accepted_alerts: false,
    licence_expiry_warnings: false,
    weekly_performance_digest: false,
  },
};

function SettingsPage() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const teamQuery = useQuery({ queryKey: ["team"], queryFn: listTeam });

  useErrorToast(settingsQuery.isError, "Unable to load settings.");
  useErrorToast(teamQuery.isError, "Unable to load team members.");

  const [form, setForm] = useState<WorkspaceSettings | null>(null);

  useEffect(() => {
    if (settingsQuery.data) setForm(settingsQuery.data);
    else if (settingsQuery.isError) setForm(DEFAULT_SETTINGS);
  }, [settingsQuery.data, settingsQuery.isError]);

  const saveMutation = useMutation({
    mutationFn: () => updateSettings(form ?? {}),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], data);
      toast.success("Settings saved");
    },
    onError: () => toast.error("Unable to save settings"),
  });

  const inviteMutation = useMutation({
    mutationFn: (email: string) => inviteTeamMember({ email, role: "support" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success("Invitation sent");
    },
    onError: () => toast.error("Unable to send invitation"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeTeamMember(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success("Team member removed");
    },
    onError: () => toast.error("Unable to remove team member"),
  });

  const team = teamQuery.data ?? [];
  const loadingSettings = settingsQuery.isLoading || !form;

  const setGeneral = <K extends keyof WorkspaceSettings["general"]>(
    key: K,
    value: WorkspaceSettings["general"][K],
  ) => setForm((prev) => (prev ? { ...prev, general: { ...prev.general, [key]: value } } : prev));

  const setService = <K extends keyof WorkspaceSettings["services"]>(
    key: K,
    value: WorkspaceSettings["services"][K],
  ) => setForm((prev) => (prev ? { ...prev, services: { ...prev.services, [key]: value } } : prev));

  const setNotification = <K extends keyof WorkspaceSettings["notifications"]>(
    key: K,
    value: boolean,
  ) =>
    setForm((prev) =>
      prev ? { ...prev, notifications: { ...prev.notifications, [key]: value } } : prev,
    );

  return (
    <>
      <AdminLayout>
        <AdminPageHeader
          title="Settings & team"
          description="Workspace configuration, service defaults and admin access control."
          actions={
            <Button
              variant="hero"
              disabled={loadingSettings || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          }
        />

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="services">Service defaults</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="team">
              {teamQuery.isLoading ? (
                <span className="flex items-center gap-1.5">
                  Team <Skeleton className="h-3 w-5" />
                </span>
              ) : (
                `Team (${team.length})`
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="pt-6">
            {loadingSettings ? (
              <SettingsFormSkeleton fields={5} />
            ) : (
              <div className="grid gap-5 rounded-xl border border-border bg-card p-6 shadow-card md:grid-cols-2">
                <div>
                  <Label htmlFor="s-brand">Brand name</Label>
                  <Input
                    id="s-brand"
                    value={form.general.brand_name}
                    onChange={(e) => setGeneral("brand_name", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="s-email">Support email</Label>
                  <Input
                    id="s-email"
                    value={form.general.support_email}
                    onChange={(e) => setGeneral("support_email", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="s-currency">Default currency</Label>
                  <Input
                    id="s-currency"
                    value={form.general.default_currency}
                    onChange={(e) => setGeneral("default_currency", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="s-api">API base URL</Label>
                  <Input
                    id="s-api"
                    value={form.general.api_base_url}
                    onChange={(e) => setGeneral("api_base_url", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="s-note">Public policy note</Label>
                  <Textarea
                    id="s-note"
                    rows={3}
                    className="mt-1.5"
                    value={form.general.policy_note}
                    onChange={(e) => setGeneral("policy_note", e.target.value)}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="services" className="pt-6">
            {loadingSettings ? (
              <SettingsFormSkeleton fields={6} />
            ) : (
              <div className="grid gap-5 rounded-xl border border-border bg-card p-6 shadow-card md:grid-cols-2">
                <div>
                  <Label htmlFor="s-sla">Quote SLA (minutes)</Label>
                  <Input
                    id="s-sla"
                    type="number"
                    value={form.services.quote_sla_minutes}
                    onChange={(e) => setService("quote_sla_minutes", Number(e.target.value))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="s-rush">Rush surcharge (%)</Label>
                  <Input
                    id="s-rush"
                    type="number"
                    value={form.services.rush_surcharge_percent}
                    onChange={(e) => setService("rush_surcharge_percent", Number(e.target.value))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="s-ai">AI report base price (USD)</Label>
                  <Input
                    id="s-ai"
                    type="number"
                    value={form.services.ai_report_base_price}
                    onChange={(e) => setService("ai_report_base_price", Number(e.target.value))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="s-rev">Free revisions per job</Label>
                  <Input
                    id="s-rev"
                    type="number"
                    value={form.services.free_revisions}
                    onChange={(e) => setService("free_revisions", Number(e.target.value))}
                    className="mt-1.5"
                  />
                </div>
                <ToggleRow
                  label="Auto-assign by speciality"
                  description="Route new requests to the best-matching expert."
                  checked={form.services.auto_assign_by_speciality}
                  onCheckedChange={(v) => setService("auto_assign_by_speciality", v)}
                />
                <ToggleRow
                  label="Require quote approval"
                  description="Quotes above $500 need a manager sign-off."
                  checked={form.services.require_quote_approval}
                  onCheckedChange={(v) => setService("require_quote_approval", v)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="pt-6">
            {loadingSettings ? (
              <SettingsToggleListSkeleton rows={4} />
            ) : (
              <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
                <ToggleRow
                  label="New request email"
                  description="Notify the on-duty operator instantly."
                  checked={form.notifications.new_request_email}
                  onCheckedChange={(v) => setNotification("new_request_email", v)}
                />
                <ToggleRow
                  label="Quote accepted alerts"
                  description="Ping finance when a quote converts."
                  checked={form.notifications.quote_accepted_alerts}
                  onCheckedChange={(v) => setNotification("quote_accepted_alerts", v)}
                />
                <ToggleRow
                  label="Licence expiry warnings"
                  description="Alert 7 days before an ExamStealth licence expires."
                  checked={form.notifications.licence_expiry_warnings}
                  onCheckedChange={(v) => setNotification("licence_expiry_warnings", v)}
                />
                <ToggleRow
                  label="Weekly performance digest"
                  description="Sunday summary of revenue and SLA compliance."
                  checked={form.notifications.weekly_performance_digest}
                  onCheckedChange={(v) => setNotification("weekly_performance_digest", v)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="team" className="space-y-4 pt-6">
            {teamQuery.isLoading ? (
              <TeamListSkeleton rows={4} />
            ) : (
              <div className="rounded-xl border border-border bg-card shadow-card">
                <ul className="divide-y divide-border">
                  {team.length === 0 && (
                    <li className="p-4 text-sm text-muted-foreground">
                      {teamQuery.isError ? "Unable to load the team." : "No team members yet."}
                    </li>
                  )}
                  {team.map((m) => (
                    <li key={m.id} className="flex flex-wrap items-center gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.email} · {m.role}
                        </p>
                      </div>
                      <StatusBadge value={m.status} />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${m.name}`}
                        disabled={removeMutation.isPending}
                        onClick={() => removeMutation.mutate(m.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button
              variant="outline"
              disabled={inviteMutation.isPending}
              onClick={() => {
                const email = window.prompt("Email address to invite");
                if (email) inviteMutation.mutate(email);
              }}
            >
              <UserPlus className="h-4 w-4" /> Invite team member
            </Button>
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </>
  );
}

export default SettingsPage;

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
