import { useState, useEffect, useMemo } from 'react';
import { useFilters } from '../../context/FilterContext';
import { useCompetenceLevels } from '../../hooks/useCompetenceLevels';
import { transformCompetenceLevels } from '../../utils/dataTransformers';
import {
  EDUCATIONAL_MATERIALS,
  MATERIAL_TYPES,
  SUBJECTS,
  COMPETENCE_LEVELS,
  GROUPS,
} from '../../utils/constants';
import { exportCommonCartridge } from '../../utils/commonCartridgeExport';
import { exportPDF } from '../../utils/pdfExport';
import { loadCustomGroups } from '../../utils/customGroupsStore';
import { STUDENTS } from '../../utils/studentData';
import Card from '../common/Card';
import LoadingSkeleton from '../common/LoadingSkeleton';
import MundoSearchModal from './MundoSearchModal';

// ── Storage ───────────────────────────────────────────────────────────────────

const LEVEL_KEY  = 'tba3_materials_by_level';   // { I: [matId], II: […], … }
const GROUP_KEY  = 'tba3_materials_by_group';   // { [groupId]: [matId] }
const EXT_KEY    = 'tba3_external_materials';   // { [id]: { id, title, description, url, source } }

const load  = (key) => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
const save  = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const loadExternal = () => Object.values(load(EXT_KEY));
const saveExternal = (arr) => save(EXT_KEY, Object.fromEntries(arr.map((m) => [m.id, m])));

const LEVEL_KEYS = ['I', 'II', 'III', 'IV', 'V'];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Most frequent value in an array, or null */
const mostFrequent = (arr) => {
  if (!arr.length) return null;
  const freq = {};
  arr.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
};

/** Resolve members of a custom group */
const groupMembers = (cg) =>
  (cg?.studentIds ?? []).map((id) => STUDENTS.find((s) => s.id === id)).filter(Boolean);

// ── Sub-components (unchanged from previous version) ─────────────────────────

const LevelCard = ({ levelKey, count, total, isActive, onClick, assignedCount }) => {
  const cfg = COMPETENCE_LEVELS[levelKey];
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className={`relative flex-1 min-w-0 rounded-xl border-2 p-4 text-left transition-all ${
        isActive
          ? 'border-current shadow-md scale-105'
          : 'border-transparent bg-gray-50 hover:bg-gray-100'
      }`}
      style={isActive ? { borderColor: cfg.color, backgroundColor: cfg.color + '18' } : {}}
    >
      {assignedCount > 0 && (
        <span className="absolute top-2 right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {assignedCount}
        </span>
      )}
      <div className="text-lg font-bold mb-1" style={{ color: cfg.color }}>
        Stufe {levelKey}
      </div>
      <div className="text-2xl font-bold text-gray-900">{count}</div>
      <div className="text-xs text-gray-500 mt-0.5">Schüler*innen ({pct}%)</div>
      <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
      </div>
      <div className="text-xs mt-1.5 text-gray-400 leading-tight">{cfg.description}</div>
    </button>
  );
};

const MaterialCard = ({ material, isAssigned, isSelected, onToggle, showLevels = true }) => {
  const type    = MATERIAL_TYPES[material.type];
  const subject = SUBJECTS[material.subject];
  const isExternal = material.source === 'mundo';

  return (
    <div
      onClick={() => !isAssigned && onToggle(material.id)}
      className={`rounded-lg p-4 transition-all ${
        isExternal
          ? `border-2 ${
              isAssigned
                ? 'border-green-300 bg-green-50 cursor-default'
                : isSelected
                ? 'border-blue-400 bg-blue-50 shadow-sm cursor-pointer'
                : 'border-blue-200 bg-blue-50/40 hover:border-blue-300 hover:shadow-sm cursor-pointer'
            }`
          : `border ${
              isAssigned
                ? 'border-green-300 bg-green-50 cursor-default'
                : isSelected
                ? 'border-primary bg-blue-50 shadow-sm cursor-pointer'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer'
            }`
      }`}
    >
      {/* Source label strip for external materials */}
      {isExternal && (
        <div className="flex items-center gap-1.5 mb-2 -mt-0.5">
          <span className="text-xs font-bold tracking-wide text-blue-600 uppercase">🌍 MUNDO</span>
          <span className="flex-1 h-px bg-blue-200" />
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">{isExternal ? '' : type?.icon}</span>
          <span className="font-medium text-gray-900 text-sm leading-snug">{material.title}</span>
        </div>
        <div className="flex-shrink-0 mt-0.5">
          {isAssigned ? (
            <span className="text-green-600 text-xs font-semibold whitespace-nowrap">✓ Zugewiesen</span>
          ) : (
            <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${isSelected ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
              {isSelected && '✓'}
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{material.description}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        {isExternal ? (
          <>
            {material.url && (
              <a href={material.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline truncate max-w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {material.url}
              </a>
            )}
          </>
        ) : (
          <>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: subject?.color || '#6b7280' }}>
              {subject?.name}
            </span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{type?.label}</span>
            <span className="text-xs text-gray-400 ml-auto">⏱ {material.duration}</span>
          </>
        )}
      </div>

      {showLevels && !isExternal && (
        <div className="flex flex-wrap gap-1 mt-2">
          {(material.targetLevels ?? []).map((lvl) => (
            <span key={lvl} className="text-xs font-semibold px-1.5 py-0.5 rounded text-white"
              style={{ backgroundColor: COMPETENCE_LEVELS[lvl]?.color }}>
              {lvl}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const AssignedRow = ({ material, onRemove }) => {
  const type    = MATERIAL_TYPES[material.type];
  const subject = SUBJECTS[material.subject];
  const isExternal = material.source === 'mundo';

  return (
    <div className={`flex items-center justify-between gap-3 py-2 border-b last:border-0 ${isExternal ? 'border-blue-100' : 'border-gray-100'}`}>
      <div className="flex items-center gap-2 min-w-0">
        {isExternal ? (
          <span className="flex-shrink-0 text-xs font-bold text-blue-500 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 leading-none">
            MUNDO
          </span>
        ) : (
          <span className="flex-shrink-0">{type?.icon}</span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{material.title}</p>
          {isExternal ? (
            material.url
              ? <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">{material.url}</a>
              : <p className="text-xs text-gray-400">Externes Material</p>
          ) : (
            <p className="text-xs text-gray-400">{subject?.name} · {material.duration}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onRemove(material.id)}
        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
      >
        Entfernen
      </button>
    </div>
  );
};

// ── Catalog + assign section (shared by both modes) ───────────────────────────

const CatalogSection = ({
  assignedIds, catalogMaterials, onAssign, onRemove, title,
  showLevels = true, extraMaterials = [], onMundoClick,
}) => {
  const [selected, setSelected] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset selection when assigned IDs or catalog changes
  useEffect(() => setSelected([]), [assignedIds.join(','), catalogMaterials.length]);

  const toggle = (id) => {
    if (assignedIds.includes(id)) return;
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleAssign = () => {
    if (selected.length === 0) return;
    onAssign(selected);
    setSelected([]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const allMaterials = [...EDUCATIONAL_MATERIALS, ...extraMaterials];
  const assignedMaterials = allMaterials.filter((m) => assignedIds.includes(m.id));

  return (
    <>
      {/* Assigned materials */}
      <Card title={title}>
        {assignedMaterials.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">Noch keine Materialien zugewiesen.</p>
        ) : (
          assignedMaterials.map((m) => (
            <AssignedRow key={m.id} material={m} onRemove={onRemove} />
          ))
        )}
      </Card>

      {/* Catalog */}
      <Card title="Materialien auswählen">
        {/* Mundo search button */}
        {onMundoClick && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <p className="text-xs text-gray-500">
              Lokale Materialien oder direkt aus MUNDO suchen:
            </p>
            <button
              onClick={onMundoClick}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              <span className="text-sm">🌍</span>
              MUNDO Suche
            </button>
          </div>
        )}

        {catalogMaterials.length === 0 && extraMaterials.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Keine passenden Materialien für diese Auswahl gefunden.
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">
              {catalogMaterials.length} lokal · {extraMaterials.length} aus MUNDO
              {selected.length > 0 && <span className="ml-2 text-primary font-medium">· {selected.length} ausgewählt</span>}
            </p>

            {/* Local materials */}
            {catalogMaterials.length > 0 && (
              <>
                {extraMaterials.length > 0 && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Lokaler Pool</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catalogMaterials.map((m) => (
                    <MaterialCard
                      key={m.id}
                      material={m}
                      isAssigned={assignedIds.includes(m.id)}
                      isSelected={selected.includes(m.id)}
                      onToggle={toggle}
                      showLevels={showLevels}
                    />
                  ))}
                </div>
              </>
            )}

            {/* MUNDO external materials */}
            {extraMaterials.length > 0 && (
              <>
                <div className="flex items-center gap-3 my-4">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider whitespace-nowrap">🌍 MUNDO</span>
                  <span className="flex-1 h-px bg-blue-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {extraMaterials.map((m) => (
                    <MaterialCard
                      key={m.id}
                      material={m}
                      isAssigned={assignedIds.includes(m.id)}
                      isSelected={selected.includes(m.id)}
                      onToggle={toggle}
                      showLevels={false}
                    />
                  ))}
                </div>
              </>
            )}


            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-4">
              <button
                onClick={handleAssign}
                disabled={selected.length === 0}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  selected.length > 0
                    ? 'bg-primary text-white hover:bg-blue-700 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selected.length > 0 ? `${selected.length} Material${selected.length > 1 ? 'ien' : ''} zuweisen` : 'Material auswählen'}
              </button>
              {showSuccess && <span className="text-sm text-green-600 font-medium">✓ Erfolgreich zugewiesen!</span>}
            </div>
          </>
        )}
      </Card>
    </>
  );
};

// ── Export helpers ────────────────────────────────────────────────────────────

const SpinnerIcon = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
  </svg>
);

const DownloadIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
  </svg>
);

const PdfIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────────

const EducationalMaterialsPanel = () => {
  const { selectedLevel, getSelectedId, selectedSubject, selectedGrade } = useFilters();
  const predefinedGroupId = selectedLevel === 'group' ? getSelectedId() : null;
  const predefinedGroup   = GROUPS.find((g) => g.id === predefinedGroupId);

  // ── Mode ──
  const [mode, setMode] = useState('level'); // 'level' | 'group'

  // ── Level-mode state ──
  const [activeLevel,   setActiveLevel]   = useState(null);
  const [levelAss,      setLevelAss]      = useState(() => load(LEVEL_KEY));

  // ── Group-mode state ──
  const [customGroups,  setCustomGroups]  = useState(loadCustomGroups);
  const [activeGroupId, setActiveGroupId] = useState(() => {
    const id = sessionStorage.getItem('tba3_navigate_custom_group');
    if (id) { sessionStorage.removeItem('tba3_navigate_custom_group'); return id; }
    return null;
  });
  const [groupAss,      setGroupAss]      = useState(() => load(GROUP_KEY));

  // ── External (MUNDO) materials ──
  const [externalMaterials, setExternalMaterials] = useState(loadExternal);
  const [showMundo, setShowMundo] = useState(false);

  // ── Export state ──
  const [exportingCC,  setExportingCC]  = useState(null);
  const [exportingPDF, setExportingPDF] = useState(null);
  const [exportMsg,    setExportMsg]    = useState(null);

  // Navigate to group mode when sessionStorage has a group id
  useEffect(() => {
    if (activeGroupId) setMode('group');
  }, []);

  // Refresh custom groups on mount
  useEffect(() => {
    setCustomGroups(loadCustomGroups());
  }, []);

  // Reset active level/group when switching modes
  const switchMode = (m) => {
    setMode(m);
    setActiveLevel(null);
    setActiveGroupId(null);
  };

  // ── Level mode: student counts ──
  const { data: clData, loading: clLoading } = useCompetenceLevels(
    mode === 'level' ? selectedLevel : 'group',
    mode === 'level' ? predefinedGroupId : null,
    {}
  );
  const apiLevelCounts = useMemo(() => clData ? transformCompetenceLevels(clData) : [], [clData]);

  // Fallback: derive from STUDENTS for the selected predefined group
  const localLevelCounts = useMemo(() => {
    const students = predefinedGroupId
      ? STUDENTS.filter((s) => s.classGroupId === predefinedGroupId)
      : [];
    const agg = {};
    students.forEach((s) => { agg[s.competenceLevel] = (agg[s.competenceLevel] || 0) + 1; });
    return LEVEL_KEYS.map((lk) => ({ level: lk, count: agg[lk] ?? 0 }));
  }, [predefinedGroupId]);

  const levelCounts     = apiLevelCounts.length > 0 ? apiLevelCounts : localLevelCounts;
  const totalStudents   = levelCounts.reduce((s, l) => s + l.count, 0);

  // ── Level mode: catalog filtering ──
  const catalogSubject = selectedSubject ?? predefinedGroup?.subject ?? null;
  const catalogGrade   = selectedGrade   ?? predefinedGroup?.grade   ?? null;

  const levelCatalog = useMemo(() => {
    if (!activeLevel) return [];
    return EDUCATIONAL_MATERIALS.filter((m) => {
      if (!m.targetLevels.includes(activeLevel)) return false;
      if (catalogSubject && m.subject !== catalogSubject) return false;
      if (catalogGrade   && m.grade   !== catalogGrade)   return false;
      return true;
    });
  }, [activeLevel, catalogSubject, catalogGrade]);

  // ── Level mode: assign / remove ──
  const levelAssignedIds = activeLevel ? (levelAss[activeLevel] ?? []) : [];

  const handleLevelAssign = (ids) => {
    const updated = { ...levelAss, [activeLevel]: [...new Set([...(levelAss[activeLevel] ?? []), ...ids])] };
    setLevelAss(updated);
    save(LEVEL_KEY, updated);
  };

  const handleLevelRemove = (matId) => {
    const updated = { ...levelAss, [activeLevel]: (levelAss[activeLevel] ?? []).filter((id) => id !== matId) };
    setLevelAss(updated);
    save(LEVEL_KEY, updated);
  };

  // ── Group mode: active group data ──
  const activeGroup   = customGroups.find((g) => g.id === activeGroupId);
  const activeMembers = activeGroup ? groupMembers(activeGroup) : [];
  const groupSubject  = mostFrequent(activeMembers.map((s) => s.subject));
  const groupGrade    = mostFrequent(activeMembers.map((s) => s.grade));

  const groupCatalog = useMemo(() => {
    if (!activeGroupId) return [];
    return EDUCATIONAL_MATERIALS.filter((m) => {
      if (groupSubject && m.subject !== groupSubject) return false;
      if (groupGrade   && m.grade   !== groupGrade)   return false;
      return true;
    });
  }, [activeGroupId, groupSubject, groupGrade]);

  const groupAssignedIds = activeGroupId ? (groupAss[activeGroupId] ?? []) : [];

  const handleGroupAssign = (ids) => {
    const updated = { ...groupAss, [activeGroupId]: [...new Set([...(groupAss[activeGroupId] ?? []), ...ids])] };
    setGroupAss(updated);
    save(GROUP_KEY, updated);
  };

  const handleGroupRemove = (matId) => {
    const updated = { ...groupAss, [activeGroupId]: (groupAss[activeGroupId] ?? []).filter((id) => id !== matId) };
    setGroupAss(updated);
    save(GROUP_KEY, updated);
  };

  // ── Export ──
  const totalLevelAss = Object.values(levelAss).reduce((s, ids) => s + ids.length, 0);
  const totalGroupAss = Object.values(groupAss).reduce((s, ids) => s + ids.length, 0);
  const hasAnyAssigned = totalLevelAss + totalGroupAss > 0;

  // Convert to the format expected by export functions: { [pseudoGroupId]: { [pseudoLevel]: [matIds] } }
  // Build assignments + extraGroups for export functions
  const buildExport = () => {
    const assignments = {};
    const extraGroups = [];

    // Level mode assignments → one virtual group
    if (totalLevelAss > 0) {
      const levelId = '__level_export__';
      assignments[levelId] = Object.fromEntries(
        LEVEL_KEYS.filter((lk) => (levelAss[lk] ?? []).length > 0).map((lk) => [lk, levelAss[lk]])
      );
      extraGroups.push({ id: levelId, name: 'Nach Kompetenzstufe', subject: '', grade: '', _type: 'level' });
    }

    // Group mode assignments → each custom group, flat under pseudo-level '_all'
    customGroups.forEach((cg) => {
      const ids = groupAss[cg.id] ?? [];
      if (ids.length === 0) return;
      assignments[cg.id] = { _all: ids };
      extraGroups.push({ id: cg.id, name: cg.name, subject: '', grade: '', _type: 'group' });
    });

    return { assignments, extraGroups };
  };

  // ── MUNDO handler ──
  const handleMundoSelect = (items) => {
    // Persist new external materials
    const merged = [
      ...externalMaterials,
      ...items.filter((ni) => !externalMaterials.some((ex) => ex.id === ni.id)),
    ];
    setExternalMaterials(merged);
    saveExternal(merged);

    // Immediately assign to the current active level or group
    const ids = items.map((i) => i.id);
    if (mode === 'level' && activeLevel) {
      handleLevelAssign(ids);
    } else if (mode === 'group' && activeGroupId) {
      handleGroupAssign(ids);
    }
  };

  const flashMsg = (msg) => { setExportMsg(msg); setTimeout(() => setExportMsg(null), 5000); };

  const handleExportCC = async () => {
    setExportingCC(true);
    const { assignments: exp, extraGroups } = buildExport();
    try {
      const count = await exportCommonCartridge(exp, null, extraGroups, externalMaterials);
      flashMsg({ type: 'success', message: `${count} Materialien als .imscc exportiert.` });
    } catch (err) {
      flashMsg({ type: 'error', message: err.message });
    } finally { setExportingCC(false); }
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    const { assignments: exp, extraGroups } = buildExport();
    try {
      const count = await exportPDF(exp, null, extraGroups, externalMaterials);
      flashMsg({ type: 'success', message: `${count} Materialien als PDF exportiert.` });
    } catch (err) {
      flashMsg({ type: 'error', message: err.message });
    } finally { setExportingPDF(false); }
  };

  const busy = exportingCC || exportingPDF;

  // ── Render ──

  return (
    <div className="space-y-6">

      {/* MUNDO modal */}
      {showMundo && (
        <MundoSearchModal
          onSelect={handleMundoSelect}
          onClose={() => setShowMundo(false)}
        />
      )}

      {/* ── Mode toggle ── */}
      <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
        {[
          { key: 'level', label: 'Nach Kompetenzstufe', icon: '📊' },
          { key: 'group', label: 'Nach Gruppe',          icon: '👥' },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === key
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODUS 1: Nach Kompetenzstufe                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {mode === 'level' && (
        <>
          <Card title={`Kompetenzstufe wählen${predefinedGroup ? ` – ${predefinedGroup.name}` : ''}`}>
            <p className="text-sm text-gray-500 mb-4">
              Wählen Sie eine Kompetenzstufe aus und weisen Sie ihr passende Materialien zu.
              Die Zuweisung gilt global für alle Schüler*innen dieser Stufe.
              {predefinedGroup && <span className="ml-1 text-gray-400">(Schüleranzahl aus: {predefinedGroup.name})</span>}
            </p>

            {clLoading && apiLevelCounts.length === 0 ? (
              <LoadingSkeleton height="120px" />
            ) : (
              <div className="flex gap-3">
                {LEVEL_KEYS.map((lk) => {
                  const entry = levelCounts.find((l) => l.level === lk);
                  return (
                    <LevelCard
                      key={lk}
                      levelKey={lk}
                      count={entry?.count ?? 0}
                      total={totalStudents}
                      isActive={activeLevel === lk}
                      assignedCount={(levelAss[lk] ?? []).length}
                      onClick={() => setActiveLevel(activeLevel === lk ? null : lk)}
                    />
                  );
                })}
              </div>
            )}
          </Card>

          {activeLevel && (
            <CatalogSection
              assignedIds={levelAssignedIds}
              catalogMaterials={levelCatalog}
              onAssign={handleLevelAssign}
              onRemove={handleLevelRemove}
              title={`Zugewiesene Materialien – Stufe ${activeLevel}`}
              extraMaterials={externalMaterials}
              onMundoClick={() => setShowMundo(true)}
            />
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODUS 2: Nach Gruppe                                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {mode === 'group' && (
        <>
          <Card title="Gruppe wählen">
            {customGroups.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-lg">
                Noch keine eigenen Gruppen vorhanden.<br />
                <span className="text-xs">Im Tab <strong>Schüler*innen</strong> erstellen.</span>
              </p>
            ) : (
              <div className="space-y-2">
                {customGroups.map((cg) => {
                  const isActive = activeGroupId === cg.id;
                  const assigned = (groupAss[cg.id] ?? []).length;
                  const members  = groupMembers(cg);

                  return (
                    <button
                      key={cg.id}
                      onClick={() => setActiveGroupId(cg.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        isActive
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex-1 font-semibold text-sm ${isActive ? 'text-primary' : 'text-gray-800'}`}>
                          {cg.name}
                        </span>
                        <span className="text-xs text-gray-400">{members.length} Mitgl.</span>
                        {assigned > 0 && (
                          <span className="text-xs bg-primary text-white font-bold rounded-full px-2 py-0.5">
                            {assigned} Material{assigned !== 1 ? 'ien' : ''}
                          </span>
                        )}
                        {isActive && (
                          <svg className="h-4 w-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {activeGroupId && activeGroup && (
            <CatalogSection
              assignedIds={groupAssignedIds}
              catalogMaterials={groupCatalog}
              onAssign={handleGroupAssign}
              onRemove={handleGroupRemove}
              title={`Zugewiesene Materialien – ${activeGroup.name}`}
              showLevels={false}
              extraMaterials={externalMaterials}
              onMundoClick={() => setShowMundo(true)}
            />
          )}
        </>
      )}

      {/* ── Export ── */}
      <Card title="Export">
        <p className="text-sm text-gray-500 mb-4">
          Exportiert alle zugewiesenen Materialien (beide Modi) als IMS Common Cartridge oder PDF.
        </p>

        {/* Summary */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 text-center">
            <div className="text-xl font-bold text-gray-900">{totalLevelAss}</div>
            <div className="text-xs text-gray-500 mt-0.5">nach Kompetenzstufe</div>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 text-center">
            <div className="text-xl font-bold text-gray-900">{totalGroupAss}</div>
            <div className="text-xs text-gray-500 mt-0.5">nach Gruppe</div>
          </div>
        </div>

        {!hasAnyAssigned && (
          <p className="text-sm text-gray-400 mb-4">
            Noch keine Materialien zugewiesen.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCC}
            disabled={busy || !hasAnyAssigned}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              hasAnyAssigned && !busy
                ? 'bg-gray-900 text-white hover:bg-gray-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {exportingCC ? <><SpinnerIcon />Exportiere…</> : <><DownloadIcon />Alle als .imscc{hasAnyAssigned && <span className="opacity-75 ml-1">({totalLevelAss + totalGroupAss})</span>}</>}
          </button>

          <button
            onClick={handleExportPDF}
            disabled={busy || !hasAnyAssigned}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              hasAnyAssigned && !busy
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {exportingPDF ? <><SpinnerIcon />Exportiere…</> : <><PdfIcon />Alle als PDF{hasAnyAssigned && <span className="opacity-75 ml-1">({totalLevelAss + totalGroupAss})</span>}</>}
          </button>

          {exportMsg && (
            <span className={`text-sm font-medium ${exportMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {exportMsg.type === 'success' ? '✓ ' : '✗ '}{exportMsg.message}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EducationalMaterialsPanel;
