import React, { useState, useEffect } from 'react';
import { X, Copy, Check, KeyRound } from 'lucide-react';
import { School } from '../../types';
import { accessCodesApi, SingleCodeResult } from '../../api/accessCodesApi';
import { schoolsApi } from '../../api/schoolsApi';
import { getErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';

interface GenerateCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GenerateCodeDialog: React.FC<GenerateCodeDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showSuccess } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<SingleCodeResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGeneratedResult(null);
      setError(null);
      setCopied(false);
      loadSchools();
    }
  }, [isOpen]);

  const loadSchools = async () => {
    try {
      const res = await schoolsApi.getSchools({ limit: 100, status: 'ACTIVE' });
      setSchools(res.items);
      if (res.items.length > 0 && !selectedSchoolId) {
        setSelectedSchoolId(res.items[0].id);
      }
    } catch {
      // Ignored
    }
  };

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId) {
      setError('Please select a target school');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await accessCodesApi.generateSingle(Number(selectedSchoolId));
      setGeneratedResult(result);
      showSuccess('10-digit access code generated successfully');
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to generate access code'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Generate Single Access Code</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        {!generatedResult ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target School <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="">-- Select Active School --</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.schoolCode})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                The 10-digit code will be generated uniquely and cryptographically by the backend.
              </p>
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
                Generate Code
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center py-2">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-red-800 uppercase tracking-wider">
                Assigned to {generatedResult.schoolName}
              </p>
              <div className="font-mono text-3xl font-bold tracking-widest text-slate-900 py-1 select-all">
                {generatedResult.code}
              </div>
              <p className="text-xs text-slate-500">Status: UNUSED (Ready for student redemption)</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors border shadow-xs ${
                  copied
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Code'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
