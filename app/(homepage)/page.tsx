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
import { FlagIcon } from '@/components/ui/flag-icon';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { QuizTeaserModal } from '@/components/quiz-teaser-modal';
import { VocabTeaserModal } from '@/components/vocab-teaser-modal';
import { StoryTeaserModal } from '@/components/story-teaser-modal';

// Modal content data
const modalContent = {
  'privacy-policy': {
    title: 'Privacy Policy',
    content: `
      <h2 class="text-xl font-bold mb-4">Privacy Policy</h2>
      
      <h3 class="text-lg font-semibold mb-2">Who we are</h3>
      <p class="mb-4">Our website address is: <a href="https://www.lingoletics.com" class="text-orange-600 hover:underline">https://www.lingoletics.com</a></p>
      <div class="mb-4">
        <p class="font-semibold">Post:</p>
        <p class="mb-2">30 Tithe Barn Road, Stafford, England, ST16 3PH, GB</p>
        <p class="font-semibold">Email:</p>
        <p>info@lingoletics.com</p>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">Comments</h3>
      <p class="mb-4">When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor's IP address and browser user agent string to help spam detection. An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. After approval of your comment, your profile picture is visible to the public in the context of your comment.</p>
      
      <h3 class="text-lg font-semibold mb-2">Media</h3>
      <p class="mb-4">If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.</p>
      
      <h3 class="text-lg font-semibold mb-2">Cookies</h3>
      <p class="mb-4">If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.</p>
      <p class="mb-4">If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.</p>
      <p class="mb-4">When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed.</p>
      
      <h3 class="text-lg font-semibold mb-2">Embedded content from other websites</h3>
      <p class="mb-4">Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website. These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content.</p>
      
      <h3 class="text-lg font-semibold mb-2">How long we retain your data</h3>
      <p class="mb-4">If you leave a comment, the comment and its metadata are retained indefinitely. For users that register on our website, we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username).</p>
      
      <h3 class="text-lg font-semibold mb-2">What rights you have over your data</h3>
      <p class="mb-4">If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.</p>
      
      <h3 class="text-lg font-semibold mb-2">Where your data is sent</h3>
      <p>Visitor comments may be checked through an automated spam detection service.</p>
    `
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    content: `
      <h2 class="text-xl font-bold mb-4">Cookie Policy</h2>
      
      <h3 class="text-lg font-semibold mb-2">About this cookie policy</h3>
      <p class="mb-4">This Cookie Policy explains what cookies are and how we use them, the types of cookies we use i.e, the information we collect using cookies and how that information is used, and how to control the cookie preferences. For further information on how we use, store, and keep your personal data secure, see our Privacy Policy.</p>
      <p class="mb-4">You can at any time change or withdraw your consent from the Cookie Declaration on our website. Learn more about who we are, how you can contact us, and how we process personal data in our Privacy Policy.</p>
      <p class="mb-4">Your consent applies to the following domains: <span class="font-medium">lingoletics.com</span></p>
      
      <h3 class="text-lg font-semibold mb-2">What are cookies?</h3>
      <p class="mb-4">Cookies are small text files that are used to store small pieces of information. They are stored on your device when the website is loaded on your browser. These cookies help us make the website function properly, make it more secure, provide better user experience, and understand how the website performs and to analyze what works and where it needs improvement.</p>
      
      <h3 class="text-lg font-semibold mb-2">How do we use cookies?</h3>
      <p class="mb-4">As most of the online services, our website uses first-party and third-party cookies for several purposes. First-party cookies are mostly necessary for the website to function the right way, and they do not collect any of your personally identifiable data.</p>
      <p class="mb-4">The third-party cookies used on our website are mainly for understanding how the website performs, how you interact with our website, keeping our services secure, providing advertisements that are relevant to you, and all in all providing you with a better and improved user experience and help speed up your future interactions with our website.</p>
      
      <h3 class="text-lg font-semibold mb-2">What types of cookies do we use?</h3>
      <div class="mb-4">
        <p class="font-semibold mb-2">Essential:</p>
        <p class="mb-4">Some cookies are essential for you to be able to experience the full functionality of our site. They allow us to maintain user sessions and prevent any security threats. They do not collect or store any personal information. For example, these cookies allow you to log-in to your account and add products to your basket, and checkout securely.</p>
        
        <p class="font-semibold mb-2">Statistics:</p>
        <p class="mb-4">These cookies store information like the number of visitors to the website, the number of unique visitors, which pages of the website have been visited, the source of the visit, etc. These data help us understand and analyze how well the website performs and where it needs improvement.</p>
        
        <p class="font-semibold mb-2">Marketing:</p>
        <p class="mb-4">Our website displays advertisements. These cookies are used to personalize the advertisements that we show to you so that they are meaningful to you. These cookies also help us keep track of the efficiency of these ad campaigns. The information stored in these cookies may also be used by the third-party ad providers to show you ads on other websites on the browser as well.</p>
        
        <p class="font-semibold mb-2">Functional:</p>
        <p class="mb-4">These are the cookies that help certain non-essential functionalities on our website. These functionalities include embedding content like videos or sharing content of the website on social media platforms.</p>
        
        <p class="font-semibold mb-2">Preferences:</p>
        <p class="mb-4">These cookies help us store your settings and browsing preferences like language preferences so that you have a better and efficient experience on future visits to the website.</p>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">How can I control the cookie preferences?</h3>
      <p class="mb-4">Should you decide to change your preferences later through your browsing session, you can click on the "Manage consent" tab on your screen. This will display the consent notice again enabling you to change your preferences or withdraw your consent entirely.</p>
      <p class="mb-4">In addition to this, different browsers provide different methods to block and delete cookies used by websites. You can change the settings of your browser to block/delete the cookies. To find out more about how to manage and delete cookies, visit <a href="http://www.allaboutcookies.org" class="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a>.</p>
    `
  },
  'terms-and-conditions': {
    title: 'Terms and Conditions',
    content: `
      <h2 class="text-xl font-bold mb-4">Terms and Conditions</h2>
      
      <h3 class="text-lg font-semibold mb-2">Using the materials on Lingoletics.com</h3>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Material from Lingoletics.com may not be copied, reproduced, republished, downloaded, posted, broadcast, or transmitted in any way, except for your own use as a teacher and that of your pupils within your own educational establishment.</li>
        <li>Any other use requires the prior written permission of Lingoletics.com</li>
        <li>The illustrations on the site are the legal property of Lingoletics.com and cannot be copied or reproduced in any way.</li>
        <li>You agree not to adapt or alter any of the material contained in this site or use it for any purpose other than your personal, non-commercial use.</li>
        <li>Copies of this site should not be used for any promotional, administrative, or commercial purposes of the educational establishment.</li>
        <li>If you register as an individual tutor, you will only be permitted to access and use the site with your own private pupils. Failure to comply will lead to your login details to become invalid.</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-2">Legal</h3>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>You agree to use this site only for lawful purposes, and in a manner that does not infringe the rights of any third party.</li>
        <li>If any of these Terms and Conditions should be determined to be illegal, invalid or otherwise unenforceable by reason of the laws of any state or country in which these Terms and Conditions are intended to be effective, then to the extent and within the jurisdiction which that Term or Condition is illegal, invalid or unenforceable, it shall be severed and deleted from this clause and the remaining terms and conditions shall survive, remain in full force and effect and continue to be binding and enforceable.</li>
        <li>These Terms and Conditions shall be governed by and construed in accordance with the laws of England and Wales. Disputes arising here from shall be exclusively subject to the jurisdiction of the courts of England and Wales.</li>
        <li>If these Terms and Conditions are not accepted in full, you do not have permission to access the contents of this website and therefore should cease using this website immediately.</li>
        <li>Use of this site constitutes your acceptance of these terms and conditions, from your first visit to this site.</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-2">Cancellation</h3>
      <div class="mb-4">
        <p class="mb-2"><strong>7 day cooling off period:</strong> In accordance with the above law, you have a 7 day 'cooling off period' in which you have the right to cancel your purchase and receive a refund. You do not need to give a reason for cancelling your purchase. Should you choose to cancel, we will refund your payment within 30 days of your cancellation.</p>
        <p class="mb-2">Should you wish to cancel your purchase within the 7 days' cooling off' period, please email us at <a href="mailto:info@lingoletics.com" class="text-orange-600 hover:underline">info@lingoletics.com</a> or write to us at the following address:</p>
        <div class="ml-4 mb-2">
          <p>Lingoletics.com</p>
          <p>30 Tithe Barn Road, Stafford, ST163PH</p>
        </div>
        <p class="mb-2">Should you cancel your purchase within this 7 day 'cooling off' period, we will refund your payment. If you paid by credit or with debit card from this website, your refund will be made directly to your credit or debit card within 30 days of your cancellation.</p>
        <p class="mb-2"><strong>Conditions of the refund:</strong> In the case of the request for a refund, Lingoletics.com reserves the right to track usage by an individual (through his/her own unique code) of specific pages visited, frequency of use, and time of use. No refund will be granted if Lingoletics.com has cause to believe that an individual has undertaken significant usage of the resource OR has printed off selected material.</p>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">Payments</h3>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Buying a school licence will entitle you to use Lingoletics.com with a limit on the number of teachers or pupils accessing it, depending on the subscription. Usage must remain only within your educational establishment. Failure to comply will lead to the educational establishment login to become invalid.</li>
        <li>The fee is valid for a year. You will be sent a reminder a month before your registration expires.</li>
        <li>You will be sent a confirmation of your received payment.</li>
        <li>Due to the nature of our product(s) and service(s), our refund policy is such that each individual refund request will be considered on a case-by-case basis.</li>
        <li>Refunds will only be given at the discretion of the Company Management.</li>
      </ul>
    `
  },
  'about': {
    title: 'About Us',
    content: `
      <h2 class="text-xl font-bold mb-4">About Us</h2>
      
      <h3 class="text-lg font-semibold mb-2">The roots of Lingoletics.com</h3>
      <p class="mb-4">Let me tell you about us and where the roots of Lingoletics.com began.</p>
      
      <p class="mb-4">About 20 years ago, I left London on a train with a rucksack full of jeans samples and headed to Europe. The plan was to start up a European clothing wholesale business for a friend of mine. The first stop was Amsterdam, and then I travelled on to Hamburg. Within a year I had visited most major cities in Germany, The Netherlands, Denmark, Sweden, and Switzerland.</p>
      
      <p class="mb-4">I then spent several years based in Köln, travelling around to visit the customers I had found. Many of them became good friends over the years. Looking back, it was without doubt the best time of my life. However, at the time I don't think I released the profound effect the time was going to have on my life. The experiences I had and the friends I made were going to stay with me for a very long time.</p>
      
      <p class="mb-4">Following the business years, I decided I needed a big change and became a secondary school teacher. I have been teaching German and French for over 10 years now and of course my time abroad is reflected in my teaching constantly. Stories from Berlin and Hamburg, of friends at Lake Konstanz and of travelling experiences all around Europe, I hope to inspire and enthuse pupils about the joy of language learning.</p>
      
      <p class="mb-4">Lingoletics.com has been a long journey, with the initial idea coming to me whilst on holiday in Brazil. The concept has changed a lot over the years, was cast aside a few times, stored in jar for a while, until now. Finally, it has all come together and is ready to blossom and grow.</p>
      
      <p class="mb-4">The collection of stories is a personal collection in many ways, drawing on real events and experiences, but moulded to give it a purpose, which is ultimately to help people develop their language skills and their confidence in understanding and using a foreign language.</p>
      
      <p class="mb-4">Proven by much educational research, reading is essential to language acquisition, but the problem for foreign language learners is that authentic literature is nearly always too difficult for a beginner, which can be time consuming, off putting and just plain too difficult. My stories are linked to the UK curriculum and cover typical topics which are used in schools. This means pupils can recognise a lot of vocabulary and quickly gain confidence that they understand the language.</p>
      
      <p class="mb-4">Unveiling the essence of Lingoletics.com, these narratives draw inspiration from my extensive travels across Germany, France, Spain, and beyond, weaving tales of the friends I encountered and the adventures that unfolded.</p>
      
      <p class="mb-4">Each story incorporates essential vocabulary taught in language classrooms across the world, serving as a powerful resource for both educators and learners.</p>
      
      <p class="mb-4">The stories and accompanying teaching and learning materials, offer a versatile toolkit to reinforce classroom learning or seamlessly integrate with existing curricula.</p>
      
      <p class="mb-4">Immerse yourself in our stories, which are invaluable for activities such as engaging read-outs, comprehensive listening exercises, dynamic grammar drills, and much more.</p>
      
      <p class="mb-4"><strong>Elevate language education with Lingoletics.com—a fusion of adventure, culture, and linguistic enrichment!</strong></p>
      
      <h3 class="text-lg font-semibold mb-2">Language Learning Hub for Everyone</h3>
      <p class="mb-4">Whether you want to learn a language as an individual or want to enroll bulk number of students to our courses, we have the solution.</p>
      
      <p class="mb-4"><strong>School Subscriptions:</strong> Purchase a subscription as a school admin where you get bulk number of seats and can enroll students, and teachers and access progress reports of students.</p>
      
      <p class="mb-4"><strong>Individual Subscriptions:</strong> Individual subscriptions allow one user access to courses they have subscribed. If you want access for more than one user, you have to add required number of copies of subscription.</p>
      
      <p class="mb-4">Lingoletics.com focusses on developing language skills in all four disciplines – Writing, Reading, Listening and Speaking. Each story is accompanied with a set of resources, which can be accessed in the classroom or at home.</p>
    `
  },
  'contact': {
    title: 'Contact Us',
    content: `
      <h2 class="text-xl font-bold mb-4">Contact Lingoletics.com</h2>
      
      <p class="mb-4">We'd love to hear from you! Get in touch with us for support, feedback, or any questions about our language learning platform.</p>
      
      <h3 class="text-lg font-semibold mb-2">Email Support</h3>
      <p class="mb-4">For general inquiries: <a href="mailto:hello@lingoletics.com" class="text-blue-600 hover:underline">hello@lingoletics.com</a></p>
      <p class="mb-4">For technical support: <a href="mailto:support@lingoletics.com" class="text-blue-600 hover:underline">support@lingoletics.com</a></p>
      
      <h3 class="text-lg font-semibold mb-2">Business Hours</h3>
      <p class="mb-4">Monday - Friday: 9:00 AM - 6:00 PM (CET)</p>
      <p class="mb-4">Weekend: 10:00 AM - 4:00 PM (CET)</p>
      
      <h3 class="text-lg font-semibold mb-2">Response Time</h3>
      <p class="mb-4">We typically respond to emails within 24 hours during business days.</p>
      
      <h3 class="text-lg font-semibold mb-2">Social Media</h3>
      <p class="mb-4">Follow us on social media for updates, tips, and language learning content:</p>
      <ul class="list-disc list-inside">
        <li>Facebook: <a href="https://www.facebook.com/profile.php?id=61584398676517" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">@Lingoletics</a></li>
        <li>Instagram: <a href="https://www.instagram.com/lingoletics" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">@lingoletics</a></li>
        <li>LinkedIn: <a href="https://www.linkedin.com/in/lingo-letics-a1901b393/" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Lingoletics</a></li>
        <li>TikTok: <a href="https://www.tiktok.com/@lingoletics" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">@lingoletics</a></li>
      </ul>
    `
  },
  'free-resources': {
    title: 'Free Resources',
    content: `
      <h2 class="text-xl font-bold mb-4">Free Resources</h2>
      
      <p class="mb-4"><strong>As well as our amazing stories, we are building a library of useful FREE resources in German, French and Spanish for your classroom or to use at home.</strong></p>
      
      <p class="mb-4">We believe that reading short stories is a key part of second language acquisition and will motivate learners to improve their language skills.</p>
      
      <p class="mb-4">Language learners will be enthused, with fun comprehension games and activities and inspired by the cultural references about the places our characters visit.</p>
      
      <p class="mb-4">Teachers have an almost endless resource with our collection of short stories, as there are so many ways to use the texts and activities, depending on the style of activity required, the size of the class, homework, classwork, consolidation or retrieval.</p>
      
      <p class="mb-4">Of course, teachers also have Schemes of Work to follow, and we want to try and help with that as well. Click on the icons below to find an ever growing range of useful FREE MFL resources for you to use in your general everyday lessons.</p>
      
      <div class="mt-6 space-y-4">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 class="text-lg font-semibold mb-2 text-blue-800">🇩🇪 Free German Resources</h3>
          <p class="text-blue-700">Click here to view FREE German resources for your classroom and home learning.</p>
        </div>
        
        <div class="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 class="text-lg font-semibold mb-2 text-red-800">🇫🇷 Free French Resources</h3>
          <p class="text-red-700">Click here to view FREE French resources for your classroom and home learning.</p>
        </div>
        
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 class="text-lg font-semibold mb-2 text-yellow-800">🇪🇸 Free Spanish Resources</h3>
          <p class="text-yellow-700">Click here to view FREE Spanish resources for your classroom and home learning.</p>
        </div>
      </div>
      
      <div class="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 class="text-lg font-semibold mb-2">What's Included</h3>
        <ul class="list-disc list-inside space-y-1 text-gray-700">
          <li>Curriculum-linked resources for all levels</li>
          <li>Schemes of Work support materials</li>
          <li>Classroom activities and homework exercises</li>
          <li>Consolidation and retrieval practice</li>
          <li>Cultural reference materials</li>
          <li>Comprehension games and activities</li>
        </ul>
      </div>
      
      <p class="mt-4 text-center text-gray-600">Start exploring our free resources today and enhance your language learning experience!</p>
    `
  },
  'redeem': {
    title: 'Redeem Enrollment Key',
    content: `
      <h2 class="text-xl font-bold mb-4">Redeem Your Enrollment Key</h2>
      
      <p class="mb-4">Have an enrollment key from your school or organization? Redeem it here to access Lingoletics.com.</p>
      
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
      
      <p class="mb-6">Choose the perfect subscription plan for your language learning needs. Access all short stories and teaching resources across French, German, and Spanish. All plans include a <strong>14-day free trial</strong>.</p>
      
      <h3 class="text-lg font-semibold mb-4 text-orange-600">Individual Plans</h3>
      <p class="text-sm text-gray-600 mb-3">Perfect for individual learners, parents, and families.</p>
      
      <div class="bg-gray-50 p-4 rounded-lg mb-3">
        <h4 class="font-semibold mb-2">Monthly – £7.99/month</h4>
        <ul class="list-disc list-inside mb-3 text-sm">
          <li>All stories in French, German & Spanish</li>
          <li>Games, quizzes & vocabulary exercises</li>
          <li>Audio narration • Cancel anytime</li>
        </ul>
        <a href="/pricing" class="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm">Start Free Trial</a>
      </div>
      
      <div class="bg-orange-50 border-2 border-orange-300 p-4 rounded-lg mb-3 relative pt-8">
        <div class="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">BEST VALUE</div>
        <h4 class="font-semibold mb-2">Quarterly – £19.99/3 months</h4>
        <ul class="list-disc list-inside mb-3 text-sm">
          <li>All stories in French, German & Spanish</li>
          <li>Games, quizzes & vocabulary exercises</li>
          <li>Audio narration • Progress tracking • Cancel anytime</li>
        </ul>
        <a href="/pricing" class="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm">Start Free Trial</a>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 class="font-semibold mb-2">Yearly – £49.99/year</h4>
        <ul class="list-disc list-inside mb-3 text-sm">
          <li>All stories in French, German & Spanish</li>
          <li>Games, quizzes & vocabulary exercises</li>
          <li>Audio narration • Cancel anytime</li>
        </ul>
        <a href="/pricing" class="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm">Start Free Trial</a>
      </div>
      
      <h3 class="text-lg font-semibold mb-4 text-orange-600">Institutional Plans</h3>
      <p class="text-sm text-gray-600 mb-3">For schools, language centres, and educational institutions.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="inline-block bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-bold mb-2">SMALL</div>
          <h4 class="font-semibold mb-1">Small School Plan</h4>
          <p class="text-xs text-gray-500 mb-2">Ideal for small schools & tutoring centres</p>
          <p class="font-bold text-lg mb-2">from £24.99<span class="text-xs font-normal text-gray-500"> / month</span></p>
          <ul class="text-xs text-gray-600 mb-3">
            <li>• All stories, games & teaching resources</li>
            <li>• Student login management</li>
            <li>• Progress tracking</li>
            <li>• Also available quarterly (£69.99) & yearly (£249.00)</li>
          </ul>
          <a href="/pricing" class="inline-block border-2 border-orange-500 text-orange-600 px-4 py-1.5 rounded-lg hover:bg-orange-50 text-sm font-semibold">Start Free Trial</a>
        </div>
        
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg relative pt-8">
          <div class="absolute top-2 right-2 bg-yellow-400 text-orange-900 px-2 py-0.5 rounded text-xs font-bold">PROFESSIONAL</div>
          <h4 class="font-semibold mb-1">Professional Plan</h4>
          <p class="text-xs text-orange-100 mb-2">For larger schools & institutions</p>
          <p class="font-bold text-lg mb-2">from £59.99<span class="text-xs font-normal text-orange-200"> / month</span></p>
          <ul class="text-xs text-orange-100 mb-3">
            <li>• Everything in Small, plus:</li>
            <li>• Unlimited student & staff logins</li>
            <li>• Advanced analytics & reporting</li>
            <li>• Also available quarterly (£149.99) & yearly (£499.00)</li>
          </ul>
          <a href="/pricing" class="inline-block bg-white text-orange-600 px-4 py-1.5 rounded-lg hover:bg-orange-50 text-sm font-semibold">Start Free Trial</a>
        </div>
      </div>
      
      <div class="bg-gray-100 p-4 rounded-lg">
        <h3 class="text-sm font-semibold mb-2">Need Help?</h3>
        <p class="text-sm mb-3">Contact us for custom pricing and features designed specifically for your institution.</p>
        <p class="text-xs text-gray-600">We accept all major credit cards. 14-day free trial available for all plans.</p>
      </div>
    `
  }
};

// Contact Form Component
function ContactFormComponent() {
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConsentChecked) {
      setSubmitStatus({
        type: 'error',
        message: 'Please provide consent to proceed.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          consent: isConsentChecked
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message
        });
        // Reset form
        setFormData({ name: '', email: '', message: '' });
        setIsConsentChecked(false);
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 lg:mt-0">
      <div className="bg-gray-50 p-6 rounded-lg max-w-md ml-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
        
        {/* Status Messages */}
        {submitStatus.type && (
          <div className={`mb-4 p-4 rounded-lg ${
            submitStatus.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {submitStatus.type === 'success' ? (
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <p className="font-medium text-sm">Message sent successfully!</p>
                  <p className="text-sm mt-1">{submitStatus.message}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <p className="text-sm">{submitStatus.message}</p>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="How can we help you?"
            ></textarea>
          </div>
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              checked={isConsentChecked}
              onChange={(e) => setIsConsentChecked(e.target.checked)}
              disabled={isSubmitting}
              className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded disabled:cursor-not-allowed"
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              I am aware that my data will be digitally stored and used for the purpose of contact and communication with this platform.
            </label>
          </div>
          <button
            type="submit"
            disabled={!isConsentChecked || isSubmitting}
            className={`w-full font-medium py-2 px-4 rounded-lg transition-colors ${
              isConsentChecked && !isSubmitting
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

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
  const [quizTeaserOpen, setQuizTeaserOpen] = useState(false);
  const [quizTeaserType, setQuizTeaserType] = useState<'true_false' | 'multiple_choice' | 'gap_fill'>('true_false');
  const [vocabTeaserOpen, setVocabTeaserOpen] = useState(false);
  const [vocabTeaserLanguage, setVocabTeaserLanguage] = useState<'spanish' | 'german' | 'french'>('spanish');
  const [storyTeaserOpen, setStoryTeaserOpen] = useState(false);
  const [storyTeaserLanguage, setStoryTeaserLanguage] = useState<'spanish' | 'german' | 'french'>('spanish');


  const openQuizTeaser = (type: 'true_false' | 'multiple_choice' | 'gap_fill') => {
    setQuizTeaserType(type);
    setQuizTeaserOpen(true);
  };

  const openVocabTeaser = (language: 'spanish' | 'german' | 'french') => {
    setVocabTeaserLanguage(language);
    setVocabTeaserOpen(true);
  };

  const openStoryTeaser = (language: 'spanish' | 'german' | 'french') => {
    setStoryTeaserLanguage(language);
    setStoryTeaserOpen(true);
  };

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
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl md:text-5xl">
                Improve GCSE French, German and Spanish
                <span className="block text-orange-500">Through Story-Based Reading</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Levelled short stories with audio, quizzes and gamified practice &mdash; built by a teacher for UK secondary MFL departments.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:max-w-lg sm:mx-auto lg:mx-0 lg:text-left sm:text-center">
                <a href="/sign-up">
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-lg font-medium transition-all px-6 py-3 bg-orange-500 text-white hover:bg-orange-600">
                    Start Your 14-Day Free Trial
                    <ArrowRight className="ml-1 h-5 w-5" />
                  </button>
                </a>
                <a href="#how-it-works">
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-lg font-medium transition-all px-6 py-3 border-2 border-gray-300 text-gray-900 bg-white hover:bg-gray-50">
                    See How It Works
                  </button>
                </a>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative w-full">
                <Image
                  src="/lingoletics-team.png"
                  alt="Lingoletics Team"
                  width={600}
                  height={400}
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="w-full h-auto object-contain rounded-lg shadow-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="py-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 font-medium text-sm uppercase tracking-wide">Trusted by MFL teachers across the UK</p>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              The Challenges Facing MFL Departments
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Sound familiar? These are the problems teachers tell us about every day.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Pupils rarely read independently in the target language</h3>
              <p className="text-sm text-gray-500">Authentic literature is too hard; simplified texts feel dull.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Low motivation and engagement in lessons</h3>
              <p className="text-sm text-gray-500">Traditional drills don&apos;t excite pupils or build real confidence.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Limited time for reading and listening practice</h3>
              <p className="text-sm text-gray-500">Curriculum time is shrinking but expectations keep rising.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Vocabulary retention drops between lessons</h3>
              <p className="text-sm text-gray-500">Without regular reinforcement, learning doesn&apos;t stick.</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <p className="text-lg font-semibold text-gray-900">
              Lingoletics was built to solve exactly these problems.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-md text-white icon-bg-blue">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">
                  Builds Extended Reading Confidence
                </h2>
              </div>
              <p className="mt-4 text-base text-gray-500 sm:text-xl lg:text-lg xl:text-xl">
                Levelled short stories with curriculum-mapped topics help pupils read 
                independently in French, German, and Spanish &mdash; building fluency 
                and confidence with every page.
              </p>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-md text-white icon-bg-blue">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">
                  Supports GCSE Writing &amp; Speaking Quality
                </h2>
              </div>
              <p className="mt-4 text-base text-gray-500 sm:text-xl lg:text-lg xl:text-xl">
                Stories expose pupils to natural sentence patterns, key vocabulary, and 
                grammar in context &mdash; improving the quality of their own written 
                and spoken output.
              </p>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-md text-white icon-bg-blue">
                  <Headphones className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">
                  Develops Listening Stamina &amp; Comprehension
                </h2>
              </div>
              <p className="mt-4 text-base text-gray-500 sm:text-xl lg:text-lg xl:text-xl">
                Every story includes native-speaker audio, giving pupils regular 
                listening practice that builds stamina for the GCSE listening exam.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Alignment Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Designed Around What Schools Actually Need
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every story and exercise is aligned to the UK secondary curriculum, so you can trust it fits your teaching.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">GCSE Aligned</span>
            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">CEFR A1 &ndash; B2</span>
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">Curriculum-Mapped Topics</span>
            <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">KS3 &amp; KS4</span>
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">AQA &middot; Edexcel &middot; OCR</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-gray-700">Topics mapped to AQA, Edexcel and OCR GCSE specifications</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-gray-700">Stories levelled from A1 to B2 (CEFR)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-gray-700">Supports retrieval practice and spaced repetition</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-gray-700">Develops spontaneous vocabulary recall</p>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Teachers Section */}
      <section id="why-choose-us" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Built to Save Teachers Time and Boost Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to run engaging MFL lessons &mdash; without the prep
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready-to-use lesson content</h3>
              <p className="text-gray-600 text-sm">Stories, quizzes and games aligned to your curriculum &mdash; no prep needed.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Automatic progress tracking</h3>
              <p className="text-gray-600 text-sm">See how every pupil is performing across all your classes at a glance.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Differentiated for mixed-ability</h3>
              <p className="text-gray-600 text-sm">Stories levelled from A1 to B2, so every pupil works at the right challenge.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pupils stay engaged</h3>
              <p className="text-gray-600 text-sm">Gamified quizzes, vocabulary games and achievement tracking keep motivation high.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <a href="/sign-up">
              <button className="bg-orange-500 text-white font-bold text-lg px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                Try It Free for 14 Days
              </button>
            </a>
            <p className="text-sm text-gray-500 mt-3">Completely free &mdash; no credit card required for trial</p>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              What Teachers Are Saying
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hear from MFL teachers who use Lingoletics in their classrooms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-4">&ldquo;My Year 9 pupils are actually asking to read in French now. The stories are pitched perfectly and the quizzes keep them accountable.&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                  <span className="text-orange-700 font-semibold text-sm">ST</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Sarah T.</p>
                  <p className="text-gray-500 text-xs">Head of MFL, Secondary School</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-4">&ldquo;The progress tracking saves me hours of admin. I can see at a glance who has engaged with the reading tasks and who needs a nudge.&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-semibold text-sm">JM</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">James M.</p>
                  <p className="text-gray-500 text-xs">German &amp; French Teacher</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-4">&ldquo;Finally a platform that gets comprehensible input right. The GCSE-aligned topics mean I can use it as genuine homework, not just a supplement.&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                  <span className="text-green-700 font-semibold text-sm">RP</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Rachel P.</p>
                  <p className="text-gray-500 text-xs">Spanish Teacher, Academy Trust</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto text-center">
            <div>
              <p className="text-3xl font-bold text-orange-500">500+</p>
              <p className="text-sm text-gray-500">Original stories</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-500">3</p>
              <p className="text-sm text-gray-500">Languages</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-500">A1&ndash;B2</p>
              <p className="text-sm text-gray-500">CEFR levels</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl mb-6">
                  Built by a Teacher Who Understands Your Classroom
                </h2>
                <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl mb-4">
                  Lingoletics was created by Andrew Stokes, a secondary school teacher with over 
                  10 years of experience teaching German and French in UK schools. Every story, 
                  exercise, and feature reflects what actually works in the classroom.
                </p>
                <div className="border-l-4 border-orange-500 pl-6 mt-6">
                  <p className="text-lg font-semibold text-gray-900 italic mb-2">
                    &ldquo;I built Lingoletics because I couldn&apos;t find a reading platform that was 
                    pitched at the right level for my KS3 and KS4 pupils. Authentic texts were 
                    too hard, textbook extracts too boring. These stories fill that gap.&rdquo;
                  </p>
                  <p className="text-base text-gray-600 font-medium">
                    &mdash; Andrew Stokes, Founder &amp; MFL Teacher
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative w-full">
                <Image
                  src="/andrew-stokes.jpeg"
                  alt="Andrew Stokes - Teacher and Creator of Lingoletics.com"
                  width={600}
                  height={400}
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="w-full h-auto object-contain rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

              {/* Features Section (trimmed) */}
        <section id="features" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">What&apos;s Inside the Platform</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Stories, audio, quizzes, games and tracking &mdash; everything in one place
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <Headphones className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <h4 className="text-base font-semibold text-gray-900 mb-2">Native Audio</h4>
                <p className="text-gray-600 text-sm">Professional recordings for every story to build listening stamina.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <GamepadIcon className="h-8 w-8 text-green-600 mx-auto mb-4" />
                <h4 className="text-base font-semibold text-gray-900 mb-2">Quizzes &amp; Games</h4>
                <p className="text-gray-600 text-sm">True/false, multiple choice, gap-fill and vocabulary games after each story.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                <h4 className="text-base font-semibold text-gray-900 mb-2">Progress Analytics</h4>
                <p className="text-gray-600 text-sm">Track pupil engagement, completion rates and scores across all classes.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <Flag className="h-8 w-8 text-orange-600 mx-auto mb-4" />
                <h4 className="text-base font-semibold text-gray-900 mb-2">Cultural Insights</h4>
                <p className="text-gray-600 text-sm">Every story weaves in cultural capital from France, Germany and Spain.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Stories Section (merged Languages + Short Story Collection) */}
        <section id="short-stories" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Explore Stories in Three Languages
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Each story is curriculum-mapped, includes native-speaker audio, and comes with 
              quizzes, vocabulary games and cultural insights. Try a preview below.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Spanish Stories */}
            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors shadow-lg flex flex-col">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-700">
                  <h4 className="text-2xl font-bold mb-2">Spanish</h4>
                  <p className="text-gray-600">short stories</p>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Spanish short stories</h3>
                <p className="text-gray-600 mb-4">
                  Welcome to our library of Spanish short stories, following the adventures of 
                  <strong> Los dos amigos</strong>. As Carlos and Carla travel around Spain, they will reveal 
                  many interesting cultural facts about the places they visit, as well as the specialties, 
                  and traditions they discover.
                </p>
                <p className="text-gray-700 font-medium mb-6">
                  Practice reading aloud, listening, dictation, translation, vocabulary, comprehension, and more!
                </p>
                <div className="mt-auto">
                  <button
                    onClick={() => openStoryTeaser('spanish')}
                    className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    See the Story
                  </button>
                </div>
              </div>
            </div>

            {/* German Stories */}
            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors shadow-lg flex flex-col">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-700">
                  <h4 className="text-2xl font-bold mb-2">German</h4>
                  <p className="text-gray-600">short stories</p>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">German short stories</h3>
                <p className="text-gray-600 mb-4">
                  Welcome to our library of German short stories, following the adventures of 
                  <strong> Johnny German & Friends</strong>. As Johnny travels around Germany, Switzerland, 
                  and Austria, he will reveal many interesting cultural facts about the places he visits, 
                  as well as the specialities and traditions he discovers.
                </p>
                <p className="text-gray-700 font-medium mb-6">
                  Practice reading aloud, listening, dictation, translation, vocabulary, comprehension and more!
                </p>
                <div className="mt-auto">
                  <button
                    onClick={() => openStoryTeaser('german')}
                    className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    See the Story
                  </button>
                </div>
              </div>
            </div>

            {/* French Stories */}
            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors shadow-lg flex flex-col">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-700">
                  <h4 className="text-2xl font-bold mb-2">French</h4>
                  <p className="text-gray-600">short stories</p>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">French short stories</h3>
                <p className="text-gray-600 mb-4">
                  Welcome to our library of French short stories following the adventures of 
                  <strong> Les amis d'Annie</strong>. As Annie travels around France, she will reveal 
                  many interesting cultural facts about the places she visits, as well as the specialities 
                  and traditions she discovers.
                </p>
                <p className="text-gray-700 font-medium mb-6">
                  Practice reading aloud, listening, dictation, translation, vocabulary, comprehension and more!
                </p>
                <div className="mt-auto">
                  <button
                    onClick={() => openStoryTeaser('french')}
                    className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    See the Story
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Practice Section (merged Quizzes + Vocabulary Games) */}
      <section id="quizzes" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Interactive Practice
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Quizzes and vocabulary games reinforce every story &mdash; building retrieval strength and keeping pupils engaged.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Quizzes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">True or False</h4>
              <p className="text-gray-600 text-sm mb-4">Quick-fire comprehension checks after each story.</p>
              <button onClick={() => openQuizTeaser('true_false')} className="w-full bg-orange-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm">Try It</button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Multiple Choice</h4>
              <p className="text-gray-600 text-sm mb-4">Vocabulary, grammar and comprehension in one quiz.</p>
              <button onClick={() => openQuizTeaser('multiple_choice')} className="w-full bg-orange-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm">Try It</button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Fill the Gap</h4>
              <p className="text-gray-600 text-sm mb-4">Active recall exercises that develop writing accuracy.</p>
              <button onClick={() => openQuizTeaser('gap_fill')} className="w-full bg-orange-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm">Try It</button>
            </div>
          </div>

          <h3 id="vocabulary-games" className="text-xl font-semibold text-gray-900 mb-6 text-center">Vocabulary Games <span className="ml-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">Free</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors">
              <div className="flex justify-center mb-4">
                <FlagIcon language="spanish" size="xl" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Spanish</h4>
              <p className="text-gray-600 text-sm mb-4">Vocabulary games linked to each Spanish story.</p>
              <button onClick={() => openVocabTeaser('spanish')} className="w-full bg-orange-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm">Play Now</button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors">
              <div className="flex justify-center mb-4">
                <FlagIcon language="german" size="xl" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">German</h4>
              <p className="text-gray-600 text-sm mb-4">Vocabulary games linked to each German story.</p>
              <button onClick={() => openVocabTeaser('german')} className="w-full bg-orange-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm">Play Now</button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors">
              <div className="flex justify-center mb-4">
                <FlagIcon language="french" size="xl" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">French</h4>
              <p className="text-gray-600 text-sm mb-4">Vocabulary games linked to each French story.</p>
              <button onClick={() => openVocabTeaser('french')} className="w-full bg-orange-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm">Play Now</button>
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
              Access all short stories and teaching resources across French, German, and Spanish
            </p>
            <p className="mt-2 text-sm text-orange-600 font-medium">
              All plans include a 14-day free trial
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
                Individual
              </button>
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
                Schools &amp; Institutions
              </button>
            </div>
          </div>

          {/* Individual Plans */}
          {activeTab === 'individual' && (
          <div className="mb-16">
            <p className="text-center text-gray-600 mb-8">Perfect for individual learners, parents, and families</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              
              {/* Monthly Plan */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all hover:shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">£7.99</span>
                  <span className="text-gray-500"> / month</span>
                </div>
                <ul className="space-y-2 mb-6 text-gray-600 text-sm">
                  <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> All stories in French, German &amp; Spanish</li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> Games, quizzes &amp; vocabulary exercises</li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> Audio narration for all stories</li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> Cancel anytime</li>
                </ul>
                <a href="/pricing" className="block w-full border-2 border-orange-500 text-orange-600 font-bold py-2.5 px-4 rounded-lg hover:bg-orange-50 transition-colors text-center">
                  Start Free Trial
                </a>
              </div>

              {/* Quarterly Plan */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white relative shadow-xl scale-[1.02]">
                <div className="absolute -top-3 right-4 bg-yellow-400 text-orange-900 px-3 py-1 rounded-full text-xs font-bold">
                  BEST VALUE
                </div>
                <h3 className="text-xl font-bold mb-2">Quarterly</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">£19.99</span>
                  <span className="text-orange-100"> / 3 months</span>
                </div>
                <ul className="space-y-2 mb-6 text-orange-50 text-sm">
                  <li className="flex items-start gap-2"><span className="text-yellow-300 mt-0.5">✓</span> All stories in French, German &amp; Spanish</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-300 mt-0.5">✓</span> Games, quizzes &amp; vocabulary exercises</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-300 mt-0.5">✓</span> Audio narration for all stories</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-300 mt-0.5">✓</span> Track your learning progress</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-300 mt-0.5">✓</span> Cancel anytime</li>
                </ul>
                <a href="/pricing" className="block w-full bg-white text-orange-600 font-bold py-2.5 px-4 rounded-lg hover:bg-orange-50 transition-colors text-center">
                  Start Free Trial
                </a>
              </div>

              {/* Annual Plan */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all hover:shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Yearly</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">£49.99</span>
                  <span className="text-gray-500"> / year</span>
                </div>
                <ul className="space-y-2 mb-6 text-gray-600 text-sm">
                  <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> All stories in French, German &amp; Spanish</li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> Games, quizzes &amp; vocabulary exercises</li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> Audio narration for all stories</li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> Cancel anytime</li>
                </ul>
                <a href="/pricing" className="block w-full border-2 border-orange-500 text-orange-600 font-bold py-2.5 px-4 rounded-lg hover:bg-orange-50 transition-colors text-center">
                  Start Free Trial
                </a>
              </div>
            </div>
          </div>
          )}

          {/* School / Institutional Plans */}
          {activeTab === 'school' && (
          <div className="mb-16">
            <p className="text-center text-gray-600 mb-8">For schools, language centres, and educational institutions</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

              {/* Small Plan */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all hover:shadow-md relative">
                <div className="absolute -top-3 right-4 bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold">
                  SMALL
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Small School Plan</h3>
                <p className="text-sm text-gray-500 mb-4">Up to 4 classes and 120 seats</p>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">from</p>
                  <span className="text-3xl font-bold text-gray-900">£24.99</span>
                  <span className="text-gray-500"> / month</span>
                </div>
                <ul className="space-y-2 mb-6 text-gray-600 text-sm">
                  <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> All stories, games &amp; teaching resources</li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> Student login management</li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> Progress tracking for all students</li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> Monthly, quarterly &amp; yearly billing</li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> Email support</li>
                </ul>
                <a href="/pricing" className="block w-full border-2 border-orange-500 text-orange-600 font-bold py-2.5 px-4 rounded-lg hover:bg-orange-50 transition-colors text-center">
                  Start Free Trial
                </a>
              </div>

              {/* Professional Plan */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white relative shadow-xl">
                <div className="absolute -top-3 right-4 bg-yellow-400 text-orange-900 px-3 py-1 rounded-full text-xs font-bold">
                  PROFESSIONAL
                </div>
                <h3 className="text-xl font-bold mb-1">Professional Plan</h3>
                <p className="text-sm text-orange-100 mb-4">Up to 40 classes and 1200 seats</p>
                <div className="mb-4">
                  <p className="text-sm text-orange-200">from</p>
                  <span className="text-3xl font-bold">£59.99</span>
                  <span className="text-orange-100"> / month</span>
                </div>
                <ul className="space-y-2 mb-6 text-orange-50 text-sm">
                  <li className="flex items-start gap-2"><span className="text-yellow-300 mt-0.5">✓</span> Everything in Small, plus:</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-300 mt-0.5">✓</span> Unlimited student &amp; staff logins</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-300 mt-0.5">✓</span> Advanced analytics &amp; reporting</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-300 mt-0.5">✓</span> Class management tools</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-300 mt-0.5">✓</span> Priority support</li>
                </ul>
                <a href="/pricing" className="block w-full bg-white text-orange-600 font-bold py-2.5 px-4 rounded-lg hover:bg-orange-50 transition-colors text-center">
                  Start Free Trial
                </a>
              </div>
            </div>
          </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">
            Try Lingoletics Free for 14 Days
          </h2>
          <p className="text-xl text-gray-600 mb-4 leading-relaxed">
            No card required. Set up your class in under 5 minutes.
          </p>
          <p className="text-base text-gray-500 mb-8">
            Full access to all stories, quizzes, games and progress tracking across French, German and Spanish.
          </p>
          <div className="flex justify-center">
            <a href="/sign-up">
              <button className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors shadow-lg">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Questions? We&apos;d Love to Hear from You
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Whether you want a demo, have pricing questions, or just want to 
                chat about how Lingoletics could work in your department &mdash; get in touch.
              </p>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-700 mb-4">
                  Already like what we do? Then follow us on social media:
                </p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <a
                    href="https://www.facebook.com/profile.php?id=61584398676517"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/lingoletics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    Instagram
                  </a>
                  <a
                    href="https://www.linkedin.com/in/lingo-letics-a1901b393/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                  <a
                    href="https://www.tiktok.com/@lingoletics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.97a8.35 8.35 0 004.76 1.49V7.02a4.84 4.84 0 01-1-.33z"/>
                    </svg>
                    TikTok
                  </a>
                </div>
              </div>
            </div>
            <ContactFormComponent />
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
                Lingoletics.com focusses on developing language skills in all four 
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
                  <a href="#pricing" className="text-gray-600 hover:text-gray-800 transition-colors">
                    Pricing
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
                    href="/#pricing"
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Pricing
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
                © 2026 All Rights Reserved.
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

      {/* Quiz Teaser Modal */}
      <QuizTeaserModal
        isOpen={quizTeaserOpen}
        onClose={() => setQuizTeaserOpen(false)}
        quizType={quizTeaserType}
      />

      {/* Vocabulary Teaser Modal */}
      <VocabTeaserModal
        isOpen={vocabTeaserOpen}
        onClose={() => setVocabTeaserOpen(false)}
        language={vocabTeaserLanguage}
      />

      {/* Story Teaser Modal */}
      <StoryTeaserModal
        isOpen={storyTeaserOpen}
        onClose={() => setStoryTeaserOpen(false)}
        language={storyTeaserLanguage}
      />
    </main>
  );
}
