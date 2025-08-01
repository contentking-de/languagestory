import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  Clock,
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema';
import { getActivityAnalytics, getActivityStatistics, getTeamMembers, getUserWithTeamData } from '@/lib/db/queries';
import { ActivityCharts } from './components/ActivityCharts';
import { ActivityStats } from './components/ActivityStats';
import { ActivityTimeline } from './components/ActivityTimeline';
import { ActivityFilters } from './components/ActivityFilters';



interface ActivityPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ActivityPage({ searchParams }: ActivityPageProps) {
  // Parse search parameters for filtering
  const params = await searchParams;
  const dateFrom = params.from as string;
  const dateTo = params.to as string;
  const selectedUserId = params.userId as string;

  const dateRange = dateFrom && dateTo ? {
    from: new Date(dateFrom),
    to: new Date(dateTo)
  } : undefined;

  const userId = selectedUserId ? parseInt(selectedUserId) : undefined;

  // Get current user to get team ID
  const currentUser = await getUserWithTeamData();
  if (!currentUser || !currentUser.teamId) {
    throw new Error('User not authenticated or no team found');
  }

  // Fetch data
  const [analytics, statistics, teamMembers] = await Promise.all([
    getActivityAnalytics(dateRange, userId),
    getActivityStatistics(dateRange, userId),
    getTeamMembers(currentUser.teamId)
  ]);

  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Learning Analytics
          </h1>
          <p className="text-gray-600">
            Track learning progress and activity patterns
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 lg:mt-0">
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            <TrendingUp className="w-3 h-3 mr-1" />
            {statistics.totalActivities} Total Activities
          </Badge>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Suspense fallback={<div>Loading...</div>}>
          <ActivityStats statistics={statistics} />
        </Suspense>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <ActivityFilters 
          teamMembers={teamMembers || []} 
          currentUser={{ role: currentUser.role || 'student' }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Suspense fallback={<div>Loading charts...</div>}>
          <ActivityCharts statistics={statistics} />
        </Suspense>
      </div>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading timeline...</div>}>
            <ActivityTimeline activities={analytics} />
          </Suspense>
        </CardContent>
      </Card>
    </section>
  );
}
