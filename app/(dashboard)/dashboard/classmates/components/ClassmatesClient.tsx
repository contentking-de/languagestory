'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, User, GraduationCap, Trophy, Flame, Award } from 'lucide-react';
import useSWR from 'swr';

interface TeamMember {
  id: number;
  user: {
    id: number;
    name: string | null;
    email: string;
    role: string;
  };
  role: string;
  language: string | null;
  joinedAt: Date;
}

interface TeamData {
  id: number;
  name: string;
  teamMembers: TeamMember[];
}

interface LeaderboardEntry {
  userId: number;
  name: string;
  email: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
}

interface ClassmatesClientProps {
  userRole: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ClassmatesClient({ userRole }: ClassmatesClientProps) {
  const { data: teamData, error, isLoading } = useSWR<TeamData>('/api/team', fetcher);
  const { data: leaderboardData, isLoading: leaderboardLoading } = useSWR<LeaderboardData>('/api/team/leaderboard', fetcher);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // Get current user ID
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (data?.id) {
          setCurrentUserId(data.id);
        }
      })
      .catch(err => console.error('Error fetching user:', err));
  }, []);

  const getUserDisplayName = (user: { name: string | null; email: string }) => {
    return user.name || user.email || 'Unknown User';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      student: 'bg-green-100 text-green-800',
      teacher: 'bg-blue-100 text-blue-800',
      parent: 'bg-orange-100 text-orange-800',
      content_creator: 'bg-indigo-100 text-indigo-800',
      super_admin: 'bg-red-100 text-red-800',
      institution_admin: 'bg-purple-100 text-purple-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleDisplayName = (role: string) => {
    const displayNames: Record<string, string> = {
      student: 'Student',
      teacher: 'Teacher',
      parent: 'Parent',
      content_creator: 'Content Creator',
      super_admin: 'Super Admin',
      institution_admin: 'Institution Admin',
    };
    return displayNames[role] || role;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Classmates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Classmates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">Failed to load classmates. Please try again later.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!teamData?.teamMembers || teamData.teamMembers.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Classmates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No classmates found in your team.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Filter out current user and sort by role (students first) then by name
  const classmates = teamData.teamMembers
    .filter((member) => member.user.id !== currentUserId)
    .sort((a, b) => {
      // Students first
      if (a.role === 'student' && b.role !== 'student') return -1;
      if (a.role !== 'student' && b.role === 'student') return 1;
      // Then by name
      const nameA = getUserDisplayName(a.user).toLowerCase();
      const nameB = getUserDisplayName(b.user).toLowerCase();
      return nameA.localeCompare(nameB);
    });

  const students = classmates.filter((member) => member.role === 'student');
  const others = classmates.filter((member) => member.role !== 'student');

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Classmates
          </h1>
          <p className="mt-2 text-gray-600">
            View your classmates and team members from {teamData.name}
          </p>
        </div>

        {/* Lingoletics League Leaderboard */}
        {!leaderboardLoading && leaderboardData?.leaderboard && leaderboardData.leaderboard.length > 0 && (
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Trophy className="h-6 w-6 text-orange-600" />
                Lingoletics League
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Student rankings based on points and learning streaks
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData.leaderboard.map((entry, index) => {
                  const isCurrentUser = entry.userId === currentUserId;
                  const displayName = entry.name;
                  const initials = getInitials(displayName);
                  const rank = index + 1;
                  
                  // Medal colors for top 3
                  const getRankColor = () => {
                    if (rank === 1) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
                    if (rank === 2) return 'bg-gray-100 border-gray-300 text-gray-800';
                    if (rank === 3) return 'bg-orange-100 border-orange-300 text-orange-800';
                    return isCurrentUser 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-gray-200';
                  };

                  const getRankIcon = () => {
                    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-600" />;
                    if (rank === 2) return <Award className="h-5 w-5 text-gray-600" />;
                    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />;
                    return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
                  };

                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center space-x-4 p-4 border-2 rounded-lg transition-all ${getRankColor()} ${
                        isCurrentUser ? 'ring-2 ring-blue-400' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 w-12 flex items-center justify-center">
                        {getRankIcon()}
                      </div>
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold text-gray-900 truncate ${
                            isCurrentUser ? 'text-blue-700' : ''
                          }`}>
                            {displayName}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Trophy className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-gray-700">{entry.totalPoints.toLocaleString()}</span>
                            <span className="text-gray-500">points</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="font-medium text-gray-700">{entry.currentStreak}</span>
                            <span className="text-gray-500">day streak</span>
                          </div>
                          {entry.longestStreak > entry.currentStreak && (
                            <div className="text-xs text-gray-500">
                              Best: {entry.longestStreak} days
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {leaderboardLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-600" />
                Lingoletics League
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {students.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                Students ({students.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((member) => {
                  const displayName = getUserDisplayName(member.user);
                  const initials = getInitials(displayName);
                  
                  return (
                    <div
                      key={member.id}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {displayName}
                        </p>
                        {member.language && member.language !== 'all' && (
                          <p className="text-sm text-gray-500 capitalize">
                            {member.language}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {others.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Teachers & Others ({others.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {others.map((member) => {
                  const displayName = getUserDisplayName(member.user);
                  const initials = getInitials(displayName);
                  
                  return (
                    <div
                      key={member.id}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={getRoleBadgeColor(member.role)}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {displayName}
                        </p>
                        <Badge
                          variant="outline"
                          className={`mt-1 ${getRoleBadgeColor(member.role)}`}
                        >
                          {getRoleDisplayName(member.role)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {classmates.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">You are the only member in your team.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
