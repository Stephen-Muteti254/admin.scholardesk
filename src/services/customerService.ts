import api from "@/lib/api";

export type CustomerStatus =
  | "active"
  | "pending"
  | "suspended"
  | "banned";

export interface Customer {
  id: string;
  name: string;
  email: string;
  country: string;
  joinedAt: string | null;
  requests: number;
  orders: number;
  spend: number;
  status: CustomerStatus;
  lastActive: string | null;
}

export interface Pagination {
  page: number;
  per_page: number;
  pages: number;
  total: number;
}

export interface ListCustomersParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: CustomerStatus;
  country?: string;
  sort_by?: string;
  direction?: "asc" | "desc";
}

export interface ListCustomersResponse {
  items: Customer[];
  pagination: Pagination;
  countries?: string[];
}

export interface CustomerStatistics {
  total: number;
  total_delta?: string;
  active: number;
  lifetime_revenue: number;
  restricted: number;
}

export async function listCustomers(
  params: ListCustomersParams = {},
): Promise<ListCustomersResponse> {
  const response = await api.get(
    "/admin/customers",
    { params },
  );

  return response.data;
}

export async function getCustomerStatistics(): Promise<CustomerStatistics> {
  const response = await api.get(
    "/admin/customers/statistics",
  );

  return response.data;
}

export async function getCustomer(
  id: string,
): Promise<Customer> {
  const response = await api.get(
    `/admin/customers/${id}`,
  );

  return response.data.customer ?? response.data;
}

export async function updateCustomer(
  id: string,
  payload: {
    status?: CustomerStatus;
    name?: string;
    country?: string;
  },
): Promise<Customer> {
  const response = await api.patch(
    `/admin/customers/${id}`,
    payload,
  );

  return response.data.customer ?? response.data;
}

export async function deleteCustomer(
  id: string,
): Promise<void> {
  await api.delete(
    `/admin/customers/${id}`,
  );
}

export async function messageCustomer(
  id: string,
  payload: {
    subject?: string;
    body: string;
  },
): Promise<void> {
  await api.post(
    `/admin/customers/${id}/messages`,
    payload,
  );
}

export async function bulkUpdateCustomers(
  ids: string[],
  payload: {
    status: CustomerStatus;
  },
): Promise<{ count: number }> {
  const response = await api.patch(
    "/admin/customers/bulk",
    {
      ids,
      ...payload,
    },
  );

  return response.data;
}

export async function bulkEmailCustomers(
  ids: string[],
  payload: {
    subject?: string;
    body?: string;
  } = {},
): Promise<{ count: number }> {
  const response = await api.post(
    "/admin/customers/bulk/emails",
    {
      ids,
      ...payload,
    },
  );

  return response.data;
}