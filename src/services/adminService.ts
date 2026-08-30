import api from "@/lib/api";

/* ------------------------------------------------------------------
 * Every admin network call goes through the centralized `api` client.
 * Backend endpoints are implemented separately — the UI currently runs
 * on mock data and calls these helpers optimistically.
 * ----------------------------------------------------------------*/

export type ListParams = Record<string, string | number | boolean | undefined>;

/* --- Service requests (AI, class, assignment, exam, interview) --- */
export const listRequests = (params?: ListParams) =>
  api.get("/admin/requests", { params }).then((r) => r.data);

export const getRequest = (id: string) => api.get(`/admin/requests/${id}`).then((r) => r.data);

export const updateRequest = (id: string, payload: Record<string, unknown>) =>
  api.patch(`/admin/requests/${id}`, payload).then((r) => r.data);

export const bulkUpdateRequests = (ids: string[], payload: Record<string, unknown>) =>
  api.patch("/admin/requests/bulk", { ids, ...payload }).then((r) => r.data);

export const deleteRequest = (id: string) => api.delete(`/admin/requests/${id}`).then((r) => r.data);

export const assignRequest = (id: string, assigneeId: string) =>
  api.post(`/admin/requests/${id}/assign`, { assigneeId }).then((r) => r.data);

export const sendQuote = (id: string, payload: Record<string, unknown>) =>
  api.post(`/admin/requests/${id}/quotes`, payload).then((r) => r.data);

export const updateQuote = (id: string, quoteId: string, payload: Record<string, unknown>) =>
  api.patch(`/admin/requests/${id}/quotes/${quoteId}`, payload).then((r) => r.data);

export const withdrawQuote = (id: string, quoteId: string) =>
  api.delete(`/admin/requests/${id}/quotes/${quoteId}`).then((r) => r.data);

export const replyToRequest = (id: string, formData: FormData) =>
  api.post(`/admin/requests/${id}/messages`, formData).then((r) => r.data);

export const uploadDeliverable = (id: string, formData: FormData) =>
  api.post(`/admin/requests/${id}/deliverables`, formData).then((r) => r.data);

export const deleteAttachment = (id: string, attachmentId: string) =>
  api.delete(`/admin/requests/${id}/attachments/${attachmentId}`).then((r) => r.data);

export const refundRequest = (id: string, payload: Record<string, unknown>) =>
  api.post(`/admin/requests/${id}/refund`, payload).then((r) => r.data);

/* --- Materials --- */
export const listMaterials = (params?: ListParams) =>
  api.get("/admin/materials", { params }).then((r) => r.data);
export const createMaterial = (payload: Record<string, unknown>) =>
  api.post("/admin/materials", payload).then((r) => r.data);
export const updateMaterial = (id: string, payload: Record<string, unknown>) =>
  api.patch(`/admin/materials/${id}`, payload).then((r) => r.data);
export const deleteMaterial = (id: string) =>
  api.delete(`/admin/materials/${id}`).then((r) => r.data);
export const bulkUpdateMaterials = (ids: string[], payload: Record<string, unknown>) =>
  api.patch("/admin/materials/bulk", { ids, ...payload }).then((r) => r.data);
export const uploadMaterialFile = (id: string, formData: FormData) =>
  api.post(`/admin/materials/${id}/file`, formData).then((r) => r.data);

/* --- Orders & payments --- */
export const listOrders = (params?: ListParams) =>
  api.get("/admin/orders", { params }).then((r) => r.data);
export const updateOrder = (id: string, payload: Record<string, unknown>) =>
  api.patch(`/admin/orders/${id}`, payload).then((r) => r.data);
export const refundOrder = (id: string, payload: Record<string, unknown>) =>
  api.post(`/admin/orders/${id}/refund`, payload).then((r) => r.data);
export const resendReceipt = (id: string) =>
  api.post(`/admin/orders/${id}/receipt`).then((r) => r.data);
export const exportOrders = (params?: ListParams) =>
  api.get("/admin/orders/export", { params, responseType: "blob" }).then((r) => r.data);

/* --- Customers --- */
export const listCustomers = (params?: ListParams) =>
  api.get("/admin/customers", { params }).then((r) => r.data);
export const updateCustomer = (id: string, payload: Record<string, unknown>) =>
  api.patch(`/admin/customers/${id}`, payload).then((r) => r.data);
export const deleteCustomer = (id: string) =>
  api.delete(`/admin/customers/${id}`).then((r) => r.data);
export const messageCustomer = (id: string, payload: Record<string, unknown>) =>
  api.post(`/admin/customers/${id}/messages`, payload).then((r) => r.data);

/* --- Experts & payouts --- */
export const listExperts = (params?: ListParams) =>
  api.get("/admin/experts", { params }).then((r) => r.data);
export const createExpert = (payload: Record<string, unknown>) =>
  api.post("/admin/experts", payload).then((r) => r.data);
export const updateExpert = (id: string, payload: Record<string, unknown>) =>
  api.patch(`/admin/experts/${id}`, payload).then((r) => r.data);
export const deleteExpert = (id: string) => api.delete(`/admin/experts/${id}`).then((r) => r.data);
export const listPayouts = (params?: ListParams) =>
  api.get("/admin/payouts", { params }).then((r) => r.data);
export const updatePayout = (id: string, payload: Record<string, unknown>) =>
  api.patch(`/admin/payouts/${id}`, payload).then((r) => r.data);

/* --- ExamStealth licences --- */
export const listLicenses = (params?: ListParams) =>
  api.get("/admin/stealth/licenses", { params }).then((r) => r.data);
export const issueLicense = (payload: Record<string, unknown>) =>
  api.post("/admin/stealth/licenses", payload).then((r) => r.data);
export const updateLicense = (id: string, payload: Record<string, unknown>) =>
  api.patch(`/admin/stealth/licenses/${id}`, payload).then((r) => r.data);
export const revokeLicense = (id: string) =>
  api.post(`/admin/stealth/licenses/${id}/revoke`).then((r) => r.data);
export const deleteLicense = (id: string) =>
  api.delete(`/admin/stealth/licenses/${id}`).then((r) => r.data);

/* --- Analytics & settings --- */
export const getDashboardMetrics = (params?: ListParams) =>
  api.get("/admin/analytics/overview", { params }).then((r) => r.data);
export const getSettings = () => api.get("/admin/settings").then((r) => r.data);
export const updateSettings = (payload: Record<string, unknown>) =>
  api.put("/admin/settings", payload).then((r) => r.data);
export const listTeam = () => api.get("/admin/team").then((r) => r.data);
export const inviteTeamMember = (payload: Record<string, unknown>) =>
  api.post("/admin/team/invitations", payload).then((r) => r.data);
export const updateTeamMember = (id: string, payload: Record<string, unknown>) =>
  api.patch(`/admin/team/${id}`, payload).then((r) => r.data);
export const removeTeamMember = (id: string) => api.delete(`/admin/team/${id}`).then((r) => r.data);
