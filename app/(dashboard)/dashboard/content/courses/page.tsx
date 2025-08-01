import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { CoursesClient } from './components/CoursesClient';

export default async function CoursesPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <CoursesClient userRole={user.role} />;
} 