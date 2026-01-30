import { useIsAdmin } from "@/shared/hooks/useAdmin";
import { Loader } from "@/shared/components/ui";
import { useI18n } from "@/shared/hooks/useI18n";

const Home = () => {
  const { t } = useI18n();
  const { isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader text={t("common:loading")} />
      </div>
    );
  }

  // Render dashboard based on role
  return <div></div>;
};

export default Home;
