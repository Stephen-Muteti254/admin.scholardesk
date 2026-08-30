import api from "@/lib/api";
import type { Priority, RequestStatus, RequestType, ServiceRequest } from "@/data/admin/mock";

export type { Priority, RequestStatus, RequestType, ServiceRequest };

export interface Pagination {
  page: number;
  per_page: number;
  pages: number;
  total: number;
}

export interface ListRequestsParams {
  page?: number;
  per_page?: number;
  search?: string;
  /** Comma-separated request types this queue covers. */
  types?: string;
  type?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  sort_by?: string;
  direction?: "asc" | "desc";
}

export interface ListRequestsResponse {
  items: ServiceRequest[];
  pagination: Pagination;
}

export interface RequestStatistics {
  total: number;
  awaiting_triage: number;
  awaiting_triage_delta?: string;
  open_pipeline: number;
  open_pipeline_delta?: string;
  completed: number;
}

export interface UpdateRequestPayload {
  status?: RequestStatus;
  priority?: Priority;
  assignedTo?: string | null;
  deadline?: string;
  budget?: number | null;
  tags?: string[];
}

export async function listRequests(params: ListRequestsParams = {}): Promise<ListRequestsResponse> {
  const response = await api.get("/admin/requests", { params });
  return response.data;
}

export async function getRequestStatistics(
  params: { types?: string } = {},
): Promise<RequestStatistics> {
  const response = await api.get("/admin/requests/statistics", { params });
  return response.data;
}

export async function getRequest(id: string): Promise<ServiceRequest> {
  const response = await api.get(`/admin/requests/${id}`);
  return response.data.request ?? response.data;
}

export async function updateRequest(
  id: string,
  payload: UpdateRequestPayload,
): Promise<ServiceRequest> {
  const response = await api.patch(`/admin/requests/${id}`, payload);
  return response.data.request ?? response.data;
}

export async function deleteRequest(id: string): Promise<void> {
  await api.delete(`/admin/requests/${id}`);
}

export async function bulkUpdateRequests(
  ids: string[],
  payload: UpdateRequestPayload,
): Promise<{ count: number }> {
  const response = await api.patch("/admin/requests/bulk", { ids, ...payload });
  return response.data;
}

export async function bulkDeleteRequests(ids: string[]): Promise<{ count: number }> {
  const response = await api.delete("/admin/requests/bulk", { data: { ids } });
  return response.data;
}

export async function sendRequestReminder(id: string): Promise<void> {
  await api.post(`/admin/requests/${id}/reminders`);
}

export async function exportRequests(params: ListRequestsParams = {}): Promise<Blob> {
  const response = await api.get("/admin/requests/export", {
    params,
    responseType: "blob",
  });
  return response.data;
}
