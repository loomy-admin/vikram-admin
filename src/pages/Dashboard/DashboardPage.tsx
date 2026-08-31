import React, { useState, useEffect } from 'react';
import { Building2, Users, KeyRound, CheckCircle2, CircleDashed, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { DashboardStats } from '../../types';
import { StatCard } from '../../components/common/StatCard';
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
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Overview</h2>
          <p className="text-sm text-slate-500">
            Real-time platform metrics and core operational counters
          </p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadDashboard} />}

      {/* Primary Statistics Grid */}
      {isLoading ? (
        <CardSkeleton count={5} />
      ) : stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Schools"
              value={stats.totalSchools}
              subtitle="Registered partner schools"
              icon={Building2}
              variant="blue"
            />
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              subtitle={`${stats.activeStudents} active students`}
              icon={Users}
              variant="violet"
            />
            <StatCard
              title="Total Access Codes"
              value={stats.totalAccessCodes}
              subtitle="10-digit credentials"
              icon={KeyRound}
              variant="slate"
            />
            <StatCard
              title="Used Codes"
              value={stats.usedCodes}
              subtitle="Redeemed by students"
              icon={CheckCircle2}
              variant="emerald"
            />
            <StatCard
              title="Unused Codes"
              value={stats.unusedCodes}
              subtitle="Available for allocation"
              icon={CircleDashed}
              variant="amber"
            />
          </div>

          {/* Secondary Stats & Quick Navigation Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions Card */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Management Shortcuts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => onNavigate('/schools')}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Schools Directory</p>
                      <p className="text-xs text-slate-500">Register and manage partner schools</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>

                <button
                  onClick={() => onNavigate('/access-codes')}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Access Code Generator</p>
                      <p className="text-xs text-slate-500">Generate single or bulk 10-digit codes</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                </button>

                <button
                  onClick={() => onNavigate('/students')}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/30 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Student Registry</p>
                      <p className="text-xs text-slate-500">Review status and school assignments</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
                </button>

                <button
                  onClick={() => onNavigate('/content')}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Curriculum Content</p>
                      <p className="text-xs text-slate-500">Class, Subject, Chapter, Topic & Media</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Curriculum Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Curriculum Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Total Classes / Grades</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{stats.totalClasses || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>Total Subjects</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{stats.totalSubjects || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-violet-600" />
                      <span>Published Content Items</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{stats.totalContents || 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span>Inactive access codes: </span>
                <span className="font-semibold text-slate-700">{stats.inactiveCodes}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
