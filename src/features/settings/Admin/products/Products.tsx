import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/shared/hooks/useI18n";
import { useIsAdmin } from "@/shared/hooks/useAdmin";
import { showToast } from "@/shared/components/ui/toast-config";
import { formatDate } from "@/shared/utils/formatDate";
import {
  getProducts,
  deleteProduct,
  duplicateProduct,
} from "@/features/settings/Admin/api/productsApi";
import { getCategories } from "@/features/settings/Admin/api/categoriesApi";
import { AddProductModal } from "./components/modals/AddProductModal";
import { EditProductModal } from "./components/modals/EditProductModal";
import { ChangeStatusModal } from "./components/modals/ChangeStatusModal";
import type {
  Product,
  ProductStatus,
  Category,
} from "@/features/settings/Admin/types";
import type { Paging } from "@/shared/types/api";
import {
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
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import {
  MoreVertical,
  Trash2,
  Pencil,
  Briefcase,
  Orbit,
  Copy,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Image,
} from "lucide-react";

// Status badge variants
const getStatusBadgeVariant = (status: ProductStatus) => {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "secondary";
    case "archived":
      return "outline";
    default:
      return "secondary";
  }
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductsPage() {
  const { t, isRTL } = useI18n();
  const { isAdmin } = useIsAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paging, setPaging] = useState<Paging | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Pagination states
  const [pageSize] = useState(50);
  const [pageIndex, setPageIndex] = useState(0);

  // Debounce search text
  const debouncedSearchText = useDebounce(searchText, 500);

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [selectedProductStatus, setSelectedProductStatus] =
    useState<ProductStatus>("inactive");

  // Confirmation dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    (() => Promise<void>) | null
  >(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({
    title: "",
    description: "",
    confirmText: "",
    loadingText: "",
    variant: "destructive" as "destructive" | "default",
  });

  const loadProducts = useCallback(
    async (isInitialLoad = false) => {
      if (isInitialLoad) {
        setInitialLoading(true);
      } else {
        setIsLoading(true);
      }
      setError(false);
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          getProducts(
            debouncedSearchText || undefined,
            selectedStatus === "all" ? undefined : selectedStatus,
            selectedCategory === "all" ? undefined : selectedCategory,
            undefined, // contextTenantId
            pageSize,
            pageIndex,
          ),
          getCategories(),
        ]);

        if (productsResponse.success && productsResponse.data) {
          setProducts(productsResponse.data);
          if (productsResponse.paging) {
            setPaging({
              totalPages: productsResponse.paging.totalPages,
              totalItems: productsResponse.paging.totalItems,
              pageSize: productsResponse.paging.pageSize,
              pageIndex: productsResponse.paging.pageIndex,
              hasPrevious: productsResponse.paging.hasPrevious,
              hasNext: productsResponse.paging.hasNext,
            });
          }
        } else {
          setError(true);
          showToast.error(
            productsResponse.message ||
              t("settings:services.errors.failedToLoad"),
          );
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch {
        setError(true);
        showToast.error(t("settings:services.errors.failedToLoad"));
      } finally {
        setInitialLoading(false);
        setIsLoading(false);
      }
    },
    [
      debouncedSearchText,
      selectedStatus,
      selectedCategory,
      pageSize,
      pageIndex,
      t,
    ],
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset to first page when filters change
  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearchText, selectedStatus, selectedCategory]);

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "-";
  };

  // Helper function to show confirmation dialog
  const showConfirmDialog = (
    action: () => Promise<void>,
    config: typeof confirmDialogConfig,
  ) => {
    setConfirmAction(() => action);
    setConfirmDialogConfig(config);
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

  const handleDeleteProduct = async (product: Product) => {
    setSelectedProductName(product.name);

    showConfirmDialog(
      async () => {
        try {
          const response = await deleteProduct(product.id);
          if (response.success) {
            showToast.success(t("settings:services.deleted"));
            loadProducts();
          } else {
            showToast.error(
              response.message || t("settings:services.errors.failedToDelete"),
            );
          }
        } catch {
          showToast.error(t("settings:services.errors.failedToDelete"));
        }
      },
      {
        title: t("common:confirm"),
        description: t("settings:services.deleteConfirmDescription", {
          name: product.name,
        }),
        confirmText: t("common:delete"),
        loadingText: t("common:deleting"),
        variant: "destructive",
      },
    );
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setEditModalOpen(true);
  };

  const handleChangeStatus = (product: Product) => {
    setSelectedProductId(product.id);
    setSelectedProductName(product.name);
    setSelectedProductStatus(product.status);
    setChangeStatusModalOpen(true);
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const response = await duplicateProduct(product.id);
      if (response.success) {
        showToast.success(t("settings:services.duplicatedSuccess"));
        loadProducts();
      } else {
        showToast.error(
          response.message || t("settings:services.errors.failedToLoad"),
        );
      }
    } catch {
      showToast.error(t("settings:services.errors.failedToLoad"));
    }
  };

  const handleStatusChanged = (productId: string, newStatus: ProductStatus) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, status: newStatus } : product,
      ),
    );
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (paging?.hasPrevious) {
      setPageIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (paging?.hasNext) {
      setPageIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("settings:services.title")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("settings:services.description")}
          </p>
        </div>
        {!error && isAdmin && (
          <Button onClick={() => setAddModalOpen(true)}>
            {t("settings:services.newService")}
          </Button>
        )}
      </div>

      {/* Filters */}
      {!error && (
        <div className="flex flex-col flex-wrap sm:flex-row gap-3 mb-4">
          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("settings:services.searchServices")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="ps-9"
            />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[180px]">
            <Filter className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value)}
            >
              <SelectTrigger className="ps-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("settings:services.allStatuses")}
                </SelectItem>
                <SelectItem value="active">
                  {t("settings:services.status.active")}
                </SelectItem>
                <SelectItem value="inactive">
                  {t("settings:services.status.inactive")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[200px]">
            <Briefcase className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <SelectTrigger className="ps-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("settings:services.allCategories")}
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto pb-6">
        {error ? (
          <DataError
            title={t("settings:errors.couldntLoadData")}
            message={t("settings:services.errors.failedToLoad")}
            retryText={t("common:retry")}
            onRetry={loadProducts}
          />
        ) : (
          <div className="rounded-lg border bg-card text-card-foreground">
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="ps-6 py-4 font-medium">
                      {t("common:name")}
                    </TableHead>
                    <TableHead className="px-6 py-4 font-medium">
                      {t("common:code")}
                    </TableHead>
                    <TableHead className="px-6 py-4 font-medium">
                      {t("common:category")}
                    </TableHead>
                    <TableHead className="px-6 py-4 font-medium">
                      {t("settings:services.costPrice")}
                    </TableHead>
                    <TableHead className="px-6 py-4 font-medium">
                      {t("settings:services.sellingPrice")}
                    </TableHead>
                    <TableHead className="px-6 py-4 font-medium">
                      {t("common:status")}
                    </TableHead>
                    <TableHead className="px-6 py-4 font-medium">
                      {t("settings:services.createdOn")}
                    </TableHead>
                    {isAdmin && (
                      <TableHead className="px-6 py-4 font-medium text-center">
                        {t("common:actions")}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialLoading || isLoading ? (
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
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <Skeleton className="h-4 w-[60px]" />
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <Skeleton className="h-4 w-[60px]" />
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <Skeleton className="h-4 w-[60px]" />
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <Skeleton className="h-6 w-[70px]" />
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="px-6 py-5 text-center">
                            <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Briefcase className="h-12 w-12 mb-4 opacity-50" />
                          <p>{t("settings:services.noServices")}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      return (
                        <TableRow
                          key={product.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="ps-6 py-3">
                            <div className="flex items-center gap-3">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div
                                  className={`h-10 w-10 flex shrink-0 items-center justify-center rounded bg-accent/50`}
                                >
                                  <Image className="size-6 text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium">
                                {product.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3 text-muted-foreground">
                            {product.code}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-muted-foreground">
                            {getCategoryName(product.categoryId)}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-muted-foreground">
                            {product?.costPrice?.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-muted-foreground">
                            {product?.sellingPrice?.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <Badge
                              variant={getStatusBadgeVariant(product.status)}
                            >
                              {t(`settings:services.status.${product.status}`)}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-3 text-muted-foreground">
                            {formatDate(product.createdOn)}
                          </TableCell>
                          {isAdmin ? (
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
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    <Pencil className="me-2 h-4 w-4" />
                                    {t("common:edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleChangeStatus(product)}
                                  >
                                    <Orbit className="me-2 h-4 w-4" />
                                    {t("settings:services.changeStatus")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDuplicateProduct(product)
                                    }
                                  >
                                    <Copy className="me-2 h-4 w-4" />
                                    {t("settings:services.duplicate")}
                                  </DropdownMenuItem>
                                  {product.canDelete && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteProduct(product)
                                      }
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="me-2 h-4 w-4" />
                                      {t("common:delete")}
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          ) : null}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {paging && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3 border-t bg-muted/20">
                <div className="text-muted-foreground py-2">
                  {t("organizations:totalOrganizations", {
                    count: paging.totalItems,
                  })}

                  {paging.totalPages > 1 && (
                    <>
                      {" • "}
                      {t("common:pagination.page")} {paging.pageIndex + 1}{" "}
                      {t("common:pagination.of")}{" "}
                      {paging.totalPages === 0 ? 1 : paging.totalPages}
                    </>
                  )}
                </div>
                {paging.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      title={t("common:previous")}
                      variant="outline"
                      size="icon"
                      onClick={handlePreviousPage}
                      disabled={!paging.hasPrevious}
                    >
                      {isRTL ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronLeft className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex items-center gap-1 px-2 font-medium">
                      {paging.pageIndex + 1}
                    </div>
                    <Button
                      title={t("common:next")}
                      variant="outline"
                      size="icon"
                      onClick={handleNextPage}
                      disabled={!paging.hasNext}
                    >
                      {isRTL ? (
                        <ChevronLeft className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddProductModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={loadProducts}
        categories={categories}
      />

      <EditProductModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={loadProducts}
        productId={selectedProductId}
        categories={categories}
      />

      {selectedProductId && (
        <ChangeStatusModal
          open={changeStatusModalOpen}
          onOpenChange={setChangeStatusModalOpen}
          productId={selectedProductId}
          productName={selectedProductName}
          currentStatus={selectedProductStatus}
          onStatusChanged={handleStatusChanged}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={confirmDialogConfig.title}
        description={confirmDialogConfig.description}
        confirmText={confirmDialogConfig.confirmText}
        variant={confirmDialogConfig.variant}
        isLoading={isConfirming}
        loadingText={confirmDialogConfig.loadingText}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
