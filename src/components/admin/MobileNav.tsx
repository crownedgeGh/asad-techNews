import React, { useState } from 'react';
import { LayoutDashboard, Newspaper, Menu, Zap } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/articles', label: 'Articles', icon: Newspaper, exact: false },
];

export default function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu" className="lg:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetTitle className="sr-only">Admin navigation</SheetTitle>
        <div className="px-4 py-5 border-b border-base-300 mb-2 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-lg font-extrabold tracking-tight">Lumen Admin</span>
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(href, exact)
                  ? 'bg-primary text-primary-content'
                  : 'text-base-content hover:bg-base-200'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
