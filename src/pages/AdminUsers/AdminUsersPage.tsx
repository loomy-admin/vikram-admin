import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Plus, Search, Edit2, Trash2, Power } from 'lucide-react';
import { AdminUser, CreateAdminUserPayload, UpdateAdminUserPayload, AdminStatus } from '../../types';
import { adminUsersApi } from '../../api/adminUsersApi';
import { StatusChip } from '../../components/common/StatusChip';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Pagination } from '../../components/common/Pagination';
import { AdminUserFormDialog } from '../../components/forms/AdminUserFormDialog';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { getErrorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export const AdminUsersPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminUsersApi.getUsers({
        page,
        limit,
        search: debouncedSearch || undefined,
      });
      setUsers(res.items);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.total ?? 0);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load administrator accounts'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSaveUser = async (data: CreateAdminUserPayload | UpdateAdminUserPayload) => {
    setIsSubmitting(true);
    try {
      if (userToEdit) {
        await adminUsersApi.updateUser(userToEdit.id, data as UpdateAdminUserPayload);
        showSuccess('Administrator profile updated');
      } else {
        await adminUsersApi.createUser(data as CreateAdminUserPayload);
        showSuccess('New administrator created');
      }
      setIsFormOpen(false);
      setUserToEdit(null);
      fetchUsers();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save admin user'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminUsersApi.deleteUser(deleteTarget.id);
      showSuccess(`Admin user "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to delete admin user'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    setIsTogglingStatus(true);
    const newStatus: AdminStatus = statusTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminUsersApi.updateUser(statusTarget.id, { status: newStatus });
      showSuccess(`Admin user status updated to ${newStatus}`);
      setStatusTarget(null);
      fetchUsers();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to update admin status'));
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Administrator Accounts</h2>
          <p className="text-sm text-slate-500">
            Manage administrative credentials and role access privileges
          </p>
        </div>

        <button
          onClick={() => {
            setUserToEdit(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Administrator
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchUsers} />}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search admin name or email..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : users.length === 0 ? (
        <EmptyState
          title="No Administrators Found"
          description={
            search
              ? 'No admin users matched your search criteria.'
              : 'Add an administrator account to grant team access.'
          }
          icon={ShieldCheck}
          actionText={search ? undefined : 'Add Administrator'}
          onAction={() => {
            setUserToEdit(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Administrator</th>
                  <th className="px-6 py-3.5">Email Address</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((u) => {
                  const isSelf = currentAdmin?.id === u.id || currentAdmin?.email === u.email;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-blue-200">
                            {u.name ? u.name.slice(0, 2) : 'AD'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-2">
                              {u.name}
                              {isSelf && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                                  YOU
                                </span>
                              )}
                            </p>
                            <span className="text-xs text-slate-400 font-mono">ID: #{u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-slate-700">{u.email}</td>

                      <td className="px-6 py-4">
                        <StatusChip status={u.status} />
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setUserToEdit(u);
                              setIsFormOpen(true);
                            }}
                            title="Edit Admin"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {!isSelf && (
                            <>
                              <button
                                onClick={() => setStatusTarget(u)}
                                title={u.status === 'ACTIVE' ? 'Deactivate Admin' : 'Activate Admin'}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  u.status === 'ACTIVE'
                                    ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                <Power className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeleteTarget(u)}
                                title="Delete Admin"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Admin User Form Dialog */}
      <AdminUserFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setUserToEdit(null);
        }}
        onSubmit={handleSaveUser}
        userToEdit={userToEdit}
        isLoading={isSubmitting}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Administrator"
        message={`Are you sure you want to permanently delete admin account "${deleteTarget?.name}"?`}
        confirmText="Delete Account"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteUser}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Confirm Status Dialog */}
      <ConfirmDialog
        isOpen={!!statusTarget}
        title={statusTarget?.status === 'ACTIVE' ? 'Deactivate Admin' : 'Activate Admin'}
        message={`Are you sure you want to ${
          statusTarget?.status === 'ACTIVE' ? 'deactivate' : 'activate'
        } administrator "${statusTarget?.name}"?`}
        confirmText={statusTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        confirmVariant={statusTarget?.status === 'ACTIVE' ? 'danger' : 'primary'}
        isLoading={isTogglingStatus}
        onConfirm={handleToggleStatus}
        onClose={() => setStatusTarget(null)}
      />
    </div>
  );
};
