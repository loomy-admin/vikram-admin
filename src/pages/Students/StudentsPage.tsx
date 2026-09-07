import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Eye, Power, CheckCircle, KeyRound, FilterX, Clock } from 'lucide-react';
import { Student, School, ClassItem, StudentStatus } from '../../types';
import { studentsApi } from '../../api/studentsApi';
import { schoolsApi } from '../../api/schoolsApi';
import { contentApi } from '../../api/contentApi';
import { StatusChip } from '../../components/common/StatusChip';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { getErrorMessage } from '../../api/axios';

interface StudentsPageProps {
  onNavigate: (path: string) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({ onNavigate }) => {
  const { showSuccess, showError } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);

  // Filters
  const [nameFilter, setNameFilter] = useState('');
  const [accessCodeFilter, setAccessCodeFilter] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Action Dialog
  const [targetStudent, setTargetStudent] = useState<Student | null>(null);
  const [newStatusAction, setNewStatusAction] = useState<StudentStatus>('ACTIVE');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const debouncedName = useDebounce(nameFilter, 300);
  const debouncedAccessCode = useDebounce(accessCodeFilter, 300);

  // Load filter dependencies (schools & classes)
  useEffect(() => {
    async function loadFilters() {
      try {
        const [schoolsRes, classesRes] = await Promise.all([
          schoolsApi.getSchools({ limit: 100 }),
          contentApi.getClasses(),
        ]);
        setSchools(schoolsRes.items);
        setClasses(classesRes);
      } catch {
        // Ignored
      }
    }
    loadFilters();
  }, []);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await studentsApi.getStudents({
        page,
        limit,
        name: debouncedName || undefined,
        accessCode: debouncedAccessCode || undefined,
        schoolId: selectedSchoolId ? Number(selectedSchoolId) : undefined,
        classId: selectedClassId ? Number(selectedClassId) : undefined,
        status: statusFilter ? (statusFilter as StudentStatus) : undefined,
      });
      setStudents(res.items);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.total ?? 0);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load students'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedName, debouncedAccessCode, selectedSchoolId, selectedClassId, statusFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleResetFilters = () => {
    setNameFilter('');
    setAccessCodeFilter('');
    setSelectedSchoolId('');
    setSelectedClassId('');
    setStatusFilter('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    nameFilter || accessCodeFilter || selectedSchoolId || selectedClassId || statusFilter
  );

  const handleUpdateStatus = async () => {
    if (!targetStudent) return;
    setIsUpdatingStatus(true);
    try {
      await studentsApi.updateStatus(targetStudent.id, newStatusAction);
      showSuccess(`Student status changed to ${newStatusAction}`);
      setTargetStudent(null);
      fetchStudents();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to update student status'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const openStatusChange = (student: Student, targetStatus: StudentStatus) => {
    setTargetStudent(student);
    setNewStatusAction(targetStatus);
  };

  const formatLastActivity = (dateStr?: string | null) => {
    if (!dateStr) return <span className="text-slate-400 italic text-xs">Never logged in</span>;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return <span className="text-slate-400 italic text-xs">Never logged in</span>;
    return (
      <div className="flex flex-col">
        <span className="font-semibold text-slate-800 text-xs">
          {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <span className="text-[11px] text-slate-500 font-mono">
          {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Students Registry</h2>
          <p className="text-sm text-slate-500">
            View registered learners, school affiliations, access codes, and activity timestamps
          </p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchStudents} />}

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            Filter Students
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-semibold"
            >
              <FilterX className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* 1. Student Name Filter */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => {
                setNameFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by Student Name..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* 2. School Filter */}
          <div>
            <select
              value={selectedSchoolId}
              onChange={(e) => {
                setSelectedSchoolId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="">Filter by School (All)</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.schoolCode})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Activation Code Filter */}
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={accessCodeFilter}
              onChange={(e) => {
                setAccessCodeFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by Code..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* 4. Class Dropdown */}
          <div>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="">Filter by Class (All)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Grade {c.grade})
                </option>
              ))}
            </select>
          </div>

          {/* 5. Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="">Filter by Status (All)</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : students.length === 0 ? (
        <EmptyState
          title="No Students Found"
          description={
            hasActiveFilters
              ? 'No student accounts match the filter criteria. Try adjusting your filters.'
              : 'Students will appear here once they redeem their school access codes and register.'
          }
          icon={Users}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Phone / Email</th>
                  <th className="px-6 py-3.5">School & Class</th>
                  <th className="px-6 py-3.5">Activation Code</th>
                  <th className="px-6 py-3.5">Last Login / Activity</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((student) => {
                  const codeStr = student.assignedAccessCode || student.accessCode?.code;
                  const lastActiveTime = student.lastLoginAt || student.lastLogin;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Student Name & ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-red-200">
                            {student.name ? student.name.slice(0, 2) : 'ST'}
                          </div>
                          <div>
                            <button
                              onClick={() => onNavigate(`/students/${student.id}`)}
                              className="font-bold text-slate-900 hover:text-red-600 transition-colors text-left"
                            >
                              {student.name}
                            </button>
                            <span className="block text-xs text-slate-400 font-mono">
                              ID: #{student.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Phone / Email */}
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <p className="font-medium text-slate-800">{student.phone || 'No phone'}</p>
                        {student.email && <p className="text-slate-400 mt-0.5">{student.email}</p>}
                      </td>

                      {/* 3. School & Class */}
                      <td className="px-6 py-4 text-xs">
                        {student.school ? (
                          <div>
                            <p className="font-semibold text-slate-800">{student.school.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[11px] text-slate-400">
                                {student.school.schoolCode}
                              </span>
                              {student.class && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded border border-slate-200">
                                  {student.class.name}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* 4. Activation Code */}
                      <td className="px-6 py-4 text-xs">
                        {codeStr ? (
                          <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-md border border-violet-200 inline-block">
                            {codeStr}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No code record</span>
                        )}
                      </td>

                      {/* 5. Last Login / Activity Time */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {formatLastActivity(lastActiveTime)}
                        </div>
                      </td>

                      {/* 6. Status Chip */}
                      <td className="px-6 py-4">
                        <StatusChip status={student.status} />
                      </td>

                      {/* 7. Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onNavigate(`/students/${student.id}`)}
                            title="View Student Profile & Activity"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {student.status === 'ACTIVE' ? (
                            <button
                              onClick={() => openStatusChange(student, 'INACTIVE')}
                              title="Deactivate Student"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openStatusChange(student, 'ACTIVE')}
                              title="Activate Student"
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

      {/* Confirm Status Change Dialog */}
      <ConfirmDialog
        isOpen={!!targetStudent}
        title={`Change Student Status to ${newStatusAction}`}
        message={`Are you sure you want to change the status of student "${targetStudent?.name}" to ${newStatusAction}?`}
        confirmText={`Set to ${newStatusAction}`}
        confirmVariant={newStatusAction === 'ACTIVE' ? 'primary' : 'danger'}
        isLoading={isUpdatingStatus}
        onConfirm={handleUpdateStatus}
        onClose={() => setTargetStudent(null)}
      />
    </div>
  );
};
