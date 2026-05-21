import { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Cell, ResponsiveContainer,
} from 'recharts';
import { useFilters } from '../../context/FilterContext';
import { useCompetenceDelta } from '../../hooks/useCompetenceDelta';
import Card from '../common/Card';
import LoadingSkeleton from '../common/LoadingSkeleton';
import ErrorMessage from '../common/ErrorMessage';

// ── Constants ─────────────────────────────────────────────────────────────────

const EXTRA_COMPARISONS = [
  { id: 'vergleichsschule', label: 'Vergleichsschule', disabled: true },
  { id: 'testheft', label: 'Testheft', disabled: true },
  { id: 'vergangene', label: 'Vergangene Durchgänge', disabled: true },
];

const COMPARISON_COLORS = [
  '#3b82f6', // blue
  '#16a34a', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#f43f5e', // rose
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function barColor(value) {
  if (value >= 0) return '#15803d';
  if (value >= -4) return '#fca5a5';
  return '#b91c1c';
}

function signedPp(value) {
  if (value == null) return '';
  return value >= 0 ? `+${value} Pp.` : `${value} Pp.`;
}

function trendIcon(a, b) {
  return a > b ? '↗' : a < b ? '↘' : '→';
}

function trendCls(a, b) {
  return a > b ? 'text-green-600' : a < b ? 'text-amber-600' : 'text-gray-500';
}

// ── Sub-components ────────────────────────────────────────────────────────────

const DeltaTooltip = ({ active, payload, label, compColors }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm min-w-[180px]">
      <p className="font-semibold text-gray-800 mb-1">Stufe {label}</p>
      {payload.map((p, i) => (
        <p key={p.dataKey} className="text-gray-600 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: compColors[i] ?? '#6b7280' }} />
          vs. {p.dataKey}:
          <span className="font-medium ml-1" style={{ color: p.value >= 0 ? '#15803d' : '#b91c1c' }}>
            {signedPp(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
};

const SummaryBox = ({ compId, label, color, school, compData }) => {
  const isPositive = school.upperLevels >= compData.upperLevels;
  return (
    <div
      className="rounded-lg border p-4 min-w-[220px]"
      style={{ borderColor: isPositive ? '#16a34a' : '#6b7280', background: isPositive ? '#f0fdf4' : '#f9fafb' }}
      data-testid={`comparison-box-${compId}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block w-3 h-3 rounded-full" style={{ background: color }} />
        <span className="font-semibold text-sm text-gray-800">vs. {label}</span>
      </div>
      <p className="text-xs text-gray-600">
        Obere Stufen{' '}
        <span className="font-semibold text-gray-900">{school.upperLevels} %</span>
        {' / '}
        <span className="font-semibold" style={{ color }}>{compData.upperLevels} %</span>
        {', Unter Mindeststandard '}
        <span className="font-semibold text-gray-900">{school.belowMin} %</span>
        {' / '}
        <span className="font-semibold" style={{ color }}>{compData.belowMin} %</span>
      </p>
    </div>
  );
};

const ComparisonText = ({ compId, label, school, compData }) => {
  return (
    <div data-testid={`comparison-text-${compId}`}>
      <p className="font-semibold text-gray-800 mb-2">
        <span className="text-gray-500 mr-1">⇄</span>
        Vergleich mit {label}
      </p>
      <ul className="space-y-1 text-sm text-gray-700">
        <li className="flex items-start gap-2">
          <span className={`mt-0.5 flex-shrink-0 ${trendCls(compData.belowMin, school.belowMin)}`}>
            {trendIcon(compData.belowMin, school.belowMin)}
          </span>
          <span>
            In <strong>Schule</strong> liegen{' '}
            <strong>{school.belowMin} %</strong> der Teilnehmenden{' '}
            <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mx-0.5 mb-0.5 align-middle" />
            <strong>unter Mindeststandard</strong>, bei <strong>{label}</strong> sind es{' '}
            <strong>{compData.belowMin} %</strong>.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className={`mt-0.5 flex-shrink-0 ${trendCls(school.optimal, compData.optimal)}`}>
            {trendIcon(school.optimal, compData.optimal)}
          </span>
          <span>
            In <strong>Schule</strong> erreichen{' '}
            <strong>{school.optimal} %</strong> der Teilnehmenden den{' '}
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mx-0.5 mb-0.5 align-middle" />
            <strong>Optimalstandard</strong>, bei <strong>{label}</strong> sind es{' '}
            <strong>{compData.optimal} %</strong>.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className={`mt-0.5 flex-shrink-0 ${trendCls(school.upperLevels, compData.upperLevels)}`}>
            {trendIcon(school.upperLevels, compData.upperLevels)}
          </span>
          <span>
            In <strong>Schule</strong> erreichen{' '}
            <strong>{school.upperLevels} %</strong> der Teilnehmenden die{' '}
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mx-0.5 mb-0.5 align-middle" />
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mb-0.5 align-middle" />
            {' '}<strong>oberen Stufen</strong>, bei <strong>{label}</strong> sind es{' '}
            <strong>{compData.upperLevels} %</strong>.
          </span>
        </li>
      </ul>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const CompetenceDeltaView = () => {
  const { selectedGroup, selectedState } = useFilters();
  const { loading, error, data } = useCompetenceDelta(selectedGroup, selectedState);

  const [activeDomainCode, setActiveDomainCode] = useState(null);
  const [activeComparisons, setActiveComparisons] = useState(['landesmittelwert']);
  const [showPanel, setShowPanel] = useState(false);

  const panelRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowPanel(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (loading) {
    return (
      <Card title="Vergleichsauswertung">
        <LoadingSkeleton height="420px" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Vergleichsauswertung">
        <ErrorMessage error={error} />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card title="Vergleichsauswertung">
        <div className="text-gray-500 text-center py-8">Bitte eine Lerngruppe auswählen.</div>
      </Card>
    );
  }

  const { domains, ownStats, comparisons, availableComparisons, currentGroup } = data;

  // Derive current domain: prefer selected, fall back to first available
  const currentDomain =
    (activeDomainCode && domains.find(d => d.code === activeDomainCode))
      ? activeDomainCode
      : domains[0]?.code;
  if (!currentDomain) return null;

  // Derive active comparisons: ensure at least first two available are on by default
  const defaultComparisons = availableComparisons.slice(0, 2).map(c => c.id);
  const effectiveComparisons = activeComparisons.filter(id =>
    availableComparisons.find(c => c.id === id)
  );
  const resolvedComparisons = effectiveComparisons.length > 0 ? effectiveComparisons : defaultComparisons;

  const domainLabel = domains.find(d => d.code === currentDomain)?.label ?? currentDomain;
  const ownDomainStats = ownStats[currentDomain] ?? { belowMin: 0, upperLevels: 0, optimal: 0 };

  // Collect level order from first available comparison
  const levelOrder = (() => {
    for (const cmpId of resolvedComparisons) {
      const deltas = comparisons[cmpId]?.[currentDomain]?.deltas;
      if (deltas) return Object.keys(deltas);
    }
    return [];
  })();

  const chartData = levelOrder.map(level => {
    const entry = { level };
    resolvedComparisons.forEach(cmpId => {
      const deltas = comparisons[cmpId]?.[currentDomain]?.deltas;
      if (deltas) entry[cmpId] = deltas[level] ?? 0;
    });
    return entry;
  });

  const allValues = resolvedComparisons.flatMap(cmpId => {
    const deltas = comparisons[cmpId]?.[currentDomain]?.deltas;
    return deltas ? Object.values(deltas) : [];
  });
  const yMin = Math.floor(Math.min(-10, ...allValues) / 5) * 5 - 5;
  const yMax = Math.ceil(Math.max(10, ...allValues) / 5) * 5 + 5;

  const compLabel = (id) => availableComparisons.find(c => c.id === id)?.label ?? id;
  const compColor = (id) => {
    const idx = availableComparisons.findIndex(c => c.id === id);
    return COMPARISON_COLORS[idx % COMPARISON_COLORS.length] ?? '#6b7280';
  };

  const panelComparisons = [
    ...availableComparisons,
    ...EXTRA_COMPARISONS,
  ];

  return (
    <Card>
      {/* Header: group name + domain tabs */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-xl text-gray-900" data-testid="group-label">
          {currentGroup?.name ?? selectedGroup}
        </span>
        <div className="flex gap-2 flex-wrap justify-end">
          {domains.map(d => (
            <button
              key={d.code}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                currentDomain === d.code
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => setActiveDomainCode(d.code)}
              data-testid={`domain-tab-${d.code}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Domain title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{domainLabel}</h2>
      </div>

      {/* Chart + panel */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={360} data-testid="delta-bar-chart">
          <BarChart
            data={chartData}
            margin={{ top: 30, right: 80, left: 10, bottom: 20 }}
            barCategoryGap="30%"
            barGap={3}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="level"
              tick={{ fontSize: 13, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={v => `${v} Pp.`}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={58}
            />
            <ReferenceLine y={0} stroke="#374151" strokeWidth={1.5} />
            <Tooltip content={<DeltaTooltip compColors={resolvedComparisons.map(compColor)} />} />

            {resolvedComparisons.map(cmpId => (
              <Bar key={cmpId} dataKey={cmpId} maxBarSize={52} radius={[3, 3, 3, 3]}>
                {chartData.map(entry => (
                  <Cell key={`${cmpId}-${entry.level}`} fill={barColor(entry[cmpId] ?? 0)} />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>

        {/* "+" panel */}
        <div className="absolute top-4 right-0" ref={panelRef}>
          <button
            className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-light hover:bg-gray-700 transition-colors shadow-md"
            onClick={() => setShowPanel(v => !v)}
            data-testid="comparison-panel-toggle"
            aria-label="Vergleiche auswählen"
          >
            +
          </button>
          {showPanel && (
            <div
              className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-4 min-w-[220px]"
              data-testid="comparison-panel"
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 font-medium">auswählen</p>
              <div className="space-y-2">
                {panelComparisons.map((cmp) => {
                  const checked = resolvedComparisons.includes(cmp.id);
                  const isDisabled = !!cmp.disabled;
                  return (
                    <label
                      key={cmp.id}
                      className={`flex items-center gap-2 rounded px-1 py-0.5 ${
                        isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked && !isDisabled}
                        disabled={isDisabled}
                        onChange={() => {
                          if (isDisabled) return;
                          setActiveComparisons(prev =>
                            prev.includes(cmp.id)
                              ? prev.filter(c => c !== cmp.id)
                              : [...prev, cmp.id]
                          );
                        }}
                        style={checked && !isDisabled ? { accentColor: compColor(cmp.id) } : {}}
                        data-testid={`comparison-checkbox-${cmp.id}`}
                      />
                      <span className="text-sm text-gray-800">{cmp.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center mt-1 mb-6">
        {resolvedComparisons.map(cmpId => (
          <span key={cmpId} className="flex items-center gap-1.5 text-sm text-gray-600">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: compColor(cmpId) }} />
            vs. {compLabel(cmpId)}
          </span>
        ))}
      </div>

      {/* Summary boxes */}
      <div className="flex flex-wrap gap-4 mb-6">
        {resolvedComparisons.map(cmpId => {
          const compData = comparisons[cmpId]?.[currentDomain];
          if (!compData) return null;
          return (
            <SummaryBox
              key={cmpId}
              compId={cmpId}
              label={compLabel(cmpId)}
              color={compColor(cmpId)}
              school={ownDomainStats}
              compData={compData}
            />
          );
        })}
      </div>

      {/* Text comparisons */}
      <div className="space-y-5">
        {resolvedComparisons.map((cmpId, idx) => {
          const compData = comparisons[cmpId]?.[currentDomain];
          if (!compData) return null;
          return (
            <div key={cmpId}>
              {idx > 0 && <hr className="border-gray-200 mb-5" />}
              <ComparisonText
                compId={cmpId}
                label={compLabel(cmpId)}
                school={ownDomainStats}
                compData={compData}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default CompetenceDeltaView;
