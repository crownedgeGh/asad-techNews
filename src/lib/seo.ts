/**
 * Central SEO configuration and helpers.
 *
 * Single source of truth for the site identity used across meta tags,
 * OpenGraph/Twitter cards, JSON-LD structured data, sitemaps and the RSS feed.
 * Change the brand/URL here once and it propagates everywhere.
 */

/** Canonical production origin (no trailing slash). Override with SITE_URL. */
export const SITE_URL = (import.meta.env.SITE_URL || 'https://thelumentech.com').replace(/\/$/, '');

export const SITE = {
  name: 'The Lumen Tech',
  /** Short name for the web app manifest. */
  shortName: 'Lumen Tech',
  url: SITE_URL,
  /** Default title used on the homepage and as the OG site_name. */
  title: 'The Lumen Tech — Technology News, Reviews & Analysis',
  description:
    'The Lumen Tech delivers fast, trustworthy technology news, in-depth reviews, and analysis on AI, gadgets, new products, and the companies shaping the future.',
  /** Absolute default social share image. Replace with a branded 1200x630 OG image when available. */
  defaultImage: `${SITE_URL}/logo.png`,
  logo: `${SITE_URL}/logo.png`,
  locale: 'en_US',
  lang: 'en',
  /** Publisher / organization details for schema.org. */
  publisher: 'The Lumen Tech',
  twitter: '@thelumentech',
  /** Social profiles for Organization sameAs. Update with real handles. */
  sameAs: [
    'https://twitter.com/thelumentech',
    'https://www.facebook.com/thelumentech',
    'https://www.linkedin.com/company/thelumentech',
  ],
} as const;

/** Public nav sections (kept intentionally minimal — do not expand). */
export const NAV_SECTIONS = [
  { label: 'Home', href: '/' },
  { label: 'Trending', href: '/trending' },
  { label: 'Tech News', href: '/tech-news' },
  { label: 'New Products', href: '/new-products' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'General News', href: '/general' },
] as const;

/**
 * Maps a stored article category to its public listing page path.
 * Used for breadcrumbs, internal links and CollectionPage schema.
 */
export const CATEGORY_PATHS: Record<string, string> = {
  'Tech News': '/tech-news',
  'New Products': '/new-products',
  Reviews: '/reviews',
  'General News': '/general',
};

export function categoryPath(category: string): string {
  return CATEGORY_PATHS[category] ?? '/';
}

/** SEO copy for each listing page, keyed by route path. */
export const LISTING_SEO: Record<string, { title: string; heading: string; description: string }> = {
  '/trending': {
    title: 'Trending',
    heading: 'Trending Tech Stories',
    description:
      'The most-read technology stories right now on The Lumen Tech — trending news, viral gadgets, and the biggest moves in AI and consumer tech.',
  },
  '/tech-news': {
    title: 'Tech News',
    heading: 'Tech News',
    description:
      'Breaking technology news and analysis — the latest on Apple, Google, Microsoft, OpenAI, AI, and the companies shaping the future of tech.',
  },
  '/new-products': {
    title: 'New Products',
    heading: 'New Products',
    description:
      'Fresh gadget and product launches — phones, laptops, wearables, and AI hardware. Specs, release dates, and first impressions from The Lumen Tech.',
  },
  '/reviews': {
    title: 'Reviews',
    heading: 'Reviews',
    description:
      'Hands-on, independent technology reviews — smartphones, laptops, and gadgets rated by The Lumen Tech to help you buy with confidence.',
  },
  '/general': {
    title: 'General News',
    heading: 'General News',
    description:
      'General technology and world news that matters — culture, business, and the broader impact of technology, curated by The Lumen Tech.',
  },
};

/** Build an absolute URL from a path or (possibly already absolute) URL. */
export function absoluteUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return SITE.defaultImage;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Canonical URL for the current page, normalized (no query/hash, no trailing slash except root). */
export function canonicalFromUrl(url: URL): string {
  let path = url.pathname.replace(/\/+$/, '');
  if (path === '') path = '/';
  return `${SITE_URL}${path === '/' ? '' : path}`;
}

/** Public URL for an article slug. */
export function articleUrl(slug: string): string {
  return `${SITE_URL}/article/${slug}`;
}

/**
 * Compose a page <title>. Homepage uses the raw brand title; every other page
 * follows the "Page Title | The Lumen Tech" template.
 */
export function pageTitle(title?: string): string {
  if (!title || title.trim() === '' || title === SITE.name) return SITE.title;
  return `${title} | ${SITE.name}`;
}

/** Clamp a description to a search-friendly length without cutting mid-word. */
export function clampDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

/**
 * Lightweight topic extraction for internal linking / keywords / schema `about`.
 * The schema has no tags column, so we derive topics from known tech entities
 * present in the title + category. Purely additive — never shown as UI clutter.
 */
const TOPIC_ENTITIES: string[] = [
  'Apple', 'iPhone', 'iPad', 'Mac', 'MacBook', 'Samsung', 'Galaxy', 'Google',
  'Pixel', 'Android', 'Microsoft', 'Windows', 'OpenAI', 'ChatGPT', 'GPT',
  'Meta', 'Tesla', 'Nvidia', 'Intel', 'AMD', 'Amazon', 'Sony', 'AI',
  'Artificial Intelligence', 'Machine Learning', 'Chrome', 'iOS', 'Linux',
];

export function extractTopics(title: string, category?: string): string[] {
  const found = new Set<string>();
  if (category) found.add(category);
  const haystack = title.toLowerCase();
  for (const entity of TOPIC_ENTITIES) {
    if (haystack.includes(entity.toLowerCase())) found.add(entity);
  }
  return [...found];
}
