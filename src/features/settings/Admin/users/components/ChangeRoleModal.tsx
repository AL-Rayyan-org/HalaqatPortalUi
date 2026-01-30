import { useState, useEffect } from "react";
import { useI18n } from "@/shared/hooks/useI18n";
import { showToast } from "@/shared/components/ui/toast-config";
import {
  getInvitableRoles,
  getRoleTranslationKey,
  ROLE_KEYS,
} from "@/shared/utils/roles";
import { updateSystemUserRole } from "@/features/settings/Admin/api/usersApi";
import type { InvitableRole, UserRole } from "@/shared/types/api";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
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

interface ChangeRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentRole: UserRole;
  onRoleChanged: (userId: string, newRole: InvitableRole) => void;
}

export function ChangeRoleModal({
  open,
  onOpenChange,
  userId,
  userName,
  currentRole,
  onRoleChanged,
}: ChangeRoleModalProps) {
  const { t } = useI18n();
  const [selectedRole, setSelectedRole] = useState<InvitableRole>(
    currentRole === ROLE_KEYS.OWNER
      ? ROLE_KEYS.ADMIN
      : (currentRole as InvitableRole)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update selected role when modal opens or current role changes
  useEffect(() => {
    if (open) {
      setSelectedRole(
        currentRole === ROLE_KEYS.OWNER
          ? ROLE_KEYS.ADMIN
          : (currentRole as InvitableRole)
      );
    }
  }, [open, currentRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      showToast.error(t("common:validation.required"));
      return;
    }

    // Don't submit if role hasn't changed
    if (selectedRole === currentRole) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateSystemUserRole(userId, {
        role: selectedRole,
      });

      if (response.success) {
        showToast.success(t("settings:messages.userRoleUpdated"));
        onRoleChanged(userId, selectedRole);
        onOpenChange(false);
      } else {
        showToast.error(
          response.message || t("settings:errors.failedToUpdateUserRole")
        );
      }
    } catch {
      showToast.error(t("settings:errors.failedToUpdateUserRole"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
    }
  };

  const availableRoles = getInvitableRoles();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("settings:actions.changeRole")}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <DialogDescription className="mb-4">
              {t("settings:modals.changeRole.description", {
                name: userName,
              })}
            </DialogDescription>
            <FormFieldWrapper>
              <Label htmlFor="role">{t("common:role")}</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setSelectedRole(value as InvitableRole)
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder={t("common:selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {t(getRoleTranslationKey(role.value))}
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
            <Button
              type="submit"
              disabled={isSubmitting || selectedRole === currentRole}
            >
              {isSubmitting ? t("common:saving") : t("common:save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
