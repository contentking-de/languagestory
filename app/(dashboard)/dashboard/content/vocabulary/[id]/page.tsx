import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { VocabularyDetailClient } from './components/VocabularyDetailClient';

export default async function VocabularyDetailPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <VocabularyDetailClient userRole={user.role} />;
}