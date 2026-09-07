import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronRight,
  GripVertical,
  ArrowUp,
  ArrowDown,
  FileText,
  Video,
} from 'lucide-react';
import { ChapterItem, SubjectItem } from '../../../types';
import { StatusChip } from '../../../components/common/StatusChip';

interface ChaptersTableViewProps {
  subject: SubjectItem;
  chapters: ChapterItem[];
  isLoading: boolean;
  onSelectChapter: (chapter: ChapterItem, tab?: 'TOPICS' | 'CONTENT') => void;
  onAddChapter: () => void;
  onEditChapter: (chapter: ChapterItem) => void;
  onDeleteChapter: (chapter: ChapterItem) => void;
  onAddContentToChapter: (chapter: ChapterItem) => void;
  onReorder: (index: number, direction: 'up' | 'down') => void;
  onDragDrop: (dragIndex: number, dropIndex: number) => void;
}

export const ChaptersTableView: React.FC<ChaptersTableViewProps> = ({
  subject,
  chapters,
  isLoading,
  onSelectChapter,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onAddContentToChapter,
  onReorder,
  onDragDrop,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const filteredChapters = chapters.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Chapters for <span className="text-red-600 font-extrabold">{subject.name}</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full">
                {filteredChapters.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500">Manage curriculum chapters and units</p>
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
              placeholder="Search chapters..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <button
            onClick={onAddChapter}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Chapter
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
      ) : filteredChapters.length === 0 ? (
        <div className="p-10 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            {chapters.length === 0 ? `No chapters found for "${subject.name}"` : 'No chapters matching search'}
          </p>
          <button
            onClick={onAddChapter}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Chapter
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3 w-10 text-center">Reorder</th>
                <th className="py-3 px-4">Chapter Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Topics</th>
                <th className="py-3 px-4 text-center">Direct Content</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredChapters.map((ch, idx) => (
                <tr
                  key={ch.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={() => setDraggedIdx(null)}
                  className={`hover:bg-emerald-50/40 transition-colors ${
                    draggedIdx === idx ? 'opacity-40 bg-emerald-50 border-dashed border-emerald-400' : ''
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
                          className="text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === filteredChapters.length - 1}
                          onClick={() => onReorder(idx, 'down')}
                          className="text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Chapter Name & Image */}
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <button
                      type="button"
                      onClick={() => onSelectChapter(ch)}
                      className="hover:text-emerald-600 inline-flex items-center gap-2.5 text-left"
                    >
                      {ch.imageUrl ? (
                        <img
                          src={ch.imageUrl}
                          alt={ch.name}
                          className="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-200 p-0.5 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                      )}
                      <span className="hover:underline">{ch.name}</span>
                    </button>
                  </td>

                  {/* Description */}
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                    {ch.description || '—'}
                  </td>

                  {/* Topics Count */}
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectChapter(ch, 'TOPICS')}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                      title="View Topics"
                    >
                      <FileText className="w-3 h-3 text-red-600" />
                      {ch._count?.topics ?? 0} Topics
                    </button>
                  </td>

                  {/* Direct Content Count */}
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectChapter(ch, 'CONTENT')}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${
                        (ch._count?.contents ?? 0) > 0
                          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Manage Direct Chapter Materials"
                    >
                      <Video className="w-3 h-3 text-amber-600" />
                      {ch._count?.contents ?? 0} Materials
                    </button>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <StatusChip status={ch.status || 'ACTIVE'} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onAddContentToChapter(ch)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors shadow-2xs"
                        title="Add Direct Content to Chapter"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Content</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectChapter(ch)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        title="Manage Chapter"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditChapter(ch)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Chapter"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteChapter(ch)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Chapter"
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
