import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/shared/hooks/useI18n";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Card,
  CardContent,
  Label,
} from "@/shared/components/ui";
import type {
  FormField,
  FormFieldType,
  FormFieldSettings,
} from "@/features/settings/Admin/types";
import { FieldSettings } from "./FieldSettings";
import { FieldPreview } from "./FieldPreview";

const FIELD_TYPES: FormFieldType[] = [
  "text",
  "number",
  "list",
  "date",
  "phone",
  "email",
  "file",
  "country",
];

interface SortableFieldItemProps {
  field: FormField;
  index: number;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onRemove: (id: string) => void;
  onTypeChange: (id: string, newType: FormFieldType) => void;
  canEditForm: boolean;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

/**
 * Sortable Field Item Component
 *
 * Renders a draggable form field with two states:
 *
 * Collapsed State:
 * - Shows field number, label, required indicator
 * - Preview of how the field will appear
 * - Expand button
 *
 * Expanded State:
 * - Field label input
 * - Field type selector
 * - Type-specific settings (via FieldSettings component)
 * - Required toggle
 * - Delete and collapse buttons
 *
 * Both states include a drag handle for reordering fields.
 */
export function SortableFieldItem({
  field,
  index,
  onUpdate,
  onRemove,
  onTypeChange,
  canEditForm,
  isExpanded,
  onExpandedChange,
}: SortableFieldItemProps) {
  const { t } = useI18n();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const labelError = !field.label.trim();

  return (
    <Card ref={setNodeRef} style={style} className="touch-none">
      <CardContent className="p-4">
        {!isExpanded ? (
          // Collapsed View
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-move text-muted-foreground"
              >
                <GripVertical className="h-5 w-5" />
              </div>

              <span className="font-medium text-primary ms-2">
                {index + 1}.
              </span>

              <div className="flex-1 flex items-center gap-2">
                <span className="font-medium">
                  {field.label || t("fieldName")}
                </span>
                {field.required && <span className="text-destructive">*</span>}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onExpandedChange(true)}
                className="h-9 w-9 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Field Preview */}
            <FieldPreview field={field} />
          </div>
        ) : (
          // Expanded View
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-move text-muted-foreground mt-2"
            >
              <GripVertical className="h-5 w-5" />
            </div>

            <div className="flex-1 space-y-4">
              {/* Field Label and Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Input
                    value={field.label}
                    onChange={(e) =>
                      onUpdate(field.id, { label: e.target.value })
                    }
                    placeholder={t("settings:services.fieldLabelPlaceholder")}
                    className={labelError ? "border-destructive" : ""}
                  />
                </div>

                <div className="space-y-2 mb-0">
                  <Select
                    value={field.type}
                    onValueChange={(val: FormFieldType) =>
                      onTypeChange(field.id, val)
                    }
                    disabled={!canEditForm}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`settings:services.fieldTypes.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Field Settings */}
              {field.settings && (
                <FieldSettings
                  field={field}
                  onUpdate={(settings: FormFieldSettings) =>
                    onUpdate(field.id, { settings })
                  }
                  canEditForm={canEditForm}
                />
              )}

              {/* Required Switch */}
              <div className="flex items-center gap-2">
                <Switch
                  id={`required-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(checked: boolean) =>
                    onUpdate(field.id, { required: checked })
                  }
                />
                <Label
                  htmlFor={`required-${field.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {t("settings:services.required")}
                </Label>
              </div>
            </div>

            <div className="flex gap-2">
              {canEditForm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(field.id)}
                  className="text-destructive hover:text-destructive h-9 w-9 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onExpandedChange(false)}
                className="h-9 w-9 p-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
