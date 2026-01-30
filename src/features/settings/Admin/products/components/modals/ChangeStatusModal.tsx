import { useState, useEffect } from "react";
import { useI18n } from "@/shared/hooks/useI18n";
import { showToast } from "@/shared/components/ui/toast-config";
import { updateProductStatus } from "@/features/settings/Admin/api/productsApi";
import type { ProductStatus } from "@/features/settings/Admin/types";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormFieldWrapper,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";

interface ChangeStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  currentStatus: ProductStatus;
  onStatusChanged: (productId: string, newStatus: ProductStatus) => void;
}

const STATUS_OPTIONS: { value: ProductStatus; labelKey: string }[] = [
  { value: "active", labelKey: "settings:services.status.active" },
  { value: "inactive", labelKey: "settings:services.status.inactive" },
];

export function ChangeStatusModal({
  open,
  onOpenChange,
  productId,
  currentStatus,
  onStatusChanged,
}: ChangeStatusModalProps) {
  const { t } = useI18n();
  const [selectedStatus, setSelectedStatus] =
    useState<ProductStatus>(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update selected status when modal opens or current status changes
  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
    }
  }, [open, currentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStatus) {
      showToast.error(t("common:validation.required"));
      return;
    }

    // Don't submit if status hasn't changed
    if (selectedStatus === currentStatus) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateProductStatus(productId, {
        status: selectedStatus,
      });

      if (response.success) {
        showToast.success(t("settings:services.statusUpdated"));
        onStatusChanged(productId, selectedStatus);
        onOpenChange(false);
      } else {
        showToast.error(
          response.message ||
            t("settings:services.errors.failedToUpdateStatus"),
        );
      }
    } catch {
      showToast.error(t("settings:services.errors.failedToUpdateStatus"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("settings:services.changeStatus")}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <FormFieldWrapper>
              <Label htmlFor="status">{t("common:status")}</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(value as ProductStatus)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder={t("common:selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldWrapper>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("common:cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("common:saving") : t("common:save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
