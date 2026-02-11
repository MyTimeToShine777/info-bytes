'use client';

import Link from 'next/link';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/category/movies', label: 'Movies' },
  { href: '/category/tv-series', label: 'TV Series' },
  { href: '/category/trending', label: 'Trending' },
  { href: '/category/finance', label: 'Finance' },
  { href: '/category/technology', label: 'Technology' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="container-blog flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-brand-700">
          <span className="text-2xl">⚡</span>
          <span>{process.env.NEXT_PUBLIC_SITE_NAME || 'Info Bytes'}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/admin" className="ml-2 px-2 py-1 text-xs text-gray-400 hover:text-indigo-600 rounded transition-colors" title="Admin Panel">
            ⚙️
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-gray-100" aria-label="Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
      </div>

      {/* Mobile nav panel */}
      {open && (
        <nav className="md:hidden bg-white border-b border-gray-100 px-4 pb-4 space-y-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
