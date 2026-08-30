import api from "@/lib/api";

export type AdminRole = "superadmin" | "operations" | "tutor-manager" | "finance" | "support";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
};

const AUTH_STORAGE_KEY = "scholaredge.admin.session";

export function getStoredAuth(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function setAuth(user: AdminUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

/* --- Backend calls (implemented later) --- */
export const login = (payload: { email: string; password: string }) =>
  api.post("/auth/login", payload).then((r) => r.data);

export const logout = () => api.post("/auth/logout").then((r) => r.data);

export const me = () => api.get<AdminUser>("/auth/me").then((r) => r.data);
