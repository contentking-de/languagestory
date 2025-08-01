'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  Languages,
  Gamepad2,
  Trophy,
  BookOpen,
  Play,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface ActivityStatsProps {
  statistics: {
    activityCounts: Array<{ action: string; count: number }>;
    dailyActivity: Array<{ date: string; count: number; action: string }>;
    totalActivities: number;
  };
}

export function ActivityStats({ statistics }: ActivityStatsProps) {
  const { activityCounts, totalActivities } = statistics;

  // Calculate key metrics
  const quizActivities = activityCounts
    .filter(a => a.action.includes('QUIZ'))
    .reduce((sum, a) => sum + a.count, 0);
  
  const vocabularyActivities = activityCounts
    .filter(a => a.action.includes('VOCABULARY'))
    .reduce((sum, a) => sum + a.count, 0);
  
  const gameActivities = activityCounts
    .filter(a => a.action.includes('GAME'))
    .reduce((sum, a) => sum + a.count, 0);

  const todayActivities = statistics.dailyActivity
    .filter(a => a.date === new Date().toISOString().split('T')[0])
    .reduce((sum, a) => sum + a.count, 0);

  const stats = [
    {
      title: 'Quiz Activities',
      value: quizActivities,
      icon: HelpCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%'
    },
    {
      title: 'Vocabulary Study',
      value: vocabularyActivities,
      icon: Languages,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%'
    },
    {
      title: 'Games Played',
      value: gameActivities,
      icon: Gamepad2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15%'
    },
    {
      title: 'Today\'s Activity',
      value: todayActivities,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: 'Today'
    }
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <Badge variant="outline" className="text-xs mt-1">
              {stat.change}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </>
  );
}