import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function LogoutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      window.location.href = '/admin/login';
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-base-content hover:bg-base-200 disabled:opacity-60 w-full',
        className
      )}
    >
      <LogOut className="h-5 w-5 shrink-0" />
      {loading ? 'Signing out...' : 'Logout'}
    </button>
  );
}
