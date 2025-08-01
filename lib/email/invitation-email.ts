import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

interface InvitationEmailData {
  email: string;
  role: string;
  invitedBy: string;
  teamName?: string;
  invitationUrl: string;
}

export async function sendInvitationEmail({ 
  email, 
  role, 
  invitedBy, 
  teamName = 'A Language Story Team',
  invitationUrl 
}: InvitationEmailData) {
  try {
    const roleDisplayName = getRoleDisplayName(role);
    
    const { data, error } = await resend.emails.send({
      from: 'A Language Story <info@alanguagestory.dev>',
      to: [email],
      subject: `You've been invited to join A Language Story as a ${roleDisplayName}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">You're Invited!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Join A Language Story and start your language learning journey</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hello! 👋</h2>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              <strong>${invitedBy}</strong> has invited you to join <strong>A Language Story</strong> as a <strong>${roleDisplayName}</strong>!
            </p>
            
            <div style="background-color: #f9fafb; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ea580c;">
              <h3 style="color: #1f2937; margin-top: 0; font-size: 20px;">🎯 What You'll Get</h3>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 15px;">
                As a ${roleDisplayName}, you'll have access to:
              </p>
              <ul style="color: #4b5563; line-height: 1.6; margin: 0; padding-left: 20px;">
                ${getRoleBenefits(role)}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.2);">
                🚀 Accept Invitation
              </a>
            </div>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
              <h4 style="color: #92400e; margin-top: 0; font-size: 18px;">💡 What Happens Next?</h4>
              <ol style="color: #92400e; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Click the "Accept Invitation" button above</li>
                <li>Create your account with a secure password</li>
                <li>Complete your profile and preferences</li>
                <li>Start exploring our language learning platform!</li>
              </ol>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              This invitation is valid for 7 days. If you have any questions or need help getting started, don't hesitate to reach out to our support team.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 25px 30px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
              <strong>Need help?</strong> Contact us at 
              <a href="mailto:info@alanguagestory.dev" style="color: #ea580c; text-decoration: none;">info@alanguagestory.dev</a>
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                A Language Story<br>
                30 Tithe Barn Road, Stafford, England, ST16 3PH, GB<br><br>
                You're receiving this email because ${invitedBy} invited you to join A Language Story.<br>
                If you didn't expect this invitation, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
You're Invited to A Language Story! 🎉

Hello! 👋

${invitedBy} has invited you to join A Language Story as a ${roleDisplayName}!

🎯 What You'll Get
As a ${roleDisplayName}, you'll have access to:
${getRoleBenefitsText(role)}

🚀 Accept Invitation
Click here to accept: ${invitationUrl}

💡 What Happens Next?
1. Click the "Accept Invitation" link above
2. Create your account with a secure password
3. Complete your profile and preferences
4. Start exploring our language learning platform!

This invitation is valid for 7 days. If you have any questions, contact us at info@alanguagestory.dev

---
A Language Story
30 Tithe Barn Road, Stafford, England, ST16 3PH, GB

You're receiving this email because ${invitedBy} invited you to join A Language Story.
If you didn't expect this invitation, please ignore this email.
      `,
    });

    if (error) {
      console.error('Failed to send invitation email:', error);
      throw new Error('Failed to send invitation email');
    }

    console.log('Invitation email sent successfully to:', email);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
}

// Helper function to get role display name
function getRoleDisplayName(role: string): string {
  const displayNames: Record<string, string> = {
    teacher: 'Teacher',
    student: 'Student',
    parent: 'Parent',
    institution_admin: 'Institution Administrator',
    content_creator: 'Content Creator',
    member: 'Member'
  };
  return displayNames[role] || role;
}

// Helper function to get role-specific benefits for HTML
function getRoleBenefits(role: string): string {
  const benefits: Record<string, string> = {
    teacher: `
      <li>📚 Access to comprehensive teaching resources</li>
      <li>👥 Manage your classes and students</li>
      <li>📊 Track student progress and analytics</li>
      <li>🎯 Create custom quizzes and vocabulary lists</li>
      <li>🤖 Use AI-powered content creation tools</li>
      <li>📈 Monitor learning outcomes and performance</li>
    `,
    student: `
      <li>📖 Interactive short stories in multiple languages</li>
      <li>🧩 Engaging vocabulary games and quizzes</li>
      <li>🎮 Fun language learning activities</li>
      <li>📊 Track your learning progress</li>
      <li>🏆 Earn achievements and certificates</li>
      <li>👥 Connect with teachers and classmates</li>
    `,
    parent: `
      <li>👀 Monitor your child's learning progress</li>
      <li>📊 View detailed analytics and reports</li>
      <li>📧 Receive progress updates and notifications</li>
      <li>🎯 Support your child's language learning journey</li>
      <li>📱 Access from any device, anytime</li>
      <li>💬 Communicate with teachers when needed</li>
    `,
    institution_admin: `
      <li>🏫 Manage your entire institution</li>
      <li>👥 Oversee teachers, students, and classes</li>
      <li>📊 Access comprehensive analytics and reports</li>
      <li>🎯 Set up and manage educational programs</li>
      <li>📈 Monitor institutional performance</li>
      <li>🔧 Configure platform settings and permissions</li>
    `,
    content_creator: `
      <li>✍️ Create engaging educational content</li>
      <li>📚 Access to advanced content creation tools</li>
      <li>🤖 Use AI-powered content generation</li>
      <li>📊 Track content performance and engagement</li>
      <li>🎯 Contribute to the learning community</li>
      <li>💡 Access to creative resources and templates</li>
    `,
    member: `
      <li>📖 Access to all learning materials</li>
      <li>🧩 Interactive games and quizzes</li>
      <li>📊 Track your learning progress</li>
      <li>🎯 Personalized learning experience</li>
      <li>📱 Learn on any device, anytime</li>
      <li>🏆 Earn achievements and certificates</li>
    `
  };
  return benefits[role] || `
    <li>📖 Access to comprehensive learning resources</li>
    <li>🎯 Personalized learning experience</li>
    <li>📊 Track your progress and achievements</li>
    <li>📱 Learn on any device, anytime</li>
  `;
}

// Helper function to get role-specific benefits for text version
function getRoleBenefitsText(role: string): string {
  const benefits: Record<string, string> = {
    teacher: `
• Access to comprehensive teaching resources
• Manage your classes and students
• Track student progress and analytics
• Create custom quizzes and vocabulary lists
• Use AI-powered content creation tools
• Monitor learning outcomes and performance`,
    student: `
• Interactive short stories in multiple languages
• Engaging vocabulary games and quizzes
• Fun language learning activities
• Track your learning progress
• Earn achievements and certificates
• Connect with teachers and classmates`,
    parent: `
• Monitor your child's learning progress
• View detailed analytics and reports
• Receive progress updates and notifications
• Support your child's language learning journey
• Access from any device, anytime
• Communicate with teachers when needed`,
    institution_admin: `
• Manage your entire institution
• Oversee teachers, students, and classes
• Access comprehensive analytics and reports
• Set up and manage educational programs
• Monitor institutional performance
• Configure platform settings and permissions`,
    content_creator: `
• Create engaging educational content
• Access to advanced content creation tools
• Use AI-powered content generation
• Track content performance and engagement
• Contribute to the learning community
• Access to creative resources and templates`,
    member: `
• Access to all learning materials
• Interactive games and quizzes
• Track your learning progress
• Personalized learning experience
• Learn on any device, anytime
• Earn achievements and certificates`
  };
  return benefits[role] || `
• Access to comprehensive learning resources
• Personalized learning experience
• Track your progress and achievements
• Learn on any device, anytime`;
} 