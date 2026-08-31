import React, { useState, useEffect, useCallback } from 'react';
import { KeyRound, Plus, Layers, Search, Filter, Copy, Check, ArrowRightLeft, Power } from 'lucide-react';
import { AccessCode, School, AccessCodeStatus } from '../../types';
import { accessCodesApi } from '../../api/accessCodesApi';
import { schoolsApi } from '../../api/schoolsApi';
import { StatusChip } from '../../components/common/StatusChip';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Pagination } from '../../components/common/Pagination';
import { GenerateCodeDialog } from '../../components/forms/GenerateCodeDialog';
import { BulkCodeDialog } from '../../components/forms/BulkCodeDialog';
import { ReassignCodeDialog } from '../../components/forms/ReassignCodeDialog';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { getErrorMessage } from '../../api/axios';

export const AccessCodesPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(15);

  const [search, setSearch] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [isSingleOpen, setIsSingleOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [codeToReassign, setCodeToReassign] = useState<AccessCode | null>(null);
  const [isReassigning, setIsReassigning] = useState(false);

  const [codeToToggle, setCodeToToggle] = useState<AccessCode | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // Copied state
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 350);

  // Load schools for dropdown
  useEffect(() => {
    async function loadSchools() {
      try {
        const res = await schoolsApi.getSchools({ limit: 100 });
        setSchools(res.items);
      } catch {
        // Ignored
      }
    }
    loadSchools();
  }, []);

  const fetchCodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await accessCodesApi.getCodes({
        page,
        limit,
        search: debouncedSearch || undefined,
        schoolId: selectedSchoolId ? Number(selectedSchoolId) : undefined,
        status: statusFilter ? (statusFilter as AccessCodeStatus) : undefined,
      });
      setCodes(res.items);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.total ?? 0);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load access codes'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedSchoolId, statusFilter]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleCopyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReassignSubmit = async (newSchoolId: number) => {
    if (!codeToReassign) return;
    setIsReassigning(true);
    try {
      await accessCodesApi.reassignCode(codeToReassign.id, newSchoolId);
      showSuccess(`Access code reassigned successfully`);
      setCodeToReassign(null);
      fetchCodes();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to reassign access code'));
    } finally {
      setIsReassigning(false);
    }
  };

  const handleToggleCodeStatus = async () => {
    if (!codeToToggle) return;
    setIsToggling(true);
    const newStatus: AccessCodeStatus = codeToToggle.status === 'INACTIVE' ? 'UNUSED' : 'INACTIVE';
    try {
      await accessCodesApi.updateStatus(codeToToggle.id, newStatus);
      showSuccess(`Access code status updated to ${newStatus}`);
      setCodeToToggle(null);
      fetchCodes();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to update access code status'));
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Generation Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Access Codes</h2>
          <p className="text-sm text-slate-500">
            Generate and manage 10-digit access codes for student activation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            Bulk Generator
          </button>
          <button
            onClick={() => setIsSingleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Single Code
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchCodes} />}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search 10-digit code..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
          />
        </div>

        {/* School Dropdown */}
        <div>
          <select
            value={selectedSchoolId}
            onChange={(e) => {
              setSelectedSchoolId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Schools</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.schoolCode})
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="UNUSED">UNUSED</option>
            <option value="USED">USED</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Access Codes Table */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : codes.length === 0 ? (
        <EmptyState
          title="No Access Codes Found"
          description={
            search || selectedSchoolId || statusFilter
              ? 'No access codes match your filter criteria.'
              : 'Generate single or bulk access codes for student activation.'
          }
          icon={KeyRound}
          actionText={search || selectedSchoolId || statusFilter ? undefined : 'Generate Code'}
          onAction={() => setIsSingleOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Access Code</th>
                  <th className="px-6 py-3.5">Assigned School</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Redeemed By (Student Name)</th>
                  {/* <th className="px-6 py-3.5">Student Name</th> */}
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {codes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 select-all">
                          {item.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(item.id, item.code)}
                          title="Copy Code"
                          className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-3.5 text-xs">
                      {item.school ? (
                        <div>
                          <p className="font-semibold text-slate-800">{item.school.name}</p>
                          <span className="font-mono text-[11px] text-slate-400">
                            {item.school.schoolCode}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No school</span>
                      )}
                    </td>

                    <td className="px-6 py-3.5">
                      <StatusChip status={item.status} size="sm" />
                    </td>

                    <td className="px-6 py-3.5 text-xs">
                      {item.student ? (
                        <div>
                          <span className="font-semibold text-slate-900">{item.student.name}</span>
                          <p className="text-[11px] text-slate-400">ID: #{item.student.id}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'UNUSED' && (
                          <button
                            onClick={() => setCodeToReassign(item)}
                            title="Reassign School"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                        )}

                        {item.status !== 'USED' && (
                          <button
                            onClick={() => setCodeToToggle(item)}
                            title={item.status === 'UNUSED' ? 'Deactivate Code' : 'Activate Code'}
                            className={`p-1.5 rounded-lg transition-colors ${item.status === 'UNUSED'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Single Code Dialog */}
      <GenerateCodeDialog
        isOpen={isSingleOpen}
        onClose={() => setIsSingleOpen(false)}
        onSuccess={fetchCodes}
      />

      {/* Bulk Codes Dialog */}
      <BulkCodeDialog
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onSuccess={fetchCodes}
      />

      {/* Reassign Dialog */}
      <ReassignCodeDialog
        isOpen={!!codeToReassign}
        accessCode={codeToReassign}
        onClose={() => setCodeToReassign(null)}
        onSubmit={handleReassignSubmit}
        isLoading={isReassigning}
      />

      {/* Toggle Status Dialog */}
      <ConfirmDialog
        isOpen={!!codeToToggle}
        title={codeToToggle?.status === 'UNUSED' ? 'Deactivate Code' : 'Reactivate Code'}
        message={
          codeToToggle?.status === 'UNUSED'
            ? `Are you sure you want to deactivate code ${codeToToggle?.code}? It will not be redeemable until reactivated.`
            : `Are you sure you want to reactivate code ${codeToToggle?.code}?`
        }
        confirmText={codeToToggle?.status === 'UNUSED' ? 'Deactivate' : 'Reactivate'}
        confirmVariant={codeToToggle?.status === 'UNUSED' ? 'danger' : 'primary'}
        isLoading={isToggling}
        onConfirm={handleToggleCodeStatus}
        onClose={() => setCodeToToggle(null)}
      />
    </div>
  );
};
