'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserProgressSummary } from '@/components/user-progress-summary';
import { 
  Users, Settings, Shield, Activity, Menu, UserCheck, ChevronDown, ChevronRight,
  BookOpen, GraduationCap, FileQuestion, Languages, Building2, BarChart3, School, Gamepad2, Brain, Heart, TrendingUp, FileImage, Ticket, FileText, MessageCircle, UserCircle, Clock, AlertTriangle, Dumbbell, Download, Send
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: any;
  label: string;
  subItems?: NavItem[];
}

interface DashboardNavigationProps {
  userRole: string;
  /** Printable worksheets / Resources nav (super_admin only) */
  teacherResourcesAccess: boolean;
  accessStatus: string;
  trialDaysRemaining: number | null;
  trialEndsAt: string | null;
  planName: string | null;
  children: React.ReactNode;
}

export function DashboardNavigation({ userRole, teacherResourcesAccess, accessStatus, trialDaysRemaining, trialEndsAt, planName, children }: DashboardNavigationProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const initial = ['/dashboard/content'];
    if (pathname.startsWith('/dashboard/content/vocabulary')) {
      initial.push('/dashboard/content/vocabulary');
    }
    if (pathname.startsWith('/dashboard/content/grammar')) {
      initial.push('/dashboard/content/grammar');
    }
    return initial;
  });

  const resourcesNavItem: NavItem = { href: '/resources', icon: Download, label: 'Resources' };

  // Full navigation for Super Admin and Content Creator
  const fullNavItems: NavItem[] = [
    { href: '/dashboard/welcome', icon: Heart, label: 'Welcome' },
    ...(teacherResourcesAccess ? [resourcesNavItem] : []),
    { 
      href: '/dashboard/content', 
      icon: BookOpen, 
      label: 'Content',
      subItems: [
        { href: '/dashboard/content/courses', icon: GraduationCap, label: 'Courses' },
        { href: '/dashboard/content/lessons', icon: BookOpen, label: 'Lessons' },
        { href: '/dashboard/content/quizzes', icon: FileQuestion, label: 'Quizzes' },
        { href: '/dashboard/content/vocabulary', icon: Languages, label: 'Vocabulary', subItems: [
          { href: '/dashboard/content/vocabulary', icon: Languages, label: 'All Vocabulary' },
          { href: '/dashboard/content/vocabulary/practice', icon: Dumbbell, label: 'Practice' },
        ]},
        { href: '/dashboard/content/grammar', icon: FileText, label: 'Grammar', subItems: [
          { href: '/dashboard/content/grammar', icon: FileText, label: 'All Grammar' },
          { href: '/dashboard/content/grammar/practice', icon: Dumbbell, label: 'Practice' },
        ]},
        { href: '/dashboard/content/conversation', icon: MessageCircle, label: 'Conversation' },
        { href: '/dashboard/games', icon: Gamepad2, label: 'Games' }
      ]
    },
    { 
      href: '/dashboard/institutions', 
      icon: Building2, 
      label: 'Institutions',
      subItems: [
        { href: '/dashboard/institutions/schools', icon: School, label: 'Schools' },
        { href: '/dashboard/institutions/analytics', icon: BarChart3, label: 'Analytics' }
      ]
    },
    { 
      href: '/dashboard', 
      icon: Users, 
      label: 'Team',
      subItems: [
        { href: '/dashboard', icon: Users, label: 'Team Management' },
        { href: '/dashboard/roles', icon: UserCheck, label: 'Roles' }
      ]
    },
  ];

  // Admin tools for Super Admin only
  const adminTools: NavItem[] = [
    { href: '/dashboard/ai-creator', icon: Brain, label: 'AI Creator' },
    { href: '/dashboard/media', icon: FileImage, label: 'Media Library' },
    { href: '/dashboard/tickets', icon: Ticket, label: 'Tickets' },
    { href: '/dashboard/outreach', icon: Send, label: 'Outreach' },
  ];

  // Stripped navigation for Teachers
  const teacherNavItems: NavItem[] = [
    { href: '/dashboard/welcome', icon: Heart, label: 'Welcome' },
    { 
      href: '/dashboard/content', 
      icon: BookOpen, 
      label: 'Content',
      subItems: [
        { href: '/dashboard/content/courses', icon: GraduationCap, label: 'Courses' },
        { href: '/dashboard/content/lessons', icon: BookOpen, label: 'Lessons' },
        { href: '/dashboard/content/quizzes', icon: FileQuestion, label: 'Quizzes' },
        { href: '/dashboard/content/vocabulary', icon: Languages, label: 'Vocabulary', subItems: [
          { href: '/dashboard/content/vocabulary', icon: Languages, label: 'All Vocabulary' },
          { href: '/dashboard/content/vocabulary/practice', icon: Dumbbell, label: 'Practice' },
        ]},
        { href: '/dashboard/content/grammar', icon: FileText, label: 'Grammar', subItems: [
          { href: '/dashboard/content/grammar', icon: FileText, label: 'All Grammar' },
          { href: '/dashboard/content/grammar/practice', icon: Dumbbell, label: 'Practice' },
        ]},
        { href: '/dashboard/content/conversation', icon: MessageCircle, label: 'Conversation' },
        { href: '/dashboard/games', icon: Gamepad2, label: 'Games' }
      ]
    },
    { 
      href: '/dashboard', 
      icon: Users, 
      label: 'Team',
      subItems: [
        { href: '/dashboard', icon: Users, label: 'Team Management' },
        { href: '/dashboard/roles', icon: UserCheck, label: 'Roles' }
      ]
    },
  ];

  // Minimal navigation for Students (without Team/Roles)
  const studentNavItems: NavItem[] = [
    { href: '/dashboard/welcome', icon: Heart, label: 'Welcome' },
    { 
      href: '/dashboard/content', 
      icon: BookOpen, 
      label: 'Content',
      subItems: [
        { href: '/dashboard/content/courses', icon: GraduationCap, label: 'Courses' },
        { href: '/dashboard/content/lessons', icon: BookOpen, label: 'Lessons' },
        { href: '/dashboard/content/quizzes', icon: FileQuestion, label: 'Quizzes' },
        { href: '/dashboard/content/vocabulary', icon: Languages, label: 'Vocabulary', subItems: [
          { href: '/dashboard/content/vocabulary', icon: Languages, label: 'All Vocabulary' },
          { href: '/dashboard/content/vocabulary/practice', icon: Dumbbell, label: 'Practice' },
        ]},
        { href: '/dashboard/content/grammar', icon: FileText, label: 'Grammar', subItems: [
          { href: '/dashboard/content/grammar', icon: FileText, label: 'All Grammar' },
          { href: '/dashboard/content/grammar/practice', icon: Dumbbell, label: 'Practice' },
        ]},
        { href: '/dashboard/content/conversation', icon: MessageCircle, label: 'Conversation' },
        { href: '/dashboard/games', icon: Gamepad2, label: 'Games' }
      ]
    },
    { href: '/dashboard/classmates', icon: UserCircle, label: 'Classmates' }
  ];

  // Navigation for Endusers / Members (private learners - no team management)
  const memberNavItems: NavItem[] = [
    { href: '/dashboard/welcome', icon: Heart, label: 'Welcome' },
    { 
      href: '/dashboard/content', 
      icon: BookOpen, 
      label: 'Content',
      subItems: [
        { href: '/dashboard/content/courses', icon: GraduationCap, label: 'Courses' },
        { href: '/dashboard/content/lessons', icon: BookOpen, label: 'Lessons' },
        { href: '/dashboard/content/quizzes', icon: FileQuestion, label: 'Quizzes' },
        { href: '/dashboard/content/vocabulary', icon: Languages, label: 'Vocabulary', subItems: [
          { href: '/dashboard/content/vocabulary', icon: Languages, label: 'All Vocabulary' },
          { href: '/dashboard/content/vocabulary/practice', icon: Dumbbell, label: 'Practice' },
        ]},
        { href: '/dashboard/content/grammar', icon: FileText, label: 'Grammar', subItems: [
          { href: '/dashboard/content/grammar', icon: FileText, label: 'All Grammar' },
          { href: '/dashboard/content/grammar/practice', icon: Dumbbell, label: 'Practice' },
        ]},
        { href: '/dashboard/content/conversation', icon: MessageCircle, label: 'Conversation' },
        { href: '/dashboard/games', icon: Gamepad2, label: 'Games' }
      ]
    },
    { href: '/dashboard/progress', icon: TrendingUp, label: 'My Progress' },
  ];

  const teacherNavWithResources: NavItem[] = teacherResourcesAccess
    ? [teacherNavItems[0], resourcesNavItem, ...teacherNavItems.slice(1)]
    : teacherNavItems;

  // Determine which navigation to use based on role
  const navItems = (userRole === 'super_admin' || userRole === 'content_creator') 
    ? fullNavItems 
    : userRole === 'member'
    ? memberNavItems
    : userRole === 'student'
    ? studentNavItems
    : teacherNavWithResources;

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isExpanded = (href: string) => expandedItems.includes(href);
  const navHrefIsActive = (href: string) =>
    pathname === href ||
    (href === '/resources' && pathname === '/dashboard/resources');
  const isActiveOrChild = (item: NavItem): boolean => {
    if (navHrefIsActive(item.href)) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => isActiveOrChild(subItem));
    }
    return false;
  };

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const expanded = isExpanded(item.href);
    const isActive = isActiveOrChild(item);

    return (
      <div key={item.href}>
        {hasSubItems ? (
          <Button
            variant={isActive ? 'secondary' : 'ghost'}
            className={`shadow-none my-1 w-full justify-start ${
              isActive ? 'bg-gray-100' : ''
            } ${isSubItem ? 'pl-8' : ''}`}
            onClick={() => toggleExpanded(item.href)}
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1 text-left">{item.label}</span>
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <Link href={item.href} passHref>
            <Button
              variant={navHrefIsActive(item.href) ? 'secondary' : 'ghost'}
              className={`shadow-none my-1 w-full justify-start ${
                navHrefIsActive(item.href) ? 'bg-gray-100' : ''
              } ${isSubItem ? 'pl-8 text-sm' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        )}
        
        {/* Render sub-items if expanded */}
        {hasSubItems && expanded && (
          <div className="ml-2">
            {item.subItems?.map(subItem => renderNavItem(subItem, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] w-full px-4 lg:px-8">
      {/* Mobile and Tablet header */}
      <div className="xl:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <span className="font-medium">Settings</span>
        </div>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Overlay for mobile and tablet */}
        {isSidebarOpen && (
          <div 
            className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ease-in-out"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`w-64 bg-white xl:bg-gray-50 border-r border-gray-200 xl:block ${
            isSidebarOpen ? 'block' : 'hidden'
          } xl:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out xl:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="h-full overflow-y-auto p-4">
            {/* Navigation Items */}
            {navItems.map(item => renderNavItem(item))}
            
            {/* Admin Tools - Only show for super_admin */}
            {userRole === 'super_admin' && (
              <div className="mt-8">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Admin Tools
                  </h3>
                  <div className="space-y-1">
                    {adminTools.map(item => renderNavItem(item))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Progress Summary - Show for students and members */}
            {(userRole === 'student' || userRole === 'member') && (
              <div className="mt-4">
                <Suspense fallback={<div className="h-32 bg-gray-100 rounded animate-pulse" />}>
                  <UserProgressSummary compact={true} />
                </Suspense>
              </div>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 xl:p-4">
          {/* Trial Banner - never shown to super_admin or student */}
          {userRole !== 'super_admin' && userRole !== 'student' && accessStatus === 'trial' && trialDaysRemaining !== null && (
            <div className={`mx-4 mt-4 xl:mx-0 xl:mt-0 mb-4 rounded-lg border px-4 py-3 flex items-center justify-between ${
              trialDaysRemaining > 7
                ? 'bg-green-50 border-green-200 text-green-800'
                : trialDaysRemaining > 3
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">
                  {trialDaysRemaining === 1
                    ? 'Your free trial ends tomorrow!'
                    : `Your free trial ends in ${trialDaysRemaining} days`}
                  {trialEndsAt && (
                    <span className="font-normal text-xs ml-1">
                      ({new Date(trialEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})
                    </span>
                  )}
                </span>
              </div>
              <Link href="/pricing" className="text-sm font-medium underline hover:no-underline whitespace-nowrap ml-4">
                Choose a plan
              </Link>
            </div>
          )}
          {userRole !== 'super_admin' && userRole !== 'student' && accessStatus === 'expired' && (
            <div className="mx-4 mt-4 xl:mx-0 xl:mt-0 mb-4 rounded-lg border bg-red-50 border-red-200 text-red-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">
                  Your free trial has ended. Choose a plan to continue using all features.
                </span>
              </div>
              <Link href="/subscribe" className="text-sm font-medium bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 whitespace-nowrap ml-4">
                Subscribe now
              </Link>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
} 