import React, { useState } from 'react';
import { X, Plus, Sparkles, Trash2, Power, School, Layers, Check } from 'lucide-react';
import { ClassItem } from '../../types';
import { contentApi } from '../../api/contentApi';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/axios';

interface ClassManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  onRefresh: () => void;
}

const PRESET_CLASSES = [
  { name: 'Nursery', grade: -3 },
  { name: 'LKG', grade: -2 },
  { name: 'UKG', grade: -1 },
  { name: 'Grade 1', grade: 1 },
  { name: 'Grade 2', grade: 2 },
  { name: 'Grade 3', grade: 3 },
  { name: 'Grade 4', grade: 4 },
  { name: 'Grade 5', grade: 5 },
  { name: 'Grade 6', grade: 6 },
  { name: 'Grade 7', grade: 7 },
  { name: 'Grade 8', grade: 8 },
  { name: 'Grade 9', grade: 9 },
  { name: 'Grade 10', grade: 10 },
  { name: 'Grade 11', grade: 11 },
  { name: 'Grade 12', grade: 12 },
];

export const ClassManagerDrawer: React.FC<ClassManagerDrawerProps> = ({
  isOpen,
  onClose,
  classes,
  onRefresh,
}) => {
  const { showSuccess, showError } = useToast();

  const [customName, setCustomName] = useState('');
  const [customGrade, setCustomGrade] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  if (!isOpen) return null;

  const existingNameSet = new Set(classes.map((c) => c.name.toLowerCase().trim()));

  const handleCreateClass = async (name: string, grade: number) => {
    if (existingNameSet.has(name.toLowerCase().trim())) {
      showError(`"${name}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await contentApi.createClass({
        name: name.trim(),
        grade,
        status: 'ACTIVE',
      });
      showSuccess(`Created class "${name}" successfully`);
      setCustomName('');
      setCustomGrade('');
      onRefresh();
    } catch (err) {
      showError(getErrorMessage(err, `Failed to create "${name}"`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      showError('Please enter a class name.');
      return;
    }
    const gradeNum = customGrade !== '' ? Number(customGrade) : 0;
    handleCreateClass(customName, gradeNum);
  };

  const handleToggleStatus = async (cls: ClassItem) => {
    setActionId(cls.id);
    const newStatus = cls.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    try {
      await contentApi.updateClass(cls.id, { status: newStatus });
      showSuccess(`Class "${cls.name}" status updated to ${newStatus}`);
      onRefresh();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to update class status'));
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteClass = async (cls: ClassItem) => {
    if (!window.confirm(`Are you sure you want to delete "${cls.name}"? This action cannot be undone.`)) {
      return;
    }
    setActionId(cls.id);
    try {
      await contentApi.deleteClass(cls.id);
      showSuccess(`Deleted class "${cls.name}" successfully`);
      onRefresh();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to delete class'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto relative w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-red-500/20 text-blue-400">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">Class & Grade Manager</h2>
                <p className="text-xs text-slate-400">Add or manage classes for your curriculum</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Presets Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-600" />
                  Quick Add Presets
                </span>
                <span className="text-[11px] text-slate-400">Click to add class</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {PRESET_CLASSES.map((preset) => {
                  const exists = existingNameSet.has(preset.name.toLowerCase());
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      disabled={exists || isSubmitting}
                      onClick={() => handleCreateClass(preset.name, preset.grade)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center justify-between ${
                        exists
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 opacity-80 cursor-default'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-red-500 hover:text-red-600 hover:bg-red-50/50 shadow-2xs'
                      }`}
                    >
                      <span>{preset.name}</span>
                      {exists ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Class Creator */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-red-600" />
                Custom Class Creator
              </span>

              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Class Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Playgroup"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Grade Level #
                    </label>
                    <input
                      type="number"
                      value={customGrade}
                      onChange={(e) => setCustomGrade(e.target.value !== '' ? Number(e.target.value) : '')}
                      placeholder="e.g. 6"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !customName.trim()}
                  className="w-full py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Add Custom Class
                </button>
              </form>
            </div>

            {/* Current Active Classes List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Classes ({classes.length})
                </span>
              </div>

              {classes.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No classes created yet. Use presets above to add classes.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{cls.name}</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                            {cls.grade > 0 ? `Grade #${cls.grade}` : 'Pre-Primary'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {cls._count?.subjects ?? 0} Subjects • {cls._count?.students ?? 0} Students
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cls)}
                          disabled={actionId === cls.id}
                          title={cls.status === 'INACTIVE' ? 'Activate Class' : 'Deactivate Class'}
                          className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                            cls.status === 'INACTIVE'
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteClass(cls)}
                          disabled={actionId === cls.id}
                          title="Delete Class"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
