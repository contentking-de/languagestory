import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { DashboardNavigation } from './components/DashboardNavigation';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <DashboardNavigation userRole={user.role}>
      {children}
    </DashboardNavigation>
  );
}
