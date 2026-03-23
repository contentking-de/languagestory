import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_NOTIFICATION_EMAIL = 'andystokes74@gmail.com';

interface NewUserNotificationData {
  name: string;
  email: string;
  role: string;
}

export async function sendNewUserNotificationEmail({ name, email, role }: NewUserNotificationData) {
  try {
    const registeredAt = new Date().toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/London',
    });

    const { data, error } = await resend.emails.send({
      from: 'Lingoletics.com <info@lingoletics.com>',
      to: [ADMIN_NOTIFICATION_EMAIL],
      subject: `New User Registration: ${name} (${role})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: bold;">New User Registration</h1>
          </div>
          <div style="padding: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 120px;">Name</td>
                <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Email</td>
                <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                  <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Role</td>
                <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${role}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Registered at</td>
                <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${registeredAt}</td>
              </tr>
            </table>
          </div>
          <div style="background-color: #f9fafb; padding: 16px 30px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">Lingoletics.com — Admin Notification</p>
          </div>
        </div>
      `,
      text: `New User Registration\n\nName: ${name}\nEmail: ${email}\nRole: ${role}\nRegistered at: ${registeredAt}\n`,
    });

    if (error) {
      console.error('New user notification email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send new user notification email:', error);
    return { success: false, error };
  }
}
