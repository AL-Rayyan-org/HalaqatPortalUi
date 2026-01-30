import { ROLE_KEYS } from "./roles";
import type { UserRole } from "@/shared/types/api";

/**
 * Get avatar background and text color classes based on user role
 * Returns Tailwind classes for different roles with dark mode support
 */
export function getAvatarColorByRole(role: UserRole | undefined | null): string {
  if (!role) {
    // Default color for unknown roles (blue)
    return "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
  }

  const lowerRole = role.toLowerCase();

  // Owner - Purple color
  if (lowerRole === ROLE_KEYS.OWNER.toLowerCase()) {
    return "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  }

  // Admin - Green color
  if (lowerRole === ROLE_KEYS.ADMIN.toLowerCase()) {
    return "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  }

  // Member - Blue color (default)
  return "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
}
