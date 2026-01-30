/**
 * System Users Admin types
 */

import type { UserRole, InvitableRole } from '@/shared/types/api';

export interface SystemUser {
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  joinedOn: string;
}

export interface CreateSystemUserRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timezoneId: string;
  role: InvitableRole;
}

export interface UpdateSystemUserRoleRequest {
  role: InvitableRole;
}

export interface ChangeSystemUserPasswordRequest {
  newPassword: string;
}

export interface CreateSystemUserResponse {
  id: string;
}

export interface UserInfo {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  userType: string;
  timeZone: string;
  tenantId: string | null;
  tenantName: string | null;
  role: string | null;
  defaultTenant: boolean;
}

// ==================== EMAIL SETTINGS ====================

export interface EmailSettings {
  host: string;
  port: number;
  fromEmail: string;
  fromName: string;
  username: string;
}

export interface UpdateEmailSettingsRequest {
  host: string;
  port: number;
  fromEmail: string;
  fromName: string;
  username: string;
  password: string;
}

// ==================== CATEGORIES ====================

export interface Category {
  id: string;
  name: string;
  createdOn: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

export interface CreateCategoryResponse {
  id: string;
}

// ==================== PRODUCTS/SERVICES ====================

export type ProductStatus = 'inactive' | 'active' | 'archived';
export type DeliveryType = 'online' | 'inBranch' | 'domesticShipping' | 'internationalShipping' | 'notSpecified';
export type PriceType = 'fixed' | 'setLater';
export type FormFieldType = 'text' | 'number' | 'list' | 'date' | 'phone' | 'email' | 'file' | 'country';

export interface DeliveryOption {
  id: string;
  deliveryType: DeliveryType;
  notes: string;
  priceType: PriceType;
  price: number;
}

// Field Settings Types
export interface TextFieldSettings {
  multiline: boolean;
  maxLength: number;
  minLength: number;
}

export interface NumberFieldSettings {
  maxValue: number;
  minValue: number;
}

export interface ListOption {
  name: string;
  value: string;
}

export type ListDisplayType = 'dropdown' | 'radio';

export interface ListFieldSettings {
  options: ListOption[];
  default: string | null;
  displayType: ListDisplayType;
}

export interface DateFieldSettings {
  pastOnly: boolean;
  futureOnly: boolean;
}

export interface CountryFieldSettings {
  countries: string[];
  default: string | null;
}

// Union type for all field settings
export type FormFieldSettings = 
  | TextFieldSettings 
  | NumberFieldSettings 
  | ListFieldSettings 
  | DateFieldSettings 
  | CountryFieldSettings
  | Record<string, never>; // For fields without settings (phone, email, file)

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  settings?: FormFieldSettings;
}

export interface ProductForm {
  fields: FormField[];
}

export interface Product {
  id: string;
  code: string;
  imageUrl: string | null;
  status: ProductStatus;
  categoryId: string;
  name: string;
  requirements: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  canDelete: boolean;
  canEditForm: boolean;
  deliveryOptions: DeliveryOption[];
  nationalityCountries: string[];
  residencyCountries: string[];
  form: ProductForm;
  createdOn: string;
}

export interface ProductRequest {
  code: string;
  status: ProductStatus;
  categoryId: string;
  name: string;
  requirements: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  deliveryOptions: DeliveryOption[];
  nationalityCountries: string[];
  residencyCountries: string[];
  form: ProductForm;
}


export interface CreateProductResponse {
  id: string;
}

export interface UpdateProductStatusRequest {
  status: ProductStatus;
}

// ==================== NOTIFICATION TEMPLATES ====================

export interface NotificationTemplateListItem {
  id: string;
  description: string;
}

export interface NotificationTemplateVariant {
  templateId: string;
  language: string;
  channel: string;
  subject: string;
  body: string;
  from: string;
  fromName: string;
  replyTo: string;
  cc: string[];
  bcc: string[];
  isHtml: boolean;
  defaultFrom: string;
  defaultFromName: string;
  defaultReplyTo: string;
}

export interface NotificationTemplate {
  id: string;
  description: string;
  variables: string[];
  variants: NotificationTemplateVariant[];
}

export interface UpdateNotificationTemplateRequest {
  templateId: string;
  language: string;
  channel: string;
  subject: string;
  body: string;
  from: string;
  fromName: string;
  replyTo: string;
  cc: string[];
  bcc: string[];
  isHtml: boolean;
}
