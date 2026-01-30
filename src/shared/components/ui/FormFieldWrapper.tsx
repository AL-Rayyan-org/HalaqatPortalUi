import * as React from "react";
import { cn } from "@/shared/utils/cn";

export interface FormFieldWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * FormFieldWrapper - A consistent wrapper for form fields (Label + Input/Select/Combobox/etc).
 *
 * **Purpose**: Provides standardized spacing between label and input using grid with gap-2.
 *
 * **Benefits**:
 * - Centralizes form field spacing - change `gap-2` here to update ALL form fields across the app
 * - Ensures consistent UI/UX throughout the application
 * - Reduces code duplication and maintenance burden
 *
 * **Usage**:
 * ```tsx
 * <FormFieldWrapper>
 *   <Label>{t("fieldName")}</Label>
 *   <Input value={value} onChange={handleChange} />
 * </FormFieldWrapper>
 * ```
 *
 * **Before** (old pattern - DON'T use):
 * ```tsx
 * <div className="grid gap-2">
 *   <Label>Email</Label>
 *   <Input />
 * </div>
 * ```
 *
 * **After** (new pattern - DO use):
 * ```tsx
 * <FormFieldWrapper>
 *   <Label>Email</Label>
 *   <Input />
 * </FormFieldWrapper>
 * ```
 *
 * @example
 * // With Input
 * <FormFieldWrapper>
 *   <Label>{t("email")}</Label>
 *   <Input type="email" value={email} onChange={handleEmailChange} />
 * </FormFieldWrapper>
 *
 * @example
 * // With Select
 * <FormFieldWrapper>
 *   <Label>{t("role")}</Label>
 *   <Select value={role} onValueChange={setRole}>
 *     <SelectTrigger><SelectValue /></SelectTrigger>
 *     <SelectContent>...</SelectContent>
 *   </Select>
 * </FormFieldWrapper>
 *
 * @example
 * // With Combobox
 * <FormFieldWrapper>
 *   <Label>{t("country")}</Label>
 *   <Combobox options={countries} value={country} onValueChange={setCountry} />
 * </FormFieldWrapper>
 */
const FormFieldWrapper = React.forwardRef<
  HTMLDivElement,
  FormFieldWrapperProps
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("grid gap-2", className)} {...props} />;
});

FormFieldWrapper.displayName = "FormFieldWrapper";

export { FormFieldWrapper };
