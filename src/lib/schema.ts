/**
 * schema.org JSON-LD builders.
 *
 * Centralized so every page emits consistent, valid structured data.
 * All URLs are absolute (required by Google). Consumed via <JsonLd schema={...} />.
 */
import { SITE, SITE_URL, absoluteUrl } from './seo';

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Publisher/Organization entity — referenced by @id from articles. */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: SITE.logo,
      width: 512,
      height: 512,
    },
    sameAs: SITE.sameAs,
  };
}

/** WebSite entity with a Sitelinks Search Box action. */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE.name,
    url: SITE_URL,
    description: SITE.description,
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  url: string;
  image: string;
  datePublished: string | Date;
  dateModified: string | Date;
  authorName: string;
  section: string;
  keywords?: string[];
  wordCount?: number;
  /** Use NewsArticle for news categories, Review for the reviews category. */
  type?: 'NewsArticle' | 'Article' | 'Review';
}

export function articleSchema(input: ArticleSchemaInput) {
  const {
    headline,
    description,
    url,
    image,
    datePublished,
    dateModified,
    authorName,
    section,
    keywords = [],
    wordCount,
    type = 'NewsArticle',
  } = input;

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': type,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: headline.slice(0, 110),
    description,
    image: [absoluteUrl(image)],
    datePublished: new Date(datePublished).toISOString(),
    dateModified: new Date(dateModified).toISOString(),
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: { '@id': ORG_ID },
    articleSection: section,
    isAccessibleForFree: true,
    url,
  };

  if (keywords.length > 0) schema.keywords = keywords.join(', ');
  if (wordCount) schema.wordCount = wordCount;

  return schema;
}

export interface CollectionItem {
  title: string;
  url: string;
}

/** CollectionPage + embedded ItemList for category/listing pages. */
export function collectionPageSchema(opts: {
  name: string;
  description: string;
  url: string;
  items: CollectionItem[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(item.url),
        name: item.title,
      })),
    },
  };
}
