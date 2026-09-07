import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Link as LinkIcon, FileText, Video, Globe, Check, Trash2 } from 'lucide-react';
import { ContentItem, TopicItem, ChapterItem, CreateContentPayload, UpdateContentPayload, ContentType, ContentStatus } from '../../types';
import { contentApi } from '../../api/contentApi';
import { getErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';

interface ContentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContentPayload | UpdateContentPayload) => Promise<void>;
  contentToEdit?: ContentItem | null;
  topic?: TopicItem | null;
  chapter?: ChapterItem | null;
  isLoading?: boolean;
}

export const ContentFormDialog: React.FC<ContentFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contentToEdit,
  topic,
  chapter,
  isLoading = false,
}) => {
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ContentType>('VIDEO');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(0);
  const [status, setStatus] = useState<ContentStatus>('VISIBLE');

  const [sourceMode, setSourceMode] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState<boolean>(false);
  const [thumbnailProgress, setThumbnailProgress] = useState<number>(0);
  const [showThumbnailUrlInput, setShowThumbnailUrlInput] = useState<boolean>(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contentToEdit) {
      setTitle(contentToEdit.title);
      setType(contentToEdit.type);
      setUrl(contentToEdit.url);
      setThumbnailUrl(contentToEdit.thumbnailUrl || '');
      setDescription(contentToEdit.description || '');
      setOrder(contentToEdit.order || 0);
      setStatus(contentToEdit.status || 'VISIBLE');
      setSourceMode('url');
    } else {
      setTitle('');
      setType('VIDEO');
      setUrl('');
      setThumbnailUrl('');
      setDescription('');
      setOrder(0);
      setStatus('VISIBLE');
      setSourceMode('upload');
    }
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    setIsUploadingThumbnail(false);
    setThumbnailProgress(0);
    setShowThumbnailUrlInput(false);
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

  const handleThumbnailFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file (PNG, JPG, WEBP, SVG)');
      return;
    }

    setIsUploadingThumbnail(true);
    setThumbnailProgress(0);

    try {
      const res = await contentApi.uploadImage(file, (percent) => {
        setThumbnailProgress(percent);
      });
      setThumbnailUrl(res.url);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Failed to upload thumbnail. You can also paste an image URL directly.');
    } finally {
      setIsUploadingThumbnail(false);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!url.trim()) errs.url = 'File upload or URL is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      topicId: topic ? topic.id : undefined,
      chapterId: chapter ? chapter.id : undefined,
      title: title.trim(),
      type,
      url: url.trim(),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
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
            <p className="text-xs text-slate-500">
              {topic ? `Topic: ${topic.name}` : chapter ? `Chapter: ${chapter.name}` : 'Curriculum Content'}
            </p>
          </div>
          <button onClick={onClose} disabled={isLoading || isUploading} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Content Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Content Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'VIDEO', label: 'Video Lesson', icon: Video, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                { id: 'PDF', label: 'PDF Document', icon: FileText, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                { id: 'WEB_LINK', label: 'Web Resource / Link', icon: Globe, color: 'text-purple-600 bg-purple-50 border-purple-200' },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as ContentType)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? `${t.color} ring-2 ring-red-500 shadow-xs`
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span>{t.label}</span>
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
              placeholder="e.g. Chapter 1 Animated Concept Explanation"
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${
                errors.title ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* Source Mode Toggle: Upload vs URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Resource File / URL <span className="text-rose-500">*</span>
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    sourceMode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('url')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    sourceMode === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Direct URL
                </button>
              </div>
            </div>

            {sourceMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileSelected}
                  accept={type === 'VIDEO' ? 'video/*' : type === 'PDF' ? '.pdf' : '*/*'}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`w-full border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                    uploadSuccess
                      ? 'border-emerald-300 bg-emerald-50/40 text-emerald-800'
                      : 'border-slate-200 hover:border-red-400 bg-slate-50 hover:bg-red-50/20 text-slate-600'
                  }`}
                >
                  {uploadSuccess ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Check className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-emerald-700">
                        File uploaded successfully!
                      </span>
                      <span className="text-[11px] text-slate-500 truncate max-w-xs">{url}</span>
                      <span className="text-[10px] text-emerald-600 underline">Click to replace file</span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800">
                        {isUploading
                          ? `Uploading... ${uploadProgress}%`
                          : selectedFile
                          ? selectedFile.name
                          : 'Click to select and upload file'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {type === 'VIDEO' ? 'MP4, MOV, MKV, WEBM' : type === 'PDF' ? 'PDF Document' : 'Any resource'} (Max 100MB)
                      </span>
                    </>
                  )}
                </button>

                {isUploading && (
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-red-600 h-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4 or https://youtube.com/..."
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${
                    errors.url ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter a direct media URL, YouTube URL, cloud document link, or web resource.
                </p>
              </div>
            )}
            {errors.url && <p className="text-xs text-rose-500 mt-1">{errors.url}</p>}
          </div>

          {/* Custom Thumbnail / Profile Image */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Thumbnail / Cover Image (Optional)
              </label>
              {!thumbnailUrl && (
                <button
                  type="button"
                  onClick={() => setShowThumbnailUrlInput(!showThumbnailUrlInput)}
                  className="text-[11px] text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  {showThumbnailUrlInput ? 'Upload file instead' : 'Or paste image URL'}
                </button>
              )}
            </div>

            <input
              type="file"
              ref={thumbnailInputRef}
              accept="image/*"
              onChange={handleThumbnailFileSelected}
              className="hidden"
            />

            {thumbnailUrl ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail Preview"
                  className="w-14 h-14 rounded-lg object-contain bg-white border border-slate-200 shadow-xs p-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">Thumbnail set</p>
                  <p className="text-[11px] text-slate-500 truncate">{thumbnailUrl}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={isUploadingThumbnail}
                      className="text-xs text-slate-700 hover:text-slate-900 font-medium underline"
                    >
                      Change
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setThumbnailUrl('')}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : showThumbnailUrlInput ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://... or image URL"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
                <p className="text-[11px] text-slate-500">Paste any public image URL directly.</p>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={isUploadingThumbnail}
                  className="w-full border-2 border-dashed border-slate-200 hover:border-red-400 bg-slate-50 hover:bg-red-50/20 rounded-xl p-3.5 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <UploadCloud className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {isUploadingThumbnail ? `Uploading thumbnail... ${thumbnailProgress}%` : 'Click to upload thumbnail'}
                  </span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, WEBP, SVG (Max 5MB)</span>
                </button>
                {isUploadingThumbnail && (
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-red-600 h-full transition-all duration-200"
                      style={{ width: `${thumbnailProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Visibility</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContentStatus)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
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
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isUploading || isUploadingThumbnail}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploading || isUploadingThumbnail}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-xs flex items-center gap-2"
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
