import { useI18n } from "@/shared/hooks/useI18n";
import type {
  DeliveryOption,
  DeliveryType,
  PriceType,
} from "@/features/settings/Admin/types";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
} from "@/shared/components/ui";
import { Plus, Trash2, Truck, GripVertical } from "lucide-react";
import { hexId } from "@/shared/utils/hexIdGenerator";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DeliveryOptionsEditorProps {
  value: DeliveryOption[];
  onChange: (options: DeliveryOption[]) => void;
}

const DELIVERY_TYPES: DeliveryType[] = [
  "online",
  "inBranch",
  "domesticShipping",
  "internationalShipping",
];

export function DeliveryOptionsEditor({
  value,
  onChange,
}: DeliveryOptionsEditorProps) {
  const { t } = useI18n();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addOption = () => {
    const newOption: DeliveryOption = {
      id: hexId(),
      deliveryType: "online",
      notes: "",
      priceType: "fixed",
      price: 0,
    };
    onChange([...value, newOption]);
  };

  const updateOption = (index: number, updates: Partial<DeliveryOption>) => {
    const updated = [...value];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeOption = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((opt) => opt.id === active.id);
      const newIndex = value.findIndex((opt) => opt.id === over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={addOption}>
          <Plus className="h-4 w-4 me-2" />
          {t("add")}
        </Button>
      </div>

      {value.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Truck className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {t("settings:services.noDeliveryOptions")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={value.map((o) => o.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {value.map((option, index) => (
                <SortableDeliveryOption
                  key={option.id}
                  option={option}
                  index={index}
                  onUpdate={updateOption}
                  onRemove={removeOption}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

interface SortableDeliveryOptionProps {
  option: DeliveryOption;
  index: number;
  onUpdate: (index: number, updates: Partial<DeliveryOption>) => void;
  onRemove: (index: number) => void;
}

function SortableDeliveryOption({
  option,
  index,
  onUpdate,
  onRemove,
}: SortableDeliveryOptionProps) {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move text-muted-foreground mt-2"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={option.deliveryType}
                onValueChange={(val: DeliveryType) =>
                  onUpdate(index, { deliveryType: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`settings:services.deliveryTypes.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={option.priceType}
                onValueChange={(val: PriceType) =>
                  onUpdate(index, { priceType: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">
                    {t("settings:services.priceTypes.fixed")}
                  </SelectItem>
                  <SelectItem value="setLater">
                    {t("settings:services.priceTypes.setLater")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {option.priceType === "fixed" && (
              <div className="relative flex items-center w-full">
                <Input
                  type="text"
                  min={0}
                  placeholder={t("settings:services.price")}
                  value={option.price}
                  onChange={(e) =>
                    onUpdate(index, { price: Number(e.target.value) || 0 })
                  }
                />
                <div className="absolute inset-y-0 end-3 flex items-center pointer-events-none text-muted-foreground text-sm border-s ps-2 h-2/3 my-auto">
                  {t("common:sar")}
                </div>
              </div>
            )}

            <Input
              value={option.notes}
              onChange={(e) => onUpdate(index, { notes: e.target.value })}
              placeholder={t("settings:services.notesPlaceholder")}
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
