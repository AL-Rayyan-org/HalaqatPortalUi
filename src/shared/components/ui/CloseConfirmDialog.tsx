import { useI18n } from "@/shared/hooks/useI18n";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";

interface CloseConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export function CloseConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
}: CloseConfirmDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title || t("common:unsavedChanges")}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          {description || t("common:unsavedChangesDescription")}
        </p>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {cancelText || t("common:cancel")}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {confirmText || t("common:close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
