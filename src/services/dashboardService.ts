import api from "@/lib/api";

/* ------------------------------------------------------------------
 * Every admin network call goes through the centralized `api` client
 * (see src/lib/api.ts). Field names / paths below are a best guess
 * based on the existing Orders, Requests and Analytics services —
 * confirm against the real backend contract and adjust as needed.
 * ----------------------------------------------------------------*/

export interface DashboardStatistics {
  revenue: number;
  revenue_delta?: string;
  open_requests: number;
  open_requests_delta?: string;
  material_sales: number;
  material_sales_delta?: string;
  active_licenses: number;
  active_licenses_delta?: string;
}

export interface RevenuePoint {
  month: string;
  materials: number;
  services: number;
  stealth: number;
}

export interface RequestFunnelPoint {
  day: string;
  requests: number;
  converted: number;
}

export interface DashboardAttentionItem {
  id: string;
  title: string;
  typeLabel: string;
  status: string;
  customer: { name: string; email?: string };
  createdAt: string;
}

export interface DashboardOrderItem {
  id: string;
  ref: string;
  materialTitle: string;
  customer: { name: string; email?: string };
  amount: number;
  status: string;
  createdAt: string;
}

export interface DashboardOverview {
  revenueSeries: RevenuePoint[];
  requestFunnel: RequestFunnelPoint[];
  needsAttention: DashboardAttentionItem[];
  latestOrders: DashboardOrderItem[];
}

/** Powers the four top stat cards. */
export async function getDashboardStatistics(): Promise<DashboardStatistics> {
  const response = await api.get("/admin/dashboard/statistics");
  return response.data;
}

/** Powers the two charts + the "Needs attention" / "Latest orders" lists. */
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const response = await api.get("/admin/dashboard/overview");
  return response.data;
}
