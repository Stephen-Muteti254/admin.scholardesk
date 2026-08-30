// src/services/paymentsService.ts

import api from "@/lib/api";

export type PaymentStatus =
  | "scheduled"
  | "processing"
  | "paid"
  | "on-hold";

export interface Payment {
  id: string;

  expert_id: string;
  expert: string;

  period: string;
  period_start: string;
  period_end: string;

  jobs: number;

  amount: number;
  currency: string;

  method: string;

  due_at: string | null;

  status: PaymentStatus;

  processed_at: string | null;
  processed_by: string | null;

  paid_at: string | null;

  external_reference: string | null;

  notes: string | null;

  created_at: string | null;
  updated_at: string | null;
}

export interface PaymentPagination {
  page: number;
  per_page: number;
  pages: number;
  total: number;
}

export interface ListPaymentsParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: PaymentStatus;
  sort_by?: string;
  direction?: "asc" | "desc";
}

export interface ListPaymentsResponse {
  items: Payment[];
  pagination: PaymentPagination;
}

export interface PaymentStatistics {
  total: number;
  due_this_cycle: number;
  paid_30_days: number;
  on_hold: number;
  experts_paid: number;
}

export interface UpdatePaymentPayload {
  status?: PaymentStatus;
  notes?: string | null;
  payment_method?: string;
  due_at?: string | null;
}

export interface BulkUpdatePaymentsPayload {
  ids: string[];
  status: PaymentStatus;
}


export async function listPayments(
  params: ListPaymentsParams = {},
): Promise<ListPaymentsResponse> {
  const response = await api.get(
    "/admin/payments",
    {
      params,
    },
  );

  return response.data;
}


export async function getPaymentStatistics(): Promise<PaymentStatistics> {
  const response = await api.get(
    "/admin/payments/statistics",
  );

  return response.data;
}


export async function getPayment(
  id: string,
): Promise<Payment> {
  const response = await api.get(
    `/admin/payments/${id}`,
  );

  return response.data.payment;
}


export async function updatePayment(
  id: string,
  payload: UpdatePaymentPayload,
): Promise<Payment> {
  const response = await api.patch(
    `/admin/payments/${id}`,
    payload,
  );

  return response.data.payment;
}


export async function deletePayment(
  id: string,
): Promise<void> {
  await api.delete(
    `/admin/payments/${id}`,
  );
}


export async function bulkUpdatePayments(
  payload: BulkUpdatePaymentsPayload,
): Promise<{
  items: Payment[];
  count: number;
}> {
  const response = await api.patch(
    "/admin/payments/bulk",
    payload,
  );

  return response.data;
}


export async function bulkDeletePayments(
  ids: string[],
): Promise<{
  count: number;
}> {
  const response = await api.delete(
    "/admin/payments/bulk",
    {
      data: {
        ids,
      },
    },
  );

  return response.data;
}