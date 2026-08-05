import type { LucideIcon } from 'lucide-react'

type Props = {
  label: string
  value: number | string
  icon?: LucideIcon
  subLabel?: string
}

const formatValue = (value: number | string) =>
  typeof value === 'number' ? value.toLocaleString('en-US') : value

export function StatCard({ label, value, icon: Icon, subLabel }: Props) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        {Icon ? <Icon aria-hidden className="size-4 text-neutral-400 dark:text-neutral-500" /> : null}
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight tabular-nums">
        {formatValue(value)}
      </p>
      {subLabel ? (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{subLabel}</p>
      ) : null}
    </div>
  )
}
