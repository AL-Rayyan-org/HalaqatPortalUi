import { useState, useEffect } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui";
import { getColors } from "@/shared/services/listsService";
import { showToast } from "@/shared/components/ui/toast-config";
import { useI18n } from "@/shared/hooks/useI18n";

interface ColorSelectorProps {
  value: string;
  onValueChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorSelector({
  value,
  onValueChange,
  disabled,
}: ColorSelectorProps) {
  const { t } = useI18n();
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadColors = async () => {
      setLoading(true);
      try {
        const response = await getColors();
        if (response.success && response.data) {
          setColors(response.data);
          // Set first color as default if no color selected
          if (!value && response.data.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * response.data.length
            );
            onValueChange(response.data[randomIndex]);
          }
        }
      } catch {
        showToast.error(t("errors.failedToLoadColors"));
      } finally {
        setLoading(false);
      }
    };

    if (colors.length === 0) {
      loadColors();
    }
  }, [colors.length, value, onValueChange, t]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-2 rounded-md flex items-center justify-between gap-2 min-w-[40px]"
          disabled={disabled || loading}
        >
          <div
            className="w-6 h-6 rounded-sm flex-shrink-0"
            style={{ backgroundColor: value ? `#${value}` : "#f3f4f6" }}
          />
          <svg
            width="8"
            height="5"
            viewBox="0 0 8 5"
            fill="none"
            className="opacity-70 flex-shrink-0"
          >
            <path
              d="M1 1L4 4L7 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        dir={useI18n().i18n.dir()}
        className="p-3 absolute w-full min-w-[220px] lg:min-w-[380px]"
      >
        <div className="grid grid-cols-5 lg:grid-cols-10 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onValueChange(color)}
              className={`
                w-8 h-8 rounded-sm cursor-pointer
                ${value === color ? "ring-2" : ""}
              `}
              style={{ backgroundColor: `#${color}` }}
              title={`#${color}`}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
