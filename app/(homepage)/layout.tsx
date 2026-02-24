'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, User as UserIcon, Menu, X } from 'lucide-react';
import { Suspense, useState, useEffect } from 'react';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const navLinks = [
  { href: '#why-choose-us', label: 'Why Choose Us' },
  { href: '#features', label: 'Features' },
  { href: '#short-stories', label: 'Short Stories' },
  { href: '#quizzes', label: 'Quizzes' },
  { href: '#vocabulary-games', label: 'Vocabulary Games' },
  { href: '#pricing', label: 'Plans & Pricing' },
];

function UserMenu({ mobile }: { mobile?: boolean }) {
  const { data: user, isLoading } = useSWR<User>('/api/user', fetcher);

  if (isLoading) {
    return <div className="h-9 w-20 bg-gray-100 rounded animate-pulse" />;
  }

  if (!user) {
    return (
      <div className={mobile ? 'flex flex-col gap-3 pt-4 border-t border-gray-200' : 'flex items-center space-x-3'}>
        <Button asChild className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/sign-in">
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Link>
        </Button>
        <Button asChild className="rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white">
          <Link href="/sign-up">
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Link href="/dashboard" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${mobile ? 'pt-4 border-t border-gray-200' : ''}`}>
      <Avatar className="cursor-pointer size-9">
        <AvatarImage alt={user.name || ''} />
        <AvatarFallback className="bg-orange-500 text-white">
          <UserIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <span className={mobile ? 'text-sm text-gray-700' : 'text-sm text-gray-700 hidden sm:block'}>
        {user.name || user.email.split('@')[0]}
      </span>
    </Link>
  );
}

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img 
            src="/logo.png" 
            alt="Lingoletics.com Logo" 
            className="h-7 object-contain"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center space-x-6">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-lg font-medium text-gray-700 hover:text-gray-900">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Desktop Auth */}
          <div className="hidden xl:block">
            <Suspense fallback={<div className="h-9 w-20 bg-gray-100 rounded animate-pulse" />}>
              <UserMenu />
            </Suspense>
          </div>

          {/* Mobile Burger Button */}
          <button
            className="xl:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[65px] bg-black/20 z-40 xl:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="xl:hidden absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-lg z-50 px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3 py-2.5 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Suspense fallback={<div className="h-9 w-20 bg-gray-100 rounded animate-pulse" />}>
              <UserMenu mobile />
            </Suspense>
          </nav>
        </>
      )}
    </header>
  );
}

export default function HomepageLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </section>
  );
}
