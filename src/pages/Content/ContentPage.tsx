import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Video, FileText } from 'lucide-react';
import {
  ClassItem,
  SubjectItem,
  ChapterItem,
  TopicItem,
  ContentItem,
  CreateSubjectPayload,
  UpdateSubjectPayload,
  CreateChapterPayload,
  UpdateChapterPayload,
  CreateTopicPayload,
  UpdateTopicPayload,
  CreateContentPayload,
  UpdateContentPayload,
} from '../../types';
import { contentApi } from '../../api/contentApi';
import { subjectsApi } from '../../api/subjectsApi';
import { chaptersApi } from '../../api/chaptersApi';
import { topicsApi } from '../../api/topicsApi';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { SubjectFormDialog } from '../../components/forms/SubjectFormDialog';
import { ChapterFormDialog } from '../../components/forms/ChapterFormDialog';
import { TopicFormDialog } from '../../components/forms/TopicFormDialog';
import { ContentFormDialog } from '../../components/forms/ContentFormDialog';
import { ClassManagerDrawer } from '../../components/forms/ClassManagerDrawer';
import { ContentPreviewDialog } from '../../components/dialogs/ContentPreviewDialog';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/axios';

// Drill-Down Components
import { CurriculumBreadcrumbs, DrillDownLevel } from './components/CurriculumBreadcrumbs';
import { SubjectsTableView } from './components/SubjectsTableView';
import { ChaptersTableView } from './components/ChaptersTableView';
import { TopicsTableView } from './components/TopicsTableView';
import { ContentTableView } from './components/ContentTableView';

// Native URL Parameter Helpers for State Persistence on Page Reload
const getUrlParam = (key: string): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
};

const updateUrlParams = (updates: Record<string, string | number | null | undefined>) => {
  const url = new URL(window.location.href);
  Object.entries(updates).forEach(([key, val]) => {
    if (val !== null && val !== undefined && val !== '') {
      url.searchParams.set(key, String(val));
    } else {
      url.searchParams.delete(key);
    }
  });
  window.history.replaceState(null, '', url.toString());
};

export const ContentPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  // Active Drill-Down Navigation Level (persisted in URL)
  const [currentLevel, setCurrentLevel] = useState<DrillDownLevel>(
    (getUrlParam('level') as DrillDownLevel) || 'SUBJECTS'
  );

  // Selection States (persisted in URL)
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(
    getUrlParam('classId') ? Number(getUrlParam('classId')) : null
  );

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);

  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<ChapterItem | null>(null);

  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicItem | null>(null);

  const [contents, setContents] = useState<ContentItem[]>([]);

  // Chapter-level Direct Content & Tab state
  const [chapterActiveTab, setChapterActiveTab] = useState<'TOPICS' | 'CONTENT'>(
    (getUrlParam('chapterTab') as 'TOPICS' | 'CONTENT') || 'TOPICS'
  );
  const [chapterDirectContents, setChapterDirectContents] = useState<ContentItem[]>([]);
  const [isLoadingDirectContents, setIsLoadingDirectContents] = useState(false);

  // Loading States
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingContents, setIsLoadingContents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [isClassDrawerOpen, setIsClassDrawerOpen] = useState(false);
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<SubjectItem | null>(null);

  const [isChapterFormOpen, setIsChapterFormOpen] = useState(false);
  const [chapterToEdit, setChapterToEdit] = useState<ChapterItem | null>(null);

  const [isTopicFormOpen, setIsTopicFormOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<TopicItem | null>(null);

  const [isContentFormOpen, setIsContentFormOpen] = useState(false);
  const [contentToEdit, setContentToEdit] = useState<ContentItem | null>(null);

  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);

  // Delete Target State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'subject' | 'chapter' | 'topic' | 'content';
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fetch Classes (runs on mount)
  const fetchClasses = useCallback(async () => {
    setIsLoadingClasses(true);
    try {
      const data = await contentApi.getClasses();
      setClasses(data);

      const urlClassId = getUrlParam('classId') ? Number(getUrlParam('classId')) : null;
      const initialClassId = urlClassId && data.some((c) => c.id === urlClassId) ? urlClassId : data[0]?.id || null;

      setSelectedClassId(initialClassId);
      if (initialClassId) {
        updateUrlParams({ classId: initialClassId });
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load classes'));
    } finally {
      setIsLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // 2. Fetch Subjects when selectedClassId changes
  const fetchSubjects = useCallback(async () => {
    if (!selectedClassId) return;
    setIsLoadingSubjects(true);
    try {
      const data = await subjectsApi.getSubjectsByClass(selectedClassId);
      setSubjects(data);

      // Restore subject from URL if present
      const urlSubjectId = getUrlParam('subjectId') ? Number(getUrlParam('subjectId')) : null;
      if (urlSubjectId) {
        const foundSub = data.find((s) => s.id === urlSubjectId);
        if (foundSub) {
          setSelectedSubject(foundSub);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load subjects'));
    } finally {
      setIsLoadingSubjects(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // 3. Fetch Chapters when selectedSubject changes
  const fetchChapters = useCallback(async () => {
    if (!selectedSubject) {
      setChapters([]);
      return;
    }
    setIsLoadingChapters(true);
    try {
      const data = await chaptersApi.getChaptersBySubject(selectedSubject.id);
      setChapters(data);

      // Restore chapter from URL if present
      const urlChapterId = getUrlParam('chapterId') ? Number(getUrlParam('chapterId')) : null;
      if (urlChapterId) {
        const foundCh = data.find((c) => c.id === urlChapterId);
        if (foundCh) {
          setSelectedChapter(foundCh);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load chapters'));
    } finally {
      setIsLoadingChapters(false);
    }
  }, [selectedSubject]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  // 4. Fetch Topics when selectedChapter changes
  const fetchTopics = useCallback(async () => {
    if (!selectedChapter) {
      setTopics([]);
      return;
    }
    setIsLoadingTopics(true);
    try {
      const data = await topicsApi.getTopicsByChapter(selectedChapter.id);
      setTopics(data);

      // Restore topic from URL if present
      const urlTopicId = getUrlParam('topicId') ? Number(getUrlParam('topicId')) : null;
      if (urlTopicId) {
        const foundTopic = data.find((t) => t.id === urlTopicId);
        if (foundTopic) {
          setSelectedTopic(foundTopic);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load topics'));
    } finally {
      setIsLoadingTopics(false);
    }
  }, [selectedChapter]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // 5. Fetch Content when selectedTopic changes
  const fetchContents = useCallback(async () => {
    if (!selectedTopic) {
      setContents([]);
      return;
    }
    setIsLoadingContents(true);
    try {
      const data = await contentApi.getContentByTopic(selectedTopic.id);
      setContents(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load learning resources'));
    } finally {
      setIsLoadingContents(false);
    }
  }, [selectedTopic]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  // 6. Fetch Chapter Direct Content when selectedChapter changes
  const fetchChapterDirectContents = useCallback(async () => {
    if (!selectedChapter) {
      setChapterDirectContents([]);
      return;
    }
    setIsLoadingDirectContents(true);
    try {
      const data = await contentApi.getContentByChapter(selectedChapter.id);
      setChapterDirectContents(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load chapter direct content'));
    } finally {
      setIsLoadingDirectContents(false);
    }
  }, [selectedChapter]);

  useEffect(() => {
    fetchChapterDirectContents();
  }, [fetchChapterDirectContents]);

  // --------------------------------------------------------
  // REORDER HANDLERS (Dynamic Order Update)
  // --------------------------------------------------------
  const handleMoveSubject = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= subjects.length) return;

    const newSubjects = [...subjects];
    const [moved] = newSubjects.splice(index, 1);
    newSubjects.splice(newIndex, 0, moved);
    setSubjects(newSubjects);

    try {
      await Promise.all(
        newSubjects.map((sub, idx) =>
          subjectsApi.updateSubject(sub.id, { order: idx + 1 })
        )
      );
      showSuccess('Subject order updated');
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save subject order'));
    }
  };

  const handleSubjectDrop = async (dragIndex: number, dropIndex: number) => {
    if (dragIndex === dropIndex) return;
    const newSubjects = [...subjects];
    const [draggedItem] = newSubjects.splice(dragIndex, 1);
    newSubjects.splice(dropIndex, 0, draggedItem);
    setSubjects(newSubjects);

    try {
      await Promise.all(
        newSubjects.map((sub, idx) =>
          subjectsApi.updateSubject(sub.id, { order: idx + 1 })
        )
      );
      showSuccess('Subject reordered');
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save subject order'));
    }
  };

  const handleMoveChapter = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= chapters.length) return;

    const newChapters = [...chapters];
    const [moved] = newChapters.splice(index, 1);
    newChapters.splice(newIndex, 0, moved);
    setChapters(newChapters);

    try {
      await Promise.all(
        newChapters.map((ch, idx) =>
          chaptersApi.updateChapter(ch.id, { order: idx + 1 })
        )
      );
      showSuccess('Chapter order updated');
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save chapter order'));
    }
  };

  const handleChapterDrop = async (dragIndex: number, dropIndex: number) => {
    if (dragIndex === dropIndex) return;
    const newChapters = [...chapters];
    const [draggedItem] = newChapters.splice(dragIndex, 1);
    newChapters.splice(dropIndex, 0, draggedItem);
    setChapters(newChapters);

    try {
      await Promise.all(
        newChapters.map((ch, idx) =>
          chaptersApi.updateChapter(ch.id, { order: idx + 1 })
        )
      );
      showSuccess('Chapter reordered');
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save chapter order'));
    }
  };

  const handleMoveTopic = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= topics.length) return;

    const newTopics = [...topics];
    const [moved] = newTopics.splice(index, 1);
    newTopics.splice(newIndex, 0, moved);
    setTopics(newTopics);

    try {
      await Promise.all(
        newTopics.map((t, idx) =>
          topicsApi.updateTopic(t.id, { order: idx + 1 })
        )
      );
      showSuccess('Topic order updated');
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save topic order'));
    }
  };

  const handleTopicDrop = async (dragIndex: number, dropIndex: number) => {
    if (dragIndex === dropIndex) return;
    const newTopics = [...topics];
    const [draggedItem] = newTopics.splice(dragIndex, 1);
    newTopics.splice(dropIndex, 0, draggedItem);
    setTopics(newTopics);

    try {
      await Promise.all(
        newTopics.map((t, idx) =>
          topicsApi.updateTopic(t.id, { order: idx + 1 })
        )
      );
      showSuccess('Topic reordered');
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save topic order'));
    }
  };

  const handleMoveContent = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= contents.length) return;

    const newContents = [...contents];
    const [moved] = newContents.splice(index, 1);
    newContents.splice(newIndex, 0, moved);
    setContents(newContents);

    try {
      await Promise.all(
        newContents.map((c, idx) =>
          contentApi.updateContent(c.id, { order: idx + 1 })
        )
      );
      showSuccess('Content order updated');
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save content order'));
    }
  };

  const handleContentDrop = async (dragIndex: number, dropIndex: number) => {
    if (dragIndex === dropIndex) return;
    const newContents = [...contents];
    const [draggedItem] = newContents.splice(dragIndex, 1);
    newContents.splice(dropIndex, 0, draggedItem);
    setContents(newContents);

    try {
      await Promise.all(
        newContents.map((c, idx) =>
          contentApi.updateContent(c.id, { order: idx + 1 })
        )
      );
      showSuccess('Content reordered');
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save content order'));
    }
  };

  const handleMoveDirectContent = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= chapterDirectContents.length) return;

    const newContents = [...chapterDirectContents];
    const [moved] = newContents.splice(index, 1);
    newContents.splice(newIndex, 0, moved);
    setChapterDirectContents(newContents);

    try {
      await Promise.all(
        newContents.map((c, idx) =>
          contentApi.updateContent(c.id, { order: idx + 1 })
        )
      );
      showSuccess('Direct content order updated');
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save content order'));
    }
  };

  const handleDirectContentDrop = async (dragIndex: number, dropIndex: number) => {
    if (dragIndex === dropIndex) return;
    const newContents = [...chapterDirectContents];
    const [draggedItem] = newContents.splice(dragIndex, 1);
    newContents.splice(dropIndex, 0, draggedItem);
    setChapterDirectContents(newContents);

    try {
      await Promise.all(
        newContents.map((c, idx) =>
          contentApi.updateContent(c.id, { order: idx + 1 })
        )
      );
      showSuccess('Direct content reordered');
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save content order'));
    }
  };

  // --------------------------------------------------------
  // CRUD SAVE HANDLERS
  // --------------------------------------------------------
  const handleSaveSubject = async (payload: CreateSubjectPayload | UpdateSubjectPayload) => {
    try {
      if (subjectToEdit) {
        await subjectsApi.updateSubject(subjectToEdit.id, payload as UpdateSubjectPayload);
        showSuccess('Subject updated successfully');
      } else {
        await subjectsApi.createSubject(payload as CreateSubjectPayload);
        showSuccess('Subject created successfully');
      }
      setIsSubjectFormOpen(false);
      setSubjectToEdit(null);
      fetchSubjects();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save subject'));
    }
  };

  const handleSaveChapter = async (payload: CreateChapterPayload | UpdateChapterPayload) => {
    try {
      if (chapterToEdit) {
        await chaptersApi.updateChapter(chapterToEdit.id, payload as UpdateChapterPayload);
        showSuccess('Chapter updated successfully');
      } else {
        await chaptersApi.createChapter(payload as CreateChapterPayload);
        showSuccess('Chapter created successfully');
      }
      setIsChapterFormOpen(false);
      setChapterToEdit(null);
      fetchChapters();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save chapter'));
    }
  };

  const handleSaveTopic = async (payload: CreateTopicPayload | UpdateTopicPayload) => {
    try {
      if (topicToEdit) {
        await topicsApi.updateTopic(topicToEdit.id, payload as UpdateTopicPayload);
        showSuccess('Topic updated successfully');
      } else {
        await topicsApi.createTopic(payload as CreateTopicPayload);
        showSuccess('Topic created successfully');
      }
      setIsTopicFormOpen(false);
      setTopicToEdit(null);
      fetchTopics();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save topic'));
    }
  };

  const handleSaveContent = async (payload: CreateContentPayload | UpdateContentPayload) => {
    try {
      if (contentToEdit) {
        await contentApi.updateContent(contentToEdit.id, payload as UpdateContentPayload);
        showSuccess('Content updated successfully');
      } else {
        await contentApi.createContent(payload as CreateContentPayload);
        showSuccess('Content created successfully');
      }
      setIsContentFormOpen(false);
      setContentToEdit(null);
      if (selectedTopic) {
        fetchContents();
      }
      if (selectedChapter) {
        fetchChapterDirectContents();
        fetchChapters();
      }
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to save content'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'subject') {
        await subjectsApi.deleteSubject(deleteTarget.id);
        showSuccess(`Subject "${deleteTarget.name}" deleted`);
        if (selectedSubject?.id === deleteTarget.id) {
          setSelectedSubject(null);
          setCurrentLevel('SUBJECTS');
          updateUrlParams({ subjectId: null, chapterId: null, topicId: null, level: 'SUBJECTS' });
        }
        fetchSubjects();
      } else if (deleteTarget.type === 'chapter') {
        await chaptersApi.deleteChapter(deleteTarget.id);
        showSuccess(`Chapter "${deleteTarget.name}" deleted`);
        if (selectedChapter?.id === deleteTarget.id) {
          setSelectedChapter(null);
          setCurrentLevel('CHAPTERS');
          updateUrlParams({ chapterId: null, topicId: null, level: 'CHAPTERS' });
        }
        fetchChapters();
      } else if (deleteTarget.type === 'topic') {
        await topicsApi.deleteTopic(deleteTarget.id);
        showSuccess(`Topic "${deleteTarget.name}" deleted`);
        if (selectedTopic?.id === deleteTarget.id) {
          setSelectedTopic(null);
          setCurrentLevel('TOPICS');
          updateUrlParams({ topicId: null, level: 'TOPICS' });
        }
        fetchTopics();
      } else if (deleteTarget.type === 'content') {
        await contentApi.deleteContent(deleteTarget.id);
        showSuccess(`Content "${deleteTarget.name}" deleted`);
        if (selectedTopic) {
          fetchContents();
        }
        if (selectedChapter) {
          fetchChapterDirectContents();
          fetchChapters();
        }
      }
    } catch (err) {
      showError(getErrorMessage(err, `Failed to delete ${deleteTarget.type}`));
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Switch Class
  const handleSelectClass = (classId: number) => {
    setSelectedClassId(classId);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSelectedTopic(null);
    setCurrentLevel('SUBJECTS');
    updateUrlParams({ classId, subjectId: null, chapterId: null, topicId: null, level: 'SUBJECTS' });
  };

  // Drill-down Level Navigator
  const handleNavigateLevel = (level: DrillDownLevel) => {
    setCurrentLevel(level);
    if (level === 'SUBJECTS') {
      setSelectedSubject(null);
      setSelectedChapter(null);
      setSelectedTopic(null);
      updateUrlParams({ subjectId: null, chapterId: null, topicId: null, level: 'SUBJECTS' });
    } else if (level === 'CHAPTERS') {
      setSelectedChapter(null);
      setSelectedTopic(null);
      updateUrlParams({ chapterId: null, topicId: null, level: 'CHAPTERS' });
    } else if (level === 'TOPICS') {
      setSelectedTopic(null);
      updateUrlParams({ topicId: null, level: 'TOPICS' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Curriculum & Content Management
          </h1>
          <p className="text-sm text-slate-500">
            Enterprise drill-down management for Subjects, Chapters, Topics, and Media Resources
          </p>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Class Selector Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-x-auto flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-2 shrink-0">
            Select Class:
          </span>
          {isLoadingClasses ? (
            <div className="h-8 bg-slate-100 rounded-lg w-48 animate-pulse" />
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              {classes.map((cls) => {
                const isSelected = selectedClassId === cls.id;
                return (
                  <button
                    key={cls.id}
                    onClick={() => handleSelectClass(cls.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cls.grade > 0 ? `${cls.name} (Grade ${cls.grade})` : cls.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsClassDrawerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors shadow-2xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Manage Classes
        </button>
      </div>

      {/* Interactive Breadcrumb Navigation Bar */}
      <CurriculumBreadcrumbs
        currentLevel={currentLevel}
        selectedSubject={selectedSubject}
        selectedChapter={selectedChapter}
        selectedTopic={selectedTopic}
        onNavigate={handleNavigateLevel}
      />

      {/* Active Drill-Down Data Table View */}
      {currentLevel === 'SUBJECTS' && (
        <SubjectsTableView
          subjects={subjects}
          isLoading={isLoadingSubjects}
          onSelectSubject={(subject) => {
            setSelectedSubject(subject);
            setSelectedChapter(null);
            setSelectedTopic(null);
            setCurrentLevel('CHAPTERS');
            updateUrlParams({ subjectId: subject.id, chapterId: null, topicId: null, level: 'CHAPTERS' });
          }}
          onAddSubject={() => {
            setSubjectToEdit(null);
            setIsSubjectFormOpen(true);
          }}
          onEditSubject={(subject) => {
            setSubjectToEdit(subject);
            setIsSubjectFormOpen(true);
          }}
          onDeleteSubject={(subject) => {
            setDeleteTarget({ type: 'subject', id: subject.id, name: subject.name });
          }}
          onReorder={handleMoveSubject}
          onDragDrop={handleSubjectDrop}
        />
      )}

      {currentLevel === 'CHAPTERS' && selectedSubject && (
        <ChaptersTableView
          subject={selectedSubject}
          chapters={chapters}
          isLoading={isLoadingChapters}
          onSelectChapter={(chapter, tab) => {
            setSelectedChapter(chapter);
            setSelectedTopic(null);
            const activeTab = tab || 'TOPICS';
            setChapterActiveTab(activeTab);
            setCurrentLevel('TOPICS');
            updateUrlParams({
              chapterId: chapter.id,
              topicId: null,
              level: 'TOPICS',
              chapterTab: activeTab,
            });
          }}
          onAddContentToChapter={(chapter) => {
            setSelectedChapter(chapter);
            setSelectedTopic(null);
            setContentToEdit(null);
            setChapterActiveTab('CONTENT');
            setIsContentFormOpen(true);
          }}
          onAddChapter={() => {
            setChapterToEdit(null);
            setIsChapterFormOpen(true);
          }}
          onEditChapter={(chapter) => {
            setChapterToEdit(chapter);
            setIsChapterFormOpen(true);
          }}
          onDeleteChapter={(chapter) => {
            setDeleteTarget({ type: 'chapter', id: chapter.id, name: chapter.name });
          }}
          onReorder={handleMoveChapter}
          onDragDrop={handleChapterDrop}
        />
      )}

      {currentLevel === 'TOPICS' && selectedChapter && (
        <div className="space-y-4">
          {/* Chapter Sub-Navigation Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setChapterActiveTab('TOPICS');
                  updateUrlParams({ chapterTab: 'TOPICS' });
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  chapterActiveTab === 'TOPICS'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Topics ({topics.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setChapterActiveTab('CONTENT');
                  updateUrlParams({ chapterTab: 'CONTENT' });
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  chapterActiveTab === 'CONTENT'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Direct Content ({chapterDirectContents.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedTopic(null);
                  setContentToEdit(null);
                  setChapterActiveTab('CONTENT');
                  setIsContentFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                Add Direct Content
              </button>
            </div>
          </div>

          {/* Show TopicsTableView if Topics tab active */}
          {chapterActiveTab === 'TOPICS' && (
            <TopicsTableView
              chapter={selectedChapter}
              topics={topics}
              isLoading={isLoadingTopics}
              onSelectTopic={(topic) => {
                setSelectedTopic(topic);
                setCurrentLevel('CONTENT');
                updateUrlParams({ topicId: topic.id, level: 'CONTENT' });
              }}
              onAddTopic={() => {
                setTopicToEdit(null);
                setIsTopicFormOpen(true);
              }}
              onEditTopic={(topic) => {
                setTopicToEdit(topic);
                setIsTopicFormOpen(true);
              }}
              onDeleteTopic={(topic) => {
                setDeleteTarget({ type: 'topic', id: topic.id, name: topic.name });
              }}
              onReorder={handleMoveTopic}
              onDragDrop={handleTopicDrop}
            />
          )}

          {/* Show ContentTableView for direct chapter content if Content tab active */}
          {chapterActiveTab === 'CONTENT' && (
            <ContentTableView
              chapter={selectedChapter}
              contents={chapterDirectContents}
              isLoading={isLoadingDirectContents}
              onAddContent={() => {
                setSelectedTopic(null);
                setContentToEdit(null);
                setIsContentFormOpen(true);
              }}
              onEditContent={(content) => {
                setSelectedTopic(null);
                setContentToEdit(content);
                setIsContentFormOpen(true);
              }}
              onDeleteContent={(content) => {
                setDeleteTarget({ type: 'content', id: content.id, name: content.title });
              }}
              onPreviewContent={(content) => setPreviewContent(content)}
              onReorder={handleMoveDirectContent}
              onDragDrop={handleDirectContentDrop}
            />
          )}
        </div>
      )}

      {currentLevel === 'CONTENT' && selectedTopic && (
        <ContentTableView
          topic={selectedTopic}
          contents={contents}
          isLoading={isLoadingContents}
          onAddContent={() => {
            setContentToEdit(null);
            setIsContentFormOpen(true);
          }}
          onEditContent={(content) => {
            setContentToEdit(content);
            setIsContentFormOpen(true);
          }}
          onDeleteContent={(content) => {
            setDeleteTarget({ type: 'content', id: content.id, name: content.title });
          }}
          onPreviewContent={(content) => setPreviewContent(content)}
          onReorder={handleMoveContent}
          onDragDrop={handleContentDrop}
        />
      )}

      {/* Subject Dialog */}
      {selectedClassId && (
        <SubjectFormDialog
          isOpen={isSubjectFormOpen}
          onClose={() => {
            setIsSubjectFormOpen(false);
            setSubjectToEdit(null);
          }}
          onSubmit={handleSaveSubject}
          subjectToEdit={subjectToEdit}
          classes={classes}
          defaultClassId={selectedClassId}
        />
      )}

      {/* Chapter Dialog */}
      {selectedSubject && (
        <ChapterFormDialog
          isOpen={isChapterFormOpen}
          onClose={() => {
            setIsChapterFormOpen(false);
            setChapterToEdit(null);
          }}
          onSubmit={handleSaveChapter}
          chapterToEdit={chapterToEdit}
          subject={selectedSubject}
        />
      )}

      {/* Topic Dialog */}
      {selectedChapter && (
        <TopicFormDialog
          isOpen={isTopicFormOpen}
          onClose={() => {
            setIsTopicFormOpen(false);
            setTopicToEdit(null);
          }}
          onSubmit={handleSaveTopic}
          topicToEdit={topicToEdit}
          chapter={selectedChapter}
        />
      )}

      {/* Content Dialog */}
      {(selectedTopic || selectedChapter) && (
        <ContentFormDialog
          isOpen={isContentFormOpen}
          onClose={() => {
            setIsContentFormOpen(false);
            setContentToEdit(null);
          }}
          onSubmit={handleSaveContent}
          contentToEdit={contentToEdit}
          topic={selectedTopic}
          chapter={!selectedTopic ? selectedChapter : null}
        />
      )}

      {/* Preview Dialog */}
      <ContentPreviewDialog
        isOpen={!!previewContent}
        onClose={() => setPreviewContent(null)}
        content={previewContent}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.type}`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Class Manager Drawer */}
      <ClassManagerDrawer
        isOpen={isClassDrawerOpen}
        onClose={() => setIsClassDrawerOpen(false)}
        classes={classes}
        onRefresh={fetchClasses}
      />
    </div>
  );
};
