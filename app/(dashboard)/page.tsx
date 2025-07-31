'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  X,
  Settings,
  Type,
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
  Palette
} from 'lucide-react';
import { Terminal } from './terminal';
import { useState, useEffect } from 'react';

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

// Accessibility Settings Component
function AccessibilityWidget({ 
  settings, 
  setSettings 
}: { 
  settings: {
    fontSize: number;
    contrast: string;
    alignment: string;
    lineSpacing: string;
    colorScheme: string;
  };
  setSettings: React.Dispatch<React.SetStateAction<{
    fontSize: number;
    contrast: string;
    alignment: string;
    lineSpacing: string;
    colorScheme: string;
  }>>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Apply accessibility settings to the document
  useEffect(() => {
    // Prevent hydration mismatch by only running on client side
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Font size
    root.style.setProperty('--accessibility-font-size', `${settings.fontSize}%`);
    
    // Contrast
    if (settings.contrast === 'high') {
      root.style.setProperty('--accessibility-contrast', 'high');
    } else if (settings.contrast === 'low') {
      root.style.setProperty('--accessibility-contrast', 'low');
    } else {
      root.style.setProperty('--accessibility-contrast', 'normal');
    }
    
    // Alignment
    root.style.setProperty('--accessibility-alignment', settings.alignment);
    
    // Line spacing
    root.style.setProperty('--accessibility-line-spacing', settings.lineSpacing);
    
    // Color scheme
    root.style.setProperty('--accessibility-color-scheme', settings.colorScheme);
    
    // Apply CSS custom properties
    document.body.style.fontSize = `calc(1rem * ${settings.fontSize / 100})`;
    
    if (settings.contrast === 'high') {
      document.body.style.filter = 'contrast(1.5)';
    } else if (settings.contrast === 'low') {
      document.body.style.filter = 'contrast(0.8)';
    } else {
      document.body.style.filter = 'none';
    }
    
    if (settings.alignment === 'center') {
      document.body.style.textAlign = 'center';
    } else if (settings.alignment === 'right') {
      document.body.style.textAlign = 'right';
    } else {
      document.body.style.textAlign = 'left';
    }
    
    if (settings.lineSpacing === 'large') {
      document.body.style.lineHeight = '1.8';
    } else if (settings.lineSpacing === 'extra-large') {
      document.body.style.lineHeight = '2.2';
    } else {
      document.body.style.lineHeight = '1.5';
    }
    
    // Color scheme changes
    if (settings.colorScheme === 'high-contrast') {
      // High contrast: black background, white text, high contrast colors
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#ffffff';
      document.body.style.setProperty('--high-contrast-mode', 'true');
      
      // Override specific elements for high contrast
      const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button, li');
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.color = '#ffffff';
          el.style.backgroundColor = el.style.backgroundColor || 'transparent';
        }
      });
      
      // Override cards and sections
      const cards = document.querySelectorAll('.bg-white, .bg-gray-50, .bg-orange-50');
      cards.forEach(card => {
        if (card instanceof HTMLElement) {
          card.style.backgroundColor = '#000000';
          card.style.borderColor = '#ffffff';
        }
      });
      
      // Override footer specifically
      const footer = document.querySelector('footer');
      if (footer instanceof HTMLElement) {
        footer.style.backgroundColor = '#000000';
      }
      
    } else if (settings.colorScheme === 'dark') {
      // Dark mode: dark background, light text
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#ffffff';
      document.body.style.setProperty('--dark-mode', 'true');
      
      // Override specific elements for dark mode
      const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button, li');
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.color = '#ffffff';
        }
      });
      
      // Override cards and sections
      const cards = document.querySelectorAll('.bg-white, .bg-gray-50, .bg-orange-50');
      cards.forEach(card => {
        if (card instanceof HTMLElement) {
          card.style.backgroundColor = '#2d2d2d';
          card.style.borderColor = '#404040';
        }
      });
      
      // Override footer specifically
      const footer = document.querySelector('footer');
      if (footer instanceof HTMLElement) {
        footer.style.backgroundColor = '#1a1a1a';
      }
      
      // Override text colors
      const textElements = document.querySelectorAll('.text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900');
      textElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.color = '#e5e5e5';
        }
      });
      
    } else {
      // Default: reset all custom styles
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.body.style.removeProperty('--high-contrast-mode');
      document.body.style.removeProperty('--dark-mode');
      
      // Reset all elements to their original styles
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.removeProperty('color');
          el.style.removeProperty('background-color');
          el.style.removeProperty('border-color');
        }
      });
      
      // Reset footer specifically
      const footer = document.querySelector('footer');
      if (footer instanceof HTMLElement) {
        footer.style.removeProperty('background-color');
      }
    }
  }, [settings]);

  const resetSettings = () => {
    setSettings({
      fontSize: 100,
      contrast: 'normal',
      alignment: 'left',
      lineSpacing: 'normal',
      colorScheme: 'default',
    });
  };

  // Don't render anything during SSR
  if (!isClient) return null;

  return (
    <>
      {/* Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Accessibility Settings"
      >
        <Settings className="h-6 w-6" />
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className={`fixed bottom-20 right-6 z-50 w-80 rounded-lg shadow-xl border transition-colors ${
          settings.colorScheme === 'high-contrast' 
            ? 'bg-black border-white' 
            : settings.colorScheme === 'dark'
            ? 'bg-gray-800 border-gray-600'
            : 'bg-white border-gray-200'
        }`}>
          <Card className={`${
            settings.colorScheme === 'high-contrast' 
              ? 'bg-black border-white' 
              : settings.colorScheme === 'dark'
              ? 'bg-gray-800 border-gray-600'
              : 'bg-white border-gray-200'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${
                  settings.colorScheme === 'high-contrast' 
                    ? 'text-white' 
                    : settings.colorScheme === 'dark'
                    ? 'text-white'
                    : 'text-gray-900'
                }`}>
                  <Settings className="h-5 w-5" />
                  Accessibility Settings
                </CardTitle>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`transition-colors ${
                    settings.colorScheme === 'high-contrast' 
                      ? 'text-white hover:text-gray-300' 
                      : settings.colorScheme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
                             {/* Font Size */}
               <div>
                 <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${
                   settings.colorScheme === 'high-contrast' 
                     ? 'text-white' 
                     : settings.colorScheme === 'dark'
                     ? 'text-gray-200'
                     : 'text-gray-700'
                 }`}>
                   <Type className="h-4 w-4" />
                   Font Size
                 </label>
                 <div className="flex items-center gap-2">
                   <button
                     onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.max(80, prev.fontSize - 10) }))}
                     className={`p-1 rounded transition-colors ${
                       settings.colorScheme === 'high-contrast' 
                         ? 'hover:bg-gray-800 text-white' 
                         : settings.colorScheme === 'dark'
                         ? 'hover:bg-gray-700 text-gray-200'
                         : 'hover:bg-gray-100 text-gray-700'
                     }`}
                     aria-label="Decrease font size"
                   >
                     <Minus className="h-4 w-4" />
                   </button>
                   <span className={`text-sm font-medium min-w-[3rem] text-center ${
                     settings.colorScheme === 'high-contrast' 
                       ? 'text-white' 
                       : settings.colorScheme === 'dark'
                       ? 'text-gray-200'
                       : 'text-gray-700'
                   }`}>
                     {settings.fontSize}%
                   </span>
                   <button
                     onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.min(200, prev.fontSize + 10) }))}
                     className={`p-1 rounded transition-colors ${
                       settings.colorScheme === 'high-contrast' 
                         ? 'hover:bg-gray-800 text-white' 
                         : settings.colorScheme === 'dark'
                         ? 'hover:bg-gray-700 text-gray-200'
                         : 'hover:bg-gray-100 text-gray-700'
                     }`}
                     aria-label="Increase font size"
                   >
                     <Plus className="h-4 w-4" />
                   </button>
                 </div>
               </div>

                             {/* Contrast */}
               <div>
                 <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${
                   settings.colorScheme === 'high-contrast' 
                     ? 'text-white' 
                     : settings.colorScheme === 'dark'
                     ? 'text-gray-200'
                     : 'text-gray-700'
                 }`}>
                   <Eye className="h-4 w-4" />
                   Contrast
                 </label>
                 <div className="grid grid-cols-3 gap-2">
                   {['low', 'normal', 'high'].map((level) => (
                     <button
                       key={level}
                       onClick={() => setSettings(prev => ({ ...prev, contrast: level }))}
                       className={`px-3 py-1 text-xs rounded transition-colors ${
                         settings.contrast === level
                           ? 'bg-orange-500 text-white'
                           : settings.colorScheme === 'high-contrast'
                           ? 'bg-gray-800 text-white hover:bg-gray-700'
                           : settings.colorScheme === 'dark'
                           ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                       }`}
                     >
                       {level.charAt(0).toUpperCase() + level.slice(1)}
                     </button>
                   ))}
                 </div>
               </div>

                             {/* Text Alignment */}
               <div>
                 <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${
                   settings.colorScheme === 'high-contrast' 
                     ? 'text-white' 
                     : settings.colorScheme === 'dark'
                     ? 'text-gray-200'
                     : 'text-gray-700'
                 }`}>
                   <AlignLeft className="h-4 w-4" />
                   Text Alignment
                 </label>
                 <div className="flex gap-2">
                   {[
                     { value: 'left', icon: AlignLeft },
                     { value: 'center', icon: AlignCenter },
                     { value: 'right', icon: AlignRight }
                   ].map(({ value, icon: Icon }) => (
                     <button
                       key={value}
                       onClick={() => setSettings(prev => ({ ...prev, alignment: value }))}
                       className={`p-2 rounded transition-colors ${
                         settings.alignment === value
                           ? 'bg-orange-500 text-white'
                           : settings.colorScheme === 'high-contrast'
                           ? 'bg-gray-800 text-white hover:bg-gray-700'
                           : settings.colorScheme === 'dark'
                           ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                       }`}
                       aria-label={`Align text ${value}`}
                     >
                       <Icon className="h-4 w-4" />
                     </button>
                   ))}
                 </div>
               </div>

                             {/* Line Spacing */}
               <div>
                 <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${
                   settings.colorScheme === 'high-contrast' 
                     ? 'text-white' 
                     : settings.colorScheme === 'dark'
                     ? 'text-gray-200'
                     : 'text-gray-700'
                 }`}>
                   <Type className="h-4 w-4" />
                   Line Spacing
                 </label>
                 <div className="grid grid-cols-3 gap-2">
                   {[
                     { value: 'normal', label: 'Normal' },
                     { value: 'large', label: 'Large' },
                     { value: 'extra-large', label: 'Extra Large' }
                   ].map(({ value, label }) => (
                     <button
                       key={value}
                       onClick={() => setSettings(prev => ({ ...prev, lineSpacing: value }))}
                       className={`px-3 py-1 text-xs rounded transition-colors ${
                         settings.lineSpacing === value
                           ? 'bg-orange-500 text-white'
                           : settings.colorScheme === 'high-contrast'
                           ? 'bg-gray-800 text-white hover:bg-gray-700'
                           : settings.colorScheme === 'dark'
                           ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                       }`}
                     >
                       {label}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Color Scheme */}
               <div>
                 <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${
                   settings.colorScheme === 'high-contrast' 
                     ? 'text-white' 
                     : settings.colorScheme === 'dark'
                     ? 'text-gray-200'
                     : 'text-gray-700'
                 }`}>
                   <Palette className="h-4 w-4" />
                   Color Scheme
                 </label>
                 <div className="grid grid-cols-3 gap-2">
                   {[
                     { value: 'default', label: 'Default' },
                     { value: 'high-contrast', label: 'High Contrast' },
                     { value: 'dark', label: 'Dark' }
                   ].map(({ value, label }) => (
                     <button
                       key={value}
                       onClick={() => setSettings(prev => ({ ...prev, colorScheme: value }))}
                       className={`px-3 py-1 text-xs rounded transition-colors ${
                         settings.colorScheme === value
                           ? 'bg-orange-500 text-white'
                           : settings.colorScheme === 'high-contrast'
                           ? 'bg-gray-800 text-white hover:bg-gray-700'
                           : settings.colorScheme === 'dark'
                           ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                       }`}
                     >
                       {label}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Reset Button */}
               <div className={`pt-2 border-t transition-colors ${
                 settings.colorScheme === 'high-contrast' 
                   ? 'border-white' 
                   : settings.colorScheme === 'dark'
                   ? 'border-gray-600'
                   : 'border-gray-200'
               }`}>
                 <button
                   onClick={resetSettings}
                   className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                     settings.colorScheme === 'high-contrast'
                       ? 'text-white bg-gray-800 hover:bg-gray-700'
                       : settings.colorScheme === 'dark'
                       ? 'text-gray-200 bg-gray-700 hover:bg-gray-600'
                       : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                   }`}
                 >
                   Reset to Default
                 </button>
               </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Consent Preferences Component
function ConsentPreferences() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false
  });

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const savePreferences = () => {
    // Save preferences to localStorage
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    setIsOpen(false);
  };

  const acceptAll = () => {
    setPreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    });
    localStorage.setItem('cookie-preferences', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    }));
    setIsOpen(false);
  };

  // Don't render anything during SSR
  if (!isClient) return null;

  return (
    <>
      {/* Consent Preferences Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-20 z-40 w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg"
        aria-label="Cookie preferences"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </button>

      {/* Consent Preferences Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Cookie Preferences
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies.
              </p>

              {/* Necessary Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Necessary Cookies</h3>
                  <div className="w-12 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-600">Always</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies are essential for the website to function properly and cannot be disabled.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Marketing Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies are used to track visitors across websites to display relevant and engaging advertisements.
                </p>
              </div>

              {/* Preferences Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Preferences Cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={(e) => setPreferences(prev => ({ ...prev, preferences: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies allow the website to remember choices you make and provide enhanced, more personal features.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200">
              <button
                onClick={savePreferences}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('school');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState('');
  
  // Accessibility settings state
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    fontSize: 100, // percentage
    contrast: 'normal', // low, normal, high
    alignment: 'left', // left, center, right
    lineSpacing: 'normal', // normal, large, extra-large
    colorScheme: 'default', // default, high-contrast, dark
  });

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
                  <button
                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-lg font-medium transition-all px-6 py-3 border-2 ${
                      accessibilitySettings.colorScheme === 'high-contrast'
                        ? 'bg-white text-black border-white hover:bg-gray-100'
                        : accessibilitySettings.colorScheme === 'dark'
                        ? 'bg-white text-gray-900 border-white hover:bg-gray-100'
                        : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
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
      <section id="learning-resources" className="py-16 bg-gray-50">
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
      <section id="pricing" className="py-16 bg-white">
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
            <div className={`p-1 rounded-lg transition-colors ${
              accessibilitySettings.colorScheme === 'high-contrast' 
                ? 'bg-gray-800' 
                : accessibilitySettings.colorScheme === 'dark'
                ? 'bg-gray-700'
                : 'bg-gray-100'
            }`}>
              <button 
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'school' 
                    ? accessibilitySettings.colorScheme === 'high-contrast'
                      ? 'bg-white text-black shadow-sm'
                      : accessibilitySettings.colorScheme === 'dark'
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'bg-white text-gray-900 shadow-sm'
                    : accessibilitySettings.colorScheme === 'high-contrast'
                    ? 'text-white hover:text-gray-300'
                    : accessibilitySettings.colorScheme === 'dark'
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('school')}
              >
                School Plans
              </button>
              <button 
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'individual' 
                    ? accessibilitySettings.colorScheme === 'high-contrast'
                      ? 'bg-white text-black shadow-sm'
                      : accessibilitySettings.colorScheme === 'dark'
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'bg-white text-gray-900 shadow-sm'
                    : accessibilitySettings.colorScheme === 'high-contrast'
                    ? 'text-white hover:text-gray-300'
                    : accessibilitySettings.colorScheme === 'dark'
                    ? 'text-gray-300 hover:text-white'
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
                <button
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-lg font-medium transition-all px-6 py-3 border-2 ${
                    accessibilitySettings.colorScheme === 'high-contrast'
                      ? 'bg-white text-black border-white hover:bg-gray-100'
                      : accessibilitySettings.colorScheme === 'dark'
                      ? 'bg-white text-gray-900 border-white hover:bg-gray-100'
                      : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Start Free Trial
                  <ArrowRight className="ml-3 h-6 w-6" />
                </button>
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
              <p className="text-gray-600 leading-relaxed">
                A Language Story focusses on developing language skills in all four 
                disciplines – Writing, Reading, Listening and Speaking. Each story 
                is accompanied with a set of resources, which can be accessed in 
                the classroom or at home.
              </p>
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

      {/* Accessibility Widget */}
      <AccessibilityWidget settings={accessibilitySettings} setSettings={setAccessibilitySettings} />
      {/* Consent Preferences Component */}
      <ConsentPreferences />
    </main>
  );
}
