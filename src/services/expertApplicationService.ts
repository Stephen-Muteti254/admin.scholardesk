import api from "@/lib/api";

export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "withdrawn";

export interface ExpertApplication {
  id: string;
  user_id: number;
  applicant: { id: number | null; name: string; email: string };

  country: string | null;
  city: string | null;
  phone_number: string | null;

  education: string | null;
  specialization: string | null;
  years_experience: string | null;

  proficiency_answers: Record<string, unknown> | unknown[];

  selected_prompt: string | null;
  prompt_response: string | null;
  writing_samples: Record<string, string>;

  selected_essay_topic: string | null;
  essay_text: string | null;
  essay_file_path: string | null;

  work_samples: string[];
  degree_certificates: string[];
  cv_file_path: string | null;

  status: ApplicationStatus;
  admin_feedback: string | null;

  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ListApplicationsParams {
  page?: number;
  per_page?: number;
  status?: ApplicationStatus;
  search?: string;
}

export interface Pagination {
  page: number;
  per_page: number;
  pages: number;
  total: number;
}

export async function listApplications(
  params?: ListApplicationsParams,
): Promise<{ items: ExpertApplication[]; pagination: Pagination }> {
  const response = await api.get("/admin/expert-applications", { params });
  return response.data.data ?? response.data;
}

export async function getApplicationStatistics(): Promise<
  Record<string, number>
> {
  const response = await api.get("/admin/expert-applications/statistics");
  return response.data.data ?? response.data;
}

export async function getApplication(id: string): Promise<ExpertApplication> {
  const response = await api.get(`/admin/expert-applications/${id}`);
  return response.data.application ?? response.data.data ?? response.data;
}

export async function markUnderReview(
  id: string,
): Promise<ExpertApplication> {
  const response = await api.post(
    `/admin/expert-applications/${id}/review`,
    {},
  );
  return response.data.application ?? response.data;
}

export async function approveApplication(
  id: string,
  feedback?: string,
): Promise<ExpertApplication> {
  const response = await api.post(
    `/admin/expert-applications/${id}/approve`,
    { feedback },
  );
  return response.data.application ?? response.data;
}

export async function rejectApplication(
  id: string,
  feedback: string,
): Promise<ExpertApplication> {
  const response = await api.post(
    `/admin/expert-applications/${id}/reject`,
    { feedback },
  );
  return response.data.application ?? response.data;
}

export async function confirmDeposit(
  id: string,
): Promise<{ application: ExpertApplication; expert_id: string }> {
  const response = await api.post(
    `/admin/expert-applications/${id}/confirm-deposit`,
    {},
  );
  return response.data;
}

export function applicationFileUrl(relativePath: string): string {
  return `${api.defaults.baseURL}/admin/expert-applications/files/${relativePath}`;
}
