import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { AccessCode, School } from '../../types';
import { schoolsApi } from '../../api/schoolsApi';

interface ReassignCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (schoolId: number) => Promise<void>;
  accessCode: AccessCode | null;
  isLoading?: boolean;
}

export const ReassignCodeDialog: React.FC<ReassignCodeDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  accessCode,
  isLoading = false,
}) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedSchoolId('');
      setError(null);
      loadSchools();
    }
  }, [isOpen]);

  const loadSchools = async () => {
    try {
      const res = await schoolsApi.getSchools({ limit: 100, status: 'ACTIVE' });
      setSchools(res.items);
    } catch {
      // Ignored
    }
  };

  if (!isOpen || !accessCode) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId) {
      setError('Please select a new target school');
      return;
    }
    if (selectedSchoolId === accessCode.schoolId) {
      setError('Selected school is already the current school');
      return;
    }

    await onSubmit(Number(selectedSchoolId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Reassign Access Code</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
          <p className="text-slate-500">Access Code: <span className="font-mono font-bold text-slate-900">{accessCode.code}</span></p>
          <p className="text-slate-500">Current School: <span className="font-medium text-slate-800">{accessCode.school?.name || `School #${accessCode.schoolId}`}</span></p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              New Target School <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="">-- Select New School --</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.schoolCode})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedSchoolId}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Reassign Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
