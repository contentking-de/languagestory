import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

interface WelcomeEmailData {
  name: string;
  email: string;
  role: string;
}

export async function sendWelcomeEmail({ name, email, role }: WelcomeEmailData) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Lingoletics.com <info@lingoletics.com>',
      to: [email],
      subject: 'Welcome to Lingoletics.com! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Lingoletics.com!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Your language learning journey begins now</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hello ${name}! 👋</h2>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Thank you for joining Lingoletics.com! We're excited to have you on board and can't wait to help you on your language learning journey.
            </p>
            
            <div style="background-color: #f9fafb; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ea580c;">
              <h3 style="color: #1f2937; margin-top: 0; font-size: 20px;">🎯 Your 14-Day Free Trial</h3>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 15px;">
                You now have access to all our premium features for the next 14 days, completely free! Explore our extensive collection of:
              </p>
              <ul style="color: #4b5563; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>📚 Interactive short stories in multiple languages</li>
                <li>🧩 Engaging vocabulary games and quizzes</li>
                <li>🎮 Fun language learning activities</li>
                <li>📊 Progress tracking and analytics</li>
                <li>🤖 AI-powered content creation tools</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.lingoletics.com')}/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.2);">
                🚀 Start Learning Now
              </a>
            </div>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
              <h4 style="color: #92400e; margin-top: 0; font-size: 18px;">💡 Getting Started Tips</h4>
              <ul style="color: #92400e; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Complete your profile to personalize your experience</li>
                <li>Take a language assessment to find your level</li>
                <li>Explore our story collection in your target language</li>
                <li>Try our AI Creator to generate custom content</li>
                <li>Check your progress in the Activity dashboard</li>
              </ul>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              If you have any questions or need help getting started, don't hesitate to reach out to our support team. We're here to help you succeed!
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 25px 30px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
              <strong>Need help?</strong> Contact us at 
              <a href="mailto:info@lingoletics.com" style="color: #ea580c; text-decoration: none;">info@lingoletics.com</a>
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                Lingoletics.com<br>
                30 Tithe Barn Road, Stafford, England, ST16 3PH, GB<br><br>
                You're receiving this email because you signed up for Lingoletics.com.<br>
                If you didn't create an account, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Welcome to Lingoletics.com! 🎉

Hello ${name}! 👋

Thank you for joining Lingoletics.com! We're excited to have you on board and can't wait to help you on your language learning journey.

🎯 Your 14-Day Free Trial
You now have access to all our premium features for the next 14 days, completely free! Explore our extensive collection of:
• Interactive short stories in multiple languages
• Engaging vocabulary games and quizzes
• Fun language learning activities
• Progress tracking and analytics
• AI-powered content creation tools

🚀 Start Learning Now
Visit your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.lingoletics.com')}/dashboard

💡 Getting Started Tips
• Complete your profile to personalize your experience
• Take a language assessment to find your level
• Explore our story collection in your target language
• Try our AI Creator to generate custom content
• Check your progress in the Activity dashboard

If you have any questions or need help getting started, don't hesitate to reach out to our support team. We're here to help you succeed!

Need help? Contact us at info@lingoletics.com

---
Lingoletics.com
30 Tithe Barn Road, Stafford, England, ST16 3PH, GB

You're receiving this email because you signed up for Lingoletics.com.
If you didn't create an account, please ignore this email.
      `,
    });

    if (error) {
      console.error('Welcome email error:', error);
      return { success: false, error };
    }

    console.log('Welcome email sent successfully to:', email);
    return { success: true, data };

  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
} 