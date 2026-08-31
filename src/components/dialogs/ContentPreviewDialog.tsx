import React from 'react';
import { X, ExternalLink, FileText, Video, Image as ImageIcon, Globe } from 'lucide-react';
import { ContentItem } from '../../types';

interface ContentPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItem | null;
}

export const ContentPreviewDialog: React.FC<ContentPreviewDialogProps> = ({
  isOpen,
  onClose,
  content,
}) => {
  if (!isOpen || !content) return null;

  const renderViewer = () => {
    switch (content.type) {
      case 'VIDEO':
        // Check if youtube link
        if (content.url.includes('youtube.com') || content.url.includes('youtu.be')) {
          let embedUrl = content.url;
          if (content.url.includes('watch?v=')) {
            const videoId = content.url.split('watch?v=')[1]?.split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
          } else if (content.url.includes('youtu.be/')) {
            const videoId = content.url.split('youtu.be/')[1]?.split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
          }
          return (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe
                src={embedUrl}
                title={content.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
        return (
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
            <video
              src={content.url}
              controls
              autoPlay={false}
              className="max-h-full max-w-full"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'PDF':
        return (
          <div className="w-full h-[60vh] bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex flex-col">
            <iframe
              src={content.url}
              title={content.title}
              className="w-full flex-1"
            />
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">If PDF preview does not load inline:</span>
              <a
                href={content.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
              >
                Open in new tab <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        );

      case 'IMAGE':
        return (
          <div className="max-h-[60vh] overflow-auto flex items-center justify-center p-4 bg-slate-900/10 rounded-lg">
            <img
              src={content.url}
              alt={content.title}
              className="max-h-[50vh] max-w-full object-contain rounded-md shadow-md"
              referrerPolicy="no-referrer"
            />
          </div>
        );

      case 'WEB_LINK':
      default:
        return (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg space-y-4">
            <Globe className="w-12 h-12 text-blue-600 mx-auto" />
            <div>
              <h4 className="text-base font-bold text-slate-900 mb-1">{content.title}</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto truncate">{content.url}</p>
            </div>
            <a
              href={content.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              Open Resource in Safe Tab
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        );
    }
  };

  const getIcon = () => {
    switch (content.type) {
      case 'VIDEO':
        return <Video className="w-5 h-5 text-red-600" />;
      case 'PDF':
        return <FileText className="w-5 h-5 text-amber-600" />;
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5 text-emerald-600" />;
      default:
        return <Globe className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-100">{getIcon()}</div>
            <div>
              <h3 className="text-base font-bold text-slate-900 truncate max-w-md">{content.title}</h3>
              <p className="text-xs text-slate-500">Type: {content.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderViewer()}
          {content.description && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-700 mb-1">Description</p>
              <p className="text-xs text-slate-600">{content.description}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0 text-xs text-slate-500">
          <span className="truncate max-w-xs">{content.url}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
