import { useState } from "react";
import { useI18n } from "@/shared/hooks/useI18n";
import type {
  FormField,
  FormFieldType,
  FormFieldSettings,
} from "@/features/settings/Admin/types";
import { Button, Card, CardContent } from "@/shared/components/ui";
import { hexId } from "@/shared/utils/hexIdGenerator";
import { Plus, GripVertical, FileText } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableFieldItem } from "./SortableFieldItem";

interface FormFieldsEditorProps {
  value: FormField[];
  onChange: (fields: FormField[]) => void;
  canEditForm?: boolean;
}

// Default settings for each field type
const getDefaultSettings = (
  type: FormFieldType
): FormFieldSettings | undefined => {
  switch (type) {
    case "text":
      return { multiline: false, maxLength: 0, minLength: 0 };
    case "number":
      return { maxValue: 0, minValue: 0 };
    case "list":
      return {
        options: [{ name: "", value: hexId() }],
        default: null,
        displayType: "dropdown",
      };
    case "date":
      return { pastOnly: false, futureOnly: false };
    case "country":
      return { countries: [], default: null };
    default:
      return undefined;
  }
};

/**
 * Form Fields Editor Component
 *
 * Main component for managing dynamic form fields in a product/service form.
 *
 * Features:
 * - Add, edit, delete, and reorder form fields via drag-and-drop
 * - Expandable/collapsible field items for better UX
 * - Support for multiple field types: text, number, list, date, phone, email, file, country
 * - Each field type has its own specific settings and preview
 * - Empty state with call-to-action to add first field
 * - Visual drag overlay during field reordering
 *
 * Props:
 * - value: Array of FormField objects
 * - onChange: Callback when fields are modified
 * - canEditForm: Whether editing is allowed (default: true)
 */
export function FormFieldsEditor({
  value,
  onChange,
  canEditForm = true,
}: FormFieldsEditorProps) {
  const { t } = useI18n();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addField = (afterIndex?: number) => {
    const newField: FormField = {
      id: hexId(),
      type: "text",
      label: "",
      required: false,
      settings: getDefaultSettings("text"),
    };

    // Add new field to expanded set
    setExpandedFields((prev) => new Set(prev).add(newField.id));

    if (afterIndex === undefined) {
      // Add at the end
      onChange([...value, newField]);
    } else {
      // Add after specific index
      const newFields = [...value];
      newFields.splice(afterIndex + 1, 0, newField);
      onChange(newFields);
    }
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    const updated = value.map((field) =>
      field.id === id ? { ...field, ...updates } : field
    );
    onChange(updated);
  };

  const removeField = (id: string) => {
    onChange(value.filter((field) => field.id !== id));
  };

  const handleTypeChange = (id: string, newType: FormFieldType) => {
    updateField(id, {
      type: newType,
      settings: getDefaultSettings(newType),
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((field) => field.id === active.id);
      const newIndex = value.findIndex((field) => field.id === over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }

    setActiveId(null);
  };

  const activeField = activeId ? value.find((f) => f.id === activeId) : null;

  return (
    <div className="space-y-4">
      {value.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              {t("settings:services.noFormFields")}
            </p>
            {canEditForm && (
              <Button
                type="button"
                variant="outline"
                onClick={() => addField()}
              >
                <Plus className="h-4 w-4 me-2" />
                {t("settings:services.addField")}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={value.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {value.map((field, index) => (
                <div key={field.id} className="space-y-2">
                  <SortableFieldItem
                    field={field}
                    index={index}
                    onUpdate={updateField}
                    onRemove={removeField}
                    onTypeChange={handleTypeChange}
                    canEditForm={canEditForm}
                    isExpanded={expandedFields.has(field.id)}
                    onExpandedChange={(expanded) => {
                      setExpandedFields((prev) => {
                        const newSet = new Set(prev);
                        if (expanded) {
                          newSet.add(field.id);
                        } else {
                          newSet.delete(field.id);
                        }
                        return newSet;
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeField ? (
              <Card className="shadow-lg opacity-90">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-primary mx-3">
                      {value.findIndex((f) => f.id === activeField.id) + 1}.
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="font-medium">
                        {activeField.label || t("fieldName")}
                      </span>
                      {activeField.required && (
                        <span className="text-destructive">*</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
          {canEditForm && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => addField()}
              >
                <Plus className="h-4 w-4 me-2" />
                {t("settings:services.addField")}
              </Button>
            </div>
          )}
        </DndContext>
      )}
    </div>
  );
}
