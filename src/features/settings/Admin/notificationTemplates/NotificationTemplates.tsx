import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/shared/hooks/useI18n";
import { useIsAdmin } from "@/shared/hooks/useAdmin";
import { showToast } from "@/shared/components/ui/toast-config";
import { getNotificationTemplates } from "@/features/settings/Admin/api/notificationTemplatesApi";
import { EditTemplateModal } from "./components/EditTemplateModal";
import type { NotificationTemplateListItem } from "@/features/settings/Admin/types";
import getInitials from "@/shared/utils/getInitials";
import { getAvatarColorByLetter } from "@/shared/utils/getAvatarColorByLetter";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  DataError,
  Skeleton,
  AccessDenied,
} from "@/shared/components/ui";
import { Pencil } from "lucide-react";

export default function NotificationTemplatesPage() {
  const { t } = useI18n();
  const { isAdmin, isLoading: isCheckingAdmin } = useIsAdmin();
  const [templates, setTemplates] = useState<NotificationTemplateListItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await getNotificationTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      } else {
        setError(true);
        showToast.error(
          response.message ||
            t("settings:notificationTemplates.errors.failedToLoad"),
        );
      }
    } catch {
      setError(true);
      showToast.error(t("settings:notificationTemplates.errors.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isAdmin) {
      loadTemplates();
    }
  }, [isAdmin, loadTemplates]);

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setEditModalOpen(true);
  };

  // Show loader while checking admin status
  if (isCheckingAdmin) {
    return (
      <div className="flex h-full flex-col space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
        </div>
        <div className="flex-1">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Show access denied for non-admins
  if (!isAdmin) {
    return (
      <AccessDenied
        title={t("common:accessDenied")}
        message={t("settings:notificationTemplates.errors.adminOnly")}
      />
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("settings:notificationTemplates.title")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("settings:notificationTemplates.description")}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-6">
        {error ? (
          <DataError
            title={t("settings:errors.couldntLoadData")}
            message={t("settings:notificationTemplates.errors.failedToLoad")}
            retryText={t("common:retry")}
            onRetry={loadTemplates}
          />
        ) : isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={`skeleton-${index}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-[200px]" />
                    </div>
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">
              {t("settings:notificationTemplates.noTemplates")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {templates.map((template) => {
              const initials = getInitials(template.description);
              const avatarColor = getAvatarColorByLetter(
                template.description[0],
              );
              return (
                <Card
                  key={template.id}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        className={`h-12 w-12 flex items-center justify-center ${avatarColor}`}
                      >
                        {initials}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {template.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTemplate(template.id)}
                        title={t("common:edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedTemplateId && (
        <EditTemplateModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          templateId={selectedTemplateId}
        />
      )}
    </div>
  );
}
