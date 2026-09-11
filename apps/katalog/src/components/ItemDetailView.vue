<script setup>
import { computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
  item:       { type: Object, required: true },
  groupLabel: { type: String, default: 'Klasse' },
});

const FIRST = [
  'Anna','Ben','Clara','David','Emma','Felix','Greta','Hannah','Ida','Jonas',
  'Katharina','Lukas','Marie','Niklas','Olivia','Paul','Romy','Sara','Tim','Vera',
  'Willi','Xenia','Yannik','Zoe',
];
const LAST = [
  'Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker',
  'Schulz','Hoffmann','Schäfer','Koch','Bauer','Richter','Klein','Wolf',
  'Schröder','Neumann','Schwarz','Zimmermann',
];

// Deterministic LCG seeded by iqbId so the list stays stable
const seededRand = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223 >>> 0;
    return s / 0x100000000;
  };
};

const students = computed(() => {
  const seed = (props.item.iqbId ?? props.item.exercise ?? 'x')
    .split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRand(seed);

  const count = 20 + Math.floor(rand() * 6);
  const solvePct = (props.item.classP ?? 50) / 100;

  return Array.from({ length: count }, (_, i) => {
    const first  = FIRST[Math.floor(rand() * FIRST.length)];
    const last   = LAST[Math.floor(rand() * LAST.length)];
    const solved = rand() < solvePct;
    const score  = solved
      ? Math.round(60 + rand() * 40)
      : Math.round(rand() * 40);
    return { id: i, name: `${first} ${last}`, solved, score };
  });
});

const solvedCount = computed(() => students.value.filter(s => s.solved).length);

const LEVEL_COLORS = {
  'I':'#ef4444','II':'#f97316','III':'#eab308','IV':'#22c55e','V':'#15803d',
  '1':'#ef4444','2':'#f97316','3':'#eab308','4':'#22c55e','5':'#15803d',
};
const levelColor = (l) => LEVEL_COLORS[l] ?? '#94a3b8';

const DOMAIN_LABELS = {
  ho:'Hörverstehen', le:'Leseverstehen', sr:'Sprachgebrauch',
  ma:'Mathematik',   en:'Englisch',      fr:'Französisch',
};
const domainLabel = (d) => DOMAIN_LABELS[d] ?? (d?.toUpperCase() ?? '–');
</script>

<template>
  <div class="idv-wrap">
    <!-- Item summary header -->
    <div class="idv-header">
      <div class="idv-ex-row">
        <span class="idv-ex-id">{{ item.exercise }}</span>
        <span v-if="item.title" class="idv-ex-title">{{ item.title }}</span>
      </div>

      <div class="idv-tags">
        <span class="dom-chip">{{ domainLabel(item.domain) }}</span>
        <span
          v-if="item.competenceLevel"
          class="level-badge"
          :style="{ background: levelColor(item.competenceLevel) }"
        >Stufe {{ item.competenceLevel }}</span>
      </div>

      <div class="idv-stats">
        <div class="stat-item">
          <span class="stat-label">{{ groupLabel }}</span>
          <span class="stat-val">{{ item.classP != null ? item.classP.toFixed(0) + ' %' : '–' }}</span>
        </div>
        <div v-if="item.schoolP != null" class="stat-item">
          <span class="stat-label">Schule</span>
          <span class="stat-val">{{ item.schoolP.toFixed(0) }} %</span>
        </div>
        <div v-if="item.stateP != null" class="stat-item">
          <span class="stat-label">Bundesland</span>
          <span class="stat-val">{{ item.stateP.toFixed(0) }} %</span>
        </div>
      </div>
    </div>

    <!-- Section title -->
    <div class="idv-section-title">
      Schülerinnen und Schüler
      <span class="solved-badge">{{ solvedCount }}/{{ students.length }} gelöst</span>
    </div>

    <!-- Per-student table -->
    <DataTable
      :value="students"
      size="small"
      class="idv-table"
      scroll-height="calc(100vh - 300px)"
      scrollable
      sort-mode="single"
    >
      <Column field="name"   header="Name"    :sortable="true" />
      <Column field="solved" header="Gelöst"  :sortable="true" style="width:76px;text-align:center">
        <template #body="{ data }">
          <i
            :class="data.solved ? 'pi pi-check' : 'pi pi-times'"
            :style="{ color: data.solved ? '#22c55e' : '#ef4444', fontWeight: 700 }"
          />
        </template>
      </Column>
      <Column field="score"  header="Punkte"  :sortable="true" style="width:78px;text-align:right">
        <template #body="{ data }">
          <span class="score-val">{{ data.score }} %</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.idv-wrap { display: flex; flex-direction: column; gap: 16px; }

.idv-header {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;
}

.idv-ex-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.idv-ex-id {
  font-family: ui-monospace, monospace; font-size: 0.9rem; font-weight: 700;
  color: #1e3a5f; background: #eff6ff; padding: 2px 8px; border-radius: 4px;
}
.idv-ex-title { color: #475569; font-size: 0.85rem; }

.idv-tags { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dom-chip {
  font-size: 0.74rem; color: #0369a1; background: #e0f2fe;
  padding: 2px 8px; border-radius: 10px; white-space: nowrap;
}
.level-badge {
  font-size: 0.72rem; font-weight: 700; color: #fff;
  padding: 2px 8px; border-radius: 4px;
}

.idv-stats { display: flex; gap: 20px; flex-wrap: wrap; }
.stat-item { display: flex; flex-direction: column; gap: 1px; }
.stat-label {
  font-size: 0.68rem; color: #94a3b8; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.stat-val { font-size: 1rem; font-weight: 700; color: #1e293b; font-variant-numeric: tabular-nums; }

.idv-section-title {
  font-size: 0.78rem; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.05em;
  display: flex; align-items: center; gap: 10px;
}
.solved-badge {
  font-size: 0.75rem; font-weight: 600; color: #0369a1; background: #e0f2fe;
  padding: 2px 8px; border-radius: 10px; text-transform: none; letter-spacing: 0;
}

.idv-table { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.score-val { font-variant-numeric: tabular-nums; font-size: 0.8rem; color: #475569; display: block; text-align: right; }
</style>
