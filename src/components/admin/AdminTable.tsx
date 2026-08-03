import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

export function AdminTable<T extends { id?: number }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found.',
}: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow-sm">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="bg-base-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-xs font-semibold text-base-content/70 uppercase tracking-wider py-3 ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-base-content/40">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={(row as any).id ?? index} className="hover">
                {columns.map((col) => (
                  <td key={col.key} className={`py-3 ${col.className ?? ''}`}>
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
