import {
  ProfileSection,
  SecuritySection,
  PreferencesSection,
} from "@/features/settings/MyAccount/sections";
import { useProfile, useProfileLoading } from "@/shared/stores/profileStore";
import { DataError } from "@/shared/components/ui";
import { GlobalLoader } from "@/shared/components";
import { useI18n } from "@/shared/hooks/useI18n";

export default function SettingsPage() {
  const { t } = useI18n();
  const profile = useProfile();
  const isLoading = useProfileLoading();

  // Profile updates are handled automatically by Zustand store
  // This function is kept for compatibility with ProfileSection component
  const handleProfileUpdate = () => {
    // No action needed - Zustand store updates automatically
  };

  // Show loader during initial profile fetch
  if (isLoading) {
    return <GlobalLoader />;
  }

  // Show error only if not loading and profile is still null
  if (!profile) {
    return (
      <DataError
        title={t("settings:errors.couldntLoadData")}
        message={t("settings:errors.unableToLoadProfile")}
        retryText={t("common:refresh")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Information Section */}
      <ProfileSection profile={profile} onProfileUpdate={handleProfileUpdate} />

      {/* Security Section */}
      <SecuritySection profile={profile} />

      {/* Preferences Section */}
      <PreferencesSection />
    </div>
  );
}
