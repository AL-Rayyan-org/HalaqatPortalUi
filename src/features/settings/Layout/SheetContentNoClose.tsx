import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils/cn"

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out animate-in animate-out duration-300",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b",
        bottom: "inset-x-0 bottom-0 border-t",
        left: "inset-y-0 left-0 h-full w-3/4 ltr:border-r rtl:border-l slide-in-from-left slide-out-to-left sm:max-w-sm",
        right: "inset-y-0 end-0 h-full w-3/4 border-l slide-in-from-right slide-out-to-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentNoCloseProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

// This is a custom SheetContent that doesn't include the default close button
export const SheetContentNoClose = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentNoCloseProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className="fixed inset-0 z-50 backdrop-blur-xs fade-in-0 fade-out-0" />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
))

SheetContentNoClose.displayName = "SheetContentNoClose"