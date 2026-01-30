import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/shared/hooks/useI18n";
import { showToast } from "@/shared/components/ui/toast-config";
import { useProfile } from "@/shared/stores/profileStore";
import { isOwnerRole } from "@/shared/utils/roles";
import type { EmailSettings } from "@/features/settings/Admin/types";
import {
  getEmailSettings,
  updateEmailSettings,
} from "@/features/settings/Admin/api/emailSettingsApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  Button,
  Input,
  Label,
  DataError,
  AccessDenied,
  FormFieldWrapper,
  Loader,
} from "@/shared/components/ui";

export default function EmailSettingsPage() {
  const { t } = useI18n();
  const profile = useProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(false);
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(
    null,
  );
  const [formData, setFormData] = useState({
    host: "",
    port: 587,
    fromEmail: "",
    fromName: "",
    username: "",
    password: "",
  });

  // Check if user is owner
  const isOwner = profile ? isOwnerRole(profile.role) : false;

  const loadEmailSettings = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await getEmailSettings();
      if (response.success && response.data) {
        setEmailSettings(response.data);
        setFormData({
          host: response.data.host,
          port: response.data.port,
          fromEmail: response.data.fromEmail,
          fromName: response.data.fromName,
          username: response.data.username,
          password: "",
        });
      } else {
        setError(true);
        showToast.error(
          response.message || t("settings:emailSettings.errors.failedToLoad"),
        );
      }
    } catch {
      setError(true);
      showToast.error(t("settings:emailSettings.errors.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isOwner) {
      loadEmailSettings();
    }
  }, [isOwner, loadEmailSettings]);

  const handleEdit = () => {
    setIsEditing(true);
    if (emailSettings) {
      setFormData({
        host: emailSettings.host,
        port: emailSettings.port,
        fromEmail: emailSettings.fromEmail,
        fromName: emailSettings.fromName,
        username: emailSettings.username,
        password: "",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (emailSettings) {
      setFormData({
        host: emailSettings.host,
        port: emailSettings.port,
        fromEmail: emailSettings.fromEmail,
        fromName: emailSettings.fromName,
        username: emailSettings.username,
        password: "",
      });
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const response = await updateEmailSettings({
        host: formData.host,
        port: formData.port,
        fromEmail: formData.fromEmail,
        fromName: formData.fromName,
        username: formData.username,
        password: formData.password || "",
      });

      if (response.success) {
        setIsEditing(false);
        showToast.success(t("settings:emailSettings.messages.updated"));
        await loadEmailSettings();
      } else {
        showToast.error(
          response.message || t("settings:emailSettings.errors.failedToUpdate"),
        );
      }
    } catch {
      showToast.error(t("settings:emailSettings.errors.failedToUpdate"));
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return <Loader></Loader>;
  }

  // If not owner, show access denied
  if (!isOwner) {
    return (
      <AccessDenied
        title={t("common:accessDenied")}
        message={t("settings:emailSettings.errors.ownerOnly")}
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <DataError
        title={t("common:error")}
        message={t("settings:emailSettings.errors.failedToLoad")}
        retryText={t("common:retry")}
        onRetry={loadEmailSettings}
      />
    );
  }

  if (!emailSettings) {
    return null;
  }

  return (
    <>
      <div className="mb-3">
        <h1 className="text-2xl font-semibold text-foreground">
          {t("settings:emailSettings.title")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("settings:emailSettings.description")}
        </p>
      </div>
      <Card>
        <CardTitle className="flex items-center gap-2"></CardTitle>
        <CardDescription></CardDescription>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* SMTP Host */}
            <FormFieldWrapper>
              <Label>{t("settings:emailSettings.host")}</Label>
              {isEditing ? (
                <Input
                  value={formData.host}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, host: e.target.value }))
                  }
                  placeholder={t("settings:emailSettings.hostPlaceholder")}
                />
              ) : (
                <div className="py-1">{emailSettings.host}</div>
              )}
            </FormFieldWrapper>

            {/* SMTP Port */}
            <FormFieldWrapper>
              <Label>{t("settings:emailSettings.port")}</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.port}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      port: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="587"
                />
              ) : (
                <div className="py-1">{emailSettings.port}</div>
              )}
            </FormFieldWrapper>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* From Email */}
            <FormFieldWrapper>
              <Label>{t("settings:emailSettings.fromEmail")}</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.fromEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fromEmail: e.target.value,
                    }))
                  }
                  placeholder={t("settings:emailSettings.fromEmailPlaceholder")}
                />
              ) : (
                <div className="py-1">{emailSettings.fromEmail}</div>
              )}
            </FormFieldWrapper>

            {/* From Name */}
            <FormFieldWrapper>
              <Label>{t("settings:emailSettings.fromName")}</Label>
              {isEditing ? (
                <Input
                  value={formData.fromName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fromName: e.target.value,
                    }))
                  }
                  placeholder={t("settings:emailSettings.fromNamePlaceholder")}
                />
              ) : (
                <div className="py-1">{emailSettings.fromName}</div>
              )}
            </FormFieldWrapper>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Username */}
            <FormFieldWrapper>
              <Label>{t("settings:emailSettings.username")}</Label>
              {isEditing ? (
                <Input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder={t("settings:emailSettings.usernamePlaceholder")}
                />
              ) : (
                <div className="py-1">{emailSettings.username}</div>
              )}
            </FormFieldWrapper>

            {/* Password */}
            <FormFieldWrapper>
              <Label>{t("settings:emailSettings.password")}</Label>
              {isEditing ? (
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder={t("settings:emailSettings.passwordPlaceholder")}
                />
              ) : (
                <div className="py-1">••••••••</div>
              )}
            </FormFieldWrapper>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <Button variant="outline" onClick={handleEdit}>
                {t("common:edit")}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  {t("common:cancel")}
                </Button>
                <Button onClick={handleUpdate} disabled={isSaving}>
                  {isSaving
                    ? t("common:savingChanges")
                    : t("common:saveChanges")}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
