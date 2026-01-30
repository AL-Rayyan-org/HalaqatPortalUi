import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login } from "@/features/auth/api/authApi";
import type { LocationState } from "@/shared/types/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showToast } from "@/shared/components/ui/toast-config";
import { useI18n } from "@/shared/hooks/useI18n";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
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
} from "@/shared/components/ui";

// Define the form values type
interface FormValues {
  email: string;
  password: string;
}

const Login = () => {
  const { t, isRTL } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // Define the form schema with translated messages
  const formSchema = z.object({
    email: z.string().min(1, { message: t("common:validation.required") }),
    password: z.string().min(8, {
      message: t("common:validation.required"),
    }),
  });

  // Redirect to where the user was trying to go before being sent to login
  const from = state?.from?.pathname || "/";

  // Display success message if redirected from register page
  useEffect(() => {
    if (state?.successMessage) {
      showToast.success(state.successMessage);

      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const response = await login({
        email: data.email,
        password: data.password,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to login");
      }

      // Check if user has a tenant assigned after profile is fetched
      // Profile will be automatically available from the store after fetchAndStoreProfile in login service
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="bg-card">
        <CardHeader className="space-y-1">
          <CardTitle
            className={`text-xl font-bold text-center ${
              isRTL ? "font-arabic" : ""
            }`}
          >
            {t("auth:login")}
          </CardTitle>
          <CardDescription
            className={`text-center ${isRTL ? "font-arabic" : ""}`}
          >
            {t("auth:signInToAccount")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div>
                      <FormLabel className="font-semibold">
                        {t("email")}
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        placeholder={t("email")}
                        type="text"
                        autoComplete="username"
                        dir={isRTL ? "ltr" : "ltr"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-semibold">
                        {t("password")}
                      </FormLabel>
                      <Link
                        to="/auth/reset-password"
                        className="inline-block  text-primary hover:underline"
                      >
                        {t("auth:forgotPassword")}
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        placeholder={t("auth:passwordPlaceholder")}
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? t("common:loading") : t("auth:login")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default Login;
