<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * rows: Array of {
   *   label: string,
   *   mean: number,       // 0–100 (solution rate %)
   *   ciLow?: number,     // lower bound of 95% CI
   *   ciHigh?: number,    // upper bound of 95% CI
   *   n?: number,         // sample size
   *   fair?: boolean,     // marks row as "Fairer Vergleich"
   * }
   */
  rows: { type: Array, required: true },
  title: { type: String, default: '' },
  domain: { type: String, default: '' },
  xLabel: { type: String, default: 'Mittlere Lösungsquote (%)' },
});

const LABEL_W = 170;
const CHART_W = 480;
const ROW_H = 36;
const GAP = 8;
const PAD_TOP = 32;
const PAD_BOTTOM = 36;
const PAD_RIGHT = 60;
const SVG_W = LABEL_W + CHART_W + PAD_RIGHT;

const svgHeight = computed(() =>
  PAD_TOP + props.rows.length * (ROW_H + GAP) - GAP + PAD_BOTTOM
);

const rowY = (i) => PAD_TOP + i * (ROW_H + GAP);
const cx = (pct) => LABEL_W + (pct / 100) * CHART_W;

const tickPcts = [0, 25, 50, 75, 100];

// Color + shape per row type
const rowStyle = (row) => {
  if (row.fair) return { color: '#0d9488', stroke: '#0f766e' };
  return { color: '#3b82f6', stroke: '#1d4ed8' };
};

// Background band for competency zones (subtle)
const ZONES = [
  { from: 0,  to: 30, color: '#fef2f2', label: 'KS I–II' },
  { from: 30, to: 60, color: '#fefce8', label: 'KS III' },
  { from: 60, to: 100, color: '#f0fdf4', label: 'KS IV–V' },
];

const zoneX = (pct) => LABEL_W + (pct / 100) * CHART_W;
const barAreaH = computed(() =>
  props.rows.length * (ROW_H + GAP) - GAP
);

const legendY = computed(() =>
  PAD_TOP + props.rows.length * (ROW_H + GAP) - GAP + 14
);
</script>

<template>
  <figure class="mcc-figure">
    <figcaption v-if="title" class="mcc-title">
      {{ title }}<span v-if="domain" class="mcc-domain"> — {{ domain }}</span>
    </figcaption>
    <div class="mcc-scroll">
      <svg :width="SVG_W" :height="svgHeight" :viewBox="`0 0 ${SVG_W} ${svgHeight}`">

        <!-- ── Competency zone bands ──────────────────────────────────────── -->
        <g>
          <rect v-for="z in ZONES" :key="z.label"
                :x="zoneX(z.from)" :y="PAD_TOP - 20"
                :width="(z.to - z.from) / 100 * CHART_W"
                :height="barAreaH + 20"
                :fill="z.color" />
          <text v-for="z in ZONES" :key="`zl-${z.label}`"
                :x="zoneX((z.from + z.to) / 2)" :y="PAD_TOP - 8"
                text-anchor="middle" font-size="8.5" fill="#94a3b8"
                font-family="system-ui,sans-serif">
            {{ z.label }}
          </text>
        </g>

        <!-- ── Tick lines + labels ──────────────────────────────────────────── -->
        <g>
          <g v-for="t in tickPcts" :key="t">
            <line :x1="cx(t)" :y1="PAD_TOP - 20"
                  :x2="cx(t)" :y2="PAD_TOP + barAreaH"
                  stroke="#e2e8f0" stroke-width="1" />
            <text :x="cx(t)" :y="PAD_TOP + barAreaH + 14"
                  text-anchor="middle" font-size="10" fill="#94a3b8"
                  font-family="system-ui,sans-serif">{{ t }}%</text>
          </g>
        </g>

        <!-- ── Rows ────────────────────────────────────────────────────────── -->
        <g v-for="(row, i) in rows" :key="i">
          <!-- Row center line -->
          <line :x1="LABEL_W" :y1="rowY(i) + ROW_H / 2"
                :x2="LABEL_W + CHART_W" :y2="rowY(i) + ROW_H / 2"
                stroke="#f1f5f9" stroke-width="1" />

          <!-- Label -->
          <text :x="LABEL_W - 10"
                :y="rowY(i) + ROW_H / 2"
                text-anchor="end" dominant-baseline="middle"
                font-size="12" :fill="row.fair ? '#0f766e' : '#374151'"
                font-family="system-ui,sans-serif">
            {{ row.label }}
          </text>
          <text v-if="row.fair" :x="LABEL_W - 2" :y="rowY(i) + ROW_H / 2"
                text-anchor="end" dominant-baseline="middle"
                font-size="11" font-family="system-ui,sans-serif">⚖</text>

          <!-- CI bar (if provided) -->
          <g v-if="row.ciLow != null && row.ciHigh != null">
            <line :x1="cx(row.ciLow)" :y1="rowY(i) + ROW_H / 2"
                  :x2="cx(row.ciHigh)" :y2="rowY(i) + ROW_H / 2"
                  :stroke="rowStyle(row).color" stroke-width="2.5" stroke-linecap="round" />
            <!-- CI end caps -->
            <line :x1="cx(row.ciLow)" :y1="rowY(i) + ROW_H / 2 - 6"
                  :x2="cx(row.ciLow)" :y2="rowY(i) + ROW_H / 2 + 6"
                  :stroke="rowStyle(row).color" stroke-width="1.5" />
            <line :x1="cx(row.ciHigh)" :y1="rowY(i) + ROW_H / 2 - 6"
                  :x2="cx(row.ciHigh)" :y2="rowY(i) + ROW_H / 2 + 6"
                  :stroke="rowStyle(row).color" stroke-width="1.5" />
          </g>

          <!-- Diamond marker at mean -->
          <g :transform="`translate(${cx(row.mean)}, ${rowY(i) + ROW_H / 2})`">
            <polygon points="0,-9 9,0 0,9 -9,0"
                     :fill="rowStyle(row).color"
                     :stroke="rowStyle(row).stroke"
                     stroke-width="1.5" />
            <text y="1" text-anchor="middle" dominant-baseline="middle"
                  font-size="7" font-weight="700" fill="white"
                  font-family="system-ui,sans-serif">{{ Math.round(row.mean) }}</text>
          </g>

          <!-- n= annotation -->
          <text v-if="row.n != null"
                :x="LABEL_W + CHART_W + 8" :y="rowY(i) + ROW_H / 2"
                dominant-baseline="middle" font-size="10" fill="#94a3b8"
                font-family="system-ui,sans-serif">
            n={{ row.n }}
          </text>
        </g>

        <!-- ── X axis label ───────────────────────────────────────────────── -->
        <text :x="LABEL_W + CHART_W / 2" :y="svgHeight - 4"
              text-anchor="middle" font-size="10" fill="#64748b"
              font-family="system-ui,sans-serif">
          {{ xLabel }}
        </text>

      </svg>
    </div>
  </figure>
</template>

<style scoped>
.mcc-figure { margin: 0; }
.mcc-title {
  font-size: 1.05rem; font-weight: 600; color: #111827; margin-bottom: 12px;
}
.mcc-domain { font-weight: 400; color: #64748b; font-size: 0.9rem; }
.mcc-scroll { overflow-x: auto; }
.mcc-scroll svg { display: block; }
</style>
