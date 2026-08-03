import React, { useState } from 'react';
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Trending', path: '/trending' },
  { name: 'Tech News', path: '/tech-news' },
  { name: 'AI Tools', path: '/ai-tools' },
  { name: 'Reviews', path: '/reviews' },
  { name: 'General News', path: '/general' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    // Check initial state
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-colors duration-500 bg-[#EEF6F3] dark:bg-background-dark border-b border-transparent dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="The Lumen Tech Logo" className="h-10 w-auto" />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="text-[15px] font-medium text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
          
          {/* Right Side Buttons */}
          <div className="hidden lg:flex items-center gap-6">
            <button onClick={toggleDarkMode} className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors">
              <span className="sr-only">Toggle Dark Mode</span>
              <FiSun className="h-5 w-5 hidden dark:block" />
              <FiMoon className="h-5 w-5 dark:hidden block" />
            </button>
            <a href="#" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-secondary rounded-md transition-colors shadow-sm hover:shadow-md">
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <button onClick={toggleDarkMode} className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary">
              <span className="sr-only">Toggle Dark Mode</span>
              <FiSun className="h-6 w-6 hidden dark:block" />
              <FiMoon className="h-6 w-6 dark:hidden block" />
            </button>
            <button
              type="button"
              className="p-2 -mr-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open menu</span>
              {isOpen ? <FiX className="h-7 w-7" aria-hidden="true" /> : <FiMenu className="h-7 w-7" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50 dark:text-slate-300 dark:hover:text-primary dark:hover:bg-slate-800"
              >
                {link.name}
              </a>
            ))}
            <div className="px-3 mt-4">
              <a href="#" className="block w-full text-center px-6 py-3 text-base font-medium text-white bg-primary hover:bg-secondary rounded-md transition-colors">
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
