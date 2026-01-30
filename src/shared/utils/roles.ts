/**
 * Centralized role management utility
 * 
 * To change role keys in the future, ONLY update the ROLE_KEYS object below.
 * All role-related logic throughout the app uses these utilities.
 */

// ==================== ROLE KEYS (Server Values) ====================
// Change these values when server role keys change
export const ROLE_KEYS = {
  OWNER: 'system_owner',
  ADMIN: 'system_admin',
  TEACHER: 'system_teacher',
} as const;

// ==================== TYPES ====================
export type UserRole = typeof ROLE_KEYS[keyof typeof ROLE_KEYS];

// Union types for specific use cases
export type InvitableRole = typeof ROLE_KEYS.ADMIN | typeof ROLE_KEYS.TEACHER;
export type AdminRole = typeof ROLE_KEYS.ADMIN | typeof ROLE_KEYS.OWNER;

// ==================== ROLE CHECKS ====================

/**
 * Check if a role is an admin role (owner or admin)
 */
export const isAdminRole = (role: string | undefined | null): boolean => {
  if (!role) return false;
  const lowerRole = role.toLowerCase();
  return lowerRole === ROLE_KEYS.ADMIN.toLowerCase() || 
         lowerRole === ROLE_KEYS.OWNER.toLowerCase();
};

/**
 * Check if a role is owner
 */
export const isOwnerRole = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return role.toLowerCase() === ROLE_KEYS.OWNER.toLowerCase();
};

/**
 * Check if a role is teacher
 */
export const isTeacherRole = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return role.toLowerCase() === ROLE_KEYS.TEACHER.toLowerCase();
};

/**
 * Check if current user role can manage a target teacher role
 */
export const canManageRole = (currentRole: string | undefined | null, targetRole: string | undefined | null): boolean => {
  if (!currentRole || !targetRole) return false;
  
  // Teachers can't manage anyone
  if (isTeacherRole(currentRole)) return false;
  
  // Owners can manage everyone
  if (isOwnerRole(currentRole)) return true;
  
  // Admins can only manage teachers
  return !isAdminRole(targetRole) && !isOwnerRole(targetRole);
};

// ==================== ROLE DISPLAY MAPPING ====================

/**
 * Get translation key for a role
 * Returns the i18n key that should be used with t() function
 */
export const getRoleTranslationKey = (role: string | undefined | null): string => {
  if (!role) return 'common:roles.teacher';
  
  const lowerRole = role.toLowerCase();
  
  if (lowerRole === ROLE_KEYS.OWNER.toLowerCase()) {
    return 'common:roles.owner';
  }
  if (lowerRole === ROLE_KEYS.ADMIN.toLowerCase()) {
    return 'common:roles.admin';
  }
  return 'common:roles.teacher';
};

/**
 * Get badge variant for a role (used in UI components)
 */
export const getRoleBadgeVariant = (role: string | undefined | null): 'default' | 'secondary' | 'outline' => {
  if (!role) return 'outline';
  
  const lowerRole = role.toLowerCase();
  
  if (lowerRole === ROLE_KEYS.OWNER.toLowerCase()) {
    return 'secondary';
  }
  if (lowerRole === ROLE_KEYS.ADMIN.toLowerCase()) {
    return 'default';
  }
  return 'outline';
};

// ==================== ROLE ARRAYS ====================

/**
 * Get all invitable roles (for dropdowns, forms, etc.)
 * Returns array of { value, labelKey } for use with Select components
 */
export const getInvitableRoles = () => [
  { value: ROLE_KEYS.TEACHER, labelKey: 'common:roles.teacher' },
  { value: ROLE_KEYS.ADMIN, labelKey: 'common:roles.admin' },
] as const;

/**
 * Get all admin roles as array
 */
export const getAdminRoles = (): readonly string[] => [
  ROLE_KEYS.ADMIN,
  ROLE_KEYS.OWNER,
] as const;
