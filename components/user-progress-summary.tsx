'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Flame, 
  Star, 
  TrendingUp,
  BookOpen,
  Target,
  Brain,
  GamepadIcon
} from 'lucide-react';
import Link from 'next/link';

interface UserProgressSummaryProps {
  userId?: number;
  compact?: boolean;
}

interface ProgressData {
  totalLessons?: number;
  totalPoints?: number;
  recentActivity?: number;
  progressRecords?: any[];
  streak?: {
    current_streak: number;
    longest_streak: number;
    total_points: number;
  } | null;
  completionStats?: {
    total_completions: number;
    quizzes_completed: number;
    lessons_completed: number;
    vocabulary_completed: number;
    games_completed: number;
    average_score: number;
  };
  achievements?: Array<{
    id: number;
    title: string;
    badge_icon: string;
  }>;
}

export function UserProgressSummary({ userId, compact = false }: UserProgressSummaryProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // Get current user ID from API
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (userId) {
      setCurrentUserId(userId);
    } else {
      getCurrentUser();
    }
  }, [userId]);

  useEffect(() => {
    if (currentUserId) {
      fetchProgressData();
    }
  }, [currentUserId]);

  const fetchProgressData = async () => {
    if (!currentUserId) return;
    
    try {
      const response = await fetch(`/api/student/progress/${currentUserId}`);
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
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-blue-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-blue-200 rounded w-1/2 mb-3"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-blue-200 rounded w-16"></div>
              <div className="h-8 bg-blue-200 rounded w-16"></div>
              <div className="h-8 bg-blue-200 rounded w-16"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progressData || !currentUserId) {
    return null;
  }

  const { streak, completionStats, achievements, totalLessons, totalPoints, recentActivity } = progressData;

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Your Progress</h3>
            <p className="text-gray-600 text-xs">Keep learning!</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Points */}
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="h-3 w-3 text-yellow-600" />
              </div>
              <span className="text-xs text-gray-600">Points</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {totalPoints || streak?.total_points || 0}
            </div>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame className="h-3 w-3 text-orange-600" />
              </div>
              <span className="text-xs text-gray-600">Streak</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {streak?.current_streak || 0} days
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Achievements */}
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy className="h-3 w-3 text-yellow-600" />
              </div>
              <span className="text-xs text-gray-600">Badges</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {achievements?.length || 0}
            </div>
          </div>

          {/* Total Completions */}
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-xs text-gray-600">Done</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {totalLessons || completionStats?.total_completions || 0}
            </div>
          </div>
        </div>

        {/* Activity Breakdown */}
        {completionStats && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {completionStats.quizzes_completed > 0 && (
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-gray-600" />
                  <span className="text-xs text-gray-600">{completionStats.quizzes_completed} Quizzes</span>
                </div>
              </div>
            )}
            {completionStats.lessons_completed > 0 && (
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3 w-3 text-gray-600" />
                  <span className="text-xs text-gray-600">{completionStats.lessons_completed} Lessons</span>
                </div>
              </div>
            )}
            {completionStats.vocabulary_completed > 0 && (
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Brain className="h-3 w-3 text-gray-600" />
                  <span className="text-xs text-gray-600">{completionStats.vocabulary_completed} Vocab</span>
                </div>
              </div>
            )}
            {completionStats.games_completed > 0 && (
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <div className="flex items-center gap-2">
                  <GamepadIcon className="h-3 w-3 text-gray-600" />
                  <span className="text-xs text-gray-600">{completionStats.games_completed} Games</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">Active Learner</span>
          </div>
        </div>
        
        {/* View All Link */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Link 
            href="/dashboard/progress" 
            className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors flex items-center justify-center gap-1 pt-1"
          >
            View All Details →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xl">Your Progress</h3>
            <p className="text-white/70 text-sm">Track your learning journey</p>
          </div>
        </div>
        <Link 
          href="/dashboard/progress" 
          className="text-white/80 hover:text-white text-sm font-medium transition-colors"
        >
          View Details →
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Points */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-300" />
            </div>
            <span className="text-sm text-white/70">Total Points</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {totalPoints || streak?.total_points || 0}
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-400/20 rounded-lg flex items-center justify-center">
              <Flame className="h-5 w-5 text-orange-300" />
            </div>
            <span className="text-sm text-white/70">Day Streak</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {streak?.current_streak || 0}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <Trophy className="h-5 w-5 text-yellow-300" />
            </div>
            <span className="text-sm text-white/70">Badges</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {achievements?.length || 0}
          </div>
        </div>

        {/* Total Completions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-green-300" />
            </div>
            <span className="text-sm text-white/70">Completed</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {totalLessons || completionStats?.total_completions || 0}
          </div>
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="flex flex-wrap gap-3 mb-6">
        {completionStats?.quizzes_completed && completionStats.quizzes_completed > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-white/80" />
              <span className="text-sm text-white/80">{completionStats.quizzes_completed} Quizzes</span>
            </div>
          </div>
        )}
        {completionStats?.lessons_completed && completionStats.lessons_completed > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-white/80" />
              <span className="text-sm text-white/80">{completionStats.lessons_completed} Lessons</span>
            </div>
          </div>
        )}
        {completionStats?.vocabulary_completed && completionStats.vocabulary_completed > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-white/80" />
              <span className="text-sm text-white/80">{completionStats.vocabulary_completed} Vocabulary</span>
            </div>
          </div>
        )}
        {completionStats?.games_completed && completionStats.games_completed > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <div className="flex items-center gap-2">
              <GamepadIcon className="h-4 w-4 text-white/80" />
              <span className="text-sm text-white/80">{completionStats.games_completed} Games</span>
            </div>
          </div>
        )}
      </div>

      {/* Recent Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h4 className="text-sm font-medium text-white mb-3">Recent Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {achievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm text-white">{achievement.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 