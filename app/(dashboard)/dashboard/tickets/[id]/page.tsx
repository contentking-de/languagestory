import { redirect } from 'next/navigation';
import { getUserWithTeamData } from '@/lib/db/queries';
import TicketDetailClient from './components/TicketDetailClient';

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'super_admin') {
    redirect('/dashboard');
  }

  const { id } = await params;
  return <TicketDetailClient ticketId={parseInt(id)} />;
} 