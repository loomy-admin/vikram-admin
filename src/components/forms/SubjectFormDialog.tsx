import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Trash2, Link2 } from 'lucide-react';
import { SubjectItem, ClassItem, CreateSubjectPayload, UpdateSubjectPayload, SubjectStatus } from '../../types';
import { contentApi } from '../../api/contentApi';
import { useToast } from '../../context/ToastContext';

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
  const { showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [classId, setClassId] = useState<number>(defaultClassId || (classes[0]?.id || 1));
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [order, setOrder] = useState<number>(0);
  const [status, setStatus] = useState<SubjectStatus>('ACTIVE');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (subjectToEdit) {
      setClassId(subjectToEdit.classId);
      setName(subjectToEdit.name);
      setDescription(subjectToEdit.description || '');
      setImageUrl(subjectToEdit.imageUrl || '');
      setOrder(subjectToEdit.order || 0);
      setStatus(subjectToEdit.status || 'ACTIVE');
    } else {
      setClassId(defaultClassId || (classes[0]?.id || 1));
      setName('');
      setDescription('');
      setImageUrl('');
      setOrder(0);
      setStatus('ACTIVE');
    }
    setIsUploadingImage(false);
    setUploadProgress(0);
    setShowUrlInput(false);
    setErrors({});
  }, [subjectToEdit, defaultClassId, classes, isOpen]);

  if (!isOpen) return null;

  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file (PNG, JPG, WEBP, SVG)');
      return;
    }

    setIsUploadingImage(true);
    setUploadProgress(0);

    try {
      const res = await contentApi.uploadImage(file, (percent) => {
        setUploadProgress(percent);
      });
      setImageUrl(res.url);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Failed to upload image. You can also paste an image URL directly.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
      imageUrl: imageUrl.trim() || undefined,
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
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${
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
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${
                errors.name ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Dynamic Subject Image / Illustration (Cloudinary) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Subject Image / Illustration (Cloudinary)
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Link2 className="w-3 h-3" />
                {showUrlInput ? 'Upload File' : 'Paste URL'}
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageFileSelected}
              className="hidden"
            />

            {imageUrl ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <img
                  src={imageUrl}
                  alt="Subject Preview"
                  className="w-14 h-14 rounded-lg object-contain bg-white border border-slate-200 shadow-xs p-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">Image uploaded</p>
                  <p className="text-[11px] text-slate-500 truncate">{imageUrl}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="text-xs text-slate-700 hover:text-slate-900 font-medium underline"
                    >
                      Change
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : showUrlInput ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/... or image URL"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
                <p className="text-[11px] text-slate-500">Paste any public Cloudinary or image URL directly.</p>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="w-full border-2 border-dashed border-slate-200 hover:border-red-400 bg-slate-50 hover:bg-red-50/20 rounded-xl p-4 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-2 py-1">
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-semibold text-slate-700">
                        Uploading to Cloudinary... {uploadProgress > 0 && `${uploadProgress}%`}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
                        <UploadCloud className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        Click to upload illustration / icon
                      </p>
                      <p className="text-[11px] text-slate-500">
                        PNG, JPG, WEBP, SVG up to 10MB
                      </p>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SubjectStatus)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
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
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
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
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-xs flex items-center gap-2"
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
