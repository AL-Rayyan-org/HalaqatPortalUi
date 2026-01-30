import { Outlet } from "react-router";
import { useIsOwner } from "@/shared/hooks/useOwner";
import { AccessDenied } from "@/shared/components/ui";
import { Loader } from "@/shared/components/ui";
import { useI18n } from "@/shared/hooks/useI18n";

export function OwnerProtectedRoute() {
  const { isOwner, isLoading } = useIsOwner();
  const { t } = useI18n();

  if (isLoading) {
    return <Loader text={t("loading")} variant="container" />;
  }

  return isOwner ? <Outlet /> : <AccessDenied />;
}
