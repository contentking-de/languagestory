'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserProgressSummary } from '@/components/user-progress-summary';
import { 
  Users, Settings, Shield, Activity, Menu, UserCheck, ChevronDown, ChevronRight,
  BookOpen, GraduationCap, FileQuestion, Languages, Building2, BarChart3, School, Gamepad2, Brain, Heart, TrendingUp, FileImage, Ticket
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: any;
  label: string;
  subItems?: NavItem[];
}

interface DashboardNavigationProps {
  userRole: string;
  children: React.ReactNode;
}

export function DashboardNavigation({ userRole, children }: DashboardNavigationProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['/dashboard/content']);

  // Full navigation for Super Admin and Content Creator
  const fullNavItems: NavItem[] = [
    { href: '/dashboard/welcome', icon: Heart, label: 'Welcome' },
    { href: '/dashboard/ai-creator', icon: Brain, label: 'AI Creator' },
    { 
      href: '/dashboard/content', 
      icon: BookOpen, 
      label: 'Content',
      subItems: [
        { href: '/dashboard/content/courses', icon: GraduationCap, label: 'Courses' },
        { href: '/dashboard/content/lessons', icon: BookOpen, label: 'Lessons' },
        { href: '/dashboard/content/quizzes', icon: FileQuestion, label: 'Quizzes' },
        { href: '/dashboard/content/vocabulary', icon: Languages, label: 'Vocabulary' },
        { href: '/dashboard/games', icon: Gamepad2, label: 'Games' }
      ]
    },
    { href: '/dashboard/media', icon: FileImage, label: 'Media Library' },
    { href: '/dashboard/tickets', icon: Ticket, label: 'Tickets' },
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
    }
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
        { href: '/dashboard/content/vocabulary', icon: Languages, label: 'Vocabulary' },
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
    }
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
        { href: '/dashboard/content/vocabulary', icon: Languages, label: 'Vocabulary' },
        { href: '/dashboard/games', icon: Gamepad2, label: 'Games' }
      ]
    }
  ];

  // Determine which navigation to use based on role
  const navItems = (userRole === 'super_admin' || userRole === 'content_creator') 
    ? fullNavItems 
    : userRole === 'student'
    ? studentNavItems
    : teacherNavItems;

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isExpanded = (href: string) => expandedItems.includes(href);
  const isActiveOrChild = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => pathname === subItem.href);
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
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className={`shadow-none my-1 w-full justify-start ${
                pathname === item.href ? 'bg-gray-100' : ''
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
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
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
            
            {/* Progress Summary - Only show for students */}
            {userRole === 'student' && (
              <div className="mt-4">
                <Suspense fallback={<div className="h-32 bg-gray-100 rounded animate-pulse" />}>
                  <UserProgressSummary compact={true} />
                </Suspense>
              </div>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 xl:p-4">{children}</main>
      </div>
    </div>
  );
} 