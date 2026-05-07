<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * rows: Array of { label: string, levels: Array<{ nameShort, pct, color }> }
   * Each row is one entity (class / school / state).
   * pct values should sum to ~100.
   */
  rows: { type: Array, required: true },
  title: { type: String, default: '' },
  domain: { type: String, default: '' },
});

const LABEL_W = 160;
const BAR_W = 560;
const BAR_H = 28;
const GAP = 12;
const PAD_TOP = 28;
const PAD_BOTTOM = 40;
const PAD_RIGHT = 16;
const SVG_W = LABEL_W + BAR_W + PAD_RIGHT;

const svgHeight = computed(() =>
  PAD_TOP + props.rows.length * (BAR_H + GAP) - GAP + PAD_BOTTOM
);

const barY = (i) => PAD_TOP + i * (BAR_H + GAP);

// Draw segments for one row
const segments = (levels) => {
  const segs = [];
  let x = 0;
  for (const lvl of levels) {
    if (lvl.pct < 0.1) { x += 0; continue; }
    const w = (lvl.pct / 100) * BAR_W;
    segs.push({ x, w, ...lvl });
    x += w;
  }
  return segs;
};

const tickPcts = [0, 25, 50, 75, 100];
const xPx = (pct) => LABEL_W + (pct / 100) * BAR_W;

const legendY = computed(() =>
  PAD_TOP + props.rows.length * (BAR_H + GAP) - GAP + 10
);
</script>

<template>
  <figure class="clb-figure">
    <figcaption v-if="title" class="clb-title">{{ title }}<span v-if="domain" class="clb-domain"> — {{ domain }}</span></figcaption>
    <div class="clb-scroll">
      <svg :width="SVG_W" :height="svgHeight" :viewBox="`0 0 ${SVG_W} ${svgHeight}`">

        <!-- ── Tick lines + labels ──────────────────────────────────────── -->
        <g>
          <g v-for="t in tickPcts" :key="t">
            <line :x1="xPx(t)" :y1="PAD_TOP - 8"
                  :x2="xPx(t)" :y2="PAD_TOP + rows.length * (BAR_H + GAP) - GAP"
                  stroke="#e2e8f0" stroke-width="1" />
            <text :x="xPx(t)" :y="PAD_TOP - 11" text-anchor="middle"
                  font-size="10" fill="#94a3b8" font-family="system-ui,sans-serif">{{ t }}%</text>
          </g>
        </g>

        <!-- ── Bars ───────────────────────────────────────────────────────── -->
        <g v-for="(row, i) in rows" :key="i">
          <!-- Row label -->
          <text :x="LABEL_W - 8" :y="barY(i) + BAR_H / 2"
                text-anchor="end" dominant-baseline="middle"
                font-size="12" fill="#374151" font-family="system-ui,sans-serif">
            {{ row.label }}
          </text>

          <!-- Segments -->
          <g v-for="seg in segments(row.levels)" :key="seg.nameShort">
            <rect :x="LABEL_W + seg.x" :y="barY(i)"
                  :width="seg.w" :height="BAR_H"
                  :fill="seg.color" rx="0" />
            <!-- Label inside segment if wide enough (>24px) -->
            <text v-if="seg.w > 24"
                  :x="LABEL_W + seg.x + seg.w / 2" :y="barY(i) + BAR_H / 2"
                  text-anchor="middle" dominant-baseline="middle"
                  font-size="10" fill="rgba(255,255,255,0.92)" font-weight="600"
                  font-family="system-ui,sans-serif">
              {{ seg.nameShort }}
            </text>
          </g>

          <!-- % annotations to the right -->
          <text :x="LABEL_W + BAR_W + 5" :y="barY(i) + BAR_H / 2"
                dominant-baseline="middle" font-size="10" fill="#64748b"
                font-family="system-ui,sans-serif">
            n={{ row.total ?? '?' }}
          </text>
        </g>

        <!-- ── Legend ─────────────────────────────────────────────────────── -->
        <g :transform="`translate(${LABEL_W}, ${legendY})`">
          <g v-for="(lvl, i) in (rows[0]?.levels ?? [])" :key="lvl.nameShort"
             :transform="`translate(${i * 90}, 0)`">
            <rect x="0" y="0" width="12" height="12" :fill="lvl.color" rx="2" />
            <text x="15" y="10" font-size="10" fill="#475569"
                  font-family="system-ui,sans-serif">
              Stufe {{ lvl.nameShort }}
            </text>
          </g>
        </g>

      </svg>
    </div>
  </figure>
</template>

<style scoped>
.clb-figure { margin: 0; }
.clb-title {
  font-size: 1.05rem; font-weight: 600; color: #111827; margin-bottom: 12px;
}
.clb-domain { font-weight: 400; color: #64748b; font-size: 0.9rem; }
.clb-scroll { overflow-x: auto; }
.clb-scroll svg { display: block; }
</style>
