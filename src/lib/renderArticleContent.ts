import { getLinkPreview, type LinkPreview } from './linkPreview';

const STANDALONE_LINK_RE = /<p>\s*<a\b[^>]*\bhref="([^"]+)"[^>]*>([^<]*)<\/a>\s*<\/p>/gi;

function normalizeForCompare(s: string) {
  return s.trim().replace(/\/$/, '').replace(/^https?:\/\//, '');
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildCardHtml(preview: LinkPreview): string {
  const { url, type, title, description, image, siteName, embedUrl } = preview;

  if (type === 'video' && embedUrl) {
    const caption = title ? `<p class="text-sm text-slate-500 dark:text-slate-400 mt-2">${escapeHtml(title)}</p>` : '';
    return `
      <div class="not-prose my-8">
        <div class="rounded-xl overflow-hidden shadow-lg aspect-video bg-black">
          <iframe
            src="${embedUrl}"
            title="${escapeHtml(title ?? siteName ?? 'Embedded video')}"
            class="w-full h-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        ${caption}
      </div>`;
  }

  const hostname = siteName ?? new URL(url).hostname.replace(/^www\./, '');
  const displayTitle = title ?? url;
  const imageBlock = image
    ? `<img src="${escapeHtml(image)}" alt="" class="w-full sm:w-56 h-40 sm:h-auto object-cover shrink-0" loading="lazy" />`
    : '';

  return `
    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer nofollow"
       class="not-prose my-6 flex flex-col sm:flex-row rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-slate-800/60 no-underline">
      ${imageBlock}
      <div class="p-4 flex flex-col justify-center min-w-0 gap-1">
        <span class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">${escapeHtml(hostname)}</span>
        <span class="font-bold text-slate-900 dark:text-white line-clamp-2">${escapeHtml(displayTitle)}</span>
        ${description ? `<span class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">${escapeHtml(description)}</span>` : ''}
      </div>
    </a>`;
}

/**
 * Replaces paragraphs that consist of nothing but a bare pasted URL (TipTap's
 * auto-link sets the link text to the URL itself) with a rich preview card —
 * a real video embed for YouTube/Vimeo, an OG-style card for everything else.
 * Intentional inline links with custom text are left untouched.
 */
export async function injectLinkPreviews(html: string): Promise<string> {
  const matches = [...html.matchAll(STANDALONE_LINK_RE)];
  const standalone = matches.filter(([, href, text]) => normalizeForCompare(href) === normalizeForCompare(text));

  if (standalone.length === 0) return html;

  const previews = await Promise.all(
    standalone.map(([, href]) => getLinkPreview(href).catch(() => null))
  );

  let result = html;
  standalone.forEach(([fullMatch], i) => {
    const preview = previews[i];
    if (!preview) return;
    result = result.replace(fullMatch, buildCardHtml(preview));
  });

  return result;
}
