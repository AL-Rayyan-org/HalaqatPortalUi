import { useI18n } from "@/shared/hooks/useI18n";
import type {
  FormField,
  ListOption,
  ListDisplayType,
} from "@/features/settings/Admin/types";
import { ChevronDown } from "lucide-react";

interface FieldPreviewProps {
  field: FormField;
}

/**
 * Field Preview Component
 *
 * Renders a preview of how the form field will appear to users.
 * Shows field-specific UI based on field type:
 * - Text: single-line or multiline input
 * - Number, Email, Phone: input placeholders
 * - Date: date selector placeholder
 * - File: file upload placeholder
 * - Country: country selector placeholder
 * - List: radio buttons with options (max 3 shown)
 */
export function FieldPreview({ field }: FieldPreviewProps) {
  return (
    <div className="space-y-2">
      <div className="bg-muted/50 p-4 rounded-md">
        <div className="space-y-2">{renderFieldPreview(field)}</div>
      </div>
    </div>
  );
}

function renderFieldPreview(field: FormField) {
  const { t } = useI18n();

  switch (field.type) {
    case "text": {
      const textSettings = field.settings as
        | {
            multiline: boolean;
            maxLength: number;
            minLength: number;
          }
        | undefined;

      if (textSettings?.multiline) {
        return (
          <div className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
            {t("settings:services.textPlaceholder")}
          </div>
        );
      }

      return (
        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
          {t("settings:services.textPlaceholder")}
        </div>
      );
    }

    case "number":
      return (
        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
          {t("settings:services.enterNumber")}
        </div>
      );

    case "email":
      return (
        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
          {t("settings:services.enterEmail")}
        </div>
      );

    case "phone":
      return (
        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
          {t("settings:services.enterPhone")}
        </div>
      );

    case "date":
      return (
        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
          {t("settings:services.selectDate")}
        </div>
      );

    case "file":
      return (
        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
          {t("settings:services.chooseFile")}
        </div>
      );

    case "country":
      return (
        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center">
          {t("settings:services.selectCountry")}
        </div>
      );

    case "list": {
      const listSettings = field.settings as
        | {
            options: ListOption[];
            default: string | null;
            displayType: ListDisplayType;
          }
        | undefined;

      if (!listSettings || listSettings.options.length === 0) {
        return null;
      }

      // Radio buttons preview
      const optionsToShow = listSettings.options.slice(0, 3);
      const hasMore = listSettings.options.length > 3;
      const isDefaultInOptions = listSettings.default
        ? listSettings.options.some((opt) => opt.value === listSettings.default)
        : false;

      return (
        <div className="space-y-2">
          {listSettings.displayType === "radio" && (
            <>
              {optionsToShow.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full flex justify-center items-center border-2 border-muted-foreground/50">
                    {listSettings.default === option.value &&
                      isDefaultInOptions && (
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      )}
                  </div>
                  <span className="text-sm">{option.name}</span>
                </div>
              ))}

              {hasMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm">...</span>
                </div>
              )}
            </>
          )}

          {listSettings.displayType === "dropdown" && (
            <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground flex items-center justify-between mt-1">
              <span>
                {optionsToShow.filter(
                  (x) => x.value === listSettings.default
                )[0]?.name ?? t("settings:services.selectOption")}
              </span>
              <span>
                <ChevronDown className="w-5 h-5"></ChevronDown>
              </span>
            </div>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}
