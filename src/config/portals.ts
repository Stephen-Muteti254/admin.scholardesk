/**
 * Portal URLs used across the ScholarDesk estate.
 * Override per-environment with Vite env vars.
 */
export const PORTALS = {
  AUTH: import.meta.env.VITE_AUTH_PORTAL_URL || "https://scholardesk.pro",
  ADMIN: import.meta.env.VITE_ADMIN_PORTAL_URL || "/admin",
  SITE: import.meta.env.VITE_SITE_URL || "/",
  STEALTH: import.meta.env.VITE_STEALTH_URL || "/exam-stealth",
} as const;

export type PortalKey = keyof typeof PORTALS;
