import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface TrialExtensionEmailData {
  name: string;
  email: string;
  institutionName: string;
  newTrialEndDate: Date;
}

export async function sendTrialExtensionEmail({ name, email, institutionName, newTrialEndDate }: TrialExtensionEmailData) {
  const formattedDate = newTrialEndDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.lingoletics.com')}/dashboard`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Lingoletics.com <info@lingoletics.com>',
      to: [email],
      subject: 'Your trial period has been extended!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Trial Extended!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Great news for ${institutionName}</p>
          </div>
          
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hello ${name}!</h2>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              We're happy to let you know that the trial period for <strong>${institutionName}</strong> has been extended by 2 weeks.
            </p>
            
            <div style="background-color: #f0fdf4; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #166534; margin-top: 0; font-size: 20px;">New Trial End Date</h3>
              <p style="color: #166534; font-size: 24px; font-weight: bold; margin: 0;">${formattedDate}</p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              You can continue using all premium features during this extended period. Make the most of it by exploring our full range of language learning tools!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.2);">
                Continue Learning
              </a>
            </div>
          </div>
          
          <div style="background-color: #f9fafb; padding: 25px 30px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
              <strong>Need help?</strong> Contact us at 
              <a href="mailto:info@lingoletics.com" style="color: #ea580c; text-decoration: none;">info@lingoletics.com</a>
            </p>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                Lingoletics.com<br>
                30 Tithe Barn Road, Stafford, England, ST16 3PH, GB
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Trial Extended!

Hello ${name}!

We're happy to let you know that the trial period for ${institutionName} has been extended by 2 weeks.

New Trial End Date: ${formattedDate}

You can continue using all premium features during this extended period. Make the most of it by exploring our full range of language learning tools!

Continue Learning: ${dashboardUrl}

Need help? Contact us at info@lingoletics.com

---
Lingoletics.com
30 Tithe Barn Road, Stafford, England, ST16 3PH, GB
      `,
    });

    if (error) {
      console.error('Trial extension email error:', error);
      return { success: false, error };
    }

    console.log('Trial extension email sent successfully to:', email);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send trial extension email:', error);
    return { success: false, error };
  }
}
