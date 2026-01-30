import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/shared/utils/cn";

const BreadcrumbContext = React.createContext<{
  separator: React.ReactNode;
}>({
  separator: <span className="mx-1">/</span>,
});

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode;
}

export function Breadcrumb({
  separator,
  className,
  children,
  ...props
}: BreadcrumbProps) {

  // Use / as default separator
  const effectiveSeparator = separator ?? <span className="mx-1">/</span>;

  return (
    <BreadcrumbContext.Provider value={{ separator: effectiveSeparator }}>
      <nav aria-label="breadcrumb" className={cn("flex", className)} {...props}>
        {children}
      </nav>
    </BreadcrumbContext.Provider>
  );
}

export function BreadcrumbList({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    >
      {children}
    </ul>
  );
}

export function BreadcrumbItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

export interface BreadcrumbLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
  isRouter?: boolean;
}

export function BreadcrumbLink({
  asChild,
  className,
  isRouter = false,
  ...props
}: BreadcrumbLinkProps) {
  const Component = asChild ? Slot : "a";

  return (
    <Component
      className={cn("text-muted-foreground hover:text-foreground", className)}
      {...props}
      {...(isRouter && {
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          if (props.href) {
            window.history.pushState({}, "", props.href);
            const navEvent = new PopStateEvent("popstate");
            window.dispatchEvent(navEvent);
          }
          if (props.onClick) {
            // We need to use a type assertion here because the event types may not match exactly
            const handler =
              props.onClick as React.MouseEventHandler<HTMLAnchorElement>;
            handler(e);
          }
        },
      })}
    />
  );
}

export function BreadcrumbPage({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("font-medium", className)} {...props} />;
}

export function BreadcrumbSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const { separator } = React.useContext(BreadcrumbContext);

  return (
    <li className={cn("text-muted-foreground text-sm", className)} {...props}>
      {separator}
    </li>
  );
}

export function BreadcrumbEllipsis({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <li className={cn("flex items-center", className)} {...props}>
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More</span>
    </li>
  );
}
