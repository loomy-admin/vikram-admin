import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Link as LinkIcon, FileText, Video, Image as ImageIcon, Globe, Check } from 'lucide-react';
import { ContentItem, TopicItem, CreateContentPayload, UpdateContentPayload, ContentType, ContentStatus } from '../../types';
import { contentApi } from '../../api/contentApi';
import { getErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';

interface ContentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContentPayload | UpdateContentPayload) => Promise<void>;
  contentToEdit?: ContentItem | null;
  topic: TopicItem;
  isLoading?: boolean;
}

export const ContentFormDialog: React.FC<ContentFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contentToEdit,
  topic,
  isLoading = false,
}) => {
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ContentType>('VIDEO');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(0);
  const [status, setStatus] = useState<ContentStatus>('VISIBLE');

  const [sourceMode, setSourceMode] = useState<'upload' | 'url'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contentToEdit) {
      setTitle(contentToEdit.title);
      setType(contentToEdit.type);
      setUrl(contentToEdit.url);
      setDescription(contentToEdit.description || '');
      setOrder(contentToEdit.order || 0);
      setStatus(contentToEdit.status || 'VISIBLE');
      setSourceMode('url');
    } else {
      setTitle('');
      setType('VIDEO');
      setUrl('');
      setDescription('');
      setOrder(0);
      setStatus('VISIBLE');
      setSourceMode('url');
    }
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    setErrors({});
  }, [contentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    try {
      const res = await contentApi.uploadFile(file, (percent) => {
        setUploadProgress(percent);
      });
      setUrl(res.url);
      setUploadSuccess(true);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      showSuccess(`File "${file.name}" uploaded successfully`);
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to upload file to backend'));
    } finally {
      setIsUploading(false);
    }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!url.trim()) errs.url = 'Content URL or uploaded file is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      topicId: topic.id,
      title: title.trim(),
      type,
      url: url.trim(),
      description: description.trim() || undefined,
      order: Number(order) || 0,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {contentToEdit ? 'Edit Learning Content' : 'Add Learning Content'}
            </h3>
            <p className="text-xs text-slate-500">Topic: {topic.name}</p>
          </div>
          <button onClick={onClose} disabled={isLoading || isUploading} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Content Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Content Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'VIDEO', label: 'Video', icon: Video },
                { id: 'PDF', label: 'PDF Doc', icon: FileText },
                { id: 'IMAGE', label: 'Image', icon: ImageIcon },
                { id: 'WEB_LINK', label: 'Web Link', icon: Globe },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as ContentType)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Video Lecture 1 - Understanding Prime Factorization"
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                errors.title ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* Source Mode Toggle: Upload vs Direct URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Content Source <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setSourceMode('url')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    sourceMode === 'url' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5 inline mr-1" />
                  URL / Web
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    sourceMode === 'upload' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5 inline mr-1" />
                  Upload File
                </button>
              </div>
            </div>

            {sourceMode === 'url' ? (
              <div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/lecture.mp4 or https://youtube.com/watch?v=..."
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    errors.url ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter a direct media URL, YouTube URL, cloud document link, or web resource.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileSelected}
                  className="hidden"
                  accept="application/pdf,video/*,image/*"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-all"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    {selectedFile ? selectedFile.name : 'Click to browse and upload file'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports PDFs, MP4s, WebM, PNG, JPG (uploaded via Express backend storage)
                  </p>
                </div>

                {isUploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Uploading to server...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>File uploaded and linked: {url}</span>
                  </div>
                )}
              </div>
            )}
            {errors.url && <p className="text-xs text-rose-500 mt-1">{errors.url}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Visibility</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContentStatus)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="VISIBLE">VISIBLE (Published)</option>
              <option value="HIDDEN">HIDDEN (Draft)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions or brief summary for students..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isUploading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-2"
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {contentToEdit ? 'Save Changes' : 'Publish Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
