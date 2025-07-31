import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'A Language Story - Learn French, German & Spanish Through Stories',
  description: 'Master French, German, and Spanish through engaging short stories with audio, comprehension exercises, and cultural insights. Perfect for beginner to intermediate learners. Start your language learning journey today with our story-based approach.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'A Language Story - Learn French, German & Spanish Through Stories',
    description: 'Master French, German, and Spanish through engaging short stories with audio, comprehension exercises, and cultural insights. Perfect for beginner to intermediate learners.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Language Story - Learn French, German & Spanish Through Stories',
    description: 'Master French, German, and Spanish through engaging short stories with audio, comprehension exercises, and cultural insights.',
  },
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
