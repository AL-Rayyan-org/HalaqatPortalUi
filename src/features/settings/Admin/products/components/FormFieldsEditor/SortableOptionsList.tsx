import { useState } from "react";
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
import { Plus, GripVertical } from "lucide-react";
import { useI18n } from "@/shared/hooks/useI18n";
import { Button } from "@/shared/components/ui";
import { hexId } from "@/shared/utils/hexIdGenerator";
import type {
  FormFieldSettings,
  ListOption,
  ListDisplayType,
} from "@/features/settings/Admin/types";
import { SortableOptionItem } from "./SortableOptionItem";

interface SortableOptionsListProps {
  fieldId: string;
  options: ListOption[];
  defaultValue: string | null;
  canEditForm: boolean;
  onUpdate: (settings: FormFieldSettings) => void;
  listSettings: {
    options: ListOption[];
    default: string | null;
    displayType: ListDisplayType;
  };
}

/**
 * Sortable Options List Component
 *
 * Manages a drag-and-drop list of options for a list field type.
 * Features:
 * - Drag-and-drop reordering of options
 * - Set default option via radio button
 * - Add new options
 * - Edit option names
 * - Delete options (if more than one exists)
 * - Visual drag overlay feedback
 */
export function SortableOptionsList({
  fieldId,
  options,
  defaultValue,
  canEditForm,
  onUpdate,
  listSettings,
}: SortableOptionsListProps) {
  const { t } = useI18n();
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveOptionId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = options.findIndex((opt) => opt.value === active.id);
      const newIndex = options.findIndex((opt) => opt.value === over.id);
      const newOptions = arrayMove(options, oldIndex, newIndex);
      onUpdate({ ...listSettings, options: newOptions });
    }

    setActiveOptionId(null);
  };

  const activeOption = activeOptionId
    ? options.find((opt) => opt.value === activeOptionId)
    : null;

  const handleDefaultChange = (value: string) => {
    onUpdate({ ...listSettings, default: value });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={options.map((opt) => opt.value)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {options.map((option, idx) => (
            <SortableOptionItem
              key={option.value}
              option={option}
              index={idx}
              fieldId={fieldId}
              canEditForm={canEditForm}
              optionsLength={options.length}
              isDefault={defaultValue === option.value}
              onSetDefault={() => handleDefaultChange(option.value)}
              onUpdate={(newName) => {
                const newOptions = [...options];
                const optionIndex = newOptions.findIndex(
                  (opt) => opt.value === option.value
                );
                if (optionIndex !== -1) {
                  newOptions[optionIndex] = {
                    ...newOptions[optionIndex],
                    name: newName,
                  };
                  onUpdate({ ...listSettings, options: newOptions });
                }
              }}
              onRemove={() => {
                const newOptions = options.filter(
                  (opt) => opt.value !== option.value
                );
                // Clear default if deleted option was selected
                const newDefault =
                  listSettings.default === option.value
                    ? null
                    : listSettings.default;
                onUpdate({
                  ...listSettings,
                  options: newOptions,
                  default: newDefault,
                });
              }}
            />
          ))}
        </div>
      </SortableContext>
      {canEditForm && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const newOptions = [...options, { name: "", value: hexId() }];
            onUpdate({ ...listSettings, options: newOptions });
          }}
          className="mt-2"
        >
          <Plus className="h-4 w-4 me-2" />
          {t("settings:addOption")}
        </Button>
      )}
      <DragOverlay>
        {activeOption ? (
          <div className="flex items-center gap-2 bg-background border rounded-md p-2 shadow-lg">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="h-4 w-4 rounded-full flex justify-center items-center border-2 border-primary shrink-0">
              {defaultValue === activeOption.value && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-sm">
              {activeOption.name ||
                t("settings:services.fieldSettings.optionName")}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
