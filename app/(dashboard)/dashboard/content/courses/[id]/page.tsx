import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { CourseDetailClient } from './components/CourseDetailClient';

export default async function CourseDetailPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <CourseDetailClient userRole={user.role} />;
} 