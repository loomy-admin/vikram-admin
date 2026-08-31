import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Phone, Mail, MapPin, Users, KeyRound, Plus, Edit2 } from 'lucide-react';
import { School, Student, AccessCode } from '../../types';
import { schoolsApi } from '../../api/schoolsApi';
import { studentsApi } from '../../api/studentsApi';
import { accessCodesApi } from '../../api/accessCodesApi';
import { StatusChip } from '../../components/common/StatusChip';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Pagination } from '../../components/common/Pagination';
import { SchoolFormDialog } from '../../components/forms/SchoolFormDialog';
import { GenerateCodeDialog } from '../../components/forms/GenerateCodeDialog';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/axios';

interface SchoolDetailsPageProps {
  schoolId: number;
  onBack: () => void;
  onNavigate: (path: string) => void;
}

export const SchoolDetailsPage: React.FC<SchoolDetailsPageProps> = ({
  schoolId,
  onBack,
  onNavigate,
}) => {
  const { showSuccess, showError } = useToast();

  const [school, setSchool] = useState<School | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'codes'>('students');

  // Students list
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsTotalPages, setStudentsTotalPages] = useState(1);
  const [studentsTotal, setStudentsTotal] = useState(0);

  // Access Codes list
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [codesPage, setCodesPage] = useState(1);
  const [codesTotalPages, setCodesTotalPages] = useState(1);
  const [codesTotal, setCodesTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSchoolDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await schoolsApi.getSchoolById(schoolId);
      setSchool(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load school details'));
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await studentsApi.getStudents({
        schoolId,
        page: studentsPage,
        limit: 10,
      });
      setStudents(res.items);
      setStudentsTotalPages(res.totalPages ?? 1);
      setStudentsTotal(res.total ?? 0);
    } catch {
      // Ignored
    }
  }, [schoolId, studentsPage]);

  const fetchCodes = useCallback(async () => {
    try {
      const res = await accessCodesApi.getCodes({
        schoolId,
        page: codesPage,
        limit: 10,
      });
      setCodes(res.items);
      setCodesTotalPages(res.totalPages ?? 1);
      setCodesTotal(res.total ?? 0);
    } catch {
      // Ignored
    }
  }, [schoolId, codesPage]);

  useEffect(() => {
    fetchSchoolDetails();
  }, [fetchSchoolDetails]);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    } else {
      fetchCodes();
    }
  }, [activeTab, fetchStudents, fetchCodes]);

  const handleEditSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await schoolsApi.updateSchool(schoolId, data);
      showSuccess('School updated successfully');
      setIsEditOpen(false);
      fetchSchoolDetails();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to update school'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !school) {
    return <TableSkeleton rows={4} cols={4} />;
  }

  if (error || !school) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Schools
        </button>
        <ErrorAlert message={error || 'School not found'} onRetry={fetchSchoolDetails} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Back to schools list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{school.name}</h2>
              <StatusChip status={school.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 font-mono">Code: {school.schoolCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Info
          </button>
          <button
            onClick={() => setIsGenerateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate Code
          </button>
        </div>
      </div>

      {/* School Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Info card */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact & Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Contact Person</p>
              <p className="font-semibold text-slate-900 mt-0.5">{school.contactPerson || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Official Email</p>
              <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {school.email || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Phone Number</p>
              <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {school.phone || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Registered On</p>
              <p className="font-semibold text-slate-900 mt-0.5">
                {school.createdAt ? new Date(school.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-400">Physical Address</p>
              <p className="text-slate-800 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {school.address || 'No physical address configured'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Counters */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Access Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-700 font-medium">Students</p>
              <p className="text-2xl font-bold text-blue-950 mt-1">
                {school._count?.students ?? school.studentsCount ?? 0}
              </p>
            </div>
            <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
              <p className="text-xs text-violet-700 font-medium">Total Codes</p>
              <p className="text-2xl font-bold text-violet-950 mt-1">
                {school._count?.accessCodes ?? school.totalCodes ?? 0}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium">Used</p>
              <p className="text-2xl font-bold text-emerald-950 mt-1">{school.usedCodes ?? 0}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs text-amber-700 font-medium">Unused</p>
              <p className="text-2xl font-bold text-amber-950 mt-1">{school.unusedCodes ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Students & Access Codes */}
      <div className="space-y-4">
        <div className="border-b border-slate-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('students')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'students'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Enrolled Students ({studentsTotal})
            </button>
            <button
              onClick={() => setActiveTab('codes')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'codes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Access Codes ({codesTotal})
            </button>
          </div>
        </div>

        {/* Tab Content: Students */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {students.length === 0 ? (
              <EmptyState
                title="No Students Registered Yet"
                description="Students who redeem access codes assigned to this school will appear here."
                icon={Users}
              />
            ) : (
              <div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Student Name</th>
                      <th className="px-6 py-3.5">Phone / Email</th>
                      <th className="px-6 py-3.5">Class / Grade</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-3.5">
                          <span className="font-semibold text-slate-900">{st.name}</span>
                          <span className="block text-xs text-slate-400 font-mono">ID: {st.id}</span>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-600">
                          {st.phone || st.email || 'N/A'}
                        </td>
                        <td className="px-6 py-3.5 text-xs font-medium text-slate-700">
                          {st.class?.name || (st.classId ? `Class #${st.classId}` : 'Unassigned')}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusChip status={st.status} size="sm" />
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => onNavigate(`/students/${st.id}`)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            View Student →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  currentPage={studentsPage}
                  totalPages={studentsTotalPages}
                  totalItems={studentsTotal}
                  limit={10}
                  onPageChange={setStudentsPage}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Access Codes */}
        {activeTab === 'codes' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {codes.length === 0 ? (
              <EmptyState
                title="No Access Codes Assigned"
                description="Generate single or bulk access codes for this school so students can redeem them."
                icon={KeyRound}
                actionText="Generate Code"
                onAction={() => setIsGenerateOpen(true)}
              />
            ) : (
              <div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">10-Digit Code</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Redeemed By</th>
                      <th className="px-6 py-3.5">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {codes.map((code) => (
                      <tr key={code.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-3.5 font-mono font-bold text-slate-900 select-all">
                          {code.code}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusChip status={code.status} size="sm" />
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-600">
                          {code.student ? (
                            <span className="font-semibold text-slate-800">{code.student.name}</span>
                          ) : (
                            <span className="text-slate-400 italic">Not redeemed yet</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-500">
                          {new Date(code.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  currentPage={codesPage}
                  totalPages={codesTotalPages}
                  totalItems={codesTotal}
                  limit={10}
                  onPageChange={setCodesPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit School Dialog */}
      <SchoolFormDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        schoolToEdit={school}
        isLoading={isSubmitting}
      />

      {/* Generate Access Code Dialog */}
      <GenerateCodeDialog
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onSuccess={() => {
          fetchSchoolDetails();
          fetchCodes();
        }}
      />
    </div>
  );
};
