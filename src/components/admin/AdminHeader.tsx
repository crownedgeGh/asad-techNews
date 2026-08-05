import React from 'react';
import { ExternalLink } from 'lucide-react';
import { AdminProvider } from '../../context/AdminContext';
import MobileNav from './MobileNav';
import ThemeToggle from './ThemeToggle';

export default function AdminHeader({ pathname }: { pathname: string }) {
  return (
    <AdminProvider>
      <header className="flex items-center gap-3 border-b border-base-300 bg-base-100 px-4 py-3 sticky top-0 z-20">
        <MobileNav pathname={pathname} />
        <span className="text-lg font-bold tracking-tight lg:hidden">Lumen Admin</span>
        <div className="flex-1" />
        <ThemeToggle />
        <a
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden sm:inline">View Site</span>
        </a>
      </header>
    </AdminProvider>
  );
}
