import { redirect } from 'next/navigation';
import { getUserWithTeamData } from '@/lib/db/queries';
import EditTicketClient from '../components/EditTicketClient';

export default async function EditTicketPage({ params }: { params: { id: string } }) {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'super_admin') {
    redirect('/dashboard');
  }

  return <EditTicketClient ticketId={parseInt(params.id)} />;
} 