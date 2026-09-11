import { useEffect, useState } from 'react';
import { COMPETENCE_LEVELS, GROUPS, SUBJECTS, GRADES } from '../../utils/constants';
import { useFilters } from '../../context/FilterContext';
import { loadCustomGroups, addStudentsToGroup, removeStudentFromGroup } from '../../utils/customGroupsStore';

const LEVEL_TO_NUM = { I: 1, II: 2, III: 3, IV: 4, V: 5 };

// ── Domain score row ──────────────────────────────────────────────────────────

const DomainRow = ({ name, level }) => {
  const cfg = COMPETENCE_LEVELS[level];
  const pct = (LEVEL_TO_NUM[level] / 5) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-52 flex-shrink-0 truncate">{name}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: cfg?.color ?? '#6b7280' }}
        />
      </div>
      <span
        className="text-xs font-bold px-2 py-0.5 rounded text-white w-16 text-center flex-shrink-0"
        style={{ backgroundColor: cfg?.color ?? '#6b7280' }}
      >
        Stufe {level}
      </span>
    </div>
  );
};

// ── Overall level gauge ───────────────────────────────────────────────────────

const LevelGauge = ({ level }) => (
  <div className="flex gap-1">
    {['I', 'II', 'III', 'IV', 'V'].map((lk) => {
      const cfg = COMPETENCE_LEVELS[lk];
      const active = LEVEL_TO_NUM[lk] <= LEVEL_TO_NUM[level];
      return (
        <div key={lk} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full h-4 rounded"
            style={{
              backgroundColor: active ? cfg.color : '#e5e7eb',
              opacity: lk === level ? 1 : active ? 0.5 : 1,
            }}
          />
          <span className={`text-xs font-bold ${lk === level ? 'text-gray-900' : 'text-gray-400'}`}>
            {lk}
          </span>
        </div>
      );
    })}
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────

const StudentDetailModal = ({ student, onClose, onGroupsChange }) => {
  const { observerMode } = useFilters();
  const group = GROUPS.find((g) => g.id === student.classGroupId);
  const subject = SUBJECTS[student.subject];
  const grade = GRADES[student.grade];
  const levelCfg = COMPETENCE_LEVELS[student.competenceLevel];
  const domains = Object.entries(student.domainLevels ?? {});

  // Custom groups state (own copy to avoid prop-drilling issues)
  const [customGroups, setCustomGroups] = useState(loadCustomGroups);

  const toggleGroup = (groupId) => {
    const cg = customGroups.find((g) => g.id === groupId);
    if (!cg) return;
    const isMember = cg.studentIds.includes(student.id);
    const updated = isMember
      ? removeStudentFromGroup(customGroups, groupId, student.id)
      : addStudentsToGroup(customGroups, groupId, [student.id]);
    setCustomGroups(updated);
    onGroupsChange?.(updated);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between gap-4"
          style={{ backgroundColor: levelCfg ? levelCfg.color + '18' : '#f9fafb' }}
        >
          <div>
            <h2 className={`text-xl font-bold text-gray-900 ${observerMode ? 'blur select-none' : ''}`}>
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {group?.name} · {subject?.name} · {grade?.name}
            </p>
          </div>
          <div className="flex-shrink-0 text-center">
            <div
              className="text-2xl font-black px-4 py-2 rounded-xl text-white"
              style={{ backgroundColor: levelCfg?.color }}
            >
              {student.competenceLevel}
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-20 leading-tight">
              {levelCfg?.description}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Overall level gauge */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Gesamtergebnis
            </p>
            <LevelGauge level={student.competenceLevel} />
            <p className="text-xs text-gray-400 mt-1.5">{levelCfg?.name}</p>
          </div>

          {/* Domain breakdown */}
          {domains.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Ergebnisse nach Teilbereich
              </p>
              <div className="space-y-2.5">
                {domains.map(([name, level]) => (
                  <DomainRow key={name} name={name} level={level} />
                ))}
              </div>
            </div>
          )}

          {/* Group membership */}
          {customGroups.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Gruppen
              </p>
              <div className="space-y-1">
                {customGroups.map((cg) => {
                  const isMember = cg.studentIds.includes(student.id);
                  return (
                    <label
                      key={cg.id}
                      className={`flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        isMember ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isMember}
                        onChange={() => toggleGroup(cg.id)}
                        className="w-4 h-4 accent-blue-600 flex-shrink-0"
                      />
                      <span className={`flex-1 text-sm ${isMember ? 'font-medium text-primary' : 'text-gray-700'}`}>
                        {cg.name}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {cg.studentIds.length} Mitgl.
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Competence level legend */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Stufenbeschreibungen
            </p>
            <div className="space-y-1">
              {['I', 'II', 'III', 'IV', 'V'].map((lk) => {
                const c = COMPETENCE_LEVELS[lk];
                const isOwn = lk === student.competenceLevel;
                return (
                  <div key={lk} className={`flex items-center gap-2 rounded px-2 py-1 ${isOwn ? 'bg-gray-100' : ''}`}>
                    <span
                      className="text-xs font-bold px-1.5 rounded text-white w-7 text-center flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    >
                      {lk}
                    </span>
                    <span className={`text-xs ${isOwn ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                      {c.description}
                    </span>
                    {isOwn && <span className="ml-auto text-xs text-primary font-medium">← aktuell</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
