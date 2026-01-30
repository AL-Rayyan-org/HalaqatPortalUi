/**
 * Format a date string to a readable format: Day, Month Year
 * Example: "14, Oct 2025" or "05, Oct 2025"
 * 
 * @param dateString - ISO date string or undefined
 * @returns Formatted date string or '-' if no date provided
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  // Get day, month, and year
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  
  // Format: day, month year (e.g., "14, Oct 2025" or "05, Oct 2025")
  return `${day}, ${month} ${year}`;
}

/**
 * Format a date string to include date and time
 * Example: "14, Oct 2025 10:30 AM" or "05, Oct 2025 03:45 PM"
 * 
 * @param dateString - ISO date string or undefined
 * @returns Formatted date and time string or '-' if no date provided
 */
export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  // Get day, month, and year
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  
  // Get time in 12-hour format
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  // Format: day, month year time (e.g., "14, Oct 2025 10:30 AM")
  return `${day}, ${month} ${year} ${displayHours}:${minutes} ${ampm}`;
}
