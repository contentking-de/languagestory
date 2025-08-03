'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, X, Star } from 'lucide-react';

interface Achievement {
  id: number;
  title: string;
  description: string;
  badge_icon: string;
  points_earned: number;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
  show: boolean;
}

export function AchievementNotification({ achievement, onDismiss, show }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for animation to complete
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg border-0 max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">{achievement.badge_icon}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium">Achievement Unlocked!</span>
              </div>
              <h3 className="font-bold text-white mb-1">{achievement.title}</h3>
              <p className="text-sm text-white/90 mb-2">{achievement.description}</p>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Star className="h-3 w-3 mr-1" />
                  +{achievement.points_earned} points
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 h-6 w-6 p-0 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing achievement notifications
export function useAchievementNotifications() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  const addAchievement = (achievement: Achievement) => {
    setAchievements(prev => [...prev, achievement]);
  };

  useEffect(() => {
    if (achievements.length > 0 && !currentAchievement) {
      setCurrentAchievement(achievements[0]);
    }
  }, [achievements, currentAchievement]);

  const dismissCurrent = () => {
    setCurrentAchievement(null);
    setAchievements(prev => {
      const newAchievements = prev.slice(1);
      if (newAchievements.length > 0) {
        setTimeout(() => setCurrentAchievement(newAchievements[0]), 500);
      }
      return newAchievements;
    });
  };

  return {
    currentAchievement,
    addAchievement,
    dismissCurrent,
  };
}