export function getRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays >= 1) {
    return `${diffDays} day ago`;
  } else if (diffHours >= 1) {
    return `${diffHours} hr ago`;
  } else {
    if (diffMins <= 1) {
      return '1 mnt ago';
    }
    return `${diffMins} mnts ago`;
  }
}

export function formatDate(date: Date | string) {
  return getRelativeTime(date);
}

export function formatDateTime(date: Date | string) {
  return getRelativeTime(date);
}

export function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function excerptFromContent(html: string, length = 150) {
  const text = stripHtml(html);
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

export function estimateReadTime(html: string) {
  const words = stripHtml(html).split(' ').filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
