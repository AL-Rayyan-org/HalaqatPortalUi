import { toast } from "sonner";

// Export toast directly as per shadcn/ui documentation
export { toast };

// Maintain backward compatibility with existing showToast API
export const showToast = {
  success: (message: string) => {
    return toast.success(message);
  },
  error: (message: string) => {
    return toast.error(message);
  },
  info: (message: string) => {
    return toast.info(message);
  },
  warning: (message: string) => {
    return toast.warning(message);
  },
  default: (message: string) => {
    return toast(message);
  },
  custom: (message: string) => {
    return toast(message);
  },
};