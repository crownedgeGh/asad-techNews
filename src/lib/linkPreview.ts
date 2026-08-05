import { db } from '../db';
import { linkPreviews } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface LinkPreview {
  url: string;
  type: 'video' | 'link' | 'failed';
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  embedUrl: string | null;
}

const FETCH_TIMEOUT_MS = 5000;
const FAILED_RETRY_MS = 24 * 60 * 60 * 1000; // retry failed fetches after 1 day

function extractYouTubeId(url: URL): string | null {
  if (url.hostname === 'youtu.be') {
    return url.pathname.slice(1).split('/')[0] || null;
  }
  if (url.hostname.endsWith('youtube.com')) {
    if (url.pathname === '/watch') return url.searchParams.get('v');
    const shortsMatch = url.pathname.match(/^\/(shorts|embed|live)\/([^/]+)/);
    if (shortsMatch) return shortsMatch[2];
  }
  return null;
}

function extractVimeoId(url: URL): string | null {
  if (!url.hostname.endsWith('vimeo.com')) return null;
  const match = url.pathname.match(/^\/(\d+)/);
  return match ? match[1] : null;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TheLumenTechBot/1.0; +https://thelumentech.com)' },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.text();
}

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${property}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return decodeHtmlEntities(m[1]);
  }
  return null;
}

function decodeHtmlEntities(str: string) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function resolvePreview(rawUrl: string): Promise<Omit<LinkPreview, 'url'>> {
  const url = new URL(rawUrl);

  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    let title: string | null = null;
    try {
      const oembed = await fetchText(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(rawUrl)}&format=json`
      );
      title = JSON.parse(oembed).title ?? null;
    } catch {
      // title is optional; embed still works without it
    }
    return {
      type: 'video',
      title,
      description: null,
      image: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
      siteName: 'YouTube',
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
    };
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    let title: string | null = null;
    let image: string | null = null;
    try {
      const oembed = await fetchText(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(rawUrl)}`);
      const data = JSON.parse(oembed);
      title = data.title ?? null;
      image = data.thumbnail_url ?? null;
    } catch {
      // fall through with no title/image; embed still works
    }
    return {
      type: 'video',
      title,
      description: null,
      image,
      siteName: 'Vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
    };
  }

  const html = await fetchText(rawUrl);
  const title = extractMeta(html, 'og:title') ?? html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? null;
  const description = extractMeta(html, 'og:description') ?? extractMeta(html, 'description');
  let image = extractMeta(html, 'og:image');
  if (image && !image.startsWith('http')) {
    image = new URL(image, url.origin).href;
  }
  const siteName = extractMeta(html, 'og:site_name') ?? url.hostname.replace(/^www\./, '');

  return {
    type: 'link',
    title: title ? decodeHtmlEntities(title.trim()) : null,
    description: description ? decodeHtmlEntities(description.trim()) : null,
    image,
    siteName,
    embedUrl: null,
  };
}

export async function getLinkPreview(rawUrl: string): Promise<LinkPreview> {
  const existing = (await db.select().from(linkPreviews).where(eq(linkPreviews.url, rawUrl)))[0];

  const isStaleFailed =
    existing?.type === 'failed' && Date.now() - new Date(existing.fetchedAt).getTime() > FAILED_RETRY_MS;

  if (existing && !isStaleFailed) {
    return { ...existing, url: rawUrl };
  }

  try {
    const resolved = await resolvePreview(rawUrl);
    const row = { url: rawUrl, ...resolved };
    await db
      .insert(linkPreviews)
      .values({ ...row, fetchedAt: new Date() })
      .onConflictDoUpdate({
        target: linkPreviews.url,
        set: { ...resolved, fetchedAt: new Date() },
      });
    return row;
  } catch (e) {
    console.error('Failed to resolve link preview for', rawUrl, e);
    const failed: LinkPreview = {
      url: rawUrl,
      type: 'failed',
      title: null,
      description: null,
      image: null,
      siteName: new URL(rawUrl).hostname.replace(/^www\./, ''),
      embedUrl: null,
    };
    await db
      .insert(linkPreviews)
      .values({ ...failed, fetchedAt: new Date() })
      .onConflictDoUpdate({
        target: linkPreviews.url,
        set: { ...failed, fetchedAt: new Date() },
      });
    return failed;
  }
}
