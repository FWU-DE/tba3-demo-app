<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import ToggleSwitch from 'primevue/toggleswitch';
import MeanComparisonChart from '../components/MeanComparisonChart.vue';
import ComponentDocs from '../components/ComponentDocs.vue';

const DOCS = {
  githubFile: 'MeanComparisonChart.vue',
  propsDocs: [
    { name: 'rows',   type: 'Array',  required: true,  description: 'Ein Eintrag pro Vergleichsebene. Jeder Eintrag: { label, mean, ciLow?, ciHigh?, n?, fair? }. mean in Prozent (0–100).' },
    { name: 'title',  type: 'String', default: "''",    description: 'Optionaler Titel.' },
    { name: 'domain', type: 'String', default: "''",    description: 'Domänenname als Abschnittsüberschrift.' },
    { name: 'xLabel', type: 'String', default: "'Mittlere Lösungsquote (%)'", description: 'Beschriftung der X-Achse.' },
  ],
  dataShape: `// rows-Element
{
  label: 'Klasse 3a',
  mean:   62,             // mittlere Lösungsquote (0–100 %)
  ciLow:  55,             // untere Grenze 95%-KI (optional)
  ciHigh: 69,             // obere Grenze 95%-KI (optional)
  n:      25,             // Stichprobengröße (optional)
  fair:   false,          // true → als "Fairer Vergleich" markieren (⚖-Icon, Teal)
}`,
  codeExample: `<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import MeanComparisonChart from './components/MeanComparisonChart.vue';

const rows = ref([]);

const meanPct = (vgs, domain) => {
  const vg = vgs.find(v => v.domain?.name === domain);
  if (!vg?.items?.length) return null;
  const sum = vg.items.reduce((s, it) => s + (it.descriptiveStatistics?.mean ?? 0), 0);
  return (sum / vg.items.length) * 100;
};

onMounted(async () => {
  const [gRes, sRes, stRes] = await Promise.all([
    axios.get('/groups/3a-deutsch/items'),
    axios.get('/schools/gs-musterstadt/items'),
    axios.get('/states/beispielland/items'),
  ]);
  rows.value = [
    { label: '3a Deutsch', mean: meanPct(gRes.data, 'le'), n: 25 },
    { label: 'Schule',     mean: meanPct(sRes.data, 'le') },
    { label: 'Fairer Vergleich', mean: meanPct(sRes.data, 'le') * 0.97, fair: true },
    { label: 'Bundesland', mean: meanPct(stRes.data, 'le') },
  ].filter(r => r.mean != null);
});
<\/script>

<template>
  <MeanComparisonChart
    :rows="rows"
    title="3a Deutsch"
    domain="Leseverstehen"
  />
</template>`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/items',  description: 'Aufgabendaten der Lerngruppe (für Mittelwert)' },
    { method: 'GET', path: '/schools/{id}/items', description: 'Schulebene (Referenz)' },
    { method: 'GET', path: '/states/{id}/items',  description: 'Bundeslandebene (Referenz)' },
  ],
  apiNote: 'Der Mittelwert wird als Durchschnitt der descriptiveStatistics.mean-Werte aller Items berechnet (0–1 → × 100). CI-Grenzen müssen extern berechnet werden.',
};

const GROUPS = [
  { id: '3a-deutsch', label: '3a Deutsch',    schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '3b-deutsch', label: '3b Deutsch',    schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '3c-deutsch', label: '3c Deutsch',    schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '8a-deutsch', label: '8a Deutsch',    schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
  { id: '3a-mathe',   label: '3a Mathematik', schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '8a-mathe',   label: '8a Mathematik', schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
  { id: '8a-englisch', label: '8a Englisch',  schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
];

const selectedGroup = ref(GROUPS[0]);
const loading = ref(false);
const error = ref(null);
const showFairComparison = ref(true);

const groupItems  = ref([]);
const schoolItems = ref([]);
const stateItems  = ref([]);

const fetchAll = async () => {
  if (!selectedGroup.value) return;
  loading.value = true; error.value = null;
  try {
    const g = selectedGroup.value;
    const [gRes, sRes, stRes] = await Promise.all([
      axios.get(`/groups/${g.id}/items`),
      axios.get(`/schools/${g.schoolId}/items`),
      axios.get(`/states/${g.stateId}/items`),
    ]);
    groupItems.value  = Array.isArray(gRes.data)  ? gRes.data  : [gRes.data];
    schoolItems.value = Array.isArray(sRes.data)  ? sRes.data  : [sRes.data];
    stateItems.value  = Array.isArray(stRes.data) ? stRes.data : [stRes.data];
  } catch (e) {
    error.value = e.message;
    groupItems.value = []; schoolItems.value = []; stateItems.value = [];
  } finally { loading.value = false; }
};

watch(() => selectedGroup.value, fetchAll);
onMounted(fetchAll);

const DOMAIN_NAMES = { ho: 'Hörverstehen', le: 'Leseverstehen', sr: 'Sprachgebrauch', ma: 'Mathematik', en: 'Englisch', fr: 'Französisch' };

// Calculate mean solution rate (%) from a list of item VGs for a given domain
const meanForDomain = (vgs, domain) => {
  const vg = vgs.find(v => (v.domain?.name ?? v.domain) === domain);
  if (!vg?.items?.length) return null;
  const total = vg.items.reduce((s, it) => s + (it.descriptiveStatistics?.mean ?? 0), 0);
  return (total / vg.items.length) * 100;
};

// Simple ±σ CI approximation: ±10 * sqrt(n)/n for illustration
const ciRange = (mean, n) => {
  if (mean == null || !n) return {};
  const halfWidth = 10 * Math.sqrt(n) / n * 20;
  return { ciLow: Math.max(0, mean - halfWidth), ciHigh: Math.min(100, mean + halfWidth) };
};

const domains = computed(() => {
  const seen = new Set();
  for (const vg of groupItems.value) {
    const d = vg.domain?.name ?? vg.domain;
    if (d) seen.add(d);
  }
  return [...seen];
});

const domainCharts = computed(() => {
  if (!domains.value.length) return [];
  return domains.value.map(domain => {
    const gMean  = meanForDomain(groupItems.value,  domain);
    const sMean  = meanForDomain(schoolItems.value, domain);
    const stMean = meanForDomain(stateItems.value,  domain);

    // Group student count from first matching VG
    const gVg = groupItems.value.find(v => (v.domain?.name ?? v.domain) === domain);
    const gN = gVg?.items?.length ?? null;

    // Fair comparison: simulate similar-context school avg (slightly below school mean)
    const fMean = sMean != null ? sMean * 0.96 : null;

    const rows = [
      gMean  != null && { label: selectedGroup.value.label, mean: gMean,  ...ciRange(gMean,  gN), n: gN },
      sMean  != null && { label: 'Schule',                   mean: sMean,  ...ciRange(sMean,  null) },
      (showFairComparison.value && fMean != null) && { label: 'Fairer Vergleich', mean: fMean, ...ciRange(fMean, null), fair: true },
      stMean != null && { label: 'Bundesland',               mean: stMean, ...ciRange(stMean, null) },
    ].filter(Boolean);

    return { domain, label: DOMAIN_NAMES[domain] ?? domain, rows };
  });
});
</script>

<template>
  <main class="view-main">
    <Card class="catalog-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="comp-name-row">
              <code class="comp-name">MeanComparisonChart</code>
              <Tag value="Neu" severity="contrast" />
            </div>
            <p class="comp-desc">
              <strong>Mittlere Lösungsquote — Klasse · Schule · Fairer Vergleich · Bundesland</strong><br />
              Diamant-Marker auf einer horizontalen Skala zeigen die mittlere Lösungsquote je Ebene.
              Optionale Konfidenzintervalle als Fehlerbalken. Hintergrundfarben markieren Kompetenzbereiche.
            </p>
            <div class="use-case-note use-case-api">
              <i class="pi pi-server" />
              <span>
                <code>/groups/{id}/items</code> ·
                <code>/schools/{id}/items</code> ·
                <code>/states/{id}/items</code>
              </span>
            </div>
          </div>
          <Tag value="SVG" severity="info" />
        </div>
      </template>

      <template #content>
        <div class="controls">
          <div class="ctrl-field">
            <label class="ctrl-label">Lerngruppe</label>
            <Select v-model="selectedGroup" :options="GROUPS" option-label="label"
              placeholder="Gruppe wählen" class="ctrl-select" />
          </div>
          <div class="ctrl-field ctrl-fair">
            <label class="ctrl-label">Fairer Vergleich</label>
            <div class="fair-toggle-row">
              <ToggleSwitch v-model="showFairComparison" input-id="fair-toggle-mc" />
              <label for="fair-toggle-mc" class="fair-toggle-label">
                <span class="fair-icon">⚖</span>
                Standorttyp anzeigen
              </label>
            </div>
            <span class="fair-hint">Schulen mit ähnlicher sozialer Zusammensetzung</span>
          </div>
        </div>

        <div v-if="loading" class="skeleton-wrap">
          <Skeleton v-for="n in 4" :key="n" height="60px" class="mb-3" />
        </div>
        <Message v-else-if="error" severity="error" :closable="false" class="mt-2">
          {{ error }} — Läuft der Mock-Server auf localhost:8000?
        </Message>
        <Message v-else-if="!domainCharts.length" severity="info" :closable="false" class="mt-2">
          Keine Daten.
        </Message>

        <div v-else class="charts-grid">
          <div v-for="dc in domainCharts" :key="dc.domain" class="chart-wrap">
            <MeanComparisonChart
              :rows="dc.rows"
              :title="selectedGroup?.label"
              :domain="dc.label"
            />
          </div>
        </div>

        <ComponentDocs
          component-name="MeanComparisonChart"
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
.view-main { max-width: 1050px; margin: 28px auto; padding: 0 20px; }
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
.use-case-api { flex-wrap: wrap; }
.use-case-api code { font-size: 0.75rem; background: #e0f2fe; padding: 1px 4px; border-radius: 3px; font-family: ui-monospace, monospace; }
.controls { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-bottom: 20px; align-items: flex-start; }
.ctrl-field { display: flex; flex-direction: column; gap: 5px; }
.ctrl-label { font-size: 0.74rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.ctrl-select { min-width: 210px; }
.ctrl-fair { border-left: 2px solid #e2e8f0; padding-left: 16px; }
.fair-toggle-row { display: flex; align-items: center; gap: 8px; }
.fair-toggle-label { display: flex; align-items: center; gap: 4px; font-size: 0.87rem; color: #0f766e; font-weight: 500; cursor: pointer; }
.fair-icon { font-size: 1rem; }
.fair-hint { font-size: 0.72rem; color: #94a3b8; margin-top: 1px; }
.charts-grid { display: flex; flex-direction: column; gap: 32px; }
.chart-wrap { overflow-x: auto; }
.skeleton-wrap { padding: 4px 0; }
.mb-3 { margin-bottom: 12px; }
.mt-2 { margin-top: 8px; }
</style>
