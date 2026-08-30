import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  MoreHorizontal,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { AdminLayout } from "@/components/admin/AdminLayout";

import {
  AdminPageHeader,
  StatCard,
  StatusBadge,
  formatDate,
  formatMoney,
} from "@/components/admin/AdminUI";

import {
  ALL,
  DataTable,
  type Column,
} from "@/components/admin/DataTable";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { MaterialsTableSkeleton } from "@/components/skeletons/MaterialsTableSkeleton";
import { LoadingOverlay } from "@/components/skeletons/LoadingOverlay";

import { useDebounce } from "@/hooks/useDebounce";

import type {
  ExamMaterial,
  ExamMaterialStatus,
} from "@/types/examMaterial";

import {
  listExamMaterials,
  getExamMaterialStatistics,
  createExamMaterial,
  updateExamMaterial,
  deleteExamMaterial,
  duplicateExamMaterial,
  submitExamMaterialForReview,
  publishExamMaterial,
  archiveExamMaterial,
  bulkUpdateExamMaterials,
  bulkDeleteExamMaterials,
} from "@/services/examMaterialService";

const STATUSES: ExamMaterialStatus[] = [
  "draft",
  "in-review",
  "published",
  "archived",
];

interface MaterialFormState {
  title: string;
  description: string;
  exam: string;
  subject: string;
  price: string;
}

const EMPTY_FORM: MaterialFormState = {
  title: "",
  description: "",
  exam: "",
  subject: "",
  price: "0",
};

function MaterialsPage() {
  const [rows, setRows] = useState<ExamMaterial[]>([]);

  const [editing, setEditing] =
    useState<ExamMaterial | null>(null);

  const [creating, setCreating] =
    useState(false);

  const [form, setForm] =
    useState<MaterialFormState>(
      EMPTY_FORM,
    );

  const [initialTableLoading, setInitialTableLoading] =
    useState(true);

  const [refreshingTable, setRefreshingTable] =
    useState(false);

  const [initialStatsLoading, setInitialStatsLoading] =
    useState(true);

  const [status, setStatus] =
    useState(ALL);

  const [exam, setExam] =
    useState(ALL);

  const [page, setPage] =
    useState(1);

  const [perPage] =
    useState(20);

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState("created_at");

  const [direction, setDirection] =
    useState<"asc" | "desc">(
      "desc",
    );

  const [busyRowId, setBusyRowId] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [pagination, setPagination] =
    useState({
      page: 1,
      pages: 1,
      total: 0,
      per_page: 20,
    });

  const [statistics, setStatistics] =
    useState({
      total: 0,
      published: 0,
      in_review: 0,
      revenue: 0,
    });

  const debouncedSearch =
    useDebounce(search, 300);

  const isFirstLoad =
    useRef(true);

  /*
   * ------------------------------------------------------------------------
   * Load materials
   * ------------------------------------------------------------------------
   */

  const loadMaterials = async (
    initial = false,
  ) => {
    try {
      if (initial) {
        setInitialTableLoading(true);
      } else {
        setRefreshingTable(true);
      }

      const response =
        await listExamMaterials({
          page,
          per_page: perPage,
          search: debouncedSearch || undefined,

          status:
            status === ALL
              ? undefined
              : status,

          exam:
            exam === ALL
              ? undefined
              : exam,

          sort_by: sortBy,
          direction,
        });

      setRows(response.items);

      setPagination(
        response.pagination,
      );
    } catch {
      toast.error(
        "Unable to load exam materials.",
      );
    } finally {
      setInitialTableLoading(false);
      setRefreshingTable(false);
    }
  };

  /*
   * ------------------------------------------------------------------------
   * Load statistics
   * ------------------------------------------------------------------------
   */

  const loadStatistics =
    async () => {
      try {
        setInitialStatsLoading(
          true,
        );

        const response =
          await getExamMaterialStatistics();

        setStatistics({
          total: response.total,
          published:
            response.published,
          in_review:
            response.in_review,
          revenue:
            response.revenue,
        });
      } catch {
        toast.error(
          "Unable to load material statistics.",
        );
      } finally {
        setInitialStatsLoading(
          false,
        );
      }
    };

  /*
   * ------------------------------------------------------------------------
   * Initial statistics
   * ------------------------------------------------------------------------
   */

  useEffect(() => {
    void loadStatistics();
  }, []);

  /*
   * ------------------------------------------------------------------------
   * Table loading
   * ------------------------------------------------------------------------
   */

  useEffect(() => {
    void loadMaterials(
      isFirstLoad.current,
    );

    isFirstLoad.current = false;
  }, [
    page,
    status,
    exam,
    debouncedSearch,
    sortBy,
    direction,
  ]);

  /*
   * ------------------------------------------------------------------------
   * Search / filters / sorting
   * ------------------------------------------------------------------------
   */

  const handleSearch = (
    value: string,
  ) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatus = (
    value: string,
  ) => {
    setStatus(value);
    setPage(1);
  };

  const handleExam = (
    value: string,
  ) => {
    setExam(value);
    setPage(1);
  };

  const handleSort = (
    key: string,
    nextDirection: "asc" | "desc",
  ) => {
    setSortBy(key);
    setDirection(nextDirection);
    setPage(1);
  };

  /*
   * ------------------------------------------------------------------------
   * Dialog helpers
   * ------------------------------------------------------------------------
   */

  const openCreateDialog =
    () => {
      setEditing(null);

      setForm(
        EMPTY_FORM,
      );

      setCreating(true);
    };

  const openEditDialog = (
    material: ExamMaterial,
  ) => {
    setEditing(material);

    setForm({
      title:
        material.title ?? "",

      description:
        material.description ?? "",

      exam:
        material.exam ?? "",

      subject:
        material.subject ?? "",

      price:
        String(
          material.price ?? 0,
        ),
    });

    setCreating(false);
  };

  const closeDialog =
    () => {
      if (saving) {
        return;
      }

      setEditing(null);
      setCreating(false);
      setForm(
        EMPTY_FORM,
      );
    };

  const updateForm = (
    field: keyof MaterialFormState,
    value: string,
  ) => {
    setForm(
      previous => ({
        ...previous,
        [field]: value,
      }),
    );
  };

  /*
   * ------------------------------------------------------------------------
   * Create / update
   * ------------------------------------------------------------------------
   */

  const handleSave =
    async () => {
      if (!form.title.trim()) {
        toast.error(
          "Title is required.",
        );
        return;
      }

      if (!form.exam.trim()) {
        toast.error(
          "Exam is required.",
        );
        return;
      }

      if (!form.subject.trim()) {
        toast.error(
          "Subject is required.",
        );
        return;
      }

      const price =
        Number(form.price);

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        toast.error(
          "Enter a valid non-negative price.",
        );
        return;
      }

      try {
        setSaving(true);

        if (editing) {
          await updateExamMaterial(
            editing.id,
            {
              title:
                form.title.trim(),

              description:
                form.description.trim() ||
                null,

              exam:
                form.exam.trim(),

              subject:
                form.subject.trim(),

              price,
            },
          );

          toast.success(
            "Material updated successfully.",
          );
        } else {
          await createExamMaterial({
            title:
              form.title.trim(),

            description:
              form.description.trim() ||
              null,

            exam:
              form.exam.trim(),

            subject:
              form.subject.trim(),

            price,
          });

          toast.success(
            "Material created successfully.",
          );
        }

        closeDialog();

        await Promise.all([
          loadMaterials(),
          loadStatistics(),
        ]);
      } catch {
        toast.error(
          editing
            ? "Unable to update material."
            : "Unable to create material.",
        );
      } finally {
        setSaving(false);
      }
    };

  /*
   * ------------------------------------------------------------------------
   * Workflow actions
   * ------------------------------------------------------------------------
   */

  const handleSubmitForReview =
    async (
      id: string,
    ) => {
      try {
        setBusyRowId(id);

        await submitExamMaterialForReview(
          id,
        );

        await loadMaterials();

        toast.success(
          "Material submitted for review.",
        );
      } catch {
        toast.error(
          "Unable to submit material for review.",
        );
      } finally {
        setBusyRowId(null);
      }
    };

  const handlePublish =
    async (
      id: string,
    ) => {
      try {
        setBusyRowId(id);

        await publishExamMaterial(
          id,
        );

        await Promise.all([
          loadMaterials(),
          loadStatistics(),
        ]);

        toast.success(
          "Material published successfully.",
        );
      } catch {
        toast.error(
          "Unable to publish material.",
        );
      } finally {
        setBusyRowId(null);
      }
    };

  const handleArchive =
    async (
      id: string,
    ) => {
      try {
        setBusyRowId(id);

        await archiveExamMaterial(
          id,
        );

        await Promise.all([
          loadMaterials(),
          loadStatistics(),
        ]);

        toast.success(
          "Material archived successfully.",
        );
      } catch {
        toast.error(
          "Unable to archive material.",
        );
      } finally {
        setBusyRowId(null);
      }
    };

  /*
   * ------------------------------------------------------------------------
   * Duplicate
   * ------------------------------------------------------------------------
   */

  const handleDuplicate =
    async (
      id: string,
    ) => {
      try {
        setBusyRowId(id);

        await duplicateExamMaterial(
          id,
        );

        await loadMaterials();

        toast.success(
          "Material duplicated as a draft.",
        );
      } catch {
        toast.error(
          "Unable to duplicate material.",
        );
      } finally {
        setBusyRowId(null);
      }
    };

  /*
   * ------------------------------------------------------------------------
   * Delete one
   * ------------------------------------------------------------------------
   */

  const handleDelete =
    async (
      id: string,
    ) => {
      try {
        setBusyRowId(id);

        await deleteExamMaterial(
          id,
        );

        await Promise.all([
          loadMaterials(),
          loadStatistics(),
        ]);

        toast.success(
          "Material deleted successfully.",
        );
      } catch {
        toast.error(
          "Unable to delete material.",
        );
      } finally {
        setBusyRowId(null);
      }
    };

  /*
   * ------------------------------------------------------------------------
   * Bulk update
   * ------------------------------------------------------------------------
   */

  const handleBulkStatus =
    async (
      ids: string[],
      nextStatus:
        | "published"
        | "archived",
      clear: () => void,
    ) => {
      try {
        await bulkUpdateExamMaterials(ids, {
          status: nextStatus,
        });

        clear();

        await Promise.all([
          loadMaterials(),
          loadStatistics(),
        ]);

        toast.success(
          `${ids.length} material${
            ids.length === 1
              ? ""
              : "s"
          } ${
            nextStatus === "published"
              ? "published"
              : "archived"
          } successfully.`,
        );
      } catch {
        toast.error(
          `Unable to ${
            nextStatus === "published"
              ? "publish"
              : "archive"
          } selected materials.`,
        );
      }
    };

  /*
   * ------------------------------------------------------------------------
   * Bulk delete
   * ------------------------------------------------------------------------
   */

  const handleBulkDelete =
    async (
      ids: string[],
      clear: () => void,
    ) => {
      try {
        const count =
          await bulkDeleteExamMaterials(ids);

        clear();

        await Promise.all([
          loadMaterials(),
          loadStatistics(),
        ]);

        toast.success(
          `${count} material${
            count === 1
              ? ""
              : "s"
          } deleted successfully.`,
        );
      } catch {
        toast.error(
          "Unable to delete selected materials.",
        );
      }
    };

  /*
   * ------------------------------------------------------------------------
   * Table columns
   * ------------------------------------------------------------------------
   */

  const columns: Column<ExamMaterial>[] = [
    {
      key: "title",
      header: "Material",
      sortValue: (r) => r.title,
      render: (r) => (
        <div className="min-w-56">
          <p className="font-medium leading-tight">
            {r.title}
          </p>

          <p className="text-xs text-muted-foreground">
            {r.exam} · {r.subject}
            {r.page_count != null
              ? ` · ${r.page_count}pp`
              : ""}
            {r.mime_type
              ? ` · ${r.mime_type.split("/").pop()?.toUpperCase()}`
              : ""}
          </p>
        </div>
      ),
    },

    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.status,
      render: (r) => (
        <StatusBadge value={r.status} />
      ),
    },

    {
      key: "price",
      header: "Price",
      sortValue: (r) => r.price,
      render: (r) => formatMoney(r.price),
    },

    {
      key: "downloads",
      header: "Sales",
      sortValue: (r) => r.downloads,
      render: (r) => r.downloads.toLocaleString(),
    },

    {
      key: "revenue",
      header: "Revenue",
      sortValue: (r) => r.revenue,
      render: (r) => formatMoney(r.revenue),
    },

    {
      key: "expert_id",
      header: "Expert",
      sortValue: (r) => r.expert_id ?? "",
      render: (r) => r.expert_id ?? "—",
    },

    {
      key: "updated_at",
      header: "Updated",
      sortValue: (r) => r.updated_at ?? "",
      render: (r) =>
        r.updated_at
          ? formatDate(r.updated_at)
          : "—",
    },
  ];

  /*
   * ------------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------------
   */

  return (
    <>
      <AdminLayout>
        <AdminPageHeader
          title="Exam materials"
          description="Catalogue management: pricing, review workflow, publication and takedowns."
          actions={
            <Button
              variant="hero"
              onClick={
                openCreateDialog
              }
            >
              <Plus className="h-4 w-4" />
              New material
            </Button>
          }
        />

        {/*
         * ------------------------------------------------------------------
         * Statistics
         * ------------------------------------------------------------------
         */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {initialStatsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Catalogue"
                value={String(
                  statistics.total,
                )}
              />

              <StatCard
                label="Published"
                value={String(
                  statistics.published,
                )}
              />

              <StatCard
                label="Awaiting review"
                value={String(
                  statistics.in_review,
                )}
              />

              <StatCard
                label="Lifetime revenue"
                value={formatMoney(
                  statistics.revenue,
                )}
              />
            </>
          )}
        </div>

        {/*
         * ------------------------------------------------------------------
         * Table
         * ------------------------------------------------------------------
         */}

        <DataTable
          initialLoading={
            initialTableLoading
          }
          refreshing={
            refreshingTable
          }
          loadingSkeleton={
            <MaterialsTableSkeleton />
          }
          loadingOverlay={
            <LoadingOverlay />
          }
          rows={rows}
          columns={columns}
          getId={(
            material,
          ) => material.id}
          page={page}
          totalPages={
            pagination.pages
          }
          onPageChange={
            setPage
          }
          searchValue={
            search
          }
          onSearchChange={
            handleSearch
          }
          sortKey={
            sortBy
          }
          sortDirection={
            direction
          }
          onSortChange={
            handleSort
          }
          searchText={(
            material,
          ) =>
            [
              material.title,
              material.exam,
              material.subject,
              material.file_name ??
                "",
              material.expert_id ??
                "",
            ].join(" ")
          }
          searchPlaceholder="Search materials…"
          onRowClick={
            openEditDialog
          }
          filters={[
            {
              key: "status",
              label: "Status",
              value: status,
              onChange:
                handleStatus,
              options:
                STATUSES.map(
                  value => ({
                    value,
                    label: value,
                  }),
                ),
            },

            {
              key: "exam",
              label: "Exam",
              value: exam,
              onChange:
                handleExam,
              options: [],
            },
          ]}
          bulkActions={(
            ids,
            clear,
          ) => (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  void handleBulkStatus(
                    ids,
                    "published",
                    clear,
                  )
                }
              >
                Publish
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  void handleBulkStatus(
                    ids,
                    "archived",
                    clear,
                  )
                }
              >
                Archive
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={() =>
                  void handleBulkDelete(
                    ids,
                    clear,
                  )
                }
              >
                Delete
              </Button>
            </>
          )}
          rowActions={(
            material,
          ) => (
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Actions for ${material.title}`}
                  disabled={
                    busyRowId ===
                    material.id
                  }
                >
                  {busyRowId ===
                  material.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    openEditDialog(
                      material,
                    )
                  }
                >
                  Edit details
                </DropdownMenuItem>

                {material.status ===
                  "draft" && (
                  <DropdownMenuItem
                    disabled={
                      busyRowId ===
                      material.id
                    }
                    onClick={() =>
                      void handleSubmitForReview(
                        material.id,
                      )
                    }
                  >
                    Send for review
                  </DropdownMenuItem>
                )}

                {material.status ===
                  "in-review" && (
                  <DropdownMenuItem
                    disabled={
                      busyRowId ===
                      material.id
                    }
                    onClick={() =>
                      void handlePublish(
                        material.id,
                      )
                    }
                  >
                    Publish
                  </DropdownMenuItem>
                )}

                {(material.status ===
                  "published" ||
                  material.status ===
                    "in-review" ||
                  material.status ===
                    "draft") && (
                  <DropdownMenuItem
                    disabled={
                      busyRowId ===
                      material.id
                    }
                    onClick={() =>
                      void handleArchive(
                        material.id,
                      )
                    }
                  >
                    Archive
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  disabled={
                    busyRowId ===
                    material.id
                  }
                  onClick={() =>
                    void handleDuplicate(
                      material.id,
                    )
                  }
                >
                  Duplicate
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive"
                  disabled={
                    busyRowId ===
                    material.id
                  }
                  onClick={() =>
                    void handleDelete(
                      material.id,
                    )
                  }
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />

        {/*
         * ------------------------------------------------------------------
         * Create / Edit dialog
         * ------------------------------------------------------------------
         */}

        <Dialog
          open={
            creating ||
            editing !== null
          }
          onOpenChange={(
            open,
          ) => {
            if (!open) {
              closeDialog();
            }
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? "Edit material"
                  : "New material"}
              </DialogTitle>

              <DialogDescription>
                {editing
                  ? "Update the material metadata and pricing."
                  : "Create a new exam material. New materials start as drafts."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="m-title">
                  Title
                </Label>

                <Input
                  id="m-title"
                  value={
                    form.title
                  }
                  onChange={event =>
                    updateForm(
                      "title",
                      event.target
                        .value,
                    )
                  }
                  className="mt-1.5"
                  disabled={
                    saving
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="m-exam">
                    Exam
                  </Label>

                  <Input
                    id="m-exam"
                    value={
                      form.exam
                    }
                    onChange={event =>
                      updateForm(
                        "exam",
                        event.target
                          .value,
                      )
                    }
                    className="mt-1.5"
                    disabled={
                      saving
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="m-subject">
                    Subject
                  </Label>

                  <Input
                    id="m-subject"
                    value={
                      form.subject
                    }
                    onChange={event =>
                      updateForm(
                        "subject",
                        event.target
                          .value,
                      )
                    }
                    className="mt-1.5"
                    disabled={
                      saving
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="m-price">
                  Price
                </Label>

                <Input
                  id="m-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.price
                  }
                  onChange={event =>
                    updateForm(
                      "price",
                      event.target
                        .value,
                    )
                  }
                  className="mt-1.5"
                  disabled={
                    saving
                  }
                />
              </div>

              <div>
                <Label htmlFor="m-desc">
                  Description
                </Label>

                <Textarea
                  id="m-desc"
                  rows={4}
                  value={
                    form.description
                  }
                  onChange={event =>
                    updateForm(
                      "description",
                      event.target
                        .value,
                    )
                  }
                  className="mt-1.5"
                  placeholder="What's inside this material…"
                  disabled={
                    saving
                  }
                />
              </div>

              {editing && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="font-medium">
                    File
                  </p>

                  <p className="mt-1 text-muted-foreground">
                    {editing.file_name ??
                      "No file attached"}
                  </p>

                  {editing.page_count !=
                    null && (
                    <p className="text-xs text-muted-foreground">
                      {
                        editing.page_count
                      }{" "}
                      pages
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={
                  closeDialog
                }
                disabled={
                  saving
                }
              >
                Cancel
              </Button>

              <Button
                variant="hero"
                onClick={() =>
                  void handleSave()
                }
                disabled={
                  saving
                }
              >
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {editing
                  ? "Save changes"
                  : "Create material"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}

export default MaterialsPage;
