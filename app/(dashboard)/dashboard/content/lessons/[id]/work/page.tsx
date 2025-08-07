import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { LessonWorkflowClient } from './components/LessonWorkflowClient';

interface LessonWorkPageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonWorkPage({ params }: LessonWorkPageProps) {
  const { id } = await params;
  const user = await getUserWithTeamData();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LessonWorkflowClient 
        lessonId={parseInt(id)} 
        userRole={user.role}
        userId={user.id}
      />
    </div>
  );
} 