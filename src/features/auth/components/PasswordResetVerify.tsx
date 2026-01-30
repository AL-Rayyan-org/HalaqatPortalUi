import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  resetPasswordVerify,
  resetPasswordCommit,
} from "@/features/auth/api/authApi";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@/shared/hooks/useI18n";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PasswordStrength,
} from "@/shared/components/ui";
import { AuthLayout } from "./AuthLayout";

const PasswordResetVerify = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "loading" | "password-form" | "success" | "error"
  >("loading");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const isVerifying = useRef(false);

  const verificationCode = searchParams.get("code");
  const emailAddress = searchParams.get("email");

  // Password form schema with translations
  const passwordFormSchema = z
    .object({
      newPassword: z
        .string()
        .min(8, { message: t("common:validation.passwordMin") })
        .regex(/[A-Z]/, { message: t("common:validation.passwordUppercase") })
        .regex(/[a-z]/, { message: t("common:validation.passwordLowercase") })
        .regex(/[0-9]/, { message: t("common:validation.passwordNumber") })
        .regex(/[^A-Za-z0-9]/, {
          message: t("common:validation.passwordSpecial"),
        }),
      confirmPassword: z
        .string()
        .min(8, { message: t("common:validation.passwordMin") }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("common:validation.passwordMismatch"),
      path: ["confirmPassword"],
    });

  type PasswordFormValues = z.infer<typeof passwordFormSchema>;

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!verificationCode || !emailAddress) {
      setStatus("error");
      if (!verificationCode && !emailAddress) {
        setMessage(
          "Invalid password reset link. Missing verification code and email address."
        );
      } else if (!verificationCode) {
        setMessage("Invalid password reset link. Missing verification code.");
      } else {
        setMessage("Invalid password reset link. Missing email address.");
      }
      return;
    }

    const handleVerification = async () => {
      // Prevent double execution even in Strict Mode
      if (isVerifying.current) return;

      isVerifying.current = true;

      try {
        setStatus("loading");
        setMessage("Verifying your password reset request...");

        // Verify the code to get the token
        const verifyResponse = await resetPasswordVerify(
          emailAddress,
          verificationCode
        );

        if (!verifyResponse.success || !verifyResponse.data) {
          throw new Error(
            verifyResponse.message || "Failed to verify reset code"
          );
        }

        setToken(verifyResponse.data.token);
        setStatus("password-form");
        setMessage(t("auth.enterNewPassword"));
      } catch (error) {
        setStatus("error");
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred during verification";
        setMessage(errorMessage);
      }
    };

    handleVerification();
  }, [verificationCode, emailAddress, t]);

  const handlePasswordReset = async (data: PasswordFormValues) => {
    try {
      setStatus("loading");
      setMessage("Resetting your password...");

      const response = await resetPasswordCommit(token, data.newPassword);

      if (!response.success) {
        throw new Error(response.message || t("auth.resetPasswordFailed"));
      }

      setStatus("success");
      setMessage("Your password has been successfully reset!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/auth/login", { replace: true });
      }, 3000);
    } catch (error) {
      setStatus("error");
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during password reset";
      setMessage(errorMessage);
    }
  };

  const handleRedirectToLogin = () => {
    navigate("/auth/login", { replace: true });
  };

  // Reusable status icon component
  const StatusIcon = ({
    statusType,
  }: {
    statusType: "loading" | "password-form" | "success" | "error";
  }) => {
    const iconConfig = {
      loading: {
        icon: Loader2,
        className: "size-8 animate-spin text-blue-600",
        bgClass: "bg-blue-100",
      },
      success: {
        icon: CheckCircle2,
        className: "size-8 text-green-600",
        bgClass: "bg-green-100",
      },
      error: {
        icon: XCircle,
        className: "size-8 text-red-600",
        bgClass: "bg-red-100",
      },
      "password-form": { icon: null, className: "", bgClass: "" },
    };

    const config = iconConfig[statusType];
    const Icon = config.icon;

    if (!Icon) return null;

    return (
      <div
        className={`inline-flex items-center justify-center w-16 h-16 ${config.bgClass} rounded-full mb-4`}
      >
        <Icon className={config.className} />
      </div>
    );
  };

  if (status === "password-form") {
    return (
      <AuthLayout>
        <Card className="bg-card text-card-foreground">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center">
              {t("auth:resetYourPassword")}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground ">
              {t("auth:enterNewPassword")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handlePasswordReset)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required font-semibold">
                        {t("common:password")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("auth:passwordPlaceholder")}
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <div className="mt-2">
                        <PasswordStrength password={field.value} />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t("auth:passwordRequirements")}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required font-semibold">
                        {t("common:confirmPassword")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("auth:confirmPasswordPlaceholder")}
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  {t("auth:resetPassword")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  const statusDescription = {
    loading: t("auth:verifyingResetRequest"),
    success: t("auth:passwordResetSuccess"),
    error: t("auth:resetLinkIssue"),
    "password-form": "",
  };

  return (
    <AuthLayout>
      <Card className="bg-card text-card-foreground">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold text-center">
            {t("auth:passwordReset")}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground ">
            {statusDescription[status]}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <StatusIcon statusType={status} />
              <p className=" text-muted-foreground">{message}</p>
            </div>

            {status === "success" && (
              <div className="space-y-4">
                <p className=" text-center text-muted-foreground">
                  You will be redirected to login in a few seconds...
                </p>
                <Button onClick={handleRedirectToLogin} className="w-full">
                  Go to Login
                </Button>
              </div>
            )}

            {status === "error" && (
              <Button onClick={handleRedirectToLogin} className="w-full">
                Back to Login
              </Button>
            )}

            {status === "loading" && (
              <div className="text-center">
                <p className=" text-muted-foreground">
                  This may take a few moments...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default PasswordResetVerify;
