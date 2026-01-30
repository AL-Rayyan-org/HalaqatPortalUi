import * as React from "react";
import { Input } from "./Input";
import { useI18n } from "@/shared/hooks/useI18n";
import { cn } from "@/shared/utils/cn";

export interface PriceInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange" | "dir"
> {
  value: number;
  onChange: (value: number) => void;
  dir?: "ltr" | "rtl" | "auto";
}

const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  ({ className, value, onChange, placeholder = "0", ...props }, ref) => {
    const { t } = useI18n();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = Number(e.target.value) || 0;
      onChange(numValue);
    };

    return (
      <div className={cn("relative flex items-center", className)}>
        <Input
          ref={ref}
          type="text"
          min={0}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          {...props}
        />
        <div className="absolute end-0 h-full flex items-center px-3 text-muted-foreground text-xs font-medium border-s my-auto pointer-events-none bg-muted/20 rounded-e-md">
          {t("common:sar")}
        </div>
      </div>
    );
  },
);

PriceInput.displayName = "PriceInput";

export { PriceInput };
