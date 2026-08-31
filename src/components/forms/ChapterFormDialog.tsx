import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ChapterItem, SubjectItem, CreateChapterPayload, UpdateChapterPayload, ChapterStatus } from '../../types';

interface ChapterFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChapterPayload | UpdateChapterPayload) => Promise<void>;
  chapterToEdit?: ChapterItem | null;
  subject: SubjectItem;
  isLoading?: boolean;
}

export const ChapterFormDialog: React.FC<ChapterFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  chapterToEdit,
  subject,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(0);
  const [status, setStatus] = useState<ChapterStatus>('ACTIVE');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (chapterToEdit) {
      setName(chapterToEdit.name);
      setDescription(chapterToEdit.description || '');
      setOrder(chapterToEdit.order || 0);
      setStatus(chapterToEdit.status || 'ACTIVE');
    } else {
      setName('');
      setDescription('');
      setOrder(0);
      setStatus('ACTIVE');
    }
    setErrors({});
  }, [chapterToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Chapter name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      subjectId: subject.id,
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
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {chapterToEdit ? 'Edit Chapter' : 'Add New Chapter'}
            </h3>
            <p className="text-xs text-slate-500">Subject: {subject.name}</p>
          </div>
          <button onClick={onClose} disabled={isLoading} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chapter Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chapter 1 - Real Numbers"
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
              onChange={(e) => setStatus(e.target.value as ChapterStatus)}
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
              placeholder="Summary of concepts covered in this chapter..."
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
              {chapterToEdit ? 'Save Changes' : 'Create Chapter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
