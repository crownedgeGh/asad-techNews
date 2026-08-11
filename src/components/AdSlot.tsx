import { useEffect, useState } from 'react';
import { ADSENSE_CLIENT_ID } from '../lib/monetization';

interface AdSlotProps {
  /** AdSense ad unit slot id (from the AdSense dashboard). */
  slot: string;
  format?: string;
  className?: string;
}

/**
 * Renders an AdSense unit, but only once the visitor has accepted cookies
 * (see CookieConsent.tsx) — matches the gating the script loader applies.
 */
export default function AdSlot({ slot, format = 'auto', className = '' }: AdSlotProps) {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const check = () => setConsented(localStorage.getItem('cookie-consent') === 'accepted');
    check();
    window.addEventListener('cookie-consent-changed', check);
    return () => window.removeEventListener('cookie-consent-changed', check);
  }, []);

  useEffect(() => {
    if (!consented || !ADSENSE_CLIENT_ID) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script at runtime
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense push failed:', e);
    }
  }, [consented]);

  if (!ADSENSE_CLIENT_ID || !consented) return null;

  return (
    <div className={`my-6 flex flex-col items-center gap-1 ${className}`}>
      <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Advertisement</span>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
