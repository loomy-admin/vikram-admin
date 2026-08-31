import React from 'react';
import { ChevronRight, Home, BookOpen, Layers, FileText } from 'lucide-react';
import { SubjectItem, ChapterItem, TopicItem } from '../../../types';

export type DrillDownLevel = 'SUBJECTS' | 'CHAPTERS' | 'TOPICS' | 'CONTENT';

interface CurriculumBreadcrumbsProps {
  currentLevel: DrillDownLevel;
  className?: string;
  selectedSubject: SubjectItem | null;
  selectedChapter: ChapterItem | null;
  selectedTopic: TopicItem | null;
  onNavigate: (level: DrillDownLevel) => void;
}

export const CurriculumBreadcrumbs: React.FC<CurriculumBreadcrumbsProps> = ({
  currentLevel,
  className,
  selectedSubject,
  selectedChapter,
  selectedTopic,
  onNavigate,
}) => {
  return (
    <nav className={`bg-white border border-slate-200/90 shadow-xs px-4 py-2.5 rounded-xl flex items-center gap-2 overflow-x-auto text-xs ${className || ''}`}>
      {/* Root Level: All Subjects */}
      <button
        type="button"
        onClick={() => onNavigate('SUBJECTS')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
          currentLevel === 'SUBJECTS'
            ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-2xs'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
        }`}
      >
        <Home className={`w-3.5 h-3.5 ${currentLevel === 'SUBJECTS' ? 'text-blue-600' : 'text-slate-400'}`} />
        <span>Subjects</span>
      </button>

      {/* Subject Level Segment */}
      {selectedSubject && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <button
            type="button"
            onClick={() => onNavigate('CHAPTERS')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              currentLevel === 'CHAPTERS'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${currentLevel === 'CHAPTERS' ? 'text-blue-600' : 'text-blue-500'}`} />
            <span>{selectedSubject.name}</span>
          </button>
        </>
      )}

      {/* Chapter Level Segment */}
      {selectedChapter && (currentLevel === 'TOPICS' || currentLevel === 'CONTENT') && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <button
            type="button"
            onClick={() => onNavigate('TOPICS')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              currentLevel === 'TOPICS'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${currentLevel === 'TOPICS' ? 'text-emerald-600' : 'text-emerald-500'}`} />
            <span>{selectedChapter.name}</span>
          </button>
        </>
      )}

      {/* Topic Level Segment */}
      {selectedTopic && currentLevel === 'CONTENT' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 font-bold rounded-lg whitespace-nowrap shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>{selectedTopic.name}</span>
          </div>
        </>
      )}
    </nav>
  );
};
