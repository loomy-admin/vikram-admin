import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Search, Filter, Edit2, Eye, Power, Phone, Mail } from 'lucide-react';
import { School, CreateSchoolPayload, UpdateSchoolPayload, SchoolStatus } from '../../types';
import { schoolsApi } from '../../api/schoolsApi';
import { StatusChip } from '../../components/common/StatusChip';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Pagination } from '../../components/common/Pagination';
import { SchoolFormDialog } from '../../components/forms/SchoolFormDialog';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { getErrorMessage } from '../../api/axios';

interface SchoolsPageProps {
  onNavigate: (path: string) => void;
}

export const SchoolsPage: React.FC<SchoolsPageProps> = ({ onNavigate }) => {
  const { showSuccess, showError } = useToast();

  const [schools, setSchools] = useState<School[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [schoolToEdit, setSchoolToEdit] = useState<School | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState<School | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  const fetchSchools = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await schoolsApi.getSchools({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter ? (statusFilter as SchoolStatus) : undefined,
      });
      setSchools(res.items);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.total ?? 0);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load schools list'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const handleCreateOrUpdate = async (data: CreateSchoolPayload | UpdateSchoolPayload) => {
    setIsSubmitting(true);
    try {
      if (schoolToEdit) {
        await schoolsApi.updateSchool(schoolToEdit.id, data as UpdateSchoolPayload);
        showSuccess('School updated successfully');
      } else {
        await schoolsApi.createSchool(data as CreateSchoolPayload);
        showSuccess('School created successfully');
      }
      setIsFormOpen(false);
      setSchoolToEdit(null);
      fetchSchools();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save school'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmTarget) return;
    setIsConfirming(true);
    const newStatus: SchoolStatus = confirmTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await schoolsApi.updateSchool(confirmTarget.id, { status: newStatus });
      showSuccess(`School status updated to ${newStatus}`);
      setConfirmTarget(null);
      fetchSchools();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to update school status'));
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add School Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Schools Management</h2>
          <p className="text-sm text-slate-500">
            Create, monitor, and configure partner schools and access allocations
          </p>
        </div>

        <button
          onClick={() => {
            setSchoolToEdit(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New School
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchSchools} />}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search school name or code..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Schools Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : schools.length === 0 ? (
        <EmptyState
          title="No Schools Found"
          description={
            search || statusFilter
              ? 'No schools matched your search criteria. Try clearing filters.'
              : 'Start by creating your first partner school in the system.'
          }
          icon={Building2}
          actionText={search || statusFilter ? undefined : 'Add First School'}
          onAction={() => {
            setSchoolToEdit(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">School Name & Code</th>
                  <th className="px-6 py-3.5">Contact Info</th>
                  <th className="px-6 py-3.5 text-center">Students</th>
                  <th className="px-6 py-3.5 text-center">Access Codes</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {schools.map((school) => {
                  const studentCount = school._count?.students ?? school.studentsCount ?? 0;
                  const totalCodes = school._count?.accessCodes ?? school.totalCodes ?? 0;
                  const usedCodes = school.usedCodes ?? 0;

                  return (
                    <tr key={school.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <button
                              onClick={() => onNavigate(`/schools/${school.id}`)}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left"
                            >
                              {school.name}
                            </button>
                            <div className="mt-0.5">
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {school.schoolCode}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs text-slate-600">
                          {school.contactPerson && (
                            <p className="font-medium text-slate-800">{school.contactPerson}</p>
                          )}
                          {school.phone && (
                            <p className="flex items-center gap-1 text-slate-500">
                              <Phone className="w-3 h-3" />
                              {school.phone}
                            </p>
                          )}
                          {school.email && (
                            <p className="flex items-center gap-1 text-slate-500">
                              <Mail className="w-3 h-3" />
                              {school.email}
                            </p>
                          )}
                          {!school.contactPerson && !school.phone && !school.email && (
                            <span className="text-slate-400 italic">No contact specified</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                          {studentCount}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="text-xs">
                          <span className="font-bold text-emerald-600">{usedCodes}</span>
                          <span className="text-slate-400"> / </span>
                          <span className="font-semibold text-slate-700">{totalCodes}</span>
                          <p className="text-[11px] text-slate-400 mt-0.5">Used / Total</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusChip status={school.status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onNavigate(`/schools/${school.id}`)}
                            title="View School Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSchoolToEdit(school);
                              setIsFormOpen(true);
                            }}
                            title="Edit School"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmTarget(school)}
                            title={school.status === 'ACTIVE' ? 'Deactivate School' : 'Activate School'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              school.status === 'ACTIVE'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
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

      {/* School Create / Edit Dialog */}
      <SchoolFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSchoolToEdit(null);
        }}
        onSubmit={handleCreateOrUpdate}
        schoolToEdit={schoolToEdit}
        isLoading={isSubmitting}
      />

      {/* Confirm Deactivation / Activation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmTarget}
        title={confirmTarget?.status === 'ACTIVE' ? 'Deactivate School' : 'Activate School'}
        message={
          confirmTarget?.status === 'ACTIVE'
            ? `Are you sure you want to deactivate "${confirmTarget?.name}"? Students belonging to this school won't be able to register new accounts with unused codes until re-activated.`
            : `Are you sure you want to activate "${confirmTarget?.name}"?`
        }
        confirmText={confirmTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        confirmVariant={confirmTarget?.status === 'ACTIVE' ? 'danger' : 'primary'}
        isLoading={isConfirming}
        onConfirm={handleToggleStatus}
        onClose={() => setConfirmTarget(null)}
      />
    </div>
  );
};
