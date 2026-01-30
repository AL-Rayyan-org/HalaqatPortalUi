import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Determines if a navigation path is active based on current location
 * 
 * @param currentPath - The current router path (e.g. from useLocation().pathname)
 * @param itemPath - The path of the navigation item to check
 * @param exact - Whether to only match exact paths
 * @param allPaths - Array of all navigation item paths (to check for conflicts)
 * @returns boolean indicating if the path is active
 * 
 * @example
 * // Basic usage in a component
 * const location = useLocation();
 * const isActive = isPathActive(location.pathname, '/settings', false, allNavItems.map(item => item.href));
 */
export function isPathActive(
  currentPath: string,
  itemPath: string,
  exact: boolean,
  allPaths: string[]
): boolean {
  // If exact matching is required
  if (exact) {
    return currentPath === itemPath;
  }
  
  // Exact path match
  if (currentPath === itemPath) return true;
  
  // Path starts with itemPath followed by slash
  if (currentPath.startsWith(itemPath + '/')) {
    // Check if another path is a more specific match
    const conflictingPath = allPaths.find(otherPath => 
      otherPath !== itemPath && // not the current path
      otherPath.length > itemPath.length && // more specific path
      currentPath.startsWith(otherPath) // actual path match
    );
    
    return !conflictingPath;
  }
  
  return false;
}