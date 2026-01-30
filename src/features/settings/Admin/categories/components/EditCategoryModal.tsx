import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@/shared/hooks/useI18n";
import { showToast } from "@/shared/components/ui/toast-config";
import {
  getCategoryById,
  updateCategory,
} from "@/features/settings/Admin/api/categoriesApi";
import type {
  Category,
  UpdateCategoryRequest,
} from "@/features/settings/Admin/types";

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

interface EditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  categoryId: string | null;
}

export function EditCategoryModal({
  open,
  onOpenChange,
  onSuccess,
  categoryId,
}: EditCategoryModalProps) {
  const { t } = useI18n();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // Fetch category data when modal opens
  useEffect(() => {
    const fetchCategory = async () => {
      if (!open || !categoryId) {
        setCategory(null);
        return;
      }

      setIsLoading(true);
      try {
        const response = await getCategoryById(categoryId);
        if (response.success && response.data) {
          setCategory(response.data);
          form.reset({ name: response.data.name });
        } else {
          showToast.error(response.message || t("common:error"));
          onOpenChange(false);
        }
      } catch {
        showToast.error(t("common:error"));
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [open, categoryId, form, t, onOpenChange]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!category) return;

    try {
      const requestData: UpdateCategoryRequest = {
        name: values.name.trim(),
      };

      const response = await updateCategory(category.id, requestData);

      if (response.success) {
        showToast.success(t("settings:categories.updated"));
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
          <DialogTitle>{t("settings:categories.editCategory")}</DialogTitle>
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
                      disabled={isLoading}
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
                disabled={isLoading || form.formState.isSubmitting}
              >
                {t("common:cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isLoading || form.formState.isSubmitting}
              >
                {isLoading
                  ? t("common:loading")
                  : form.formState.isSubmitting
                    ? t("common:updating")
                    : t("common:update")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
