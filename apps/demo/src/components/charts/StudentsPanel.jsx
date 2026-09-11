import { useState, useMemo, useCallback, useEffect } from 'react';
import { STUDENTS } from '../../utils/studentData';
import { GROUPS, SUBJECTS, GRADES, COMPETENCE_LEVELS } from '../../utils/constants';
import {
  loadCustomGroups,
  createCustomGroup,
  addStudentsToGroup,
  setGroupMembers,
  deleteCustomGroup,
  renameCustomGroup,
} from '../../utils/customGroupsStore';
import { useFilters } from '../../context/FilterContext';

import Card from '../common/Card';
import AutoGroupingCard from './AutoGroupingCard';
import StudentMapCard from './StudentMapCard';

// ── Small reusable pieces ─────────────────────────────────────────────────────

const LevelBadge = ({ level, small }) => {
  const cfg = COMPETENCE_LEVELS[level];
  if (!cfg) return null;
  return (
    <span
      className={`inline-block font-bold rounded text-white ${small ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5'}`}
      style={{ backgroundColor: cfg.color }}
    >
      {level}
    </span>
  );
};

const SubjectTag = ({ subject }) => {
  const s = SUBJECTS[subject];
  return (
    <span
      className="text-xs px-1.5 py-0.5 rounded text-white font-medium"
      style={{ backgroundColor: s?.color ?? '#6b7280' }}
    >
      {s?.name ?? subject}
    </span>
  );
};

// ── Student row ───────────────────────────────────────────────────────────────

const StudentRow = ({ student, selected, onToggle, onDetail }) => {
  const group = GROUPS.find((g) => g.id === student.classGroupId);
  const { observerMode } = useFilters();
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 transition-colors rounded-md ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(student.id)}
        className="w-4 h-4 accent-blue-600 flex-shrink-0 cursor-pointer"
      />
      <label className="flex-1 min-w-0 cursor-pointer" onClick={() => onToggle(student.id)}>
        <span className={`font-medium text-sm text-gray-900 ${observerMode ? 'blur select-none' : ''}`}>
          {student.firstName} {student.lastName}
        </span>
        <span className="ml-2 text-xs text-gray-400">{group?.name}</span>
      </label>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <SubjectTag subject={student.subject} />
        <span className="text-xs text-gray-400">{GRADES[student.grade]?.name}</span>
        <LevelBadge level={student.competenceLevel} />
        <button
          onClick={() => onDetail(student)}
          title="Datenblatt anzeigen"
          className="ml-1 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-blue-50"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Datenblatt
        </button>
      </div>
    </div>
  );
};

// ── Custom group card ─────────────────────────────────────────────────────────

const LEVEL_KEYS = ['I', 'II', 'III', 'IV', 'V'];

const CustomGroupCard = ({ group, onSaveMembers, onDelete, onRename, onNavigateMaterials, onDetail }) => {
  const [renamingName, setRenamingName] = useState(false);
  const [nameInput, setNameInput] = useState(group.name);
  const { observerMode } = useFilters();
  const [editingMembers, setEditingMembers] = useState(false);

  // Draft state for the member editor (Set of student IDs)
  const [draft, setDraft] = useState(new Set());
  const [editorSearch, setEditorSearch] = useState('');
  const [editorClass, setEditorClass] = useState('');
  const [editorLevel, setEditorLevel] = useState('');

  const members = group.studentIds.map((id) => STUDENTS.find((s) => s.id === id)).filter(Boolean);

  const levelCounts = members.reduce((acc, s) => {
    acc[s.competenceLevel] = (acc[s.competenceLevel] || 0) + 1;
    return acc;
  }, {});

  // Filtered student list for the editor
  const editorStudents = useMemo(() => {
    const q = editorSearch.toLowerCase();
    return STUDENTS.filter((s) => {
      if (editorClass && s.classGroupId !== editorClass) return false;
      if (editorLevel && s.competenceLevel !== editorLevel) return false;
      if (q && !`${s.firstName} ${s.lastName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [editorSearch, editorClass, editorLevel]);

  const openEditor = () => {
    setDraft(new Set(group.studentIds));
    setEditorSearch('');
    setEditorClass('');
    setEditorLevel('');
    setEditingMembers(true);
  };

  const cancelEditor = () => setEditingMembers(false);

  const saveEditor = () => {
    onSaveMembers(group.id, [...draft]);
    setEditingMembers(false);
  };

  const toggleDraft = useCallback((id) => {
    setDraft((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) { onRename(group.id, nameInput); setRenamingName(false); }
  };

  const added   = [...draft].filter((id) => !group.studentIds.includes(id)).length;
  const removed = group.studentIds.filter((id) => !draft.has(id)).length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
        {renamingName ? (
          <form onSubmit={handleRenameSubmit} className="flex-1 flex gap-2">
            <input
              autoFocus value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="text-xs text-primary font-medium">OK</button>
            <button type="button" onClick={() => { setRenamingName(false); setNameInput(group.name); }}
              className="text-xs text-gray-400">✕</button>
          </form>
        ) : (
          <>
            <span className="font-semibold text-sm text-gray-900 flex-1 truncate">{group.name}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{members.length} Mitgl.</span>
            <button onClick={() => setRenamingName(true)} title="Umbenennen"
              className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button onClick={() => onDelete(group.id)} title="Gruppe löschen"
              className="text-red-300 hover:text-red-500 flex-shrink-0">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* ── Compact summary (normal mode) ── */}
      {!editingMembers && (
        <>
          {/* Level distribution */}
          <div className="flex gap-1 px-3 py-2 flex-wrap min-h-[2rem] items-center">
            {members.length === 0
              ? <span className="text-xs text-gray-400">Noch keine Mitglieder</span>
              : LEVEL_KEYS.map((lk) => levelCounts[lk] ? (
                  <span key={lk} className="text-xs font-semibold px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: COMPETENCE_LEVELS[lk]?.color }}>
                    {lk}: {levelCounts[lk]}
                  </span>
                ) : null)
            }
          </div>

          {/* Compact member list */}
          {members.length > 0 && (
            <ul className="divide-y divide-gray-100 max-h-32 overflow-y-auto border-t border-gray-100">
              {members.map((s) => (
                <li key={s.id} className="flex items-center gap-2 px-3 py-1.5">
                  <LevelBadge level={s.competenceLevel} small />
                  <span className={`flex-1 text-xs text-gray-700 ${observerMode ? 'blur select-none' : ''}`}>{s.firstName} {s.lastName}</span>
                  <span className="text-xs text-gray-400">{GROUPS.find(g => g.id === s.classGroupId)?.name}</span>
                  <button
                    onClick={() => onDetail(s)}
                    title="Datenblatt anzeigen"
                    className="text-gray-300 hover:text-primary transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50">
            <button onClick={openEditor}
              className="text-xs font-medium text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 border border-gray-300 rounded px-2 py-1 hover:bg-white transition-colors">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Mitglieder bearbeiten
            </button>
            <button onClick={() => onNavigateMaterials(group.id)}
              className="text-xs font-medium text-primary hover:underline">
              Materialien →
            </button>
          </div>
        </>
      )}

      {/* ── Member editor (expanded) ── */}
      {editingMembers && (
        <div className="border-t border-gray-200">
          {/* Editor filter bar */}
          <div className="flex flex-wrap gap-2 p-3 bg-blue-50 border-b border-blue-100">
            <input
              autoFocus type="search" placeholder="Name suchen…"
              value={editorSearch} onChange={(e) => setEditorSearch(e.target.value)}
              className="flex-1 min-w-24 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            />
            <select value={editorClass} onChange={(e) => setEditorClass(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary bg-white">
              <option value="">Alle Klassen</option>
              {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select value={editorLevel} onChange={(e) => setEditorLevel(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary bg-white">
              <option value="">Alle Stufen</option>
              {LEVEL_KEYS.map((lk) => (
                <option key={lk} value={lk}>Stufe {lk}</option>
              ))}
            </select>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-blue-50 border-b border-blue-100 text-xs text-gray-600">
            <span><strong className="text-primary">{draft.size}</strong> ausgewählt</span>
            {added   > 0 && <span className="text-green-600">+{added} neu</span>}
            {removed > 0 && <span className="text-red-500">−{removed} entfernt</span>}
            <span className="ml-auto text-gray-400">{editorStudents.length} angezeigt</span>
          </div>

          {/* Checkbox student list */}
          <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {editorStudents.length === 0 && (
              <li className="text-xs text-gray-400 text-center py-4">Keine Schüler*innen gefunden.</li>
            )}
            {editorStudents.map((s) => (
              <li key={s.id}>
                <label className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${draft.has(s.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <input type="checkbox" checked={draft.has(s.id)} onChange={() => toggleDraft(s.id)}
                    className="w-3.5 h-3.5 accent-blue-600 flex-shrink-0" />
                  <LevelBadge level={s.competenceLevel} small />
                  <span className={`flex-1 text-xs text-gray-800 ${observerMode ? 'blur select-none' : ''}`}>{s.firstName} {s.lastName}</span>
                  <span className="text-xs text-gray-400">{GROUPS.find(g => g.id === s.classGroupId)?.name}</span>
                </label>
              </li>
            ))}
          </ul>

          {/* Editor actions */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-t border-gray-200">
            <button onClick={saveEditor}
              className="text-xs font-medium bg-primary text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors">
              Speichern
            </button>
            <button onClick={cancelEditor}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const StudentsPanel = ({ onNavigateMaterials, onOpenStudent }) => {
  const { selectedLevel, selectedGroup: sidebarGroup, selectedSubject: sidebarSubject, selectedGrade: sidebarGrade } = useFilters();

  // ── Filter state (initialised from sidebar) ──
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState(() => selectedLevel === 'group' ? sidebarGroup : '');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSubject, setFilterSubject] = useState(() => sidebarSubject || '');
  const [filterGrade, setFilterGrade] = useState(() => sidebarGrade || '');

  // Sync filter state when sidebar changes
  useEffect(() => {
    setFilterGroup(selectedLevel === 'group' ? sidebarGroup : '');
  }, [selectedLevel, sidebarGroup]);

  useEffect(() => {
    setFilterSubject(sidebarSubject || '');
  }, [sidebarSubject]);

  useEffect(() => {
    setFilterGrade(sidebarGrade || '');
  }, [sidebarGrade]);

  // ── Selection state ──
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Navigate to student detail view
  const navigateToStudent = (student) => {
    if (onOpenStudent) {
      onOpenStudent(student.id);
    }
  };

  // ── Map view toggle ──
  const [showMap, setShowMap] = useState(false);

  // ── Custom groups state ──

  const [customGroups, setCustomGroups] = useState(loadCustomGroups);
  const [newGroupName, setNewGroupName] = useState('');
  const [targetGroupId, setTargetGroupId] = useState('');
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [addFeedback, setAddFeedback] = useState(null);

  // ── Filtered students ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return STUDENTS.filter((s) => {
      if (filterGroup && s.classGroupId !== filterGroup) return false;
      if (filterLevel && s.competenceLevel !== filterLevel) return false;
      if (filterSubject && s.subject !== filterSubject) return false;
      if (filterGrade && s.grade !== filterGrade) return false;
      if (q && !`${s.firstName} ${s.lastName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filterGroup, filterLevel, filterSubject, filterGrade]);

  const toggleStudent = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ── Custom group actions ──
  const handleCreateAndAdd = () => {
    if (!newGroupName.trim()) return;
    let groups = createCustomGroup(customGroups, newGroupName);
    const created = groups[groups.length - 1];
    if (selectedIds.size > 0) {
      groups = addStudentsToGroup(groups, created.id, [...selectedIds]);
    }
    setCustomGroups(groups);
    setNewGroupName('');
    setShowNewGroupForm(false);
    clearSelection();
    flash(`Gruppe „${created.name}" erstellt.`);
  };

  const handleAddToExisting = () => {
    if (!targetGroupId || selectedIds.size === 0) return;
    const groups = addStudentsToGroup(customGroups, targetGroupId, [...selectedIds]);
    const g = groups.find((x) => x.id === targetGroupId);
    setCustomGroups(groups);
    clearSelection();
    flash(`${selectedIds.size} Schüler*in zu „${g?.name}" hinzugefügt.`);
  };

  const flash = (msg) => {
    setAddFeedback(msg);
    setTimeout(() => setAddFeedback(null), 3000);
  };

  const handleSaveMembers = (groupId, studentIds) => {
    setCustomGroups(setGroupMembers(customGroups, groupId, studentIds));
  };

  const handleDeleteGroup = (groupId) => {
    setCustomGroups(deleteCustomGroup(customGroups, groupId));
  };

  const handleRenameGroup = (groupId, name) => {
    setCustomGroups(renameCustomGroup(customGroups, groupId, name));
  };

  return (
    <div className="space-y-6">
      {/* Auto-grouping */}
      <AutoGroupingCard
        customGroups={customGroups}
        onGroupsCreated={setCustomGroups}
      />

      {/* ── Schüler-Karte (2D-Visualisierung) ── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowMap((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <svg className="h-4.5 w-4.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-900">Schüler-Karte</span>
              <span className="ml-2 text-xs text-gray-500">Interaktive 2D-Visualisierung · Clustering · Gruppenbildung</span>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showMap ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        {showMap && (
          <div className="p-5 bg-white">
            <StudentMapCard
              students={filtered}
              customGroups={customGroups}
              onGroupsChange={setCustomGroups}
              onOpenStudent={navigateToStudent}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Student list ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <Card title={`Schüler*innen (${STUDENTS.length})`}>
            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
              <input
                type="search"
                placeholder="Name suchen…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary flex-1 min-w-32"
              />
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">Alle Klassen</option>
                {GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">Alle Fächer</option>
                {Object.values(SUBJECTS).map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">Alle Klassenstufen</option>
                {Object.values(GRADES).map((g) => (
                  <option key={g.code} value={g.code}>{g.name}</option>
                ))}
              </select>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">Alle Stufen</option>
                {['I', 'II', 'III', 'IV', 'V'].map((lk) => (
                  <option key={lk} value={lk}>Stufe {lk} – {COMPETENCE_LEVELS[lk]?.description}</option>
                ))}
              </select>
            </div>

            {/* Select-all row */}
            <div className="flex items-center gap-3 px-4 pb-2 mb-1 border-b border-gray-100">
              <input
                type="checkbox"
                checked={filtered.length > 0 && selectedIds.size === filtered.length}
                onChange={toggleAll}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-xs text-gray-500">
                {filtered.length} Schüler*in{filtered.length !== 1 ? 'nen' : ''} angezeigt
                {selectedIds.size > 0 && (
                  <span className="ml-2 font-medium text-primary">· {selectedIds.size} ausgewählt</span>
                )}
              </span>
              {selectedIds.size > 0 && (
                <button onClick={clearSelection} className="ml-auto text-xs text-gray-400 hover:text-gray-600">
                  Auswahl aufheben
                </button>
              )}
            </div>

            {/* Student rows */}
            <div className="max-h-[520px] overflow-y-auto space-y-0.5 pr-1">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Keine Schüler*innen gefunden.</p>
              ) : (
                filtered.map((s) => (
                  <StudentRow
                    key={s.id}
                    student={s}
                    selected={selectedIds.has(s.id)}
                    onToggle={toggleStudent}
                    onDetail={navigateToStudent}
                  />
                ))
              )}
            </div>
          </Card>

          {/* Action bar (visible when students are selected) */}
          {selectedIds.size > 0 && (
            <Card>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {selectedIds.size} Schüler*in{selectedIds.size !== 1 ? 'nen' : ''} ausgewählt
                </span>

                {/* Add to existing group */}
                {customGroups.length > 0 && (
                  <div className="flex gap-2 items-center">
                    <select
                      value={targetGroupId}
                      onChange={(e) => setTargetGroupId(e.target.value)}
                      className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    >
                      <option value="">Gruppe wählen…</option>
                      {customGroups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddToExisting}
                      disabled={!targetGroupId}
                      className={`text-sm px-3 py-1.5 rounded-md font-medium transition-all ${
                        targetGroupId
                          ? 'bg-primary text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Hinzufügen
                    </button>
                  </div>
                )}

                {/* Create new group */}
                {showNewGroupForm ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleCreateAndAdd(); }}
                    className="flex gap-2 items-center"
                  >
                    <input
                      autoFocus
                      placeholder="Name der neuen Gruppe…"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary w-52"
                    />
                    <button
                      type="submit"
                      disabled={!newGroupName.trim()}
                      className={`text-sm px-3 py-1.5 rounded-md font-medium transition-all ${
                        newGroupName.trim()
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Erstellen & hinzufügen
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewGroupForm(false)}
                      className="text-sm text-gray-400 hover:text-gray-600"
                    >
                      Abbrechen
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowNewGroupForm(true)}
                    className="text-sm px-3 py-1.5 rounded-md font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    + Neue Gruppe erstellen
                  </button>
                )}

                {addFeedback && (
                  <span className="text-sm text-green-600 font-medium ml-auto">✓ {addFeedback}</span>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* ── Right: Custom groups ──────────────────────────────────────── */}
        <div className="space-y-4">
          <Card title="Eigene Gruppen">
            {customGroups.length === 0 && !showNewGroupForm && (
              <p className="text-sm text-gray-400 mb-3">
                Noch keine eigenen Gruppen. Wählen Sie Schüler*innen aus und erstellen Sie eine Gruppe.
              </p>
            )}

            <div className="space-y-3">
              {customGroups.map((g) => (
                <CustomGroupCard
                  key={g.id}
                  group={g}
                  onSaveMembers={handleSaveMembers}
                  onDelete={handleDeleteGroup}
                  onRename={handleRenameGroup}
                  onNavigateMaterials={onNavigateMaterials}
                  onDetail={navigateToStudent}
                />
              ))}
            </div>

            {/* Standalone "create empty group" when no students selected */}
            {selectedIds.size === 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {showNewGroupForm ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleCreateAndAdd(); }}
                    className="flex gap-2"
                  >
                    <input
                      autoFocus
                      placeholder="Gruppenname…"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      disabled={!newGroupName.trim()}
                      className={`text-sm px-3 py-1.5 rounded-md font-medium ${
                        newGroupName.trim()
                          ? 'bg-primary text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Erstellen
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewGroupForm(false)}
                      className="text-sm text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowNewGroupForm(true)}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-md py-2 hover:border-gray-400 transition-colors"
                  >
                    + Neue leere Gruppe erstellen
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentsPanel;
