import { ShieldX } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface AccessDeniedProps {
  /**
   * Title text displayed above the message
   */
  title?: string;
  
  /**
   * Message text displayed below the icon
   */
  message?: string;
  
  /**
   * Optional className for additional styling
   */
  className?: string;
  
  /**
   * Icon size in pixels
   */
  iconSize?: number;
  
  /**
   * Whether to add container padding
   */
  withPadding?: boolean;
}

/**
 * AccessDenied component for displaying permission errors
 * 
 * @example
 * // Basic usage
 * <AccessDenied />
 * 
 * @example
 * // With custom message
 * <AccessDenied message="You need admin privileges to access this section." />
 */
export function AccessDenied({
  title = 'Access Denied',
  message = 'You do not have permission to view this page.',
  className,
  iconSize = 64,
  withPadding = true,
}: AccessDeniedProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center h-full min-h-[400px] text-center",
      withPadding && "py-6 px-4", 
      className
    )}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <ShieldX 
          className="text-destructive" 
          size={iconSize} 
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md">{message}</p>
    </div>
  );
}