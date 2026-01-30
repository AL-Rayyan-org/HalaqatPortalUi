import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border text-sm px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-muted dark:text-white",
        destructive: "border-transparent bg-destructive text-white",
        green: "border-transparent bg-green-600 text-white",
        alert: "border-transparent bg-yellow-400 text-yellow-950",
        outline: "text-foreground",
        success:
          "border-transparent dark:bg-muted bg-emerald-100 dark:text-emerald-500 text-emerald-900",
        warning:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        error:
          "border-transparent dark:bg-secondary bg-red-100 dark:text-red-500 text-red-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
