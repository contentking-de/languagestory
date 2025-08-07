'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  ArrowRight, 
  Home, 
  Trophy,
  Star,
  Sparkles
} from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';

interface LessonCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onGoHome: () => void;
  lessonTitle: string;
  pointsEarned?: number;
  hasNextLesson?: boolean;
}

export function LessonCompletionModal({
  isOpen,
  onClose,
  onContinue,
  onGoHome,
  lessonTitle,
  pointsEarned = 0,
  hasNextLesson = true
}: LessonCompletionModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti immediately when modal opens
      setShowConfetti(true);
      triggerConfetti();
      
      // Hide confetti after animation
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4 relative overflow-hidden">
        {/* Confetti overlay */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 animate-bounce">
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="absolute top-4 right-1/4 animate-bounce" style={{ animationDelay: '0.5s' }}>
              <Star className="h-5 w-5 text-pink-400" />
            </div>
            <div className="absolute top-8 left-1/3 animate-bounce" style={{ animationDelay: '1s' }}>
              <Sparkles className="h-4 w-4 text-blue-400" />
            </div>
            <div className="absolute top-12 right-1/3 animate-bounce" style={{ animationDelay: '1.5s' }}>
              <Star className="h-6 w-6 text-green-400" />
            </div>
          </div>
        )}
        
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Lesson Completed!
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Congratulations! You've completed "{lessonTitle}"
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Points earned */}
          {pointsEarned > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span className="text-lg font-bold text-yellow-800">
                  +{pointsEarned} Points Earned!
                </span>
              </div>
              <p className="text-sm text-yellow-700">
                Great job! Keep up the excellent work.
              </p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="space-y-3">
            {hasNextLesson ? (
              <Button 
                onClick={onContinue} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue to Next Lesson
              </Button>
            ) : (
              <Button 
                onClick={onGoHome} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Stay Here
            </Button>
          </div>
          
          {/* Encouraging message */}
          <div className="text-center text-sm text-gray-500">
            <p>You're making great progress! 🎉</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
