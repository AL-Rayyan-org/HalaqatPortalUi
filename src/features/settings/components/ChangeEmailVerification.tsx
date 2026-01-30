import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useI18n } from "@/shared/hooks/useI18n";
import { fetchAndStoreProfile } from "@/shared/services";
import {
  verifyEmailChangeCode,
  commitEmailChange,
} from "@/features/settings/MyAccount/api/security";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";

const ChangeEmailVerify = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const isVerifying = useRef(false);

  const verificationCode = searchParams.get("code");
  const emailAddress = searchParams.get("email");

  useEffect(() => {
    if (!verificationCode || !emailAddress) {
      setStatus("error");
      if (!verificationCode && !emailAddress) {
        setMessage(t("email:errors.invalidLinkMissingBoth"));
      } else if (!verificationCode) {
        setMessage(t("email:errors.invalidLinkMissingCode"));
      } else {
        setMessage(t("email:errors.invalidLinkMissingEmail"));
      }
      return;
    }

    const handleVerification = async () => {
      // Prevent double execution even in Strict Mode
      if (isVerifying.current) return;

      isVerifying.current = true;

      try {
        setStatus("loading");
        setMessage(t("email:messages.verifying"));

        // First, verify the code
        const verifyResponse = await verifyEmailChangeCode({
          address: emailAddress,
          code: verificationCode,
        });

        if (!verifyResponse.success || !verifyResponse.data) {
          throw new Error(
            verifyResponse.message || t("email:errors.failedToVerifyCode")
          );
        }

        // Now commit the email change
        const commitResponse = await commitEmailChange({
          token: verifyResponse.data.token,
        });

        if (!commitResponse.success) {
          throw new Error(
            commitResponse.message || t("email:errors.failedToCompleteChange")
          );
        }

        // Refetch and store updated profile
        try {
          await fetchAndStoreProfile();
        } catch (error) {
          console.error("Failed to refresh profile:", error);
        }

        setStatus("success");
        setMessage(t("email:messages.changeSuccessful"));
      } catch (error) {
        setStatus("error");
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("email:errors.genericError");
        setMessage(errorMessage);
      }
    };

    handleVerification();
  }, [verificationCode, emailAddress, navigate, t]);

  const handleRedirectToSettings = () => {
    navigate("/settings", { replace: true });
  };

  const renderIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="size-8 animate-spin text-blue-600" />;
      case "success":
        return <CheckCircle2 className="size-8 text-green-600" />;
      case "error":
        return <XCircle className="size-8 text-red-600" />;
    }
  };

  const getIconBgClass = () => {
    switch (status) {
      case "loading":
        return "bg-blue-100";
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
    }
  };

  return (
    <>
      <AuthHeader />
      <div className="flex flex-col min-h-screen w-full items-center justify-center p-6 pt-24">
        <div className="w-full max-w-md flex-col gap-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-bold text-center">
                {t("email:title.changeVerification")}
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground ">
                {status === "loading" && t("email:descriptions.verifying")}
                {status === "success" &&
                  t("email:descriptions.changeSuccessful")}
                {status === "error" && t("email:descriptions.changeError")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Icon and Status */}
                <div className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 ${getIconBgClass()} rounded-full mb-4`}
                  >
                    {renderIcon()}
                  </div>
                  <p className=" text-muted-foreground">{message}</p>
                </div>

                {/* Action Button */}
                {status === "success" && (
                  <div className="space-y-4">
                    <p className=" text-center text-muted-foreground">
                      {t("email:messages.redirectToSettings")}
                    </p>
                    <Button
                      onClick={handleRedirectToSettings}
                      className="w-full"
                    >
                      {t("email:goToSettings")}
                    </Button>
                  </div>
                )}

                {status === "error" && (
                  <div className="space-y-4">
                    <Button
                      onClick={handleRedirectToSettings}
                      className="w-full"
                    >
                      {t("email:backToSettings")}
                    </Button>
                  </div>
                )}

                {status === "loading" && (
                  <div className="text-center">
                    <p className=" text-muted-foreground">
                      {t("email:messages.waitingMessage")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ChangeEmailVerify;
