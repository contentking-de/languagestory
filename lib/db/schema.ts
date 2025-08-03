import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { media_files } from './content-schema';

// Enums for the new role system
export const institutionTypeEnum = pgEnum('institution_type', ['school', 'university', 'language_center', 'private_tutor', 'corporate']);
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'institution_admin', 'teacher', 'student', 'parent', 'content_creator', 'member']);
export const languageEnum = pgEnum('language', ['french', 'german', 'spanish', 'all']);
export const subscriptionTypeEnum = pgEnum('subscription_type', ['individual', 'institution', 'family']);

// Institutions table for schools, universities, etc.
export const institutions = pgTable('institutions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  type: institutionTypeEnum('type').notNull(),
  address: text('address'),
  contactEmail: varchar('contact_email', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('student'),
  preferredLanguage: languageEnum('preferred_language').default('all'),
  institutionId: integer('institution_id'),
  parentId: integer('parent_id'), // For parent-child relationships
  class: varchar('class', { length: 50 }), // Student's class (e.g., "Class 3A", "Year 7B")
  yearGroup: varchar('year_group', { length: 20 }), // Student's year group (e.g., "Year 7", "Grade 10")
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Language-specific teaching assignments
export const teachingAssignments = pgTable('teaching_assignments', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').notNull().references(() => users.id),
  language: languageEnum('language').notNull(),
  institutionId: integer('institution_id').references(() => institutions.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Classes/Groups for organizing students
export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  language: languageEnum('language').notNull(),
  teacherId: integer('teacher_id').notNull().references(() => users.id),
  institutionId: integer('institution_id').references(() => institutions.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Student enrollment in classes
export const classEnrollments = pgTable('class_enrollments', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').notNull().references(() => users.id),
  classId: integer('class_id').notNull().references(() => classes.id),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  subscriptionType: subscriptionTypeEnum('subscription_type').notNull().default('individual'),
  institutionId: integer('institution_id').references(() => institutions.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: userRoleEnum('role').notNull(),
  language: languageEnum('language').default('all'),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

// Enhanced activity logs with language context
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  language: languageEnum('language'),
  metadata: text('metadata'), // JSON string for additional context
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  language: languageEnum('language').default('all'),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

// Relations
export const institutionsRelations = relations(institutions, ({ many }) => ({
  users: many(users),
  teachingAssignments: many(teachingAssignments),
  classes: many(classes),
  teams: many(teams),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [users.institutionId],
    references: [institutions.id],
  }),
  teachingAssignments: many(teachingAssignments),
  taughtClasses: many(classes),
  classEnrollments: many(classEnrollments),
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  mediaFiles: many(media_files),
}));

export const teachingAssignmentsRelations = relations(teachingAssignments, ({ one }) => ({
  teacher: one(users, {
    fields: [teachingAssignments.teacherId],
    references: [users.id],
  }),
  institution: one(institutions, {
    fields: [teachingAssignments.institutionId],
    references: [institutions.id],
  }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  institution: one(institutions, {
    fields: [classes.institutionId],
    references: [institutions.id],
  }),
  enrollments: many(classEnrollments),
}));

export const classEnrollmentsRelations = relations(classEnrollments, ({ one }) => ({
  student: one(users, {
    fields: [classEnrollments.studentId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [classEnrollments.classId],
    references: [classes.id],
  }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [teams.institutionId],
    references: [institutions.id],
  }),
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

// Type exports
export type Institution = typeof institutions.$inferSelect;
export type NewInstitution = typeof institutions.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type TeachingAssignment = typeof teachingAssignments.$inferSelect;
export type NewTeachingAssignment = typeof teachingAssignments.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type NewClassEnrollment = typeof classEnrollments.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  })[];
};

// Enhanced activity types for educational context
export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  // Educational activities
  CREATE_CLASS = 'CREATE_CLASS',
  ENROLL_STUDENT = 'ENROLL_STUDENT',
  REMOVE_STUDENT = 'REMOVE_STUDENT',
  ASSIGN_TEACHER = 'ASSIGN_TEACHER',
  START_LESSON = 'START_LESSON',
  COMPLETE_LESSON = 'COMPLETE_LESSON',
  SUBMIT_EXERCISE = 'SUBMIT_EXERCISE',
  VIEW_PROGRESS = 'VIEW_PROGRESS',
  // Quiz activities
  CREATE_QUIZ = 'CREATE_QUIZ',
  TAKE_QUIZ = 'TAKE_QUIZ',
  COMPLETE_QUIZ = 'COMPLETE_QUIZ',
  // Vocabulary activities
  CREATE_VOCABULARY = 'CREATE_VOCABULARY',
  STUDY_VOCABULARY = 'STUDY_VOCABULARY',
  COMPLETE_VOCABULARY = 'COMPLETE_VOCABULARY',
  // Games activities
  CREATE_GAME = 'CREATE_GAME',
  PLAY_GAME = 'PLAY_GAME',
  COMPLETE_GAME = 'COMPLETE_GAME',
  // Achievement activities
  EARN_ACHIEVEMENT = 'EARN_ACHIEVEMENT',
  REACH_STREAK = 'REACH_STREAK',
  EARN_POINTS = 'EARN_POINTS',
}

// Password reset tokens table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Role hierarchy and permissions
export const ROLE_HIERARCHY = {
  super_admin: 10,
  institution_admin: 8,
  teacher: 6,
  content_creator: 5,
  parent: 4,
  student: 2,
  member: 1,
} as const;

export const LANGUAGE_PERMISSIONS = {
  super_admin: ['french', 'german', 'spanish', 'all'],
  institution_admin: ['french', 'german', 'spanish', 'all'],
  teacher: ['french', 'german', 'spanish'], // Assigned per teaching assignment
  content_creator: ['french', 'german', 'spanish', 'all'],
  parent: ['all'], // Can view child's progress in any language
  student: ['french', 'german', 'spanish'], // Enrolled languages
  member: ['french', 'german', 'spanish'], // Individual subscription
} as const;

// Export content management schema for comprehensive content system
export * from './content-schema';
