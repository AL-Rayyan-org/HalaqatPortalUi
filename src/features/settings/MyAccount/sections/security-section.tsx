import { useState } from "react";
import { useI18n } from "@/shared/hooks/useI18n";
import { ChangePasswordDialog } from "@/features/settings";
import { ChangeEmailDialog } from "@/features/settings";
import type { Profile } from "@/shared/types/api";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/shared/components/ui";

interface SecuritySectionProps {
  profile: Profile;
}

export function SecuritySection({ profile }: SecuritySectionProps) {
  const { t } = useI18n();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);

  const verifiedMsg = profile.emailVerified ? t("verified") : t("unverified");
  const verifiedBadge = profile.emailVerified ? (
    <span className="text-sm text-green-700">{verifiedMsg}</span>
  ) : (
    <span className="text-sm text-muted-foreground">{verifiedMsg}</span>
  );

  return (
    <>
      <div className="mb-3">
        <h1 className="text-2xl font-semibold text-foreground">
          {t("settings:accountSecurity")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("settings:accountSecurityDescription")}
        </p>
      </div>
      <Card>
        <CardTitle className="sr-only"></CardTitle>
        <CardDescription></CardDescription>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
            <div className="space-y-1">
              {" "}
              {/* Added space-y-1 for nice vertical gap between label and email */}
              {/* Label Row with Badge */}
              <div className="flex items-center gap-2">
                <p>{t("email")}</p>

                {verifiedBadge}
              </div>
              {/* Email Address (Cleaned up) */}
              <p className="text-muted-foreground break-all">{profile.email}</p>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsChangeEmailOpen(true)}
            >
              {t("edit")}
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
            <div className="flex-1">
              <p>{t("password")}</p>
              <p className=" text-muted-foreground">••••••••••••</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsChangePasswordOpen(true)}
            >
              {t("edit")}
            </Button>
          </div>
        </CardContent>

        {/* Change Password Dialog */}
        <ChangePasswordDialog
          open={isChangePasswordOpen}
          onOpenChange={setIsChangePasswordOpen}
        />

        {/* Change Email Dialog */}
        <ChangeEmailDialog
          isOpen={isChangeEmailOpen}
          onClose={() => setIsChangeEmailOpen(false)}
        />
      </Card>
    </>
  );
}
