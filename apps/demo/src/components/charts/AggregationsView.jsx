import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { useFilters } from '../../context/FilterContext';
import { useAggregations } from '../../hooks/useAggregations';
import { COMPETENCE_LEVELS, GROUPS, SUBJECTS, GRADES } from '../../utils/constants';
import { STUDENTS } from '../../utils/studentData';
import Card from '../common/Card';
import LoadingSkeleton from '../common/LoadingSkeleton';

// ── Local fallback charts from student data ───────────────────────────────────

const LEVEL_KEYS = ['I', 'II', 'III', 'IV', 'V'];

const LocalCompetenceChart = ({ students }) => {
  const counts = LEVEL_KEYS.reduce((acc, lk) => ({ ...acc, [lk]: 0 }), {});
  students.forEach((s) => { counts[s.competenceLevel] = (counts[s.competenceLevel] || 0) + 1; });
  const total = students.length;

  const data = LEVEL_KEYS.map((lk) => ({
    level: lk,
    count: counts[lk],
    pct: total > 0 ? Math.round((counts[lk] / total) * 100) : 0,
    color: COMPETENCE_LEVELS[lk]?.color ?? '#6b7280',
    name: COMPETENCE_LEVELS[lk]?.description ?? lk,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="font-bold" style={{ color: d.color }}>Stufe {d.level}</p>
        <p className="text-gray-600">{d.name}</p>
        <p className="mt-1"><span className="font-semibold">{d.count}</span> Schüler*innen</p>
        <p className="text-gray-500">{d.pct}% der Gruppe</p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis
          dataKey="level"
          tick={{ fontSize: 13, fontWeight: 700 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
          {data.map((entry) => (
            <Cell key={entry.level} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const LocalDomainChart = ({ students }) => {
  // Collect all domain names from these students
  const domainCounts = {};
  const domainTotals = {};
  students.forEach((s) => {
    Object.entries(s.domainLevels ?? {}).forEach(([domain, level]) => {
      if (!domainCounts[domain]) {
        domainCounts[domain] = { I: 0, II: 0, III: 0, IV: 0, V: 0 };
        domainTotals[domain] = 0;
      }
      domainCounts[domain][level] = (domainCounts[domain][level] || 0) + 1;
      domainTotals[domain]++;
    });
  });

  const domains = Object.keys(domainCounts);
  if (domains.length === 0) return null;

  const data = domains.map((d) => {
    const entry = { domain: d };
    LEVEL_KEYS.forEach((lk) => {
      entry[lk] = domainCounts[d][lk] || 0;
    });
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, domains.length * 50 + 40)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 8, left: 4, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="domain"
          width={150}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value, name) => [`${value} Schüler*innen`, `Stufe ${name}`]}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend formatter={(v) => `Stufe ${v}`} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        {LEVEL_KEYS.map((lk) => (
          <Bar key={lk} dataKey={lk} stackId="a" fill={COMPETENCE_LEVELS[lk]?.color} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

// ── API-based chart: competence aggregation ───────────────────────────────────

const ApiCompetenceChart = ({ competenceAggregation }) => {
  const data = (competenceAggregation || []).map((comp) => ({
    level: comp.nameShort,
    count: comp.descriptiveStatistics?.frequency ?? 0,
    pct: Math.round((comp.descriptiveStatistics?.mean ?? 0) * 100),
    color: COMPETENCE_LEVELS[comp.nameShort]?.color ?? '#6b7280',
    name: COMPETENCE_LEVELS[comp.nameShort]?.description ?? comp.nameShort,
  }));

  if (data.length === 0) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="font-bold" style={{ color: d.color }}>Stufe {d.level}</p>
        <p className="text-gray-600">{d.name}</p>
        <p className="mt-1"><span className="font-semibold">{d.count}</span> Schüler*innen ({d.pct}%)</p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="level" tick={{ fontSize: 13, fontWeight: 700 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={56}>
          {data.map((entry) => <Cell key={entry.level} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ── API-based chart: exercise solution frequencies ────────────────────────────

const ExerciseChart = ({ exerciseAggregation }) => {
  const data = (exerciseAggregation || []).map((ex, i) => ({
    name: ex.exercise?.name || `Aufg. ${i + 1}`,
    pct: Math.round((ex.solutionFrequency ?? 0) * 100),
  }));

  if (data.length === 0) return null;

  const getBarColor = (pct) => {
    if (pct < 40) return '#ef4444';
    if (pct < 65) return '#f97316';
    if (pct < 80) return '#eab308';
    return '#22c55e';
  };

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 30 + 40)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 40, left: 4, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip formatter={(v) => [`${v}%`, 'Lösungshäufigkeit']} contentStyle={{ fontSize: 12 }} />
        <Bar dataKey="pct" radius={[0, 4, 4, 0]} maxBarSize={22} label={{ position: 'right', fontSize: 11, formatter: (v) => `${v}%` }}>
          {data.map((entry, i) => (
            <Cell key={i} fill={getBarColor(entry.pct)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ── Stat chips ────────────────────────────────────────────────────────────────

const StatChip = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
    <div className="text-xl font-bold text-gray-900">{value}</div>
    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const AggregationsView = ({ level, id }) => {
  const { buildQueryParams, selectedLevel, selectedGroup, selectedSubject, selectedGrade } = useFilters();
  const { data, loading, error, refetch } = useAggregations(level, id, buildQueryParams());

  // Local student data filtered by current sidebar selection
  const localStudents = STUDENTS.filter((s) => {
    if (selectedLevel === 'group' && selectedGroup && s.classGroupId !== selectedGroup) return false;
    if (selectedSubject && s.subject !== selectedSubject) return false;
    if (selectedGrade && s.grade !== selectedGrade) return false;
    return true;
  });

  const localGroup = GROUPS.find((g) => g.id === selectedGroup);
  const localSubject = SUBJECTS[selectedSubject ?? localGroup?.subject];
  const localGrade = GRADES[selectedGrade ?? localGroup?.grade];

  const levelCounts = LEVEL_KEYS.reduce((acc, lk) => {
    acc[lk] = localStudents.filter((s) => s.competenceLevel === lk).length;
    return acc;
  }, {});

  // ── Loading state ──
  if (loading) {
    return (
      <div className="space-y-6">
        <LocalDataSection
          students={localStudents}
          levelCounts={levelCounts}
          group={localGroup}
          subject={localSubject}
          grade={localGrade}
        />
        <Card title="API-Aggregationen">
          <LoadingSkeleton height="200px" />
        </Card>
      </div>
    );
  }

  // ── Error / no-data state – still show local charts ──
  if (error || !Array.isArray(data) || data.length === 0) {
    return (
      <LocalDataSection
        students={localStudents}
        levelCounts={levelCounts}
        group={localGroup}
        subject={localSubject}
        grade={localGrade}
      />
    );
  }

  // ── API data available ──
  const groupedByDomain = data.reduce((acc, item) => {
    const domainName = item.domain?.name || 'Gesamt';
    if (!acc[domainName]) acc[domainName] = [];
    acc[domainName].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <LocalDataSection
        students={localStudents}
        levelCounts={levelCounts}
        group={localGroup}
        subject={localSubject}
        grade={localGrade}
      />

      {Object.entries(groupedByDomain).map(([domainName, items]) => (
        <Card key={domainName} title={domainName}>
          {items.map((item, idx) => (
            <div key={idx} className={idx > 0 ? 'mt-6 pt-6 border-t border-gray-100' : ''}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.subject?.name}</p>
                </div>
              </div>
              {item.aggregations?.map((agg, ai) => (
                <AggSection key={ai} agg={agg} />
              ))}
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
};

// ── Local data section (always rendered) ─────────────────────────────────────

const LocalDataSection = ({ students, levelCounts, group, subject, grade }) => {
  const total = students.length;
  const dominant = LEVEL_KEYS.reduce((a, b) => (levelCounts[a] >= levelCounts[b] ? a : b));
  const atRisk = (levelCounts['I'] || 0) + (levelCounts['II'] || 0);

  return (
    <Card title={`Kompetenzverteilung – ${group?.name ?? (subject?.name ? `${subject.name} ${grade?.name ?? ''}` : 'Alle')}`}>
      <p className="text-xs text-gray-500 mb-4">
        Verteilung der Kompetenzstufen basierend auf den Schülerdaten der aktuellen Auswahl.
      </p>

      {/* Stat chips */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatChip label="Schüler*innen" value={total} />
        <StatChip
          label="Häufigste Stufe"
          value={
            <span style={{ color: COMPETENCE_LEVELS[dominant]?.color }}>Stufe {dominant}</span>
          }
        />
        <StatChip label="Förder­bedarf (I–II)" value={atRisk} />
        <StatChip
          label="Anteil I–II"
          value={total > 0 ? `${Math.round((atRisk / total) * 100)}%` : '–'}
        />
      </div>

      {/* Competence level bar chart */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Verteilung nach Kompetenzstufe
        </p>
        {total > 0 ? (
          <LocalCompetenceChart students={students} />
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">Keine Schüler*innen für diese Auswahl.</p>
        )}
      </div>

      {/* Domain breakdown stacked bar */}
      {total > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Verteilung nach Teilbereichen
          </p>
          <LocalDomainChart students={students} />
        </div>
      )}
    </Card>
  );
};

// ── Single aggregation section (API data) ─────────────────────────────────────

const AggSection = ({ agg }) => {
  const stats = agg.descriptiveStatistics;

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-4">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h5 className="text-sm font-semibold text-gray-700">
            {agg.type === 'custom' ? agg.value : agg.type}
          </h5>
          <p className="text-xs text-gray-400">{agg.includedIqbIds?.length ?? 0} Items</p>
        </div>
        {stats && (
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-primary">
              {Math.round((stats.mean ?? 0) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Ø Lösungshäufigkeit</div>
          </div>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatChip label="Gesamt" value={stats.total ?? 0} />
          <StatChip label="Häufigkeit" value={stats.frequency ?? 0} />
          {stats.standardDeviation !== undefined && (
            <StatChip label="Standardabw." value={(stats.standardDeviation ?? 0).toFixed(3)} />
          )}
        </div>
      )}

      {agg.competenceAggregation?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Kompetenzstufen-Verteilung
          </p>
          <ApiCompetenceChart competenceAggregation={agg.competenceAggregation} />
        </div>
      )}

      {agg.exerciseAggregation?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Aufgaben – Lösungshäufigkeit ({agg.exerciseAggregation.length})
          </p>
          <ExerciseChart exerciseAggregation={agg.exerciseAggregation} />
        </div>
      )}
    </div>
  );
};

export default AggregationsView;
