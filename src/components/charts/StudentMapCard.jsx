import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { GROUPS, COMPETENCE_LEVELS } from '../../utils/constants';
import { useFilters } from '../../context/FilterContext';
import { SUBJECT_DOMAINS } from '../../utils/studentData';
import { createCustomGroup, addStudentsToGroup } from '../../utils/customGroupsStore';

// ── SVG layout constants ──────────────────────────────────────────────────────

const VW = 560, VH = 400;
const M = { top: 28, right: 24, bottom: 52, left: 60 };
const IW = VW - M.left - M.right; // 476
const IH = VH - M.top - M.bottom; // 320

// ── Cluster palette ───────────────────────────────────────────────────────────

const CLUSTER_COLORS = [
  '#3b82f6', '#f59e0b', '#10b981', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

// ── Coordinate helpers ────────────────────────────────────────────────────────

// Data range: [0.5, 5.5] mapped to SVG inner area
const toSvgX = (v) => M.left + ((v - 0.5) / 5) * IW;
const toSvgY = (v) => M.top + IH - ((v - 0.5) / 5) * IH;

// ── Deterministic jitter from student ID hash ─────────────────────────────────

const hashInt = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const jitter = (id, axis) => ((hashInt(id + axis) % 10000) / 10000 - 0.5) * 0.55;

// ── K-means (k-means++ init) ──────────────────────────────────────────────────

const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

const kMeans = (pts, k) => {
  if (!pts.length || k < 1) return { labels: [], centroids: [] };
  k = Math.min(k, pts.length);

  // k-means++ initialization
  const centroids = [pts[Math.floor(Math.random() * pts.length)]];
  while (centroids.length < k) {
    const dists = pts.map((p) => Math.min(...centroids.map((c) => dist2(p, c))));
    const total = dists.reduce((a, b) => a + b, 0);
    if (total === 0) { centroids.push(pts[centroids.length]); continue; }
    let r = Math.random() * total;
    let chosen = pts[pts.length - 1];
    for (let i = 0; i < dists.length; i++) {
      r -= dists[i];
      if (r <= 0) { chosen = pts[i]; break; }
    }
    centroids.push(chosen);
  }

  let labels = new Array(pts.length).fill(0);
  for (let iter = 0; iter < 120; iter++) {
    const next = pts.map((p) => {
      let best = 0, bd = Infinity;
      centroids.forEach((c, ci) => { const d = dist2(p, c); if (d < bd) { bd = d; best = ci; } });
      return best;
    });
    if (next.every((a, i) => a === labels[i])) { labels = next; break; }
    labels = next;
    for (let ci = 0; ci < k; ci++) {
      const cluster = pts.filter((_, i) => labels[i] === ci);
      if (cluster.length) {
        centroids[ci] = [
          cluster.reduce((s, p) => s + p[0], 0) / cluster.length,
          cluster.reduce((s, p) => s + p[1], 0) / cluster.length,
        ];
      }
    }
  }
  return { labels, centroids };
};

// ── Convex hull (Graham scan) ─────────────────────────────────────────────────

const convexHull = (pts) => {
  if (pts.length <= 2) return pts;
  const sorted = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (O, A, B) => (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of [...sorted].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop(); lower.pop();
  return [...lower, ...upper];
};

// Catmull-Rom smooth closed curve through SVG points
const smoothPath = (svgPts) => {
  const n = svgPts.length;
  if (n < 2) return '';
  if (n === 2) {
    const [p, q] = svgPts;
    return `M ${p[0]} ${p[1]} L ${q[0]} ${q[1]} Z`;
  }
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = svgPts[(i - 1 + n) % n];
    const p1 = svgPts[i];
    const p2 = svgPts[(i + 1) % n];
    const p3 = svgPts[(i + 2) % n];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    if (i === 0) d = `M ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + ' Z';
};

// Expand hull away from centroid by `amount` data units
const expandHull = (hull, cx, cy, amount) =>
  hull.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return [x + (dx / len) * amount, y + (dy / len) * amount];
  });

// ── Dimension helpers ─────────────────────────────────────────────────────────

const LEVEL_NUM = { I: 1, II: 2, III: 3, IV: 4, V: 5 };
const LEVEL_STR = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
const TICKS = [1, 2, 3, 4, 5];

// Map a raw percentage 0–99 into the 1–5 chart space
const pctToChartVal = (pct) => 1 + (pct / 99) * 4;

// Tick label & color for a percentage-scale axis
const PCT_TICK_LABEL = { 1: '0%', 2: '25%', 3: '50%', 4: '75%', 5: '100%' };
const PCT_TICK_COLOR = '#6b7280';

// Default level-scale tick helpers (used when tickLabel/tickColor not in dim)
const defaultTickLabel = (v) => LEVEL_STR[v] ?? '';
const defaultTickColor = (v) => COMPETENCE_LEVELS[LEVEL_STR[v]]?.color ?? '#6b7280';

const getDims = (students) => {
  const base = [
    {
      key: '__level__',
      label: 'Kompetenzstufe (gesamt)',
      fn: (s) => LEVEL_NUM[s.competenceLevel] ?? 3,
    },
    {
      key: '__score__',
      label: 'Rohwert (gesamt, %)',
      fn: (s) => s.score != null ? pctToChartVal(s.score) : LEVEL_NUM[s.competenceLevel] ?? 3,
      tickLabel: (v) => PCT_TICK_LABEL[v] ?? '',
      tickColor: () => PCT_TICK_COLOR,
      formatValue: (s) => s.score != null ? `${s.score}%` : null,
    },
  ];

  const sgs = new Set(students.map((s) => `${s.subject}-${s.grade}`));
  if (sgs.size === 1) {
    const sg = [...sgs][0];
    const domains = SUBJECT_DOMAINS[sg] ?? [];

    // Average domain level (continuous float 1–5)
    if (domains.length > 1) {
      base.push({
        key: '__avg_domain__',
        label: 'Ø Teilkompetenz',
        fn: (s) => {
          const vals = domains.map((d) => LEVEL_NUM[s.domainLevels?.[d]] ?? LEVEL_NUM[s.competenceLevel] ?? 3);
          return vals.reduce((a, b) => a + b, 0) / vals.length;
        },
      });
    }

    domains.forEach((domain) => {
      // Domain competence level (I–V)
      base.push({
        key: domain,
        label: domain,
        fn: (s) => LEVEL_NUM[s.domainLevels?.[domain]] ?? LEVEL_NUM[s.competenceLevel] ?? 3,
      });
      // Domain raw score (%)
      if (students.some((s) => s.domainScores?.[domain] != null)) {
        base.push({
          key: `__score_${domain}__`,
          label: `${domain} (%)`,
          fn: (s) => s.domainScores?.[domain] != null ? pctToChartVal(s.domainScores[domain]) : LEVEL_NUM[s.competenceLevel] ?? 3,
          tickLabel: (v) => PCT_TICK_LABEL[v] ?? '',
          tickColor: () => PCT_TICK_COLOR,
          formatValue: (s) => s.domainScores?.[domain] != null ? `${s.domainScores[domain]}%` : null,
        });
      }
    });
  }
  return base;
};

// ── Main component ────────────────────────────────────────────────────────────

const StudentMapCard = ({ students, customGroups, onGroupsChange }) => {
  const svgRef = useRef(null);
  const { observerMode } = useFilters();

  const dims = useMemo(() => getDims(students), [students]);

  const [xKey, setXKey] = useState(() => dims[0]?.key ?? '__level__');
  const [yKey, setYKey] = useState(() => (dims.length > 1 ? dims[1].key : dims[0]?.key ?? '__level__'));
  const [kCount, setKCount] = useState(3);
  const [clusters, setClusters] = useState(null); // { labels, centroids }
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [lasso, setLasso] = useState(null); // { x0,y0,x1,y1 } in SVG coords
  const isLassoing = useRef(false);
  const [draggingDot, setDraggingDot] = useState(null); // { idx, svgX, svgY }
  const isDraggingDot = useRef(false);
  const [tooltip, setTooltip] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Reset when dims change (e.g. filter changes subject)
  useEffect(() => {
    setXKey(dims[0]?.key ?? '__level__');
    setYKey(dims.length > 1 ? dims[1].key : dims[0]?.key ?? '__level__');
    setClusters(null);
    setSelectedIds(new Set());
  }, [dims]);

  // ── Student points ──────────────────────────────────────────────────────────

  const points = useMemo(() => {
    const xDim = dims.find((d) => d.key === xKey) ?? dims[0];
    const yDim = dims.find((d) => d.key === yKey) ?? dims[0];
    if (!xDim || !yDim) return [];
    return students.map((s) => ({
      id: s.id,
      student: s,
      rawX: xDim.fn(s),
      rawY: yDim.fn(s),
      x: xDim.fn(s) + jitter(s.id, 'x'),
      y: yDim.fn(s) + jitter(s.id, 'y'),
    }));
  }, [students, dims, xKey, yKey]);

  // ── K-means ─────────────────────────────────────────────────────────────────

  const runClustering = useCallback(() => {
    const result = kMeans(points.map((p) => [p.rawX, p.rawY]), kCount);
    setClusters(result);
    setSelectedIds(new Set());
  }, [points, kCount]);

  // ── Cluster hulls ────────────────────────────────────────────────────────────

  const clusterShapes = useMemo(() => {
    if (!clusters || !points.length) return [];
    return clusters.centroids.map((centroid, ci) => {
      const clusterPts = points
        .filter((_, i) => clusters.labels[i] === ci)
        .map((p) => [p.x, p.y]);
      if (!clusterPts.length) return null;
      const cx = centroid[0], cy = centroid[1];
      if (clusterPts.length === 1) {
        return { ci, type: 'circle', svgCx: toSvgX(clusterPts[0][0]), svgCy: toSvgY(clusterPts[0][1]), r: 20 };
      }
      const hull = convexHull(clusterPts);
      const expanded = expandHull(hull, cx, cy, 0.3);
      const svgPts = expanded.map(([x, y]) => [toSvgX(x), toSvgY(y)]);
      return { ci, type: 'hull', path: smoothPath(svgPts), svgCx: toSvgX(cx), svgCy: toSvgY(cy) };
    }).filter(Boolean);
  }, [clusters, points]);

  // ── SVG mouse events (lasso) ─────────────────────────────────────────────────

  const getSvgPt = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const t = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: t.x, y: t.y };
  }, []);

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    if (isDraggingDot.current) return;
    const { x, y } = getSvgPt(e);
    setLasso({ x0: x, y0: y, x1: x, y1: y });
    isLassoing.current = true;
    setTooltip(null);
  }, [getSvgPt]);

  const onMouseMove = useCallback((e) => {
    if (isDraggingDot.current) {
      const { x, y } = getSvgPt(e);
      setDraggingDot((prev) => prev ? { ...prev, svgX: x, svgY: y } : null);
      return;
    }
    if (!isLassoing.current) return;
    const { x, y } = getSvgPt(e);
    setLasso((prev) => prev ? { ...prev, x1: x, y1: y } : null);
  }, [getSvgPt]);

  const onMouseUp = useCallback((e) => {
    if (isDraggingDot.current) {
      isDraggingDot.current = false;
      setDraggingDot((prev) => {
        if (!prev || !clusters) return null;
        // Find nearest centroid in SVG coords
        const svgCentroids = clusters.centroids.map(([cx, cy]) => [toSvgX(cx), toSvgY(cy)]);
        let nearest = 0, minD = Infinity;
        svgCentroids.forEach(([cx, cy], ci) => {
          const d = (prev.svgX - cx) ** 2 + (prev.svgY - cy) ** 2;
          if (d < minD) { minD = d; nearest = ci; }
        });
        setClusters((c) => {
          if (!c) return c;
          const newLabels = [...c.labels];
          newLabels[prev.idx] = nearest;
          return { ...c, labels: newLabels };
        });
        return null;
      });
      return;
    }
    if (!isLassoing.current) return;
    isLassoing.current = false;
    setLasso((prev) => {
      if (!prev) return null;
      const minX = Math.min(prev.x0, prev.x1);
      const maxX = Math.max(prev.x0, prev.x1);
      const minY = Math.min(prev.y0, prev.y1);
      const maxY = Math.max(prev.y0, prev.y1);
      if (maxX - minX < 6 && maxY - minY < 6) return null; // tiny click → don't select
      const sel = new Set();
      points.forEach((p) => {
        const px = toSvgX(p.x), py = toSvgY(p.y);
        if (px >= minX && px <= maxX && py >= minY && py <= maxY) sel.add(p.id);
      });
      setSelectedIds(sel);
      return null;
    });
  }, [points, clusters]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const selectCluster = (ci) => {
    if (!clusters) return;
    setSelectedIds(new Set(clusters.labels.map((l, i) => l === ci ? points[i]?.id : null).filter(Boolean)));
  };

  const flash = (msg) => { setFeedback(msg); setTimeout(() => setFeedback(null), 3500); };

  const createGroup = () => {
    if (!groupName.trim() || !selectedIds.size) return;
    let g = createCustomGroup(customGroups, groupName.trim());
    const created = g[g.length - 1];
    g = addStudentsToGroup(g, created.id, [...selectedIds]);
    onGroupsChange(g);
    setGroupName(''); setShowForm(false); setSelectedIds(new Set());
    flash(`Gruppe „${created.name}" mit ${selectedIds.size} Schüler*innen erstellt.`);
  };

  const createAllClusters = () => {
    if (!clusters) return;
    const k = clusters.centroids.length;
    let g = [...customGroups];
    let created = 0;
    for (let ci = 0; ci < k; ci++) {
      const ids = clusters.labels.map((l, i) => l === ci ? points[i]?.id : null).filter(Boolean);
      if (!ids.length) continue;
      g = createCustomGroup(g, `Cluster ${ci + 1}`);
      g = addStudentsToGroup(g, g[g.length - 1].id, ids);
      created++;
    }
    onGroupsChange(g);
    setClusters(null); setSelectedIds(new Set());
    flash(`${created} Cluster-Gruppen erstellt.`);
  };

  // ── Early return ─────────────────────────────────────────────────────────────

  if (!students.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <svg className="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <p className="text-sm">Keine Schüler*innen für die aktuelle Filterauswahl gefunden.</p>
      </div>
    );
  }

  const multiSG = new Set(students.map((s) => `${s.subject}-${s.grade}`)).size > 1;

  return (
    <div className="space-y-4">

      {/* ── Controls ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">

        {/* Axis selectors */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 w-14">X-Achse</span>
          <select
            value={xKey}
            onChange={(e) => { setXKey(e.target.value); setClusters(null); }}
            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {dims.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 w-14">Y-Achse</span>
          <select
            value={yKey}
            onChange={(e) => { setYKey(e.target.value); setClusters(null); }}
            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {dims.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
          </select>
        </div>

        {multiSG && (
          <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
            Filtern Sie nach einer Klasse für Teilkompetenz-Achsen.
          </p>
        )}

        {/* Cluster controls */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs font-medium text-gray-500">Cluster</span>
          <input
            type="number" min={2} max={8} value={kCount}
            onChange={(e) => setKCount(Math.max(2, Math.min(8, +e.target.value || 3)))}
            className="w-12 text-xs text-center border border-gray-200 rounded-md px-1 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={runClustering}
            className="text-xs font-medium px-3 py-1.5 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Clustern
          </button>
          {clusters && (
            <button
              onClick={createAllClusters}
              className="text-xs font-medium px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Alle als Gruppen →
            </button>
          )}
          {clusters && (
            <button
              onClick={() => { setClusters(null); setSelectedIds(new Set()); }}
              className="text-xs text-gray-400 hover:text-gray-600 px-1"
              title="Cluster aufheben"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Hint ────────────────────────────────────────────────────────────── */}
      <p className="text-xs text-gray-400">
        Ziehen Sie ein Rechteck zur Gruppenauswahl · Klicken Sie auf Punkte zum Ein-/Ausschließen
        {clusters ? ' · Klicken auf Cluster-Fläche wählt alle darin aus · Punkte ziehen zum Umverteilen' : ''}
      </p>

      {/* ── SVG plot ─────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          className="select-none"
          style={{ cursor: draggingDot ? 'grabbing' : 'crosshair', width: '100%', minWidth: 360, height: 'auto', display: 'block', background: '#f9fafb' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => { if (isLassoing.current) onMouseUp(); setTooltip(null); }}
        >
          {/* ── Room floor grid (subtle tiles) ── */}
          <defs>
            <pattern id="tile" x={M.left} y={M.top} width={IW / 8} height={IH / 8} patternUnits="userSpaceOnUse">
              <rect width={IW / 8} height={IH / 8} fill="none" stroke="#e5e7eb" strokeWidth={0.4} />
            </pattern>
          </defs>
          <rect x={M.left} y={M.top} width={IW} height={IH} fill="url(#tile)" />

          {/* ── Major grid lines at each level ── */}
          {TICKS.map((t) => (
            <g key={t}>
              <line x1={toSvgX(t)} y1={M.top} x2={toSvgX(t)} y2={M.top + IH} stroke="#d1d5db" strokeWidth={0.8} />
              <line x1={M.left} y1={toSvgY(t)} x2={M.left + IW} y2={toSvgY(t)} stroke="#d1d5db" strokeWidth={0.8} />
            </g>
          ))}

          {/* ── Axis labels & ticks ── */}
          {(() => {
            const xDim = dims.find((d) => d.key === xKey) ?? dims[0];
            const yDim = dims.find((d) => d.key === yKey) ?? dims[0];
            const xTickLabel = xDim?.tickLabel ?? defaultTickLabel;
            const xTickColor = xDim?.tickColor ?? defaultTickColor;
            const yTickLabel = yDim?.tickLabel ?? defaultTickLabel;
            const yTickColor = yDim?.tickColor ?? defaultTickColor;
            return TICKS.map((t) => (
              <g key={`tick-${t}`}>
                <text x={toSvgX(t)} y={M.top + IH + 20} textAnchor="middle" fontSize={11} fontWeight={700} fill={xTickColor(t)}>
                  {xTickLabel(t)}
                </text>
                <text x={M.left - 10} y={toSvgY(t) + 4} textAnchor="end" fontSize={11} fontWeight={700} fill={yTickColor(t)}>
                  {yTickLabel(t)}
                </text>
              </g>
            ));
          })()}

          {/* Axis name labels */}
          <text
            x={M.left + IW / 2} y={VH - 6}
            textAnchor="middle" fontSize={11} fill="#374151" fontWeight={600}
          >
            {dims.find((d) => d.key === xKey)?.label ?? ''}
          </text>
          <text
            x={14} y={M.top + IH / 2}
            textAnchor="middle" fontSize={11} fill="#374151" fontWeight={600}
            transform={`rotate(-90, 14, ${M.top + IH / 2})`}
          >
            {dims.find((d) => d.key === yKey)?.label ?? ''}
          </text>

          {/* Plot border */}
          <rect x={M.left} y={M.top} width={IW} height={IH} fill="none" stroke="#9ca3af" strokeWidth={1} />

          {/* ── Cluster hulls ── */}
          {clusterShapes.map((shape) => {
            const col = CLUSTER_COLORS[shape.ci % CLUSTER_COLORS.length];
            const clusterCount = clusters?.labels.filter((l) => l === shape.ci).length ?? 0;
            return (
              <g key={`hull-${shape.ci}`} onClick={() => selectCluster(shape.ci)} style={{ cursor: 'pointer' }}>
                {shape.type === 'circle' ? (
                  <circle cx={shape.svgCx} cy={shape.svgCy} r={shape.r}
                    fill={col} fillOpacity={0.15} stroke={col} strokeWidth={2} strokeDasharray="5 3" />
                ) : (
                  <path d={shape.path} fill={col} fillOpacity={0.15} stroke={col} strokeWidth={2} strokeDasharray="5 3" />
                )}
                {/* Cluster label badge */}
                <rect
                  x={shape.svgCx - 28} y={shape.svgCy - (shape.type === 'circle' ? shape.r + 18 : 32)}
                  width={56} height={16} rx={8}
                  fill={col} fillOpacity={0.9}
                />
                <text
                  x={shape.svgCx} y={shape.svgCy - (shape.type === 'circle' ? shape.r + 7 : 21)}
                  textAnchor="middle" fontSize={9.5} fontWeight={700} fill="white"
                >
                  Cluster {shape.ci + 1} · {clusterCount}
                </text>
              </g>
            );
          })}

          {/* ── Student dots ── */}
          {points.map((p, i) => {
            const clusterIdx = clusters ? clusters.labels[i] : -1;
            const dotColor = clusters
              ? CLUSTER_COLORS[clusterIdx % CLUSTER_COLORS.length]
              : (COMPETENCE_LEVELS[p.student.competenceLevel]?.color ?? '#6b7280');
            const isSelected = selectedIds.has(p.id);
            const isDragging = draggingDot?.idx === i;
            const cx = toSvgX(p.x), cy = toSvgY(p.y);
            const initials = observerMode ? '••' : `${p.student.firstName[0]}${p.student.lastName[0]}`;
            return (
              <g key={p.id}
                style={{ cursor: clusters ? 'grab' : 'pointer' }}
                onClick={(e) => {
                  if (isDraggingDot.current) return;
                  e.stopPropagation();
                  setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                    return next;
                  });
                }}
                onMouseDown={(e) => {
                  if (!clusters) return;
                  e.stopPropagation();
                  const { x, y } = getSvgPt(e);
                  isDraggingDot.current = true;
                  isLassoing.current = false;
                  setLasso(null);
                  setTooltip(null);
                  setDraggingDot({ idx: i, svgX: x, svgY: y, color: dotColor, initials });
                }}
                onMouseEnter={() => { if (!isDraggingDot.current) setTooltip({ student: p.student, svgX: cx, svgY: cy, clusterIdx }); }}
                onMouseLeave={() => setTooltip(null)}
              >
                <circle
                  cx={cx} cy={cy}
                  r={isSelected ? 9 : 7}
                  fill={dotColor}
                  fillOpacity={isDragging ? 0.3 : (isSelected ? 1 : 0.85)}
                  stroke={isSelected ? '#1e3a5f' : 'white'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeDasharray={isDragging ? '3 2' : undefined}
                />
                <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize={6.5} fontWeight={700}
                  fill="white" fillOpacity={isDragging ? 0.3 : 1} style={{ pointerEvents: 'none' }}>
                  {initials}
                </text>
              </g>
            );
          })}

          {/* ── Dragged dot (follows cursor) ── */}
          {draggingDot && (
            <g style={{ pointerEvents: 'none' }}>
              <circle
                cx={draggingDot.svgX} cy={draggingDot.svgY} r={9}
                fill={draggingDot.color} fillOpacity={0.95}
                stroke="white" strokeWidth={2.5}
                filter="drop-shadow(0 2px 6px rgba(0,0,0,0.25))"
              />
              <text x={draggingDot.svgX} y={draggingDot.svgY + 3.5}
                textAnchor="middle" fontSize={6.5} fontWeight={700} fill="white">
                {draggingDot.initials}
              </text>
            </g>
          )}

          {/* ── Lasso rectangle ── */}
          {lasso && (
            <rect
              x={Math.min(lasso.x0, lasso.x1)} y={Math.min(lasso.y0, lasso.y1)}
              width={Math.abs(lasso.x1 - lasso.x0)} height={Math.abs(lasso.y1 - lasso.y0)}
              fill="rgba(59,130,246,0.07)" stroke="#3b82f6" strokeWidth={1.5}
              strokeDasharray="5 3" style={{ pointerEvents: 'none' }}
            />
          )}

          {/* ── Tooltip ── */}
          {tooltip && (() => {
            const s = tooltip.student;
            const grp = GROUPS.find((g) => g.id === s.classGroupId);
            const clusterLabel = tooltip.clusterIdx >= 0 ? `Cluster ${tooltip.clusterIdx + 1}` : null;
            const levelColor = COMPETENCE_LEVELS[s.competenceLevel]?.color ?? '#6b7280';

            // Domains for this student
            const domainEntries = Object.entries(s.domainLevels ?? {});
            const hasScore = s.score != null;
            // Extra rows: overall score row + domain score rows (one per domain)
            const extraRows = (hasScore ? 1 : 0) + (hasScore ? domainEntries.length : 0);
            const boxH = 54 + domainEntries.length * 14 + extraRows * 14;
            const boxW = 160;

            // Flip if near right edge
            const flip = tooltip.svgX > VW - M.right - boxW - 20;
            const tx = flip ? tooltip.svgX - boxW - 14 : tooltip.svgX + 14;
            const ty = Math.max(M.top, Math.min(tooltip.svgY - 20, M.top + IH - boxH - 4));

            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={tx} y={ty} width={boxW} height={boxH} rx={8}
                  fill="white" stroke="#e5e7eb" strokeWidth={1}
                  filter="drop-shadow(0 2px 8px rgba(0,0,0,0.12))" />
                {/* Name */}
                <text x={tx + 10} y={ty + 17} fontSize={11.5} fontWeight={700} fill="#111827"
                  style={observerMode ? { filter: 'blur(5px)', userSelect: 'none' } : undefined}>
                  {s.firstName} {s.lastName}
                </text>
                {/* Class */}
                <text x={tx + 10} y={ty + 31} fontSize={10} fill="#6b7280">
                  {grp?.name ?? s.classGroupId}
                </text>
                {/* Level */}
                <rect x={tx + 10} y={ty + 37} width={46} height={13} rx={4} fill={levelColor} />
                <text x={tx + 33} y={ty + 47} textAnchor="middle" fontSize={9} fontWeight={700} fill="white">
                  Stufe {s.competenceLevel}
                </text>
                {clusterLabel && (
                  <>
                    <rect x={tx + 62} y={ty + 37} width={56} height={13} rx={4}
                      fill={CLUSTER_COLORS[tooltip.clusterIdx % CLUSTER_COLORS.length]} fillOpacity={0.9} />
                    <text x={tx + 90} y={ty + 47} textAnchor="middle" fontSize={9} fontWeight={700} fill="white">
                      {clusterLabel}
                    </text>
                  </>
                )}
                {/* Overall raw score */}
                {hasScore && (
                  <g>
                    <text x={tx + 10} y={ty + 58} fontSize={9} fill="#6b7280">Rohwert (gesamt)</text>
                    <text x={tx + boxW - 8} y={ty + 58} textAnchor="end" fontSize={9} fontWeight={700} fill="#374151">{s.score}%</text>
                  </g>
                )}
                {/* Domain levels + raw scores */}
                {domainEntries.map(([domain, lvl], di) => {
                  const domColor = COMPETENCE_LEVELS[lvl]?.color ?? '#6b7280';
                  const domScore = s.domainScores?.[domain];
                  const rowY = ty + (hasScore ? 72 : 58) + di * 14;
                  return (
                    <g key={domain}>
                      <text x={tx + 10} y={rowY} fontSize={9} fill="#6b7280">{domain}</text>
                      <rect x={tx + boxW - 40} y={rowY - 9} width={18} height={11} rx={3} fill={domColor} />
                      <text x={tx + boxW - 31} y={rowY - 0.5} textAnchor="middle" fontSize={8} fontWeight={700} fill="white">{lvl}</text>
                      {domScore != null && (
                        <text x={tx + boxW - 8} y={rowY} textAnchor="end" fontSize={8} fill="#9ca3af">{domScore}%</text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })()}
        </svg>
      </div>

      {/* ── Legend ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {clusters ? (
          clusters.centroids.map((_, ci) => {
            const col = CLUSTER_COLORS[ci % CLUSTER_COLORS.length];
            const count = clusters.labels.filter((l) => l === ci).length;
            return (
              <button key={ci} onClick={() => selectCluster(ci)}
                className="flex items-center gap-1.5 hover:opacity-75 transition-opacity">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col }} />
                <span className="text-xs text-gray-600">Cluster {ci + 1} <span className="text-gray-400">({count})</span></span>
              </button>
            );
          })
        ) : (
          Object.entries(COMPETENCE_LEVELS).map(([lvl, cfg]) => (
            <div key={lvl} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span className="text-xs text-gray-600">Stufe {lvl}</span>
            </div>
          ))
        )}
        <span className="text-xs text-gray-400 ml-auto">{students.length} Schüler*innen</span>
      </div>

      {/* ── Selection action bar ──────────────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {selectedIds.size} Schüler*in{selectedIds.size !== 1 ? 'nen' : ''} ausgewählt
            </span>
          </div>

          {showForm ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                placeholder="Gruppenname…"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createGroup()}
                className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary w-44"
              />
              <button
                onClick={createGroup}
                disabled={!groupName.trim()}
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${groupName.trim() ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                Erstellen
              </button>
              <button onClick={() => setShowForm(false)} className="text-sm text-gray-400 hover:text-gray-600">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm font-medium px-3 py-1.5 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Als Gruppe speichern
            </button>
          )}

          <button
            onClick={() => { setSelectedIds(new Set()); setShowForm(false); }}
            className="text-xs text-gray-400 hover:text-gray-700 ml-auto"
          >
            Auswahl aufheben
          </button>
        </div>
      )}

      {feedback && (
        <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {feedback}
        </p>
      )}
    </div>
  );
};

export default StudentMapCard;
