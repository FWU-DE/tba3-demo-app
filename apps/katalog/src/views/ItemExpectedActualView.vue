<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import ItemExpectedActualChart from '../components/ItemExpectedActualChart.vue';
import ComponentDocs from '../components/ComponentDocs.vue';

const DOCS = {
  githubFile: 'ItemExpectedActualChart.vue',
  propsDocs: [
    { name: 'items',  type: 'Array',  required: true,  description: 'Ein Eintrag pro Aufgabe: { label, level, actual, expected }. actual und expected in Prozent (0–100).' },
    { name: 'title',  type: 'String', default: "''",   description: 'Optionaler Titel.' },
    { name: 'domain', type: 'String', default: "''",   description: 'Domänenname als Abschnittsüberschrift.' },
  ],
  dataShape: `// items-Element
{
  label:    'LE-026',   // Aufgaben-ID
  level:    'III',      // Kompetenzstufe I–V
  actual:   62,         // tatsächliche Lösungsquote der Klasse (0–100 %)
  expected: 55,         // IRT-Erwartungswert für diese Klasse (0–100 %)
}

// Erwartungswert via Rasch-Modell:
// P = 1 / (1 + exp(-(classBista - itemBista) / 50))
// classBista  = mittlerer BISTA-Wert der gelösten Aufgaben der Klasse
// itemBista   = parameters.bistaPoints der Aufgabe`,
  codeExample: `<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import ItemExpectedActualChart from './components/ItemExpectedActualChart.vue';

const LEVEL_ORDER = ['I', 'II', 'III', 'IV', 'V'];

// Rasch-Modell: Erwartete Lösungswahrscheinlichkeit
const raschP = (classBista, itemBista) =>
  1 / (1 + Math.exp(-(classBista - itemBista) / 50));

// Klassen-BISTA schätzen: mittlere Schwierigkeit der "bestandenen" Aufgaben
const estimateClassBista = (vgs) => {
  const allItems = vgs.flatMap(vg => vg.items ?? []);
  const passed = allItems.filter(it => (it.descriptiveStatistics?.mean ?? 0) >= 0.5);
  if (!passed.length) return 400;
  return passed.reduce((s, it) => s + (it.parameters?.bistaPoints ?? 400), 0) / passed.length;
};

const chartItems = ref([]);

onMounted(async () => {
  const { data } = await axios.get('/groups/3a-deutsch/items');
  const vgs = Array.isArray(data) ? data : [data];
  const classBista = estimateClassBista(vgs);

  chartItems.value = vgs
    .flatMap(vg => (vg.items ?? []).map(it => ({
      label:    it.exercise?.name ?? it.iqbId,
      level:    it.parameters?.competenceLevel?.nameShort ?? '?',
      actual:   (it.descriptiveStatistics?.mean ?? 0) * 100,
      expected: raschP(classBista, it.parameters?.bistaPoints ?? 400) * 100,
    })))
    .sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));
});
<\/script>

<template>
  <ItemExpectedActualChart
    :items="chartItems"
    title="3a Deutsch"
    domain="Leseverstehen"
  />
</template>`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/items', description: 'Aufgabendaten mit descriptiveStatistics.mean und parameters.bistaPoints' },
  ],
  apiNote: 'Kein zusätzlicher Endpunkt nötig. Der Erwartungswert wird clientseitig via Rasch-Modell aus bistaPoints und dem geschätzten Klassen-BISTA berechnet.',
};

const GROUPS = [
  { id: '3a-deutsch',  label: '3a Deutsch',    schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '3b-deutsch',  label: '3b Deutsch',    schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '3c-deutsch',  label: '3c Deutsch',    schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '8a-deutsch',  label: '8a Deutsch',    schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
  { id: '3a-mathe',    label: '3a Mathematik', schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '8a-mathe',    label: '8a Mathematik', schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
  { id: '8a-englisch', label: '8a Englisch',   schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
];

const LEVEL_ORDER = ['I', 'II', 'III', 'IV', 'V'];

const selectedGroup = ref(GROUPS[0]);
const loading       = ref(false);
const error         = ref(null);
const rawVGs        = ref([]);

const fetchAll = async () => {
  if (!selectedGroup.value) return;
  loading.value = true; error.value = null;
  try {
    const { data } = await axios.get(`/groups/${selectedGroup.value.id}/items`);
    rawVGs.value = Array.isArray(data) ? data : [data];
  } catch (e) {
    error.value = e.message;
    rawVGs.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => selectedGroup.value, fetchAll);
onMounted(fetchAll);

// Rasch model: expected solution probability given class ability and item difficulty
const raschP = (classBista, itemBista) =>
  1 / (1 + Math.exp(-(classBista - itemBista) / 50));

// Estimate class ability as mean bistaPoints of "passed" items (mean >= 0.5)
const estimateClassBista = (vgs) => {
  const allItems = vgs.flatMap(vg => vg.items ?? []);
  const passed = allItems.filter(it => (it.descriptiveStatistics?.mean ?? 0) >= 0.5);
  if (!passed.length) return 400;
  return passed.reduce((s, it) => s + (it.parameters?.bistaPoints ?? 400), 0) / passed.length;
};

const DOMAIN_NAMES = {
  ho: 'Hörverstehen', le: 'Leseverstehen', sr: 'Sprachgebrauch',
  ma: 'Mathematik',   en: 'Englisch',      fr: 'Französisch',
};

const domains = computed(() => {
  const seen = new Set();
  for (const vg of rawVGs.value) {
    const d = vg.domain?.name ?? vg.domain;
    if (d) seen.add(d);
  }
  return [...seen];
});

const classBista = computed(() => estimateClassBista(rawVGs.value));

const domainCharts = computed(() => {
  if (!domains.value.length) return [];
  return domains.value.map(domain => {
    const vg = rawVGs.value.find(v => (v.domain?.name ?? v.domain) === domain);
    if (!vg?.items?.length) return null;

    const items = vg.items
      .map(it => ({
        label:    it.exercise?.name ?? it.iqbId ?? '?',
        level:    it.parameters?.competenceLevel?.nameShort ?? '?',
        actual:   (it.descriptiveStatistics?.mean ?? 0) * 100,
        expected: raschP(classBista.value, it.parameters?.bistaPoints ?? 400) * 100,
      }))
      .filter(it => it.level !== '?')
      .sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));

    return { domain, label: DOMAIN_NAMES[domain] ?? domain, items };
  }).filter(Boolean);
});
</script>

<template>
  <main class="view-main">
    <Card class="catalog-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="comp-name-row">
              <code class="comp-name">ItemExpectedActualChart</code>
              <Tag value="Neu" severity="contrast" />
            </div>
            <p class="comp-desc">
              <strong>Tatsächliche vs. erwartete Lösungsquote pro Aufgabe</strong><br />
              Zeigt für jede Aufgabe, ob die Klasse über oder unter dem statistisch erwarteten Wert liegt.
              Der Erwartungswert wird clientseitig via <strong>Rasch-Modell</strong> aus den
              BISTA-Schwierigkeitsparametern und dem geschätzten Klassen-Niveau berechnet.
              Rot = systematisch unter Erwartung → didaktischer Handlungsbedarf.
            </p>
            <div class="use-case-note use-case-api">
              <i class="pi pi-server" />
              <span><code>/groups/{id}/items</code> — kein zusätzlicher Endpunkt</span>
            </div>
            <div class="use-case-note use-case-formula">
              <i class="pi pi-calculator" />
              <span>
                P<sub>erwartet</sub> = 1 / (1 + e<sup>−(θ<sub>Klasse</sub> − β<sub>Aufgabe</sub>) / 50</sup>)
                &nbsp;·&nbsp; θ = mittl. BISTA gelöster Aufgaben &nbsp;·&nbsp; β = parameters.bistaPoints
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
          <div v-if="classBista && !loading" class="bista-badge">
            <span class="bista-label">Geschätztes Klassen-Niveau</span>
            <span class="bista-value">Ø {{ Math.round(classBista) }} BISTA</span>
          </div>
        </div>

        <div v-if="loading" class="skeleton-wrap">
          <Skeleton v-for="n in 8" :key="n" height="28px" class="mb-2" />
        </div>
        <Message v-else-if="error" severity="error" :closable="false" class="mt-2">
          {{ error }} — Läuft der Mock-Server auf localhost:8000?
        </Message>
        <Message v-else-if="!domainCharts.length" severity="info" :closable="false" class="mt-2">
          Keine Daten.
        </Message>

        <div v-else class="charts-grid">
          <div v-for="dc in domainCharts" :key="dc.domain" class="chart-wrap">
            <ItemExpectedActualChart
              :items="dc.items"
              :title="selectedGroup?.label"
              :domain="dc.label"
            />
          </div>
        </div>

        <ComponentDocs
          component-name="ItemExpectedActualChart"
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
  margin-top: 8px; max-width: 640px; flex-wrap: wrap;
}
.use-case-api code { font-size: 0.75rem; background: #e0f2fe; padding: 1px 4px; border-radius: 3px; font-family: ui-monospace, monospace; }
.use-case-formula { color: #7c3aed; background: #faf5ff; border-color: #ddd6fe; font-family: ui-monospace, monospace; }
.controls { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-bottom: 20px; align-items: flex-end; }
.ctrl-field { display: flex; flex-direction: column; gap: 5px; }
.ctrl-label { font-size: 0.74rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.ctrl-select { min-width: 210px; }
.bista-badge {
  display: flex; flex-direction: column; gap: 2px;
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;
  padding: 6px 12px;
}
.bista-label { font-size: 0.7rem; font-weight: 600; color: #15803d; text-transform: uppercase; letter-spacing: 0.05em; }
.bista-value { font-size: 0.95rem; font-weight: 700; color: #166534; font-family: ui-monospace, monospace; }
.charts-grid { display: flex; flex-direction: column; gap: 32px; }
.chart-wrap { overflow-x: auto; }
.skeleton-wrap { padding: 4px 0; }
.mb-2 { margin-bottom: 8px; }
.mt-2 { margin-top: 8px; }
</style>
