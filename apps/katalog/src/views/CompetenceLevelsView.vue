<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import ToggleSwitch from 'primevue/toggleswitch';
import CompetenceLevelBar from '../components/CompetenceLevelBar.vue';
import ComponentDocs from '../components/ComponentDocs.vue';

const DOCS = {
  githubFile: 'CompetenceLevelBar.vue',
  propsDocs: [
    { name: 'rows',   type: 'Array',  required: true,  description: 'Ein Eintrag pro Ebene (Klasse, Schule, Bundesland). Jeder Eintrag: { label: string, total: number, levels: [{ nameShort, pct, color }] }. pct-Werte sollten sich zu ~100 addieren.' },
    { name: 'title',  type: 'String', default: "''",    description: 'Optionaler Titel über den Balken (z. B. Gruppenname).' },
    { name: 'domain', type: 'String', default: "''",    description: 'Domänenname, der als Abschnittsüberschrift angezeigt wird (z. B. "Hörverstehen").' },
  ],
  dataShape: `// rows-Element
{
  label: 'Klasse 3a',     // Zeilenbeschriftung
  total: 25,              // Anzahl Schüler:innen
  levels: [
    { nameShort: 'I',   pct: 12.0, color: '#ef4444' },
    { nameShort: 'II',  pct: 28.0, color: '#f97316' },
    { nameShort: 'III', pct: 36.0, color: '#eab308' },
    { nameShort: 'IV',  pct: 16.0, color: '#22c55e' },
    { nameShort: 'V',   pct:  8.0, color: '#15803d' },
  ],
}`,
  codeExample: `<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import CompetenceLevelBar from './components/CompetenceLevelBar.vue';

const LEVEL_COLORS = { I: '#ef4444', II: '#f97316', III: '#eab308', IV: '#22c55e', V: '#15803d' };
const LEVEL_ORDER  = ['I', 'II', 'III', 'IV', 'V'];

const rows = ref([]);

const buildRows = (vgs, label) => {
  const vg = vgs[0];
  if (!vg) return null;
  const total = vg.competenceLevels.reduce((s, l) => s + l.descriptiveStatistics.frequency, 0);
  return {
    label,
    total,
    levels: LEVEL_ORDER.map(ns => {
      const cl = vg.competenceLevels.find(l => l.nameShort === ns);
      const freq = cl?.descriptiveStatistics?.frequency ?? 0;
      return { nameShort: ns, pct: total > 0 ? (freq / total) * 100 : 0, color: LEVEL_COLORS[ns] };
    }),
  };
};

onMounted(async () => {
  const [gRes, sRes, stRes] = await Promise.all([
    axios.get('/groups/3a-deutsch/competence-levels'),
    axios.get('/schools/gs-musterstadt/competence-levels'),
    axios.get('/states/beispielland/competence-levels'),
  ]);
  rows.value = [
    buildRows([].concat(gRes.data),  '3a Deutsch'),
    buildRows([].concat(sRes.data),  'Schule'),
    buildRows([].concat(stRes.data), 'Bundesland'),
  ].filter(Boolean);
});
<\/script>

<template>
  <CompetenceLevelBar
    :rows="rows"
    title="3a Deutsch"
    domain="Leseverstehen"
  />
</template>`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/competence-levels',  description: 'Kompetenzstufenverteilung der Lerngruppe' },
    { method: 'GET', path: '/schools/{id}/competence-levels', description: 'Verteilung auf Schulebene (Referenz)' },
    { method: 'GET', path: '/states/{id}/competence-levels',  description: 'Verteilung auf Bundeslandebene (Referenz)' },
  ],
  apiNote: 'Jede Antwort ist ein Array von Value-Groups (eine pro Domäne). Die Komponente benötigt aufbereitete rows-Objekte — siehe Verwendungsbeispiel für das Mapping.',
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

// Competence level colors (I = weak → red, V = strong → dark green)
const LEVEL_COLORS = {
  I:   '#ef4444',
  II:  '#f97316',
  III: '#eab308',
  IV:  '#22c55e',
  V:   '#15803d',
};

const LEVEL_ORDER = ['I', 'II', 'III', 'IV', 'V'];

const selectedGroup = ref(GROUPS[0]);
const loading = ref(false);
const error = ref(null);
const showFairComparison = ref(false);

const groupVGs  = ref([]);
const schoolVGs = ref([]);
const stateVGs  = ref([]);

// Simulated "Fairer Vergleich" (Standorttyp) data derived from school VGs.
// Represents the avg. competency distribution of schools with a similar social index.
// Adjustment factors shift the distribution slightly towards lower levels to simulate
// a school population with similar social composition (more students at risk).
const FAIR_ADJUST = { I: 1.12, II: 1.06, III: 1.0, IV: 0.94, V: 0.88 };
const fairVGs = computed(() =>
  schoolVGs.value.map(vg => ({
    domain: vg.domain,
    competenceLevels: vg.competenceLevels?.map(cl => ({
      ...cl,
      descriptiveStatistics: {
        frequency: Math.round((cl.descriptiveStatistics?.frequency ?? 0) * (FAIR_ADJUST[cl.nameShort] ?? 1)),
      },
    })) ?? [],
  }))
);

const fetchAll = async () => {
  if (!selectedGroup.value) return;
  loading.value = true; error.value = null;
  try {
    const g = selectedGroup.value;
    const [gRes, sRes, stRes] = await Promise.all([
      axios.get(`/groups/${g.id}/competence-levels`),
      axios.get(`/schools/${g.schoolId}/competence-levels`),
      axios.get(`/states/${g.stateId}/competence-levels`),
    ]);
    groupVGs.value  = Array.isArray(gRes.data)  ? gRes.data  : [gRes.data];
    schoolVGs.value = Array.isArray(sRes.data)  ? sRes.data  : [sRes.data];
    stateVGs.value  = Array.isArray(stRes.data) ? stRes.data : [stRes.data];
  } catch (e) {
    error.value = e.message;
    groupVGs.value = []; schoolVGs.value = []; stateVGs.value = [];
  } finally { loading.value = false; }
};

watch(() => selectedGroup.value, fetchAll);
onMounted(fetchAll);

// Extract competence level percentages from value groups for a given domain
const extractLevels = (vgs, domain) => {
  const vg = vgs.find((v) => v.domain?.name === domain || v.domain === domain);
  if (!vg) return null;
  const total = vg.competenceLevels?.reduce((s, cl) => s + (cl.descriptiveStatistics?.frequency ?? 0), 0) ?? 0;
  return {
    total,
    levels: LEVEL_ORDER.map((ns) => {
      const cl = vg.competenceLevels?.find((c) => c.nameShort === ns);
      const freq = cl?.descriptiveStatistics?.frequency ?? 0;
      return { nameShort: ns, pct: total > 0 ? (freq / total) * 100 : 0, color: LEVEL_COLORS[ns] ?? '#94a3b8' };
    }),
  };
};

const DOMAIN_NAMES = { ho: 'Hörverstehen', le: 'Leseverstehen', sr: 'Sprachgebrauch', ma: 'Mathematik', en: 'Englisch', fr: 'Französisch' };
const domainLabel = (d) => DOMAIN_NAMES[d] ?? d?.toUpperCase() ?? '';

// All unique domains present in the group data
const domains = computed(() => {
  const seen = new Set();
  for (const vg of groupVGs.value) {
    const d = vg.domain?.name ?? vg.domain;
    if (d) seen.add(d);
  }
  return [...seen];
});

// Build chart rows per domain: [class, school, (fair comparison), state]
const domainCharts = computed(() => {
  if (!domains.value.length) return [];
  return domains.value.map((domain) => {
    const gData  = extractLevels(groupVGs.value,  domain);
    const sData  = extractLevels(schoolVGs.value, domain);
    const fData  = showFairComparison.value ? extractLevels(fairVGs.value, domain) : null;
    const stData = extractLevels(stateVGs.value,  domain);

    const rows = [
      gData  && { label: selectedGroup.value.label, ...gData  },
      sData  && { label: 'Schule',                   ...sData  },
      fData  && { label: 'Fairer Vergleich',          ...fData,  fair: true },
      stData && { label: 'Bundesland',                ...stData },
    ].filter(Boolean);

    return { domain, label: domainLabel(domain), rows };
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
              <code class="comp-name">CompetenceLevelBar</code>
              <Tag value="Neu" severity="contrast" />
            </div>
            <p class="comp-desc">
              <strong>Kompetenzstufenverteilung — Klasse · Schule · Fairer Vergleich · Bundesland</strong><br />
              Horizontale Stapelbalken für jede Ebene: Anteile der Schüler*innen in den Kompetenzstufen I–V.
              Mit optionalem <strong>Fairen Vergleich</strong> (⚖ Standorttyp) — Referenz zu Schulen mit ähnlicher sozialer Zusammensetzung.
            </p>
            <div class="use-case-note use-case-api">
              <i class="pi pi-server" />
              <span>
                <code>/groups/{id}/competence-levels</code> ·
                <code>/schools/{id}/competence-levels</code> ·
                <code>/states/{id}/competence-levels</code>
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
              <ToggleSwitch v-model="showFairComparison" input-id="fair-toggle" />
              <label for="fair-toggle" class="fair-toggle-label">
                <span class="fair-icon">⚖</span>
                Standorttyp anzeigen
              </label>
            </div>
            <span class="fair-hint">Schulen mit ähnlicher sozialer Zusammensetzung</span>
          </div>
        </div>

        <div v-if="loading" class="skeleton-wrap">
          <Skeleton v-for="n in 6" :key="n" height="40px" class="mb-3" />
        </div>
        <Message v-else-if="error" severity="error" :closable="false" class="mt-2">
          {{ error }} — Läuft der Mock-Server auf localhost:8000?
        </Message>
        <Message v-else-if="!domainCharts.length" severity="info" :closable="false" class="mt-2">
          Keine Daten.
        </Message>

        <div v-else class="charts-grid">
          <div v-for="dc in domainCharts" :key="dc.domain" class="chart-wrap">
            <CompetenceLevelBar
              :rows="dc.rows"
              :title="selectedGroup?.label"
              :domain="dc.label"
            />
          </div>
        </div>

        <ComponentDocs
          component-name="CompetenceLevelBar"
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
  max-width: 1050px;
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
.use-case-api { flex-wrap: wrap; }
.use-case-api code {
  font-size: 0.75rem; background: #e0f2fe; padding: 1px 4px; border-radius: 3px;
  font-family: ui-monospace, monospace;
}

.controls { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-bottom: 20px; align-items: flex-start; }
.ctrl-field { display: flex; flex-direction: column; gap: 5px; }
.ctrl-label {
  font-size: 0.74rem; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.05em;
}
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
