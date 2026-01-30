import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { useI18n } from "@/shared/hooks/useI18n";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  variant?: "default" | "destructive";
  isLoading?: boolean;
  loadingText?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  confirmText,
  cancelText,
  onConfirm,
  variant = "default",
  isLoading = false,
  loadingText,
}: ConfirmDialogProps) {
  const { t } = useI18n();

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing while loading
    if (isLoading) return;
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside while loading
          if (isLoading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing with ESC while loading
          if (isLoading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {t("common:confirmDelete")}{" "}
          <span className="font-medium">
            {t("common:selectedItem")}
          </span>?
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText || t("common:cancel")}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading
              ? loadingText || t("common:processing")
              : confirmText || t("common:confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
