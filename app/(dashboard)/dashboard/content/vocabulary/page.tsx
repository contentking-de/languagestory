import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { VocabularyClient } from './components/VocabularyClient';

export default async function VocabularyPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <VocabularyClient userRole={user.role} />;
} 