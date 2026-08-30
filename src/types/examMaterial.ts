export type ExamMaterialStatus =
  | "draft"
  | "in-review"
  | "published"
  | "archived";

export interface ExamMaterial {
  id: string;

  title: string;
  description: string | null;

  exam: string;
  subject: string;

  expert_id: string | null;

  status: ExamMaterialStatus;

  price: number;
  downloads: number;
  revenue: number;

  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  storage_key: string | null;
  page_count: number | null;

  reviewed_by: string | null;
  reviewed_at: string | null;

  published_at: string | null;
  archived_at: string | null;

  created_at: string | null;
  updated_at: string | null;
}

export interface ExamMaterialPagination {
  page: number;
  pages: number;
  total: number;
  per_page: number;
}

export interface ExamMaterialListResponse {
  items: ExamMaterial[];
  pagination: ExamMaterialPagination;
}

export interface ExamMaterialStatistics {
  total: number;
  published: number;
  in_review: number;
  revenue: number;
}
