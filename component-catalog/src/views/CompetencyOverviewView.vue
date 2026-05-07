<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import CompetencyOverviewCards from '../components/CompetencyOverviewCards.vue';
import ComponentDocs from '../components/ComponentDocs.vue';

const DOCS = {
  githubFile: 'CompetencyOverviewCards.vue',
  propsDocs: [
    { name: 'chartData', type: 'Array',  required: true,  description: 'Ein Eintrag pro Kompetenzstufe: { level, count, percentage (0–1), color, name }' },
    { name: 'stats',     type: 'Object', required: true,  description: '{ total, belowStandard, atStandard, aboveStandard } — alle als Anteile (0–1)' },
    { name: 'subject',   type: 'String', default: "''",   description: 'Fachbezeichnung, die im Donut-Zentrum angezeigt wird (z. B. "Deutsch").' },
  ],
  dataShape: `// chartData-Element
{ level: 'III', count: 8, percentage: 0.32, color: '#eab308', name: 'Regelstandard' }

// stats
{ total: 25, belowStandard: 0.12, atStandard: 0.60, aboveStandard: 0.28 }`,
  codeExample: `<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import CompetencyOverviewCards from './components/CompetencyOverviewCards.vue';

const LEVEL_COLORS = { I: '#ef4444', II: '#f97316', III: '#eab308', IV: '#22c55e', V: '#15803d' };
const LEVEL_NAMES  = { I: 'Unter Mindeststandard', II: 'Mindeststandard', III: 'Regelstandard', IV: 'Regelstandard+', V: 'Optimalstandard' };
const LEVEL_ORDER  = ['I','II','III','IV','V'];

const chartData = ref([]);
const stats     = ref(null);

onMounted(async () => {
  const { data } = await axios.get('/groups/3a-deutsch/competence-levels');
  const vgs = [].concat(data);
  const counts = {};
  let total = 0;
  vgs.forEach(vg => {
    (vg.competenceLevels ?? []).forEach(cl => {
      const f = cl.descriptiveStatistics?.frequency ?? 0;
      counts[cl.nameShort] = (counts[cl.nameShort] ?? 0) + f;
      total += f;
    });
  });
  chartData.value = LEVEL_ORDER.map(ns => ({
    level: ns, count: counts[ns] ?? 0,
    percentage: total > 0 ? (counts[ns] ?? 0) / total : 0,
    color: LEVEL_COLORS[ns], name: LEVEL_NAMES[ns],
  }));
  const get = ns => counts[ns] ?? 0;
  stats.value = {
    total,
    belowStandard: get('I') / total,
    atStandard:   (get('II') + get('III')) / total,
    aboveStandard:(get('IV') + get('V')) / total,
  };
});
<\/script>

<template>
  <CompetencyOverviewCards
    :chart-data="chartData"
    :stats="stats"
    subject="Deutsch"
  />
</template>`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/competence-levels', description: 'Kompetenzstufenverteilung der Lerngruppe (aggregiert über alle Domänen)' },
  ],
  apiNote: 'Die Komponente aggregiert alle Domänen zu einer Gesamtverteilung. Für eine domänenspezifische Ansicht bitte CompetenceLevelBar verwenden.',
};

const GROUPS = [
  { id: '3a-deutsch',  label: '3a Deutsch',    subject: 'Deutsch' },
  { id: '3b-deutsch',  label: '3b Deutsch',    subject: 'Deutsch' },
  { id: '3c-deutsch',  label: '3c Deutsch',    subject: 'Deutsch' },
  { id: '8a-deutsch',  label: '8a Deutsch',    subject: 'Deutsch' },
  { id: '3a-mathe',    label: '3a Mathematik', subject: 'Mathematik' },
  { id: '8a-mathe',    label: '8a Mathematik', subject: 'Mathematik' },
  { id: '8a-englisch', label: '8a Englisch',   subject: 'Englisch' },
];

const LEVEL_COLORS = { I: '#ef4444', II: '#f97316', III: '#eab308', IV: '#22c55e', V: '#15803d' };
const LEVEL_NAMES  = { I: 'Unter Mindeststandard', II: 'Mindeststandard', III: 'Regelstandard', IV: 'Regelstandard+', V: 'Optimalstandard' };
const LEVEL_ORDER  = ['I', 'II', 'III', 'IV', 'V'];

const selectedGroup = ref(GROUPS[0]);
const loading = ref(false);
const error   = ref(null);
const rawData = ref([]);

const fetchData = async () => {
  if (!selectedGroup.value) return;
  loading.value = true; error.value = null;
  try {
    const res = await axios.get(`/groups/${selectedGroup.value.id}/competence-levels`);
    rawData.value = Array.isArray(res.data) ? res.data : [res.data];
  } catch (e) {
    error.value = e.message;
    rawData.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => selectedGroup.value, fetchData);
onMounted(fetchData);

// Aggregate all domains → one entry per competence level
const chartData = computed(() => {
  const counts = {};
  let total = 0;
  rawData.value.forEach((vg) => {
    (vg.competenceLevels ?? []).forEach((cl) => {
      const freq = cl.descriptiveStatistics?.frequency ?? 0;
      counts[cl.nameShort] = (counts[cl.nameShort] ?? 0) + freq;
      total += freq;
    });
  });
  return LEVEL_ORDER.map((ns) => ({
    level: ns,
    count: counts[ns] ?? 0,
    percentage: total > 0 ? (counts[ns] ?? 0) / total : 0,
    color: LEVEL_COLORS[ns],
    name: LEVEL_NAMES[ns] ?? ns,
  }));
});

const stats = computed(() => {
  const total = chartData.value.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;
  const get = (ns) => (chartData.value.find((d) => d.level === ns)?.count ?? 0);
  return {
    total,
    belowStandard: get('I') / total,
    atStandard: (get('II') + get('III')) / total,
    aboveStandard: (get('IV') + get('V')) / total,
  };
});

const hasData = computed(() => stats.value !== null);
</script>

<template>
  <main class="view-main">
    <Card class="catalog-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="comp-name-row">
              <code class="comp-name">CompetencyOverviewCards</code>
              <Tag value="Neu" severity="contrast" />
            </div>
            <p class="comp-desc">
              <strong>Kompetenzübersicht — Donut-Diagramm &amp; Schlüsselkennzahlen</strong><br />
              Zwei Karten nebeneinander: Links ein SVG-Donut-Diagramm mit Kompetenzstufenverteilung,
              rechts die Schlüsselkennzahlen „Mindeststandard und darüber" vs. „Unter Mindeststandard".
            </p>
            <div class="use-case-note use-case-api">
              <i class="pi pi-server" />
              <span><code>/groups/{id}/competence-levels</code></span>
            </div>
          </div>
          <Tag value="SVG" severity="info" />
        </div>
      </template>

      <template #content>
        <div class="controls">
          <div class="ctrl-field">
            <label class="ctrl-label">Lerngruppe</label>
            <Select
              v-model="selectedGroup"
              :options="GROUPS"
              option-label="label"
              placeholder="Gruppe wählen"
              class="ctrl-select"
            />
          </div>
        </div>

        <div v-if="loading" class="skeleton-wrap">
          <div class="skeleton-grid">
            <Skeleton height="260px" />
            <Skeleton height="260px" />
          </div>
        </div>

        <Message v-else-if="error" severity="error" :closable="false" class="mt-2">
          {{ error }} — Läuft der Mock-Server auf localhost:8000?
        </Message>

        <Message v-else-if="!hasData" severity="info" :closable="false" class="mt-2">
          Keine Daten.
        </Message>

        <CompetencyOverviewCards
          v-else
          :chart-data="chartData"
          :stats="stats"
          :subject="selectedGroup?.subject"
        />

        <ComponentDocs
          component-name="CompetencyOverviewCards"
          :github-file="DOCS.githubFile"
          :props-docs="DOCS.propsDocs"
          :data-shape="DOCS.dataShape"
          :code-example="DOCS.codeExample"
          :api-endpoints="DOCS.apiEndpoints"
          :api-note="DOCS.apiNote"
        />
      </template>
    </Card>
  </main>
</template>

<style scoped>
.view-main {
  max-width: 900px;
  margin: 28px auto;
  padding: 0 20px;
}

.catalog-card { border-radius: 10px; }

.card-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 12px; padding: 18px 20px 0;
}
.comp-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.comp-name {
  font-size: 0.95rem; font-weight: 700; font-family: ui-monospace, monospace;
  color: #1e3a5f; background: #eff6ff; padding: 2px 8px; border-radius: 4px;
}
.comp-desc { font-size: 0.84rem; color: #475569; max-width: 600px; line-height: 1.55; }
.use-case-note {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.78rem; color: #0369a1; background: #f0f9ff;
  border: 1px solid #bae6fd; border-radius: 5px; padding: 5px 10px;
  margin-top: 8px; max-width: 580px;
}
.use-case-api code {
  font-size: 0.75rem; background: #e0f2fe; padding: 1px 4px; border-radius: 3px;
  font-family: ui-monospace, monospace;
}

.controls { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-bottom: 20px; }
.ctrl-field { display: flex; flex-direction: column; gap: 5px; }
.ctrl-label {
  font-size: 0.74rem; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.ctrl-select { min-width: 210px; }

.skeleton-wrap { padding: 4px 0; }
.skeleton-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.mt-2 { margin-top: 8px; }
</style>
