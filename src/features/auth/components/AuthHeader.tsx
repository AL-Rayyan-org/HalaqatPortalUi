import { BookOpenTextIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { LanguageSwitcher } from "@/shared/components/ui";
import {t} from "i18next";

interface AuthHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export function AuthHeader({ className, children }: AuthHeaderProps) {

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background.",
        className
      )}
    >
      <div className="flex items-center justify-between w-full px-6 py-4 md:px-10">
        {/* Logo and company name on the left */}
        <Link
          to="/auth/login"
          className="flex items-center gap-3 font-medium hover:opacity-90 transition-opacity"
        >
          <BookOpenTextIcon className="size-8 text-primary" />
          <span className="text-xl font-medium">{t("Hafiz")}</span>
        </Link>

        {/* Language switcher and optional children on the right */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {children}
        </div>
      </div>
    </header>
  );
}
