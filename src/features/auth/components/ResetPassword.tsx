import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPasswordBegin } from "@/features/auth/api/authApi";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showToast } from "@/shared/components/ui/toast-config";
import { useI18n } from "@/shared/hooks/useI18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
} from "@/shared/components/ui";
import { AuthLayout } from "./AuthLayout";
// Email form schema
const ResetPassword = () => {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const emailFormSchema = z.object({
    email: z.string().email({ message: t("common:validation.emailInvalid") }),
  });

  type EmailFormValues = z.infer<typeof emailFormSchema>;

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: "" },
  });

  const onSubmitEmail = async (data: EmailFormValues) => {
    setIsLoading(true);
    try {
      const response = await resetPasswordBegin(data.email);
      if (!response.success) {
        throw new Error(
          response.message || "Failed to send reset password email"
        );
      }
      setEmailSent(true);
      showToast.success(t("auth:resetLinkSentTo", { email: data.email }));
    } catch (err) {
      showToast.error(
        err instanceof Error ? err.message : t("auth:resetPasswordError")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable back to login footer
  const BackToLoginFooter = () => (
    <CardFooter className="flex flex-col space-y-2">
      <div className=" text-muted-foreground text-center">
        <Link
          to="/auth/login"
          className="text-primary hover:underline flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("auth:backToLogin")}
        </Link>
      </div>
    </CardFooter>
  );

  if (emailSent) {
    return (
      <AuthLayout>
        <Card className="w-full bg-card text-card-foreground">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center">
              {t("auth:checkYourEmail")}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground ">
              {t("auth:resetLinkSent")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className=" text-muted-foreground">
                {t("auth:linkSentToyourEmail")}
              </p>
            </div>
          </CardContent>

          <BackToLoginFooter />
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full bg-card text-card-foreground">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold text-center">
            {t("auth:resetPassword")}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground ">
            {t("auth:resetPasswordDescription")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitEmail)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      {t("common:email")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("auth:emailPlaceholder")}
                        type="email"
                        dir="ltr"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full font-semibold"
              >
                {isLoading ? t("common:sending") : t("auth:sendResetLink")}
              </Button>
            </form>
          </Form>
        </CardContent>

        <BackToLoginFooter />
      </Card>
    </AuthLayout>
  );
};

export default ResetPassword;
