import api from "@/lib/api";

export type ListExpertsParams = {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    sort_by?: string;
    direction?: "asc" | "desc";
};

export type CreateExpertPayload = {
    first_name: string;
    last_name: string;
    email: string;

    phone?: string;
    avatar?: string;
    bio?: string;
    title?: string;

    highest_qualification?: string;
    years_of_experience?: number;
    hourly_rate?: number;
    timezone?: string;
    languages?: string[];
    specialities: string[];
    certifications?: string[];
    status?: string;
    is_verified?: boolean;
    is_available?: boolean;
};

export type UpdateExpertPayload =
    Partial<CreateExpertPayload>;

export type ExpertStatus =
    | "active"
    | "onboarding"
    | "paused"
    | "offboarded";

/* -------------------------------------------------------
 * CRUD
 * ------------------------------------------------------*/

export const listExperts = (
    params?: ListExpertsParams,
) =>
    api.get(
        "/experts",
        { params },
    ).then(r => r.data);

export const getExpert = (
    id: string,
) =>
    api.get(
        `/experts/${id}`,
    ).then(r => r.data);

export const createExpert = (
    payload: CreateExpertPayload,
) =>
    api.post(
        "/experts",
        payload,
    ).then(r => r.data);

export const updateExpert = (
    id: string,
    payload: UpdateExpertPayload,
) =>
    api.patch(
        `/experts/${id}`,
        payload,
    ).then(r => r.data);

export const deleteExpert = (
    id: string,
) =>
    api.delete(
        `/experts/${id}`,
    ).then(r => r.data);



/* -------------------------------------------------------
 * Status
 * ------------------------------------------------------*/

export const updateExpertStatus = (
    id: string,
    status: ExpertStatus,
) =>
    api.patch(
        `/experts/${id}/status`,
        { status },
    ).then(r => r.data);



/* -------------------------------------------------------
 * Bulk
 * ------------------------------------------------------*/

export const bulkUpdateExpertStatus = (
    ids: string[],
    status: ExpertStatus,
) =>
    api.patch(
        "/experts/bulk/status",
        {
            ids,
            status,
        },
    ).then(r => r.data);

export const bulkDeleteExperts = (
    ids: string[],
) =>
    api.delete(
        "/experts/bulk",
        {
            data: { ids },
        },
    ).then(r => r.data);



/* -------------------------------------------------------
 * Statistics
 * ------------------------------------------------------*/

export const getExpertStatistics = () =>
    api.get(
        "/experts/statistics",
    ).then(r => r.data);



/* -------------------------------------------------------
 * Materials
 * ------------------------------------------------------*/

export const assignMaterial = (
    expertId: string,
    materialId: string,
) =>
    api.post(
        `/experts/${expertId}/materials`,
        {
            material_id: materialId,
        },
    ).then(r => r.data);

export const removeMaterial = (
    expertId: string,
    materialId: string,
) =>
    api.delete(
        `/experts/${expertId}/materials/${materialId}`,
    ).then(r => r.data);