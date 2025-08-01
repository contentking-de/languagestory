'use client';

import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  UserMinus,
  Mail,
  CheckCircle,
  BookOpen,
  GraduationCap,
  Users,
  Play,
  CheckSquare,
  FileText,
  BarChart3,
  HelpCircle,
  Languages,
  Gamepad2,
  Trophy,
  type LucideIcon
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema';

interface Activity {
  id: number;
  action: string;
  timestamp: string;
  userId: number;
  userName: string;
  userRole: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const iconMap: Record<ActivityType, LucideIcon> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.CREATE_TEAM]: UserPlus,
  [ActivityType.REMOVE_TEAM_MEMBER]: UserMinus,
  [ActivityType.INVITE_TEAM_MEMBER]: Mail,
  [ActivityType.ACCEPT_INVITATION]: CheckCircle,
  // Educational activities
  [ActivityType.CREATE_CLASS]: BookOpen,
  [ActivityType.ENROLL_STUDENT]: GraduationCap,
  [ActivityType.REMOVE_STUDENT]: UserMinus,
  [ActivityType.ASSIGN_TEACHER]: Users,
  [ActivityType.START_LESSON]: Play,
  [ActivityType.COMPLETE_LESSON]: CheckSquare,
  [ActivityType.SUBMIT_EXERCISE]: FileText,
  [ActivityType.VIEW_PROGRESS]: BarChart3,
  // Quiz activities
  [ActivityType.CREATE_QUIZ]: HelpCircle,
  [ActivityType.TAKE_QUIZ]: Play,
  [ActivityType.COMPLETE_QUIZ]: Trophy,
  // Vocabulary activities
  [ActivityType.CREATE_VOCABULARY]: Languages,
  [ActivityType.STUDY_VOCABULARY]: BookOpen,
  // Games activities
  [ActivityType.CREATE_GAME]: Gamepad2,
  [ActivityType.PLAY_GAME]: Play,
};

function formatAction(action: ActivityType): string {
  switch (action) {
    case ActivityType.SIGN_UP:
      return 'You signed up';
    case ActivityType.SIGN_IN:
      return 'You signed in';
    case ActivityType.SIGN_OUT:
      return 'You signed out';
    case ActivityType.UPDATE_PASSWORD:
      return 'You changed your password';
    case ActivityType.DELETE_ACCOUNT:
      return 'You deleted your account';
    case ActivityType.UPDATE_ACCOUNT:
      return 'You updated your account';
    case ActivityType.CREATE_TEAM:
      return 'You created a new team';
    case ActivityType.REMOVE_TEAM_MEMBER:
      return 'You removed a team member';
    case ActivityType.INVITE_TEAM_MEMBER:
      return 'You invited a team member';
    case ActivityType.ACCEPT_INVITATION:
      return 'You accepted an invitation';
    // Educational activities
    case ActivityType.CREATE_CLASS:
      return 'You created a new class';
    case ActivityType.ENROLL_STUDENT:
      return 'You enrolled a student';
    case ActivityType.REMOVE_STUDENT:
      return 'You removed a student';
    case ActivityType.ASSIGN_TEACHER:
      return 'You assigned a teacher';
    case ActivityType.START_LESSON:
      return 'You started a lesson';
    case ActivityType.COMPLETE_LESSON:
      return 'You completed a lesson';
    case ActivityType.SUBMIT_EXERCISE:
      return 'You submitted an exercise';
    case ActivityType.VIEW_PROGRESS:
      return 'You viewed progress';
    // Quiz activities
    case ActivityType.CREATE_QUIZ:
      return 'You created a quiz';
    case ActivityType.TAKE_QUIZ:
      return 'You started taking a quiz';
    case ActivityType.COMPLETE_QUIZ:
      return 'You completed a quiz';
    // Vocabulary activities
    case ActivityType.CREATE_VOCABULARY:
      return 'You created vocabulary';
    case ActivityType.STUDY_VOCABULARY:
      return 'You studied vocabulary';
    // Games activities
    case ActivityType.CREATE_GAME:
      return 'You created a game';
    case ActivityType.PLAY_GAME:
      return 'You played a game';
    default:
      return 'Unknown action occurred';
  }
}

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function getRoleColor(role: string) {
  switch (role) {
    case 'teacher':
      return 'bg-blue-100 text-blue-800';
    case 'student':
      return 'bg-green-100 text-green-800';
    case 'institution_admin':
      return 'bg-purple-100 text-purple-800';
    case 'super_admin':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getActivityColor(action: string) {
  if (action.includes('QUIZ')) return 'bg-blue-100 text-blue-600';
  if (action.includes('VOCABULARY')) return 'bg-green-100 text-green-600';
  if (action.includes('GAME')) return 'bg-purple-100 text-purple-600';
  if (action.includes('LESSON')) return 'bg-orange-100 text-orange-600';
  return 'bg-gray-100 text-gray-600';
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          📊
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No activity data yet
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Activity will appear here as students and teachers interact with quizzes, vocabulary, and games.
        </p>
      </div>
    );
  }

  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = new Date(activity.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedActivities).map(([date, dayActivities]) => (
        <div key={date}>
          {/* Date Header */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-900">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
            </div>
            <div className="ml-4 flex-1 border-t border-gray-200"></div>
            <Badge variant="secondary" className="ml-4">
              {dayActivities.length} activities
            </Badge>
          </div>

          {/* Activities for this date */}
          <div className="space-y-3">
            {dayActivities.map((activity) => {
              const Icon = iconMap[activity.action as ActivityType];
              const activityColor = getActivityColor(activity.action);
              
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  {/* Activity Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-full ${activityColor}`}>
                    {Icon && <Icon className="w-4 h-4" />}
                  </div>
                  
                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.userName}
                        </p>
                        <Badge variant="outline" className={`text-xs ${getRoleColor(activity.userRole)}`}>
                          {activity.userRole}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {getRelativeTime(new Date(activity.timestamp))}
                      </p>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {formatAction(activity.action as ActivityType)}
                    </p>
                    
                    {/* Activity Type Badge */}
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.action.replace(/_/g, ' ').toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Load More Button (if needed) */}
      {activities.length >= 50 && (
        <div className="text-center pt-6">
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            Load more activities...
          </button>
        </div>
      )}
    </div>
  );
}