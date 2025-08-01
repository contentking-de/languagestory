import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { QuizDetailClient } from './components/QuizDetailClient';

export default async function QuizDetailPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <QuizDetailClient userRole={user.role} />;
} 