import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/shared/hooks/useI18n";
import { useIsAdmin } from "@/shared/hooks/useAdmin";
import { showToast } from "@/shared/components/ui/toast-config";
import { formatDate } from "@/shared/utils/formatDate";
import getInitials from "@/shared/utils/getInitials"; // Assumed shared util
import {
  getCategories,
  deleteCategory,
} from "@/features/settings/Admin/api/categoriesApi";
import { getAvatarColorByLetter } from "@/shared/utils/getAvatarColorByLetter";
import { AddCategoryModal } from "@/features/settings/Admin/categories/components/AddCategoryModal";
import { EditCategoryModal } from "@/features/settings/Admin/categories/components/EditCategoryModal";
import type { Category } from "@/features/settings/Admin/types";
import {
  Avatar,
  Button,
  DataError,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  ConfirmDialog,
  Skeleton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui";
import { MoreVertical, Trash2, Pencil } from "lucide-react";

export default function CategoriesPage() {
  const { t } = useI18n();
  const { isAdmin } = useIsAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");

  // Confirmation dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    (() => Promise<void>) | null
  >(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(true);
        showToast.error(
          response.message || t("settings:errors.failedToLoadCategories"),
        );
      }
    } catch {
      setError(true);
      showToast.error(t("settings:errors.failedToLoadCategories"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Helper function to show confirmation dialog
  const showConfirmDialog = (action: () => Promise<void>) => {
    setConfirmAction(() => action);
    setConfirmDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setIsConfirming(true);
    try {
      await confirmAction();
      setConfirmDialogOpen(false);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    setSelectedCategoryName(category.name);

    showConfirmDialog(async () => {
      try {
        const response = await deleteCategory(category.id);
        if (response.success) {
          showToast.success(t("settings:categories.deleted"));
          loadCategories();
        } else {
          showToast.error(
            response.message || t("settings:errors.failedToDeleteCategory"),
          );
        }
      } catch {
        showToast.error(t("settings:errors.failedToDeleteCategory"));
      }
    });
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategoryId(category.id);
    setEditModalOpen(true);
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("settings:categories.title")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("settings:categories.description")}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setAddModalOpen(true)}>
            {t("settings:categories.newCategory")}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-6">
        {error ? (
          <DataError
            title={t("settings:errors.couldntLoadData")}
            message={t("settings:errors.failedToLoadCategories")}
            retryText={t("common:retry")}
            onRetry={loadCategories}
          />
        ) : (
          <div className="rounded-lg border bg-card text-card-foreground">
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="ps-6 py-4 font-medium w-[50%]">
                      {t("common:name")}
                    </TableHead>
                    <TableHead className="px-6 py-4 font-medium w-[40%]">
                      {t("settings:categories.createdOn")}
                    </TableHead>
                    {isAdmin && (
                      <TableHead className="px-6 py-4 font-medium w-[10%] text-center">
                        {t("common:actions")}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Skeleton rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell className="ps-6 py-5">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-[150px]" />
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <Skeleton className="h-4 w-[120px]" />
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="px-6 py-5 text-center">
                            <Skeleton className="h-8 w-8 mx-auto" />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <p>{t("settings:categories.noCategories")}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => {
                      const initials = getInitials(category.name);
                      const avatarColor = getAvatarColorByLetter(
                        category.name[0],
                      );
                      return (
                        <TableRow
                          key={category.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="ps-6 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                className={`h-9 w-9 flex items-center justify-center ${avatarColor}`}
                              >
                                {initials}
                              </Avatar>
                              <span className="font-medium">
                                {category.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3 text-muted-foreground">
                            {formatDate(category.createdOn)}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="px-6 py-3 text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-muted"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditCategory(category)}
                                  >
                                    <Pencil className="me-2 h-4 w-4" />
                                    {t("common:edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteCategory(category)
                                    }
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="me-2 h-4 w-4" />
                                    {t("common:delete")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCategoryModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={loadCategories}
      />

      <EditCategoryModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={loadCategories}
        categoryId={selectedCategoryId}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={t("common:confirm")}
        description={t("settings:categories.deleteConfirmDescription", {
          name: selectedCategoryName || "",
        })}
        confirmText={t("common:delete")}
        variant="destructive"
        isLoading={isConfirming}
        loadingText={t("common:deleting")}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
