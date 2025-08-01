import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { LessonsClient } from './components/LessonsClient';

export default async function LessonsPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <LessonsClient userRole={user.role} />;
} 