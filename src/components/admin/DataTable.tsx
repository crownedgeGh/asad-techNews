'use client'

import React from 'react'

export type Column<Row> = {
  /** Key into Row, used for the default cell value and as the React key. */
  key: Extract<keyof Row, string> | (string & {})
  header: React.ReactNode
  align?: 'left' | 'right' | 'center'
  width?: string
  /** Custom cell renderer. Without it, the value at `key` is rendered as-is. */
  render?: (row: Row, index: number) => React.ReactNode
}

type Props<Row> = {
  columns: Column<Row>[]
  rows: Row[]
  getRowKey: (row: Row, index: number) => React.Key
  empty?: React.ReactNode
  loading?: boolean
  loadingRows?: number
}

const alignClass = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const

/**
 * Generic table for admin list pages. Deliberately carries no domain knowledge —
 * no article fields, labels, or behaviour — so any collection can use it.
 */
export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  empty,
  loading = false,
  loadingRows = 5,
}: Props<Row>) {
  const showEmpty = !loading && rows.length === 0

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <table className="w-full min-w-[48rem] border-collapse text-sm">
        <thead className="sticky top-14 z-10 bg-neutral-50 dark:bg-neutral-800/70">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={col.width ? { width: col.width } : undefined}
                className={[
                  'border-b border-neutral-200 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:text-neutral-400',
                  alignClass[col.align ?? 'left'],
                ].join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading
            ? Array.from({ length: loadingRows }).map((_, r) => (
                <tr key={`skeleton-${r}`}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="border-b border-neutral-100 px-3 py-3 dark:border-neutral-800"
                    >
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        'border-b border-neutral-100 px-3 py-3 align-middle dark:border-neutral-800',
                        alignClass[col.align ?? 'left'],
                      ].join(' ')}
                    >
                      {col.render
                        ? col.render(row, index)
                        : ((row as Record<string, React.ReactNode>)[col.key] ?? null)}
                    </td>
                  ))}
                </tr>
              ))}

          {showEmpty ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-12 text-center">
                {empty ?? (
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    Nothing to show.
                  </span>
                )}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}
