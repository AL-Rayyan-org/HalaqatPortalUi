import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@/shared/hooks/useI18n";
import { showToast } from "@/shared/components/ui/toast-config";
import { createCategory } from "@/features/settings/Admin/api/categoriesApi";
import type { CreateCategoryRequest } from "@/features/settings/Admin/types";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/shared/components/ui";

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddCategoryModal({
  open,
  onOpenChange,
  onSuccess,
}: AddCategoryModalProps) {
  const { t } = useI18n();

  // Form schema with validation
  const formSchema = z.object({
    name: z.string().min(1, { message: t("common:validation.required") }),
  });

  type FormValues = z.infer<typeof formSchema>;

  // Setup form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      const requestData: CreateCategoryRequest = {
        name: values.name.trim(),
      };

      const response = await createCategory(requestData);

      if (response.success) {
        showToast.success(t("settings:categories.created"));
        form.reset();
        onOpenChange(false);
        onSuccess();
      } else {
        showToast.error(response.message || t("common:error"));
      }
    } catch {
      showToast.error(t("common:error"));
    }
  };

  // Reset form when modal closes
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
          <DialogTitle>{t("settings:categories.newCategory")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common:name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("settings:categories.namePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                {t("common:cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? t("common:saving")
                  : t("common:save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
