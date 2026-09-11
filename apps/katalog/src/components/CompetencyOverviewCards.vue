<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  chartData: {
    type: Array,
    required: true,
  },
  stats: {
    type: Object,
    required: true,
  },
  subject: {
    type: String,
    default: null,
  },
});

// ── SVG donut helpers ──────────────────────────────────────────────────────────

const CX = 100;
const CY = 100;
const OUTER_R = 80;
const INNER_R = 52;

function toRad(deg) {
  return ((deg - 90) * Math.PI) / 180;
}

function arcPath(startAngle, endAngle) {
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
}

const slices = computed(() => {
  const total = props.chartData.reduce((s, d) => s + d.count, 0);
  if (total === 0) return [];
  let angle = 0;
  return props.chartData.map((d, i) => {
    const sweep = (d.count / total) * 360;
    const start = angle;
    angle += sweep;
    return { ...d, path: arcPath(start, angle), index: i, percentage: d.count / total };
  });
});

// Re-key the SVG when data changes to replay animations
const animKey = computed(() => props.chartData.map((d) => d.count).join('-'));

// ── Hover & tooltip ────────────────────────────────────────────────────────────

const hoveredLevel = ref(null);
const tooltip = ref({ visible: false, x: 0, y: 0, slice: null });

function onSliceEnter(slice, event) {
  hoveredLevel.value = slice.level;
  moveTooltip(event, slice);
}

function onSliceMove(slice, event) {
  moveTooltip(event, slice);
}

function onSliceLeave() {
  hoveredLevel.value = null;
  tooltip.value.visible = false;
}

function moveTooltip(event, slice) {
  const rect = event.currentTarget.closest('.donut-wrap').getBoundingClientRect();
  tooltip.value = {
    visible: true,
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    slice,
  };
}

// ── Stats ──────────────────────────────────────────────────────────────────────

const atOrAbove = computed(() => (props.stats.atStandard ?? 0) + (props.stats.aboveStandard ?? 0));
const atOrAboveCount = computed(() => Math.round(atOrAbove.value * props.stats.total));
const belowCount = computed(() => Math.round((props.stats.belowStandard ?? 0) * props.stats.total));

function fmtPct(v) {
  return `${Math.round(v * 100)} %`;
}
</script>

<template>
  <div class="overview-grid">
    <!-- Donut card -->
    <div class="ov-card">
      <div class="ov-card-title">Kompetenzübersicht</div>
      <div class="donut-wrap">
        <svg :key="animKey" viewBox="0 0 200 200" class="donut-svg">
          <path
            v-for="(slice, i) in slices"
            :key="slice.level"
            :d="slice.path"
            :fill="slice.color"
            :class="['donut-slice', { dimmed: hoveredLevel && hoveredLevel !== slice.level }]"
            :style="{ animationDelay: `${i * 70}ms` }"
            stroke="#fff"
            stroke-width="2"
            @mouseenter="onSliceEnter(slice, $event)"
            @mousemove="onSliceMove(slice, $event)"
            @mouseleave="onSliceLeave"
          />
        </svg>

        <!-- Floating tooltip -->
        <div
          v-if="tooltip.visible && tooltip.slice"
          class="donut-tooltip"
          :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
        >
          <div class="tt-header">
            <span class="tt-dot" :style="{ background: tooltip.slice.color }" />
            <span class="tt-level">Stufe {{ tooltip.slice.level }}</span>
          </div>
          <div class="tt-name">{{ tooltip.slice.name }}</div>
          <div class="tt-stats">
            <span class="tt-count">{{ tooltip.slice.count }} Schüler*innen</span>
            <span class="tt-pct">{{ fmtPct(tooltip.slice.percentage) }}</span>
          </div>
        </div>

        <div class="donut-center">
          <span v-if="subject" class="donut-subject">{{ subject }}</span>
          <span class="donut-total">{{ stats.total }}</span>
          <span class="donut-label">Schüler*innen</span>
        </div>
      </div>

      <div class="legend">
        <div
          v-for="d in chartData"
          :key="d.level"
          class="legend-item"
          :class="{ 'legend-highlight': hoveredLevel === d.level }"
          @mouseenter="hoveredLevel = d.level"
          @mouseleave="hoveredLevel = null"
        >
          <span class="legend-dot" :style="{ backgroundColor: d.color }" />
          <span class="legend-text">Stufe {{ d.level }}</span>
        </div>
      </div>
    </div>

    <!-- Stats card -->
    <div class="ov-card">
      <div class="ov-card-title">Schlüsselkennzahlen</div>
      <div class="stats-wrap" :key="animKey">
        <div class="stat-block stat-green" data-testid="stat-at-or-above">
          <div class="stat-value">{{ fmtPct(atOrAbove) }}</div>
          <div class="stat-name">Mindeststandard und darüber</div>
          <div class="stat-sub">Kompetenzstufen II–V · {{ atOrAboveCount }} Schüler*innen</div>
        </div>
        <div class="stat-block stat-orange" data-testid="stat-below-standard" style="animation-delay: 0.15s">
          <div class="stat-value">{{ fmtPct(stats.belowStandard ?? 0) }}</div>
          <div class="stat-name">Unter Mindeststandard</div>
          <div class="stat-sub">Kompetenzstufe I · {{ belowCount }} Schüler*innen</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.ov-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ov-card-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e3a5f;
}

/* ── Donut ─────────────────────────────────────────────────────────────────── */
.donut-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.donut-svg {
  width: 180px;
  height: 180px;
  overflow: visible;
}

/* Slice animation: scale in from SVG viewport center */
@keyframes slice-appear {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.donut-slice {
  transform-box: view-box;
  transform-origin: 50% 50%;
  animation: slice-appear 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  transition: opacity 0.18s ease, filter 0.18s ease;
  cursor: pointer;
}

.donut-slice:hover {
  filter: brightness(1.12) drop-shadow(0 2px 5px rgba(0, 0, 0, 0.22));
}

.donut-slice.dimmed {
  opacity: 0.3;
  filter: grayscale(25%);
}

/* ── Tooltip ───────────────────────────────────────────────────────────────── */
.donut-tooltip {
  position: absolute;
  background: #1e293b;
  color: #fff;
  border-radius: 8px;
  padding: 9px 13px;
  pointer-events: none;
  z-index: 20;
  white-space: nowrap;
  transform: translate(-50%, calc(-100% - 12px));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.28);
  animation: tooltip-in 0.12s ease both;
}

@keyframes tooltip-in {
  from { opacity: 0; transform: translate(-50%, calc(-100% - 6px)); }
  to   { opacity: 1; transform: translate(-50%, calc(-100% - 12px)); }
}

.tt-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}

.tt-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tt-level {
  font-size: 0.82rem;
  font-weight: 700;
}

.tt-name {
  font-size: 0.73rem;
  opacity: 0.75;
  margin-bottom: 7px;
}

.tt-stats {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 18px;
}

.tt-count {
  font-size: 0.75rem;
  opacity: 0.85;
}

.tt-pct {
  font-size: 0.9rem;
  font-weight: 700;
}

/* ── Donut center label ────────────────────────────────────────────────────── */
.donut-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.donut-subject {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
}

.donut-total {
  font-size: 1.6rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.1;
}

.donut-label {
  font-size: 0.68rem;
  color: #94a3b8;
}

/* ── Legend ────────────────────────────────────────────────────────────────── */
.legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 7px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.legend-item:hover,
.legend-item.legend-highlight {
  background: #f1f5f9;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}

.legend-text {
  font-size: 0.75rem;
  color: #64748b;
}

/* ── Stats card ────────────────────────────────────────────────────────────── */
@keyframes stat-in {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.stats-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.stat-block {
  border-radius: 10px;
  padding: 16px 18px;
  color: #fff;
  flex: 1;
  animation: stat-in 0.4s ease both;
}

.stat-green { background: #22c55e; }
.stat-orange { background: #f97316; }

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-name {
  font-size: 0.82rem;
  font-weight: 600;
  margin-top: 6px;
  opacity: 0.9;
}

.stat-sub {
  font-size: 0.72rem;
  margin-top: 3px;
  opacity: 0.75;
}
</style>
