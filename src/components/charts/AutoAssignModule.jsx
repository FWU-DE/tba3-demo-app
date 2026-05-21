import { useState, useMemo } from 'react';
import { DEMO_MATERIALS, KIND_LABELS } from '../../data/demoMaterials';

const LEVEL_KEY = 'tba3_materials_by_level';
const EXT_KEY = 'tba3_external_materials';
const LEVEL_KEYS = ['I', 'II', 'III', 'IV', 'V'];

const load = (key) => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const AutoAssignModule = ({ onAssigned }) => {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [assignedCount, setAssignedCount] = useState(0);

  // Compute preview
  const { levelMap, generalMaterials, otherCount } = useMemo(() => {
    const levelMap = { I: [], II: [], III: [], IV: [], V: [] };
    const generalMaterials = [];
    let otherCount = 0;

    DEMO_MATERIALS.forEach((m) => {
      const att = m.attachments?.[0];
      if (!att) return;
      if (att.scope === 'competence-level' && LEVEL_KEYS.includes(att.refName)) {
        levelMap[att.refName].push(m);
      } else if (att.scope === 'general') {
        generalMaterials.push(m);
      } else {
        otherCount++;
      }
    });
    return { levelMap, generalMaterials, otherCount };
  }, []);

  const totalAssignable = Object.values(levelMap).reduce((s, arr) => s + arr.length, 0) + generalMaterials.length;

  const handleAssign = () => {
    // 1. Update level assignments
    const levelAss = load(LEVEL_KEY);
    LEVEL_KEYS.forEach((lk) => {
      const ids = [
        ...new Set([
          ...(levelAss[lk] || []),
          ...levelMap[lk].map((m) => m.id),
          ...generalMaterials.map((m) => m.id),
        ]),
      ];
      levelAss[lk] = ids;
    });
    save(LEVEL_KEY, levelAss);

    // 2. Save material metadata to external materials store so existing tabs can render them
    const ext = load(EXT_KEY);
    const toStore = [
      ...Object.values(levelMap).flat(),
      ...generalMaterials,
    ];
    toStore.forEach((m) => {
      ext[m.id] = {
        id: m.id,
        title: m.title,
        description: m.description || KIND_LABELS[m.kind] || m.kind,
        url: m.url || null,
        source: 'api-demo',
      };
    });
    save(EXT_KEY, ext);

    setDone(true);
    setAssignedCount(totalAssignable);
    if (onAssigned) onAssigned();
  };

  return (
    <div data-testid="auto-assign-module" className="border border-blue-200 rounded-xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-blue-50/80 transition-colors"
      >
        <span className="text-xl">⚡</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-sm">Auto-Zuweisung</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Materialien anhand ihrer API-Metadaten automatisch den richtigen Kompetenzstufen zuweisen
          </p>
        </div>
        {done && (
          <span className="text-xs text-green-600 font-semibold mr-2">✓ {assignedCount} zugewiesen</span>
        )}
        <svg className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-blue-100 bg-white/70">
          <p className="text-xs text-gray-500 mt-4 mb-3">
            Der Algorithmus analysiert die <code className="bg-gray-100 px-1 rounded">attachments</code>-Metadaten
            der API-Materialien und ordnet sie automatisch zu:
          </p>

          {/* Preview table */}
          <div className="rounded-lg border border-gray-200 overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ziel</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Materialien</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Anzahl</th>
                </tr>
              </thead>
              <tbody>
                {LEVEL_KEYS.map((lk) => (
                  <tr key={lk} className="border-b border-gray-100 last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-700">Stufe {lk}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">
                      {levelMap[lk].map((m) => m.title).join(', ') || '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-gray-800">{levelMap[lk].length}</td>
                  </tr>
                ))}
                <tr className="border-b border-gray-100 bg-blue-50/30">
                  <td className="px-3 py-2 font-medium text-blue-700">Alle Stufen</td>
                  <td className="px-3 py-2 text-gray-500 text-xs">
                    {generalMaterials.map((m) => m.title).join(', ') || '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-blue-700">{generalMaterials.length}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {otherCount > 0 && (
            <p className="text-xs text-gray-400 mb-4">
              ℹ️ {otherCount} weitere Materialien (Item / Aufgabe / Test / Leitidee) werden nicht automatisch
              Kompetenzstufen zugewiesen — sie benötigen kontextspezifische Zuordnung.
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              data-testid="auto-assign-apply"
              onClick={handleAssign}
              disabled={totalAssignable === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                totalAssignable > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              ⚡ Jetzt automatisch zuweisen ({totalAssignable} Materialien)
            </button>
            <button onClick={() => setOpen(false)} className="text-sm text-gray-400 hover:text-gray-600">
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoAssignModule;
