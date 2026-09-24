// src/services/assessdeskService.ts

import api from "@/lib/api";

export interface Pagination {
  page: number;
  per_page: number;
  pages: number;
  total: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

/* ---------------- Packages ---------------- */

export interface AssessDeskPackage {
  id: string;
  name: string;
  description: string | null;
  questions: number;
  validity_days: number;
  price: number;
  price_minor: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface PackagePayload {
  name?: string;
  description?: string | null;
  questions?: number;
  validity_days?: number;
  price?: number;
  currency?: string;
  is_active?: boolean;
  sort_order?: number;
}

/* ---------------- Grants ---------------- */

export type GrantStatus = "active" | "grace" | "exhausted" | "expired" | "revoked";
export type GrantSource = "starter" | "purchase" | "admin";

export interface AssessDeskGrant {
  id: string;
  source: GrantSource;
  package_id: string | null;
  package_name: string | null;
  questions_granted: number;
  questions_remaining: number;
  granted_at: string;
  expires_at: string;
  usable_until: string;
  expires_in_seconds: number;
  usable_for_seconds: number;
  status: GrantStatus;
  note: string | null;
  user?: { id: number; name: string; email: string; role: string };
}

export interface ListGrantsParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: GrantStatus;
  source?: GrantSource;
  sort_by?: "granted_at" | "expires_at" | "questions_remaining" | "status";
  direction?: "asc" | "desc";
}

export interface ManualGrantPayload {
  user_id: number;
  questions: number;
  validity_days: number;
  note?: string;
}

/* ---------------- Accounts ---------------- */

export interface AssessDeskAccount {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  enabled: boolean;
  questions_remaining: number;
  active_devices: number;
  last_seen_at: string | null;
  joined_at: string | null;
}

export interface UserLookup {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

/* ---------------- Purchases ---------------- */

export type PurchaseStatus = "pending" | "paid" | "failed" | "abandoned";

export interface AssessDeskPurchase {
  id: string;
  reference: string;
  package_id: string;
  package_name: string | null;
  questions: number;
  validity_days: number;
  amount: number;
  currency: string;
  status: PurchaseStatus;
  paid_at: string | null;
  created_at: string | null;
  user?: { id: number; name: string; email: string };
}

/* ---------------- Statistics ---------------- */

export interface AssessDeskStatistics {
  accounts: number;
  active_users: number;
  questions_outstanding: number;
  questions_sold: number;
  questions_consumed_7d: number;
  questions_expiring_7d: number;
  revenue: { currency: string; amount: number }[];
}

const BASE = "/admin/assessdesk";

export async function getAssessDeskStatistics(): Promise<AssessDeskStatistics> {
  const response = await api.get(`${BASE}/statistics`);
  return response.data;
}

export async function listPackages(): Promise<AssessDeskPackage[]> {
  const response = await api.get(`${BASE}/packages`);
  return response.data.items;
}

export async function createPackage(payload: PackagePayload): Promise<AssessDeskPackage> {
  const response = await api.post(`${BASE}/packages`, payload);
  return response.data.package;
}

export async function updatePackage(id: string, payload: PackagePayload): Promise<AssessDeskPackage> {
  const response = await api.patch(`${BASE}/packages/${id}`, payload);
  return response.data.package;
}

export async function listGrants(params: ListGrantsParams = {}): Promise<Paginated<AssessDeskGrant>> {
  const response = await api.get(`${BASE}/grants`, { params });
  return response.data;
}

export async function createGrant(payload: ManualGrantPayload): Promise<AssessDeskGrant> {
  const response = await api.post(`${BASE}/grants`, payload);
  return response.data.grant;
}

export async function extendGrant(id: string, hours: number): Promise<AssessDeskGrant> {
  const response = await api.post(`${BASE}/grants/${id}/extend`, { hours });
  return response.data.grant;
}

export async function revokeGrant(id: string): Promise<AssessDeskGrant> {
  const response = await api.post(`${BASE}/grants/${id}/revoke`);
  return response.data.grant;
}

export async function listAccounts(
  params: { page?: number; per_page?: number; search?: string } = {},
): Promise<Paginated<AssessDeskAccount>> {
  const response = await api.get(`${BASE}/accounts`, { params });
  return response.data;
}

export async function setAccountEnabled(userId: number, enabled: boolean): Promise<void> {
  await api.patch(`${BASE}/accounts/${userId}`, { enabled });
}

export async function searchUsers(q: string): Promise<UserLookup[]> {
  const response = await api.get(`${BASE}/users/search`, { params: { q } });
  return response.data.items;
}

export async function listPurchases(
  params: { page?: number; per_page?: number; search?: string; status?: PurchaseStatus } = {},
): Promise<Paginated<AssessDeskPurchase>> {
  const response = await api.get(`${BASE}/purchases`, { params });
  return response.data;
}
