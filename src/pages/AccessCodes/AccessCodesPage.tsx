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
  X,
  AlertTriangle,
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

  // Checkbox selection logic
  const selectableCodes = codes.filter((c) => c.status !== 'USED');
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
      {/* Top-Center Confirmation Popup (Styled after Github Collaborators UI) */}
      {isBulkDisableModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-start justify-center pt-16 px-4">
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                Confirm disable access codes
              </h3>
              <button
                onClick={() => setIsBulkDisableModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Once disabled, the <strong className="text-white">{selectedIds.length} selected access code(s)</strong> will no longer be redeemable for student activation, but their record history will be retained in the database.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDisableModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkDisabling}
                onClick={handleConfirmBulkDisable}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
              >
                {isBulkDisabling ? 'Disabling Codes...' : `Disable ${selectedIds.length} selected code(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

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
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0}
                        onChange={() => setSelectedIds([])}
                        title="Clear selections"
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
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
                          <div className="origin-top-left absolute left-0 mt-1.5 w-48 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              type="button"
                              onClick={() => {
                                setIsHeaderMenuOpen(false);
                                setIsBulkDisableModalOpen(true);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-slate-800 hover:text-rose-300 transition-colors flex items-center gap-2"
                            >
                              <Power className="w-3.5 h-3.5 text-rose-500" />
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
                  const isSelectable = item.status !== 'USED';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isChecked ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          disabled={!isSelectable}
                          checked={isChecked}
                          onChange={() => handleToggleSelectRow(item.id)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 disabled:opacity-40 cursor-pointer"
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
                              title={item.status === 'UNUSED' ? 'Disable Code' : 'Reactivate Code'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                item.status === 'UNUSED'
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
