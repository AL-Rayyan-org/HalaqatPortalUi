import { useState } from "react";
import { useI18n } from "@/shared/hooks/useI18n";
import { beginEmailChange } from "@/features/settings/MyAccount/api/security"
import { showToast } from "@/shared/components/ui/toast-config";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from "@/shared/components/ui";
type FormValues = {
  email: string;
};

interface ChangeEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangeEmailDialog({ isOpen, onClose }: ChangeEmailDialogProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    email: z.string().email(t('common:validation.emailInvalid')),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSendChangeEmail = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const response = await beginEmailChange({ address: data.email });

      if (response.success) {
        showToast.success(response.message || t('common:messages.verificationEmailSent'));
        handleClose();
      } else {
        showToast.error(response.message || t('common:messages.sendVerificationFailed'));
      }
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : t('common:messages.sendVerificationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('settings:changeEmailAddress')}</DialogTitle>
        </DialogHeader>

        <DialogDescription>
            {t('settings:changeEmailDescription')}
        </DialogDescription>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSendChangeEmail)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings:newEmailAddress')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('common:placeholders.enterEmail')}
                      type="email"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('common:cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('common:sending') + '...' : t('settings:sendVerification')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}