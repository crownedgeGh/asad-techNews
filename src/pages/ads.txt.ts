import type { APIRoute } from 'astro';
import { adsensePublisherId } from '../lib/monetization';

export const prerender = false;

/**
 * AdSense verifies ad-serving rights via a well-known ads.txt file.
 * Empty (but 200 OK) until PUBLIC_ADSENSE_CLIENT_ID is configured.
 */
export const GET: APIRoute = () => {
  const publisherId = adsensePublisherId();
  const body = publisherId ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n` : '';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
