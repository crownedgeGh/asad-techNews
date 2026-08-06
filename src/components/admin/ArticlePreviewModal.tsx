import React, { useEffect, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, Sun, Moon, ImageOff, RefreshCw } from 'lucide-react';
import { formatDate, estimateReadTime } from '../../lib/format';

interface ArticlePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  category: string;
  coverImage: string;
  content: string;
  published: boolean;
}

function prefersDarkByDefault() {
  if (typeof window === 'undefined') return false;
  return (
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
}

export function ArticlePreviewModal({
  open,
  onOpenChange,
  title,
  category,
  coverImage,
  content,
  published,
}: ArticlePreviewModalProps) {
  const [dark, setDark] = useState(prefersDarkByDefault);
  const [renderedContent, setRenderedContent] = useState(content);
  const [enrichingPreviews, setEnrichingPreviews] = useState(false);

  // Standalone pasted links (e.g. a bare YouTube URL) render as rich embeds/cards on the
  // public site via injectLinkPreviews — replicate that here so the preview matches exactly.
  useEffect(() => {
    if (!open) return;
    setRenderedContent(content);
    setEnrichingPreviews(true);
    const controller = new AbortController();
    fetch('/api/admin/preview-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setRenderedContent(data.html))
      .catch(() => {})
      .finally(() => setEnrichingPreviews(false));
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const authorName = 'Staff Writer';
  const dateStr = formatDate(new Date());
  const timeToRead = estimateReadTime(content || '');
  const hasContent = !!content && content.trim() !== '' && content !== '<p></p>';

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-base-100 shadow-2xl focus:outline-none sm:inset-6 sm:rounded-2xl sm:border sm:border-base-300 lg:inset-10 xl:inset-x-20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Title className="sr-only">Article preview</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            A preview of how this article will appear on the public site.
          </DialogPrimitive.Description>

          {/* Modal chrome (admin-styled, not part of the public preview) */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-base-300 bg-base-100 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-sm font-semibold text-base-content">Public Preview</span>
              {!published && (
                <span className="hidden shrink-0 items-center rounded-md bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning sm:inline-flex">
                  Draft — not published
                </span>
              )}
              {enrichingPreviews && (
                <span className="hidden shrink-0 items-center gap-1.5 text-xs text-base-content/60 sm:inline-flex">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Loading link previews…
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setDark((d) => !d)}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-base-content/70 transition-colors hover:bg-base-200"
                title={dark ? 'Preview light mode' : 'Preview dark mode'}
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="hidden sm:inline">{dark ? 'Light' : 'Dark'}</span>
              </button>
              <DialogPrimitive.Close
                type="button"
                className="rounded-md p-1.5 text-base-content/70 transition-colors hover:bg-base-200"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>
          </div>

          {!published && (
            <div className="shrink-0 bg-warning/10 py-2 text-center text-xs font-medium text-warning sm:hidden">
              Draft — not published
            </div>
          )}

          {/* Public-site-styled preview body, scoped to its own light/dark toggle */}
          <div
            data-theme={dark ? 'dark' : undefined}
            className="flex-1 overflow-y-auto bg-white dark:bg-[#121212] text-[#3B3B3B] dark:text-[#E2E8F0]"
          >
            <div className="article-content-font mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
              <article>
                <header className="mb-8">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-[#00B2A9]">
                      {category || 'Uncategorized'}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">&bull;</span>
                    <time className="text-sm text-slate-500 dark:text-slate-400">{dateStr}</time>
                    <span className="text-sm text-slate-500 dark:text-slate-400">&bull;</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{timeToRead}</span>
                  </div>
                  <h1 className="mb-6 text-2xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl lg:text-5xl">
                    {title || 'Untitled Article'}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      {authorName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{authorName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{category || 'Uncategorized'}</p>
                    </div>
                  </div>
                </header>

                {coverImage ? (
                  <div className="mb-10 aspect-video overflow-hidden rounded-2xl bg-slate-100 shadow-lg dark:bg-slate-800">
                    <img src={coverImage} alt={title} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="mb-10 flex aspect-video items-center justify-center rounded-2xl bg-slate-100 text-slate-400 shadow-lg dark:bg-slate-800 dark:text-slate-500">
                    <ImageOff className="h-8 w-8" />
                  </div>
                )}

                <div className="prose prose-lg max-w-none prose-a:text-[#00B2A9] hover:prose-a:text-[#099e96] dark:prose-invert">
                  {hasContent ? (
                    <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
                  ) : (
                    <p className="italic text-slate-400 dark:text-slate-500">
                      Nothing written yet — start adding content to see it here.
                    </p>
                  )}
                </div>
              </article>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
