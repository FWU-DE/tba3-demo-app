import { useState } from 'react';
import { formatPercentage, formatStudentCount } from '../../utils/formatters';

// Übersichtskarten über allen Tabs: Ringdiagramm der Kompetenzstufen-Verteilung
// plus die beiden Schlüsselkennzahlen. Portiert aus der Vue-Fassung im
// Komponentenkatalog (apps/katalog/src/components/CompetencyOverviewCards.vue).

// ── Ring-Geometrie ───────────────────────────────────────────────────────────

const CX = 100;
const CY = 100;
const OUTER_R = 80;
const INNER_R = 52;

const toRad = (deg) => ((deg - 90) * Math.PI) / 180;

const arcPath = (startAngle, endAngle) => {
  // Ein voller Kreis ließe sich als Pfad nicht schließen — minimal kürzen.
  const end = endAngle >= 360 ? 359.99 : endAngle;
  const large = end - startAngle > 180 ? 1 : 0;
  const x1 = CX + OUTER_R * Math.cos(toRad(startAngle));
  const y1 = CY + OUTER_R * Math.sin(toRad(startAngle));
  const x2 = CX + OUTER_R * Math.cos(toRad(end));
  const y2 = CY + OUTER_R * Math.sin(toRad(end));
  const x3 = CX + INNER_R * Math.cos(toRad(end));
  const y3 = CY + INNER_R * Math.sin(toRad(end));
  const x4 = CX + INNER_R * Math.cos(toRad(startAngle));
  const y4 = CY + INNER_R * Math.sin(toRad(startAngle));
  return `M ${x1} ${y1} A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${INNER_R} ${INNER_R} 0 ${large} 0 ${x4} ${y4} Z`;
};

const buildSlices = (chartData) => {
  const total = chartData.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) return [];
  let angle = 0;
  return chartData.map((d) => {
    const sweep = (d.count / total) * 360;
    const start = angle;
    angle += sweep;
    return { ...d, path: arcPath(start, angle), share: d.count / total };
  });
};

// ── Komponente ───────────────────────────────────────────────────────────────

const CompetencyOverviewCards = ({ chartData, stats, subject = null }) => {
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  // Daten werden asynchron geladen — bis dahin bleibt die Fläche leer.
  if (!chartData?.length || !stats) return null;

  const slices = buildSlices(chartData);
  const atOrAbove = (stats.atStandard ?? 0) + (stats.aboveStandard ?? 0);
  const belowStandard = stats.belowStandard ?? 0;

  const showTooltip = (slice, event) => {
    const wrap = event.currentTarget.closest('[data-donut-wrap]');
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, slice });
  };

  const clearHover = () => {
    setHoveredLevel(null);
    setTooltip(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6" data-testid="competency-overview">

      {/* Ringdiagramm */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-3">
        <div className="text-sm font-bold text-gray-800">Kompetenzübersicht</div>

        <div className="relative flex items-center justify-center" data-donut-wrap>
          <svg viewBox="0 0 200 200" className="w-44 h-44 overflow-visible" data-testid="competency-donut">
            {slices.map((slice) => (
              <path
                key={slice.level}
                d={slice.path}
                fill={slice.color}
                stroke="#fff"
                strokeWidth="2"
                className={`cursor-pointer transition-opacity duration-150 ${
                  hoveredLevel && hoveredLevel !== slice.level ? 'opacity-30' : 'opacity-100'
                }`}
                onMouseEnter={(e) => { setHoveredLevel(slice.level); showTooltip(slice, e); }}
                onMouseMove={(e) => showTooltip(slice, e)}
                onMouseLeave={clearHover}
              />
            ))}
          </svg>

          {tooltip && (
            <div
              data-testid="competency-tooltip"
              className="absolute z-20 bg-slate-800 text-white rounded-lg px-3 py-2 pointer-events-none whitespace-nowrap shadow-lg -translate-x-1/2 -translate-y-[calc(100%+12px)]"
              style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: tooltip.slice.color }} />
                <span className="text-xs font-bold">Stufe {tooltip.slice.level}</span>
              </div>
              <div className="text-[11px] opacity-75 mb-1.5">{tooltip.slice.name}</div>
              <div className="flex items-baseline justify-between gap-5">
                <span className="text-[11px] opacity-85">{formatStudentCount(tooltip.slice.count)}</span>
                <span className="text-sm font-bold">{formatPercentage(tooltip.slice.share, 0)}</span>
              </div>
            </div>
          )}

          <div className="absolute flex flex-col items-center pointer-events-none">
            {subject && <span className="text-[11px] font-semibold text-gray-500">{subject}</span>}
            <span className="text-2xl font-bold text-gray-900 leading-tight" data-testid="competency-total">
              {stats.total}
            </span>
            <span className="text-[11px] text-gray-400">Schüler*innen</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {chartData.map((d) => (
            <div
              key={d.level}
              className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                hoveredLevel === d.level ? 'bg-gray-100' : ''
              }`}
              onMouseEnter={() => setHoveredLevel(d.level)}
              onMouseLeave={() => setHoveredLevel(null)}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-gray-500">Stufe {d.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Schlüsselkennzahlen */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-3">
        <div className="text-sm font-bold text-gray-800">Schlüsselkennzahlen</div>

        <div className="flex flex-col gap-3 flex-1">
          <div className="flex-1 rounded-lg px-4 py-4 text-white bg-green-500" data-testid="stat-at-or-above">
            <div className="text-3xl font-bold leading-none">{formatPercentage(atOrAbove, 0)}</div>
            <div className="text-sm font-medium mt-1.5">Mindeststandard und darüber</div>
            <div className="text-xs opacity-85 mt-0.5">
              Kompetenzstufen II–V · {formatStudentCount(Math.round(atOrAbove * stats.total))}
            </div>
          </div>

          <div className="flex-1 rounded-lg px-4 py-4 text-white bg-orange-500" data-testid="stat-below-standard">
            <div className="text-3xl font-bold leading-none">{formatPercentage(belowStandard, 0)}</div>
            <div className="text-sm font-medium mt-1.5">Unter Mindeststandard</div>
            <div className="text-xs opacity-85 mt-0.5">
              Kompetenzstufe I · {formatStudentCount(Math.round(belowStandard * stats.total))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CompetencyOverviewCards;
