<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  /**
   * title: Optional title above the chart (e.g. "Sprechen und Zuhören").
   */
  title: { type: String, default: '' },

  /**
   * unavailable: Optional badge text shown next to the title
   * (e.g. "Durchgang 2023/24 nicht verfügbar"). Falsy = no badge.
   */
  unavailable: { type: String, default: '' },

  /**
   * levels: Ordered array of competence level identifiers as shown on the
   * x-axis (e.g. ["I", "II", "III", "IV", "V"] or ["Ia", "Ib", "II", "III", "IV", "V"]).
   */
  levels: { type: Array, required: true },

  /**
   * school: { belowMin: number, upperLevels: number }
   * Aggregated percentages for the focus group (used in summary cards).
   */
  school: { type: Object, required: true },

  /**
   * comparisons: All comparisons known to the chart (active + inactive).
   * Shape: [{
   *   id: string,
   *   label: string,
   *   deltas: { [level]: number },  // signed percentage points
   *   belowMin: number,
   *   upperLevels: number,
   *   disabled?: boolean,           // shown in panel, but uncheckable
   * }]
   */
  comparisons: { type: Array, required: true },

  /**
   * activeIds: IDs of currently active comparisons (from `comparisons`).
   */
  activeIds: { type: Array, default: () => [] },

  /**
   * groupedBy: Optional sub-grouping label (e.g. peer-class IDs "8.1, 8.2…").
   * Currently informational only.
   */
  legendNote: { type: String, default: '' },
});

const emit = defineEmits(['update:activeIds']);

// ── Layout constants ────────────────────────────────────────────────────────
const PAD_LEFT = 56;
const PAD_RIGHT = 60;
const PAD_TOP = 36;
const PAD_BOTTOM = 36;
const CHART_W = 640;
const CHART_H = 280;
const SVG_W = PAD_LEFT + CHART_W + PAD_RIGHT;
const SVG_H = PAD_TOP + CHART_H + PAD_BOTTOM;

// ── Active comparisons ──────────────────────────────────────────────────────
const activeComparisons = computed(() =>
  props.comparisons.filter((c) => props.activeIds.includes(c.id) && !c.disabled),
);

const COLORS = ['#3b82f6', '#16a34a', '#f59e0b', '#8b5cf6', '#f43f5e', '#0ea5e9'];
const colorFor = (id) => {
  const idx = props.comparisons
    .filter((c) => !c.disabled)
    .findIndex((c) => c.id === id);
  return COLORS[idx % COLORS.length] ?? '#6b7280';
};

// ── Bar fill: green positive / light-red mild / dark-red strong ────────────
const barFill = (v) => {
  if (v >= 0) return '#15803d';
  if (v >= -4) return '#fca5a5';
  return '#b91c1c';
};

// ── Y axis: dynamic range based on data ─────────────────────────────────────
const allValues = computed(() =>
  activeComparisons.value.flatMap((c) =>
    props.levels.map((l) => c.deltas?.[l] ?? 0),
  ),
);

const yRange = computed(() => {
  const min = Math.min(-10, ...allValues.value);
  const max = Math.max(10, ...allValues.value);
  const lo = Math.floor(min / 10) * 10 - 5;
  const hi = Math.ceil(max / 10) * 10 + 5;
  return { lo, hi };
});

const yTicks = computed(() => {
  const ticks = [];
  const step = 10;
  for (let v = Math.ceil(yRange.value.lo / step) * step; v <= yRange.value.hi; v += step) {
    ticks.push(v);
  }
  return ticks;
});

const yToPx = (v) => {
  const { lo, hi } = yRange.value;
  return PAD_TOP + CHART_H - ((v - lo) / (hi - lo)) * CHART_H;
};
const zeroY = computed(() => yToPx(0));

// ── X axis: group per level, sub-bars per active comparison ────────────────
const groupWidth = computed(() => CHART_W / props.levels.length);
const groupX = (i) => PAD_LEFT + i * groupWidth.value;

const barWidth = computed(() => {
  const n = Math.max(activeComparisons.value.length, 1);
  const usable = groupWidth.value * 0.7;
  return Math.min(usable / n, 28);
});

const barX = (levelIdx, cmpIdx) => {
  const n = activeComparisons.value.length;
  const totalW = barWidth.value * n + 4 * (n - 1);
  const startX = groupX(levelIdx) + (groupWidth.value - totalW) / 2;
  return startX + cmpIdx * (barWidth.value + 4);
};

// ── Comparison panel toggle ────────────────────────────────────────────────
const panelOpen = ref(false);
const togglePanel = () => { panelOpen.value = !panelOpen.value; };
const closePanel = () => { panelOpen.value = false; };

const toggleComparison = (id) => {
  const cmp = props.comparisons.find((c) => c.id === id);
  if (!cmp || cmp.disabled) return;
  const next = props.activeIds.includes(id)
    ? props.activeIds.filter((x) => x !== id)
    : [...props.activeIds, id];
  emit('update:activeIds', next);
};

// ── Value formatting ────────────────────────────────────────────────────────
const signedPp = (v) => (v == null ? '' : v >= 0 ? `+${v} Pp.` : `${v} Pp.`);

// ── Trend helpers for the interpretation bullets ───────────────────────────
const trendArrow = (own, ref) => (own > ref ? '↗' : own < ref ? '↘' : '→');
const trendCls = (own, ref) =>
  own > ref ? 'cld-good' : own < ref ? 'cld-warn' : 'cld-neutral';
</script>

<template>
  <figure class="cld-figure">
    <!-- ── Header: title + optional unavailable badge ──────────────────── -->
    <figcaption v-if="title || unavailable" class="cld-header">
      <span v-if="title" class="cld-title">{{ title }}</span>
      <span v-if="unavailable" class="cld-badge">
        <span aria-hidden="true">🕓</span>
        {{ unavailable }}
      </span>
    </figcaption>

    <!-- ── Chart + floating toggle button ──────────────────────────────── -->
    <div class="cld-chart-wrap">
      <div class="cld-scroll">
        <svg :width="SVG_W" :height="SVG_H" :viewBox="`0 0 ${SVG_W} ${SVG_H}`"
             role="img" aria-label="Differenz pro Kompetenzstufe (Pp.)">
          <!-- Y axis ticks + gridlines -->
          <g>
            <line v-for="t in yTicks" :key="`gl-${t}`"
                  :x1="PAD_LEFT" :y1="yToPx(t)"
                  :x2="PAD_LEFT + CHART_W" :y2="yToPx(t)"
                  :stroke="t === 0 ? '#94a3b8' : '#e2e8f0'"
                  :stroke-width="t === 0 ? 1.5 : 1" />
            <text v-for="t in yTicks" :key="`tl-${t}`"
                  :x="PAD_LEFT - 8" :y="yToPx(t) + 4"
                  text-anchor="end" font-size="11" fill="#94a3b8"
                  font-family="system-ui,sans-serif">
              {{ t > 0 ? '+' : '' }}{{ t }} Pp.
            </text>
          </g>

          <!-- Zero baseline label -->
          <text :x="PAD_LEFT + 4" :y="zeroY - 4"
                font-size="10" fill="#64748b"
                font-family="system-ui,sans-serif">
            Schule = Referenz
          </text>

          <!-- Group separators -->
          <g>
            <template v-for="(_, i) in levels" :key="`sep-${i}`">
              <line v-if="i > 0"
                    :x1="groupX(i)" :y1="PAD_TOP"
                    :x2="groupX(i)" :y2="PAD_TOP + CHART_H"
                    stroke="#f1f5f9" stroke-width="1" />
            </template>
          </g>

          <!-- Bars + value labels -->
          <g v-for="(level, li) in levels" :key="`lvl-${level}`">
            <template v-for="(cmp, ci) in activeComparisons" :key="`bar-${level}-${cmp.id}`">
              <g v-if="cmp.deltas?.[level] != null">
                <rect
                  :x="barX(li, ci)"
                  :y="cmp.deltas[level] >= 0 ? yToPx(cmp.deltas[level]) : zeroY"
                  :width="barWidth"
                  :height="Math.abs(yToPx(cmp.deltas[level]) - zeroY)"
                  :fill="barFill(cmp.deltas[level])"
                  rx="2"
                />
                <text
                  :x="barX(li, ci) + barWidth / 2"
                  :y="cmp.deltas[level] >= 0
                    ? yToPx(cmp.deltas[level]) - 4
                    : yToPx(cmp.deltas[level]) + 12"
                  text-anchor="middle" font-size="10" font-weight="600"
                  :fill="cmp.deltas[level] >= 0 ? '#166534' : '#991b1b'"
                  font-family="system-ui,sans-serif"
                >{{ signedPp(cmp.deltas[level]) }}</text>
              </g>
            </template>

            <!-- Level label -->
            <text :x="groupX(li) + groupWidth / 2"
                  :y="PAD_TOP + CHART_H + 18"
                  text-anchor="middle" font-size="12" font-weight="600"
                  fill="#475569" font-family="system-ui,sans-serif">
              {{ level }}
            </text>
          </g>
        </svg>
      </div>

      <!-- Floating toggle button + panel -->
      <div class="cld-panel-anchor">
        <button
          type="button"
          class="cld-toggle-btn"
          :class="{ 'is-open': panelOpen }"
          @click="togglePanel"
          :aria-expanded="panelOpen"
          aria-label="Vergleichsgruppen auswählen"
        >
          <span class="cld-toggle-icon">{{ panelOpen ? '−' : '+' }}</span>
        </button>
        <div v-if="panelOpen" class="cld-panel" @click.stop>
          <p class="cld-panel-title">Vergleich hinzufügen</p>
          <ul class="cld-panel-list">
            <li v-for="cmp in comparisons" :key="cmp.id">
              <label :class="{ 'is-disabled': cmp.disabled }">
                <input
                  type="checkbox"
                  :checked="activeIds.includes(cmp.id)"
                  :disabled="cmp.disabled"
                  @change="toggleComparison(cmp.id)"
                />
                <span class="cld-panel-label">
                  {{ cmp.label }}
                  <em v-if="cmp.disabled" class="cld-panel-hint">demnächst</em>
                </span>
              </label>
            </li>
          </ul>
          <button type="button" class="cld-panel-close" @click="closePanel">Schließen</button>
        </div>
      </div>
    </div>

    <!-- Legend dots -->
    <div v-if="activeComparisons.length" class="cld-legend">
      <span v-for="cmp in activeComparisons" :key="`leg-${cmp.id}`" class="cld-legend-item">
        <span class="cld-dot" :style="{ background: colorFor(cmp.id) }" />
        vs. {{ cmp.label }}
      </span>
    </div>

    <!-- Summary cards (one per active comparison) -->
    <div v-if="activeComparisons.length" class="cld-cards">
      <div
        v-for="cmp in activeComparisons" :key="`card-${cmp.id}`"
        class="cld-card"
        :class="{ 'is-positive': school.upperLevels >= cmp.upperLevels }"
      >
        <div class="cld-card-head">
          <span class="cld-dot" :style="{ background: colorFor(cmp.id) }" />
          <span class="cld-card-title">vs. {{ cmp.label }}</span>
        </div>
        <p class="cld-card-body">
          Obere Stufen
          <strong>{{ school.upperLevels }} %</strong>
          <span class="cld-card-sep">/</span>
          <strong :style="{ color: colorFor(cmp.id) }">{{ cmp.upperLevels }} %</strong>
          <span class="cld-card-sep">·</span>
          Unter Mindeststandard
          <strong>{{ school.belowMin }} %</strong>
          <span class="cld-card-sep">/</span>
          <strong :style="{ color: colorFor(cmp.id) }">{{ cmp.belowMin }} %</strong>
        </p>
      </div>
    </div>

    <!-- Text interpretation -->
    <div v-if="activeComparisons.length" class="cld-text">
      <section
        v-for="cmp in activeComparisons" :key="`txt-${cmp.id}`"
        class="cld-text-block"
      >
        <h3 class="cld-text-h">⇄ Vergleich mit {{ cmp.label }}</h3>
        <ul class="cld-text-list">
          <li :class="trendCls(school.belowMin, cmp.belowMin)">
            <span class="cld-trend">{{ trendArrow(cmp.belowMin, school.belowMin) }}</span>
            In <strong>Schule</strong> liegen
            <strong>{{ school.belowMin }} %</strong> der Teilnehmenden
            <span class="cld-pill">●</span> <strong>unter Mindeststandard</strong>,
            bei <strong>{{ cmp.label }}</strong> sind es
            <strong>{{ cmp.belowMin }} %</strong>.
          </li>
          <li :class="trendCls(school.upperLevels, cmp.upperLevels)">
            <span class="cld-trend">{{ trendArrow(school.upperLevels, cmp.upperLevels) }}</span>
            In <strong>Schule</strong> erreichen
            <strong>{{ school.upperLevels }} %</strong> der Teilnehmenden die
            <strong>oberen Stufen</strong>, bei <strong>{{ cmp.label }}</strong>
            sind es <strong>{{ cmp.upperLevels }} %</strong>.
          </li>
        </ul>
      </section>
    </div>

    <p v-if="!activeComparisons.length" class="cld-empty">
      Keine Vergleichsgruppe aktiv. Über das <strong>+</strong>-Symbol oben rechts
      lassen sich Landesmittelwert, Vergleichsklassen u. a. einblenden.
    </p>
  </figure>
</template>

<style scoped>
.cld-figure { margin: 0; font-family: system-ui, sans-serif; }

.cld-header {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  margin-bottom: 12px; position: relative;
}
.cld-title {
  font-size: 1.1rem; font-weight: 700; color: #111827;
}
.cld-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.8rem; color: #475569;
  background: #f1f5f9; padding: 4px 10px; border-radius: 999px;
}

.cld-chart-wrap { position: relative; }
.cld-scroll { overflow-x: auto; }
.cld-scroll svg { display: block; }

.cld-panel-anchor {
  position: absolute; top: 6px; right: 6px;
}
.cld-toggle-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: #0f172a; color: #fff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.25);
  transition: transform 0.15s;
}
.cld-toggle-btn:hover { transform: scale(1.05); }
.cld-toggle-btn.is-open { background: #1e293b; }
.cld-toggle-icon { font-size: 1.4rem; line-height: 1; }

.cld-panel {
  position: absolute; right: 0; top: 44px; min-width: 220px;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12); padding: 12px; z-index: 5;
}
.cld-panel-title {
  font-size: 0.8rem; font-weight: 700; color: #475569; margin: 0 0 8px;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.cld-panel-list { list-style: none; padding: 0; margin: 0 0 8px; }
.cld-panel-list li + li { margin-top: 4px; }
.cld-panel-list label {
  display: flex; align-items: center; gap: 8px; font-size: 0.92rem;
  color: #1f2937; cursor: pointer; padding: 4px 2px; border-radius: 6px;
}
.cld-panel-list label:hover { background: #f8fafc; }
.cld-panel-list label.is-disabled { color: #94a3b8; cursor: not-allowed; }
.cld-panel-label { display: inline-flex; align-items: center; gap: 6px; }
.cld-panel-hint {
  font-style: normal; font-size: 0.7rem; color: #94a3b8;
  background: #f1f5f9; padding: 1px 6px; border-radius: 999px;
}
.cld-panel-close {
  margin-top: 2px; background: transparent; border: none; color: #64748b;
  font-size: 0.85rem; cursor: pointer; padding: 4px 0;
}
.cld-panel-close:hover { color: #0f172a; }

.cld-legend {
  display: flex; flex-wrap: wrap; gap: 14px; justify-content: center;
  margin-top: 4px; font-size: 0.85rem; color: #475569;
}
.cld-legend-item { display: inline-flex; align-items: center; gap: 6px; }
.cld-dot {
  display: inline-block; width: 10px; height: 10px; border-radius: 50%;
}

.cld-cards {
  display: flex; flex-wrap: wrap; gap: 12px; margin-top: 14px;
}
.cld-card {
  flex: 1 1 220px; min-width: 220px;
  padding: 12px 14px; border: 1px solid #d1d5db; border-radius: 10px;
  background: #f9fafb;
}
.cld-card.is-positive { border-color: #16a34a; background: #f0fdf4; }
.cld-card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.cld-card-title { font-weight: 600; font-size: 0.92rem; color: #1f2937; }
.cld-card-body {
  margin: 0; font-size: 0.85rem; color: #475569; line-height: 1.5;
}
.cld-card-sep { color: #cbd5e1; margin: 0 4px; }

.cld-text { margin-top: 16px; background: #f8fafc; border-radius: 10px; padding: 14px 16px; }
.cld-text-block + .cld-text-block {
  margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;
}
.cld-text-h {
  font-size: 0.95rem; font-weight: 600; color: #111827; margin: 0 0 6px;
}
.cld-text-list { list-style: none; padding: 0; margin: 0; }
.cld-text-list li {
  font-size: 0.9rem; color: #374151; line-height: 1.55;
  display: flex; gap: 8px; padding: 2px 0;
}
.cld-trend { display: inline-block; min-width: 1em; }
.cld-good .cld-trend { color: #15803d; }
.cld-warn .cld-trend { color: #d97706; }
.cld-neutral .cld-trend { color: #64748b; }
.cld-pill { color: #f97316; font-size: 0.7em; }

.cld-empty {
  margin: 16px 0 0; padding: 12px; background: #f8fafc;
  border: 1px dashed #cbd5e1; border-radius: 8px;
  font-size: 0.9rem; color: #64748b; text-align: center;
}
</style>
