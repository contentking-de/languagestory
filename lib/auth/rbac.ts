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
    'create_class', 'edit_class', 'enroll_student', 'remove_student', 'view_progress',
    'invite_users' // Teachers can now invite other teachers and students
  ],
  content_creator: [
    'edit_content', 'view_progress'
  ],
  parent: [
    'view_progress'
  ],
  student: [
    'invite_users' // Students can now invite parents
  ],
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

// New function: Get available roles that a user can invite
export function getInvitableRoles(userRole: UserRole): UserRole[] {
  switch (userRole) {
    case 'super_admin':
      return ['institution_admin', 'teacher', 'student', 'parent', 'content_creator', 'member'];
    case 'institution_admin':
      return ['teacher', 'student', 'parent'];
    case 'teacher':
      return ['teacher', 'student']; // Teachers can invite other teachers and students
    case 'student':
      return ['parent']; // Students can only invite parents
    case 'parent':
    case 'content_creator':
    case 'member':
      return []; // Cannot invite anyone
    default:
      return [];
  }
}

// New function: Check if a user can invite a specific role
export function canInviteRole(inviterRole: UserRole, targetRole: UserRole): boolean {
  const invitableRoles = getInvitableRoles(inviterRole);
  return invitableRoles.includes(targetRole);
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

// Role display names for UI
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
  return displayNames[role] || role;
}

// Role badge colors for UI
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    super_admin: 'bg-red-100 text-red-800',
    institution_admin: 'bg-purple-100 text-purple-800',
    teacher: 'bg-blue-100 text-blue-800',
    student: 'bg-green-100 text-green-800',
    parent: 'bg-orange-100 text-orange-800',
    content_creator: 'bg-indigo-100 text-indigo-800',
    member: 'bg-gray-100 text-gray-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}

// Language display names
export function getLanguageDisplayName(language: Language): string {
  const displayNames: Record<Language, string> = {
    french: 'French',
    german: 'German',
    spanish: 'Spanish',
    all: 'All Languages'
  };
  return displayNames[language] || language;
}

// Language flag emojis
export function getLanguageFlag(language: Language): string {
  const flags: Record<Language, string> = {
    french: '🇫🇷',
    german: '🇩🇪',
    spanish: '🇪🇸',
    all: '🌐'
  };
  return flags[language] || '🌐';
}

// Validate role transitions (for role changes)
export function validateRoleTransition(currentRole: UserRole, newRole: UserRole, actorRole: UserRole): boolean {
  // Only super admins and institution admins can change roles
  if (!['super_admin', 'institution_admin'].includes(actorRole)) {
    return false;
  }
  
  // Cannot promote to super admin unless you are a super admin
  if (newRole === 'super_admin' && actorRole !== 'super_admin') {
    return false;
  }
  
  // Cannot promote to institution admin unless you are a super admin
  if (newRole === 'institution_admin' && actorRole !== 'super_admin') {
    return false;
  }
  
  return true;
}

// Validate language access for a user
export function validateLanguageAccess(userRole: UserRole, requestedLanguages: Language[]): boolean {
  const allowedLanguages = LANGUAGE_PERMISSIONS[userRole] as readonly string[];
  return requestedLanguages.every(lang => 
    allowedLanguages.includes(lang) || allowedLanguages.includes('all')
  );
}

// Context-aware permission checking
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
  // Basic permission check
  if (!hasPermission(context.role, action)) {
    return false;
  }
  
  // Additional context-specific checks can be added here
  return true;
} 