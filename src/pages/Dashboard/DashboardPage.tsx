import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  KeyRound,
  CheckCircle2,
  CircleDashed,
  BookOpen,
  Layers,
  ArrowRight,
  RotateCw,
  Power,
  GraduationCap,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { DashboardStats } from '../../types';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { getErrorMessage } from '../../api/axios';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard statistics'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-7 pb-8">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor partner schools, student activity, 10-digit access codes, and learning content in real-time.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          disabled={isLoading}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-xs text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition-all cursor-pointer"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </header>

      {error && <ErrorAlert message={error} onRetry={loadDashboard} />}

      {isLoading ? (
        <CardSkeleton count={6} />
      ) : stats ? (
        <div className="space-y-8">
          {/* Real-time Operations Overview Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white p-6 sm:p-7 shadow-lg shadow-red-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-red-100">
                Vikram Admin Console
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">
                Real-time Platform Operations
              </h2>
              <p className="text-sm text-red-100/90 mt-1.5 max-w-2xl leading-relaxed">
                Supervising registered partner schools, active student accounts, 10-digit access code distribution, and published learning curriculum.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 relative z-10">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span className="text-xs font-bold tracking-wide text-white">Live Connected</span>
              </div>
              <div className="bg-white/20 px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold text-white">
                Active System
              </div>
            </div>

            {/* Abstract Background Shapes */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-56 h-56 border-[24px] border-white/10 rounded-full pointer-events-none" />
            <div className="absolute right-28 top-0 -translate-y-12 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Section 1: Schools & Student Registry Metrics */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-red-600 rounded-full" />
              Schools & Student Registry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Schools */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Partner Schools
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{stats.totalSchools}</div>
                  <p className="text-xs text-slate-500 mt-1">Registered Institutions</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Total Classes</span>
                  <span className="font-bold text-slate-900">{stats.totalClasses}</span>
                </div>
              </div>

              {/* Total Students */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Students
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{stats.totalStudents}</div>
                  <p className="text-xs text-slate-500 mt-1">Learner Registrations</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Active Accounts</span>
                  <span className="font-bold text-emerald-600">{stats.activeStudents}</span>
                </div>
              </div>

              {/* Active Students */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Active Learners
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-emerald-600">{stats.activeStudents}</div>
                  <p className="text-xs text-slate-500 mt-1">Activated with Code</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Pending Approval</span>
                  <span className="font-bold text-amber-600">{stats.pendingStudents}</span>
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Pending Students
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <CircleDashed className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className={`text-3xl font-black ${stats.pendingStudents > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                    {stats.pendingStudents}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Awaiting Code Activation</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Total Registered</span>
                  <span className="font-bold text-slate-900">{stats.totalStudents}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Access Code Distribution */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-slate-700 rounded-full" />
              10-Digit Access Code Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Access Codes */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Codes
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{stats.totalAccessCodes}</div>
                  <p className="text-xs text-slate-500 mt-1">Generated Credentials</p>
                </div>
              </div>

              {/* Used Codes */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Redeemed (Used)
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-emerald-600">{stats.usedCodes}</div>
                  <p className="text-xs text-slate-500 mt-1">Linked to Student Accounts</p>
                </div>
              </div>

              {/* Unused Codes */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Unused Available
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <CircleDashed className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{stats.unusedCodes}</div>
                  <p className="text-xs text-slate-500 mt-1">Available for Student Use</p>
                </div>
              </div>

              {/* Inactive Codes */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Disabled Codes
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Power className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-rose-600">{stats.inactiveCodes}</div>
                  <p className="text-xs text-slate-500 mt-1">Soft-Disabled Credentials</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Management Shortcuts & Curriculum */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions Shortcuts */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Management Operations Shortcuts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  onClick={() => onNavigate('/schools')}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/20 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Schools Directory</p>
                      <p className="text-xs text-slate-500">Register & manage partner schools</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                </button>

                <button
                  onClick={() => onNavigate('/access-codes')}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/20 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Access Codes Control</p>
                      <p className="text-xs text-slate-500">Generate & soft-disable credentials</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                </button>

                <button
                  onClick={() => onNavigate('/students')}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/20 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Student Registry</p>
                      <p className="text-xs text-slate-500">Filters, timestamps & approvals</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                </button>

                <button
                  onClick={() => onNavigate('/content')}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/20 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Curriculum Content</p>
                      <p className="text-xs text-slate-500">Classes, Subjects, Topics & Materials</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Curriculum Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Curriculum Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Layers className="w-4 h-4 text-red-600" />
                      <span>Total Classes / Grades</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{stats.totalClasses || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>Total Subjects</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{stats.totalSubjects || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <GraduationCap className="w-4 h-4 text-violet-600" />
                      <span>Published Media Items</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{stats.totalContents || 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Disabled Access Codes</span>
                <span className="font-bold text-rose-600">{stats.inactiveCodes}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
