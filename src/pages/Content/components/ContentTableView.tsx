import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Video,
  FileText,
  Image as ImageIcon,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { ContentItem, TopicItem, ContentType } from '../../../types';
import { StatusChip } from '../../../components/common/StatusChip';

interface ContentTableViewProps {
  topic: TopicItem;
  contents: ContentItem[];
  isLoading: boolean;
  onAddContent: () => void;
  onEditContent: (content: ContentItem) => void;
  onDeleteContent: (content: ContentItem) => void;
  onPreviewContent: (content: ContentItem) => void;
  onReorder: (index: number, direction: 'up' | 'down') => void;
  onDragDrop: (dragIndex: number, dropIndex: number) => void;
}

function getContentIcon(type: ContentType) {
  switch (type) {
    case 'VIDEO':
      return <Video className="w-4 h-4 text-blue-600" />;
    case 'PDF':
      return <FileText className="w-4 h-4 text-rose-600" />;
    case 'IMAGE':
      return <ImageIcon className="w-4 h-4 text-emerald-600" />;
    case 'WEB_LINK':
      return <Globe className="w-4 h-4 text-purple-600" />;
    default:
      return <FileText className="w-4 h-4 text-slate-500" />;
  }
}

export const ContentTableView: React.FC<ContentTableViewProps> = ({
  topic,
  contents,
  isLoading,
  onAddContent,
  onEditContent,
  onDeleteContent,
  onPreviewContent,
  onReorder,
  onDragDrop,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const filteredContents = contents.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIndex) return;
    onDragDrop(draggedIdx, dropIndex);
    setDraggedIdx(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Toolbar Header */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Learning Content for <span className="text-blue-600 font-extrabold">{topic.name}</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">
                {filteredContents.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500">Manage videos, PDFs, and learning resources</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search video or PDF..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <button
            onClick={onAddContent}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Content
          </button>
        </div>
      </div>

      {/* Table Area */}
      {isLoading ? (
        <div className="p-6 space-y-3 animate-pulse">
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-10 bg-slate-100 rounded-lg" />
        </div>
      ) : filteredContents.length === 0 ? (
        <div className="p-10 text-center space-y-3">
          <Video className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            {contents.length === 0 ? `No media content uploaded for "${topic.name}"` : 'No items matching search'}
          </p>
          <button
            onClick={onAddContent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
          >
            <Plus className="w-3.5 h-3.5" /> Upload Video or PDF
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3 w-10 text-center">Reorder</th>
                <th className="py-3 px-4 w-12 text-center">Type</th>
                <th className="py-3 px-4">Content Title</th>
                <th className="py-3 px-4">Resource URL / File</th>
                <th className="py-3 px-4 text-center">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredContents.map((item, idx) => (
                <tr
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={() => setDraggedIdx(null)}
                  className={`hover:bg-blue-50/40 transition-colors ${
                    draggedIdx === idx ? 'opacity-40 bg-blue-50 border-dashed border-blue-400' : ''
                  }`}
                >
                  {/* Drag Handle & Reorder */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <GripVertical className="w-4 h-4 text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600" />
                      <div className="flex flex-col">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => onReorder(idx, 'up')}
                          className="text-slate-400 hover:text-blue-600 disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === filteredContents.length - 1}
                          onClick={() => onReorder(idx, 'down')}
                          className="text-slate-400 hover:text-blue-600 disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Type Icon */}
                  <td className="py-3 px-4 text-center">
                    <div className="p-1.5 rounded-lg bg-slate-100 inline-block">
                      {getContentIcon(item.type)}
                    </div>
                  </td>

                  {/* Content Title */}
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>
                      <span>{item.title}</span>
                      {item.description && (
                        <p className="text-[11px] font-normal text-slate-500 line-clamp-1">{item.description}</p>
                      )}
                    </div>
                  </td>

                  {/* URL / Resource Link */}
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate font-mono text-[11px]">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span className="truncate">{item.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <StatusChip status={item.status || 'VISIBLE'} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onPreviewContent(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditContent(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Content"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteContent(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Content"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
