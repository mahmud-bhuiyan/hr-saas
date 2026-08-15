import type { CSSProperties, ReactNode } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { Spinner } from "../Spinner";
import { TablePagination, type TablePaginationConfig } from "./TablePagination";

export type TableAlign = "left" | "center" | "right";
export type TableSortDirection = "asc" | "desc";

export interface TableSortState {
  key: string;
  direction: TableSortDirection;
}

const alignClasses: Record<TableAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export interface TableColumn<T> {
  key: string;
  header: string;
  /** Column width as a percentage of the table (e.g. `15` → `15%`). */
  width?: number;
  /** Overrides the table-level `align` for this column. */
  align?: TableAlign;
  /** When true, clicking the header toggles sort via `onSortChange`. */
  sortable?: boolean;
  className?: string;
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Array<TableColumn<T>>;
  data: T[];
  getRowKey: (row: T) => string;
  /** Default alignment for all columns. Per-column `align` overrides this. */
  align?: TableAlign;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  className?: string;
  /** Draw vertical borders between columns. Row dividers stay unchanged. */
  bordered?: boolean;
  /** Remove outer border and shadow from the table container. */
  borderless?: boolean;
  sort?: TableSortState;
  onSortChange?: (sort: TableSortState) => void;
  pagination?: TablePaginationConfig;
}

const columnAlign = <T,>(
  column: TableColumn<T>,
  tableAlign: TableAlign,
): TableAlign => {
  return column.align ?? tableAlign;
};

const columnWidthStyle = (width?: number): CSSProperties | undefined => {
  if (width == null) {
    return undefined;
  }

  return { width: `${width}%` };
};

const cellWrapClass = "whitespace-normal break-words [overflow-wrap:anywhere]";
const columnBorderClass =
  "border-r border-slate-200 last:border-r-0 dark:border-slate-700";

const sortAlignClass: Record<TableAlign, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

interface SortableHeaderProps {
  label: string;
  columnKey: string;
  align: TableAlign;
  sort?: TableSortState;
  onSortChange?: (sort: TableSortState) => void;
}

const SortableHeader = ({
  label,
  columnKey,
  align,
  sort,
  onSortChange,
}: SortableHeaderProps) => {
  const isActive = sort?.key === columnKey;
  const direction = isActive ? sort.direction : undefined;

  const handleClick = () => {
    if (!onSortChange) {
      return;
    }

    if (!isActive) {
      onSortChange({ key: columnKey, direction: "asc" });
      return;
    }

    onSortChange({
      key: columnKey,
      direction: direction === "asc" ? "desc" : "asc",
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex w-full items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 ${sortAlignClass[align]}`}
    >
      <span>{label}</span>
      <span className="inline-flex shrink-0 flex-col -space-y-1">
        <HiChevronUp
          className={`h-3 w-3 ${direction === "asc" ? "text-brand-600" : "text-slate-300 dark:text-slate-600"}`}
          aria-hidden
        />
        <HiChevronDown
          className={`h-3 w-3 ${direction === "desc" ? "text-brand-600" : "text-slate-300 dark:text-slate-600"}`}
          aria-hidden
        />
      </span>
    </button>
  );
};

export const Table = <T,>({
  columns,
  data,
  getRowKey,
  align = "center",
  loading = false,
  loadingMessage = "Loading…",
  emptyMessage = "No records found.",
  className = "",
  bordered = false,
  borderless = false,
  sort,
  onSortChange,
  pagination,
}: TableProps<T>) => {
  const cellColumnBorderClass = bordered ? columnBorderClass : "";
  const containerBorderClass = borderless
    ? ""
    : "border border-slate-200 shadow-sm dark:border-slate-700";

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-12 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400 ${containerBorderClass} ${className}`}
      >
        <Spinner />
        {loadingMessage}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={`rounded-xl bg-white px-6 py-12 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400 ${containerBorderClass} ${className}`}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl bg-white dark:bg-slate-900 ${containerBorderClass} ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={columnWidthStyle(column.width)} />
            ))}
          </colgroup>
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              {columns.map((column) => {
                const cellAlign = columnAlign(column, align);
                return (
                  <th
                    key={column.key}
                    scope="col"
                    style={columnWidthStyle(column.width)}
                    className={`px-4 py-3 ${cellWrapClass} ${alignClasses[cellAlign]} ${cellColumnBorderClass} ${column.className ?? ""}`}
                  >
                    {column.sortable && onSortChange ? (
                      <SortableHeader
                        label={column.header}
                        columnKey={column.key}
                        align={cellAlign}
                        sort={sort}
                        onSortChange={onSortChange}
                      />
                    ) : (
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {column.header}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row) => (
              <tr
                key={getRowKey(row)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
              >
                {columns.map((column) => {
                  const cellAlign = columnAlign(column, align);
                  return (
                    <td
                      key={column.key}
                      style={columnWidthStyle(column.width)}
                      className={`px-4 py-3 text-slate-700 dark:text-slate-300 ${cellWrapClass} ${alignClasses[cellAlign]} ${cellColumnBorderClass} ${column.className ?? ""}`}
                    >
                      {column.render(row)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pagination.total > 0 && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
};
