import { SearchToolbar } from "../../../../components/ui/forms/SearchToolbar";
import type { CompaniesListVariant } from "../utils";

interface CompaniesTableToolbarProps {
  variant: CompaniesListVariant;
  search: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions: readonly number[];
  show: boolean;
}

export const CompaniesTableToolbar = ({
  variant,
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  show,
}: CompaniesTableToolbarProps) => {
  if (!show) {
    return null;
  }

  return (
    <SearchToolbar
      pageSize={{
        id: `${variant}-company-page-size`,
        value: pageSize,
        onChange: onPageSizeChange,
        options: pageSizeOptions,
      }}
      search={{
        id: `${variant}-company-search`,
        value: search,
        onChange: onSearchChange,
        placeholder: "Company, admin name, email…",
      }}
    />
  );
};
