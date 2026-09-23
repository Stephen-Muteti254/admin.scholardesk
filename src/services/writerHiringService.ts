import api from "@/lib/api";

/**
 * Whether ScholarDesk is currently accepting new expert/writer
 * applications. Read publicly (no auth) by every ScholarDesk
 * frontend at GET /platform/settings; toggled here from the admin
 * dashboard.
 *
 * Deliberately a small, separate surface from settingsService.ts's
 * WorkspaceSettings (brand/SLAs/notifications/team) - that surface is
 * still unbuilt on the backend; this one is live.
 */
export interface WriterHiringSetting {
  writer_hiring_open: boolean;
  hiring_notice: string | null;
  updated_at: string | null;
}

export async function getWriterHiringSetting(): Promise<WriterHiringSetting> {
  const response = await api.get("/admin/settings/writer-hiring");
  return response.data.data ?? response.data;
}

export async function updateWriterHiringSetting(
  payload: Partial<Pick<WriterHiringSetting, "writer_hiring_open" | "hiring_notice">>,
): Promise<WriterHiringSetting> {
  const response = await api.patch("/admin/settings/writer-hiring", payload);
  return response.data.data ?? response.data;
}
