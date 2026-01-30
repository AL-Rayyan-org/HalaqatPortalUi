# Hafiz Admin Portal Frontend Developer Guide

## Project Overview
Hafiz (Halaqat Management System) is a React 19 + TypeScript 5.6 + Vite 7 frontend for an internal administration portal managing Quran study circles (Halaqat). Built with shadcn/ui components, Radix UI primitives, TailwindCSS v4, Zustand state management, and full RTL/i18n support (English & Arabic).

**Key Dependencies**: React 19.1, Vite 7.1, TypeScript 5.8, TailwindCSS 4.1, Zod 4.1, React Router 7.8, i18next 25.6

## Architecture Principles

### Feature-Based Structure
Organize by feature domain, not by technical layer:
```
src/features/{feature}/
  ├── components/     # Feature UI components
  ├── api/           # Feature API calls (using fetcher)
  ├── hooks/         # Feature-specific hooks (if needed)
  └── index.ts       # Public exports only
```
**Existing Features**: `auth`, `dashboard`, `orders`, `organizations`, `auditLogs`, `settings` (with MyAccount, Admin, Layout subdirectories)

### Critical Path: Authentication Flow
1. User logs in → `login()` API call returns `{ accessToken }` object
2. Token stored in `localStorage['hafiz-token']`
3. Profile **NOT** returned in login response - must be fetched separately via `fetchAndStoreProfile()`
4. Profile stored in **Zustand memory store** via `setProfile()` (NEVER localStorage)
5. On app mount, `useProfileHydration()` auto-fetches profile if token exists but profile missing
6. All API calls via `fetcher()` auto-attach `Authorization: Bearer {token}` header
7. 401 responses auto-clear both token AND profile, redirect to `/auth/login`

### State Management Rules
- **Profile Data**: ONLY in Zustand (`src/shared/stores/profileStore.ts`)
  - Access via `useProfile()` hook for reactive updates
  - Never use `localStorage.getItem('profile')` pattern
  - Security: Profile in memory only, cleared on logout/401
- **Auth Token**: `localStorage['hafiz-token']` (transmitted, not rendered)
- **Theme**: `localStorage['hafiz-theme']` via `ThemeProvider`
- **Language**: `localStorage['hafiz-language']` via `i18next`

## API Integration Pattern

### Standard API Call Flow
```typescript
// 1. Define types in src/shared/types/api.ts
interface LoginResponse { accessToken: string; }

// 2. Create API function in feature/api/*.ts
export const login = async (credentials: LoginCredentials) => {
  const response = await fetcher<{ accessToken: string }>('/auth/login', 'POST', credentials);
  if (response.success && response.data) {
    localStorage.setItem('Hafiz-token', response.data.accessToken);
    await fetchAndStoreProfile(); // Separate call to fetch profile
  }
  return response;
};

// 3. Handle in component
const response = await login({ username, password });
if (response.success) {
  navigate('/');
} else {
  showToast.error(response.message || 'Login failed');
}
```

### Server Response Contract
```typescript
// ALL API responses follow this structure:
{
  success: boolean,        // Always present
  statusCode: number,      // Always present
  message: string | null,  // Present on error
  data: T,                 // Present on success
  paging?: { ... }        // Present if paginated
}
```

### API Base URLs (apiClient.ts)
- `BASE_URL`: `VITE_API_URL` env var or `https://api.hafiz-internal.com/admin-v1` (default for admin endpoints)
- `COMMON_API_URL`: `VITE_COMMON_API_URL` or `https://api.hafiz-internal.com/v1` (for common endpoints)
- Use 4th parameter in `fetcher()`: `baseURL: true` (admin) or `false` (common)

### Auto-Headers in fetcher()
- `Authorization: Bearer {token}` (if token exists)
- `Accept-Language: {language}` (from `Hafiz-language` localStorage)
- `Content-Type: application/json` (auto-omitted for FormData)

## Route Protection

### Available Guards (src/shared/components/guards/)
```typescript
// Requires authentication (checks Hafiz-token exists)
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Home />} />
</Route>

// Blocks authenticated users (auth pages only)
<Route element={<AuthProtectedRoute />}>
  <Route path="/auth/login" element={<Login />} />
</Route>

// Requires admin/owner role (checks profile.role)
<Route element={<AdminProtectedRoute />}>
  <Route path="/settings/admin" element={<AdminSettingsPage />} />
</Route>
```

### Role Checking
```typescript
import { useIsAdmin } from '@/shared/hooks/useAdmin';
import { useIsOwner } from '@/shared/hooks/useOwner';

const { isAdmin, isLoading, profile } = useIsAdmin();
// isAdmin: null (loading) | true (admin/owner) | false (teacher)
// Checks profile.role for 'admin' or 'owner' (case-insensitive)

const { isOwner } = useIsOwner();
// isOwner: true if role is 'owner', false otherwise
// For system-level configurations restricted to owner only
```

## Component Patterns

### Error State Handling
When displaying error states (using DataError component), hide all interactive elements:
```typescript
// Hide action buttons in header
{!error && canModify && (
  <Button onClick={() => setAddModalOpen(true)}>
    {t("common:add")}
  </Button>
)}

// Hide filters and search
{!error && (
  <div className="filters">
    {/* Search inputs, filters, etc */}
  </div>
)}

// Show only error component in content area
{error ? (
  <DataError
    title={t("common:error")}
    message={t("common:errorMessage")}
    retryText={t("common:retry")}
    onRetry={loadData}
  />
) : (
  // Normal content
)}
```
This prevents users from interacting with non-functional UI when data loading fails.

### CVA Variant System (shadcn/ui)
Split logic from styling for maintainability:
```typescript
// button-variants.ts - Pure styling variants
import { cva } from "class-variance-authority";
export const buttonVariants = cva(
  "base-classes-here",
  { variants: { ... }, defaultVariants: { ... } }
);

// Button.tsx - Logic + forwardRef
import { buttonVariants } from "./button-variants";
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
```

### Form Validation Pattern (Zod + React Hook Form)
```typescript
// 1. Define schema (infer types, no manual interfaces)
const formSchema = z.object({
  email: z.string().min(1, { message: t('common:validation.required') }),
  password: z.string().min(8, { message: t('common:validation.required') }),
});
type FormValues = z.infer<typeof formSchema>;

// 2. Setup form
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: '', password: '' }
});

// 3. Use Form components (NOT native inputs)
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField control={form.control} name="email" render={({ field }) => (
      <FormItem>
        <FormLabel>{t('auth:email')}</FormLabel>
        <FormControl><Input {...field} /></FormControl>
        <FormMessage /> {/* Auto-displays validation errors */}
      </FormItem>
    )} />
  </form>
</Form>
```
**See**: `src/features/auth/components/Login.tsx` for complete example

## Internationalization (i18n)

### Using Translations
```typescript
import { useI18n } from '@/shared/hooks/useI18n';

const { t, language, isRTL, changeLanguage } = useI18n();
t('common:welcome');              // From common namespace
t('auth:login.title');            // From auth namespace
t('key', { defaultValue: '...' }); // Fallback if missing
```

### Namespace Structure (locales/en/ and locales/ar/)
- `common.json`: Shared UI text, validation messages
- `auth.json`: Login, register, password reset
- `dashboard.json`: Dashboard statistics and overview
- `orders.json`: Order management
- `organizations.json`: Organization management
- `settings.json`: Settings pages
- `auditLogs.json`: Audit log tracking
- `email.json`: Email verification flows

### RTL Support
```typescript
// Conditional rendering
{isRTL ? <ChevronLeft /> : <ChevronRight />}

// Tailwind directional utilities (ALWAYS use start/end or ltr/rtl prefixes)
className="text-start text-end ms-4 me-4"
// NEVER use: ml-, mr-, left-, right- (breaks RTL)
```

## Styling with TailwindCSS v4

### CSS Variable → Tailwind Bridge
```css
/* src/styles/index.css */
@theme inline {
  --color-primary: var(--primary);     /* Bridge CSS var to Tailwind */
  --color-background: var(--background);
  /* ... more mappings */
}

:root {
  --primary: oklch(0.205 0 0);         /* Light mode value */
}

.dark {
  --primary: oklch(0.922 0 0);         /* Dark mode value */
}
```

### Dark Mode Custom Variant
```css
@custom-variant dark (&:is(.dark *)); /* Enables dark: prefix */
```
Use `dark:bg-primary dark:text-foreground` in components.

### Theme Switching
Theme applied to `<html class="light|dark">` by ThemeProvider. Persisted in `localStorage['hafiz-theme']`.

## Development Commands

```bash
npm run dev      # Vite dev server on http://localhost:3001 (configured in vite.config.ts)
npm run build    # tsc -b (type check) + vite build
npm run lint     # ESLint with react-hooks rules
npm run preview  # Preview production build locally
```

## Common Tasks

### Adding a New Feature
1. Create `src/features/{feature}/` directory
2. Add `components/`, `api/`, `hooks/` (if needed), `index.ts`
3. Define types in `src/shared/types/api.ts` (if shared across features)
4. Export public APIs through feature `index.ts`
5. Import from feature root: `@/features/my-feature`

### Adding a New API Endpoint
1. Add types to `src/shared/types/api.ts` (or feature-specific if isolated)
2. Create function in `features/{feature}/api/{feature}Api.ts`:
   ```typescript
   export const myApiCall = async (data: RequestType): Promise<ApiResponse<ResponseType>> => {
     return fetcher<ResponseType>('/endpoint', 'POST', data);
   };
   ```
3. Handle response in component (check `response.success`, show toast, etc.)

### Adding a Protected Route
```typescript
// In App.tsx or feature routing
<Route element={<ProtectedRoute />}>
  <Route path="/my-page" element={<MyPage />} />
</Route>

// For admin-only pages
<Route element={<AdminProtectedRoute />}>
  <Route path="/settings/workspace" element={<WorkspaceSettings />} />
</Route>
```

### Adding i18n Keys
1. Add key to `locales/en/{namespace}.json` and `locales/ar/{namespace}.json`
2. Use in component: `t('namespace:key')`
3. Restart dev server to reload translations (hot reload not guaranteed)

### Adding Navigation Item
Edit `src/shared/utils/linksInfo.ts`:
```typescript
// For main sidebar
export const sidebarNavigationItems = [
  { name: "Dashboard", href: "/", icon: Home, exact: true },
  // Add new item here
];

// For settings sidebar (filtered by role)
export const settingsConfig = { sections: [ ... ] };
```

## Critical Files Reference

| File | Purpose |
|------|---------|
| `src/shared/stores/profileStore.ts` | Zustand store for profile (setProfile, clearProfile, updateProfile) |
| `src/shared/services/apiClient.ts` | `fetcher()`, `handleResponse()`, 401 auto-logout logic |
| `src/shared/hooks/useProfileHydration.ts` | Auto-fetch profile on mount if token exists |
| `src/shared/hooks/useAdmin.ts` | `useIsAdmin()` hook for role checking |
| `src/shared/hooks/useI18n.ts` | `useI18n()` hook for translations + RTL |
| `src/shared/types/api.ts` | All TypeScript interfaces for API data |
| `src/shared/utils/appLinks.ts` | Navigation config for sidebar/mobile |
| `src/shared/utils/cn.ts` | `cn()` utility for className merging (tailwind-merge + clsx) |
| `src/styles/index.css` | TailwindCSS v4 config, theme variables, dark mode |
| `src/App.tsx` | Root routes, lazy loading, ThemeProvider, Toaster |
| `vite.config.ts` | Vite config (port 3001, @/ alias, Tailwind plugin) |

## Environment Variables
```env
VITE_API_URL=https://api.hafiz-internal.com/admin-v1  # API base URL (default if not set)
VITE_COMMON_API_URL=https://api.hafiz-internal.com/v1  # Common API base URL (default if not set)
```

## Local Storage Keys
- `Hafiz-token`: JWT auth token (cleared on 401/logout)
- `Hafiz-theme`: Theme preference (`light|dark|system`)
- `Hafiz-language`: Current language (`en|ar`)


## whatever you chabge anything check if there is a translation key needed and add it to locales files

## If you update the breadcrumb make sure to update the breadcrumb for the mobile nav

## Do not use the text-sm for ever! always use the default size (base).

## when adding a section card, table, or any component see the design and structure used in other parts of the app and follow the same structure and spacing. the ui should be consistent across the app

## use FormFieldWrapper component to wrap form (fields or groups such in profile section in settings) instead of using div with grid gap-2 classes or any other classes

## always design the structure mobile first and then add larger screen styles using tailwindcss responsive utilities

## Price Input Component
For all price/currency input fields, use the `PriceInput` component instead of regular `Input`:
```typescript
import { PriceInput } from '@/shared/components/ui';

<PriceInput
  id="costPrice"
  value={price}  // number type
  onChange={(value) => setPrice(value)}  // receives number
  placeholder="0"  // optional
/>
```
This component automatically displays "SAR" suffix and handles number conversion. Use for: product prices, delivery costs, payment amounts, etc.

## Close Confirmation Dialog
When a modal or form has unsaved changes, always confirm before closing to prevent data loss. Use the shared `CloseConfirmDialog` component:

```typescript
import { CloseConfirmDialog } from '@/shared/components/ui';

// In your component:
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [showCloseConfirm, setShowCloseConfirm] = useState(false);

// Track changes
const handleFieldChange = () => {
  // ... update field
  setHasUnsavedChanges(true);
};

// Handle modal close
const handleClose = () => {
  if (hasUnsavedChanges) {
    setShowCloseConfirm(true);
  } else {
    onOpenChange(false);
  }
};

const handleConfirmClose = () => {
  setShowCloseConfirm(false);
  setHasUnsavedChanges(false);
  onOpenChange(false);
};

// In JSX:
<Dialog open={open} onOpenChange={handleClose}>
  {/* ... dialog content */}
</Dialog>

<CloseConfirmDialog
  open={showCloseConfirm}
  onOpenChange={setShowCloseConfirm}
  onConfirm={handleConfirmClose}
/>
```

The `CloseConfirmDialog` component is located at `src/shared/components/ui/CloseConfirmDialog.tsx` and uses translation keys `common:unsavedChanges` and `common:unsavedChangesDescription`. You can optionally provide custom title, description, confirmText, and cancelText props.

## For updating data for any module, we open a modal for update. you must always fetch the the api related to given id to get the latest data instead of passing the data from the table or list to the modal. this is to ensure that we always have the latest data in case it was updated from another session or user.