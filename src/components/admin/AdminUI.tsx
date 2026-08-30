import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 6e4);
  if (Math.abs(mins) < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (Math.abs(hrs) < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

const TONES: Record<string, string> = {
  neutral: "bg-secondary text-secondary-foreground border-transparent",
  info: "bg-sky-500/12 text-sky-700 border-sky-500/25 dark:text-sky-300",
  progress: "bg-indigo-500/12 text-indigo-700 border-indigo-500/25 dark:text-indigo-300",
  warning: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
  success: "bg-emerald-500/12 text-emerald-700 border-emerald-500/25 dark:text-emerald-300",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
};

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  new: "info",
  reviewing: "info",
  quoted: "warning",
  "awaiting-payment": "warning",
  "in-progress": "progress",
  delivered: "progress",
  revision: "warning",
  completed: "success",
  cancelled: "neutral",
  refunded: "danger",
  paid: "success",
  pending: "warning",
  failed: "danger",
  disputed: "danger",
  published: "success",
  draft: "neutral",
  "in-review": "warning",
  archived: "neutral",
  active: "success",
  suspended: "warning",
  banned: "danger",
  expired: "neutral",
  revoked: "danger",
  onboarding: "info",
  paused: "warning",
  offboarded: "neutral",
  scheduled: "info",
  processing: "progress",
  "on-hold": "warning",
  sent: "info",
  accepted: "success",
  declined: "danger",
  urgent: "danger",
  high: "warning",
  normal: "neutral",
  low: "neutral",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const tone = STATUS_TONE[value] ?? "neutral";
  return (
    <Badge
      variant="outline"
      className={cn("capitalize font-medium", TONES[tone], className)}
    >
      {value.replace(/-/g, " ")}
    </Badge>
  );
}

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  icon?: ReactNode;
}) {
  const positive = delta?.startsWith("+");
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {icon && <span className="text-accent">{icon}</span>}
      </div>
      <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {delta && (
          <span className={positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
            {delta}
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
