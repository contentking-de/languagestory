'use server';

import { z } from 'zod';
import { and, eq, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  users,
  teams,
  teamMembers,
  activityLogs,
  invitations,
  institutions,
  teachingAssignments,
  classes,
  classEnrollments,
  ActivityType,
  userRoleEnum,
  languageEnum,
} from '@/lib/db/schema';
import type {
  NewUser,
  NewTeam,
  NewTeamMember,
  NewActivityLog,
  User,
  NewInstitution,
  NewTeachingAssignment,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { validatedAction, validatedActionWithUser } from '@/lib/auth/middleware';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { UserRole, hasPermission, canManageUser, canInviteRole, getInvitableRoles, getRoleDisplayName } from '@/lib/auth/rbac';
import { sendWelcomeEmail } from '@/lib/email/welcome-email';
import { sendInvitationEmail } from '@/lib/email/invitation-email';
import { validatePassword } from '@/lib/utils';

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: users,
      team: teams
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  redirect('/dashboard/welcome');
});

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  password: z.string().min(8).refine((password) => {
    const validation = validatePassword(password);
    return validation.isValid;
  }, (password) => {
    const validation = validatePassword(password);
    return { message: validation.error || 'Password does not meet security requirements' };
  }),
  role: z.enum(['student', 'teacher']).default('teacher'),
  institutionId: z.string().optional(),
  parentEmail: z.string().email().optional(), // For linking parent-child accounts
  inviteId: z.string().optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { name, email, password, role, institutionId, parentEmail, inviteId } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  const passwordHash = await hashPassword(password);

  let parentId: number | undefined;
  
  // Handle parent-child relationship
  if (parentEmail && role === 'student') {
    const parentUser = await db
      .select()
      .from(users)
      .where(eq(users.email, parentEmail))
      .limit(1);
    
    if (parentUser.length > 0 && parentUser[0].role === 'parent') {
      parentId = parentUser[0].id;
    }
  }

  const newUser: NewUser = {
    name,
    email,
    passwordHash,
    role: role as UserRole,
    institutionId: institutionId ? parseInt(institutionId) : undefined,
    parentId,
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  let teamId: number;
  let userRole: UserRole;
  let createdTeam: typeof teams.$inferSelect | null = null;

  if (inviteId) {
    // Handle invitation-based signup
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (invitation) {
      // Check if invitation has expired (7 days)
      const invitationDate = new Date(invitation.invitedAt);
      const now = new Date();
      const daysDiff = (now.getTime() - invitationDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 7) {
        return { error: 'This invitation has expired. Please ask for a new invitation.' };
      }

      teamId = invitation.teamId;
      userRole = invitation.role as UserRole;

      await Promise.all([
        db.insert(teamMembers).values({
          teamId: invitation.teamId,
          userId: createdUser.id,
          role: invitation.role,
          language: invitation.language,
        }),
        db
          .update(invitations)
          .set({ status: 'accepted' })
          .where(eq(invitations.id, invitation.id)),
      ]);
    } else {
      return { error: 'Invalid or expired invitation.' };
    }
  } else {
    // Create new team for individual users
    const teamName = role === 'teacher' 
      ? `${createdUser.name || createdUser.email}'s Classes`
      : `${createdUser.name || createdUser.email}'s Learning`;

    [createdTeam] = await db
      .insert(teams)
      .values({
        name: teamName,
        subscriptionType: institutionId ? 'institution' : 'individual',
        institutionId: institutionId ? parseInt(institutionId) : undefined,
      })
      .returning();

    teamId = createdTeam.id;
    userRole = role as UserRole;

    const newTeamMember: NewTeamMember = {
      teamId,
      userId: createdUser.id,
      role: userRole,
    };

    await db.insert(teamMembers).values(newTeamMember);
  }

  await Promise.all([
    setSession(createdUser),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
  ]);

  // Send welcome email (don't await to avoid blocking the redirect)
  sendWelcomeEmail({
    name: createdUser.name || 'there',
    email: createdUser.email,
    role: userRole
  }).catch(error => {
    console.error('Failed to send welcome email:', error);
  });

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: createdTeam, priceId });
  }

  // Redirect to welcome page
  redirect('/dashboard/welcome');
});

export async function signOut() {
  const user = (await getUser()) as User;
  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100).refine((password) => {
    const validation = validatePassword(password);
    return validation.isValid;
  }, (password) => {
    const validation = validatePassword(password);
    return { message: validation.error || 'Password does not meet security requirements' };
  }),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Incorrect password. Account deletion failed.'
      };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.DELETE_ACCOUNT
    );

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId)
          )
        );
    }

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return { name, success: 'Account updated successfully.' };
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.number()
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: 'Team member removed successfully' };
  }
);

// Enhanced invitation system for educational roles
const inviteEducationalUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['teacher', 'student', 'parent', 'content_creator', 'member']),
  language: z.enum(['french', 'german', 'spanish', 'all']).default('all'),
  institutionId: z.string().optional(),
  classId: z.string().optional(),
});

// Bulk invitation schema for multiple students
const bulkInviteStudentsSchema = z.object({
  emails: z.string().min(1, 'At least one email is required'),
  language: z.enum(['french', 'german', 'spanish', 'all']).default('all'),
  institutionId: z.string().optional(),
  classId: z.string().optional(),
  // Additional data from Excel upload
  names: z.string().optional(),
  classes: z.string().optional(),
  yearGroups: z.string().optional(),
});

export const bulkInviteStudents = validatedActionWithUser(
  bulkInviteStudentsSchema,
  async (data, _, user) => {
    const { emails, language, institutionId, classId, names, classes, yearGroups } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    // Check if current user has permission to invite users
    if (!hasPermission(user.role as UserRole, 'invite_users')) {
      return { error: 'You do not have permission to invite users' };
    }

    // Check if current user can invite students
    if (!canInviteRole(user.role as UserRole, 'student')) {
      return { error: 'You cannot invite students' };
    }

    // Parse emails (split by comma, semicolon, or newline)
    const emailList = emails
      .split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emailList.length === 0) {
      return { error: 'No valid email addresses provided' };
    }

    // Parse additional data if provided
    const nameList = names ? names.split(/[,;\n]/).map(n => n.trim()) : [];
    const classList = classes ? classes.split(/[,;\n]/).map(c => c.trim()) : [];
    const yearGroupList = yearGroups ? yearGroups.split(/[,;\n]/).map(y => y.trim()) : [];

    // Validate all emails
    const invalidEmails = emailList.filter(email => !z.string().email().safeParse(email).success);
    if (invalidEmails.length > 0) {
      return { error: `Invalid email addresses: ${invalidEmails.join(', ')}` };
    }

    // Limit to 50 emails per bulk invitation
    if (emailList.length > 50) {
      return { error: 'Maximum 50 students can be invited at once' };
    }

    const results = {
      successful: [] as string[],
      failed: [] as { email: string; reason: string }[],
      skipped: [] as string[]
    };

    // Get team name for the email
    const team = await db
      .select({ name: teams.name })
      .from(teams)
      .where(eq(teams.id, userWithTeam.teamId))
      .limit(1);

    const teamName = team[0]?.name || 'Lingoletics.com Team';

    // Process each email
    for (let i = 0; i < emailList.length; i++) {
      const email = emailList[i];
      const name = nameList[i] || '';
      const classValue = classList[i] || '';
      const yearGroup = yearGroupList[i] || '';
      
      try {
        // Check if user already exists and is part of the team
        const existingMember = await db
          .select()
          .from(users)
          .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
          .where(
            and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
          )
          .limit(1);

        if (existingMember.length > 0) {
          results.skipped.push(email);
          continue;
        }

        // Check for existing pending invitation
        const existingInvitation = await db
          .select()
          .from(invitations)
          .where(
            and(
              eq(invitations.email, email),
              eq(invitations.teamId, userWithTeam.teamId),
              eq(invitations.status, 'pending')
            )
          )
          .limit(1);

        if (existingInvitation.length > 0) {
          results.skipped.push(email);
          continue;
        }

        // Create invitation with additional data
        const invitation = await db.insert(invitations).values({
          teamId: userWithTeam.teamId,
          email,
          role: 'student',
          language,
          invitedBy: user.id,
        }).returning();

        // Generate invitation URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.lingoletics.com');
        const invitationUrl = `${baseUrl}/sign-up?inviteId=${invitation[0].id}`;

        // Send invitation email
        try {
          await sendInvitationEmail({
            email,
            role: 'student',
            invitedBy: user.name || user.email,
            teamName,
            invitationUrl
          });
          results.successful.push(email);
        } catch (emailError) {
          console.error(`Failed to send invitation email to ${email}:`, emailError);
          results.failed.push({ email, reason: 'Email sending failed' });
        }

      } catch (error) {
        console.error(`Failed to process invitation for ${email}:`, error);
        results.failed.push({ email, reason: 'Processing failed' });
      }
    }

    // Log activity
    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER,
      undefined
    );

    // Generate result message
    let message = `Bulk invitation completed. `;
    if (results.successful.length > 0) {
      message += `${results.successful.length} invitation(s) sent successfully. `;
    }
    if (results.skipped.length > 0) {
      message += `${results.skipped.length} email(s) skipped (already invited or member). `;
    }
    if (results.failed.length > 0) {
      message += `${results.failed.length} invitation(s) failed.`;
    }

    return { 
      success: message,
      details: results
    };
  }
);

export const inviteEducationalUser = validatedActionWithUser(
  inviteEducationalUserSchema,
  async (data, _, user) => {
    const { email, role, language, institutionId, classId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    // Check if current user has permission to invite users
    if (!hasPermission(user.role as UserRole, 'invite_users')) {
      return { error: 'You do not have permission to invite users' };
    }

    // Check if current user can invite the specific role
    if (!canInviteRole(user.role as UserRole, role as UserRole)) {
      return { error: `You cannot invite users with the role "${role}". You can only invite: ${getInvitableRoles(user.role as UserRole).join(', ')}` };
    }

    // Check if user already exists and is part of the team
    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check for existing pending invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create invitation
    const invitation = await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      language,
      invitedBy: user.id,
    }).returning();

    // Get team name for the email
    const team = await db
      .select({ name: teams.name })
      .from(teams)
      .where(eq(teams.id, userWithTeam.teamId))
      .limit(1);

    const teamName = team[0]?.name || 'Lingoletics.com Team';

    // Generate invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.lingoletics.com');
    const invitationUrl = `${baseUrl}/sign-up?inviteId=${invitation[0].id}`;

    // Send invitation email
    try {
      await sendInvitationEmail({
        email,
        role,
        invitedBy: user.name || user.email,
        teamName,
        invitationUrl
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the entire invitation if email fails
      // The invitation is still created in the database
    }

    // If inviting a teacher, create teaching assignment
    if (role === 'teacher' && language !== 'all') {
      const newUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (newUser.length > 0) {
        await db.insert(teachingAssignments).values({
          teacherId: newUser[0].id,
          language,
          institutionId: institutionId ? parseInt(institutionId) : undefined,
        });
      }
    }

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER,
      undefined
    );

    return { success: 'Educational user invited successfully. An invitation email has been sent.' };
  }
);

// Create institution (for super admins and institution admins)
const createInstitutionSchema = z.object({
  name: z.string().min(1, 'Institution name is required'),
  type: z.enum(['school', 'university', 'language_center', 'private_tutor', 'corporate']),
  address: z.string().optional(),
  contactEmail: z.string().email().optional(),
});

export const createInstitution = validatedActionWithUser(
  createInstitutionSchema,
  async (data, _, user) => {
    if (!hasPermission(user.role as UserRole, 'manage_institution')) {
      return { error: 'You do not have permission to create institutions' };
    }

    const { name, type, address, contactEmail } = data;

    const newInstitution: NewInstitution = {
      name,
      type,
      address,
      contactEmail,
    };

    const [createdInstitution] = await db
      .insert(institutions)
      .values(newInstitution)
      .returning();

    return { 
      success: 'Institution created successfully',
      institutionId: createdInstitution.id 
    };
  }
);

// Create class (for teachers and institution admins)
const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  description: z.string().optional(),
  language: z.enum(['french', 'german', 'spanish']),
  institutionId: z.string().optional(),
});

export const createClass = validatedActionWithUser(
  createClassSchema,
  async (data, _, user) => {
    if (!hasPermission(user.role as UserRole, 'create_class')) {
      return { error: 'You do not have permission to create classes' };
    }

    const { name, description, language, institutionId } = data;

    const [createdClass] = await db
      .insert(classes)
      .values({
        name,
        description,
        language,
        teacherId: user.id,
        institutionId: institutionId ? parseInt(institutionId) : undefined,
      })
      .returning();

    const userWithTeam = await getUserWithTeam(user.id);
    if (userWithTeam?.teamId) {
      await logActivity(
        userWithTeam.teamId,
        user.id,
        ActivityType.CREATE_CLASS,
        undefined
      );
    }

    return { 
      success: 'Class created successfully',
      classId: createdClass.id 
    };
  }
);

// Enroll student in class
const enrollStudentSchema = z.object({
  studentId: z.number(),
  classId: z.number(),
});

export const enrollStudent = validatedActionWithUser(
  enrollStudentSchema,
  async (data, _, user) => {
    if (!hasPermission(user.role as UserRole, 'enroll_student')) {
      return { error: 'You do not have permission to enroll students' };
    }

    const { studentId, classId } = data;

    // Check if student is already enrolled
    const existingEnrollment = await db
      .select()
      .from(classEnrollments)
      .where(
        and(
          eq(classEnrollments.studentId, studentId),
          eq(classEnrollments.classId, classId),
          eq(classEnrollments.isActive, true)
        )
      )
      .limit(1);

    if (existingEnrollment.length > 0) {
      return { error: 'Student is already enrolled in this class' };
    }

    await db.insert(classEnrollments).values({
      studentId,
      classId,
    });

    const userWithTeam = await getUserWithTeam(user.id);
    if (userWithTeam?.teamId) {
      await logActivity(
        userWithTeam.teamId,
        user.id,
        ActivityType.ENROLL_STUDENT,
        undefined
      );
    }

    return { success: 'Student enrolled successfully' };
  }
);
