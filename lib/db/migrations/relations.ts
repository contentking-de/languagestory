import { relations } from "drizzle-orm/relations";
import { teams, activityLogs, users, invitations, teamMembers, institutions, classEnrollments, classes, teachingAssignments, passwordResetTokens } from "./schema";

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	team: one(teams, {
		fields: [activityLogs.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [activityLogs.userId],
		references: [users.id]
	}),
}));

export const teamsRelations = relations(teams, ({one, many}) => ({
	activityLogs: many(activityLogs),
	invitations: many(invitations),
	teamMembers: many(teamMembers),
	institution: one(institutions, {
		fields: [teams.institutionId],
		references: [institutions.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	activityLogs: many(activityLogs),
	invitations: many(invitations),
	teamMembers: many(teamMembers),
	classEnrollments: many(classEnrollments),
	classes: many(classes),
	teachingAssignments: many(teachingAssignments),
	passwordResetTokens: many(passwordResetTokens),
}));

export const invitationsRelations = relations(invitations, ({one}) => ({
	team: one(teams, {
		fields: [invitations.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [invitations.invitedBy],
		references: [users.id]
	}),
}));

export const teamMembersRelations = relations(teamMembers, ({one}) => ({
	user: one(users, {
		fields: [teamMembers.userId],
		references: [users.id]
	}),
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id]
	}),
}));

export const institutionsRelations = relations(institutions, ({many}) => ({
	teams: many(teams),
	classes: many(classes),
	teachingAssignments: many(teachingAssignments),
}));

export const classEnrollmentsRelations = relations(classEnrollments, ({one}) => ({
	user: one(users, {
		fields: [classEnrollments.studentId],
		references: [users.id]
	}),
	class: one(classes, {
		fields: [classEnrollments.classId],
		references: [classes.id]
	}),
}));

export const classesRelations = relations(classes, ({one, many}) => ({
	classEnrollments: many(classEnrollments),
	user: one(users, {
		fields: [classes.teacherId],
		references: [users.id]
	}),
	institution: one(institutions, {
		fields: [classes.institutionId],
		references: [institutions.id]
	}),
}));

export const teachingAssignmentsRelations = relations(teachingAssignments, ({one}) => ({
	user: one(users, {
		fields: [teachingAssignments.teacherId],
		references: [users.id]
	}),
	institution: one(institutions, {
		fields: [teachingAssignments.institutionId],
		references: [institutions.id]
	}),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordResetTokens.userId],
		references: [users.id]
	}),
}));