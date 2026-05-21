import { useState, useMemo } from 'react';
import { useFilters } from '../../context/FilterContext';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { COMPETENCE_LEVELS, GROUPS, SUBJECTS, GRADES, EDUCATIONAL_MATERIALS, MATERIAL_TYPES, GENDERS } from '../../utils/constants';
import { exportStudentPDF } from '../../utils/studentPdfExport';

const LEVEL_ORDER = ['I', 'II', 'III', 'IV', 'V'];
const LEVEL_TO_NUM = { I: 1, II: 2, III: 3, IV: 4, V: 5 };

// ── Level gauge ───────────────────────────────────────────────────────────────

const LevelGauge = ({ level }) => (
  <div className="flex gap-1.5">
    {LEVEL_ORDER.map((lk) => {
      const cfg = COMPETENCE_LEVELS[lk];
      const active = LEVEL_TO_NUM[lk] <= LEVEL_TO_NUM[level];
      const isOwn = lk === level;
      return (
        <div key={lk} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded transition-all ${isOwn ? 'h-6 ring-2 ring-offset-1' : 'h-5'}`}
            style={{
              backgroundColor: active ? cfg.color : '#e5e7eb',
              ringColor: cfg.color,
            }}
          />
          <span
            className={`text-xs font-bold ${isOwn ? 'text-gray-900' : active ? 'text-gray-500' : 'text-gray-300'}`}
          >
            {lk}
          </span>
        </div>
      );
    })}
  </div>
);

// ── Domain bar ────────────────────────────────────────────────────────────────

const DomainBar = ({ name, level }) => {
  const cfg = COMPETENCE_LEVELS[level];
  const pct = (LEVEL_TO_NUM[level] / 5) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-56 flex-shrink-0 truncate">{name}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: cfg?.color ?? '#6b7280' }}
        />
      </div>
      <span
        className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white w-20 text-center flex-shrink-0"
        style={{ backgroundColor: cfg?.color ?? '#6b7280' }}
      >
        Stufe {level}
      </span>
    </div>
  );
};

// ── Material card ─────────────────────────────────────────────────────────────

const MaterialCard = ({ material }) => {
  const type = MATERIAL_TYPES[material.type];
  const isDiagnostic = material.type === 'diagnostic';
  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all ${
        isDiagnostic
          ? 'border-amber-200 bg-amber-50/60 hover:bg-amber-50 hover:shadow-sm'
          : 'border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm'
      }`}
    >
      <div
        className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded text-white mt-0.5 flex items-center gap-1"
        style={{ backgroundColor: isDiagnostic ? '#d97706' : '#2563eb' }}
      >
        {type?.icon && <span aria-hidden>{type.icon}</span>}
        {type?.label ?? material.type}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{material.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{material.description}</p>
      </div>
      {material.duration && (
        <span className="text-xs text-gray-400 flex-shrink-0 mt-1">{material.duration}</span>
      )}
    </div>
  );
};

// ── Radar chart (Spinnennetzgrafik) ──────────────────────────────────────────
// Visualisiert Teilkompetenzen als prozentualen (ungewichteten) Durchschnitts-
// punktwert der zugehörigen Aufgaben (0–100 %). Die Kompetenzstufen-Schwellen
// werden als Referenz in Tooltip und Legende mitgeliefert.

// Kompetenzstufen-Schwellen (in %): [<14%=I, <38%=II, <73%=III, <91%=IV, ≥91%=V]
// Deckt sich mit studentData.js → pctToLevel().
const LEVEL_THRESHOLDS_PCT = [
  { level: 'I',   min: 0,  max: 14, color: COMPETENCE_LEVELS.I.color },
  { level: 'II',  min: 14, max: 38, color: COMPETENCE_LEVELS.II.color },
  { level: 'III', min: 38, max: 73, color: COMPETENCE_LEVELS.III.color },
  { level: 'IV',  min: 73, max: 91, color: COMPETENCE_LEVELS.IV.color },
  { level: 'V',   min: 91, max: 100, color: COMPETENCE_LEVELS.V.color },
];

const pctToLevel = (pct) => {
  for (const t of LEVEL_THRESHOLDS_PCT) {
    if (pct < t.max) return t;
  }
  return LEVEL_THRESHOLDS_PCT[LEVEL_THRESHOLDS_PCT.length - 1];
};

const RadarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const t = pctToLevel(p.score);
  return (
    <div className="rounded-lg bg-white border border-gray-200 shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-900">{p.domain}</p>
      <p className="text-gray-700">
        Ø Punktwert: <span className="font-bold text-gray-900">{Math.round(p.score)}%</span>
      </p>
      <p className="text-gray-500">
        entspricht <span className="font-semibold" style={{ color: t.color }}>Stufe {t.level}</span>
      </p>
    </div>
  );
};

const CompetenceRadar = ({ domainLevels, domainScores, overallLevel, overallScore, color }) => {
  const data = useMemo(() => {
    const entries = Object.entries(domainLevels ?? {});
    const rows = entries.map(([name, lvl]) => ({
      domain: name,
      score: domainScores?.[name] ?? (LEVEL_TO_NUM[lvl] / 5) * 100,
    }));
    // Wenn < 3 Domänen: Gesamtergebnis ergänzen, damit das Netz ein Polygon ist.
    if (rows.length > 0 && rows.length < 3) {
      rows.push({
        domain: 'Gesamt',
        score: overallScore ?? (LEVEL_TO_NUM[overallLevel] / 5) * 100,
      });
    }
    return rows;
  }, [domainLevels, domainScores, overallLevel, overallScore]);

  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-1">
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
        </svg>
        Kompetenzprofil (Spinnennetz)
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Ungewichteter Durchschnittswert der Aufgaben je Teilbereich in Prozent (0 % innen – 100 % außen).
      </p>
      <div className="w-full" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="78%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="domain"
              tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              ticks={[20, 40, 60, 80, 100]}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Radar
              name="Ø Punktwert"
              dataKey="score"
              stroke={color}
              fill={color}
              fillOpacity={0.35}
              isAnimationActive
            />
            <Tooltip content={<RadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {/* Mini-Legende Kompetenzstufen-Schwellen */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
        <span className="text-gray-400 font-medium">Schwellen:</span>
        {LEVEL_THRESHOLDS_PCT.map((t) => (
          <span key={t.level} className="inline-flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: t.color }}
            />
            <span>
              Stufe {t.level}
              <span className="text-gray-400">
                {' '}{t.min === 0 ? `<${t.max}%` : t.max === 100 ? `≥${t.min}%` : `${t.min}–${t.max - 1}%`}
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const StudentDetailView = ({ student, onBack }) => {
  const [pdfLoading, setPdfLoading] = useState(false);
  const { observerMode } = useFilters();

  const group = GROUPS.find((g) => g.id === student.classGroupId);
  const subject = SUBJECTS[student.subject];
  const grade = GRADES[student.grade];
  const levelCfg = COMPETENCE_LEVELS[student.competenceLevel];
  const domains = Object.entries(student.domainLevels ?? {});

  const recommendedMaterials = EDUCATIONAL_MATERIALS.filter(
    (m) =>
      m.subject === student.subject &&
      m.grade === student.grade &&
      m.targetLevels?.includes(student.competenceLevel)
  );

  const learningMaterials   = recommendedMaterials.filter((m) => m.type !== 'diagnostic');
  const diagnosticMaterials = recommendedMaterials.filter((m) => m.type === 'diagnostic');

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      exportStudentPDF(student);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Back + actions bar ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Zurück zur Schüler-Übersicht
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
            pdfLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-blue-700 active:scale-95'
          }`}
        >
          {pdfLoading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          {pdfLoading ? 'Wird erstellt…' : 'Datenblatt als PDF'}
        </button>
      </div>

      {/* ── Student header card ── */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm border border-gray-100"
        style={{ background: `linear-gradient(135deg, ${levelCfg?.color}18 0%, white 60%)` }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-6">
            {/* Left: name + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className={`text-3xl font-black text-gray-900 truncate ${observerMode ? 'blur select-none' : ''}`}>
                  {student.firstName} {student.lastName}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                {group && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium text-xs">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {group.name}
                  </span>
                )}
                {subject && (
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-white font-medium text-xs"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.name}
                  </span>
                )}
                {grade && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium text-xs">
                    {grade.name}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {GENDERS[student.gender] ?? student.gender}
                </span>
              </div>
            </div>

            {/* Right: big level badge */}
            <div className="flex-shrink-0 text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: levelCfg?.color }}
              >
                <span className="text-4xl font-black text-white leading-none">
                  {student.competenceLevel}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">Kompetenzstufe</p>
            </div>
          </div>
        </div>

        {/* Level gauge bar */}
        <div className="px-6 pb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Gesamtergebnis
          </p>
          <LevelGauge level={student.competenceLevel} />
          <p className="text-xs text-gray-500 mt-2">
            <span className="font-semibold" style={{ color: levelCfg?.color }}>{levelCfg?.name}</span>
            {' · '}{levelCfg?.description}
          </p>
        </div>
      </div>

      {/* ── Radar / Spinnennetzgrafik ── */}
      {domains.length > 0 && (
        <CompetenceRadar
          domainLevels={student.domainLevels}
          domainScores={student.domainScores}
          overallLevel={student.competenceLevel}
          overallScore={student.score}
          color={levelCfg?.color ?? '#2563eb'}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Domain breakdown ── */}
        {domains.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ergebnisse nach Teilbereich
            </h2>
            <div className="space-y-3.5">
              {domains.map(([name, level]) => (
                <DomainBar key={name} name={name} level={level} />
              ))}
            </div>
          </div>
        )}

        {/* ── Competence level overview ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Übersicht Kompetenzstufen
          </h2>
          <div className="space-y-1.5">
            {LEVEL_ORDER.map((lk) => {
              const cfg = COMPETENCE_LEVELS[lk];
              const isOwn = lk === student.competenceLevel;
              return (
                <div
                  key={lk}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    isOwn ? 'bg-gray-50 ring-1' : ''
                  }`}
                  style={isOwn ? { ringColor: cfg.color } : {}}
                >
                  <span
                    className="flex-shrink-0 w-8 h-6 rounded flex items-center justify-center text-xs font-black text-white"
                    style={{ backgroundColor: cfg.color }}
                  >
                    {lk}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${isOwn ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {cfg.name}
                    </p>
                    <p className="text-xs text-gray-400">{cfg.description}</p>
                  </div>
                  {isOwn && (
                    <span
                      className="flex-shrink-0 text-xs font-semibold"
                      style={{ color: cfg.color }}
                    >
                      ← aktuell
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recommended learning materials ── */}
      {learningMaterials.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Empfohlene Lernmaterialien
            <span
              className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: levelCfg?.color }}
            >
              Stufe {student.competenceLevel}
            </span>
          </h2>
          <div className="grid gap-2.5">
            {learningMaterials.map((mat) => (
              <MaterialCard key={mat.id} material={mat} />
            ))}
          </div>
        </div>
      )}

      {/* ── Supplementary diagnostics ── */}
      {diagnosticMaterials.length > 0 && (
        <div className="bg-amber-50/40 rounded-2xl border border-amber-200 shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                Ergänzende Diagnostik
                <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full text-white bg-amber-600">
                  optional
                </span>
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl">
                Diese kurzen Diagnose-Instrumente helfen, die konkrete Förderbaustelle innerhalb
                der Kompetenzstufe {student.competenceLevel} präziser zu bestimmen, bevor mit
                der Förderung begonnen wird.
              </p>
            </div>
          </div>
          <div className="grid gap-2.5">
            {diagnosticMaterials.map((mat) => (
              <MaterialCard key={mat.id} material={mat} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetailView;
