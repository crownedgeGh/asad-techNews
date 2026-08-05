'use client'

import { useEffect, useRef } from 'react'

type Props = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Built on the native <dialog> element rather than a headless UI library.
 *
 * `showModal()` gives us focus trapping, `aria-modal` semantics, the top layer,
 * inert background, and Escape-to-close from the platform — which is most of
 * what a library like Radix would have provided. Focus restoration to the
 * trigger is handled by the browser on close.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      // Fires on Escape as well as close() — routes both through onCancel so
      // the parent's state cannot drift out of sync with the element.
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-xl backdrop:bg-neutral-900/50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
    >
      <div className="p-5">
        <h2 id="confirm-dialog-title" className="text-base font-semibold">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-300 px-3.5 py-2 text-sm font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              'rounded-lg px-3.5 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2',
              destructive
                ? 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600'
                : 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600',
            ].join(' ')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
