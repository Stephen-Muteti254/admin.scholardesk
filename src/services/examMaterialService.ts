import api from "@/lib/api";

export type ExamMaterialListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  exam?: string;
  subject?: string;
  expert_id?: string;
  sort_by?: string;
  direction?: "asc" | "desc";
};

export const listExamMaterials = (
  params?: ExamMaterialListParams
) =>
  api
    .get("/admin/exam-materials", { params })
    .then((r) => r.data);

export const getExamMaterial = (
  id: string
) =>
  api
    .get(`/admin/exam-materials/${id}`)
    .then((r) => r.data);

export const createExamMaterial = (
  payload: Record<string, unknown>
) =>
  api
    .post("/admin/exam-materials", payload)
    .then((r) => r.data);

export const updateExamMaterial = (
  id: string,
  payload: Record<string, unknown>
) =>
  api
    .patch(`/admin/exam-materials/${id}`, payload)
    .then((r) => r.data);

export const deleteExamMaterial = (
  id: string
) =>
  api
    .delete(`/admin/exam-materials/${id}`)
    .then((r) => r.data);

export const duplicateExamMaterial = (
  id: string
) =>
  api
    .post(`/admin/exam-materials/${id}/duplicate`)
    .then((r) => r.data);

export const submitExamMaterialForReview = (
  id: string
) =>
  api
    .post(`/admin/exam-materials/${id}/submit-review`)
    .then((r) => r.data);

export const publishExamMaterial = (
  id: string
) =>
  api
    .post(`/admin/exam-materials/${id}/publish`)
    .then((r) => r.data);

export const archiveExamMaterial = (
  id: string
) =>
  api
    .post(`/admin/exam-materials/${id}/archive`)
    .then((r) => r.data);

export const bulkUpdateExamMaterials = (
  ids: string[],
  payload: Record<string, unknown>
) =>
  api
    .patch("/admin/exam-materials/bulk", {
      ids,
      ...payload,
    })
    .then((r) => r.data);

export const bulkPublishExamMaterials = (
  ids: string[]
) =>
  api
    .post("/admin/exam-materials/bulk/publish", {
      ids,
    })
    .then((r) => r.data);

export const bulkArchiveExamMaterials = (
  ids: string[]
) =>
  api
    .post("/admin/exam-materials/bulk/archive", {
      ids,
    })
    .then((r) => r.data);

export const bulkDeleteExamMaterials = (
  ids: string[]
) =>
  api
    .delete("/admin/exam-materials/bulk", {
      data: { ids },
    })
    .then((r) => r.data);

export const uploadExamMaterialFile = (
  id: string,
  formData: FormData
) =>
  api
    .post(
      `/admin/exam-materials/${id}/file`,
      formData
    )
    .then((r) => r.data);

export const getExamMaterialStatistics = () =>
  api
    .get("/admin/exam-materials/statistics")
    .then((r) => r.data);