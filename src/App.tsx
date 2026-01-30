import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "@/shared/components/theme";
import "@/shared/utils/i18n"; // Initialize i18n
import {
  ProtectedRoute,
  AuthProtectedRoute,
} from "@/shared/components/guards";
import { GlobalLoader } from "@/shared/components";
import Login from "@/features/auth/components/Login";
import Home from "@/features/dashboard/components/Home";
import { Toaster } from "@/shared/components/ui";
import {
  StaticSidebar,
  MobileHeader,
  MobileNavigation,
  DesktopHeader,
} from "@/shared/components/navigation";
import { SettingsLayout } from "@/features/settings";
import { useProfileHydration } from "@/shared/hooks";
import ResetPassword from "./features/auth/components/ResetPassword";
import PasswordResetVerify from "./features/auth/components/PasswordResetVerify";

// Lazy load settings pages
const SettingsPage = lazy(
  () => import("@/features/settings/MyAccount/Settings"),
);
const SecurityPage = lazy(
  () => import("@/features/settings/components/Security"),
);
const NotificationsPage = lazy(
  () => import("@/features/settings/components/Notifications"),
);

const ChangeEmailVerify = lazy(
  () => import("@/features/settings/components/ChangeEmailVerification"),
);

// Lazy load workspace admin pages
const AdminUsersPage = lazy(
  () => import("@/features/settings/Admin/users/Users"),
);
const AdminCategoriesPage = lazy(
  () => import("@/features/settings/Admin/categories/Categories"),
);
const AdminProductsPage = lazy(
  () => import("@/features/settings/Admin/products/Products"),
);
const AdminEmailSettingsPage = lazy(
  () => import("@/features/settings/Admin/emailSettings/EmailSettings"),
);
const AdminNotificationTemplatesPage = lazy(
  () =>
    import("@/features/settings/Admin/notificationTemplates/NotificationTemplates"),
);

// Add this script to set theme on initial page load
const setInitialTheme = () => {
  const theme = localStorage.getItem("hafiz-theme") || "system";
  const root = window.document.documentElement;

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
    document.body.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
    document.body.classList.add(theme);
  }
};

// Execute it immediately
setInitialTheme();

// Layout component to handle sidebar
function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isAuthRoute = pathSegments[0] === "auth";
  const isOnboardingRoute = pathSegments[0] === "onboarding";
  const isEmailRoute = pathSegments[0] === "email";
  const isChangeEmailRoute = pathSegments[0] === "change-email";
  const isPasswordRoute = pathSegments[0] === "password";
  const isInvitationRoute = pathSegments[0] === "invitation";

  // Don't show navigation for auth, onboarding, email, change-email, password, and invitation routes
  if (
    isAuthRoute ||
    isOnboardingRoute ||
    isEmailRoute ||
    isChangeEmailRoute ||
    isPasswordRoute ||
    isInvitationRoute
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Static Sidebar for Desktop */}
      <StaticSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Desktop Header with Breadcrumbs */}
        <DesktopHeader />

        {/* Mobile Bottom Navigation */}
        <MobileNavigation />

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-12 md:pb-0 bg-gray-50 dark:bg-background">{children}</main>
      </div>
    </div>
  );
}

// Inner component to handle profile hydration (needs Router context)
function AppContent() {
  // Hydrate profile on app mount (handles page refresh)
  useProfileHydration();

  return (
    <AppLayout>
      <Routes>
        {/* Auth routes - protected from authenticated users */}
        <Route element={<AuthProtectedRoute />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
        </Route>

        <Route
          path="/password/reset"
          element={
            <Suspense fallback={<GlobalLoader />}>
              <PasswordResetVerify />
            </Suspense>
          }
        />

        {/* Protected routes - require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />

          {/* Settings routes */}
          <Route
            path="/settings"
            element={
              <SettingsLayout>
                <Suspense fallback={<GlobalLoader />}>
                  <SettingsPage />
                </Suspense>
              </SettingsLayout>
            }
          />
          <Route
            path="/settings/security"
            element={
              <SettingsLayout>
                <Suspense fallback={<GlobalLoader />}>
                  <SecurityPage />
                </Suspense>
              </SettingsLayout>
            }
          />
          <Route
            path="/settings/notifications"
            element={
              <SettingsLayout>
                <Suspense fallback={<GlobalLoader />}>
                  <NotificationsPage />
                </Suspense>
              </SettingsLayout>
            }
          />

          {/* Admin-only workspace settings routes */}
          <Route
            path="/settings/admin"
            element={
              <SettingsLayout>
                <Suspense fallback={<GlobalLoader />}>
                  <AdminUsersPage />
                </Suspense>
              </SettingsLayout>
            }
          />

          <Route
            path="/settings/admin/users"
            element={
              <SettingsLayout>
                <Suspense fallback={<GlobalLoader />}>
                  <AdminUsersPage />
                </Suspense>
              </SettingsLayout>
            }
          />

          <Route
            path="/settings/admin/email-settings"
            element={
              <SettingsLayout>
                <Suspense fallback={<GlobalLoader />}>
                  <AdminEmailSettingsPage />
                </Suspense>
              </SettingsLayout>
            }
          />

          <Route
            path="/settings/admin/categories"
            element={
              <SettingsLayout>
                <Suspense fallback={<GlobalLoader />}>
                  <AdminCategoriesPage />
                </Suspense>
              </SettingsLayout>
            }
          />
          <Route
            path="/settings/admin/services"
            element={
              <SettingsLayout>
                <Suspense fallback={<GlobalLoader />}>
                  <AdminProductsPage />
                </Suspense>
              </SettingsLayout>
            }
          />
          <Route
            path="/settings/admin/notification-templates"
            element={
              <SettingsLayout>
                <Suspense fallback={<GlobalLoader />}>
                  <AdminNotificationTemplatesPage />
                </Suspense>
              </SettingsLayout>
            }
          />
        </Route>

        <Route
          path="/change-email/verify"
          element={
            <Suspense fallback={<GlobalLoader />}>
              <ChangeEmailVerify />
            </Suspense>
          }
        />

        {/* Redirect all other routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="hafiz-theme">
      <Router>
        <AppContent />
      </Router>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}

export default App;
