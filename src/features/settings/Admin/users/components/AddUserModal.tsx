import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@/shared/hooks/useI18n";
import { showToast } from "@/shared/components/ui/toast-config";
import { getInvitableRoles, getRoleTranslationKey } from "@/shared/utils/roles";
import { getTimezones } from "@/shared/services/profileService";
import { getIpGeolocation } from "@/shared/services/ipService";
import { createSystemUser } from "@/features/settings/Admin/api/usersApi";
import type { InvitableRole } from "@/shared/types/api";
import type { CreateSystemUserRequest } from "@/features/settings/Admin/types";

import {
  Button,
  Combobox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type ComboboxOption,
} from "@/shared/components/ui";

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

export function AddUserModal({
  open,
  onOpenChange,
  onUserAdded,
}: AddUserModalProps) {
  const { t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timezones, setTimezones] = useState<ComboboxOption[]>([]);
  const [isLoadingTimezones, setIsLoadingTimezones] = useState(false);

  // Load timezones when modal opens
  useEffect(() => {
    if (open) {
      loadTimezones();
      detectUserTimezone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const detectUserTimezone = async () => {
    try {
      const response = await getIpGeolocation();
      if (response.success && response.data?.timezone) {
        form.setValue("timezoneId", response.data.timezone);
      }
      console.log("Detected timezone:", response.data);
    } catch {
      console.log("Failed to detect timezone");
      // Silent fail - user can manually select timezone
    }
  };

  const loadTimezones = async () => {
    setIsLoadingTimezones(true);
    try {
      const response = await getTimezones();
      if (response.success && response.data) {
        const timezoneOptions: ComboboxOption[] = Object.entries(
          response.data
        ).map(([id, label]) => ({ value: id, label }));
        setTimezones(timezoneOptions);
      } else {
        showToast.error(t("common:errors.failedToLoadTimezones"));
      }
    } catch {
      showToast.error(t("common:errors.failedToLoadTimezones"));
    } finally {
      setIsLoadingTimezones(false);
    }
  };

  const formSchema = z.object({
    // Changed: Removed .min(1) and added .optional()
    username: z.string().optional(),
    password: z
      .string()
      .min(8, { message: t("common:validation.minLength", { min: 8 }) }),
    firstName: z.string().min(1, { message: t("common:validation.required") }),
    lastName: z.string().min(1, { message: t("common:validation.required") }),
    email: z.string().email({ message: t("common:validation.invalidEmail") }),
    // Changed: Removed .min(1) and added .optional()
    phone: z.string().optional(),
    timezoneId: z.string().min(1, { message: t("common:validation.required") }),
    role: z.string().min(1, { message: t("common:validation.required") }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      timezoneId: "",
      role: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const requestData: CreateSystemUserRequest = {
        ...values,
        // Convert empty strings to undefined to avoid backend validation errors
        username: values.username || "",
        phone: values.phone || "",
        role: values.role as InvitableRole,
      };

      const response = await createSystemUser(requestData);

      if (response.success) {
        showToast.success(t("settings:messages.userAddedSuccessfully"));
        form.reset();
        onUserAdded();
        onOpenChange(false);
      } else {
        showToast.error(
          response.message || t("settings:errors.failedToAddUser")
        );
      }
    } catch {
      showToast.error(t("settings:errors.failedToAddUser"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      form.reset();
      onOpenChange(newOpen);
    }
  };

  const availableRoles = getInvitableRoles();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{t("settings:actions.newMember")}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("common:firstName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("common:lastName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common:username")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common:email")}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
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
                    <FormLabel>{t("common:password")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common:role")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("common:selectRole")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {t(getRoleTranslationKey(role.value))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common:phone")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezoneId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common:timezone")}</FormLabel>
                    <FormControl>
                      <Combobox
                        options={timezones}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t("common:placeholders.selectTimezone")}
                        disabled={isLoadingTimezones}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                {t("common:cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("common:adding") : t("common:add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
