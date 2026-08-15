import { Button } from "../Button";
import { Select } from "../Select";

export interface TablePaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
}

export interface TablePageSizeControlProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  className?: string;
}

interface TablePaginationProps {
  pagination: TablePaginationConfig;
  footerClassName?: string;
}

type PaginationItem = number | "ellipsis";

const getPaginationItems = (totalPages: number): PaginationItem[] => {
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  return [1, 2, "ellipsis", totalPages];
};

export const TablePageSizeControl = ({
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
  className = "",
}: TablePageSizeControlProps) => {
  return (
    <div className={`flex items-center justify-end ${className}`}>
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <span className="whitespace-nowrap">Per page</span>
        <Select
          value={String(pageSize)}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="w-[4.5rem]"
          size="sm"
          aria-label="Per page"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
};

export const TablePagination = ({
  pagination,
  footerClassName = "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50",
}: TablePaginationProps) => {
  const { page, total, rangeStart, rangeEnd, totalPages, onPageChange } =
    pagination;

  const pageItems = getPaginationItems(totalPages);
  const navButtonClass = "px-3 py-1.5 text-xs";
  const pageButtonClass = "min-w-[2.25rem] px-2.5 py-1.5 text-xs";

  return (
    <div
      className={`flex flex-col gap-3 border-t px-4 py-3 lg:flex-row lg:items-center lg:justify-between ${footerClassName}`}
    >
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {total === 0
          ? "No records"
          : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
      </p>

      <nav
        className="flex flex-wrap items-center justify-center gap-1.5"
        aria-label="Table pagination"
      >
        <Button
          type="button"
          variant="secondary"
          className={navButtonClass}
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
        >
          First
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={navButtonClass}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className={`inline-flex items-center justify-center text-slate-400 ${pageButtonClass}`}
              aria-hidden
            >
              . .
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant={item === page ? "primary" : "secondary"}
              className={pageButtonClass}
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="secondary"
          className={navButtonClass}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={navButtonClass}
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          Last
        </Button>
      </nav>
    </div>
  );
};
