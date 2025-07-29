import { User, ROLE_HIERARCHY, LANGUAGE_PERMISSIONS } from '@/lib/db/schema';

// Role types matching the database enums
export type UserRole = 'super_admin' | 'institution_admin' | 'teacher' | 'student' | 'parent' | 'content_creator' | 'member';
export type Language = 'french' | 'german' | 'spanish' | 'all';
export type PermissionAction = 
  | 'create_class' 
  | 'edit_class' 
  | 'delete_class'
  | 'enroll_student' 
  | 'remove_student'
  | 'assign_teacher'
  | 'view_progress'
  | 'edit_content'
  | 'manage_institution'
  | 'invite_users'
  | 'view_analytics'
  | 'manage_subscriptions';

// Permission matrix for role-based access control
export const PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  super_admin: [
    'create_class', 'edit_class', 'delete_class', 'enroll_student', 'remove_student',
    'assign_teacher', 'view_progress', 'edit_content', 'manage_institution', 
    'invite_users', 'view_analytics', 'manage_subscriptions'
  ],
  institution_admin: [
    'create_class', 'edit_class', 'delete_class', 'enroll_student', 'remove_student',
    'assign_teacher', 'view_progress', 'invite_users', 'view_analytics'
  ],
  teacher: [
    'create_class', 'edit_class', 'enroll_student', 'remove_student', 'view_progress'
  ],
  content_creator: [
    'edit_content', 'view_progress'
  ],
  parent: [
    'view_progress'
  ],
  student: [],
  member: []
};

// Check if user has permission for a specific action
export function hasPermission(userRole: UserRole, action: PermissionAction): boolean {
  return PERMISSIONS[userRole].includes(action);
}

// Check if user has higher or equal role than required
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Check if user can access specific language content
export function canAccessLanguage(userRole: UserRole, language: Language): boolean {
  const allowedLanguages = LANGUAGE_PERMISSIONS[userRole] as readonly string[];
  return allowedLanguages.includes(language) || allowedLanguages.includes('all');
}

// Check if user can manage another user (role hierarchy)
export function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

// Educational role checks
export function isEducationalRole(role: UserRole): boolean {
  return ['teacher', 'student', 'parent', 'institution_admin'].includes(role);
}

export function isTeacher(role: UserRole): boolean {
  return role === 'teacher';
}

export function isStudent(role: UserRole): boolean {
  return role === 'student';
}

export function isParent(role: UserRole): boolean {
  return role === 'parent';
}

export function isInstitutionAdmin(role: UserRole): boolean {
  return role === 'institution_admin';
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

// Language-specific role assignments
export interface TeacherAssignment {
  teacherId: number;
  language: Language;
  institutionId?: number;
}

export interface StudentEnrollment {
  studentId: number;
  classId: number;
  language: Language;
}

// Role-based UI helpers
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    super_admin: 'Super Administrator',
    institution_admin: 'Institution Administrator',
    teacher: 'Teacher',
    student: 'Student',
    parent: 'Parent',
    content_creator: 'Content Creator',
    member: 'Member'
  };
  return displayNames[role];
}

export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    super_admin: 'bg-purple-100 text-purple-800',
    institution_admin: 'bg-blue-100 text-blue-800',
    teacher: 'bg-green-100 text-green-800',
    student: 'bg-yellow-100 text-yellow-800',
    parent: 'bg-pink-100 text-pink-800',
    content_creator: 'bg-indigo-100 text-indigo-800',
    member: 'bg-gray-100 text-gray-800'
  };
  return colors[role];
}

export function getLanguageDisplayName(language: Language): string {
  const displayNames: Record<Language, string> = {
    french: 'French',
    german: 'German', 
    spanish: 'Spanish',
    all: 'All Languages'
  };
  return displayNames[language];
}

export function getLanguageFlag(language: Language): string {
  const flags: Record<Language, string> = {
    french: '🇫🇷',
    german: '🇩🇪',
    spanish: '🇪🇸',
    all: '🌍'
  };
  return flags[language];
}

// Validation helpers
export function validateRoleTransition(currentRole: UserRole, newRole: UserRole, actorRole: UserRole): boolean {
  // Super admin can assign any role
  if (actorRole === 'super_admin') return true;
  
  // Institution admin can assign roles except super_admin
  if (actorRole === 'institution_admin' && newRole !== 'super_admin') return true;
  
  // Teachers can only assign student roles
  if (actorRole === 'teacher' && newRole === 'student') return true;
  
  return false;
}

export function validateLanguageAccess(userRole: UserRole, requestedLanguages: Language[]): boolean {
  const allowedLanguages = LANGUAGE_PERMISSIONS[userRole] as readonly string[];
  
  // If user has 'all' access, they can access any language
  if (allowedLanguages.includes('all')) return true;
  
  // Check if all requested languages are in allowed list
  return requestedLanguages.every(lang => allowedLanguages.includes(lang));
}

// Context-aware permission checks
export interface PermissionContext {
  userId: number;
  role: UserRole;
  institutionId?: number;
  classId?: number;
  language?: Language;
  targetUserId?: number;
  targetRole?: UserRole;
}

export function checkContextualPermission(
  context: PermissionContext, 
  action: PermissionAction
): boolean {
  const { role, language, targetRole } = context;
  
  // Basic permission check
  if (!hasPermission(role, action)) return false;
  
  // Language-specific checks
  if (language && !canAccessLanguage(role, language)) return false;
  
  // Role hierarchy checks for user management actions
  if (targetRole && ['enroll_student', 'remove_student', 'assign_teacher'].includes(action)) {
    return canManageUser(role, targetRole);
  }
  
  return true;
} 