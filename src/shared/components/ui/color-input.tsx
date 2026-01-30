import * as React from "react";
import { Input } from "./Input";
import { cn } from "@/shared/utils/cn";

export interface ColorInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "dir"> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  ({ className, value, onChange, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          value={value}
          onChange={handleChange}
          placeholder="#339AF0"
          className={cn("ps-12", className)}
          {...props}
        />
        <label
          className="absolute top-1/2 -translate-y-1/2 start-2 cursor-pointer"
          dir="ltr"
        >
          <input
            type="color"
            value={value}
            onChange={handleChange}
            className="sr-only"
          />
          <div
            className="w-7 h-7 rounded-full border-2 border-border"
            style={{ backgroundColor: value }}
          />
        </label>
      </div>
    );
  }
);

ColorInput.displayName = "ColorInput";

export { ColorInput };
