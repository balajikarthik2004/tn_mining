import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

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
  /** Keeps the header visible inside a scrolling container. */
  stickyHeader?: boolean;
}

/** Shared table — used by Licensing, Court Cases, Scan Logs and Trip Sheets. */
export function Table<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No data available.",
  stickyHeader = true,
}: TableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-500">
          <Inbox className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-neutral-ink/55">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr
            className={`bg-neutral-subtle/90 text-left backdrop-blur-sm ${stickyHeader ? "sticky top-0 z-10" : ""
              }`}
          >
            {columns.map((col) => (
              <th
                key={col.header}
                scope="col"
                className="border-b border-neutral-border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-ink/50"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-neutral-line transition-colors last:border-0 hover:bg-brand-50/50"
            >
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={`px-4 py-3 align-middle text-neutral-ink/80 ${col.className ?? ""}`}
                >
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
