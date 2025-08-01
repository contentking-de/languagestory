import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { LessonDetailClient } from './components/LessonDetailClient';

export default async function LessonDetailPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <LessonDetailClient userRole={user.role} />;
} 