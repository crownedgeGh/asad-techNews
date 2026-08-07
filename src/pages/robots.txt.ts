import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/seo';

export const prerender = false;

/**
 * robots.txt — allow crawling of public content, block admin/api/search-query
 * noise, and advertise the sitemap index.
 */
export const GET: APIRoute = () => {
  const body = `# The Lumen Tech
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /*?*q=

# Allow Google/Bing image + news bots full access to content
User-agent: Googlebot-Image
Allow: /

User-agent: Googlebot-News
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/news-sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
