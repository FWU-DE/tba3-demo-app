<script setup>
import { computed, ref } from 'vue';
import StudentTooltip from './StudentTooltip.vue';

const props = defineProps({
  students: { type: Array, required: true },
  title:      { type: String, default: null },
  subject:    { type: String, default: '' },
  groupClass: { type: String, default: '' },
  scoreMax:   { type: Number, default: 565 },
  zones: {
    type: Array,
    default: () => [
      { id: 'KS I',   label: 'KS I',   from: 0,   to: 430, color: null      },
      { id: 'KS II',  label: 'KS II',  from: 430, to: 500, color: '#6abc6a' },
      { id: 'KS III', label: 'KS III', from: 500, to: 565, color: '#5ab6b0' },
    ],
  },
});

// ── SVG layout ─────────────────────────────────────────────────────────────────
const CHART_L  = 50;
const CHART_R  = 880;
const CHART_W  = CHART_R - CHART_L; // 830
const CHART_T  = 72;
const CHART_H  = 162;
const CHART_B  = CHART_T + CHART_H; // 234
const AVATAR_R = 21;

function scoreToX(score) {
  return CHART_L + (Math.max(0, Math.min(score, props.scoreMax)) / props.scoreMax) * CHART_W;
}

function fracToY(frac) {
  const safe = CHART_H - AVATAR_R * 2;
  return CHART_T + AVATAR_R + (frac ?? 0.5) * safe;
}

// ── Zones ──────────────────────────────────────────────────────────────────────
const zoneRects = computed(() =>
  props.zones.map((z) => {
    const x     = scoreToX(z.from);
    const right = scoreToX(Math.min(z.to, props.scoreMax));
    return { ...z, x, width: right - x, labelX: (x + right) / 2 };
  })
);

// ── Student enrichment ─────────────────────────────────────────────────────────
const COMPETENCY = {
  'KS I':   { level: 'Unter Mindeststandard', desc: 'Grundlegende Kompetenzen noch nicht gesichert.' },
  'KS II':  { level: 'Mindeststandard',        desc: 'Grundlegende Kompetenzen vorhanden.'            },
  'KS III': { level: 'Über Mindeststandard',   desc: 'Regelstandard oder Optimalstandard erreicht.'   },
};

function getZone(score) {
  for (const z of props.zones) {
    if (score < z.to) return z.id;
  }
  return props.zones[props.zones.length - 1].id;
}

const enrichedStudents = computed(() =>
  props.students.map((s) => {
    const zone = getZone(s.bistaScore);
    const comp = COMPETENCY[zone] ?? {};
    return {
      ...s,
      zone,
      competencyLevel: comp.level ?? '',
      competencyDesc:  comp.desc  ?? '',
      svgX: scoreToX(s.bistaScore),
      svgY: fracToY(s.yFrac),
    };
  })
);

// ── X-axis ticks ───────────────────────────────────────────────────────────────
const xTicks = computed(() => {
  const base = [0, 100, 200, 300, 400, 500];
  return [...new Set([...base, props.scoreMax])].map((v) => ({ v, x: scoreToX(v) }));
});

// ── Chart title ────────────────────────────────────────────────────────────────
const chartTitle = computed(() =>
  props.title ??
  `Verteilung der Kompetenzen in ${props.subject} in der Klasse ${props.groupClass}`
);
const subtitle = computed(() => `(${props.students.length} SuS)`);

// ── Hover / tooltip ────────────────────────────────────────────────────────────
const wrapperRef     = ref(null);
const hoveredStudent = ref(null);
const tooltipPos     = ref({ x: 0, y: 0 });

function onStudentEnter(student, event) {
  hoveredStudent.value = student;
  // Position tooltip centered above the avatar using SVG→CSS coordinate transform
  const svgEl  = event.currentTarget.closest('svg');
  const pt     = svgEl.createSVGPoint();
  pt.x = student.svgX;
  pt.y = student.svgY - AVATAR_R - 4;
  const screen   = pt.matrixTransform(svgEl.getScreenCTM());
  const wrapRect = wrapperRef.value.getBoundingClientRect();
  tooltipPos.value = { x: screen.x - wrapRect.left, y: screen.y - wrapRect.top };
}

function onStudentLeave() {
  hoveredStudent.value = null;
}
</script>

<template>
  <div ref="wrapperRef" class="bdc-wrap">
    <svg viewBox="0 0 930 288" class="bdc-svg" :aria-label="chartTitle">
      <defs>
        <!-- KS I zone: orange-red → warm golden -->
        <linearGradient id="bdc-ks1" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stop-color="#c85535" />
          <stop offset="100%" stop-color="#c09828" />
        </linearGradient>
      </defs>

      <!-- Title & subtitle -->
      <text x="465" y="20" text-anchor="middle" font-size="15" font-weight="700" fill="#1e293b">{{ chartTitle }}</text>
      <text x="465" y="40" text-anchor="middle" font-size="11" fill="#64748b">{{ subtitle }}</text>

      <!-- Zone labels -->
      <text
        v-for="z in zoneRects" :key="z.id + '-lbl'"
        :x="z.labelX" y="62"
        text-anchor="middle" font-size="11" font-weight="600" fill="#475569"
      >{{ z.label }}</text>

      <!-- Zone backgrounds -->
      <rect
        v-for="z in zoneRects" :key="z.id + '-bg'"
        :x="z.x" :y="CHART_T" :width="z.width" :height="CHART_H"
        :fill="z.color ?? 'url(#bdc-ks1)'"
      />

      <!-- Zone divider lines -->
      <line
        v-for="z in zoneRects.slice(1)" :key="z.id + '-div'"
        :x1="z.x" :x2="z.x" :y1="CHART_T" :y2="CHART_B"
        stroke="rgba(255,255,255,0.45)" stroke-width="1.5"
      />

      <!-- Student avatars -->
      <g
        v-for="s in enrichedStudents" :key="s.id"
        class="bdc-avatar"
        :transform="`translate(${s.svgX},${s.svgY})`"
        @mouseenter="onStudentEnter(s, $event)"
        @mouseleave="onStudentLeave"
      >
        <circle :r="AVATAR_R" fill="white" :stroke="s.ringColor" stroke-width="3.5" />
        <text
          dy="0.35em"
          :font-size="AVATAR_R * 1.25"
          text-anchor="middle"
          dominant-baseline="central"
          style="user-select:none;pointer-events:none"
        >{{ s.emoji }}</text>
        <!-- transparent hit circle to ensure full-disk hover area -->
        <circle :r="AVATAR_R" fill="transparent" />
      </g>

      <!-- X-axis line -->
      <line :x1="CHART_L" :y1="CHART_B" :x2="CHART_R" :y2="CHART_B" stroke="#94a3b8" stroke-width="1" />

      <!-- X-axis ticks + labels -->
      <g v-for="t in xTicks" :key="t.v">
        <line :x1="t.x" :y1="CHART_B" :x2="t.x" :y2="CHART_B + 5" stroke="#94a3b8" stroke-width="1" />
        <text :x="t.x" :y="CHART_B + 16" text-anchor="middle" font-size="10" fill="#64748b">{{ t.v }}</text>
      </g>

      <!-- X-axis title -->
      <text x="465" y="275" text-anchor="middle" font-size="11" fill="#64748b">BISTA Werte</text>
    </svg>

    <!-- Floating tooltip (StudentTooltip component) -->
    <StudentTooltip
      v-if="hoveredStudent"
      :student="hoveredStudent"
      class="bdc-tt"
      :style="{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }"
    />
  </div>
</template>

<style scoped>
.bdc-wrap {
  position: relative;
  display: block;
}

.bdc-svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

.bdc-avatar {
  cursor: pointer;
  transition: filter 0.15s ease;
}

.bdc-avatar:hover {
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.32)) brightness(1.07);
}

.bdc-tt {
  position: absolute;
  transform: translate(-50%, calc(-100% - 8px));
  pointer-events: none;
  z-index: 20;
  animation: bdc-pop 0.12s ease both;
}

@keyframes bdc-pop {
  from { opacity: 0; transform: translate(-50%, calc(-100% - 2px)); }
  to   { opacity: 1; transform: translate(-50%, calc(-100% - 8px)); }
}
</style>
