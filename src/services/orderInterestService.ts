import api from "@/lib/api";

/**
 * Expert interest registered against an order.
 *
 * Interest is advisory only: it never assigns, reserves or locks an order.
 * Support remains free to assign any active expert, interest notwithstanding.
 */
export interface OrderInterest {
  id: string;
  expertId: string;
  expertName: string;
  expertEmail?: string | null;
  specialities?: string[] | null;
  rating?: number | null;
  completedOrders?: number | null;
  activeAssignments?: number | null;
  isAvailable?: boolean | null;
  note?: string | null;
  createdAt: string;
  withdrawnAt?: string | null;
}

export interface ListOrderInterestsResponse {
  items: OrderInterest[];
  total: number;
}

function normalize(raw: Record<string, unknown>): OrderInterest {
  const pick = <T,>(...keys: string[]): T | undefined => {
    for (const key of keys) {
      const value = raw[key];
      if (value !== undefined && value !== null) return value as T;
    }
    return undefined;
  };

  return {
    id: String(pick<string | number>("id") ?? ""),
    expertId: String(pick<string | number>("expertId", "expert_id") ?? ""),
    expertName: pick<string>("expertName", "expert_name", "name") ?? "Expert",
    expertEmail: pick<string>("expertEmail", "expert_email", "email") ?? null,
    specialities: pick<string[]>("specialities", "specialties", "subjects") ?? null,
    rating: pick<number>("rating") ?? null,
    completedOrders: pick<number>("completedOrders", "completed_orders") ?? null,
    activeAssignments: pick<number>("activeAssignments", "active_assignments") ?? null,
    isAvailable: pick<boolean>("isAvailable", "is_available") ?? null,
    note: pick<string>("note", "message") ?? null,
    createdAt: pick<string>("createdAt", "created_at") ?? new Date().toISOString(),
    withdrawnAt: pick<string>("withdrawnAt", "withdrawn_at") ?? null,
  };
}

/** GET /admin/orders/:id/interests */
export async function listOrderInterests(orderId: string): Promise<ListOrderInterestsResponse> {
  const response = await api.get(`/admin/orders/${orderId}/interests`);
  const payload = response.data?.data ?? response.data;
  const items: Record<string, unknown>[] = Array.isArray(payload)
    ? payload
    : (payload?.items ?? []);

  return {
    items: items.map(normalize).filter((interest) => !interest.withdrawnAt),
    total: Number(payload?.total ?? items.length),
  };
}
