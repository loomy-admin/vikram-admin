import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronRight,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Video,
} from 'lucide-react';
import { TopicItem, ChapterItem } from '../../../types';
import { StatusChip } from '../../../components/common/StatusChip';

interface TopicsTableViewProps {
  chapter: ChapterItem;
  topics: TopicItem[];
  isLoading: boolean;
  onSelectTopic: (topic: TopicItem) => void;
  onAddTopic: () => void;
  onEditTopic: (topic: TopicItem) => void;
  onDeleteTopic: (topic: TopicItem) => void;
  onReorder: (index: number, direction: 'up' | 'down') => void;
  onDragDrop: (dragIndex: number, dropIndex: number) => void;
}

export const TopicsTableView: React.FC<TopicsTableViewProps> = ({
  chapter,
  topics,
  isLoading,
  onSelectTopic,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onReorder,
  onDragDrop,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const filteredTopics = topics.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <div className="p-2 rounded-lg bg-red-50 text-red-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Topics for <span className="text-emerald-600 font-extrabold">{chapter.name}</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                {filteredTopics.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500">Manage lesson topics and learning objectives</p>
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
              placeholder="Search topics..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <button
            onClick={onAddTopic}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Topic
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
      ) : filteredTopics.length === 0 ? (
        <div className="p-10 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            {topics.length === 0 ? `No topics found for "${chapter.name}"` : 'No topics matching search'}
          </p>
          <button
            onClick={onAddTopic}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Topic
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3 w-10 text-center">Reorder</th>
                <th className="py-3 px-4">Topic Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Learning Materials</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTopics.map((topic, idx) => (
                <tr
                  key={topic.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={() => setDraggedIdx(null)}
                  className={`hover:bg-red-50/40 transition-colors ${
                    draggedIdx === idx ? 'opacity-40 bg-red-50 border-dashed border-red-400' : ''
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
                          className="text-slate-400 hover:text-red-600 disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === filteredTopics.length - 1}
                          onClick={() => onReorder(idx, 'down')}
                          className="text-slate-400 hover:text-red-600 disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Topic Name & Image */}
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <button
                      type="button"
                      onClick={() => onSelectTopic(topic)}
                      className="hover:text-red-600 inline-flex items-center gap-2.5 text-left"
                    >
                      {topic.imageUrl ? (
                        <img
                          src={topic.imageUrl}
                          alt={topic.name}
                          className="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-200 p-0.5 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <span className="hover:underline">{topic.name}</span>
                    </button>
                  </td>

                  {/* Description */}
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                    {topic.description || '—'}
                  </td>

                  {/* Content Count */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      <Video className="w-3 h-3 text-slate-500" />
                      {topic._count?.contents ?? 0} Materials
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <StatusChip status={topic.status || 'ACTIVE'} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectTopic(topic)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <span>View Content</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditTopic(topic)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Topic"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteTopic(topic)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Topic"
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
