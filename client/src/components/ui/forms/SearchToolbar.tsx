import type { ReactNode } from "react";
import { HiMagnifyingGlass, HiQueueList } from "react-icons/hi2";
import { PAGE_SIZE_OPTIONS } from "../../../hooks/usePagination";
import { FormField } from "../FormField";
import { Input } from "../Input";
import { Select } from "../Select";

export interface SearchToolbarSelectOption {
  value: string;
  label: string;
}

export interface SearchToolbarSelectFilter {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SearchToolbarSelectOption[];
  allOptionLabel?: string;
  icon?: ReactNode;
  className?: string;
  selectClassName?: string;
}

export interface SearchToolbarPageSizeConfig {
  value: number;
  onChange: (pageSize: number) => void;
  options?: readonly number[];
  id?: string;
  label?: string;
}

export interface SearchToolbarSearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  clearable?: boolean;
}

export interface SearchToolbarProps {
  pageSize?: SearchToolbarPageSizeConfig;
  search?: SearchToolbarSearchConfig;
  filters?: SearchToolbarSelectFilter[];
  className?: string;
}

export const SearchToolbar = ({
  pageSize,
  search,
  filters = [],
  className = "",
}: SearchToolbarProps) => {
  if (!pageSize && !search && filters.length === 0) {
    return null;
  }

  const pageSizeId = pageSize?.id ?? "search-toolbar-page-size";
  const searchId = search?.id ?? "search-toolbar-search";

  return (
    <div
      className={`card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end ${className}`}
    >
      {pageSize && (
        <FormField label={pageSize.label ?? "Per page"} htmlFor={pageSizeId}>
          <Select
            id={pageSizeId}
            value={String(pageSize.value)}
            onChange={(event) => pageSize.onChange(Number(event.target.value))}
            className="min-w-[5rem]"
            icon={<HiQueueList className="h-4 w-4 text-brand-600" />}
            aria-label={pageSize.label ?? "Per page"}
          >
            {(pageSize.options ?? PAGE_SIZE_OPTIONS).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </FormField>
      )}

      {search && (
        <FormField
          label={search.label ?? "Search"}
          htmlFor={searchId}
          className="flex-1"
        >
          <Input
            id={searchId}
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
            placeholder={search.placeholder ?? "Search…"}
            icon={<HiMagnifyingGlass className="h-4 w-4 text-brand-600" />}
            clearable={search.clearable ?? true}
          />
        </FormField>
      )}

      {filters.map((filter) => (
        <FormField
          key={filter.id}
          label={filter.label}
          htmlFor={filter.id}
          className={filter.className}
        >
          <Select
            id={filter.id}
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
            className={filter.selectClassName ?? "min-w-[10rem]"}
            icon={filter.icon}
          >
            {filter.allOptionLabel && (
              <option value="">{filter.allOptionLabel}</option>
            )}
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      ))}
    </div>
  );
};
