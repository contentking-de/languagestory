'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Paths that are always accessible, even when trial has expired
const ALWAYS_ACCESSIBLE_PATHS = [
  '/dashboard',           // Team settings / subscription management
  '/dashboard/general',   // Account settings
  '/dashboard/security',  // Password change
  '/dashboard/activity',  // Activity log
  '/dashboard/welcome',   // Welcome page
  '/dashboard/billing',   // Billing / invoices
];

interface TrialGuardProps {
  accessStatus: string;
  userRole?: string;
  children: React.ReactNode;
}

export function TrialGuard({ accessStatus, userRole, children }: TrialGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Super admins are never restricted by trial/subscription status
    if (userRole === 'super_admin') return;

    if (accessStatus === 'expired') {
      const isAlwaysAccessible = ALWAYS_ACCESSIBLE_PATHS.some(
        path => pathname === path
      );
      if (!isAlwaysAccessible) {
        router.replace('/subscribe');
      }
    }
  }, [accessStatus, userRole, pathname, router]);

  return <>{children}</>;
}
