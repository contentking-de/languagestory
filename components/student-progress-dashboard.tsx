'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Flame, 
  Star, 
  Calendar, 
  TrendingUp, 
  Award,
  BookOpen,
  GamepadIcon,
  Brain,
  Target,
  Clock,
  Zap
} from 'lucide-react';

interface StudentProgressProps {
  studentId: number;
}

interface ProgressData {
  streak: {
    current_streak: number;
    longest_streak: number;
    total_points: number;
    last_activity_date: string;
  } | null;
  achievements: Array<{
    id: number;
    achievement_type: string;
    title: string;
    description: string;
    badge_icon: string;
    points_earned: number;
    earned_at: string;
  }>;
  recentTransactions: Array<{
    id: number;
    activity_type: string;
    points_change: number;
    description: string;
    created_at: string;
  }>;
  recentActivity: Array<{
    activity_date: string;
    points_earned: number;
    lessons_completed: number;
    quizzes_completed: number;
    vocabulary_practiced: number;
    games_played: number;
  }>;
}

export function StudentProgressDashboard({ studentId }: StudentProgressProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [studentId]);

  const fetchProgressData = async () => {
    try {
      const response = await fetch(`/api/student/progress/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!progressData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No progress data available</p>
        </CardContent>
      </Card>
    );
  }

  const { streak, achievements, recentTransactions, recentActivity } = progressData;

  // Calculate weekly stats
  const weeklyStats = recentActivity.reduce(
    (acc, day) => ({
      totalPoints: acc.totalPoints + day.points_earned,
      totalLessons: acc.totalLessons + day.lessons_completed,
      totalQuizzes: acc.totalQuizzes + day.quizzes_completed,
      totalVocabulary: acc.totalVocabulary + day.vocabulary_practiced,
      totalGames: acc.totalGames + day.games_played,
    }),
    { totalPoints: 0, totalLessons: 0, totalQuizzes: 0, totalVocabulary: 0, totalGames: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Points */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Points</p>
                <p className="text-2xl font-bold">{streak?.total_points || 0}</p>
              </div>
              <Star className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Current Streak</p>
                <p className="text-2xl font-bold">{streak?.current_streak || 0} days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        {/* Best Streak */}
        <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Best Streak</p>
                <p className="text-2xl font-bold">{streak?.longest_streak || 0} days</p>
              </div>
              <Trophy className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Achievements</p>
                <p className="text-2xl font-bold">{achievements.length}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{weeklyStats.totalPoints}</p>
              <p className="text-sm text-gray-600">Points Earned</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{weeklyStats.totalLessons}</p>
              <p className="text-sm text-gray-600">Lessons</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{weeklyStats.totalQuizzes}</p>
              <p className="text-sm text-gray-600">Quizzes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
                <Brain className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{weeklyStats.totalVocabulary}</p>
              <p className="text-sm text-gray-600">Vocabulary</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-2">
                <GamepadIcon className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{weeklyStats.totalGames}</p>
              <p className="text-sm text-gray-600">Games</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.slice(0, 5).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{achievement.badge_icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          +{achievement.points_earned} points
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {achievements.length > 5 && (
                  <p className="text-center text-sm text-gray-500">
                    +{achievements.length - 5} more achievements
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No achievements yet</p>
                <p className="text-sm text-gray-400">Complete activities to earn your first badge!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.slice(0, 8).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={transaction.points_change > 0 ? "default" : "destructive"}
                      className="ml-2"
                    >
                      {transaction.points_change > 0 ? '+' : ''}{transaction.points_change}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400">Start learning to earn points!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Daily Progress (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {recentActivity.map((day, index) => {
              const isToday = day.activity_date === new Date().toISOString().split('T')[0];
              const hasActivity = day.points_earned > 0;
              
              return (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(day.activity_date).toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div 
                    className={`h-16 rounded-lg flex items-center justify-center text-xs font-medium ${
                      hasActivity 
                        ? 'bg-green-500 text-white' 
                        : isToday 
                          ? 'bg-gray-200 border-2 border-gray-400' 
                          : 'bg-gray-100'
                    }`}
                  >
                    {hasActivity ? `+${day.points_earned}` : isToday ? 'Today' : ''}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {day.activity_date.split('-')[2]}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}