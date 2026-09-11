<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * items: Array of {
   *   label:     string,   // exercise ID e.g. "LE-026"
   *   level:     string,   // competence level "I"–"V"
   *   actual:    number,   // actual class solution rate 0–100
   *   expected:  number,   // IRT-expected solution rate 0–100
   * }
   */
  items: { type: Array, required: true },
  title:  { type: String, default: '' },
  domain: { type: String, default: '' },
});

const LABEL_W  = 80;
const BADGE_W  = 22;
const CHART_W  = 440;
const ROW_H    = 22;
const GAP      = 6;
const PAD_TOP  = 28;
const PAD_BOT  = 28;
const PAD_R    = 72;
const SVG_W    = LABEL_W + BADGE_W + 8 + CHART_W + PAD_R;

const LEVEL_COLORS = {
  I: '#ef4444', II: '#f97316', III: '#eab308', IV: '#22c55e', V: '#15803d',
};

const svgHeight = computed(() =>
  PAD_TOP + props.items.length * (ROW_H + GAP) - GAP + PAD_BOT
);

const rowY   = (i) => PAD_TOP + i * (ROW_H + GAP);
const chartX = LABEL_W + BADGE_W + 8;
const cx     = (pct) => chartX + (pct / 100) * CHART_W;

const TICKS = [0, 25, 50, 75, 100];

// Color/classification of the gap
const THRESHOLD = 7;
const gapColor = (actual, expected) => {
  const d = actual - expected;
  if (d > THRESHOLD)  return '#16a34a';  // clearly above → green
  if (d < -THRESHOLD) return '#dc2626';  // clearly below → red
  return '#64748b';                       // within range → neutral
};

const itemsWithGap = computed(() =>
  props.items.map(it => ({
    ...it,
    color:      gapColor(it.actual, it.expected),
    levelColor: LEVEL_COLORS[it.level] ?? '#94a3b8',
    delta:      Math.round(it.actual - it.expected),
  }))
);

const barAreaH = computed(() =>
  props.items.length * (ROW_H + GAP) - GAP
);
</script>

<template>
  <figure class="ieac-figure">
    <figcaption v-if="title" class="ieac-title">
      {{ title }}<span v-if="domain" class="ieac-domain"> — {{ domain }}</span>
    </figcaption>

    <!-- Legend -->
    <div class="ieac-legend">
      <span class="leg-item"><span class="leg-dot" style="background:#16a34a"></span>Über Erwartung (&gt;+{{ 7 }} PP)</span>
      <span class="leg-item"><span class="leg-dot" style="background:#64748b"></span>Im Erwartungsbereich</span>
      <span class="leg-item"><span class="leg-dot" style="background:#dc2626"></span>Unter Erwartung (&lt;−{{ 7 }} PP)</span>
      <span class="leg-item"><span class="leg-line"></span>Erwartungswert (Rasch)</span>
    </div>

    <div class="ieac-scroll">
      <svg :width="SVG_W" :height="svgHeight" :viewBox="`0 0 ${SVG_W} ${svgHeight}`">

        <!-- ── Tick lines ───────────────────────────────────────────────── -->
        <g>
          <g v-for="t in TICKS" :key="t">
            <line :x1="cx(t)" :y1="PAD_TOP - 10"
                  :x2="cx(t)" :y2="PAD_TOP + barAreaH"
                  stroke="#e2e8f0" stroke-width="1" />
            <text :x="cx(t)" :y="PAD_TOP - 13" text-anchor="middle"
                  font-size="9.5" fill="#94a3b8" font-family="system-ui,sans-serif">
              {{ t }}%
            </text>
          </g>
        </g>

        <!-- ── Rows ─────────────────────────────────────────────────────── -->
        <g v-for="(it, i) in itemsWithGap" :key="i">
          <!-- Item label -->
          <text :x="LABEL_W - 4" :y="rowY(i) + ROW_H / 2"
                text-anchor="end" dominant-baseline="middle"
                font-size="10.5" fill="#374151" font-family="ui-monospace,monospace">
            {{ it.label }}
          </text>

          <!-- Competence level badge -->
          <rect :x="LABEL_W" :y="rowY(i) + (ROW_H - 14) / 2"
                width="22" height="14" rx="3"
                :fill="it.levelColor" />
          <text :x="LABEL_W + 11" :y="rowY(i) + ROW_H / 2"
                text-anchor="middle" dominant-baseline="middle"
                font-size="8.5" font-weight="700" fill="white"
                font-family="system-ui,sans-serif">
            {{ it.level }}
          </text>

          <!-- Row background -->
          <rect :x="chartX" :y="rowY(i)" :width="CHART_W" :height="ROW_H"
                fill="#f8fafc" rx="2" />

          <!-- Actual bar -->
          <rect :x="chartX" :y="rowY(i) + 4"
                :width="(it.actual / 100) * CHART_W" :height="ROW_H - 8"
                :fill="it.color" rx="2" opacity="0.85" />

          <!-- Expected vertical line -->
          <line :x1="cx(it.expected)" :y1="rowY(i) + 1"
                :x2="cx(it.expected)" :y2="rowY(i) + ROW_H - 1"
                stroke="#0f172a" stroke-width="2" stroke-dasharray="3,2" />

          <!-- Gap highlight zone (between actual and expected) -->
          <rect v-if="Math.abs(it.delta) > 7"
                :x="Math.min(cx(it.actual), cx(it.expected))"
                :y="rowY(i) + 4"
                :width="Math.abs(it.actual - it.expected) / 100 * CHART_W"
                :height="ROW_H - 8"
                :fill="it.color" rx="0" opacity="0.15" />

          <!-- Annotations right -->
          <text :x="chartX + CHART_W + 5" :y="rowY(i) + ROW_H / 2 - 4"
                dominant-baseline="middle" font-size="9" fill="#374151" font-weight="600"
                font-family="system-ui,sans-serif">
            {{ Math.round(it.actual) }}%
          </text>
          <text :x="chartX + CHART_W + 5" :y="rowY(i) + ROW_H / 2 + 6"
                dominant-baseline="middle" font-size="8.5" fill="#94a3b8"
                font-family="system-ui,sans-serif">
            erw. {{ Math.round(it.expected) }}%
          </text>
        </g>

        <!-- ── X-axis label ─────────────────────────────────────────────── -->
        <text :x="chartX + CHART_W / 2" :y="svgHeight - 6"
              text-anchor="middle" font-size="9.5" fill="#64748b"
              font-family="system-ui,sans-serif">
          Lösungsquote (%)
        </text>

      </svg>
    </div>
  </figure>
</template>

<style scoped>
.ieac-figure { margin: 0; }
.ieac-title {
  font-size: 1.05rem; font-weight: 600; color: #111827; margin-bottom: 8px;
}
.ieac-domain { font-weight: 400; color: #64748b; font-size: 0.9rem; }

.ieac-legend {
  display: flex; flex-wrap: wrap; gap: 4px 16px;
  font-size: 0.75rem; color: #475569; margin-bottom: 10px;
}
.leg-item { display: flex; align-items: center; gap: 5px; }
.leg-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.leg-line {
  width: 16px; height: 2px; background: #0f172a;
  border-top: 2px dashed #0f172a; flex-shrink: 0;
}

.ieac-scroll { overflow-x: auto; }
.ieac-scroll svg { display: block; }
</style>
