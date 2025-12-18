import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { sendPasswordResetEmail } from '@/lib/email/password-reset-email';
import { randomBytes } from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);
    const { email } = validatedData;

    // Check if user exists
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      // Generate a secure random token
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

      // Store the token in the database
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
        used: false
      });

      // Create reset URL - use environment variable, or extract from request headers, or use localhost for development
      let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      
      if (!baseUrl) {
        // Try to extract from request headers
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 
                        (host?.includes('localhost') ? 'http' : 'https');
        
        if (host) {
          baseUrl = `${protocol}://${host}`;
        } else {
          // Fallback: use localhost for development, production domain otherwise
          baseUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:3000' 
            : 'https://www.lingoletics.com';
        }
      }
      
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      // Send password reset email
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name || 'there',
        resetUrl
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link to it.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please enter a valid email address.',
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