import { useIsAdmin } from "@/shared/hooks/useAdmin";
import { useProfile } from "@/shared/stores/profileStore";
import { isOwnerRole } from "@/shared/utils/roles";
import { useI18n } from "@/shared/hooks/useI18n";
import { settingsConfig } from "@/shared/utils/appLinks";

export const useSettingsConfig = () => {
  const { t } = useI18n();
  const { isAdmin } = useIsAdmin();
  const profile = useProfile();
  const isOwner = profile ? isOwnerRole(profile.role) : false;
  
  // Create a translated version of the settings configuration
  const translatedConfig = {
    ...settingsConfig,
    title: t('common:settings'),
    sections: settingsConfig.sections.map(section => ({
      ...section,
      title: section.title ? t(`${section.title.toLowerCase().replace(/\s+/g, '')}`) : undefined,
      items: section.items
        // Filter out email settings for non-owners
        // Filter out notification templates for non-admins
        .filter(item => {
          if (item.href === '/settings/admin/email-settings') {
            return isOwner;
          }
          if (item.href === '/settings/admin/notification-templates') {
            return isAdmin;
          }
          return true;
        })
        .map(item => ({
          ...item,
          name: t(`${item.name.toLowerCase()}`)
        }))
    }))
  };
  
  // All users (admins and teachers) can now see all settings items
  // The pages themselves handle read-only vs full access based on isAdmin
  return {
    config: translatedConfig,
    isAdmin,
    isLoading: false
  };
};