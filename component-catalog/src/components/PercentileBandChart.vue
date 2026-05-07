<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
  title: { type: String, default: '' },
  markerLabel: { type: String, default: 'Schüler*in' },
  bandLabel: { type: String, default: 'Streuungsband (MW ± 1 SD)' },
  xAxisLabel: { type: String, default: 'Lösungshäufigkeit (%)' },
});

// ── Layout ────────────────────────────────────────────────────────────────────
const LABEL_W = 190;
const CHART_W = 560;
const PAD_RIGHT = 16;
const PAD_TOP = 32;
const PAD_BOTTOM = 44;
const ROW_H = 22;
const DIAMOND_R = 5;
const SVG_W = LABEL_W + CHART_W + PAD_RIGHT;

const svgHeight = computed(() => PAD_TOP + props.items.length * ROW_H + PAD_BOTTOM);
const chartH = computed(() => props.items.length * ROW_H);

// ── Helpers ───────────────────────────────────────────────────────────────────
const xPx = (pct) => LABEL_W + (Math.max(0, Math.min(100, pct)) / 100) * CHART_W;
const yMid = (i) => PAD_TOP + i * ROW_H + ROW_H / 2;
const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// Cubic-bezier curves through vertical point sequences
const curveDown = (pts) => {
  let d = '';
  const dy = ROW_H * 0.45;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    d += ` C ${p0.x.toFixed(1)} ${(p0.y + dy).toFixed(1)} ${p1.x.toFixed(1)} ${(p1.y - dy).toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
};
const curveUp = (pts) => {
  let d = '';
  const dy = ROW_H * 0.45;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    d += ` C ${p0.x.toFixed(1)} ${(p0.y - dy).toFixed(1)} ${p1.x.toFixed(1)} ${(p1.y + dy).toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
};

// ── Pre-compute edge point arrays ─────────────────────────────────────────────
const leftEdgePts = computed(() =>
  props.items.map((item, i) => ({ x: xPx(item.bandLeft), y: yMid(i) }))
);
const rightEdgePts = computed(() =>
  props.items.map((item, i) => ({ x: xPx(item.bandRight), y: yMid(i) }))
);

// ── Smooth band path (blue) ───────────────────────────────────────────────────
const bandPath = computed(() => {
  const n = props.items.length;
  if (!n) return '';
  const left = leftEdgePts.value;
  const right = rightEdgePts.value;
  const topY = PAD_TOP, botY = PAD_TOP + n * ROW_H;

  let d = `M ${left[0].x.toFixed(1)} ${topY}`;
  d += ` L ${left[0].x.toFixed(1)} ${left[0].y.toFixed(1)}`;
  d += curveDown(left);
  d += ` L ${left[n - 1].x.toFixed(1)} ${botY}`;
  d += ` L ${right[n - 1].x.toFixed(1)} ${botY}`;
  const rightRev = [...right].reverse();
  d += ` L ${rightRev[0].x.toFixed(1)} ${rightRev[0].y.toFixed(1)}`;
  d += curveUp(rightRev);
  d += ` L ${right[0].x.toFixed(1)} ${topY} Z`;
  return d;
});

// ── Left area path (orange — below band) ─────────────────────────────────────
const leftAreaPath = computed(() => {
  const n = props.items.length;
  if (!n) return '';
  const left = leftEdgePts.value;
  const topY = PAD_TOP, botY = PAD_TOP + n * ROW_H;
  const chartLeft = LABEL_W;

  // Chart left edge → top of band left edge → curve down → bottom → back left
  let d = `M ${chartLeft} ${topY}`;
  d += ` L ${left[0].x.toFixed(1)} ${topY}`;
  d += ` L ${left[0].x.toFixed(1)} ${left[0].y.toFixed(1)}`;
  d += curveDown(left);
  d += ` L ${left[n - 1].x.toFixed(1)} ${botY}`;
  d += ` L ${chartLeft} ${botY} Z`;
  return d;
});

// ── Right area path (green — above band) ─────────────────────────────────────
const rightAreaPath = computed(() => {
  const n = props.items.length;
  if (!n) return '';
  const right = rightEdgePts.value;
  const topY = PAD_TOP, botY = PAD_TOP + n * ROW_H;
  const chartRight = LABEL_W + CHART_W;

  // Top of band right edge → chart right edge → down → back along band right edge upward
  let d = `M ${right[0].x.toFixed(1)} ${topY}`;
  d += ` L ${chartRight} ${topY}`;
  d += ` L ${chartRight} ${botY}`;
  d += ` L ${right[n - 1].x.toFixed(1)} ${botY}`;
  d += ` L ${right[n - 1].x.toFixed(1)} ${right[n - 1].y.toFixed(1)}`;
  const rightRev = [...right].reverse();
  d += curveUp(rightRev);
  d += ` L ${right[0].x.toFixed(1)} ${topY} Z`;
  return d;
});

// ── Diamond ───────────────────────────────────────────────────────────────────
const diamond = (x, y) => {
  const r = DIAMOND_R;
  return `M ${x} ${(y - r).toFixed(1)} L ${(x + r).toFixed(1)} ${y} L ${x} ${(y + r).toFixed(1)} L ${(x - r).toFixed(1)} ${y} Z`;
};

const legendY = computed(() => PAD_TOP + props.items.length * ROW_H + 10);
const axisLabelY = computed(() => PAD_TOP + props.items.length * ROW_H + 30);
</script>

<template>
  <figure class="pbc-figure">
    <figcaption v-if="title" class="pbc-title">{{ title }}</figcaption>

    <div class="pbc-scroll">
      <svg
        :width="SVG_W"
        :height="svgHeight"
        :viewBox="`0 0 ${SVG_W} ${svgHeight}`"
        role="img"
        :aria-label="title"
      >
        <!-- ── Tinted chart background ─────────────────────────────────── -->
        <rect :x="LABEL_W" :y="PAD_TOP" :width="CHART_W" :height="chartH" fill="#e8f2f9" />

        <!-- ── White vertical grid lines ─────────────────────────────────── -->
        <line :x1="xPx(0)" :y1="PAD_TOP - 4" :x2="xPx(100)" :y2="PAD_TOP - 4"
              stroke="#cbd5e1" stroke-width="1" />
        <g v-for="t in ticks" :key="t">
          <line :x1="xPx(t)" :y1="PAD_TOP - 4"
                :x2="xPx(t)" :y2="PAD_TOP + chartH"
                stroke="rgba(255,255,255,0.85)" stroke-width="1" />
          <text :x="xPx(t)" :y="PAD_TOP - 8"
                text-anchor="middle" font-size="10" fill="#94a3b8"
                font-family="system-ui, sans-serif">{{ t }}%</text>
        </g>

        <!-- ── Row dividers ───────────────────────────────────────────────── -->
        <line v-for="(_, i) in items" :key="`div-${i}`"
              :x1="LABEL_W" :y1="PAD_TOP + i * ROW_H"
              :x2="SVG_W - PAD_RIGHT" :y2="PAD_TOP + i * ROW_H"
              stroke="rgba(255,255,255,0.45)" stroke-width="1" />

        <!-- ── Orange area (left of band = below average) ─────────────────── -->
        <path :d="leftAreaPath"
              fill="rgba(251,146,60,0.28)"
              stroke="none" />

        <!-- ── Green area (right of band = above average) ─────────────────── -->
        <path :d="rightAreaPath"
              fill="rgba(74,222,128,0.28)"
              stroke="none" />

        <!-- ── Blue band ──────────────────────────────────────────────────── -->
        <path :d="bandPath"
              fill="rgba(90,155,210,0.50)"
              stroke="rgba(60,125,185,0.70)"
              stroke-width="1"
              stroke-linejoin="round" />

        <!-- ── Labels + diamonds ─────────────────────────────────────────── -->
        <g v-for="(item, i) in items" :key="`row-${i}`">
          <text :x="LABEL_W - 8" :y="yMid(i)"
                text-anchor="end" dominant-baseline="middle"
                font-size="11" fill="#374151"
                font-family="ui-monospace, monospace">{{ item.label }}</text>

          <path v-if="item.studentScore !== null && item.studentScore !== undefined"
                :d="diamond(xPx(item.studentScore), yMid(i))"
                fill="#1e3a5f" stroke="white" stroke-width="0.8" />
        </g>

        <!-- ── Legend ─────────────────────────────────────────────────────── -->
        <g :transform="`translate(${LABEL_W + 8}, ${legendY})`">
          <!-- Orange swatch -->
          <rect x="0" y="-5" width="12" height="10" rx="2" fill="rgba(251,146,60,0.55)" />
          <text x="16" y="4" font-size="10" fill="#64748b" font-family="system-ui,sans-serif">unterdurchschnittlich</text>

          <!-- Blue band swatch -->
          <g transform="translate(152,0)">
            <rect x="0" y="-5" width="12" height="10" rx="2"
                  fill="rgba(90,155,210,0.50)" stroke="rgba(60,125,185,0.70)" stroke-width="1" />
            <text x="16" y="4" font-size="10" fill="#64748b" font-family="system-ui,sans-serif">{{ bandLabel }}</text>
          </g>

          <!-- Green swatch -->
          <g transform="translate(350,0)">
            <rect x="0" y="-5" width="12" height="10" rx="2" fill="rgba(74,222,128,0.55)" />
            <text x="16" y="4" font-size="10" fill="#64748b" font-family="system-ui,sans-serif">überdurchschnittlich</text>
          </g>

          <!-- Diamond marker -->
          <g transform="translate(500,0)">
            <path :d="diamond(6, 0)" fill="#1e3a5f" stroke="white" stroke-width="0.8" />
            <text x="15" y="4" font-size="10" fill="#64748b" font-family="system-ui,sans-serif">{{ markerLabel }}</text>
          </g>
        </g>

        <!-- ── X-axis label ───────────────────────────────────────────────── -->
        <text :x="LABEL_W + CHART_W / 2" :y="axisLabelY"
              text-anchor="middle" font-size="10" fill="#94a3b8"
              font-style="italic" font-family="system-ui, sans-serif">{{ xAxisLabel }}</text>
      </svg>
    </div>
  </figure>
</template>

<style scoped>
.pbc-figure { margin: 0; }
.pbc-title { font-size: 1.05rem; font-weight: 600; color: #111827; margin-bottom: 12px; }
.pbc-scroll { overflow-x: auto; }
.pbc-scroll svg { display: block; }
</style>
