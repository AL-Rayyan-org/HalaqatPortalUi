import { useI18n } from "@/shared/hooks/useI18n";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@/shared/components/ui";
import type {
  FormField,
  FormFieldSettings,
  ListDisplayType,
} from "@/features/settings/Admin/types";
import { SortableOptionsList } from "./SortableOptionsList";

interface FieldSettingsProps {
  field: FormField;
  onUpdate: (settings: FormFieldSettings) => void;
  canEditForm: boolean;
}

/**
 * Field Settings Component
 *
 * Renders type-specific settings for form fields:
 * - Text: min/max length, multiline toggle
 * - Number: min/max value
 * - Date: past only / future only toggles
 * - List: display type selector and options editor
 *
 * Returns null for field types without additional settings
 */
export function FieldSettings({
  field,
  onUpdate,
  canEditForm,
}: FieldSettingsProps) {
  const { t } = useI18n();

  if (!field.settings) return null;

  switch (field.type) {
    case "text": {
      const textSettings = field.settings as {
        multiline: boolean;
        maxLength: number;
        minLength: number;
      };
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                {t("settings:services.fieldSettings.minLength")}
              </Label>
              <Input
                type="number"
                min={0}
                value={textSettings.minLength || ""}
                onChange={(e) =>
                  onUpdate({
                    ...textSettings,
                    minLength: Number(e.target.value),
                  })
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                {t("settings:services.fieldSettings.maxLength")}
              </Label>
              <Input
                type="number"
                min={0}
                value={textSettings.maxLength || ""}
                onChange={(e) =>
                  onUpdate({
                    ...textSettings,
                    maxLength: Number(e.target.value),
                  })
                }
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`multiline-${field.id}`}
                checked={textSettings.multiline}
                onCheckedChange={(checked: boolean) =>
                  onUpdate({ ...textSettings, multiline: checked })
                }
              />
              <Label
                htmlFor={`multiline-${field.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                {t("settings:services.fieldSettings.multiline")}
              </Label>
            </div>
          </div>
        </div>
      );
    }

    case "number": {
      const numberSettings = field.settings as {
        maxValue: number;
        minValue: number;
      };
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                {t("settings:services.fieldSettings.minValue")}
              </Label>
              <Input
                type="number"
                value={numberSettings.minValue || ""}
                onChange={(e) =>
                  onUpdate({
                    ...numberSettings,
                    minValue: Number(e.target.value),
                  })
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                {t("settings:services.fieldSettings.maxValue")}
              </Label>
              <Input
                type="number"
                value={numberSettings.maxValue || ""}
                onChange={(e) =>
                  onUpdate({
                    ...numberSettings,
                    maxValue: Number(e.target.value),
                  })
                }
                placeholder="0"
              />
            </div>
          </div>
        </div>
      );
    }

    case "date": {
      const dateSettings = field.settings as {
        pastOnly: boolean;
        futureOnly: boolean;
      };
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id={`pastOnly-${field.id}`}
                checked={dateSettings.pastOnly}
                onCheckedChange={(checked: boolean) =>
                  onUpdate({
                    ...dateSettings,
                    pastOnly: checked,
                    futureOnly: false,
                  })
                }
              />
              <Label
                htmlFor={`pastOnly-${field.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                {t("settings:services.fieldSettings.pastOnly")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`futureOnly-${field.id}`}
                checked={dateSettings.futureOnly}
                onCheckedChange={(checked: boolean) =>
                  onUpdate({
                    ...dateSettings,
                    futureOnly: checked,
                    pastOnly: false,
                  })
                }
              />
              <Label
                htmlFor={`futureOnly-${field.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                {t("settings:services.fieldSettings.futureOnly")}
              </Label>
            </div>
          </div>
        </div>
      );
    }

    case "list": {
      const listSettings = field.settings as {
        options: { name: string; value: string }[];
        default: string | null;
        displayType: ListDisplayType;
      };

      return (
        <div className="space-y-4">
          {/* Display Type Selector */}
          <div>
            <Select
              value={listSettings.displayType}
              onValueChange={(val: ListDisplayType) =>
                onUpdate({ ...listSettings, displayType: val })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dropdown">
                  {t("settings:services.fieldSettings.dropdown")}
                </SelectItem>
                <SelectItem value="radio">
                  {t("settings:services.fieldSettings.radio")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            <div className="space-y-2">
              <SortableOptionsList
                fieldId={field.id}
                options={listSettings.options}
                defaultValue={listSettings.default}
                canEditForm={canEditForm}
                onUpdate={onUpdate}
                listSettings={listSettings}
              />
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
