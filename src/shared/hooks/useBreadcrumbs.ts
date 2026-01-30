import { useLocation } from 'react-router-dom';
import { useI18n } from './useI18n';
import { getPageNameFromLinksInfo } from '@/shared/utils';

export interface Breadcrumb {
  name: string;
  href: string;
  isLast: boolean;
}

export function useBreadcrumbs() {
  const { t } = useI18n();
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Helper function to translate page names
  const getTranslatedPageName = (segment: string) => {
    const translated = t(segment);
    // If translation key doesn't exist, fall back to formatted segment
    return translated !== segment
      ? translated
      : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  // Build breadcrumb structure for settings pages
  const buildSettingsBreadcrumbs = (): Breadcrumb[] | null => {
    if (pathSegments[0] !== 'settings') {
      return null;
    }

    const breadcrumbs: Breadcrumb[] = [];

    // Always add Settings as root
    breadcrumbs.push({
      name: getTranslatedPageName('settings'),
      href: '/settings',
      isLast: false,
    });

    // Handle section-based routes
    if (pathSegments.length === 1) {
      // Just /settings - it's the last item
      breadcrumbs[0].isLast = true;
    } else if (pathSegments.length === 2) {
      // /settings/{section} - section is the last item
      const section = pathSegments[1];
      breadcrumbs.push({
        name: getTranslatedPageName(section),
        href: `/settings/${section}`,
        isLast: true,
      });
    } else if (pathSegments.length === 3) {
      // /settings/{section}/{page} - need section root + page
      const section = pathSegments[1];
      const page = pathSegments[2];

      // Special case: /settings/contacts/* - skip contacts and show page directly
      if (section === 'contacts') {
        // Try to get page name translation key from linksInfo configuration
        const pageNameKey = getPageNameFromLinksInfo(section, page);
        const pageName = pageNameKey ? t(pageNameKey) : getTranslatedPageName(page);

        // Add page directly under Settings
        breadcrumbs.push({
          name: pageName,
          href: `/settings/${section}/${page}`,
          isLast: true,
        });
      } else {
        // Determine section root URL based on section type
        let sectionRootUrl = '';
        if (section === 'workspace') {
          sectionRootUrl = '/settings/workspace';
        } else {
          sectionRootUrl = `/settings/${section}`;
        }

        // Add section
        breadcrumbs.push({
          name: getTranslatedPageName(section),
          href: sectionRootUrl,
          isLast: false,
        });

        // Try to get page name translation key from linksInfo configuration
        const pageNameKey = getPageNameFromLinksInfo(section, page);
        const pageName = pageNameKey ? t(pageNameKey) : getTranslatedPageName(page);

        // Add page
        breadcrumbs.push({
          name: pageName,
          href: `/settings/${section}/${page}`,
          isLast: true,
        });
      }
    }

    return breadcrumbs;
  };

  // Build breadcrumb structure for non-settings pages
  const buildDefaultBreadcrumbs = (): Breadcrumb[] => {
    const breadcrumbs: Breadcrumb[] = [];

    if (pathSegments.length === 0) {
      // Home page
      breadcrumbs.push({
        name: t('dashboard'),
        href: '/',
        isLast: true,
      });
    } else if (pathSegments.length === 1) {
      // Single level route (e.g., /contacts, /dashboard)
      const section = pathSegments[0];
      const pageNameKey = getPageNameFromLinksInfo(section);
      const pageName = pageNameKey ? t(pageNameKey) : getTranslatedPageName(section);
      
      breadcrumbs.push({
        name: pageName,
        href: `/${section}`,
        isLast: true,
      });
    } else if (pathSegments.length === 2) {
      // Two level route (e.g., /contacts/{contactId})
      const section = pathSegments[0];
      const page = pathSegments[1];

      // Add section as parent
      const sectionNameKey = getPageNameFromLinksInfo(section);
      const sectionName = sectionNameKey ? t(sectionNameKey) : getTranslatedPageName(section);
      
      breadcrumbs.push({
        name: sectionName,
        href: `/${section}`,
        isLast: false,
      });

      // Try to get page name translation key from linksInfo configuration
      const pageNameKey = getPageNameFromLinksInfo(section, page);
      const pageName = pageNameKey ? t(pageNameKey) : getTranslatedPageName(page);

      // Add page
      breadcrumbs.push({
        name: pageName,
        href: `/${section}/${page}`,
        isLast: true,
      });
    } else if (pathSegments.length === 3) {
      // Three level route (e.g., /contacts/import, /apps/chat_widgets/new)
      const section = pathSegments[0];
      const page = pathSegments[1];
      const subPage = pathSegments[2];

      // Add section as root
      const sectionNameKey = getPageNameFromLinksInfo(section);
      const sectionName = sectionNameKey ? t(sectionNameKey) : getTranslatedPageName(section);
      
      breadcrumbs.push({
        name: sectionName,
        href: `/${section}`,
        isLast: false,
      });

      // Add middle level (e.g., chat_widgets)
      const pageNameKey = getPageNameFromLinksInfo(section, page);
      const pageName = pageNameKey ? t(pageNameKey) : getTranslatedPageName(page);
      
      breadcrumbs.push({
        name: pageName,
        href: `/${section}/${page}`,
        isLast: false,
      });

      // Add sub-page (e.g., new, edit)
      // Special handling for apps section 'new' and 'edit' actions
      let subPageName: string;
      if (section === 'apps' && (subPage === 'new' || subPage === 'edit')) {
        subPageName = t(`apps:${subPage}`);
      } else {
        const subPageNameKey = getPageNameFromLinksInfo(section, page);
        subPageName = subPageNameKey ? t(subPageNameKey) : getTranslatedPageName(subPage);
      }
      
      breadcrumbs.push({
        name: subPageName,
        href: `/${section}/${page}/${subPage}`,
        isLast: true,
      });
    }  else {
      // Multi-level route - fallback to old behavior
      breadcrumbs.push({
        name: getTranslatedPageName(pathSegments[pathSegments.length - 2]),
        href: '/' + pathSegments.slice(0, pathSegments.length - 1).join('/'),
        isLast: false,
      });

      // Add current page
      breadcrumbs.push({
        name: getTranslatedPageName(pathSegments[pathSegments.length - 1]),
        href: location.pathname,
        isLast: true,
      });
    }

    return breadcrumbs;
  };

  const settingsBreadcrumbs = buildSettingsBreadcrumbs();

  return {
    breadcrumbs: settingsBreadcrumbs || buildDefaultBreadcrumbs(),
    isSettingsPage: settingsBreadcrumbs !== null,
  };
}
