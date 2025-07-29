'use client';

import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  BookOpen, 
  Headphones, 
  Users, 
  GraduationCap,
  Heart,
  Languages,
  Flag,
  Volume2,
  Trophy,
  GamepadIcon,
  BarChart3,
  Download,
  UserCircle
} from 'lucide-react';
import { Terminal } from './terminal';
import { useState } from 'react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('school');

  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Language Learning with
                <span className="block text-orange-500">Short Stories</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Master French, German, and Spanish through engaging stories with audio, 
                comprehension exercises, and cultural insights. Perfect for beginner to 
                intermediate learners who love reading and discovery.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <a href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg rounded-full"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <Terminal />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Story-Based Learning
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Learn through captivating short stories featuring memorable characters 
                  and authentic cultural contexts from France, Germany, and Spain.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Four Skills Development
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Practice reading, listening, writing, and speaking skills through 
                  comprehensive exercises that build on each story's content.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Headphones className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Audio & Comprehension
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Listen to native speaker audio recordings and complete interactive 
                  comprehension exercises to reinforce your learning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="py-16 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Learn Through Engaging Stories
            </h2>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
              Master French, German, and Spanish with our collection of original short stories. 
              Each story includes audio, comprehension exercises, and cultural insights.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white p-6 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">French</h3>
              <p className="text-gray-600">
                Discover French culture through engaging stories set in Paris, Provence, and beyond. 
                Learn authentic expressions and cultural nuances.
              </p>
            </div>
            <div className="text-center bg-white p-6 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">German</h3>
              <p className="text-gray-600">
                Explore German traditions and landmarks through captivating narratives. 
                Master complex grammar in context with memorable characters.
              </p>
            </div>
            <div className="text-center bg-white p-6 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Spanish</h3>
              <p className="text-gray-600">
                Journey through Spanish-speaking countries and their rich cultures. 
                Build vocabulary naturally through immersive storytelling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Perfect for Every Learning Journey
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Whether you're learning independently, teaching others, or supporting a child's education
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCircle className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Individual Learners</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Build on your basic language level</li>
                <li>• Check answers as you progress</li>
                <li>• New grammar & vocabulary in each story</li>
                <li>• Self-paced learning experience</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Teachers & Tutors</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Motivate students with original stories</li>
                <li>• Develop all four language skills</li>
                <li>• Access cultural information resources</li>
                <li>• Track student progress</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Parents & Carers</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Support your child's language learning</li>
                <li>• Monitor progress through activities</li>
                <li>• Learn cultural facts together</li>
                <li>• Encourage reading enjoyment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive learning resources designed for beginner to intermediate levels
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Original Stories</h3>
              <p className="text-gray-600">Over 10 engaging stories for each language with memorable characters and authentic cultural contexts.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Volume2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Audio Content</h3>
              <p className="text-gray-600">Professional native speaker recordings for pronunciation practice and listening comprehension.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Languages className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cultural Insights</h3>
              <p className="text-gray-600">Discover traditions, landmarks, and cultural facts about France, Germany, and Spain.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <GamepadIcon className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Games</h3>
              <p className="text-gray-600">Fun vocabulary games and comprehension exercises to reinforce learning and track progress.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">Monitor learning progress with detailed reports and achievements for students and teachers.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Resources</h3>
              <p className="text-gray-600">Access teaching materials, vocabulary lists, and sample stories to enhance your learning experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Choose Your Learning Plan
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Access to all short stories and teaching resources across all three languages
            </p>
          </div>

          {/* Tab Buttons */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button 
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'school' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('school')}
              >
                School Plans
              </button>
              <button 
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'individual' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('individual')}
              >
                Individual Plans
              </button>
            </div>
          </div>

          {/* School Plans */}
          {activeTab === 'school' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* All Access Pass */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-orange-900 px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-bold">
                POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">All Access Pass</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">£199.99</span>
                <span className="text-orange-100"> / year</span>
              </div>
              <ul className="space-y-2 mb-6 text-orange-100">
                <li>• One Year Subscription</li>
                <li>• 900 seats for students & staff</li>
                <li>• Students logins</li>
                <li>• All stories and resources</li>
              </ul>
              <button className="w-full bg-white text-orange-600 font-bold py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors">
                Subscribe Now
              </button>
            </div>

            {/* German Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 mb-2">German</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">£79.99</span>
                <span className="text-gray-500"> / year</span>
              </div>
              <ul className="space-y-2 mb-6 text-gray-600">
                <li>• One year subscription</li>
                <li>• 900 seats for students & staff</li>
                <li>• Student logins</li>
                <li>• German stories & resources</li>
              </ul>
              <button className="w-full border-2 border-orange-500 text-orange-600 font-bold py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors">
                Subscribe Now
              </button>
            </div>

            {/* French Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 mb-2">French</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">£79.99</span>
                <span className="text-gray-500"> / year</span>
              </div>
              <ul className="space-y-2 mb-6 text-gray-600">
                <li>• One Year Subscription</li>
                <li>• 900 seats for students & staff</li>
                <li>• Student logins</li>
                <li>• French stories & resources</li>
              </ul>
              <button className="w-full border-2 border-orange-500 text-orange-600 font-bold py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors">
                Subscribe Now
              </button>
            </div>

            {/* Spanish Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Spanish</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">£79.99</span>
                <span className="text-gray-500"> / year</span>
              </div>
              <ul className="space-y-2 mb-6 text-gray-600">
                <li>• One year subscription</li>
                <li>• 900 seats for students & staff</li>
                <li>• Student logins</li>
                <li>• Spanish stories & resources</li>
              </ul>
              <button className="w-full border-2 border-orange-500 text-orange-600 font-bold py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors">
                Subscribe Now
              </button>
            </div>
          </div>
          )}

          {/* Individual Plans */}
          {activeTab === 'individual' && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Individual Membership Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              
              {/* Monthly Plan */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">£7.99</span>
                  <span className="text-gray-500"> / 30 Days</span>
                </div>
                <ul className="space-y-2 mb-6 text-gray-600">
                  <li>• Access for 30 Days</li>
                  <li>• Valid for single user</li>
                  <li>• Access to stories, games and quizzes</li>
                </ul>
                <button className="w-full border-2 border-orange-500 text-orange-600 font-bold py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors">
                  Choose Your Course
                </button>
              </div>

              {/* Quarterly Plan */}
              <div className="bg-white border-2 border-orange-300 rounded-lg p-6 relative">
                <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-bold">
                  BEST VALUE
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quarterly</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">£19.99</span>
                  <span className="text-gray-500"> / 3 Months</span>
                </div>
                <ul className="space-y-2 mb-6 text-gray-600">
                  <li>• Access for 3 Months</li>
                  <li>• Valid for single user</li>
                  <li>• Access to stories, games and quizzes</li>
                </ul>
                <button className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                  Choose Your Course
                </button>
              </div>

              {/* Annual Plan */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Annually</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">£49.99</span>
                  <span className="text-gray-500"> / year</span>
                </div>
                <ul className="space-y-2 mb-6 text-gray-600">
                  <li>• Access for 1 Year</li>
                  <li>• Valid for single user</li>
                  <li>• Access to stories, games and quizzes</li>
                </ul>
                <button className="w-full border-2 border-orange-500 text-orange-600 font-bold py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors">
                  Choose Your Course
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Contact Note */}
          <div className="text-center mt-12 bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-600 mb-4">
              Contact us if you have any questions and if you are considering a subscription for several schools 
              or have any specific needs. Schools are also welcome to pay via bank transfer.
            </p>
            <button className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Ready to begin your language journey?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Join thousands of learners who are already mastering new languages 
                with A Language Story. Start with a free trial and discover how 
                personalized learning can transform your fluency.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <a href="/sign-up">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg rounded-full"
                >
                  Start Free Trial
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* About Us Section */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-bold mb-4">About Us</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                A Language Story is a one stop learning platform where you can 
                learn German, French and Spanish languages through fun and 
                engaging stories and games.
              </p>
              <p className="text-gray-600 leading-relaxed">
                A Language Story focusses on developing language skills in all four 
                disciplines – Writing, Reading, Listening and Speaking. Each story 
                is accompanied with a set of resources, which can be accessed in 
                the classroom or at home.
              </p>
              <div className="mt-6">
                <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-gray-700" />
                </div>
              </div>
            </div>

            {/* Legal and Privacy Section */}
            <div>
              <h3 className="text-xl font-bold mb-4">Legal and Privacy</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/privacy-policy" className="text-gray-600 hover:text-gray-800 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/cookie-policy" className="text-gray-600 hover:text-gray-800 transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="/terms-and-conditions" className="text-gray-600 hover:text-gray-800 transition-colors">
                    Terms and Conditions
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links Section */}
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/about" className="text-gray-600 hover:text-gray-800 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-600 hover:text-gray-800 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/free-resources" className="text-gray-600 hover:text-gray-800 transition-colors">
                    Free Resources
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="text-gray-600 hover:text-gray-800 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/redeem" className="text-gray-600 hover:text-gray-800 transition-colors">
                    Redeem An Enrollment Key
                  </a>
                </li>
              </ul>
            </div>

            {/* Buy Subscription Section */}
            <div>
              <h3 className="text-xl font-bold mb-4">Buy Subscription</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/shop" className="text-gray-600 hover:text-gray-800 transition-colors">
                    Shopping Area
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="text-gray-600 hover:text-gray-800 transition-colors">
                    My Account
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
                      <div className="border-t border-gray-300 mt-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm">
                © 2025 All Rights Reserved.
              </p>
              
              {/* Accessibility Button */}
              <button className="mt-4 md:mt-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-all">
                <span className="text-gray-700 font-bold text-sm">X</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
