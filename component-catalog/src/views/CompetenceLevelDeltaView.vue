<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import CompetenceLevelDeltaChart from '../components/CompetenceLevelDeltaChart.vue';
import ComponentDocs from '../components/ComponentDocs.vue';

// ── Docs metadata ───────────────────────────────────────────────────────────
const DOCS = {
  githubFile: 'CompetenceLevelDeltaChart.vue',
  propsDocs: [
    { name: 'title',       type: 'String', default: "''", description: 'Optionaler Titel über dem Chart (z. B. Domäne).' },
    { name: 'unavailable', type: 'String', default: "''", description: 'Optionaler Badge-Text (z. B. "Durchgang 2023/24 nicht verfügbar").' },
    { name: 'levels',      type: 'Array',  required: true, description: 'Reihenfolge der Kompetenzstufen auf der X-Achse, z. B. ["I","II","III","IV","V"].' },
    { name: 'school',      type: 'Object', required: true, description: '{ belowMin, upperLevels } — Aggregate für die Fokus-Schule/Gruppe (für Summary-Karten und Text).' },
    { name: 'comparisons', type: 'Array',  required: true, description: 'Alle Vergleichsoptionen. Aktive werden geplottet, disabled werden im Panel als "demnächst" angezeigt.' },
    { name: 'activeIds',   type: 'Array',  default: '[]',  description: 'IDs der aktiven Vergleiche. Über `update:activeIds`-Event aktualisierbar (v-model:active-ids).' },
  ],
  dataShape: `// comparisons-Element
{
  id: 'landesmittelwert',
  label: 'Landesmittelwert',
  deltas:       { I: -2, II: -3, III: -6, IV: 19, V: -6 },  // signed Pp
  belowMin:     16,    // % under Mindeststandard (für Card + Text)
  upperLevels:  50,    // % auf Stufen IV + V
  disabled:     false, // im Panel checkbar
}

// school
{ belowMin: 11, upperLevels: 69 }`,
  codeExample: `<script setup>
import { ref } from 'vue';
import CompetenceLevelDeltaChart from './components/CompetenceLevelDeltaChart.vue';

const active = ref(['landesmittelwert', '3b-deutsch']);
const comparisons = [
  { id: 'landesmittelwert', label: 'Landesmittelwert',
    deltas: { I: -2, II: -8, III: -6, IV: 19, V: -6 }, belowMin: 16, upperLevels: 50 },
  { id: '3b-deutsch', label: 'Klasse 3b',
    deltas: { I: +5, II: -4, III: -3, IV: 25, V: -15 }, belowMin: 8, upperLevels: 65 },
  { id: 'vergleichsschule', label: 'Vergleichsschule', disabled: true },
  { id: 'testheft',         label: 'Testheft',         disabled: true },
  { id: 'vergangene',       label: 'Vergangene Durchgänge', disabled: true },
];
<\/script>

<template>
  <CompetenceLevelDeltaChart
    title="Sprechen und Zuhören"
    unavailable="Durchgang 2023/24 nicht verfügbar"
    :levels="['I','II','III','IV','V']"
    :school="{ belowMin: 11, upperLevels: 69 }"
    :comparisons="comparisons"
    v-model:active-ids="active"
  />
</template>`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/competence-levels',  description: 'Verteilung der eigenen Lerngruppe (Fokus)' },
    { method: 'GET', path: '/groups/{peerId}/competence-levels', description: 'Parallel-Klassen für Peer-Vergleich (z. B. 3b, 3c …)' },
    { method: 'GET', path: '/states/{id}/competence-levels',  description: 'Bundeslandmittel + Testheft-Varianten' },
  ],
  apiNote: 'Pro Vergleich wird die Verteilung (mean ∈ [0,1]) je Kompetenzstufe der Fokusgruppe gegenübergestellt und in Prozentpunkten gerundet ausgegeben. Belowmin = Σ(I/Ia/Ib), upperLevels = Σ(IV+V).',
};

// ── Group catalog (mirrors mock-server seed) ───────────────────────────────
const GROUPS = [
  { id: '3a-deutsch', label: '3a Deutsch',    subject: 'DE', grade: 3, schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '3b-deutsch', label: '3b Deutsch',    subject: 'DE', grade: 3, schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '3c-deutsch', label: '3c Deutsch',    subject: 'DE', grade: 3, schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '8a-deutsch', label: '8a Deutsch',    subject: 'DE', grade: 8, schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
  { id: '3a-mathe',   label: '3a Mathematik', subject: 'MA', grade: 3, schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '3b-mathe',   label: '3b Mathematik', subject: 'MA', grade: 3, schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '3c-mathe',   label: '3c Mathematik', subject: 'MA', grade: 3, schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
];

const DOMAIN_NAMES = {
  ho: 'Hörverstehen',  // "Sprechen und Zuhören" in newer Bildungsstandards
  le: 'Leseverstehen',
  rs: 'Rechtschreibung',
  sr: 'Sprachgebrauch',
  ma: 'Mathematik',
};

const LEVEL_ORDER = ['I', 'II', 'III', 'IV', 'V'];

// ── State ───────────────────────────────────────────────────────────────────
const selectedGroup = ref(GROUPS[0]);
const loading = ref(false);
const error = ref(null);

const ownData = ref([]);     // per-domain → {nameShort: mean}
const stateData = ref([]);   // per-testheft, per-domain → {nameShort: mean}
const peerData = ref({});    // peerId → per-domain → {nameShort: mean}

const activeDomain = ref(null);
const activeIds = ref(['landesmittelwert']);

// ── Helpers ────────────────────────────────────────────────────────────────
const extractByDomain = (apiData) => {
  const result = {};
  for (const entry of (apiData || [])) {
    if (!entry) continue;
    const d = entry.domain?.name ?? entry.domain;
    if (!d) continue;
    if (!result[d]) result[d] = {};
    for (const cl of (entry.competenceLevels || [])) {
      result[d][cl.nameShort] = cl.descriptiveStatistics.mean;
    }
  }
  return result;
};

const extractByTestheft = (apiData) => {
  // Returns: { thId: { domain: { level: mean } } }
  const result = {};
  for (const entry of (apiData || [])) {
    if (!entry) continue;
    const th = entry.id ?? entry.name;
    const d = entry.domain?.name ?? entry.domain;
    if (!th || !d) continue;
    if (!result[th]) result[th] = {};
    if (!result[th][d]) result[th][d] = {};
    for (const cl of (entry.competenceLevels || [])) {
      result[th][d][cl.nameShort] = cl.descriptiveStatistics.mean;
    }
  }
  return result;
};

const averageOverTestheft = (perTh) => {
  const acc = {};
  for (const th of Object.keys(perTh)) {
    for (const d of Object.keys(perTh[th])) {
      if (!acc[d]) acc[d] = {};
      for (const [lvl, m] of Object.entries(perTh[th][d])) {
        if (!acc[d][lvl]) acc[d][lvl] = { sum: 0, n: 0 };
        acc[d][lvl].sum += m;
        acc[d][lvl].n += 1;
      }
    }
  }
  const out = {};
  for (const d of Object.keys(acc)) {
    out[d] = {};
    for (const [lvl, { sum, n }] of Object.entries(acc[d])) {
      out[d][lvl] = sum / n;
    }
  }
  return out;
};

const aggregateStats = (levelMap) => {
  if (!levelMap) return { belowMin: 0, upperLevels: 0 };
  const sum = (keys) => keys.reduce((s, k) => s + (levelMap[k] ?? 0), 0);
  return {
    belowMin:     Math.round(sum(['I', 'Ia', 'Ib']) * 100),
    upperLevels:  Math.round(sum(['IV', 'V']) * 100),
  };
};

const computeDeltas = (own, ref) => {
  const out = {};
  for (const lvl of Object.keys(own || {})) {
    if (ref?.[lvl] == null) continue;
    out[lvl] = Math.round((own[lvl] - ref[lvl]) * 100);
  }
  return out;
};

// ── Data fetching ───────────────────────────────────────────────────────────
const fetchAll = async () => {
  if (!selectedGroup.value) return;
  loading.value = true; error.value = null;
  try {
    const g = selectedGroup.value;
    const peers = GROUPS.filter(
      (p) => p.id !== g.id && p.subject === g.subject && p.grade === g.grade,
    );

    const [ownRes, stateRes, ...peerRes] = await Promise.all([
      axios.get(`/groups/${g.id}/competence-levels`),
      axios.get(`/states/${g.stateId}/competence-levels`),
      ...peers.map((p) => axios.get(`/groups/${p.id}/competence-levels`)),
    ]);

    ownData.value = extractByDomain(ownRes.data);
    stateData.value = extractByTestheft(stateRes.data);
    peerData.value = Object.fromEntries(
      peers.map((p, i) => [p.id, { meta: p, levels: extractByDomain(peerRes[i].data) }]),
    );

    // Pick first domain by default
    const domains = Object.keys(ownData.value);
    activeDomain.value = domains[0] ?? null;
  } catch (e) {
    error.value = e?.message ?? String(e);
    ownData.value = []; stateData.value = []; peerData.value = {};
  } finally {
    loading.value = false;
  }
};

watch(() => selectedGroup.value, fetchAll);
onMounted(fetchAll);

// ── Derived: available domains for tab strip ────────────────────────────────
const domains = computed(() => Object.keys(ownData.value));

// ── Derived: comparison rows for the active domain ──────────────────────────
const stateAvg = computed(() => averageOverTestheft(stateData.value));

const allComparisons = computed(() => {
  const dom = activeDomain.value;
  if (!dom) return [];

  const ownLevels = ownData.value[dom];
  if (!ownLevels) return [];

  const out = [];

  // 1. Landesmittelwert
  const stateLevels = stateAvg.value[dom];
  if (stateLevels) {
    out.push({
      id: 'landesmittelwert',
      label: 'Landesmittelwert',
      deltas: computeDeltas(ownLevels, stateLevels),
      ...aggregateStats(stateLevels),
    });
  }

  // 2. Peer groups (Parallel-Klassen)
  for (const [peerId, payload] of Object.entries(peerData.value)) {
    const peerLevels = payload.levels?.[dom];
    if (!peerLevels) continue;
    out.push({
      id: peerId,
      label: payload.meta.label,
      deltas: computeDeltas(ownLevels, peerLevels),
      ...aggregateStats(peerLevels),
    });
  }

  // 3. Testhefte (Bundesland-Variation)
  const testhefte = Object.keys(stateData.value);
  testhefte.forEach((thId, idx) => {
    const thLevels = stateData.value[thId]?.[dom];
    if (!thLevels) return;
    out.push({
      id: `th-${thId}`,
      label: `Testheft ${String(idx + 1).padStart(2, '0')}`,
      deltas: computeDeltas(ownLevels, thLevels),
      ...aggregateStats(thLevels),
    });
  });

  // 4. Disabled placeholders for not-yet-modelled comparisons
  out.push({ id: 'vergleichsschule', label: 'Vergleichsschule',     disabled: true });
  out.push({ id: 'vergangene',       label: 'Vergangene Durchgänge', disabled: true });

  return out;
});

const ownStats = computed(() => {
  const dom = activeDomain.value;
  return aggregateStats(ownData.value[dom]);
});

// Auto-prune activeIds when domain changes (drop stale peer IDs)
watch(allComparisons, (list) => {
  const validIds = new Set(list.filter((c) => !c.disabled).map((c) => c.id));
  activeIds.value = activeIds.value.filter((id) => validIds.has(id));
  if (activeIds.value.length === 0) {
    const first = list.find((c) => !c.disabled);
    if (first) activeIds.value = [first.id];
  }
});

const activeDomainLabel = computed(
  () => DOMAIN_NAMES[activeDomain.value] ?? activeDomain.value ?? '',
);
</script>

<template>
  <main class="view-main">
    <Card class="catalog-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="comp-name-row">
              <code class="comp-name">CompetenceLevelDeltaChart</code>
              <Tag value="Neu" severity="contrast" />
            </div>
            <p class="comp-desc">
              <strong>Differenz pro Kompetenzstufe — Schule vs. mehrere Benchmarks</strong><br />
              Gruppierte Balken (Pp.) je Stufe, dynamisches Auswahlpanel (+) für
              Landesmittelwert, Parallel-Klassen, Testheft-Varianten u. a. Inkl.
              Summary-Karten und Auto-Text pro aktivem Vergleich.
            </p>
            <div class="use-case-note use-case-api">
              <i class="pi pi-server" />
              <span>
                <code>/groups/{id}/competence-levels</code> ·
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
            <label class="ctrl-label">Lerngruppe (Fokus)</label>
            <Select v-model="selectedGroup" :options="GROUPS" option-label="label"
              placeholder="Gruppe wählen" class="ctrl-select" />
          </div>
          <div v-if="domains.length > 1" class="ctrl-field">
            <label class="ctrl-label">Domäne</label>
            <div class="domain-tabs">
              <button
                v-for="d in domains" :key="d"
                type="button"
                class="domain-tab"
                :class="{ 'is-active': d === activeDomain }"
                @click="activeDomain = d"
              >
                {{ DOMAIN_NAMES[d] ?? d }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="loading" class="skeleton-wrap">
          <Skeleton height="320px" class="mb-3" />
          <Skeleton height="80px" />
        </div>
        <Message v-else-if="error" severity="error" :closable="false" class="mt-2">
          {{ error }} — Läuft der Mock-Server bzw. ist der API-Proxy konfiguriert?
        </Message>
        <Message v-else-if="!activeDomain" severity="info" :closable="false" class="mt-2">
          Keine Domänen-Daten für diese Gruppe.
        </Message>

        <div v-else class="chart-wrap">
          <CompetenceLevelDeltaChart
            :title="activeDomainLabel"
            :levels="LEVEL_ORDER"
            :school="ownStats"
            :comparisons="allComparisons"
            v-model:active-ids="activeIds"
          />
        </div>

        <ComponentDocs
          component-name="CompetenceLevelDeltaChart"
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
.use-case-api code {
  font-size: 0.75rem; background: #e0f2fe; padding: 1px 4px; border-radius: 3px;
  font-family: ui-monospace, monospace;
}
.controls {
  display: flex; flex-wrap: wrap; gap: 12px 24px;
  margin-bottom: 20px; align-items: flex-start;
}
.ctrl-field { display: flex; flex-direction: column; gap: 5px; }
.ctrl-label {
  font-size: 0.74rem; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.ctrl-select { min-width: 210px; }
.domain-tabs { display: inline-flex; gap: 4px; }
.domain-tab {
  font-size: 0.85rem; padding: 6px 12px; border-radius: 999px;
  border: 1px solid #cbd5e1; background: #fff; color: #475569; cursor: pointer;
}
.domain-tab.is-active {
  background: #0f172a; color: #fff; border-color: #0f172a;
}
.skeleton-wrap { padding: 4px 0; }
.chart-wrap { padding: 4px 0; }
.mb-3 { margin-bottom: 12px; }
.mt-2 { margin-top: 8px; }
</style>
