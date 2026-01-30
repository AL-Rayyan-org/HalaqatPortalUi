import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/shared/hooks/useI18n";
import { useIsAdmin } from "@/shared/hooks/useAdmin";
import { useProfile } from "@/shared/stores/profileStore";
import { showToast } from "@/shared/components/ui/toast-config";
import { formatDate } from "@/shared/utils/formatDate";
import getInitials from "@/shared/utils/getInitials";
import {
  getRoleTranslationKey,
  ROLE_KEYS,
  isOwnerRole,
} from "@/shared/utils/roles";
import {
  getSystemUsers,
  deleteSystemUser,
} from "@/features/settings/Admin/api/usersApi";
import { AddUserModal } from "@/features/settings/Admin/users/components/AddUserModal";
import { ChangeRoleModal } from "@/features/settings/Admin/users/components/ChangeRoleModal";
// Import the new dialog
import { ChangePasswordDialog } from "@/features/settings/Admin/users/components/ChangePasswordModal";
import type { SystemUser } from "@/features/settings/Admin/types";
import type { InvitableRole } from "@/shared/types/api";
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
  Badge,
  ConfirmDialog,
  Skeleton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui";
import {
  MoreVertical,
  Trash2,
  Shield,
  Users,
  LockKeyholeOpenIcon,
} from "lucide-react";
import { getAvatarColorByRole } from "@/shared/utils/getAvatarColorByRole";

export default function UsersPage() {
  const { t } = useI18n();
  const { isAdmin } = useIsAdmin();
  const profile = useProfile();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false); // Added state

  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  // Confirmation dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    (() => Promise<void>) | null
  >(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await getSystemUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(true);
        showToast.error(
          response.message || t("settings:errors.failedToLoadUsers")
        );
      }
    } catch {
      setError(true);
      showToast.error(t("settings:errors.failedToLoadUsers"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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

  const handleDeleteUser = async (user: SystemUser) => {
    if (user.role.toLowerCase() === ROLE_KEYS.OWNER.toLowerCase()) {
      showToast.error(t("settings:errors.cannotDeleteOwner"));
      return;
    }

    // Set selected user for the confirmation message
    setSelectedUser(user);

    showConfirmDialog(async () => {
      try {
        const response = await deleteSystemUser(user.userId);
        if (response.success) {
          showToast.success(t("settings:messages.userDeletedSuccessfully"));
          loadUsers();
        } else {
          showToast.error(
            response.message || t("settings:errors.failedToDeleteUser")
          );
        }
      } catch {
        showToast.error(t("settings:errors.failedToDeleteUser"));
      }
    });
  };

  const handleChangeRole = (user: SystemUser) => {
    if (user.role.toLowerCase() === ROLE_KEYS.OWNER.toLowerCase()) {
      showToast.error(t("settings:errors.cannotChangeOwnerRole"));
      return;
    }
    setSelectedUser(user);
    setChangeRoleModalOpen(true);
  };

  // Added handler for Change Password
  const handleChangePassword = (user: SystemUser) => {
    setSelectedUser(user);
    setChangePasswordModalOpen(true);
  };

  const handleRoleChanged = (userId: string, newRole: InvitableRole) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.userId === userId ? { ...user, role: newRole } : user
      )
    );
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("settings:users.title")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("settings:users.description")}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setAddModalOpen(true)}>
            {t("settings:actions.newMember")}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-6">
        {error ? (
          <DataError
            title={t("settings:errors.couldntLoadData")}
            message={t("settings:errors.failedToLoadUsers")}
            retryText={t("common:retry")}
            onRetry={loadUsers}
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
                      {t("common:username")}
                    </TableHead>
                    <TableHead className="px-6 py-4 font-medium">
                      {t("common:email")}
                    </TableHead>
                    <TableHead className="px-6 py-4 font-medium">
                      {t("common:role")}
                    </TableHead>
                    <TableHead className="px-6 py-4 font-medium">
                      {t("common:joinDate")}
                    </TableHead>
                    {isAdmin && (
                      <TableHead className="px-6 py-4 font-medium text-center">
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
                          <Skeleton className="h-4 w-[180px]" />
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <Skeleton className="h-6 w-[80px]" />
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="px-6 py-5 text-center">
                            <Skeleton className="h-8 w-8 mx-auto" />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isAdmin ? 6 : 5}
                        className="px-6 py-12 text-center"
                      >
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Users className="h-12 w-12 mb-4 opacity-50" />
                          <p>
                            {t("settings:users.noUsersFound")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const initials = getInitials(user.name, 1);
                      return (
                        <TableRow
                          key={user.userId}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="ps-6 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                className={`h-9 w-9 flex items-center justify-center ${getAvatarColorByRole(
                                  user.role
                                )}`}
                              >
                                {initials}
                              </Avatar>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            {user.username}
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            {user.email}
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <Badge variant="secondary" className="text-sm">
                              {t(getRoleTranslationKey(user.role))}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-3 text-nowrap text-muted-foreground">
                            {formatDate(user.joinedOn)}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="px-6 py-3 text-center">
                              {!isOwnerRole(user.role) &&
                              user.userId !== profile?.userId ? (
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
                                    {isOwnerRole(profile?.role) && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleChangePassword(user)
                                        }
                                      >
                                        <LockKeyholeOpenIcon className="me-2 h-4 w-4" />
                                        {t("settings:actions.changePassword")}
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => handleChangeRole(user)}
                                    >
                                      <Shield className="me-2 h-4 w-4" />
                                      {t("settings:actions.changeRole")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteUser(user)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="me-2 h-4 w-4" />
                                      {t("common:delete")}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : null}
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
      <AddUserModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onUserAdded={loadUsers}
      />

      {selectedUser && (
        <>
          <ChangeRoleModal
            open={changeRoleModalOpen}
            onOpenChange={setChangeRoleModalOpen}
            userId={selectedUser.userId}
            userName={selectedUser.name}
            currentRole={selectedUser.role}
            onRoleChanged={handleRoleChanged}
          />

          {/* Added Change Password Dialog */}
          <ChangePasswordDialog
            open={changePasswordModalOpen}
            onOpenChange={setChangePasswordModalOpen}
            userId={selectedUser.userId}
            userName={selectedUser.name}
          />
        </>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={t("common:confirm")}
        description={t("settings:confirmations.deleteUser", {
          name: selectedUser?.name || "",
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
