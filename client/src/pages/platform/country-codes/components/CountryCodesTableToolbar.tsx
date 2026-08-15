import { SearchToolbar } from "../../../../components/ui/forms/SearchToolbar";
import type { CountryCodesListVariant } from "../utils";

interface CountryCodesTableToolbarProps {
  variant: CountryCodesListVariant;
  search: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions: readonly number[];
  show: boolean;
}

export const CountryCodesTableToolbar = ({
  variant,
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  show,
}: CountryCodesTableToolbarProps) => {
  if (!show) {
    return null;
  }

  return (
    <SearchToolbar
      pageSize={{
        id: `${variant}-country-code-page-size`,
        value: pageSize,
        onChange: onPageSizeChange,
        options: pageSizeOptions,
      }}
      search={{
        id: `${variant}-country-code-search`,
        value: search,
        onChange: onSearchChange,
        placeholder: "Country, ISO code, dial code…",
      }}
    />
  );
};
