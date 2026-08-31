import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Phone, Mail, Building2, BookOpen, KeyRound, Calendar, Power, CheckCircle } from 'lucide-react';
import { Student, StudentStatus } from '../../types';
import { studentsApi } from '../../api/studentsApi';
import { StatusChip } from '../../components/common/StatusChip';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/axios';

interface StudentDetailsPageProps {
  studentId: number;
  onBack: () => void;
  onNavigate: (path: string) => void;
}

export const StudentDetailsPage: React.FC<StudentDetailsPageProps> = ({
  studentId,
  onBack,
  onNavigate,
}) => {
  const { showSuccess, showError } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusDialogTarget, setStatusDialogTarget] = useState<StudentStatus | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchStudent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await studentsApi.getStudentById(studentId);
      setStudent(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load student details'));
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  const handleUpdateStatus = async () => {
    if (!statusDialogTarget || !student) return;
    setIsUpdatingStatus(true);
    try {
      await studentsApi.updateStatus(student.id, statusDialogTarget);
      showSuccess(`Student status updated to ${statusDialogTarget}`);
      setStatusDialogTarget(null);
      fetchStudent();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to change student status'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading && !student) {
    return <TableSkeleton rows={4} cols={3} />;
  }

  if (error || !student) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </button>
        <ErrorAlert message={error || 'Student not found'} onRetry={fetchStudent} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Back to students list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
              <StatusChip status={student.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 font-mono">Student ID: #{student.id}</p>
          </div>
        </div>

        {/* Status Control Actions */}
        <div className="flex items-center gap-2">
          {student.status !== 'ACTIVE' && (
            <button
              onClick={() => setStatusDialogTarget('ACTIVE')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Activate Account
            </button>
          )}

          {student.status === 'ACTIVE' && (
            <button
              onClick={() => setStatusDialogTarget('INACTIVE')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors shadow-xs"
            >
              <Power className="w-3.5 h-3.5" />
              Deactivate Account
            </button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-600 text-white flex items-center justify-center text-xl font-bold uppercase shadow-sm">
              {student.name ? student.name.slice(0, 2) : 'ST'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{student.name}</h3>
              <p className="text-xs text-slate-500 font-mono">#{student.id}</p>
              <div className="mt-1.5">
                <StatusChip status={student.status} size="sm" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
              </span>
              <span className="font-semibold text-slate-800">{student.phone || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
              </span>
              <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                {student.email || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Registered
              </span>
              <span className="text-xs text-slate-700">
                {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Affiliation */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              School & Curriculum Affiliation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* School Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Assigned School
                </div>
                {student.school ? (
                  <div>
                    <p className="text-base font-bold text-slate-900">{student.school.name}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      Code: {student.school.schoolCode}
                    </p>
                    <button
                      onClick={() => onNavigate(`/schools/${student.schoolId}`)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold mt-2 inline-block"
                    >
                      View School Profile →
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No school assigned</p>
                )}
              </div>

              {/* Class Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Enrolled Class
                </div>
                {student.class ? (
                  <div>
                    <p className="text-base font-bold text-slate-900">{student.class.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Grade Level: {student.class.grade}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No class assigned</p>
                )}
              </div>

              {/* Access Code Box */}
              <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                  <KeyRound className="w-4 h-4 text-violet-600" />
                  Redeemed Access Code
                </div>
                {student.accessCode ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-lg font-bold text-slate-900 px-3 py-1 bg-white border border-slate-200 rounded-lg select-all">
                        {student.accessCode.code}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Redeemed on {student.accessCode.usedAt ? new Date(student.accessCode.usedAt).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No access code record</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Status Dialog */}
      <ConfirmDialog
        isOpen={!!statusDialogTarget}
        title={`Set Student Status to ${statusDialogTarget}`}
        message={`Are you sure you want to update ${student.name}'s status to ${statusDialogTarget}?`}
        confirmText={`Confirm ${statusDialogTarget}`}
        confirmVariant={statusDialogTarget === 'ACTIVE' ? 'primary' : 'danger'}
        isLoading={isUpdatingStatus}
        onConfirm={handleUpdateStatus}
        onClose={() => setStatusDialogTarget(null)}
      />
    </div>
  );
};
