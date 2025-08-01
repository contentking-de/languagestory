import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  message: z.string().min(1, 'Message is required').max(5000, 'Message is too long'),
  consent: z.boolean().refine(val => val === true, {
    message: 'Consent is required'
  })
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the input
    const validatedData = contactSchema.parse(body);
    
    const { name, email, message } = validatedData;
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'A Language Story Contact Form <info@alanguagestory.dev>',
      to: ['info@alanguagestory.dev'],
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">Message</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Note:</strong> The user has provided consent for data storage and communication purposes.
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            This email was sent from the A Language Story contact form.<br>
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}

Message:
${message}

Note: The user has provided consent for data storage and communication purposes.

---
This email was sent from the A Language Story contact form.
Reply directly to this email to respond to ${name}.
      `,
      replyTo: email, // This allows you to reply directly to the user
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send email. Please try again or contact us directly.' 
        },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data);
    
    return NextResponse.json({
      success: true,
      message: 'We have received your message and will respond within 24 hours. Thank you for contacting A Language Story!'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please check your input and try again.',
          details: error.errors
        },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      },
      { status: 500 }
    );
  }
}