import type { Profile } from "@/shared/types/api";
import { useState, useEffect } from "react";
import {
  updateProfile,
  fetchAndStoreProfile,
  getTimezones,
} from "@/shared/services/profileService";
import { showToast } from "@/shared/components/ui/toast-config";
import { useI18n } from "@/shared/hooks/useI18n";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  Combobox,
  FormFieldWrapper,
  Input,
  Label,
  type ComboboxOption,
} from "@/shared/components/ui";

interface ProfileSectionProps {
  profile: Profile;
  onProfileUpdate?: (updatedProfile: Profile) => void;
}

export function ProfileSection({
  profile,
  onProfileUpdate,
}: ProfileSectionProps) {
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timezonesLoading, setTimezonesLoading] = useState(false);
  const [timezones, setTimezones] = useState<ComboboxOption[]>([]);
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone || "",
    timezoneId: profile.timezoneId || "",
  });

  // Fetch timezones on component mount
  useEffect(() => {
    const fetchTimezones = async () => {
      setTimezonesLoading(true);
      try {
        const response = await getTimezones();
        if (response.success && response.data) {
          const timezoneOptions: ComboboxOption[] = Object.entries(
            response.data,
          ).map(([id, label]) => ({ value: id, label }));
          setTimezones(timezoneOptions);
        } else {
          showToast.error(
            response.message || t("settings:failedToLoadTimezones"),
          );
        }
      } catch {
        showToast.error(t("settings:failedToLoadTimezones"));
      } finally {
        setTimezonesLoading(false);
      }
    };

    fetchTimezones();
  }, [t]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const phoneRegex = /^[0-9\s\-()+ ]*$/;
    if (phoneRegex.test(value)) {
      setFormData((prev) => ({ ...prev, phone: value }));
    }
  };

  const handleChange = () => {
    setIsEditing(true);
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || "",
      timezoneId: profile.timezoneId || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || "",
      timezoneId: profile.timezoneId || "",
    });
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        timezoneId: formData.timezoneId,
      });

      if (response.success) {
        setIsEditing(false);
        const refreshResponse = await fetchAndStoreProfile();
        if (refreshResponse.success && refreshResponse.data) {
          onProfileUpdate?.(refreshResponse.data);
          showToast.success(response.message || t("messages.profileUpdated"));
        }
      } else {
        showToast.error(
          response.message || t("settings:failedToUpdateProfile"),
        );
      }
    } catch {
      showToast.error(t("settings:failedToUpdateProfile"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get the display label for the current timezone
  const currentTimezoneLabel =
    timezones.find((tz) => tz.value === profile.timezoneId)?.label ||
    profile.timezoneId ||
    "-";

  return (
    <>
      <div className="mb-3">
        <h1 className="text-2xl font-semibold text-foreground">
          {t("settings:personalInformation")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("settings:personalInformationDescription")}
        </p>
      </div>
      <Card>
        <CardTitle className="sr-only"></CardTitle>
        <CardDescription className="sr-only"></CardDescription>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* First Name */}
            <FormFieldWrapper>
              <Label>{t("firstName")}</Label>
              {isEditing ? (
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
              ) : (
                <div className="  py-1">{profile.firstName}</div>
              )}
            </FormFieldWrapper>

            {/* Last Name */}
            <FormFieldWrapper>
              <Label>{t("lastName")}</Label>
              {isEditing ? (
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              ) : (
                <div className="  py-1">{profile.lastName}</div>
              )}
            </FormFieldWrapper>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Phone Number */}
            <FormFieldWrapper>
              <Label>{t("phoneNumber")}</Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder={t("placeholders.enterPhoneNumber")}
                />
              ) : (
                <div className="  py-1">{profile.phone || "-"}</div>
              )}
            </FormFieldWrapper>

            {/* Timezone */}
            <FormFieldWrapper>
              <Label>{t("timezone")}</Label>
              {isEditing ? (
                <Combobox
                  options={timezones}
                  value={formData.timezoneId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, timezoneId: value }))
                  }
                  placeholder={t("placeholders.selectTimezone")}
                  disabled={timezonesLoading}
                />
              ) : (
                <div className="  py-1">{currentTimezoneLabel}</div>
              )}
            </FormFieldWrapper>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <Button variant="outline" onClick={handleChange}>
                {t("edit")}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  {t("cancel")}
                </Button>
                <Button onClick={handleUpdate} disabled={isLoading}>
                  {isLoading ? t("savingChanges") : t("saveChanges")}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
