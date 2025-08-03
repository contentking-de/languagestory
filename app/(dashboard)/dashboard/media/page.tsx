import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { MediaLibrary } from './components/MediaLibrary';

export const metadata = {
  title: 'Media Library - Lingoletics.com',
  description: 'Manage media files for lessons and content',
};

export default async function MediaLibraryPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Only allow super_admin to access media library
  if (user.role !== 'super_admin') {
    redirect('/dashboard');
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">
            Upload and manage media files for lessons and content
          </p>
        </div>
      </div>

      {/* Media Library Component */}
      <MediaLibrary />
    </div>
  );
} 