import { useState, useMemo } from 'react';
import { STUDENTS } from '../../utils/studentData';
import { GROUPS, SUBJECTS, GRADES, COMPETENCE_LEVELS } from '../../utils/constants';
import { createCustomGroup, addStudentsToGroup, saveCustomGroups } from '../../utils/customGroupsStore';

// ── Grouping strategy definitions ────────────────────────────────────────────

const STRATEGIES = [
  {
    id: 'by_level',
    label: 'Nach Kompetenzstufe',
    description: '5 Gruppen – eine pro Stufe',
    icon: '5️⃣',
    groups: [
      { key: 'I',   label: 'Stufe I',   levels: ['I'],           color: COMPETENCE_LEVELS.I.color },
      { key: 'II',  label: 'Stufe II',  levels: ['II'],          color: COMPETENCE_LEVELS.II.color },
      { key: 'III', label: 'Stufe III', levels: ['III'],         color: COMPETENCE_LEVELS.III.color },
      { key: 'IV',  label: 'Stufe IV',  levels: ['IV'],          color: COMPETENCE_LEVELS.IV.color },
      { key: 'V',   label: 'Stufe V',   levels: ['V'],           color: COMPETENCE_LEVELS.V.color },
    ],
  },
  {
    id: 'three_tier',
    label: 'Dreistufig',
    description: '3 Gruppen – Fördern · Regelstandard · Fordern',
    icon: '3️⃣',
    groups: [
      { key: 'foerder',    label: 'Fördergruppe',       levels: ['I', 'II'],   color: COMPETENCE_LEVELS.I.color },
      { key: 'regel',      label: 'Regelgruppe',        levels: ['III'],       color: COMPETENCE_LEVELS.III.color },
      { key: 'erweiter',   label: 'Erweiterungsgruppe', levels: ['IV', 'V'],   color: COMPETENCE_LEVELS.V.color },
    ],
  },
  {
    id: 'two_tier',
    label: 'Zweigeteilt',
    description: '2 Gruppen – Förderung & Fortgeschrittene',
    icon: '2️⃣',
    groups: [
      { key: 'support',  label: 'Fördergruppe',     levels: ['I', 'II', 'III'], color: COMPETENCE_LEVELS.II.color },
      { key: 'advanced', label: 'Fortgeschrittene', levels: ['IV', 'V'],        color: COMPETENCE_LEVELS.V.color },
    ],
  },
];

// ── Preview row ───────────────────────────────────────────────────────────────

const PreviewRow = ({ groupDef, students, prefix }) => {
  const count = students.length;
  const name = prefix.trim() ? `${groupDef.label} – ${prefix.trim()}` : groupDef.label;
  const levelCounts = groupDef.levels.reduce((acc, l) => {
    acc[l] = students.filter((s) => s.competenceLevel === l).length;
    return acc;
  }, {});

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div
        className="w-2 self-stretch rounded-full flex-shrink-0"
        style={{ backgroundColor: groupDef.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
        <div className="flex gap-1 mt-0.5">
          {groupDef.levels.map((lk) => (
            <span
              key={lk}
              className="text-xs font-semibold px-1.5 py-0.5 rounded text-white"
              style={{ backgroundColor: COMPETENCE_LEVELS[lk]?.color }}
            >
              {lk}: {levelCounts[lk] ?? 0}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <span className="text-xl font-bold text-gray-800">{count}</span>
        <p className="text-xs text-gray-400">Schüler*in</p>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const AutoGroupingCard = ({ customGroups, onGroupsCreated }) => {
  const [open, setOpen] = useState(false);
  const [strategyId, setStrategyId] = useState('three_tier');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [prefix, setPrefix] = useState('');
  const [success, setSuccess] = useState(null);
  const [skipEmpty, setSkipEmpty] = useState(true);

  const strategy = STRATEGIES.find((s) => s.id === strategyId);

  // Students that match the current filters
  const filteredStudents = useMemo(() =>
    STUDENTS.filter((s) => {
      if (filterClass && s.classGroupId !== filterClass) return false;
      if (filterSubject && s.subject !== filterSubject) return false;
      return true;
    }), [filterClass, filterSubject]);

  // Map each strategy group → matching students
  const preview = useMemo(() =>
    strategy.groups.map((gDef) => ({
      groupDef: gDef,
      students: filteredStudents.filter((s) => gDef.levels.includes(s.competenceLevel)),
    })), [strategy, filteredStudents]);

  const totalStudents = filteredStudents.length;
  const groupsToCreate = skipEmpty ? preview.filter((p) => p.students.length > 0) : preview;

  const handleCreate = () => {
    let groups = [...customGroups];

    groupsToCreate.forEach(({ groupDef, students }) => {
      const name = prefix.trim()
        ? `${groupDef.label} – ${prefix.trim()}`
        : groupDef.label;
      groups = createCustomGroup(groups, name);
      const created = groups[groups.length - 1];
      groups = addStudentsToGroup(groups, created.id, students.map((s) => s.id));
    });

    saveCustomGroups(groups);
    onGroupsCreated(groups);

    setSuccess(`${groupsToCreate.length} Gruppen mit ${totalStudents} Schüler*innen erstellt.`);
    setTimeout(() => setSuccess(null), 4000);
    setOpen(false);
  };

  return (
    <div className="border border-primary/20 rounded-xl overflow-hidden bg-blue-50/40">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-blue-50 transition-colors"
      >
        <span className="text-lg">⚡</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-sm">Automatische Gruppierung</p>
          <p className="text-xs text-gray-500">Schüler*innen anhand ihrer Kompetenzstufe automatisch in Gruppen einteilen</p>
        </div>
        {success && (
          <span className="text-xs text-green-600 font-medium mr-2">✓ {success}</span>
        )}
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-primary/10 bg-white">

          {/* Strategy selector */}
          <div className="pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Strategie</p>
            <div className="grid grid-cols-3 gap-3">
              {STRATEGIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStrategyId(s.id)}
                  className={`text-left rounded-lg border-2 px-4 py-3 transition-all ${
                    strategyId === s.id
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`font-semibold text-sm ${strategyId === s.id ? 'text-primary' : 'text-gray-800'}`}>
                    {s.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Schüler*innen aus</p>
            <div className="flex flex-wrap gap-3">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">Alle Klassen ({STUDENTS.length})</option>
                {GROUPS.map((g) => {
                  const n = STUDENTS.filter((s) => s.classGroupId === g.id).length;
                  return <option key={g.id} value={g.id}>{g.name} ({n})</option>;
                })}
              </select>

              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">Alle Fächer</option>
                {Object.values(SUBJECTS).map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>

              <span className="self-center text-sm text-gray-500">
                → <strong>{totalStudents}</strong> Schüler*innen werden eingeteilt
              </span>
            </div>
          </div>

          {/* Group name prefix */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Namenszusatz (optional)</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={filterClass ? GROUPS.find((g) => g.id === filterClass)?.name : 'z.B. Klasse 3a, Schuljahr 25/26'}
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary w-72"
              />
              <span className="text-xs text-gray-400">→ z.B. „Fördergruppe – {prefix || 'Klasse 3a'}"</span>
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Vorschau</p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {preview.map(({ groupDef, students }) => (
                <PreviewRow
                  key={groupDef.key}
                  groupDef={groupDef}
                  students={students}
                  prefix={prefix}
                />
              ))}
            </div>
            <label className="flex items-center gap-2 mt-2 text-xs text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={skipEmpty}
                onChange={(e) => setSkipEmpty(e.target.checked)}
                className="accent-blue-600"
              />
              Leere Gruppen überspringen
            </label>
          </div>

          {/* Action */}
          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={handleCreate}
              disabled={groupsToCreate.length === 0 || totalStudents === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                groupsToCreate.length > 0 && totalStudents > 0
                  ? 'bg-primary text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              ⚡ {groupsToCreate.length} Gruppen automatisch erstellen
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoGroupingCard;
