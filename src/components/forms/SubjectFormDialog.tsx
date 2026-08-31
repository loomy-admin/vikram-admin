import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SubjectItem, ClassItem, CreateSubjectPayload, UpdateSubjectPayload, SubjectStatus } from '../../types';

interface SubjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSubjectPayload | UpdateSubjectPayload) => Promise<void>;
  subjectToEdit?: SubjectItem | null;
  classes: ClassItem[];
  defaultClassId?: number;
  isLoading?: boolean;
}

export const SubjectFormDialog: React.FC<SubjectFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  subjectToEdit,
  classes,
  defaultClassId,
  isLoading = false,
}) => {
  const [classId, setClassId] = useState<number>(defaultClassId || (classes[0]?.id || 1));
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(0);
  const [status, setStatus] = useState<SubjectStatus>('ACTIVE');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (subjectToEdit) {
      setClassId(subjectToEdit.classId);
      setName(subjectToEdit.name);
      setDescription(subjectToEdit.description || '');
      setOrder(subjectToEdit.order || 0);
      setStatus(subjectToEdit.status || 'ACTIVE');
    } else {
      setClassId(defaultClassId || (classes[0]?.id || 1));
      setName('');
      setDescription('');
      setOrder(0);
      setStatus('ACTIVE');
    }
    setErrors({});
  }, [subjectToEdit, defaultClassId, classes, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Subject name is required';
    if (!classId) errs.classId = 'Class selection is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      classId: Number(classId),
      name: name.trim(),
      description: description.trim() || undefined,
      order: Number(order) || 0,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {subjectToEdit ? 'Edit Subject' : 'Add New Subject'}
          </h3>
          <button onClick={onClose} disabled={isLoading} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Class <span className="text-rose-500">*</span>
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(Number(e.target.value))}
              disabled={!!subjectToEdit}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                subjectToEdit ? 'bg-slate-100 text-slate-500' : 'border-slate-300'
              }`}
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.grade > 0 ? `${cls.name} (Grade ${cls.grade})` : cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mathematics, Science, Social Studies"
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                errors.name ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SubjectStatus)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the subject curriculum..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
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
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-2"
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {subjectToEdit ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
