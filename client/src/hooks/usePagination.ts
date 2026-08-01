import { useEffect, useMemo, useState } from 'react';

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

interface UsePaginationOptions {
  defaultPageSize?: number;
  /** When this value changes, the current page resets to 1 (e.g. filter query string). */
  resetKey?: string | number;
}

export const usePagination = <T,>(
  items: T[],
  options?: UsePaginationOptions
) => {
  const defaultPageSize = options?.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  useEffect(() => {
    setPage(1);
  }, [options?.resetKey]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const rangeStart = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, total);

  return {
    page: safePage,
    pageSize,
    setPage,
    setPageSize,
    paginatedItems,
    total,
    totalPages,
    rangeStart,
    rangeEnd,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
  };
};
