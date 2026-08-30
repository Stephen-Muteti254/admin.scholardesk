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
