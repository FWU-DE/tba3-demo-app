import { useState, useMemo } from 'react';
import { useFilters } from '../../context/useFilters';
import { useCompetenceLevels } from '../../hooks/useCompetenceLevels';
import { transformCompetenceLevels } from '../../utils/dataTransformers';
import { EDUCATIONAL_MATERIALS, COMPETENCE_LEVELS, GROUPS } from '../../utils/constants';
import { useKonstanten, useTexte } from '../../i18n';
import HtmlText from '../../i18n/HtmlText';
import { loadCustomGroups } from '../../utils/customGroupsStore';
import { STUDENTS } from '../../utils/studentData';
import Card from '../common/Card';
import LoadingSkeleton from '../common/LoadingSkeleton';
import MundoSearchModal from './MundoSearchModal';
import SchnittstellenMaterialien from './SchnittstellenMaterialien';
import { planAnwenden } from '../../utils/materialien';

// ── Storage ───────────────────────────────────────────────────────────────────

const LEVEL_KEY  = 'tba3_materials_by_level';   // { I: [matId], II: […], … }
const GROUP_KEY  = 'tba3_materials_by_group';   // { [groupId]: [matId] }
const EXT_KEY    = 'tba3_external_materials';   // { [id]: { id, title, description, url, source } }

const load  = (key) => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
const save  = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const loadExternal = () => Object.values(load(EXT_KEY));
const saveExternal = (arr) => save(EXT_KEY, Object.fromEntries(arr.map((m) => [m.id, m])));

const LEVEL_KEYS = ['I', 'II', 'III', 'IV', 'V'];

// Materialien aus dem lokalen Pool tragen Art, Fach und Dauer; was von außen
// kommt, hat davon nichts und wird deshalb anders gezeichnet. „Außen" waren
// bisher nur MUNDO-Treffer, seit dem Modus „Aus der Schnittstelle" auch
// Materialien aus `/materials`.
const FREMDE_QUELLEN = ['mundo', 'schnittstelle'];
const istFremd = (material) => FREMDE_QUELLEN.includes(material.source);
const quellenName = (material) => (material.source === 'mundo' ? 'MUNDO' : null);

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
  const t = useTexte();
  const { COMPETENCE_LEVELS } = useKonstanten();
  const cfg = COMPETENCE_LEVELS[levelKey];
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <button
      data-testid={`materialien-stufe-${levelKey}`}
      onClick={onClick}
      className={`relative flex-1 min-w-0 rounded-xl border-2 p-4 text-left transition-all ${
        isActive
          ? 'border-current shadow-md scale-105'
          : 'border-transparent bg-gray-50 hover:bg-gray-100'
      }`}
      style={isActive ? { borderColor: cfg.color, backgroundColor: cfg.color + '18' } : {}}
    >
      {assignedCount > 0 && (
        <span
          data-testid={`materialien-stufe-${levelKey}-zugewiesen`}
          className="absolute top-2 right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
        >
          {assignedCount}
        </span>
      )}
      <div className="text-lg font-bold mb-1" style={{ color: cfg.color }}>
        Stufe {levelKey}
      </div>
      <div className="text-2xl font-bold text-gray-900">{count}</div>
      <div className="text-xs text-gray-500 mt-0.5">{t('materialien.schuelerAnteil', { pct })}</div>
      <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
      </div>
      <div className="text-xs mt-1.5 text-gray-400 leading-tight">{cfg.description}</div>
    </button>
  );
};

const MaterialCard = ({ material, isAssigned, isSelected, onToggle, showLevels = true }) => {
  const t = useTexte();
  const { MATERIAL_TYPES, SUBJECTS } = useKonstanten();
  const type    = MATERIAL_TYPES[material.type];
  const subject = SUBJECTS[material.subject];
  const isExternal = istFremd(material);
  const quelle = quellenName(material) ?? t('materialien.quelleSchnittstelle');

  return (
    <div
      data-testid={`material-${material.id}`}
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
          <span className="text-xs font-bold tracking-wide text-blue-600 uppercase">{quelle}</span>
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
            <span className="text-green-600 text-xs font-semibold whitespace-nowrap">{t('materialien.zugewiesen')}</span>
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
  const t = useTexte();
  const { MATERIAL_TYPES, SUBJECTS } = useKonstanten();
  const type    = MATERIAL_TYPES[material.type];
  const subject = SUBJECTS[material.subject];
  const isExternal = istFremd(material);
  const quelle = quellenName(material) ?? t('materialien.quelleSchnittstelle');

  return (
    <div className={`flex items-center justify-between gap-3 py-2 border-b last:border-0 ${isExternal ? 'border-blue-100' : 'border-gray-100'}`}>
      <div className="flex items-center gap-2 min-w-0">
        {isExternal ? (
          <span className="flex-shrink-0 text-xs font-bold text-blue-500 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 leading-none">
            {quelle}
          </span>
        ) : (
          <span className="flex-shrink-0">{type?.icon}</span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{material.title}</p>
          {isExternal ? (
            material.url
              ? <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">{material.url}</a>
              : <p className="text-xs text-gray-400">{t('materialien.externesMaterial')}</p>
          ) : (
            <p className="text-xs text-gray-400">{subject?.name} · {material.duration}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onRemove(material.id)}
        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
      >
        {t('gemeinsam.entfernen')}
      </button>
    </div>
  );
};

// ── Catalog + assign section (shared by both modes) ───────────────────────────

const CatalogSection = ({
  assignedIds, catalogMaterials, onAssign, onRemove, title,
  showLevels = true, extraMaterials = [], onMundoClick,
}) => {
  const t = useTexte();
  const [selected, setSelected] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auswahl verwerfen, sobald sich Katalog oder Zuweisungen ändern. Beim
  // Rendern statt im Effekt — so wird kein Durchlauf mit veralteter Auswahl
  // angezeigt (React-Muster „Zustand beim Wechsel von Props anpassen").
  const katalogStand = `${assignedIds.join(',')}|${catalogMaterials.length}`;
  const [letzterStand, setLetzterStand] = useState(katalogStand);
  if (letzterStand !== katalogStand) {
    setLetzterStand(katalogStand);
    setSelected([]);
  }

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
          <p className="text-sm text-gray-400 py-2">{t('materialien.keineZugewiesen')}</p>
        ) : (
          assignedMaterials.map((m) => (
            <AssignedRow key={m.id} material={m} onRemove={onRemove} />
          ))
        )}
      </Card>

      {/* Catalog */}
      <Card title={t('materialien.auswaehlenTitel')}>
        {/* Mundo search button */}
        {onMundoClick && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <p className="text-xs text-gray-500">
              {t('materialien.lokalOderMundo')}
            </p>
            <button
              onClick={onMundoClick}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              <span className="text-sm">🌍</span>
              {t('materialien.mundoSuche')}
            </button>
          </div>
        )}

        {catalogMaterials.length === 0 && extraMaterials.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            {t('materialien.keinePassenden')}
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">
              {t('materialien.zaehler', { lokal: catalogMaterials.length, mundo: extraMaterials.length })}
              {selected.length > 0 && (
                <span className="ml-2 text-primary font-medium">
                  {t('materialien.ausgewaehltZusatz', { n: selected.length })}
                </span>
              )}
            </p>

            {/* Local materials */}
            {catalogMaterials.length > 0 && (
              <>
                {extraMaterials.length > 0 && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('materialien.lokalerPool')}</p>
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
                data-testid="materialien-zuweisen"
                onClick={handleAssign}
                disabled={selected.length === 0}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  selected.length > 0
                    ? 'bg-primary text-white hover:bg-blue-700 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selected.length > 0
                  ? t(selected.length === 1 ? 'materialien.zuweisenEines' : 'materialien.zuweisenMehrere', { n: selected.length })
                  : t('materialien.materialWaehlen')}
              </button>
              {showSuccess && <span className="text-sm text-green-600 font-medium">{t('materialien.erfolgreich')}</span>}
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
  const t = useTexte();
  const { selectedLevel, getSelectedId, selectedSubject, selectedGrade } = useFilters();
  const predefinedGroupId = selectedLevel === 'group' ? getSelectedId() : null;
  const predefinedGroup   = GROUPS.find((g) => g.id === predefinedGroupId);

  // ── Mode ──
  // Einmal beim ersten Rendern: kommt die Ansicht aus einer verlinkten Gruppe?
  const [navigierteGruppe] = useState(() => {
    const id = sessionStorage.getItem('tba3_navigate_custom_group');
    if (id) sessionStorage.removeItem('tba3_navigate_custom_group');
    return id;
  });

  const [mode, setMode] = useState(navigierteGruppe ? 'group' : 'level'); // 'level' | 'group'

  // ── Level-mode state ──
  const [activeLevel,   setActiveLevel]   = useState(null);
  const [levelAss,      setLevelAss]      = useState(() => load(LEVEL_KEY));

  // ── Group-mode state ──
  const [customGroups] = useState(loadCustomGroups);
  const [activeGroupId, setActiveGroupId] = useState(navigierteGruppe);
  const [groupAss,      setGroupAss]      = useState(() => load(GROUP_KEY));

  // ── External (MUNDO) materials ──
  const [externalMaterials, setExternalMaterials] = useState(loadExternal);
  const [showMundo, setShowMundo] = useState(false);

  // ── Export state ──
  const [exportingCC,  setExportingCC]  = useState(null);
  const [exportingPDF, setExportingPDF] = useState(null);
  const [exportMsg,    setExportMsg]    = useState(null);

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
      extraGroups.push({ id: levelId, name: t('materialien.modusStufe'), subject: '', grade: '', _type: 'level' });
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

  /**
   * Die Auto-Zuweisung schreibt in dieselben beiden Ablagen wie MUNDO: die
   * Materialien selbst nach `EXT_KEY`, damit die Stufenansicht sie zeichnen
   * kann, die Zuordnung nach `LEVEL_KEY`. Danach ist ein Material aus der
   * Schnittstelle von einem MUNDO-Treffer nicht mehr zu unterscheiden — außer
   * an seiner Herkunft, und genau die steht auf der Karte.
   */
  const handleSchnittstellenZuweisung = (plan) => {
    const neueMaterialien = [
      ...plan.allgemein,
      ...LEVEL_KEYS.flatMap((stufe) => plan.jeStufe[stufe]),
    ].map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description ?? '',
      url: m.url ?? null,
      source: 'schnittstelle',
    }));

    const zusammen = [
      ...externalMaterials,
      ...neueMaterialien.filter((neu) => !externalMaterials.some((alt) => alt.id === neu.id)),
    ];
    setExternalMaterials(zusammen);
    saveExternal(zusammen);

    const zuordnung = planAnwenden(plan, levelAss);
    setLevelAss(zuordnung);
    save(LEVEL_KEY, zuordnung);
  };

  const flashMsg = (msg) => { setExportMsg(msg); setTimeout(() => setExportMsg(null), 5000); };

  const handleExportCC = async () => {
    setExportingCC(true);
    const { assignments: exp, extraGroups } = buildExport();
    try {
      const { exportCommonCartridge } = await import('../../utils/commonCartridgeExport');
      const count = await exportCommonCartridge(exp, null, extraGroups, externalMaterials);
      flashMsg({ type: 'success', message: t('materialien.exportiertImscc', { n: count }) });
    } catch (err) {
      flashMsg({ type: 'error', message: err.message });
    } finally { setExportingCC(false); }
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    const { assignments: exp, extraGroups } = buildExport();
    try {
      const { exportPDF } = await import('../../utils/pdfExport');
      const count = await exportPDF(exp, null, extraGroups, externalMaterials);
      flashMsg({ type: 'success', message: t('materialien.exportiertPdf', { n: count }) });
    } catch (err) {
      flashMsg({ type: 'error', message: err.message });
    } finally { setExportingPDF(false); }
  };

  const busy = exportingCC || exportingPDF;

  // ── Render ──

  return (
    <div className="space-y-6" data-testid="ansicht-materialien">

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
          { key: 'level', label: t('materialien.modusStufe'), icon: '📊' },
          { key: 'group', label: t('materialien.modusGruppe'), icon: '👥' },
          { key: 'api',   label: t('materialien.modusSchnittstelle'), icon: '🔌' },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            data-testid={`materialien-modus-${key}`}
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
          <Card
            title={
              predefinedGroup
                ? `${t('materialien.stufeWaehlen')} – ${predefinedGroup.name}`
                : t('materialien.stufeWaehlen')
            }
          >
            <p className="text-sm text-gray-500 mb-4">
              {t('materialien.stufeEinleitung')}
              {predefinedGroup && (
                <span className="ml-1 text-gray-400">
                  ({t('materialien.schueleranzahlAusLabel')}: {predefinedGroup.name})
                </span>
              )}
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
              title={`${t('materialien.zugewieseneMaterialien')} – ${t('gemeinsam.stufe', { n: activeLevel })}`}
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
          <Card title={t('materialien.gruppeWaehlen')}>
            {customGroups.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-lg">
                {t('materialien.keineGruppen')}<br />
                <HtmlText als="span" pfad="materialien.keineGruppenZusatz" className="text-xs" />
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
                        <span className="text-xs text-gray-400">{t('materialien.mitglieder', { n: members.length })}</span>
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
              title={`${t('materialien.zugewieseneMaterialien')} – ${activeGroup.name}`}
              showLevels={false}
              extraMaterials={externalMaterials}
              onMundoClick={() => setShowMundo(true)}
            />
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODUS 3: Aus der Schnittstelle                                        */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {mode === 'api' && (
        <SchnittstellenMaterialien onZuweisen={handleSchnittstellenZuweisung} />
      )}

      {/* ── Export ── */}
      <Card title={t('materialien.exportTitel')}>
        <p className="text-sm text-gray-500 mb-4">
          {t('materialien.exportEinleitung')}
        </p>

        {/* Summary */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 text-center">
            <div className="text-xl font-bold text-gray-900">{totalLevelAss}</div>
            <div className="text-xs text-gray-500 mt-0.5">{t('materialien.nachStufe')}</div>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 text-center">
            <div className="text-xl font-bold text-gray-900">{totalGroupAss}</div>
            <div className="text-xs text-gray-500 mt-0.5">{t('materialien.nachGruppe')}</div>
          </div>
        </div>

        {!hasAnyAssigned && (
          <p className="text-sm text-gray-400 mb-4">
            {t('materialien.keineZugewiesen')}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            data-testid="export-imscc"
            onClick={handleExportCC}
            disabled={busy || !hasAnyAssigned}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              hasAnyAssigned && !busy
                ? 'bg-gray-900 text-white hover:bg-gray-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {exportingCC ? <><SpinnerIcon />{t('materialien.exportiere')}</> : <><DownloadIcon />{t('materialien.alleImscc')}{hasAnyAssigned && <span className="opacity-75 ml-1">({totalLevelAss + totalGroupAss})</span>}</>}
          </button>

          <button
            data-testid="export-pdf"
            onClick={handleExportPDF}
            disabled={busy || !hasAnyAssigned}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              hasAnyAssigned && !busy
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {exportingPDF ? <><SpinnerIcon />{t('materialien.exportiere')}</> : <><PdfIcon />{t('materialien.allePdf')}{hasAnyAssigned && <span className="opacity-75 ml-1">({totalLevelAss + totalGroupAss})</span>}</>}
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
