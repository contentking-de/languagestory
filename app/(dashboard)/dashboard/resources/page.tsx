import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { canAccessTeacherResources } from '@/lib/auth/rbac';
import { TeacherResourcesClient } from './TeacherResourcesClient';

export default async function TeacherResourcesPage() {
  const user = await getUserWithTeamData();

  if (!user) {
    redirect('/sign-in');
  }

  if (!canAccessTeacherResources({ role: user.role, userRole: user.userRole })) {
    redirect('/dashboard');
  }

  return <TeacherResourcesClient />;
}
