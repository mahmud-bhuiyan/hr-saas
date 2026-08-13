import type { IconType } from "react-icons";
import { NavCard } from "./NavCard";

export interface NavCardGroupItem {
  to: string;
  label: string;
  description: string;
  icon: IconType;
}

export type NavCardGroupColumns = 1 | 2 | 3 | 4;

const columnClassMap: Record<NavCardGroupColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

interface NavCardGroupProps {
  items: NavCardGroupItem[];
  /** Cards per row at larger breakpoints. Defaults to 2. */
  columns?: NavCardGroupColumns;
  className?: string;
}

export const NavCardGroup = ({
  items,
  columns = 2,
  className = "",
}: NavCardGroupProps) => {
  return (
    <div
      className={`grid gap-4 ${columnClassMap[columns]} ${className}`.trim()}
    >
      {items.map((item) => (
        <NavCard key={item.to} {...item} />
      ))}
    </div>
  );
};
