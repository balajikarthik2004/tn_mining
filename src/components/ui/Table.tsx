import type { ReactNode } from "react";

export interface TableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

/** Minimal shared table — future features (Licensing, Court Cases) extend this. */
export function Table<T>({ columns, rows, rowKey, emptyMessage = "No data available." }: TableProps<T>) {
  if (rows.length === 0) {
    return <p className="p-6 text-center text-sm text-neutral-ink/60">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-border bg-brand-50 text-left">
            {columns.map((col) => (
              <th key={col.header} className="px-3 py-2 font-semibold text-brand-900">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-neutral-border last:border-0 hover:bg-gold-50">
              {columns.map((col) => (
                <td key={col.header} className={`px-3 py-2 ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
