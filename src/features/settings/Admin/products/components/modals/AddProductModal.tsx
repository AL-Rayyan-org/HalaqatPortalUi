import { useState } from "react";
import { useI18n } from "@/shared/hooks/useI18n";
import { showToast } from "@/shared/components/ui/toast-config";
import { createProduct } from "@/features/settings/Admin/api/productsApi";
import type {
  ProductRequest,
  Category,
  ProductStatus,
  DeliveryOption,
  FormField as ProductFormField,
} from "@/features/settings/Admin/types";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Label,
  PriceInput,
} from "@/shared/components/ui";
import { DeliveryOptionsEditor } from "../Editorts/DeliveryOptionsEditor";
import { FormFieldsEditor } from "../Editorts/FormFieldsEditor";
import { CountriesEditor } from "../Editorts/CountriesEditor";
import { CloseConfirmDialog } from "@/shared/components/ui/CloseConfirmDialog";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  categories: Category[];
}

interface FormData {
  code: string;
  name: string;
  categoryId: string;
  status: ProductStatus;
  costPrice: number;
  sellingPrice: number;
  requirements: string;
  description: string;
  deliveryOptions: DeliveryOption[];
  formFields: ProductFormField[];
  nationalityCountries: string[];
  residencyCountries: string[];
  nationalitySelectAll: boolean;
  residencySelectAll: boolean;
}

export function AddProductModal({
  open,
  onOpenChange,
  onSuccess,
  categories,
}: AddProductModalProps) {
  const { t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    code: "",
    name: "",
    categoryId: "",
    status: "active",
    costPrice: 0,
    sellingPrice: 0,
    requirements: "",
    description: "",
    deliveryOptions: [],
    formFields: [],
    nationalityCountries: [],
    residencyCountries: [],
    nationalitySelectAll: true,
    residencySelectAll: true,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const validateForm = (): boolean => {
    if (!formData.code.trim()) {
      showToast.error(t("settings:validation.codeRequired"));
      return false;
    }
    if (!formData.name.trim()) {
      showToast.error(t("settings:validation.nameRequired"));
      return false;
    }
    if (!formData.categoryId) {
      showToast.error(t("settings:validation.categoryRequired"));
      return false;
    }
    if (formData.costPrice < 0) {
      showToast.error(t("settings:validation.priceInvalid"));
      return false;
    }
    if (formData.sellingPrice < 0) {
      showToast.error(t("settings:validation.priceInvalid"));
      return false;
    }

    // Validate nationality countries (at least one required)
    if (
      !formData.nationalitySelectAll &&
      formData.nationalityCountries.length === 0
    ) {
      showToast.error(t("settings:validation.nationalityRequired"));
      return false;
    }

    // Validate form fields
    for (const field of formData.formFields) {
      if (!field.label.trim()) {
        showToast.error(t("settings:validation.fieldLabelRequired"));
        return false;
      }

      // Validate list field options
      if (field.type === "list" && field.settings) {
        const listSettings = field.settings as {
          options: Array<{ name: string; value: string }>;
        };

        // Check for empty options
        for (const option of listSettings.options) {
          if (!option.name.trim()) {
            showToast.error(
              t("settings:validation.optionNameRequired") ||
                "Option name is required",
            );
            return false;
          }
          if (!option.value.trim()) {
            showToast.error(
              t("settings:validation.optionValueRequired") ||
                "Option value is required",
            );
            return false;
          }
        }

        // Check for duplicate values
        const valueSet = new Set<string>();
        for (const option of listSettings.options) {
          const trimmedValue = option.value.trim();
          if (valueSet.has(trimmedValue)) {
            showToast.error(
              t("settings:validation.duplicateOptionValue") ||
                "Duplicate option values are not allowed",
            );
            return false;
          }
          valueSet.add(trimmedValue);
        }
      }
    }

    return true;
  };
  // Convert form fields displayType from string to boolean for API
  const convertFormFieldsForAPI = (fields: ProductFormField[]) => {
    return fields.map((field) => {
      if (field.type === "list" && field.settings) {
        const listSettings = field.settings as any;
        return {
          ...field,
          settings: {
            ...listSettings,
            dropdown: listSettings.displayType === "dropdown",
            displayType: undefined, // Remove displayType from API payload
          },
        };
      }
      return field;
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const requestData: ProductRequest = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        status: formData.status,
        costPrice: formData.costPrice,
        sellingPrice: formData.sellingPrice,
        requirements: formData.requirements.trim(),
        description: formData.description.trim(),
        nationalityCountries: formData.nationalitySelectAll
          ? []
          : formData.nationalityCountries,
        residencyCountries: formData.residencySelectAll
          ? []
          : formData.residencyCountries,
        deliveryOptions: formData.deliveryOptions,
        form: {
          fields: convertFormFieldsForAPI(formData.formFields),
        },
      };

      const response = await createProduct(requestData);

      if (response.success) {
        showToast.success(t("settings:services.created"));
        resetForm();
        setHasChanges(false);
        onOpenChange(false);
        onSuccess();
      } else {
        showToast.error(response.message || t("common:error"));
      }
    } catch {
      showToast.error(t("common:error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      categoryId: "",
      status: "active",
      costPrice: 0,
      sellingPrice: 0,
      requirements: "",
      description: "",
      deliveryOptions: [],
      formFields: [],
      nationalityCountries: [],
      residencyCountries: [],
      nationalitySelectAll: true,
      residencySelectAll: true,
    });
    setHasChanges(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      if (hasChanges) {
        setShowCloseConfirm(true);
        return;
      }
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    resetForm();
    onOpenChange(false);
  };

  const handleFormChange = (updates: Partial<FormData>) => {
    setFormData({ ...formData, ...updates });
    setHasChanges(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[800px] overflow-hidden top-0 mt-4">
          <DialogHeader>
            <DialogTitle>{t("settings:services.newService")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">
                  {t("settings:services.tabs.basic")}
                </TabsTrigger>
                <TabsTrigger value="countries">
                  {t("settings:services.tabs.countries")}
                </TabsTrigger>
                <TabsTrigger value="delivery">
                  {t("settings:services.tabs.delivery")}
                </TabsTrigger>
                <TabsTrigger value="form">
                  {t("settings:services.tabs.form")}
                </TabsTrigger>
              </TabsList>
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="code">{t("settings:services.code")}</Label>
                    <Input
                      id="code"
                      placeholder={t("settings:services.codePlaceholder")}
                      value={formData.code}
                      onChange={(e) =>
                        handleFormChange({ code: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">{t("common:status")}</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: ProductStatus) =>
                        handleFormChange({ status: value })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inactive">
                          {t("settings:services.status.inactive")}
                        </SelectItem>
                        <SelectItem value="active">
                          {t("settings:services.status.active")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">{t("common:name")}</Label>
                  <Input
                    id="name"
                    placeholder={t("settings:services.namePlaceholder")}
                    value={formData.name}
                    onChange={(e) => handleFormChange({ name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">{t("common:category")}</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      handleFormChange({ categoryId: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue
                        placeholder={t("settings:services.selectCategory")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="costPrice">
                      {t("settings:services.costPrice")}
                    </Label>
                    <PriceInput
                      id="costPrice"
                      value={formData.costPrice}
                      onChange={(value) =>
                        handleFormChange({ costPrice: value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sellingPrice">
                      {t("settings:services.sellingPrice")}
                    </Label>
                    <PriceInput
                      id="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={(value) =>
                        handleFormChange({ sellingPrice: value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="requirements">
                    {t("settings:services.requirements")}
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder={t("settings:services.requirementsPlaceholder")}
                    className="min-h-[80px]"
                    value={formData.requirements}
                    onChange={(e) =>
                      handleFormChange({ requirements: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">
                    {t("settings:services.notes")}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={t("settings:services.notesPlaceholder")}
                    className="min-h-[80px]"
                    value={formData.description}
                    onChange={(e) =>
                      handleFormChange({ description: e.target.value })
                    }
                  />
                </div>
              </TabsContent>
              {/* Delivery Options Tab */}
              <TabsContent value="delivery" className="space-y-4 mt-6">
                <DeliveryOptionsEditor
                  value={formData.deliveryOptions}
                  onChange={(options) =>
                    handleFormChange({ deliveryOptions: options })
                  }
                />
              </TabsContent>
              {/* Form Fields Tab */}
              <TabsContent value="form" className="space-y-4 mt-6">
                <FormFieldsEditor
                  value={formData.formFields}
                  onChange={(fields) =>
                    handleFormChange({ formFields: fields })
                  }
                />
              </TabsContent>
              {/* Countries Tab */}
              <TabsContent value="countries" className="space-y-4 mt-6">
                <CountriesEditor
                  nationalityCountries={formData.nationalityCountries}
                  residencyCountries={formData.residencyCountries}
                  nationalitySelectAll={formData.nationalitySelectAll}
                  residencySelectAll={formData.residencySelectAll}
                  onNationalityChange={(countries, selectAll) =>
                    handleFormChange({
                      nationalityCountries: countries,
                      nationalitySelectAll: selectAll,
                    })
                  }
                  onResidencyChange={(countries, selectAll) =>
                    handleFormChange({
                      residencyCountries: countries,
                      residencySelectAll: selectAll,
                    })
                  }
                />
              </TabsContent>{" "}
            </Tabs>

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
                {isSubmitting ? t("common:adding") : t("common:add")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Close Confirmation Dialog */}
      <CloseConfirmDialog
        open={showCloseConfirm}
        onOpenChange={setShowCloseConfirm}
        onConfirm={handleConfirmClose}
      />
    </>
  );
}
