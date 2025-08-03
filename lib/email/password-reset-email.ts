import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

interface PasswordResetEmailData {
  email: string;
  name: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({ email, name, resetUrl }: PasswordResetEmailData) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Lingoletics.com <info@lingoletics.com>',
      to: [email],
      subject: 'Reset Your Password - Lingoletics.com',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ea580c; font-size: 28px; margin: 0;">Lingoletics.com</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Learn languages through engaging stories</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb;">
            <h2 style="color: #374151; margin-top: 0; margin-bottom: 20px; font-size: 24px;">
              Reset Your Password
            </h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name},
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your Lingoletics.com account. If you didn't make this request, you can safely ignore this email.
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 30px;">
              To reset your password, click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #ea580c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                Reset My Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #ea580c; font-size: 14px; word-break: break-all; margin-bottom: 20px;">
              ${resetUrl}
            </p>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Security Notice:</strong> This password reset link will expire in 1 hour for your security. If you need to reset your password after this time, please request a new reset link.
              </p>
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
              If you have any questions or need help, please contact us at 
              <a href="mailto:info@lingoletics.com" style="color: #ea580c;">info@lingoletics.com</a>
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
            This email was sent from Lingoletics.com. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
      text: `
Lingoletics.com - Reset Your Password

Hi ${name},

We received a request to reset your password for your Lingoletics.com account. If you didn't make this request, you can safely ignore this email.

To reset your password, click the link below or copy and paste it into your browser:
${resetUrl}

Security Notice: This password reset link will expire in 1 hour for your security.

If you have any questions or need help, please contact us at info@lingoletics.com

---
This email was sent from Lingoletics.com. If you didn't request a password reset, please ignore this email.
      `
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    console.log('Password reset email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}