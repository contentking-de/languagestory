'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, User as UserIcon } from 'lucide-react';
import { Suspense } from 'react';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const { data: user, isLoading } = useSWR<User>('/api/user', fetcher);

  // Loading state
  if (isLoading) {
    return <div className="h-9 w-20 bg-gray-100 rounded animate-pulse" />;
  }

  // Not logged in - show login/signup buttons
  if (!user) {
    return (
      <div className="flex items-center space-x-3">
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

  // Logged in - show avatar with link to dashboard
  return (
    <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <span className="text-sm text-gray-700 hidden sm:block">
        {user.name || user.email.split('@')[0]}
      </span>
      <Avatar className="cursor-pointer size-9">
        <AvatarImage alt={user.name || ''} />
        <AvatarFallback className="bg-orange-500 text-white">
          <UserIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}

function Header() {
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
          <a href="#why-choose-us" className="text-lg font-medium text-gray-700 hover:text-gray-900">
            Why Choose Us
          </a>
          <a href="#features" className="text-lg font-medium text-gray-700 hover:text-gray-900">
            Features
          </a>
          <a href="#short-stories" className="text-lg font-medium text-gray-700 hover:text-gray-900">
            Short Stories
          </a>
          <a href="#quizzes" className="text-lg font-medium text-gray-700 hover:text-gray-900">
            Quizzes
          </a>
          <a href="#vocabulary-games" className="text-lg font-medium text-gray-700 hover:text-gray-900">
            Vocabulary Games
          </a>
          <a href="#pricing" className="text-lg font-medium text-gray-700 hover:text-gray-900">
            Plans & Pricing
          </a>
        </nav>
        
        {/* Auth Area */}
        <Suspense fallback={<div className="h-9 w-20 bg-gray-100 rounded animate-pulse" />}>
          <UserMenu />
        </Suspense>
      </div>
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
