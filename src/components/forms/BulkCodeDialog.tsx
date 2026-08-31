import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Layers, Check } from 'lucide-react';
import { School } from '../../types';
import { accessCodesApi, BulkCodesResult } from '../../api/accessCodesApi';
import { schoolsApi } from '../../api/schoolsApi';
import { getErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';

interface BulkCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkCodeDialog: React.FC<BulkCodeDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showSuccess } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkCodesResult | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBulkResult(null);
      setError(null);
      setCopiedAll(false);
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
    if (quantity < 1 || quantity > 1000) {
      setError('Quantity must be between 1 and 1000');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await accessCodesApi.generateBulk(Number(selectedSchoolId), quantity);
      setBulkResult(result);
      showSuccess(`${result.totalGenerated} access codes generated successfully`);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to generate bulk access codes'));
    } finally {
      setIsLoading(false);
    }
  };

  const getEffectiveCodes = (): Array<{ id: number; code: string; status: string; createdAt: string }> => {
    if (!bulkResult) return [];
    if (bulkResult.codes && Array.isArray(bulkResult.codes)) return bulkResult.codes;
    if ((bulkResult as any).sampleCodes && Array.isArray((bulkResult as any).sampleCodes)) {
      return (bulkResult as any).sampleCodes.map((code: string, idx: number) => ({
        id: idx + 1,
        code,
        status: 'UNUSED',
        createdAt: new Date().toISOString(),
      }));
    }
    return [];
  };

  const handleCopyAll = () => {
    const codes = getEffectiveCodes();
    if (codes.length === 0) return;
    const codesList = codes.map((c) => c.code).join('\n');
    navigator.clipboard.writeText(codesList);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleDownloadCsv = () => {
    const codes = getEffectiveCodes();
    if (codes.length === 0 || !bulkResult) return;
    const headers = 'Code,Status,School,CreatedDate\n';
    const rows = codes
      .map(
        (c) =>
          `"${c.code}","${c.status}","${bulkResult.schoolName}","${new Date(c.createdAt).toLocaleDateString()}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `access_codes_${bulkResult.schoolName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Generate Bulk Access Codes</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg shrink-0">
            {error}
          </div>
        )}

        {!bulkResult ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target School <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">-- Select Active School --</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.schoolCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quantity of Codes (1 to 1000) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                placeholder="e.g. 100"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <div className="flex gap-2 mt-2">
                {[25, 50, 100, 250, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantity(preset)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
                disabled={isLoading || !selectedSchoolId || quantity < 1}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Generate {quantity > 0 ? quantity : ''} Codes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 shrink-0">
              <div>
                <p className="text-sm font-bold">
                  {bulkResult.totalGenerated} Access Codes Generated Successfully
                </p>
                <p className="text-xs text-emerald-700">School: {bulkResult.schoolName}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedAll ? 'Copied' : 'Copy All'}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                </button>
              </div>
            </div>

            {/* Generated Codes List */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-64">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 font-semibold">#</th>
                    <th className="px-4 py-2 font-semibold">10-Digit Code</th>
                    <th className="px-4 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getEffectiveCodes().map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-2 font-mono font-bold text-slate-900 select-all">
                        {item.code}
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 text-[11px] font-medium bg-sky-50 text-sky-700 rounded-full border border-sky-200">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
