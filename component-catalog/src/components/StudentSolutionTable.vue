<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  rows: { type: Array, required: true },
  domains: {
    type: Array,
    default: () => [
      { key: 'total',     label: 'Insgesamt' },
      { key: 'reading',   label: 'Lesen' },
      { key: 'listening', label: 'Hören' },
    ],
  },
});

// ── Sort ─────────────────────────────────────────────────────────────────────
const sortKey = ref(props.domains[0]?.key ?? 'total');
const sortDir = ref('desc'); // 'desc' = hoch→tief (default)

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc';
  } else {
    sortKey.value = key;
    sortDir.value = 'desc';
  }
};

const sortedRows = computed(() => {
  return [...props.rows].sort((a, b) => {
    if (a.absent && !b.absent) return 1;
    if (!a.absent && b.absent) return -1;
    if (a.absent && b.absent) return 0;
    const aVal = a.domains?.[sortKey.value]?.pctCorrect ?? 0;
    const bVal = b.domains?.[sortKey.value]?.pctCorrect ?? 0;
    return sortDir.value === 'desc' ? bVal - aVal : aVal - bVal;
  });
});

// ── Bar helpers ───────────────────────────────────────────────────────────────
const BAR_W = 160;
const BAR_H = 10;

// Colors: accessible — no red/green
const C_CORRECT  = '#3b82f6'; // blue
const C_OMITTED  = '#cbd5e1'; // slate-200
const C_WRONG    = '#f97316'; // orange

const segmentsFor = (d) => {
  if (!d) return [];
  const segs = [];
  let x = 0;
  const add = (pct, color) => {
    if (pct > 0) {
      segs.push({ x, w: (pct / 100) * BAR_W, color, pct });
      x += (pct / 100) * BAR_W;
    }
  };
  add(d.pctCorrect  ?? 0, C_CORRECT);
  add(d.pctOmitted  ?? 0, C_OMITTED);
  add(d.pctIncorrect ?? 0, C_WRONG);
  return segs;
};

const labelX = (seg) => seg.x + seg.w / 2;
</script>

<template>
  <div class="sst-wrap">
    <!-- Legend -->
    <div class="sst-legend">
      <span class="leg-item"><span class="leg-dot" :style="{ background: '#3b82f6' }" />Richtig</span>
      <span class="leg-item"><span class="leg-dot" :style="{ background: '#cbd5e1' }" />Ausgelassen</span>
      <span class="leg-item"><span class="leg-dot" :style="{ background: '#f97316' }" />Falsch</span>
    </div>

    <!-- Table -->
    <div class="sst-scroll">
      <table class="sst-table">
        <thead>
          <tr>
            <th class="th-student">Schüler:in</th>
            <th
              v-for="d in domains"
              :key="d.key"
              class="th-domain"
              @click="toggleSort(d.key)"
            >
              <div class="th-inner">
                {{ d.label }}
                <span class="sort-caret">
                  <i class="pi pi-caret-up"  :class="{ 'sort-active': sortKey === d.key && sortDir === 'asc'  }" />
                  <i class="pi pi-caret-down" :class="{ 'sort-active': sortKey === d.key && sortDir === 'desc' }" />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in sortedRows" :key="row.id" class="sst-row">
            <!-- Student cell -->
            <td class="td-student">
              <div class="name-row">
                <span class="student-name">{{ row.name }}</span>
                <span class="gender-sym" :title="row.gender === 'f' ? 'weiblich' : row.gender === 'm' ? 'männlich' : 'divers'">
                  {{ row.gender === 'f' ? '♀' : row.gender === 'm' ? '♂' : '⚧' }}
                </span>
                <a
                  v-if="row.solutionUrl"
                  :href="row.solutionUrl"
                  target="_blank"
                  rel="noopener"
                  class="solution-link"
                  title="SuS-Lösungen öffnen"
                  @click.stop
                >
                  <i class="pi pi-external-link" />
                </a>
              </div>
              <a
                v-if="row.testBooklet"
                :href="row.testBooklet.url"
                target="_blank"
                rel="noopener"
                class="booklet-link"
                @click.stop
              >
                <i class="pi pi-book" />
                {{ row.testBooklet.label }}
              </a>
            </td>

            <!-- Absent: span all domain columns -->
            <template v-if="row.absent">
              <td :colspan="domains.length" class="td-absent">
                <span class="absent-msg">
                  {{ row.absentMessage ?? 'Schüler:in war am Testtag abwesend.' }}
                </span>
              </td>
            </template>

            <!-- Domain bars -->
            <template v-else>
              <td v-for="d in domains" :key="d.key" class="td-domain">
                <div v-if="row.domains?.[d.key]" class="bar-cell">
                  <svg
                    :width="BAR_W"
                    :height="BAR_H + 15"
                    :viewBox="`0 0 ${BAR_W} ${BAR_H + 15}`"
                    class="bar-svg"
                  >
                    <!-- Background track -->
                    <rect x="0" y="0" :width="BAR_W" :height="BAR_H" rx="3" fill="#f1f5f9" />
                    <!-- Colored segments -->
                    <rect
                      v-for="(seg, si) in segmentsFor(row.domains[d.key])"
                      :key="si"
                      :x="seg.x" y="0"
                      :width="seg.w" :height="BAR_H"
                      rx="3"
                      :fill="seg.color"
                    />
                    <!-- Percentage labels below -->
                    <text
                      v-for="(seg, si) in segmentsFor(row.domains[d.key])"
                      :key="`t${si}`"
                      :x="labelX(seg)"
                      :y="BAR_H + 12"
                      text-anchor="middle"
                      font-size="8"
                      fill="#64748b"
                      font-family="system-ui, sans-serif"
                    >{{ Math.round(seg.pct) }}%</text>
                  </svg>
                </div>
                <span v-else class="no-data">–</span>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.sst-wrap { display: flex; flex-direction: column; gap: 12px; }

/* Legend */
.sst-legend { display: flex; gap: 16px; align-items: center; }
.leg-item { display: flex; align-items: center; gap: 5px; font-size: 0.75rem; color: #64748b; }
.leg-dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }

/* Scroll wrapper for wide tables */
.sst-scroll { overflow-x: auto; }

/* Table */
.sst-table {
  width: 100%; border-collapse: collapse;
  border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;
  font-size: 0.83rem; min-width: 500px;
}

thead { background: #f8fafc; }

th {
  padding: 10px 14px; text-align: left;
  font-size: 0.72rem; font-weight: 700; color: #475569;
  text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}
.th-domain { cursor: pointer; user-select: none; }
.th-domain:hover { background: #f1f5f9; }

.th-inner { display: flex; align-items: center; gap: 6px; }
.sort-caret { display: flex; flex-direction: column; gap: 0; }
.sort-caret .pi { font-size: 0.55rem; color: #cbd5e1; line-height: 1; }
.sort-caret .sort-active { color: #3b82f6; }

/* Rows */
.sst-row { border-bottom: 1px solid #f1f5f9; transition: background 0.1s; }
.sst-row:last-child { border-bottom: none; }
.sst-row:nth-child(even) { background: #fafafa; }
.sst-row:hover { background: #f0f9ff; }

td { padding: 10px 14px; vertical-align: middle; }

/* Student cell */
.td-student { min-width: 190px; }
.name-row { display: flex; align-items: center; gap: 5px; margin-bottom: 3px; }
.student-name { font-weight: 600; color: #1e293b; }
.gender-sym { font-size: 0.75rem; color: #94a3b8; }

.solution-link { color: #cbd5e1; font-size: 0.65rem; transition: color 0.15s; line-height: 1; }
.solution-link:hover { color: #3b82f6; }

.booklet-link {
  font-size: 0.75rem; color: #0369a1; text-decoration: none;
  display: inline-flex; align-items: center; gap: 4px;
}
.booklet-link:hover { text-decoration: underline; }
.booklet-link .pi { font-size: 0.65rem; }

/* Absent */
.td-absent { text-align: center; }
.absent-msg { font-size: 0.78rem; color: #94a3b8; font-style: italic; }

/* Domain cells */
.td-domain { min-width: 200px; }
.bar-cell { display: inline-flex; align-items: center; }
.bar-svg { display: block; overflow: visible; }
.no-data { color: #cbd5e1; font-size: 0.8rem; }
</style>
