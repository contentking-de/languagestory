import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/session';
import { validatePassword } from '@/lib/utils';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8).max(100).refine((password) => {
    const validation = validatePassword(password);
    return validation.isValid;
  }, (password) => {
    const validation = validatePassword(password);
    return { message: validation.error || 'Password does not meet security requirements' };
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);
    const { token, password } = validatedData;

    // Find valid, unused, non-expired token
    const [resetToken] = await db
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
        used: passwordResetTokens.used,
        expiresAt: passwordResetTokens.expiresAt
      })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!resetToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired reset token. Please request a new password reset link.' 
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user's password and mark token as used
    await Promise.all([
      db
        .update(users)
        .set({ 
          passwordHash: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, resetToken.userId)),
      
      db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, resetToken.id))
    ]);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You can now sign in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    
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