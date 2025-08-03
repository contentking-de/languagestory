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

  // Debug: Log user data to see what role is being retrieved
  console.log('🔍 DEBUG Layout - User data:', {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    teamId: user.teamId,
    userRole: user.userRole,
    teamRole: user.teamRole
  });

  return (
    <DashboardNavigation userRole={user.role}>
      {children}
    </DashboardNavigation>
  );
}
