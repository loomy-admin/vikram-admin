import React, { useState, useEffect, useCallback } from 'react';
import {
  KeyRound,
  Plus,
  Layers,
  Search,
  Filter,
  Copy,
  Check,
  ArrowRightLeft,
  Power,
  ChevronDown,
  CheckCircle,
} from 'lucide-react';
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
import { ConfirmDialog, TopCenterConfirmModal } from '../../components/common/ConfirmDialog';
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

  // Multi-selection checkboxes state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isBulkDisableModalOpen, setIsBulkDisableModalOpen] = useState(false);
  const [isBulkDisabling, setIsBulkDisabling] = useState(false);

  // Single Actions Dialogs
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
      setSelectedIds([]); // reset selections on page change/fetch
      setIsHeaderMenuOpen(false);
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

  // Checkbox selection logic - Only UNUSED codes can be selected & disabled
  const selectableCodes = codes.filter((c) => c.status === 'UNUSED');
  const allSelectableOnPageSelected =
    selectableCodes.length > 0 && selectableCodes.every((c) => selectedIds.includes(c.id));

  const handleSelectAllOnPage = () => {
    if (allSelectableOnPageSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectableCodes.map((c) => c.id));
    }
  };

  const handleToggleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Disable action
  const handleConfirmBulkDisable = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDisabling(true);
    try {
      await accessCodesApi.bulkUpdateStatus(selectedIds, 'INACTIVE');
      showSuccess(`Successfully disabled ${selectedIds.length} access code(s)`);
      setIsBulkDisableModalOpen(false);
      setSelectedIds([]);
      fetchCodes();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to disable selected access codes'));
    } finally {
      setIsBulkDisabling(false);
    }
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
    <div className="space-y-6 relative">
      {/* Global Top-Center Light Confirmation Popup */}
      <TopCenterConfirmModal
        isOpen={isBulkDisableModalOpen}
        title="Confirm disable access codes"
        message={
          <p className="text-sm text-slate-500 leading-relaxed">
            Once disabled, the <strong className="font-bold text-slate-900">{selectedIds.length} selected access code(s)</strong> will no longer be redeemable for student activation, but their record history will be retained in the database.
          </p>
        }
        confirmText={`Disable ${selectedIds.length} selected code(s)`}
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isBulkDisabling}
        onConfirm={handleConfirmBulkDisable}
        onClose={() => setIsBulkDisableModalOpen(false)}
      />

      {/* Header with Generation Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Access Codes</h2>
          <p className="text-sm text-slate-500">
            Generate, manage, and soft-disable 10-digit access codes for student activation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4 text-red-600" />
            Bulk Generator
          </button>
          <button
            onClick={() => setIsSingleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors"
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
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-mono"
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
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
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
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          >
            <option value="">All Statuses</option>
            <option value="UNUSED">UNUSED</option>
            <option value="USED">USED</option>
            <option value="INACTIVE">INACTIVE (DISABLED)</option>
          </select>
        </div>
      </div>

      {/* Access Codes Table */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
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
                  {/* Selection Checkbox / Selection Header Dropdown */}
                  <th className="px-4 py-3.5 w-12 text-center">
                    {selectedIds.length === 0 ? (
                      <input
                        type="checkbox"
                        checked={allSelectableOnPageSelected}
                        onChange={handleSelectAllOnPage}
                        title="Select all unused codes on page"
                        className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0}
                        onChange={() => setSelectedIds([])}
                        title="Clear selections"
                        className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                      />
                    )}
                  </th>

                  {/* Header Selection Dropdown when 1+ selected */}
                  <th className="px-6 py-3.5" colSpan={selectedIds.length > 0 ? 5 : 1}>
                    {selectedIds.length > 0 ? (
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
                        >
                          <span>{selectedIds.length} code(s) selected...</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        </button>

                        {/* Dropdown Options */}
                        {isHeaderMenuOpen && (
                          <div className="origin-top-left absolute left-0 mt-1.5 w-48 rounded-xl bg-white text-slate-800 shadow-lg border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              type="button"
                              onClick={() => {
                                setIsHeaderMenuOpen(false);
                                setIsBulkDisableModalOpen(true);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Power className="w-3.5 h-3.5 text-rose-600" />
                              Remove Access
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      'Access Code'
                    )}
                  </th>

                  {selectedIds.length === 0 && (
                    <>
                      <th className="px-6 py-3.5">Assigned School</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Redeemed By (Student Name)</th>
                      <th className="px-6 py-3.5">Created Date</th>
                    </>
                  )}

                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {codes.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  const isSelectable = item.status === 'UNUSED';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isChecked ? 'bg-red-50/40' : ''
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          disabled={!isSelectable}
                          checked={isChecked}
                          onChange={() => handleToggleSelectRow(item.id)}
                          className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

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
                            <>
                              <button
                                onClick={() => setCodeToReassign(item)}
                                title="Reassign School"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setCodeToToggle(item)}
                                title="Disable Access Code"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Power className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {item.status === 'INACTIVE' && (
                            <button
                              onClick={() => setCodeToToggle(item)}
                              title="Reactivate Access Code"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
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

      {/* Single Code Toggle Status Dialog */}
      <ConfirmDialog
        isOpen={!!codeToToggle}
        title={codeToToggle?.status === 'UNUSED' ? 'Disable Access Code' : 'Reactivate Code'}
        message={
          codeToToggle?.status === 'UNUSED'
            ? `Are you sure you want to disable code ${codeToToggle?.code}? It will not be usable for student activation, but its record history will be retained.`
            : `Are you sure you want to reactivate code ${codeToToggle?.code}?`
        }
        confirmText={codeToToggle?.status === 'UNUSED' ? 'Disable Access' : 'Reactivate'}
        confirmVariant={codeToToggle?.status === 'UNUSED' ? 'danger' : 'primary'}
        isLoading={isToggling}
        onConfirm={handleToggleCodeStatus}
        onClose={() => setCodeToToggle(null)}
      />
    </div>
  );
};
