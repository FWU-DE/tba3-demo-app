<script setup>
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Tag from 'primevue/tag';
import Drawer from 'primevue/drawer';
import Button from 'primevue/button';
import ItemDetailView from './ItemDetailView.vue';

const props = defineProps({
  rows: { type: Array, required: true },
  groupLabel: { type: String, default: 'Klasse' },
  schoolLabel: { type: String, default: 'Schule' },
  stateLabel:  { type: String, default: 'Bundesland' },
});

// ── Global text filter ────────────────────────────────────────────────────────
const globalFilter = ref('');

// ── Optional columns toggle ───────────────────────────────────────────────────
const ALL_OPT_COLS = [
  { key: 'competenceType', header: 'Kompetenztyp' },
  { key: 'classP',         header: 'Klasse %' },
  { key: 'schoolP',        header: 'Schule %' },
  { key: 'stateP',         header: 'Bundesland %' },
];
const visibleOptCols = ref([]);

const colVisible = (key) => visibleOptCols.value.some(c => c.key === key);

// ── Inline bar ────────────────────────────────────────────────────────────────
const BAR_W = 160;
const BAR_H = 9;
const BAR_GAP = 3;

const barsFor = (row) => {
  const bars = [{ pct: row.classP, color: '#f97316' }];
  if (colVisible('schoolP')) bars.push({ pct: row.schoolP, color: '#3b82f6' });
  if (colVisible('stateP'))  bars.push({ pct: row.stateP,  color: '#94a3b8' });
  return bars;
};

const svgH = computed(() => {
  const n = 1
    + (colVisible('schoolP') ? 1 : 0)
    + (colVisible('stateP')  ? 1 : 0);
  return BAR_H * n + BAR_GAP * (n - 1) + 2;
});

// ── Level & domain helpers ────────────────────────────────────────────────────
const LEVEL_COLORS = {
  '1': '#ef4444', 'I':   '#ef4444',
  '2': '#f97316', 'II':  '#f97316',
  '3': '#eab308', 'III': '#eab308',
  '4': '#22c55e', 'IV':  '#22c55e',
  '5': '#15803d', 'V':   '#15803d',
};
const levelColor = (l) => LEVEL_COLORS[l] ?? '#94a3b8';

const DOMAIN_LABELS = {
  ho: 'Hörverstehen', le: 'Leseverstehen', sr: 'Sprachgebrauch',
  ma: 'Mathematik',   en: 'Englisch',      fr: 'Französisch',
};
const domainLabel = (d) => DOMAIN_LABELS[d] ?? (d?.toUpperCase() ?? '');

const pctLabel = (v) => v == null ? '–' : `${v.toFixed(0)} %`;

// ── Item detail drawer ────────────────────────────────────────────────────────
const drawerVisible = ref(false);
const selectedItem  = ref(null);

const openDetail = (row) => {
  selectedItem.value = row;
  drawerVisible.value = true;
};
</script>

<template>
  <div class="ist-wrap">
    <!-- ── Toolbar ───────────────────────────────────────────────────────── -->
    <div class="ist-toolbar">
      <div class="ist-search-wrap">
        <i class="pi pi-search ist-search-icon" />
        <InputText
          v-model="globalFilter"
          placeholder="Suchen …"
          class="ist-search-input"
          size="small"
        />
      </div>

      <div class="ist-col-toggle">
        <MultiSelect
          v-model="visibleOptCols"
          :options="ALL_OPT_COLS"
          option-label="header"
          placeholder="Spalten"
          display="chip"
          class="ist-multiselect"
        >
          <template #dropdownicon>
            <i class="pi pi-table" />
          </template>
        </MultiSelect>
      </div>
    </div>

    <!-- ── DataTable ─────────────────────────────────────────────────────── -->
    <DataTable
      :value="rows"
      :global-filter-fields="['domain','competenceLevel','competenceType','exercise','title']"
      :filters="{ global: { value: globalFilter, matchMode: 'contains' } }"
      sort-mode="single"
      removable-sort
      striped-rows
      class="ist-table"
      size="small"
      scroll-height="600px"
      scrollable
    >
      <!-- Kompetenz -->
      <Column field="domain" header="Kompetenz" :sortable="true" style="min-width:130px">
        <template #body="{ data }">
          <span class="dom-chip">{{ domainLabel(data.domain) }}</span>
        </template>
      </Column>

      <!-- Stufe -->
      <Column field="competenceLevel" header="Stufe" :sortable="true" style="width:70px;text-align:center">
        <template #body="{ data }">
          <span class="level-badge" :style="{ background: levelColor(data.competenceLevel) }">
            {{ data.competenceLevel ?? '–' }}
          </span>
        </template>
      </Column>

      <!-- Kompetenztyp (optional) -->
      <Column
        v-if="colVisible('competenceType')"
        field="competenceType"
        header="Kompetenztyp"
        :sortable="true"
        style="min-width:120px"
      >
        <template #body="{ data }">{{ data.competenceType ?? '–' }}</template>
      </Column>

      <!-- Nr. + Aufgabentitel -->
      <Column field="exercise" header="Nr. + Aufgabentitel" :sortable="true" style="min-width:180px">
        <template #body="{ data }">
          <span class="ex-id">{{ data.exercise }}</span>
          <span v-if="data.title" class="ex-title"> {{ data.title }}</span>
        </template>
      </Column>

      <!-- Grafik -->
      <Column style="min-width:180px">
        <template #header>
          <div class="col-graph-header">
            <span>Grafik</span>
            <div class="col-legend">
              <span class="leg-dot" style="background:#f97316" />{{ groupLabel }}
              <template v-if="colVisible('schoolP')">
                <span class="leg-dot" style="background:#3b82f6" />{{ schoolLabel }}
              </template>
              <template v-if="colVisible('stateP')">
                <span class="leg-dot" style="background:#94a3b8" />{{ stateLabel }}
              </template>
            </div>
          </div>
        </template>
        <template #body="{ data }">
          <svg :width="BAR_W" :height="svgH" :viewBox="`0 0 ${BAR_W} ${svgH}`" class="bar-svg">
            <g v-for="(bar, bi) in barsFor(data)" :key="bi">
              <rect x="0" :y="bi*(BAR_H+BAR_GAP)+1" :width="BAR_W" :height="BAR_H" rx="3" fill="#f1f5f9" />
              <rect x="0" :y="bi*(BAR_H+BAR_GAP)+1"
                    :width="((bar.pct ?? 0)/100)*BAR_W" :height="BAR_H"
                    rx="3" :fill="bar.color" />
            </g>
          </svg>
        </template>
      </Column>

      <!-- Klasse % (optional) -->
      <Column
        v-if="colVisible('classP')"
        field="classP"
        :header="`${groupLabel} %`"
        :sortable="true"
        style="width:90px;text-align:right"
      >
        <template #body="{ data }">
          <span class="pct-val">{{ pctLabel(data.classP) }}</span>
        </template>
      </Column>

      <!-- Schule % (optional) -->
      <Column
        v-if="colVisible('schoolP')"
        field="schoolP"
        :header="`${schoolLabel} %`"
        :sortable="true"
        style="width:90px;text-align:right"
      >
        <template #body="{ data }">
          <span class="pct-val">{{ pctLabel(data.schoolP) }}</span>
        </template>
      </Column>

      <!-- Bundesland % (optional) -->
      <Column
        v-if="colVisible('stateP')"
        field="stateP"
        :header="`${stateLabel} %`"
        :sortable="true"
        style="width:100px;text-align:right"
      >
        <template #body="{ data }">
          <span class="pct-val">{{ pctLabel(data.stateP) }}</span>
        </template>
      </Column>

      <!-- Detail button -->
      <Column style="width:52px;text-align:center">
        <template #body="{ data }">
          <Button
            icon="pi pi-chevron-right"
            text
            rounded
            size="small"
            severity="secondary"
            class="detail-btn"
            aria-label="Details"
            @click="openDetail(data)"
          />
        </template>
      </Column>

      <template #empty>
        <div class="tbl-empty">Keine Aufgaben gefunden.</div>
      </template>

      <template #footer>
        {{ rows.length }} Aufgaben
      </template>
    </DataTable>

    <!-- Item detail drawer -->
    <Drawer
      v-model:visible="drawerVisible"
      position="right"
      :header="selectedItem?.exercise ?? 'Aufgabe'"
      style="width: 480px"
    >
      <ItemDetailView
        v-if="selectedItem"
        :item="selectedItem"
        :group-label="groupLabel"
      />
    </Drawer>
  </div>
</template>

<style scoped>
.ist-wrap { display: flex; flex-direction: column; gap: 12px; }

/* Toolbar */
.ist-toolbar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.ist-search-wrap {
  display: flex; align-items: center; gap: 6px;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
  padding: 4px 10px; flex: 1; max-width: 300px;
}
.ist-search-icon { font-size: 0.75rem; color: #94a3b8; }
.ist-search-input {
  border: none !important; outline: none !important; background: transparent !important;
  box-shadow: none !important; padding: 0 !important; font-size: 0.83rem !important;
  width: 100%;
}

.ist-multiselect { font-size: 0.82rem; }

/* Table */
.ist-table { border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }

/* Custom header for Grafik column */
.col-graph-header { display: flex; flex-direction: column; gap: 3px; }
.col-legend {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.68rem; font-weight: 400; color: #94a3b8;
  text-transform: none; letter-spacing: 0;
}
.leg-dot {
  display: inline-block; width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0;
}

/* Cell styles */
.dom-chip {
  font-size: 0.74rem; color: #0369a1; background: #e0f2fe;
  padding: 2px 8px; border-radius: 10px; white-space: nowrap;
}

.level-badge {
  display: inline-block; min-width: 22px; text-align: center;
  font-size: 0.72rem; font-weight: 700; color: #fff;
  padding: 2px 6px; border-radius: 4px;
}

.ex-id {
  font-family: ui-monospace, monospace; font-size: 0.75rem;
  color: #1e3a5f; background: #eff6ff; padding: 1px 5px; border-radius: 3px;
  white-space: nowrap;
}
.ex-title { color: #64748b; font-size: 0.78rem; margin-left: 4px; }

.bar-svg { display: block; }

.pct-val {
  font-variant-numeric: tabular-nums; font-size: 0.8rem; color: #475569;
  display: block; text-align: right;
}

.tbl-empty { text-align: center; color: #94a3b8; padding: 20px; }

.detail-btn { opacity: 0.55; transition: opacity 0.15s; }
.detail-btn:hover { opacity: 1; }
</style>
