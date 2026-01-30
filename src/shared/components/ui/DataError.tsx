import { X, RefreshCw } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from './Button';
import { useI18n } from "@/shared/hooks/useI18n";

interface DataErrorProps {
  /**
   * Title text displayed below the icon
   */
  title?: string;
  
  /**
   * Message text displayed below the title
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
   * Text for the retry button
   */
  retryText?: string;
  
  /**
   * Whether to add container padding
   */
  withPadding?: boolean;

  /**
   * Custom function to call on retry. If not provided, will reload the page.
   */
  onRetry?: () => void;
}

/**
 * DataError component for displaying data loading errors with a retry option
 * 
 * @example
 * // Basic usage
 * <DataError />
 * 
 * @example
 * // With custom message and retry handler
 * <DataError 
 *   message="Unable to load user profile" 
 *   onRetry={() => refetchUserData()} 
 * />
 */
export function DataError({
  title,
  message,
  className,
  iconSize = 64,
  retryText,
  withPadding = true,
  onRetry,
}: DataErrorProps) {
  const { t } = useI18n();
  const displayTitle = title || t('errors.dataUnavailable');
  const displayMessage = message || t('errors.unableToLoad');
  const displayRetryText = retryText || t('errors.tryAgain');
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default behavior: reload the page
      window.location.reload();
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center h-full min-h-[400px]",
      withPadding && "py-6 px-4", 
      className
    )}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <X 
          className="text-destructive" 
          size={iconSize} 
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <h2 className="text-xl font-medium mb-2">{displayTitle}</h2>
      <p className="text-muted-foreground max-w-md mb-6 text-center">{displayMessage}</p>
      <Button 
        variant="outline" 
        onClick={handleRetry}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        {displayRetryText}
      </Button>
    </div>
  );
}
