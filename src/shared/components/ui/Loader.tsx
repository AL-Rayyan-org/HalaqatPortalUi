import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";
import { useI18n } from "@/shared/hooks/useI18n";

type LoaderVariant = "container" | "fixed" | "fullscreen";

interface LoaderProps {
  /** Loading state */
  isLoading?: boolean;
  /** Text to display below the spinner */
  text?: string;
  /** Children to render when not loading */
  children?: ReactNode;
  /** Optional minimum height */
  minHeight?: string;
  /** Optional className for styling */
  className?: string;
  /** Variant determines how the loader is positioned */
  variant?: LoaderVariant;
}

/**
 * Loader component that shows a spinner when loading and renders children when not.
 * Supports different positioning variants:
 * - container: Centered within the parent container (default)
 * - fixed: Fixed position in the center of the viewport
 * - fullscreen: Covers the entire viewport with an overlay
 *
 * @example
 * // Basic usage with children
 * <Loader isLoading={isLoading}>
 *   <YourContent />
 * </Loader>
 *
 * @example
 * // Fixed in viewport with custom text
 * <Loader variant="fixed" isLoading text="Fetching data..." />
 *
 * @example
 * // Fullscreen overlay with blur
 * <Loader variant="fullscreen" isLoading text="Processing..." />
 */
export function Loader({
  isLoading = true,
  text,
  children,
  minHeight = "h-full",
  className,
  variant = "fixed", // Default to fixed for better visibility
}: LoaderProps) {
  const { t } = useI18n();
  const loadingText = text || t("loading");
  // If not loading, just render the children
  if (!isLoading) {
    return <>{children}</>;
  }

  // The spinner and text content
  const loaderContent = (
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">{loadingText}</p>
    </div>
  );

  // Render the loader based on the selected variant
  switch (variant) {
    case "container":
      // Simple centered loader within container
      return (
        <div
          className={cn(
            "flex items-center justify-center",
            minHeight,
            className,
          )}
        >
          {loaderContent}
        </div>
      );

    case "fixed":
      // Fixed position loader in center of viewport
      return (
        <div className={cn("relative", minHeight, className)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            {loaderContent}
          </div>
          <div className="invisible">{children}</div>
        </div>
      );

    case "fullscreen":
      // Fullscreen overlay with backdrop
      return (
        <div className={cn("relative", minHeight, className)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-background/80 backdrop-blur-sm absolute inset-0"></div>
            <div className="z-10">{loaderContent}</div>
          </div>
          <div className="invisible">{children}</div>
        </div>
      );

    default:
      return (
        <div
          className={cn(
            "flex items-center justify-center",
            minHeight,
            className,
          )}
        >
          {loaderContent}
        </div>
      );
  }
}
