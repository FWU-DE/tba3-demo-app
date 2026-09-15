<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { Uebersichtskarten } from '@tba3/bausteine/vue';
import ComponentDocs from '../components/ComponentDocs.vue';
import { t } from '../i18n';

const DOCS = {
  githubFile: 'uebersichtskarten.js',
  githubPath: 'packages/bausteine/webcomponents/uebersichtskarten.js',
  // Beschreibungen kommen aus i18n/texte.js — der Rest ist Technik.
  propsDocs: [
    { name: 'karten',    type: 'Array',  required: true, pfad: 'ansichten.uebersicht.props.karten' },
    { name: 'title',     type: 'String', default: "''",  pfad: 'ansichten.uebersicht.props.title' },
    { name: 'geoeffnet', type: 'Array',  default: '[]',  pfad: 'ansichten.uebersicht.props.geoeffnet' },
    { name: 'spalten',   type: 'Number', default: '3',   pfad: 'ansichten.uebersicht.props.spalten' },
  ],
  dataShape: `// karten-Element
{
  id:      'ab-mindest',
  label:   'Mindeststandard und darüber',
  wert:    88,                    // Zahl im Ring
  einheit: '%',
  anteile: [                      // ergibt den Ring; Summe ist die Grundlinie
    { label: 'erreicht',       wert: 22, farbe: '#22c55e' },
    { label: 'nicht erreicht', wert: 3,  farbe: '#ef4444' },
  ],
  details: [                      // aufklappbar; fehlt es, ist die Karte flach
    { label: 'Schüler*innen', wert: 25 },
  ],
}`,
  codeExample: `<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Uebersichtskarten } from '@tba3/bausteine/vue';

const FARBEN = { I: '#ef4444', II: '#f97316', III: '#eab308', IV: '#22c55e', V: '#15803d' };
const STUFEN = ['I', 'II', 'III', 'IV', 'V'];

const karten    = ref([]);
const geoeffnet = ref([]);

onMounted(async () => {
  const { data } = await axios.get('/groups/3a-deutsch/competence-levels');

  const anzahl = {};
  let gesamt = 0;
  for (const vg of [].concat(data)) {
    for (const cl of vg.competenceLevels ?? []) {
      const f = cl.descriptiveStatistics?.frequency ?? 0;
      anzahl[cl.nameShort] = (anzahl[cl.nameShort] ?? 0) + f;
      gesamt += f;
    }
  }
  const n = (stufe) => anzahl[stufe] ?? 0;
  const abMindest = gesamt - n('I');

  karten.value = [
    {
      id: 'verteilung',
      label: 'Kompetenzstufen',
      wert: gesamt,
      einheit: '',
      anteile: STUFEN.map(st => ({ label: st, wert: n(st), farbe: FARBEN[st] })),
      details: STUFEN.map(st => ({ label: \`Stufe \${st}\`, wert: n(st) })),
    },
    {
      id: 'ab-mindest',
      label: 'Mindeststandard und darüber',
      wert: gesamt ? Math.round((abMindest / gesamt) * 100) : 0,
      einheit: '%',
      anteile: [
        { label: 'erreicht', wert: abMindest, farbe: '#22c55e' },
        { label: 'nicht erreicht', wert: n('I'), farbe: '#ef4444' },
      ],
      details: [{ label: 'Schüler*innen', wert: abMindest }],
    },
  ];
});
<\/script>

<template>
  <Uebersichtskarten
    :karten="karten"
    :geoeffnet="geoeffnet"
    @karte-geoeffnet="e => (geoeffnet = e.geoeffnet)"
  />
</template>`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/competence-levels', pfad: 'ansichten.uebersicht.endpunkt' },
  ],
  apiNotePfad: 'ansichten.uebersicht.hinweis',
};

// Die Doku-Texte folgen der Sprachwahl, die technischen Angaben bleiben.
const propsDocs = computed(() =>
  DOCS.propsDocs.map(({ pfad, ...rest }) => ({ ...rest, description: t(pfad) }))
);
const apiEndpoints = computed(() =>
  DOCS.apiEndpoints.map(({ pfad, ...rest }) => ({ ...rest, description: t(pfad) }))
);

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

// Aus den Stufen werden drei Karten: die Verteilung selbst und die beiden
// Aussagen, auf die es in der Rückmeldung ankommt — erreicht und nicht
// erreicht. Der Ring trägt die Anteile, die Kennzahl steht in seinem Kern.
const karten = computed(() => {
  const gesamt = chartData.value.reduce((s, d) => s + d.count, 0);
  if (gesamt === 0) return [];
  const anzahl = (ns) => chartData.value.find((d) => d.level === ns)?.count ?? 0;
  const unter = anzahl('I');
  const ab = gesamt - unter;
  const anteil = (n) => Math.round((n / gesamt) * 100);

  return [
    {
      id: 'verteilung',
      label: t('ansichten.uebersicht.karten.verteilung'),
      wert: gesamt,
      einheit: '',
      anteile: chartData.value.map((d) => ({ label: d.level, wert: d.count, farbe: d.color })),
      details: chartData.value.map((d) => ({ label: `${d.level} · ${d.name}`, wert: d.count })),
    },
    {
      id: 'ab-mindeststandard',
      label: t('bausteine.uebersicht.abMindeststandard'),
      wert: anteil(ab),
      einheit: '%',
      anteile: [
        { label: t('bausteine.uebersicht.abMindeststandard'), wert: ab, farbe: LEVEL_COLORS.IV },
        { label: t('bausteine.uebersicht.unterMindeststandard'), wert: unter, farbe: '#e2e8f0' },
      ],
      details: [
        { label: t('bausteine.uebersicht.abMindeststandardZusatz', { n: ab }), wert: `${anteil(ab)} %` },
      ],
    },
    {
      id: 'unter-mindeststandard',
      label: t('bausteine.uebersicht.unterMindeststandard'),
      wert: anteil(unter),
      einheit: '%',
      anteile: [
        { label: t('bausteine.uebersicht.unterMindeststandard'), wert: unter, farbe: LEVEL_COLORS.I },
        { label: t('bausteine.uebersicht.abMindeststandard'), wert: ab, farbe: '#e2e8f0' },
      ],
      details: [
        { label: t('bausteine.uebersicht.unterMindeststandardZusatz', { n: unter }), wert: `${anteil(unter)} %` },
      ],
    },
  ];
});

const hasData = computed(() => karten.value.length > 0);

// Welche Karten aufgeklappt sind, hält die Ansicht — das Element meldet nur.
const geoeffnet = ref([]);
watch(() => selectedGroup.value, () => { geoeffnet.value = []; });
</script>

<template>
  <main class="view-main">
    <Card class="catalog-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="comp-name-row">
              <code class="comp-name">&lt;tba3-uebersichtskarten&gt;</code>
              <Tag :value="t('ansichten.gemeinsam.neu')" severity="contrast" />
            </div>
            <p class="comp-desc">
              <strong>{{ t('ansichten.uebersicht.titel') }}</strong><br />
              {{ t('ansichten.uebersicht.beschreibung') }}
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
            <label class="ctrl-label">{{ t('ansichten.gemeinsam.lerngruppe') }}</label>
            <Select
              v-model="selectedGroup"
              :options="GROUPS"
              option-label="label"
              :placeholder="t('ansichten.gemeinsam.gruppeWaehlen')"
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
          {{ t('ansichten.gemeinsam.mockHinweis', { fehler: error }) }}
        </Message>

        <Message v-else-if="!hasData" severity="info" :closable="false" class="mt-2">
          {{ t('ansichten.gemeinsam.keineDaten') }}
        </Message>

        <Uebersichtskarten
          v-else
          :karten="karten"
          :title="selectedGroup?.subject"
          :geoeffnet="geoeffnet"
          @karte-geoeffnet="(e) => (geoeffnet = e.geoeffnet)"
        />

        <ComponentDocs
          component-name="tba3-uebersichtskarten"
          :github-file="DOCS.githubFile"
          :github-path="DOCS.githubPath"
          :props-docs="propsDocs"
          :data-shape="DOCS.dataShape"
          :code-example="DOCS.codeExample"
          :api-endpoints="apiEndpoints"
          :api-note="t(DOCS.apiNotePfad)"
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
