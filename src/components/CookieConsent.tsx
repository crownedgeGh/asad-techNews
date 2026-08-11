import { useEffect, useState } from 'react';
import { MONETIZATION_ENABLED } from '../lib/monetization';

const STORAGE_KEY = 'cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!MONETIZATION_ENABLED) return;
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const decide = (value: 'accepted' | 'declined') => {
    localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new Event('cookie-consent-changed'));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto max-w-3xl flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-lg px-4 py-3 sm:px-5 sm:py-4">
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex-1">
          We use cookies for analytics and to show relevant ads. Choose whether to allow them —{' '}
          <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
        </p>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => decide('declined')}
            className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={() => decide('accepted')}
            className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
