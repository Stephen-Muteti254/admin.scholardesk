import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const ALL = "all";

export type Column<T> = {
  key: string;
  header: string;
  className?: string;
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
};

export type FilterConfig = {
  key: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  getId: (row: T) => string;
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  rowActions?: (row: T) => ReactNode;
  bulkActions?: (
    ids: string[],
    clear: () => void
  ) => ReactNode;
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  emptyMessage?: string;
  initialLoading?: boolean;
  refreshing?: boolean;
  loadingSkeleton?: ReactNode;
  loadingOverlay?: ReactNode;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  searchValue: string;
  onSearchChange: (
    value: string,
  ) => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (
    key: string,
    direction: "asc" | "desc",
  ) => void;
};

export function DataTable<T>({
  rows,
  columns,
  getId,
  searchText,
  searchPlaceholder = "Search…",
  filters = [],
  rowActions,
  bulkActions,
  onRowClick,
  toolbar,
  emptyMessage = "Nothing here yet.",
  initialLoading = false,
  refreshing = false,
  loadingSkeleton,
  loadingOverlay,
  page,
  totalPages,
  onPageChange,
  searchValue,
  onSearchChange,
  sortKey,
  sortDirection,
  onSortChange,
}: Props<T>) {
  const [selected, setSelected] = useState<string[]>([]);

  const pageRows = rows;
  const allOnPage = pageRows.length > 0 && pageRows.every((r) => selected.includes(getId(r)));
  const activeFilters = filters.filter((f) => f.value !== ALL);

if (initialLoading) {
  return loadingSkeleton;
}

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <Select
              key={f.key}
              value={f.value}
              onValueChange={(v) => {
                f.onChange(v);
              }}
            >
              <SelectTrigger className="h-9 w-[170px]">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{f.label}: all</SelectItem>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {(activeFilters.length > 0 || searchValue.trim() !== "") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                filters.forEach((f) => f.onChange(ALL));
                onSearchChange("");
                onPageChange(1);
            }}
            >
              <X className="h-3.5 w-3.5" /> Reset
            </Button>
          )}
          {toolbar}
        </div>
      </div>

      {bulkActions && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <div className="flex flex-wrap items-center gap-2">
            {bulkActions(selected, () => setSelected([]))}
          </div>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>
      )}

      <div className="relative">

        {refreshing && loadingOverlay}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {bulkActions && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allOnPage}
                      onCheckedChange={(v) =>
                        setSelected((prev) => {
                          const ids = pageRows.map(getId);
                          return v ? [...new Set([...prev, ...ids])] : prev.filter((i) => !ids.includes(i));
                        })
                      }
                      aria-label="Select all rows on page"
                    />
                  </TableHead>
                )}
                {columns.map((c) => (
                  <TableHead
                    key={c.key}
                    className={cn(
                      "whitespace-nowrap text-xs uppercase tracking-wide",
                      c.sortValue && "cursor-pointer select-none",
                      c.className,
                    )}
                    onClick={
                      c.sortValue
                          ? () =>
                                onSortChange?.(
                                    c.key,
                                    sortKey === c.key &&
                                    sortDirection === "asc"
                                        ? "desc"
                                        : "asc"
                                )
                          : undefined
                      }
                  >
                    {c.header}
                    {sortKey === c.key && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                ))}
                {rowActions && <TableHead className="w-16 text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row) => {
                const id = getId(row);
                return (
                  <TableRow
                    key={id}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {bulkActions && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.includes(id)}
                          onCheckedChange={(v) =>
                            setSelected((prev) => (v ? [...prev, id] : prev.filter((i) => i !== id)))
                          }
                          aria-label={`Select ${id}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((c) => (
                      <TableCell key={c.key} className={c.className}>
                        {c.render(row)}
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        {rowActions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (rowActions ? 1 : 0) + (bulkActions ? 1 : 0)}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {pageRows.length} records
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
