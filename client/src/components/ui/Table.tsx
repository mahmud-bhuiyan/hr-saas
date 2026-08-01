import type { CSSProperties, ReactNode } from 'react';
import { Spinner } from './Spinner';

export type TableAlign = 'left' | 'center' | 'right';

const alignClasses: Record<TableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export interface TableColumn<T> {
  key: string;
  header: string;
  /** Column width as a percentage of the table (e.g. `15` → `15%`). */
  width?: number;
  /** Overrides the table-level `align` for this column. */
  align?: TableAlign;
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
}

const columnAlign = <T,>(column: TableColumn<T>, tableAlign: TableAlign): TableAlign => {
  return column.align ?? tableAlign;
}

const columnWidthStyle = (width?: number): CSSProperties | undefined => {
  if (width == null) {
    return undefined;
  }

  return { width: `${width}%` };
}

const cellWrapClass = 'whitespace-normal break-words [overflow-wrap:anywhere]';

export const Table = <T,>({
  columns,
  data,
  getRowKey,
  align = 'center',
  loading = false,
  loadingMessage = 'Loading…',
  emptyMessage = 'No records found.',
  className = '',
}: TableProps<T>) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-12 text-sm text-slate-500">
        <Spinner />
        {loadingMessage}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <table className="w-full table-fixed divide-y divide-slate-200 text-sm">
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={columnWidthStyle(column.width)} />
          ))}
        </colgroup>
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => {
              const cellAlign = columnAlign(column, align);
              return (
                <th
                  key={column.key}
                  scope="col"
                  style={columnWidthStyle(column.width)}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${cellWrapClass} ${alignClasses[cellAlign]} ${column.className ?? ''}`}
                >
                  {column.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr key={getRowKey(row)} className="hover:bg-slate-50/80">
              {columns.map((column) => {
                const cellAlign = columnAlign(column, align);
                return (
                  <td
                    key={column.key}
                    style={columnWidthStyle(column.width)}
                    className={`px-4 py-3 text-slate-700 ${cellWrapClass} ${alignClasses[cellAlign]} ${column.className ?? ''}`}
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
  );
}
