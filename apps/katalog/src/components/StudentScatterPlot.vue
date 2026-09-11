<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  students: { type: Array, required: true },
  // { id, initials, name, x, y, details: [{domain, pct, levelX}] }
  groupLabel: { type: String, default: '' },
});

// ── SVG Layout ─────────────────────────────────────────────────────────────────
const PAD_L = 58;
const PAD_R = 20;
const PAD_T = 18;
const PAD_B = 62;
const SVG_W = 760;
const SVG_H = 440;
const CW = SVG_W - PAD_L - PAD_R;
const CH = SVG_H - PAD_T - PAD_B;
const DOT_R = 15;

// X: 0–5 (competence levels I–V, one unit per level)
// Y: 0–100 (raw score %)
const xPx = (v) => PAD_L + (Math.max(0, Math.min(5, v)) / 5) * CW;
const yPx = (v) => PAD_T + (1 - Math.max(0, Math.min(100, v)) / 100) * CH;

const X_LEVELS = [
  { label: 'I',   x: 0.5, color: '#ef4444' },
  { label: 'II',  x: 1.5, color: '#f97316' },
  { label: 'III', x: 2.5, color: '#eab308' },
  { label: 'IV',  x: 3.5, color: '#22c55e' },
  { label: 'V',   x: 4.5, color: '#15803d' },
];
const Y_TICKS = [0, 25, 50, 75, 100];

// ── Cluster colors ─────────────────────────────────────────────────────────────
const CLUSTER_COLORS = ['#3b82f6', '#f97316', '#22c55e', '#a855f7', '#ec4899', '#14b8a6'];
const clusterColor = (ci) => CLUSTER_COLORS[ci % CLUSTER_COLORS.length];

// ── K-means++ ──────────────────────────────────────────────────────────────────
const dist2 = (a, b) => {
  const dx = (a.x - b.x) * 20; // scale x (0-5) closer to y (0-100) space
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};

function kmeans(pts, k, iters = 80) {
  if (!pts.length) return [];
  k = Math.min(k, pts.length);
  // k-means++ init
  const cents = [pts[Math.floor(Math.random() * pts.length)]];
  while (cents.length < k) {
    const ds = pts.map(p => Math.min(...cents.map(c => dist2(p, c))));
    const sum = ds.reduce((a, b) => a + b, 0);
    let r = Math.random() * sum;
    let pick = pts.length - 1;
    for (let i = 0; i < ds.length; i++) { r -= ds[i]; if (r <= 0) { pick = i; break; } }
    cents.push({ ...pts[pick] });
  }

  let asgn = new Array(pts.length).fill(0);
  for (let iter = 0; iter < iters; iter++) {
    let changed = false;
    for (let i = 0; i < pts.length; i++) {
      let best = 0, bd = Infinity;
      for (let j = 0; j < k; j++) {
        const d = dist2(pts[i], cents[j]);
        if (d < bd) { bd = d; best = j; }
      }
      if (asgn[i] !== best) { asgn[i] = best; changed = true; }
    }
    if (!changed) break;
    for (let j = 0; j < k; j++) {
      const g = pts.filter((_, i) => asgn[i] === j);
      if (g.length) {
        cents[j] = { x: g.reduce((s, p) => s + p.x, 0) / g.length, y: g.reduce((s, p) => s + p.y, 0) / g.length };
      }
    }
  }
  // Re-order: cluster 0 = leftmost by mean-x
  const mx = Array.from({ length: k }, (_, j) => {
    const g = pts.filter((_, i) => asgn[i] === j);
    return g.length ? g.reduce((s, p) => s + p.x, 0) / g.length : 0;
  });
  const order = Array.from({ length: k }, (_, i) => i).sort((a, b) => mx[a] - mx[b]);
  const remap = new Array(k);
  order.forEach((old, ni) => { remap[old] = ni; });
  return asgn.map(a => remap[a]);
}

// ── Convex hull (Andrew's monotone chain) ──────────────────────────────────────
const cross2d = (O, A, B) => (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);

function convexHull(pts) {
  if (pts.length < 2) return [...pts];
  const s = [...pts].sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
  const h = [];
  for (const p of s) { while (h.length >= 2 && cross2d(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); }
  const lo = h.length;
  for (let i = s.length - 2; i >= 0; i--) { const p = s[i]; while (h.length > lo && cross2d(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); }
  h.pop();
  return h;
}

function inflateHull(hull, r) {
  const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
  return hull.map(p => {
    const dx = p.x - cx, dy = p.y - cy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: p.x + (dx / len) * r, y: p.y + (dy / len) * r };
  });
}

// Smooth Catmull-Rom closed path
function smoothClosed(pts) {
  const n = pts.length;
  if (!n) return '';
  if (n === 1) return `M ${pts[0].x} ${pts[0].y} Z`;
  if (n === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} Z`;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const t = 0.4;
    const cp1x = p1.x + (p2.x - p0.x) * t / 3;
    const cp1y = p1.y + (p2.y - p0.y) * t / 3;
    const cp2x = p2.x - (p3.x - p1.x) * t / 3;
    const cp2y = p2.y - (p3.y - p1.y) * t / 3;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d + ' Z';
}

// ── Clustering state ───────────────────────────────────────────────────────────
const clusterCount = ref(3);
const assignments = ref([]);

const runClustering = () => {
  if (!props.students.length) return;
  assignments.value = kmeans(props.students, clusterCount.value);
};

watch(() => props.students, runClustering, { immediate: true });
watch(clusterCount, () => {}); // only run on button click

// ── Cluster hulls ──────────────────────────────────────────────────────────────
const clusterHulls = computed(() => {
  const asgn = assignments.value;
  if (!asgn.length) return [];
  const k = Math.max(...asgn) + 1;
  const hulls = [];
  for (let ci = 0; ci < k; ci++) {
    const pts = props.students
      .filter((_, i) => asgn[i] === ci)
      .map(s => ({ x: xPx(s.x), y: yPx(s.y) }));
    if (!pts.length) continue;
    const hull = convexHull(pts);
    const inflated = inflateHull(hull.length < 3 ? [...hull, ...hull.map(p => ({ x: p.x + 0.1, y: p.y }))] : hull, 26);
    const clamped = inflated.map(p => ({
      x: Math.max(PAD_L + 4, Math.min(SVG_W - PAD_R - 4, p.x)),
      y: Math.max(PAD_T + 4, Math.min(PAD_T + CH - 4, p.y)),
    }));
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    hulls.push({ ci, path: smoothClosed(clamped), cx, cy, count: pts.length, color: clusterColor(ci) });
  }
  return hulls;
});

// ── Dots ───────────────────────────────────────────────────────────────────────
const dots = computed(() =>
  props.students.map((s, i) => ({
    ...s,
    px: xPx(s.x),
    py: yPx(s.y),
    ci: assignments.value[i] ?? 0,
    color: clusterColor(assignments.value[i] ?? 0),
  }))
);

// ── Tooltip (HTML overlay) ─────────────────────────────────────────────────────
const tooltip = ref(null);
const svgRef = ref(null);

const showTooltip = (dot, evt) => {
  tooltip.value = dot;
};
const hideTooltip = () => { tooltip.value = null; };

const tooltipStyle = computed(() => {
  if (!tooltip.value) return {};
  const left = Math.min(tooltip.value.px + DOT_R + 6, SVG_W - 230);
  const top = Math.max(tooltip.value.py - 20, PAD_T);
  return { left: `${left}px`, top: `${top}px` };
});

// ── Helpers ────────────────────────────────────────────────────────────────────
const xToLevel = (x) => {
  if (x < 1) return { label: 'I',   color: '#ef4444' };
  if (x < 2) return { label: 'II',  color: '#f97316' };
  if (x < 3) return { label: 'III', color: '#eab308' };
  if (x < 4) return { label: 'IV',  color: '#22c55e' };
  return              { label: 'V',   color: '#15803d' };
};

const DOMAIN_LABELS = { ho: 'Hörverstehen', le: 'Leseverstehen', sr: 'Sprachgebrauch', ma: 'Mathematik', en: 'Englisch', fr: 'Französisch' };
const domLabel = (d) => DOMAIN_LABELS[d] ?? d?.toUpperCase() ?? '';
</script>

<template>
  <div class="ssp-wrap">

    <!-- ── Controls ──────────────────────────────────────────────────────── -->
    <div class="ssp-controls">
      <div class="ctrl-pair">
        <span class="ctrl-lbl">X-Achse</span>
        <span class="ctrl-val">Kompetenzstufe (gesamt)</span>
      </div>
      <div class="ctrl-pair">
        <span class="ctrl-lbl">Y-Achse</span>
        <span class="ctrl-val">Rohwert (gesamt, %)</span>
      </div>
      <div class="ctrl-pair ctrl-right">
        <span class="ctrl-lbl">Cluster</span>
        <input v-model.number="clusterCount" type="number" min="1" max="6" class="ctrl-num" />
      </div>
      <button class="btn-cluster" @click="runClustering">Clustern</button>
      <button class="btn-groups" disabled title="Gruppen-Export — not implemented in demo">Alle als Gruppen →</button>
    </div>

    <!-- ── Hint ───────────────────────────────────────────────────────────── -->
    <p class="ssp-hint">
      Klicken Sie auf einen Punkt für Details · Cluster-Fläche zeigt Zuordnung
    </p>

    <!-- ── Chart ─────────────────────────────────────────────────────────── -->
    <div class="ssp-chart-outer" @click="hideTooltip">
      <div class="ssp-chart-inner" ref="svgRef">
        <svg :width="SVG_W" :height="SVG_H" :viewBox="`0 0 ${SVG_W} ${SVG_H}`" class="ssp-svg">

          <!-- chart bg -->
          <rect :x="PAD_L" :y="PAD_T" :width="CW" :height="CH" fill="#f8fafc" />

          <!-- Y grid -->
          <g v-for="t in Y_TICKS" :key="`y${t}`">
            <line :x1="PAD_L" :y1="yPx(t)" :x2="PAD_L + CW" :y2="yPx(t)"
                  stroke="#e2e8f0" stroke-width="1" />
            <text :x="PAD_L - 7" :y="yPx(t)" text-anchor="end" dominant-baseline="middle"
                  font-size="11" fill="#94a3b8" font-family="system-ui">{{ t }}%</text>
          </g>

          <!-- X grid (level boundaries) -->
          <line v-for="n in [1,2,3,4]" :key="`xb${n}`"
                :x1="xPx(n)" :y1="PAD_T" :x2="xPx(n)" :y2="PAD_T + CH"
                stroke="#e2e8f0" stroke-width="1" />

          <!-- Chart border -->
          <rect :x="PAD_L" :y="PAD_T" :width="CW" :height="CH"
                fill="none" stroke="#cbd5e1" stroke-width="1" />

          <!-- X level labels -->
          <g v-for="lvl in X_LEVELS" :key="`xl${lvl.label}`">
            <text :x="xPx(lvl.x)" :y="PAD_T + CH + 22"
                  text-anchor="middle" font-size="16" font-weight="700"
                  :fill="lvl.color" font-family="system-ui">{{ lvl.label }}</text>
          </g>

          <!-- Axis titles -->
          <text :x="PAD_L + CW / 2" :y="SVG_H - 6"
                text-anchor="middle" font-size="11" fill="#64748b" font-family="system-ui">
            Kompetenzstufe (gesamt)
          </text>
          <text :x="13" :y="PAD_T + CH / 2" text-anchor="middle"
                font-size="11" fill="#64748b" font-family="system-ui"
                :transform="`rotate(-90,13,${PAD_T + CH / 2})`">
            Rohwert (gesamt, %)
          </text>

          <!-- ── Cluster hulls ─────────────────────────────────────────── -->
          <g v-for="hull in clusterHulls" :key="`hull${hull.ci}`">
            <path :d="hull.path"
                  :fill="`${hull.color}1a`"
                  :stroke="hull.color"
                  stroke-width="2"
                  stroke-dasharray="7,4"
                  stroke-linejoin="round" />
          </g>

          <!-- Cluster labels (drawn after hulls so they appear on top) -->
          <g v-for="hull in clusterHulls" :key="`lbl${hull.ci}`">
            <rect :x="hull.cx - 52" :y="hull.cy - 12" width="104" height="24" rx="12"
                  :fill="hull.color" />
            <text :x="hull.cx" :y="hull.cy + 5"
                  text-anchor="middle" font-size="11" font-weight="700"
                  fill="white" font-family="system-ui" pointer-events="none">
              Cluster {{ hull.ci + 1 }} · {{ hull.count }}
            </text>
          </g>

          <!-- ── Student dots ──────────────────────────────────────────── -->
          <g v-for="dot in dots" :key="dot.id" class="dot-g" @click.stop="showTooltip(dot, $event)">
            <circle :cx="dot.px" :cy="dot.py" :r="DOT_R"
                    :fill="dot.color" stroke="white" stroke-width="2.5"
                    :opacity="tooltip && tooltip.id !== dot.id ? 0.65 : 1" />
            <text :x="dot.px" :y="dot.py + 4"
                  text-anchor="middle" font-size="9" font-weight="700"
                  fill="white" font-family="system-ui, sans-serif" pointer-events="none">
              {{ dot.initials }}
            </text>
          </g>

        </svg>

        <!-- ── HTML Tooltip overlay ──────────────────────────────────────── -->
        <div v-if="tooltip" class="ssp-tip" :style="tooltipStyle" @click.stop>
          <div class="tip-name">{{ tooltip.name }}</div>
          <div class="tip-group">{{ groupLabel }}</div>
          <div class="tip-badges">
            <span class="tip-badge" :style="{ background: xToLevel(tooltip.x).color }">
              Stufe {{ xToLevel(tooltip.x).label }}
            </span>
            <span class="tip-badge" :style="{ background: clusterColor(tooltip.ci) }">
              Cluster {{ tooltip.ci + 1 }}
            </span>
          </div>
          <div class="tip-divider" />
          <div class="tip-row">
            <span>Rohwert (gesamt)</span>
            <strong>{{ tooltip.y.toFixed(0) }} %</strong>
          </div>
          <div v-for="det in (tooltip.details ?? [])" :key="det.domain" class="tip-row">
            <span>{{ domLabel(det.domain) }}</span>
            <div class="tip-row-right">
              <span class="tip-mini-badge" :style="{ background: xToLevel(det.levelX).color }">
                {{ xToLevel(det.levelX).label }}
              </span>
              <strong>{{ det.pct.toFixed(0) }} %</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ssp-wrap { display: flex; flex-direction: column; gap: 8px; }

/* Controls */
.ssp-controls {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 8px 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
}
.ctrl-pair { display: flex; align-items: center; gap: 7px; }
.ctrl-right { margin-left: auto; }
.ctrl-lbl {
  font-size: 0.7rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap;
}
.ctrl-val {
  font-size: 0.8rem; color: #1e3a5f; background: #eff6ff;
  padding: 3px 10px; border-radius: 6px; border: 1px solid #bfdbfe;
  white-space: nowrap;
}
.ctrl-num {
  width: 52px; padding: 4px 7px; font-size: 0.85rem; text-align: center;
  border: 1px solid #e2e8f0; border-radius: 6px; outline: none;
  color: #374151;
}
.btn-cluster {
  padding: 5px 16px; font-size: 0.82rem; font-weight: 600; color: white;
  background: #1e3a5f; border: none; border-radius: 6px; cursor: pointer;
  transition: background 0.12s;
}
.btn-cluster:hover { background: #1e40af; }
.btn-groups {
  padding: 5px 16px; font-size: 0.82rem; font-weight: 600; color: white;
  background: #22c55e; border: none; border-radius: 6px; cursor: not-allowed; opacity: 0.55;
}

/* Hint */
.ssp-hint {
  font-size: 0.72rem; color: #94a3b8; margin: 0; padding: 0 2px;
}

/* Chart */
.ssp-chart-outer { overflow-x: auto; }
.ssp-chart-inner { position: relative; display: inline-block; }
.ssp-svg { display: block; }

.dot-g { cursor: pointer; }
.dot-g circle { transition: r 0.1s; }
.dot-g:hover circle { r: 17; }

/* Tooltip */
.ssp-tip {
  position: absolute; z-index: 10;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
  padding: 14px 16px; min-width: 220px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  pointer-events: none;
}
.tip-name { font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.tip-group { font-size: 0.8rem; color: #64748b; margin-bottom: 8px; }
.tip-badges { display: flex; gap: 6px; margin-bottom: 8px; }
.tip-badge {
  font-size: 0.75rem; font-weight: 700; color: white;
  padding: 3px 10px; border-radius: 5px;
}
.tip-divider { border: none; border-top: 1px solid #f1f5f9; margin-bottom: 6px; }
.tip-row {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 0.82rem; color: #374151; padding: 3px 0;
}
.tip-row-right { display: flex; align-items: center; gap: 6px; }
.tip-mini-badge {
  font-size: 0.68rem; font-weight: 700; color: white;
  padding: 1px 5px; border-radius: 3px;
}
</style>
