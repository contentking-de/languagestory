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
  UserCircle,
  X
} from 'lucide-react';
import { Terminal } from './terminal';
import { useState } from 'react';

// Modal content data
const modalContent = {
  'privacy-policy': {
    title: 'Privacy Policy',
    content: `
      <h2 class="text-xl font-bold mb-4">Privacy Policy</h2>
      <p class="mb-4">Last updated: January 2025</p>
      
      <h3 class="text-lg font-semibold mb-2">Information We Collect</h3>
      <p class="mb-4">We collect information you provide directly to us, such as when you create an account, subscribe to our services, or contact us for support.</p>
      
      <h3 class="text-lg font-semibold mb-2">How We Use Your Information</h3>
      <p class="mb-4">We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
      
      <h3 class="text-lg font-semibold mb-2">Information Sharing</h3>
      <p class="mb-4">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
      
      <h3 class="text-lg font-semibold mb-2">Data Security</h3>
      <p class="mb-4">We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
      
      <h3 class="text-lg font-semibold mb-2">Contact Us</h3>
      <p>If you have any questions about this Privacy Policy, please contact us at privacy@alanguagestory.com</p>
    `
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    content: `
      <h2 class="text-xl font-bold mb-4">Cookie Policy</h2>
      <p class="mb-4">Last updated: January 2025</p>
      
      <h3 class="text-lg font-semibold mb-2">What Are Cookies</h3>
      <p class="mb-4">Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience.</p>
      
      <h3 class="text-lg font-semibold mb-2">How We Use Cookies</h3>
      <p class="mb-4">We use cookies to remember your preferences, analyze site traffic, and personalize content. This helps us improve our services and provide a better user experience.</p>
      
      <h3 class="text-lg font-semibold mb-2">Types of Cookies We Use</h3>
      <ul class="list-disc list-inside mb-4">
        <li>Essential cookies for basic site functionality</li>
        <li>Analytics cookies to understand how you use our site</li>
        <li>Preference cookies to remember your settings</li>
        <li>Marketing cookies for personalized content</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-2">Managing Cookies</h3>
      <p>You can control and manage cookies through your browser settings. However, disabling certain cookies may affect the functionality of our website.</p>
    `
  },
  'terms-and-conditions': {
    title: 'Terms and Conditions',
    content: `
      <h2 class="text-xl font-bold mb-4">Terms and Conditions</h2>
      <p class="mb-4">Last updated: January 2025</p>
      
      <h3 class="text-lg font-semibold mb-2">Acceptance of Terms</h3>
      <p class="mb-4">By accessing and using A Language Story, you accept and agree to be bound by the terms and provision of this agreement.</p>
      
      <h3 class="text-lg font-semibold mb-2">Use License</h3>
      <p class="mb-4">Permission is granted to temporarily access the materials on A Language Story for personal, non-commercial transitory viewing only.</p>
      
      <h3 class="text-lg font-semibold mb-2">User Accounts</h3>
      <p class="mb-4">You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
      
      <h3 class="text-lg font-semibold mb-2">Subscription and Payment</h3>
      <p class="mb-4">Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law.</p>
      
      <h3 class="text-lg font-semibold mb-2">Intellectual Property</h3>
      <p class="mb-4">The content on A Language Story is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without permission.</p>
      
      <h3 class="text-lg font-semibold mb-2">Limitation of Liability</h3>
      <p>A Language Story shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
    `
  },
  'about': {
    title: 'About Us',
    content: `
      <h2 class="text-xl font-bold mb-4">About A Language Story</h2>
      
      <p class="mb-4">A Language Story is a comprehensive language learning platform designed to make learning French, German, and Spanish engaging, effective, and enjoyable.</p>
      
      <h3 class="text-lg font-semibold mb-2">Our Mission</h3>
      <p class="mb-4">We believe that language learning should be accessible, engaging, and culturally rich. Our story-based approach combines traditional language learning methods with modern technology to create an immersive learning experience.</p>
      
      <h3 class="text-lg font-semibold mb-2">Our Approach</h3>
      <ul class="list-disc list-inside mb-4">
        <li>Story-based learning with authentic cultural contexts</li>
        <li>Comprehensive skill development (reading, writing, listening, speaking)</li>
        <li>Interactive exercises and games</li>
        <li>Personalized learning paths</li>
        <li>Progress tracking and achievements</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-2">Our Team</h3>
      <p class="mb-4">Our team consists of experienced language educators, native speakers, and technology experts who are passionate about making language learning accessible to everyone.</p>
      
      <h3 class="text-lg font-semibold mb-2">Join Our Community</h3>
      <p>Start your language learning journey today and become part of our growing community of learners from around the world.</p>
    `
  },
  'contact': {
    title: 'Contact Us',
    content: `
      <h2 class="text-xl font-bold mb-4">Contact A Language Story</h2>
      
      <p class="mb-4">We'd love to hear from you! Get in touch with us for support, feedback, or any questions about our language learning platform.</p>
      
      <h3 class="text-lg font-semibold mb-2">Email Support</h3>
      <p class="mb-4">For general inquiries: <a href="mailto:hello@alanguagestory.com" class="text-blue-600 hover:underline">hello@alanguagestory.com</a></p>
      <p class="mb-4">For technical support: <a href="mailto:support@alanguagestory.com" class="text-blue-600 hover:underline">support@alanguagestory.com</a></p>
      
      <h3 class="text-lg font-semibold mb-2">Business Hours</h3>
      <p class="mb-4">Monday - Friday: 9:00 AM - 6:00 PM (CET)</p>
      <p class="mb-4">Weekend: 10:00 AM - 4:00 PM (CET)</p>
      
      <h3 class="text-lg font-semibold mb-2">Response Time</h3>
      <p class="mb-4">We typically respond to emails within 24 hours during business days.</p>
      
      <h3 class="text-lg font-semibold mb-2">Social Media</h3>
      <p class="mb-4">Follow us on social media for updates, tips, and language learning content:</p>
      <ul class="list-disc list-inside">
        <li>Facebook: @ALanguageStory</li>
        <li>Twitter: @ALanguageStory</li>
        <li>Instagram: @alanguagestory</li>
      </ul>
    `
  },
  'free-resources': {
    title: 'Free Resources',
    content: `
      <h2 class="text-xl font-bold mb-4">Free Language Learning Resources</h2>
      
      <p class="mb-4">Start your language learning journey with our free resources designed to help you build a strong foundation in French, German, and Spanish.</p>
      
      <h3 class="text-lg font-semibold mb-2">Free Trial</h3>
      <p class="mb-4">Try our platform for free with access to:</p>
      <ul class="list-disc list-inside mb-4">
        <li>3 complete stories with audio</li>
        <li>Basic vocabulary exercises</li>
        <li>Progress tracking</li>
        <li>Sample quizzes and games</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-2">Free Downloads</h3>
      <p class="mb-4">Download free resources to support your learning:</p>
      <ul class="list-disc list-inside mb-4">
        <li>Vocabulary flashcards</li>
        <li>Grammar cheat sheets</li>
        <li>Pronunciation guides</li>
        <li>Cultural fact sheets</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-2">Learning Tips</h3>
      <p class="mb-4">Access our blog with tips on:</p>
      <ul class="list-disc list-inside mb-4">
        <li>Effective study techniques</li>
        <li>Cultural insights</li>
        <li>Language learning motivation</li>
        <li>Practice exercises</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-2">Get Started</h3>
      <p>Sign up for a free account to access all these resources and start your language learning journey today!</p>
    `
  },
  'redeem': {
    title: 'Redeem Enrollment Key',
    content: `
      <h2 class="text-xl font-bold mb-4">Redeem Your Enrollment Key</h2>
      
      <p class="mb-4">Have an enrollment key from your school or organization? Redeem it here to access A Language Story.</p>
      
      <h3 class="text-lg font-semibold mb-2">How to Redeem</h3>
      <ol class="list-decimal list-inside mb-4">
        <li>Create a free account or log in to your existing account</li>
        <li>Go to your account settings</li>
        <li>Enter your enrollment key in the designated field</li>
        <li>Click "Redeem" to activate your subscription</li>
      </ol>
      
      <h3 class="text-lg font-semibold mb-2">Enrollment Key Benefits</h3>
      <p class="mb-4">With an enrollment key, you get access to:</p>
      <ul class="list-disc list-inside mb-4">
        <li>Full library of stories and exercises</li>
        <li>Progress tracking and reports</li>
        <li>Teacher dashboard (for educators)</li>
        <li>Classroom management tools</li>
        <li>Priority customer support</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-2">Need Help?</h3>
      <p class="mb-4">If you're having trouble redeeming your key, contact your teacher or administrator, or reach out to our support team.</p>
      
      <h3 class="text-lg font-semibold mb-2">Get Your Key</h3>
      <p>Don't have an enrollment key? Contact your school or organization to get one, or <a href="/pricing" class="text-blue-600 hover:underline">explore our subscription options</a>.</p>
    `
  },
  'shop': {
    title: 'Shopping Area',
    content: `
      <h2 class="text-xl font-bold mb-4">Shopping Area</h2>
      
      <p class="mb-4">Choose the perfect subscription plan for your language learning needs.</p>
      
      <h3 class="text-lg font-semibold mb-2">Individual Plans</h3>
      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 class="font-semibold mb-2">Monthly Plan - €9.99/month</h4>
        <ul class="list-disc list-inside mb-2">
          <li>Access to all stories and exercises</li>
          <li>Progress tracking</li>
          <li>Mobile app access</li>
          <li>Email support</li>
        </ul>
        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Subscribe Monthly</button>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 class="font-semibold mb-2">Annual Plan - €99.99/year (Save 17%)</h4>
        <ul class="list-disc list-inside mb-2">
          <li>All monthly features</li>
          <li>Priority customer support</li>
          <li>Exclusive bonus content</li>
          <li>Free cancellation anytime</li>
        </ul>
        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Subscribe Annually</button>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">School Plans</h3>
      <p class="mb-4">Contact us for custom pricing and features designed specifically for educational institutions.</p>
      
      <h3 class="text-lg font-semibold mb-2">Payment Methods</h3>
      <p class="mb-4">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
      
      <h3 class="text-lg font-semibold mb-2">Money-Back Guarantee</h3>
      <p>Not satisfied? We offer a 30-day money-back guarantee on all subscriptions.</p>
    `
  }
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('school');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState('');

  const openModal = (modalType: string) => {
    setActiveModal(modalType);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveModal('');
  };

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
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); openModal('privacy-policy'); }} 
                    className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); openModal('cookie-policy'); }} 
                    className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); openModal('terms-and-conditions'); }} 
                    className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                  >
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
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); openModal('about'); }} 
                    className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); openModal('contact'); }} 
                    className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); openModal('free-resources'); }} 
                    className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    Free Resources
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="text-gray-600 hover:text-gray-800 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); openModal('redeem'); }} 
                    className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                  >
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
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); openModal('shop'); }} 
                    className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                  >
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalContent[activeModal as keyof typeof modalContent]?.title}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div 
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: modalContent[activeModal as keyof typeof modalContent]?.content || '' 
                }}
              />
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200">
              <Button onClick={closeModal} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
