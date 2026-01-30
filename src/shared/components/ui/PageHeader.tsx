import type { ReactNode } from "react";
import { cn } from "@/shared/utils";

interface PageHeaderProps {
  /**
   * The main title of the page
   */
  title: string;
  /**
   * Optional description text below the title
   */
  description?: string;
  /**
   * Icon to display next to the title
   */
  icon?: ReactNode;
  /**
   * Action button(s) to display on the right side
   */
  actions?: ReactNode;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            {icon}
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground hidden sm:block">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
