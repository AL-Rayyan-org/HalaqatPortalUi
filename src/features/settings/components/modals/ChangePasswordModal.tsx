import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useI18n } from "@/shared/hooks/useI18n";
import { changePassword } from "@/features/settings/MyAccount/api/security"
import { showToast } from "@/shared/components/ui/toast-config"
import { Loader2 } from "lucide-react"
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
  Input
} from "@/shared/components/ui"

const createChangePasswordSchema = (t: (key: string) => string) => z.object({
  currentPassword: z.string().min(1, t('common:validation.required')),
  newPassword: z.string().min(8, t('common:validation.passwordMin')),
  confirmPassword: z.string().min(1, t('common:validation.required')),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: t('common:validation.passwordMismatch'),
  path: ["confirmPassword"],
})

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false)

  const changePasswordSchema = createChangePasswordSchema(t)

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true)
    try {
      const response = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })

      if (response.success) {
        showToast.success(response.message || t('common:messages.passwordChanged'))
        form.reset()
        onOpenChange(false)
      } else {
        showToast.error(response.message || t('common:messages.changePasswordFailed'))
      }
    } catch (error) {
      console.error("Change password error:", error)
      showToast.error(t('common:messages.changePasswordFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('settings:changePassword')}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
            {t('settings:changePasswordDescription')}
          </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common:currentPassword')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('common:placeholders.enterCurrentPassword')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common:newPassword')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('common:placeholders.enterNewPassword')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings:confirmNewPassword')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('common:placeholders.confirmPassword')}
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
                {t('common:cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t('settings:changePassword')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}