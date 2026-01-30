import { useEffect, useState, useRef, useCallback } from "react";
import { useI18n } from "@/shared/hooks/useI18n";
import { showToast } from "@/shared/components/ui/toast-config";
import {
  getNotificationTemplateById,
  updateNotificationTemplate,
} from "@/features/settings/Admin/api/notificationTemplatesApi";
import type {
  NotificationTemplate,
  NotificationTemplateVariant,
  UpdateNotificationTemplateRequest,
} from "@/features/settings/Admin/types";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  FormFieldWrapper,
  Badge,
  CloseConfirmDialog,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Switch,
} from "@/shared/components/ui";
import { X, ChevronDown } from "lucide-react";

interface EditTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
}

// Helper to get language display name
const getLanguageDisplayName = (lang: string): string => {
  const languageMap: Record<string, string> = {
    en: "English",
    ar: "العربية",
  };
  return languageMap[lang] || lang;
};

export function EditTemplateModal({
  open,
  onOpenChange,
  templateId,
}: EditTemplateModalProps) {
  const { t, isRTL } = useI18n();
  const [template, setTemplate] = useState<NotificationTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [formData, setFormData] = useState<
    Record<string, NotificationTemplateVariant>
  >({});
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({});
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [hasAnyChanges, setHasAnyChanges] = useState(false);
  const [newCcEmail, setNewCcEmail] = useState<Record<string, string>>({});
  const [newBccEmail, setNewBccEmail] = useState<Record<string, string>>({});
  const [moreSettingsOpen, setMoreSettingsOpen] = useState<
    Record<string, boolean>
  >({});

  // Refs for subject and body inputs to track cursor position
  const subjectRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const bodyRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const [lastFocusedField, setLastFocusedField] = useState<{
    tab: string;
    field: "subject" | "body";
  } | null>(null);

  // Fetch template data when modal opens
  const fetchTemplate = useCallback(async () => {
    if (!open || !templateId) {
      setTemplate(null);
      setFormData({});
      setHasChanges({});
      return;
    }

    setIsLoading(true);
    try {
      const response = await getNotificationTemplateById(templateId);
      if (response.success && response.data) {
        setTemplate(response.data);

        // Initialize form data from variants
        const initialFormData: Record<string, NotificationTemplateVariant> = {};
        const initialHasChanges: Record<string, boolean> = {};
        const initialMoreSettingsOpen: Record<string, boolean> = {};

        response.data.variants.forEach((variant) => {
          const key = `${variant.language}-${variant.channel}`;
          initialFormData[key] = { ...variant };
          initialHasChanges[key] = false;

          // Open "More Settings" by default if any field has data
          const hasMoreSettingsData =
            !!variant.from ||
            !!variant.fromName ||
            !!variant.replyTo ||
            variant.cc.length > 0 ||
            variant.bcc.length > 0;
          initialMoreSettingsOpen[key] = hasMoreSettingsData;
        });

        setFormData(initialFormData);
        setHasChanges(initialHasChanges);
        setMoreSettingsOpen(initialMoreSettingsOpen);

        // Set default active tab
        if (response.data.variants.length > 0) {
          const firstVariant = response.data.variants[0];
          setActiveTab(`${firstVariant.language}-${firstVariant.channel}`);
        }
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
  }, [open, templateId, t, onOpenChange]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  // Handle field changes
  const handleFieldChange = (
    tabKey: string,
    field: keyof NotificationTemplateVariant,
    value: string | boolean | string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        [field]: value,
      },
    }));
    setHasChanges((prev) => ({
      ...prev,
      [tabKey]: true,
    }));
    setHasAnyChanges(true);
  };

  // Insert variable at cursor position
  const insertVariable = (variable: string) => {
    if (!lastFocusedField) {
      showToast.error(t("settings:notificationTemplates.selectFieldFirst"));
      return;
    }

    const { tab, field } = lastFocusedField;
    const placeholder = `{{${variable}}}`;

    if (field === "subject") {
      const input = subjectRefs.current[tab];
      if (input) {
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const currentValue = formData[tab]?.subject || "";
        const newValue =
          currentValue.substring(0, start) +
          placeholder +
          currentValue.substring(end);
        handleFieldChange(tab, "subject", newValue);

        // Restore cursor position after React updates the value
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(
            start + placeholder.length,
            start + placeholder.length,
          );
        }, 0);
      }
    } else if (field === "body") {
      const textarea = bodyRefs.current[tab];
      if (textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const currentValue = formData[tab]?.body || "";
        const newValue =
          currentValue.substring(0, start) +
          placeholder +
          currentValue.substring(end);
        handleFieldChange(tab, "body", newValue);

        // Restore cursor position after React updates the value
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + placeholder.length,
            start + placeholder.length,
          );
        }, 0);
      }
    }
  };

  // Track focus for variable insertion
  const handleFieldFocus = (tab: string, field: "subject" | "body") => {
    setLastFocusedField({ tab, field });
  };

  // Save variant
  const handleSave = async (tabKey: string) => {
    const variant = formData[tabKey];
    if (!variant || !template) return;

    setIsSaving(true);
    try {
      const requestData: UpdateNotificationTemplateRequest = {
        templateId: variant.templateId,
        language: variant.language,
        channel: variant.channel,
        subject: variant.subject,
        body: variant.body,
        from: variant.from,
        fromName: variant.fromName,
        replyTo: variant.replyTo,
        cc: variant.cc,
        bcc: variant.bcc,
        isHtml: variant.isHtml,
      };

      const response = await updateNotificationTemplate(
        templateId,
        requestData,
      );

      if (response.success) {
        showToast.success(t("settings:notificationTemplates.messages.updated"));
        setHasChanges((prev) => ({
          ...prev,
          [tabKey]: false,
        }));
        // Check if all tabs have been saved
        const allSaved = Object.entries(hasChanges).every(
          ([key, changed]) => key === tabKey || !changed,
        );
        if (allSaved) {
          setHasAnyChanges(false);
        }
        // Close the modal after successful save
        onOpenChange(false);
      } else {
        showToast.error(
          response.message ||
            t("settings:notificationTemplates.errors.failedToUpdate"),
        );
      }
    } catch {
      showToast.error(
        t("settings:notificationTemplates.errors.failedToUpdate"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle close with unsaved changes check
  const handleClose = () => {
    if (hasAnyChanges) {
      setShowCloseConfirm(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    setHasAnyChanges(false);
    onOpenChange(false);
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <Skeleton className="h-6 w-48" />
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!template) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl ">
          <DialogHeader>
            <DialogTitle>{template.description}</DialogTitle>
          </DialogHeader>

          {/* Tabs for each language variant */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            dir={isRTL ? "rtl" : "ltr"}
            className="w-full"
          >
            <TabsList className="w-full">
              {template.variants.map((variant) => {
                const tabKey = `${variant.language}-${variant.channel}`;
                return (
                  <TabsTrigger className="w-full" key={tabKey} value={tabKey}>
                    {getLanguageDisplayName(variant.language)}
                    {hasChanges[tabKey] && (
                      <span className="ms-1 text-primary">•</span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Variables Section */}
            {template.variables && template.variables.length > 0 && (
              <div className="grid gap-2 mt-4">
                <Label>{t("settings:notificationTemplates.variables")}</Label>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable) => (
                    <Badge
                      key={variable}
                      variant="secondary"
                      className="cursor-pointer text-base hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => insertVariable(variable)}
                    >
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  {t("settings:notificationTemplates.variablesHint")}
                </p>
              </div>
            )}

            {template.variants.map((variant) => {
              const tabKey = `${variant.language}-${variant.channel}`;
              const currentFormData = formData[tabKey];

              if (!currentFormData) return null;

              return (
                <TabsContent
                  key={tabKey}
                  value={tabKey}
                  className="space-y-4 mt-4"
                >
                  {/* Subject */}
                  <FormFieldWrapper>
                    <Label htmlFor={`subject-${tabKey}`}>
                      {t("settings:notificationTemplates.subject")}
                    </Label>
                    <Input
                      id={`subject-${tabKey}`}
                      ref={(el) => {
                        subjectRefs.current[tabKey] = el;
                      }}
                      value={currentFormData.subject}
                      onChange={(e) =>
                        handleFieldChange(tabKey, "subject", e.target.value)
                      }
                      onFocus={() => handleFieldFocus(tabKey, "subject")}
                      placeholder={t(
                        "settings:notificationTemplates.subjectPlaceholder",
                      )}
                      dir="auto"
                    />
                  </FormFieldWrapper>

                  {/* Body */}
                  <FormFieldWrapper>
                    <Label htmlFor={`body-${tabKey}`}>
                      {t("settings:notificationTemplates.body")}
                    </Label>
                    <Textarea
                      id={`body-${tabKey}`}
                      ref={(el) => {
                        bodyRefs.current[tabKey] = el;
                      }}
                      value={currentFormData.body}
                      onChange={(e) =>
                        handleFieldChange(tabKey, "body", e.target.value)
                      }
                      onFocus={() => handleFieldFocus(tabKey, "body")}
                      placeholder={t(
                        "settings:notificationTemplates.bodyPlaceholder",
                      )}
                      rows={16}
                      className="font-mono"
                      dir="auto"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <Switch
                        id={`isHtml-${tabKey}`}
                        checked={currentFormData.isHtml}
                        onCheckedChange={(checked) =>
                          handleFieldChange(tabKey, "isHtml", checked === true)
                        }
                      />
                      <Label
                        htmlFor={`isHtml-${tabKey}`}
                        className="font-normal cursor-pointer"
                      >
                        {t("settings:notificationTemplates.bodyIsHtml")}
                      </Label>
                    </div>
                  </FormFieldWrapper>

                  {/* More Settings - Collapsible */}
                  <Collapsible
                    open={moreSettingsOpen[tabKey]}
                    onOpenChange={(open) =>
                      setMoreSettingsOpen((prev) => ({
                        ...prev,
                        [tabKey]: open,
                      }))
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="gap-2 p-0 h-auto font-normal hover:bg-transparent"
                      >
                        <span className="font-medium">
                          {t("settings:notificationTemplates.moreSettings")}
                        </span>
                        <ChevronDown
                          className={`size-5 transition-transform ${
                            moreSettingsOpen[tabKey] ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      {/* From */}
                      <FormFieldWrapper>
                        <Label htmlFor={`from-${tabKey}`}>
                          {t("settings:notificationTemplates.from")}
                        </Label>
                        <Input
                          id={`from-${tabKey}`}
                          value={currentFormData.from}
                          onChange={(e) =>
                            handleFieldChange(tabKey, "from", e.target.value)
                          }
                          placeholder={
                            currentFormData.defaultFrom ||
                            "e.g., support@example.com"
                          }
                        />
                      </FormFieldWrapper>

                      {/* From Name */}
                      <FormFieldWrapper>
                        <Label htmlFor={`fromName-${tabKey}`}>
                          {t("settings:notificationTemplates.fromName")}
                        </Label>
                        <Input
                          id={`fromName-${tabKey}`}
                          value={currentFormData.fromName}
                          onChange={(e) =>
                            handleFieldChange(
                              tabKey,
                              "fromName",
                              e.target.value,
                            )
                          }
                          placeholder={
                            currentFormData.defaultFromName ||
                            t(
                              "settings:notificationTemplates.fromNamePlaceholder",
                            )
                          }
                        />
                      </FormFieldWrapper>

                      {/* Reply To */}
                      <FormFieldWrapper>
                        <Label htmlFor={`replyTo-${tabKey}`}>
                          {t("settings:notificationTemplates.replyTo")}
                        </Label>
                        <Input
                          id={`replyTo-${tabKey}`}
                          value={currentFormData.replyTo}
                          onChange={(e) =>
                            handleFieldChange(tabKey, "replyTo", e.target.value)
                          }
                          placeholder={
                            currentFormData.defaultReplyTo ||
                            t(
                              "settings:notificationTemplates.replyToPlaceholder",
                            )
                          }
                        />
                      </FormFieldWrapper>

                      {/* CC */}
                      <FormFieldWrapper>
                        <Label htmlFor={`cc-${tabKey}`}>
                          {t("settings:notificationTemplates.cc")}
                        </Label>
                        <div className="space-y-2">
                          <Input
                            id={`cc-${tabKey}`}
                            value={newCcEmail[tabKey] || ""}
                            onChange={(e) =>
                              setNewCcEmail((prev) => ({
                                ...prev,
                                [tabKey]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const email = (newCcEmail[tabKey] || "").trim();
                                if (
                                  email &&
                                  !currentFormData.cc.includes(email)
                                ) {
                                  handleFieldChange(tabKey, "cc", [
                                    ...currentFormData.cc,
                                    email,
                                  ]);
                                  setNewCcEmail((prev) => ({
                                    ...prev,
                                    [tabKey]: "",
                                  }));
                                }
                              }
                            }}
                            placeholder={t(
                              "settings:notificationTemplates.ccPlaceholder",
                            )}
                          />
                          <div className="flex flex-wrap gap-2 min-h-[2rem]">
                            {currentFormData.cc.length > 0 ? (
                              currentFormData.cc.map((email, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="pe-1.5"
                                >
                                  {email}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleFieldChange(
                                        tabKey,
                                        "cc",
                                        currentFormData.cc.filter(
                                          (e) => e !== email,
                                        ),
                                      )
                                    }
                                    className="ms-1.5 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))
                            ) : (
                              <div className="text-muted-foreground text-sm">
                                {t("common:noItemsAdded")}
                              </div>
                            )}
                          </div>
                        </div>
                      </FormFieldWrapper>

                      {/* BCC */}
                      <FormFieldWrapper>
                        <Label htmlFor={`bcc-${tabKey}`}>
                          {t("settings:notificationTemplates.bcc")}
                        </Label>
                        <div className="space-y-2">
                          <Input
                            id={`bcc-${tabKey}`}
                            value={newBccEmail[tabKey] || ""}
                            onChange={(e) =>
                              setNewBccEmail((prev) => ({
                                ...prev,
                                [tabKey]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const email = (
                                  newBccEmail[tabKey] || ""
                                ).trim();
                                if (
                                  email &&
                                  !currentFormData.bcc.includes(email)
                                ) {
                                  handleFieldChange(tabKey, "bcc", [
                                    ...currentFormData.bcc,
                                    email,
                                  ]);
                                  setNewBccEmail((prev) => ({
                                    ...prev,
                                    [tabKey]: "",
                                  }));
                                }
                              }
                            }}
                            placeholder={t(
                              "settings:notificationTemplates.bccPlaceholder",
                            )}
                          />
                          <div className="flex flex-wrap gap-2 min-h-[2rem]">
                            {currentFormData.bcc.length > 0 ? (
                              currentFormData.bcc.map((email, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="pe-1.5"
                                >
                                  {email}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleFieldChange(
                                        tabKey,
                                        "bcc",
                                        currentFormData.bcc.filter(
                                          (e) => e !== email,
                                        ),
                                      )
                                    }
                                    className="ms-1.5 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))
                            ) : (
                              <div className="text-muted-foreground text-sm">
                                {t("common:noItemsAdded")}
                              </div>
                            )}
                          </div>
                        </div>
                      </FormFieldWrapper>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Save button for this variant */}
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSaving}
                    >
                      {t("common:cancel")}
                    </Button>
                    <Button
                      onClick={() => handleSave(tabKey)}
                      disabled={isSaving || !hasChanges[tabKey]}
                    >
                      {isSaving ? t("common:saving") : t("common:save")}
                    </Button>
                  </DialogFooter>
                </TabsContent>
              );
            })}
          </Tabs>
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
