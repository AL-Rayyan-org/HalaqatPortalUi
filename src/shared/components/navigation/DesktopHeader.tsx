import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui";
import { useBreadcrumbs } from "@/shared/hooks/useBreadcrumbs";
import { Home } from "lucide-react";

export function DesktopHeader() {
  const { breadcrumbs } = useBreadcrumbs();

  // Check if we're on the home page
  const isHomePage = breadcrumbs.length === 1 && breadcrumbs[0].href === "/";

  return (
    <header className="hidden md:flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <Breadcrumb>
        <BreadcrumbList>
          {isHomePage ? (
            // If on home page, show the page name instead of icon
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumbs[0].name}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              {/* Show home icon first when not on home page */}
              <BreadcrumbItem>
                <BreadcrumbLink href="/" isRouter>
                  <Home className="h-5 w-5" />
                </BreadcrumbLink>
              </BreadcrumbItem>

              {/* Add separator after home if there are more breadcrumbs */}
              {breadcrumbs.length > 0 && breadcrumbs[0].href !== "/" && (
                <BreadcrumbSeparator />
              )}

              {/* Show rest of breadcrumbs, but skip home if it's already in the list */}
              {breadcrumbs
                .filter((crumb) => crumb.href !== "/")
                .map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center gap-1.5">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href} isRouter>
                          {crumb.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
