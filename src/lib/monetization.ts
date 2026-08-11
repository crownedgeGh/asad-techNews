/**
 * Central config for third-party monetization/analytics integrations.
 * Both are opt-in: unset the env var and the integration stays fully dark
 * (no script tags emitted, no consent banner shown).
 */

export const GA_MEASUREMENT_ID = (import.meta.env.PUBLIC_GA_MEASUREMENT_ID as string | undefined)?.trim() || null;

export const ADSENSE_CLIENT_ID = (import.meta.env.PUBLIC_ADSENSE_CLIENT_ID as string | undefined)?.trim() || null;

/** Derives the bare `pub-xxxx` publisher id AdSense expects in ads.txt from the ca-pub client id. */
export function adsensePublisherId(): string | null {
  if (!ADSENSE_CLIENT_ID) return null;
  return ADSENSE_CLIENT_ID.replace(/^ca-/, '');
}

export const MONETIZATION_ENABLED = Boolean(GA_MEASUREMENT_ID || ADSENSE_CLIENT_ID);

/**
 * AdSense ad unit slot ids. These are not secret — replace the placeholders
 * with real slot ids created in the AdSense dashboard once the site is approved.
 */
export const AD_SLOTS = {
  articleInline: '0000000001',
  articleSidebar: '0000000002',
} as const;
