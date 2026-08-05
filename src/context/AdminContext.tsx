import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface AdminContextValue {
  theme: Theme;
  toggleTheme: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : 'emerald');
      localStorage.setItem('admin-theme', next);
      return next;
    });
  };

  return (
    <AdminContext.Provider value={{ theme, toggleTheme, mobileNavOpen, setMobileNavOpen }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdminContext must be used within an AdminProvider');
  return ctx;
}
