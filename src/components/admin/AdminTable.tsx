import React from 'react';
import { Loader2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { Card } from './ui/card';

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
  renderMobileCard?: (row: T, index: number) => React.ReactNode;
  onRowClick?: (row: T, index: number) => void;
}

export function AdminTable<T extends { id?: number }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found.',
  renderMobileCard,
  onRowClick,
}: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop View: Standard Table (Visible on lg and up) */}
      <Card className="hidden lg:block overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-base-content/60">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={(row as any).id ?? index}
                  className={onRowClick ? 'cursor-pointer' : undefined}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render(row, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile/Tablet View: Card List (Visible below lg) */}
      <div className="block lg:hidden space-y-0 sm:space-y-4">
        {data.length === 0 ? (
          <Card className="text-center py-12 text-base-content/60">{emptyMessage}</Card>
        ) : (
          data.map((row, index) =>
            renderMobileCard ? (
              <React.Fragment key={(row as any).id ?? index}>{renderMobileCard(row, index)}</React.Fragment>
            ) : (
              <Card
                key={(row as any).id ?? index}
                className={`p-4 flex flex-col gap-3 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={onRowClick ? () => onRowClick(row, index) : undefined}
              >
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className="flex justify-between items-center border-b border-base-300 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-semibold text-base-content/60 uppercase mr-4 shrink-0">
                      {col.header}
                    </span>
                    <div className={`text-right flex items-center justify-end overflow-hidden ${col.className ?? ''}`}>
                      {col.render(row, index)}
                    </div>
                  </div>
                ))}
              </Card>
            )
          )
        )}
      </div>
    </div>
  );
}
