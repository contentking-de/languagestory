import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { QuizPreviewClient } from './components/QuizPreviewClient';

export default async function QuizPreviewPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <QuizPreviewClient userRole={user.role} />;
}