import { Loader } from "./Loader";
import { useI18n } from "@/shared/hooks/useI18n";

/**
 * Global loader component used for Suspense boundaries and other app-wide loading states.
 * Uses fixed positioning to ensure it's always visible in the viewport.
 */
export function GlobalLoader() {
  const { t } = useI18n();

  return (
    <Loader
      isLoading
      text={t("loading")}
      minHeight="min-h-screen"
      variant="fixed"
    />
  );
}
