'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Trophy, 
  Play, 
  ChevronRight, 
  Sparkles,
  Target,
  Heart,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Lingoletics.com
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your journey to language mastery begins here. Discover engaging stories, practice with AI, and connect with a community of learners from around the world.
        </p>
      </div>

      {/* What to Expect Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-orange-900">Immersive Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-800 mb-4">
              Dive into captivating stories crafted by native speakers. Each story is designed to naturally introduce vocabulary and grammar in context.
            </p>
            <ul className="space-y-2 text-sm text-orange-700">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                Over 50+ original stories per language
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                Progressive difficulty levels
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                Cultural context and insights
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-blue-900">AI-Powered Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-4">
              Practice conversations with our advanced AI tutor, get instant feedback, and receive personalized learning recommendations.
            </p>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                Interactive conversation practice
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                Real-time pronunciation feedback
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                Adaptive learning paths
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-green-900">Track Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 mb-4">
              Monitor your learning journey with detailed analytics, achievements, and milestone celebrations.
            </p>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                Comprehensive learning analytics
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                Achievement badges and rewards
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                Weekly progress reports
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Ready to Start Learning?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/content" className="group">
              <Button variant="outline" className="w-full h-auto p-4 group-hover:border-orange-300 group-hover:bg-orange-50 transition-all">
                <div className="text-center">
                  <BookOpen className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <div className="font-medium">Browse Stories</div>
                  <div className="text-xs text-gray-500">Explore our library</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/dashboard/ai-creator" className="group">
              <Button variant="outline" className="w-full h-auto p-4 group-hover:border-blue-300 group-hover:bg-blue-50 transition-all">
                <div className="text-center">
                  <Play className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">Start Lesson</div>
                  <div className="text-xs text-gray-500">Begin learning now</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/dashboard/activity" className="group">
              <Button variant="outline" className="w-full h-auto p-4 group-hover:border-green-300 group-hover:bg-green-50 transition-all">
                <div className="text-center">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="font-medium">View Progress</div>
                  <div className="text-xs text-gray-500">Track your journey</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/dashboard/games" className="group">
              <Button variant="outline" className="w-full h-auto p-4 group-hover:border-purple-300 group-hover:bg-purple-50 transition-all">
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <div className="font-medium">Play Games</div>
                  <div className="text-xs text-gray-500">Fun learning activities</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Learning Philosophy */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Heart className="h-5 w-5 text-purple-500" />
            Our Learning Philosophy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">Learn with Joy</h3>
              <p className="text-sm text-purple-700">
                Language learning should be enjoyable, not stressful. Our stories and games make learning feel like play.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">Community First</h3>
              <p className="text-sm text-purple-700">
                Connect with fellow learners, share experiences, and grow together in a supportive environment.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">Cultural Immersion</h3>
              <p className="text-sm text-purple-700">
                Learn not just the language, but the culture, traditions, and perspectives of native speakers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          Your language adventure awaits
        </div>
        <div className="space-x-4">
          <Link href="/dashboard/content">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              <BookOpen className="h-5 w-5 mr-2" />
              Start Your First Story
            </Button>
          </Link>
          <Link href="/dashboard/activity">
            <Button variant="outline" size="lg">
              <Trophy className="h-5 w-5 mr-2" />
              View My Progress
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}