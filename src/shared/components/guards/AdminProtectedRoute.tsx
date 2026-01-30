import { Outlet } from "react-router-dom";
import { useIsAdmin } from "@/shared/hooks/useAdmin";
import { AccessDenied } from "@/shared/components/ui";
import { Loader } from "@/shared/components/ui";
import { useI18n } from "@/shared/hooks/useI18n";

export function AdminProtectedRoute() {
  const { isAdmin, isLoading } = useIsAdmin();
  const { t } = useI18n();

  if (isLoading) {
    return <Loader text={t('loading')} variant="container" />;
  }

  return isAdmin ? <Outlet /> : <AccessDenied />;
}
