import api from "@/lib/api";

export type TeamRole = "superadmin" | "operations" | "tutor-manager" | "finance" | "support";

export type TeamStatus = "active" | "pending" | "suspended";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole | string;
  status: TeamStatus | string;
}

export interface WorkspaceSettings {
  general: {
    brand_name: string;
    support_email: string;
    default_currency: string;
    api_base_url: string;
    policy_note: string;
  };
  services: {
    quote_sla_minutes: number;
    rush_surcharge_percent: number;
    ai_report_base_price: number;
    free_revisions: number;
    auto_assign_by_speciality: boolean;
    require_quote_approval: boolean;
  };
  notifications: {
    new_request_email: boolean;
    quote_accepted_alerts: boolean;
    licence_expiry_warnings: boolean;
    weekly_performance_digest: boolean;
  };
}

export type UpdateSettingsPayload = Partial<{
  general: Partial<WorkspaceSettings["general"]>;
  services: Partial<WorkspaceSettings["services"]>;
  notifications: Partial<WorkspaceSettings["notifications"]>;
}>;

export async function getSettings(): Promise<WorkspaceSettings> {
  const response = await api.get("/admin/settings");
  return response.data.settings ?? response.data;
}

export async function updateSettings(
  payload: UpdateSettingsPayload,
): Promise<WorkspaceSettings> {
  const response = await api.put("/admin/settings", payload);
  return response.data.settings ?? response.data;
}

export async function listTeam(): Promise<TeamMember[]> {
  const response = await api.get("/admin/team");
  return response.data.items ?? response.data;
}

export async function inviteTeamMember(payload: {
  name?: string;
  email: string;
  role: TeamRole | string;
}): Promise<TeamMember> {
  const response = await api.post("/admin/team/invitations", payload);
  return response.data.member ?? response.data;
}

export async function updateTeamMember(
  id: string,
  payload: Partial<Pick<TeamMember, "role" | "status" | "name">>,
): Promise<TeamMember> {
  const response = await api.patch(`/admin/team/${id}`, payload);
  return response.data.member ?? response.data;
}

export async function removeTeamMember(id: string): Promise<void> {
  await api.delete(`/admin/team/${id}`);
}
