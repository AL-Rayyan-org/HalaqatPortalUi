import * as React from "react"

import { cn } from "@/shared/utils/cn"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  dir?: "ltr" | "rtl" | "auto"
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, dir = "auto", ...props }, ref) => {
    return (
      <textarea
        dir={dir}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2  ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-1 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:border-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
