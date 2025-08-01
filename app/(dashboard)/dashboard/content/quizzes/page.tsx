import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { QuizzesClient } from './components/QuizzesClient';

export default async function QuizzesPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <QuizzesClient userRole={user.role} />;
} 