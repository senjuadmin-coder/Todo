import React, { useMemo, useState } from 'react';
import { Pin, Plus, Search, Trash2 } from 'lucide-react';
import { FocusSession, ProjectCategory, StudioNote, Task } from '../types';
import { formatMinutesReadable, formatShortDate } from '../utils/dates';

interface NotebookViewProps {
  notes: StudioNote[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onAddNote: (note: Omit<StudioNote, 'id' | 'updatedAt'>) => void;
  onUpdateNote: (noteId: string, patch: Partial<StudioNote>) => void;
  onDeleteNote: (noteId: string) => void;
  sessions: FocusSession[];
  tasks: Task[];
}

const CATEGORIES: ProjectCategory[] = [
  'Editorial',
  'Architecture',
  'Research',
  'Studio Admin',
  'Reading',
];

export const NotebookView: React.FC<NotebookViewProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  sessions,
  tasks,
}) => {
  const [subTab, setSubTab] = useState<'pages' | 'ledger'>('pages');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notes
      .filter((n) => (categoryFilter === 'All' ? true : n.category === categoryFilter))
      .filter((n) => {
        if (!q) return true;
        return (
          n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [notes, searchQuery, categoryFilter]);

  const activeNote =
    notes.find((n) => n.id === selectedNoteId) ?? filteredNotes[0] ?? null;

  const wordCount = useMemo(() => {
    if (!activeNote?.content.trim()) return 0;
    return activeNote.content.trim().split(/\s+/).length;
  }, [activeNote]);

  const completedTasks = useMemo(
    () => tasks.filter((t) => t.completed),
    [tasks]
  );

  const totalFocusMinutes = useMemo(
    () => sessions.reduce((acc, s) => acc + s.durationMinutes, 0),
    [sessions]
  );

  const handleCreateBlankPage = () => {
    onAddNote({
      title: 'Untitled Studio Note',
      category: 'Editorial',
      content: '',
      pinned: false,
    });
    setSubTab('pages');
  };

  return (
    <main className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 md:py-10">
      {/* Header */}
      <header className="pb-6 border-b border-[#D8D3C8] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-editorial text-[36px] md:text-[48px] leading-[1.12] tracking-[-0.02em] font-normal text-[#20211F]">
            Studio Notebook & Ledger
          </h1>
          <p className="mt-2 text-[14px] text-[#55433B] tabular-nums">
            {notes.length} bound pages · {sessions.length} deep work sessions (
            {formatMinutesReadable(totalFocusMinutes)})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#E8E4DA] rounded-[4px]">
            <button
              type="button"
              onClick={() => setSubTab('pages')}
              className={`px-3.5 py-1.5 text-[13px] font-medium rounded-[3px] whitespace-nowrap transition-colors ${
                subTab === 'pages'
                  ? 'bg-[#F4F1EA] text-[#20211F]'
                  : 'text-[#55433B] hover:text-[#20211F]'
              }`}
            >
              Linen Pages
            </button>
            <button
              type="button"
              onClick={() => setSubTab('ledger')}
              className={`px-3.5 py-1.5 text-[13px] font-medium rounded-[3px] whitespace-nowrap transition-colors ${
                subTab === 'ledger'
                  ? 'bg-[#F4F1EA] text-[#20211F]'
                  : 'text-[#55433B] hover:text-[#20211F]'
              }`}
            >
              Focus Ledger
            </button>
          </div>

          {subTab === 'pages' && (
            <button
              type="button"
              onClick={handleCreateBlankPage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] border border-[#D8D3C8] bg-[#FCF9F2] hover:bg-[#E8E4DA] text-[#20211F] text-[13px] font-medium rounded-[4px] whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Page</span>
            </button>
          )}
        </div>
      </header>

      {subTab === 'pages' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-0 mt-8">
          {/* 4-Column Page Index */}
          <aside
            aria-label="Notebook page index"
            className="lg:col-span-4 lg:pr-8 lg:border-r lg:border-[#D8D3C8] space-y-4"
          >
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#786A62] absolute left-0 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages..."
                aria-label="Search notebook pages"
                className="w-full pl-6 pr-2 py-2 bg-transparent border-b border-[#D8D3C8] focus:border-[#20211F] text-[13px] text-[#20211F]"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['All', ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-[3px] border transition-colors ${
                    categoryFilter === cat
                      ? 'bg-[#20211F] border-[#20211F] text-[#F4F1EA]'
                      : 'bg-transparent border-[#D8D3C8] text-[#55433B] hover:bg-[#E8E4DA]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <ul className="divide-y divide-[#D8D3C8] border-t border-b border-[#D8D3C8]">
              {filteredNotes.length === 0 ? (
                <li className="py-6 text-[13px] text-[#55433B]">
                  No pages match your current filter.
                </li>
              ) : (
                filteredNotes.map((note) => {
                  const selected = activeNote?.id === note.id;
                  return (
                    <li key={note.id}>
                      <button
                        type="button"
                        onClick={() => onSelectNote(note.id)}
                        className={`w-full text-left py-3.5 px-3 -mx-3 transition-colors ${
                          selected ? 'bg-[#E8E4DA]' : 'hover:bg-[#EFECE4]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-editorial text-[18px] leading-[24px] text-[#20211F]">
                            {note.title || 'Untitled Studio Note'}
                          </span>
                          {note.pinned && (
                            <Pin className="w-3.5 h-3.5 text-[#994618] shrink-0 mt-1" />
                          )}
                        </div>
                        <div className="mt-1 text-[12px] text-[#55433B] tabular-nums">
                          {note.category} · {formatShortDate(note.updatedAt.slice(0, 10))}
                        </div>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </aside>

          {/* 8-Column Writing Desk */}
          <section
            aria-label="Editorial writing pane"
            className="lg:col-span-8 lg:pl-10"
          >
            {activeNote ? (
              <div className="max-w-[70ch]">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#D8D3C8]">
                  <div className="flex items-center gap-3">
                    <select
                      aria-label="Page category"
                      value={activeNote.category}
                      onChange={(e) =>
                        onUpdateNote(activeNote.id, {
                          category: e.target.value as ProjectCategory,
                        })
                      }
                      className="bg-[#FCF9F2] border border-[#D8D3C8] rounded-[4px] px-2.5 py-1.5 text-[12px] text-[#20211F]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <span className="font-mono text-[12px] tabular-nums text-[#55433B]">
                      {wordCount} words
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateNote(activeNote.id, { pinned: !activeNote.pinned })
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-[4px] border transition-colors ${
                        activeNote.pinned
                          ? 'bg-[#FFDBCC] border-[#D97745] text-[#4D1B00]'
                          : 'border-[#D8D3C8] text-[#55433B] hover:bg-[#E8E4DA]'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span>{activeNote.pinned ? 'Pinned' : 'Pin Page'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteNote(activeNote.id)}
                      aria-label="Delete page"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-[#55433B] hover:text-[#BA1A1A] border border-[#D8D3C8] rounded-[4px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                <div className="pt-6">
                  <label htmlFor="note-title-input" className="sr-only">
                    Page title
                  </label>
                  <input
                    id="note-title-input"
                    type="text"
                    value={activeNote.title}
                    onChange={(e) =>
                      onUpdateNote(activeNote.id, { title: e.target.value })
                    }
                    className="w-full font-editorial text-[32px] md:text-[38px] leading-[1.2] tracking-[-0.015em] text-[#20211F] bg-transparent border-b border-transparent focus:border-[#D8D3C8] pb-2"
                  />

                  <label htmlFor="note-body-input" className="sr-only">
                    Page content
                  </label>
                  <textarea
                    id="note-body-input"
                    rows={16}
                    value={activeNote.content}
                    onChange={(e) =>
                      onUpdateNote(activeNote.id, { content: e.target.value })
                    }
                    placeholder="Write in unhurried prose..."
                    className="mt-4 w-full bg-transparent text-[16px] leading-[28px] text-[#20211F] placeholder:text-[#786A62] focus:outline-none resize-y"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-[#E8E4DA] border border-[#D8D3C8] rounded-[4px] p-8 text-center">
                <p className="font-editorial text-[24px] text-[#20211F]">
                  Your notebook is open
                </p>
                <p className="mt-2 text-[14px] text-[#55433B]">
                  Create a new page to record architectural field notes, essays, or studio briefs.
                </p>
                <button
                  type="button"
                  onClick={handleCreateBlankPage}
                  className="mt-4 px-4 py-2 bg-[#994618] text-[#F4F1EA] text-[13px] font-medium rounded-[4px]"
                >
                  Create First Page
                </button>
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Focus & Completion Ledger */
        <section aria-label="Focus and task ledger" className="mt-8 space-y-10">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#D8D3C8] divide-y sm:divide-y-0 sm:divide-x divide-[#D8D3C8] bg-[#FCF9F2]">
            <div className="p-5">
              <div className="text-[12px] font-medium text-[#55433B]">
                Total Focus Time Logged
              </div>
              <div className="mt-2 font-editorial text-[34px] text-[#20211F] tabular-nums">
                {formatMinutesReadable(totalFocusMinutes)}
              </div>
            </div>
            <div className="p-5">
              <div className="text-[12px] font-medium text-[#55433B]">
                Deep Work Blocks Completed
              </div>
              <div className="mt-2 font-editorial text-[34px] text-[#20211F] tabular-nums">
                {sessions.length}
              </div>
            </div>
            <div className="p-5">
              <div className="text-[12px] font-medium text-[#55433B]">
                Tasks Finished
              </div>
              <div className="mt-2 font-editorial text-[34px] text-[#20211F] tabular-nums">
                {completedTasks.length}
              </div>
            </div>
          </div>

          {/* Focus Sessions Table */}
          <div>
            <h2 className="font-editorial text-[24px] text-[#20211F] mb-4">
              Recorded Focus Sessions
            </h2>
            <div className="overflow-x-auto border border-[#D8D3C8] bg-[#FCF9F2]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D8D3C8] bg-[#E8E4DA] text-[12px] font-medium text-[#55433B]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Commitment / Focus</th>
                    <th className="py-3 px-4">Area</th>
                    <th className="py-3 px-4">Reflection</th>
                    <th className="py-3 px-4 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D3C8] text-[13px]">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F4F1EA]">
                      <td className="py-3.5 px-4 text-[#55433B] whitespace-nowrap tabular-nums">
                        {formatShortDate(s.completedAt.slice(0, 10))}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#20211F]">
                        {s.taskTitle}
                      </td>
                      <td className="py-3.5 px-4 text-[#55433B] whitespace-nowrap">
                        {s.category}
                      </td>
                      <td className="py-3.5 px-4 text-[#55433B]">
                        {s.reflection || s.intention || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#20211F] whitespace-nowrap">
                        {s.durationMinutes}m
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};
