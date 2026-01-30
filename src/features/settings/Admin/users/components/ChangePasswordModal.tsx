import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@/shared/hooks/useI18n";
import { changeSystemUserPassword } from "@/features/settings/Admin/api/usersApi";
import { showToast } from "@/shared/components/ui/toast-config";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
} from "@/shared/components/ui";

const createChangePasswordSchema = (t: (key: string) => string) =>
  z.object({
    newPassword: z.string().min(8, t("common:validation.passwordMin")),
  });

type ChangePasswordForm = {
  newPassword: string;
};

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: ChangePasswordDialogProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const changePasswordSchema = createChangePasswordSchema(t);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Fixed: Passing userId as the first argument, and the object as the second
      const response = await changeSystemUserPassword(userId, {
        newPassword: data.newPassword,
      });

      if (response.success) {
        showToast.success(
          response.message || t("common:messages.passwordChanged")
        );
        form.reset();
        onOpenChange(false);
      } else {
        showToast.error(
          response.message || t("common:messages.changePasswordFailed")
        );
      }
    } catch (error) {
      console.error("Change password error:", error);
      showToast.error(t("common:messages.changePasswordFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("settings:changePassword")}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {t("settings:modals.changePassword.description", { name: userName })}
        </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common:newPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("common:placeholders.enterNewPassword")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                {t("common:cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t("settings:actions.changePassword")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
