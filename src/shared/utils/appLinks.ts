import {  Home, Settings, User, Users, Layers, Building2, Briefcase, ClipboardList, Mail, LayoutTemplate, FolderCog } from "lucide-react";

export const sidebarNavigationItems = [
  {
    name: "Dashboard",
    nameKey: "common:dashboard",
    href: "/",
    icon: Home,
    exact: true,
  },
  {
    name: "Organizations",
    nameKey: "common:organizations",
    href: "/organizations",
    icon: Building2,
    exact: false,
  },
  {
    name: "Orders",
    nameKey: "common:orders",
    href: "/orders",
    icon: FolderCog,
    exact: false,
  },
  {
    name: 'Audit Logs',
    nameKey: 'common:auditLogs',
    href: '/audit-logs',
    icon: ClipboardList,
    exact: false,
  },
  {
    name: "Settings",
    nameKey: "common:settings",
    href: "/settings", 
    icon: Settings,
    exact: false,
  }
]

// Structure for settings navigation
export const settingsConfig = {
  title: 'Settings',
  sections: [
    {
      title: 'My Account',
      items: [
        {
          name: 'Profile',
          nameKey: 'common:profile',
          href: '/settings',
          icon: User,
          exact: true,
        },
        // {
        //   name: 'Security',
        //   nameKey: 'common:security',
        //   href: '/settings/security',
        //   icon: Lock,
        //   exact: false,
        // },
        // {
        //   name: 'Notifications',
        //   nameKey: 'common:notifications',
        //   href: '/settings/notifications',
        //   icon: Bell,
        //   exact: false,
        // }
      ]
    },
    {
      title: 'Admin',
      items: [
        {
          name: 'Users',
          nameKey: 'common:users',
          href: '/settings/admin/users',
          icon: Users,
          exact: false,
        },
        {
          name: 'Categories',
          nameKey: 'common:categories',
          href: '/settings/admin/categories',
          icon: Layers,
          exact: false,
        },
        {
          name: 'Services',
          nameKey: 'common:services',
          href: '/settings/admin/services',
          icon: Briefcase,
          exact: false,
        },
        {
          name: 'EmailSettings',
          nameKey: 'common:emailsettings',
          href: '/settings/admin/email-settings',
          icon: Mail,
          exact: false,
        },
        {
          name: 'NotificationTemplates',
          nameKey: 'common:notificationtemplates',
          href: '/settings/admin/notification-templates',
          icon: LayoutTemplate,
          exact: false,
        },
      ]
    }
  ]
};