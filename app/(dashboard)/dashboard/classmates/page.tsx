import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { ClassmatesClient } from './components/ClassmatesClient';

export default async function ClassmatesPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <ClassmatesClient userRole={user.role} />;
}
