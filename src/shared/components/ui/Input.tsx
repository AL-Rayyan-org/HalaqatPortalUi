import * as React from "react"

import { cn } from "@/shared/utils/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  dir?: "ltr" | "rtl" | "auto"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, dir = "auto", ...props }, ref) => {
    return (
      <input
        type={type}
        dir={dir}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2  ring-offset-background file:border-0 file:bg-transparent file: file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-1 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:border-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }