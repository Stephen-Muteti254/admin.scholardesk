import api from "@/lib/api";

export type OrderStatus = "paid" | "pending" | "failed" | "refunded" | "disputed";

export type OrderGateway = "Stripe" | "PayPal" | "Bank Transfer" | "Wise";

export interface OrderCustomer {
  id?: string;
  name: string;
  email: string;
}

export interface Order {
  id: string;
  ref: string;
  material_id?: string | null;
  materialTitle: string;
  customer: OrderCustomer;
  amount: number;
  currency?: string;
  gateway: OrderGateway;
  status: OrderStatus;
  fulfillmentStage?: string | null;
  expertBudget?: number | null;
  assignedExpertId?: number | null;
  assignedExpertName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Pagination {
  page: number;
  per_page: number;
  pages: number;
  total: number;
}

export interface ListOrdersParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: OrderStatus;
  gateway?: OrderGateway;
  sort_by?: string;
  direction?: "asc" | "desc";
}

export interface ListOrdersResponse {
  items: Order[];
  pagination: Pagination;
}

export interface OrderStatistics {
  paid: number;
  paid_delta?: string;
  gross: number;
  pending: number;
  disputed: number;
}

export async function listOrders(params: ListOrdersParams = {}): Promise<ListOrdersResponse> {
  const response = await api.get("/admin/orders", { params });
  return response.data;
}

export async function getOrderStatistics(): Promise<OrderStatistics> {
  const response = await api.get("/admin/orders/statistics");
  return response.data;
}

export async function updateOrder(
  id: string,
  payload: { status?: OrderStatus; notes?: string | null },
): Promise<Order> {
  const response = await api.patch(`/admin/orders/${id}`, payload);
  return response.data.order ?? response.data;
}

export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`/admin/orders/${id}`);
}

export async function refundOrder(
  id: string,
  payload: { reason: string; amount?: number },
): Promise<Order> {
  const response = await api.post(`/admin/orders/${id}/refund`, payload);
  return response.data.order ?? response.data;
}

export async function assignExpert(
  id: string,
  payload: { expert_id: string; budget: number },
): Promise<Order> {
  const response = await api.post(`/admin/orders/${id}/assign`, payload);
  return response.data.order ?? response.data;
}

export async function resendReceipt(id: string): Promise<void> {
  await api.post(`/admin/orders/${id}/receipt`);
}

export async function regenerateDownloadLink(id: string): Promise<{ url: string }> {
  const response = await api.post(`/admin/orders/${id}/download-link`);
  return response.data;
}

export async function bulkUpdateOrders(
  ids: string[],
  payload: { status: OrderStatus },
): Promise<{ count: number }> {
  const response = await api.patch("/admin/orders/bulk", { ids, ...payload });
  return response.data;
}

export async function bulkResendReceipts(ids: string[]): Promise<{ count: number }> {
  const response = await api.post("/admin/orders/bulk/receipts", { ids });
  return response.data;
}

export async function exportOrders(params: ListOrdersParams = {}): Promise<Blob> {
  const response = await api.get("/admin/orders/export", {
    params,
    responseType: "blob",
  });
  return response.data;
}

export interface OrderSubmission {
  id: string;
  version: number;
  title: string;
  summary: string | null;
  files: { id: string; name: string; size: number; url: string; added_by?: string }[];
  status: "pending_review" | "delivered" | "revision_requested" | "approved" | "rejected";
  revisionNote?: string | null;
}

export async function listSubmissions(orderId: string): Promise<OrderSubmission[]> {
  const response = await api.get(`/admin/orders/${orderId}/submissions`);
  return response.data.data ?? response.data;
}

export async function releaseSubmission(
  orderId: string,
  submissionId: string,
  payload: { note?: string; files?: File[] },
): Promise<OrderSubmission> {
  const formData = new FormData();
  if (payload.note) formData.append("note", payload.note);
  for (const file of payload.files ?? []) formData.append("files[]", file);

  const response = await api.post(
    `/admin/orders/${orderId}/submissions/${submissionId}/release`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data.data ?? response.data;
}

export function submissionFileUrl(orderId: string, relativePath: string): string {
  return `${api.defaults.baseURL}/admin/orders/${orderId}/submissions/files/${relativePath}`;
}
