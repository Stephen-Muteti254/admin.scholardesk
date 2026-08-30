import api from "@/lib/api";

/* ------------------------------------------------------------------
 * Same convention as dashboardService.ts / orderService.ts. Paths are
 * a best guess based on the existing services — confirm against the
 * real backend contract and adjust as needed.
 *
 * Note: src/services/adminService.ts already declares a stray
 * `getDashboardMetrics()` helper hitting `/admin/analytics/overview`.
 * It predates the per-page service-file convention used everywhere
 * else (orderService, paymentsService, customerService, ...) and was
 * never wired to a page. Once this file is in use, that helper is
 * dead code and safe to delete from adminService.ts.
 * ----------------------------------------------------------------*/

export interface AnalyticsStatistics {
  gross_revenue: number;
  gross_revenue_delta?: string;
  /** 0–1, e.g. 0.63 for 63% */
  conversion_rate: number;
  conversion_rate_delta?: string;
  avg_order_value: number;
  avg_order_value_delta?: string;
  completed_jobs: number;
}

export interface RevenueTrendPoint {
  month: string;
  services: number;
  stealth: number;
}

export interface RequestFunnelPoint {
  day: string;
  quoted: number;
  converted: number;
}

export interface TopMaterial {
  id: string;
  title: string;
  revenue: number;
}

export interface AnalyticsOverview {
  revenueTrend: RevenueTrendPoint[];
  requestFunnel: RequestFunnelPoint[];
  topMaterials: TopMaterial[];
}

export interface AnalyticsParams {
  /** Optional date-range filter, e.g. "6m", "30d". Wire up if/when the UI needs it. */
  range?: string;
}

/** Powers the four top stat cards. */
export async function getAnalyticsStatistics(
  params: AnalyticsParams = {},
): Promise<AnalyticsStatistics> {
  const response = await api.get("/admin/analytics/statistics", { params });
  return response.data;
}

/** Powers the revenue trend chart, request funnel chart and top materials list. */
export async function getAnalyticsOverview(
  params: AnalyticsParams = {},
): Promise<AnalyticsOverview> {
  const response = await api.get("/admin/analytics/overview", { params });
  return response.data;
}
