import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { BookOpenTextIcon } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  showPendingInvitation?: boolean;
}

export function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <>
      <div className="grid min-h-screen w-full lg:grid-cols-2 bg-background">
        {/* Form Section */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-24 lg:pt-18">
            <AuthHeader />
          <div className="w-full max-w-md space-y-6">
            {children}
          </div>
        </div>

        <div className={`hidden lg:block relative bg-primary/10`}>
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-32 h-32 mx-auto bg-primary/10 rounded-full">
                <BookOpenTextIcon className="w-16 h-16 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-3xl">
                  خيركم من تعلم القرآن <span className="font-bold text-primary">وعلمه</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
