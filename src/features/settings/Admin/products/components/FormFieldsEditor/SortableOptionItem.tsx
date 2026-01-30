import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useI18n } from "@/shared/hooks/useI18n";
import { Button, Input } from "@/shared/components/ui";
import type { ListOption } from "@/features/settings/Admin/types";

interface SortableOptionItemProps {
  option: ListOption;
  index: number;
  fieldId: string;
  canEditForm: boolean;
  optionsLength: number;
  isDefault: boolean;
  onSetDefault: () => void;
  onUpdate: (newName: string) => void;
  onRemove: () => void;
}

/**
 * Sortable Option Item Component
 *
 * Renders a draggable option item with:
 * - Drag handle for reordering
 * - Radio button to set as default option
 * - Input field for option name
 * - Delete button (if more than one option exists)
 */
export function SortableOptionItem({
  option,
  canEditForm,
  optionsLength,
  isDefault,
  onSetDefault,
  onUpdate,
  onRemove,
}: SortableOptionItemProps) {
  const { t } = useI18n();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.value });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <div
        {...attributes}
        {...listeners}
        className="cursor-move text-muted-foreground shrink-0"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <button
        type="button"
        onClick={onSetDefault}
        className="h-5 w-5 rounded-full flex justify-center items-center border-2 shrink-0 hover:bg-accent transition-colors"
        aria-label={t("settings:services.setAsDefault")}
      >
        {isDefault && <div className="h-3 w-3 rounded-full bg-primary" />}
      </button>
      <Input
        placeholder={t("settings:services.fieldSettings.optionName")}
        value={option.name}
        onChange={(e) => onUpdate(e.target.value)}
        className={!option.name.trim() ? "border-destructive" : ""}
      />
      {canEditForm && optionsLength > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive h-9 w-9 p-0 shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
