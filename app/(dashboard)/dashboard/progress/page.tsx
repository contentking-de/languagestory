import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { StudentProgressDashboard } from '@/components/student-progress-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'My Progress - Lingoletics.com',
  description: 'Track your learning progress, achievements, and streaks',
};

export default async function ProgressPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Only allow students, teachers, and parents to view progress
  const allowedRoles = ['student', 'teacher', 'parent', 'super_admin', 'content_creator'];
  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard');
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
            <p className="text-gray-600 mt-1">
              Track your learning journey, achievements, and streaks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      {/* Progress Dashboard */}
      <StudentProgressDashboard studentId={user.id} />

      {/* Additional Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How Points Work</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Earning Points</h4>
              <ul className="space-y-1">
                <li>• Complete Quiz: 20 points (up to 50 with bonuses)</li>
                <li>• Perfect Score Bonus: +20 points</li>
                <li>• Time Bonus: +10 points</li>
                <li>• Complete Lesson: 20 points</li>
                <li>• Practice Vocabulary: 20 points</li>
                <li>• Complete Grammar: 20 points</li>
                <li>• Complete Content: 20 points</li>
                <li>• Play Games: 10 points</li>
                <li>• Cultural Information: 10 points</li>
                <li>• Maximum per Lesson: 300 points</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Achievements</h4>
              <ul className="space-y-1">
                <li>• First Quiz: 25 points</li>
                <li>• Perfect Score: 50 points</li>
                <li>• First Lesson: 25 points</li>
                <li>• 7-Day Streak: 100 points</li>
                <li>• 30-Day Streak: 300 points</li>
                <li>• 100-Day Streak: 1000 points</li>
                <li>• 100 Points Milestone: 10 points</li>
                <li>• 500 Points Milestone: 50 points</li>
                <li>• 1000 Points Milestone: 100 points</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}