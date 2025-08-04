import { redirect } from 'next/navigation';
import { getUserWithTeamData } from '@/lib/db/queries';
import TicketsClient from './components/TicketsClient';

export default async function TicketsPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'super_admin') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
        <p className="text-gray-600 mt-2">
          Manage bugs, tech support requests, and feature requests
        </p>
      </div>
      
      <TicketsClient />
    </div>
  );
} 