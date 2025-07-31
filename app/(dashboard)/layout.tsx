'use client';

import Link from 'next/link';
import { use, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { CircleIcon, Home, LogOut, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <a
            href="#why-choose-us"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Why Choose Us
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Features
          </a>
          <a
            href="#short-stories"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Short Stories
          </a>
          <a
            href="#vocabulary-games"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Vocabulary Games
          </a>
          <a
            href="#quizzes"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Quizzes
          </a>
          <a
            href="#learning-resources"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Learning Resources
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Plans & Pricing
          </a>
          <Button asChild className="rounded-lg bg-orange-500 hover:bg-orange-600">
            <Link href="/sign-in">Login</Link>
          </Button>
          <Button asChild className="rounded-lg bg-slate-600 hover:bg-slate-700">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Burger Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden z-50">
            <div className="px-4 py-6 space-y-4">
              <a
                href="#why-choose-us"
                className="block text-sm font-medium text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Why Choose Us
              </a>
              <a
                href="#features"
                className="block text-sm font-medium text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#short-stories"
                className="block text-sm font-medium text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Short Stories
              </a>
              <a
                href="#vocabulary-games"
                className="block text-sm font-medium text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Vocabulary Games
              </a>
              <a
                href="#quizzes"
                className="block text-sm font-medium text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Quizzes
              </a>
              <a
                href="#learning-resources"
                className="block text-sm font-medium text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Learning Resources
              </a>
              <a
                href="#pricing"
                className="block text-sm font-medium text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Plans & Pricing
              </a>
              <div className="pt-4 space-y-3">
                <Button asChild className="w-full rounded-lg bg-orange-500 hover:bg-orange-600">
                  <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>Login</Link>
                </Button>
                <Button asChild className="w-full rounded-lg bg-slate-600 hover:bg-slate-700">
                  <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  return (
    <header className="border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img 
            src="/favicon.webp" 
            alt="A Language Story Logo" 
            className="h-10 w-10 object-contain"
          />
          <div className="ml-2">
            <div className="text-xl font-bold text-gray-900">A Language Story</div>
            <div className="text-xs font-bold text-orange-500">boost your language skills</div>
          </div>
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      {children}
    </section>
  );
}
