import { useState } from "react";
import { Loader } from "@/shared/components/ui";
import { useI18n } from "@/shared/hooks/useI18n";

export default function SecurityPage() {
    const { t } = useI18n();
    const [loading] = useState(false);

    if (loading) {
    return <Loader text={t('settings.loadingSecuritySettings')} />;
    }

  return (
    <div className="h-full">
      <div className='bg-muted/50 h-full rounded-xl mb-4'></div>
    </div>
  );
}
