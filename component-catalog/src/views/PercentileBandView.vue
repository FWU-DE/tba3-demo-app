<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import PercentileBandChart from '../components/PercentileBandChart.vue';
import ComponentDocs from '../components/ComponentDocs.vue';

const DOCS = {
  githubFile: 'PercentileBandChart.vue',
  propsDocs: [
    { name: 'items',       type: 'Array',  required: true,  description: 'Ein Eintrag pro Aufgabe: { id, label, markerY, bandLow, bandMean, bandHigh }. Alle Werte in %. Aufgaben werden in der gegebenen Reihenfolge von oben nach unten dargestellt.' },
    { name: 'title',       type: 'String', default: "''",   description: 'Titel über dem Diagramm.' },
    { name: 'markerLabel', type: 'String', default: "'Schüler*in'", description: 'Legendenbezeichnung für den Diamant-Marker.' },
    { name: 'bandLabel',   type: 'String', default: "'Streuungsband (MW ± 1 SD)'", description: 'Legendenbezeichnung für das Referenzband.' },
    { name: 'xAxisLabel',  type: 'String', default: "'Lösungshäufigkeit (%)'", description: 'Beschriftung der X-Achse.' },
  ],
  dataShape: `// items-Element
{
  id:        'DE_V3_LE_026',
  label:     'LE-026 (III)',   // Anzeigename auf der Y-Achse
  markerY:   62.4,             // Wert des Diamant-Markers (Klasse oder Schüler:in), 0–100
  bandLow:   48.0,             // Untere Bandgrenze (z. B. MW − 1 SD), 0–100
  bandMean:  58.1,             // Bandmittellinie (z. B. Schulmedian), 0–100
  bandHigh:  68.2,             // Obere Bandgrenze (z. B. MW + 1 SD), 0–100
}`,
  codeExample: `<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import PercentileBandChart from './components/PercentileBandChart.vue';

const items = ref([]);

onMounted(async () => {
  const [gRes, sRes] = await Promise.all([
    axios.get('/groups/3a-deutsch/items'),
    axios.get('/schools/gs-musterstadt/items'),
  ]);

  const schoolMap = new Map(
    sRes.data.flatMap(vg => vg.items ?? []).map(it => [it.iqbId, it])
  );

  const parts = (iqbId) => {
    const ps = (iqbId ?? '').split('-');
    return ps.length >= 2 ? ps.slice(-2).join('-') : iqbId;
  };

  items.value = gRes.data
    .flatMap(vg => vg.items ?? [])
    .map(item => {
      const school = schoolMap.get(item.iqbId) ?? {};
      const mean   = v => (v?.descriptiveStatistics?.mean ?? 0) * 100;
      const sd     = v => (v?.descriptiveStatistics?.sd   ?? 0.1) * 100;
      const sm     = mean(school);
      const ss     = sd(school);
      const lvl    = item.parameters?.competenceLevel?.nameShort ?? '';
      return {
        id:       item.iqbId,
        label:    lvl ? \`\${parts(item.iqbId)} (\${lvl})\` : parts(item.iqbId),
        markerY:  mean(item),
        bandLow:  Math.max(0, sm - ss),
        bandMean: sm,
        bandHigh: Math.min(100, sm + ss),
      };
    });
});
<\/script>

<template>
  <PercentileBandChart
    :items="items"
    title="3a Deutsch — Klasse vs. Schule"
    marker-label="Klasse 3a"
    band-label="Schule ± 1 SD"
    x-axis-label="Lösungshäufigkeit (%)"
  />
</template>`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/items',              description: 'Lösungsquoten der Lerngruppe pro Aufgabe (markerY)' },
    { method: 'GET', path: '/schools/{id}/items',             description: 'Schulweite Lösungsquoten für Band (MW ± SD)' },
    { method: 'GET', path: '/states/{id}/items',              description: 'Bundeslandweite Lösungsquoten für Band (Variante 2)' },
    { method: 'GET', path: '/groups/{id}/items?type=students','description': 'Schülerdaten für Perzentilrang-Modus (Schüler:in vs. Klasse)' },
  ],
  apiNote: 'Für den Klasse-vs.-Schule-Modus: Gruppe fetchen (markerY) + Schule fetchen (Band). Für den Schüler:in-Perzentil-Modus: ?type=students fetchen, Rang der ausgewählten Person berechnen.',
};

// ── Shared config ─────────────────────────────────────────────────────────────
const GROUPS = [
  { id: '3a-deutsch', label: '3a Deutsch',    schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '3b-deutsch', label: '3b Deutsch',    schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '3c-deutsch', label: '3c Deutsch',    schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '8a-deutsch', label: '8a Deutsch',    schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
  { id: '8b-deutsch', label: '8b Deutsch',    schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
  { id: '3a-mathe',   label: '3a Mathematik', schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '8a-mathe',   label: '8a Mathematik', schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
  { id: '8a-englisch', label: '8a Englisch',  schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
];

const SCHOOLS = [
  { id: 'gs-musterstadt',    label: 'Grundschule Musterstadt',   stateId: 'beispielland' },
  { id: 'gym-beispielstadt', label: 'Gymnasium Beispielstadt',   stateId: 'beispielland' },
];

const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

const formatLabel = (item) => {
  const parts = (item.iqbId ?? '').split('-');
  const shortId = parts.length >= 2 ? parts.slice(-2).join('-') : (item.exercise?.name ?? '').toUpperCase().replace('_', '-');
  const lvl = item.parameters?.competenceLevel?.nameShort ?? '';
  return lvl ? `${shortId} (${lvl})` : shortId;
};

const byExercise = (valueGroups) => {
  const map = new Map();
  for (const vg of valueGroups) {
    for (const item of vg.items ?? []) {
      const ex = item.exercise?.name ?? item.iqbId;
      if (!map.has(ex)) map.set(ex, { items: [], refItem: item });
      map.get(ex).items.push(item);
    }
  }
  return map;
};

// Sort by band midpoint descending → band flows right→left top→bottom (the "river" effect)
const sortByBand = (rows) => rows.sort((a, b) => {
  const midA = (a.bandLeft + a.bandRight) / 2;
  const midB = (b.bandLeft + b.bandRight) / 2;
  return midB - midA;
});

const buildRows = (diamondExercises, bandExercises) => {
  const rows = [];
  for (const [exName, dex] of diamondExercises) {
    const bex = bandExercises.get(exName);
    if (!bex) continue;
    const diamondMean = avg(dex.items.map((i) => i.descriptiveStatistics?.mean ?? 0));
    const bandMean = avg(bex.items.map((i) => i.descriptiveStatistics?.mean ?? 0));
    const bandSD = avg(bex.items.map((i) => i.descriptiveStatistics?.standardDeviation ?? 0));
    rows.push({
      label: formatLabel(dex.refItem),
      bandLeft:  Math.max(0,   (bandMean - bandSD) * 100),
      bandRight: Math.min(100, (bandMean + bandSD) * 100),
      studentScore: diamondMean * 100,
    });
  }
  return sortByBand(rows);
};

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Klasse vs. Schule (Lösungshäufigkeit)
// ════════════════════════════════════════════════════════════════════════════════
const s1Group = ref(GROUPS[0]);
const s1Loading = ref(false);
const s1Error = ref(null);
const s1GroupVGs = ref([]);
const s1SchoolVGs = ref([]);

const fetchS1 = async () => {
  if (!s1Group.value) return;
  s1Loading.value = true; s1Error.value = null;
  try {
    const [gRes, sRes] = await Promise.all([
      axios.get(`/groups/${s1Group.value.id}/items`),
      axios.get(`/schools/${s1Group.value.schoolId}/items`),
    ]);
    s1GroupVGs.value = Array.isArray(gRes.data) ? gRes.data : [gRes.data];
    s1SchoolVGs.value = Array.isArray(sRes.data) ? sRes.data : [sRes.data];
  } catch (e) {
    s1Error.value = e.message; s1GroupVGs.value = []; s1SchoolVGs.value = [];
  } finally { s1Loading.value = false; }
};
watch(() => s1Group.value, fetchS1);
onMounted(fetchS1);

const s1Items = computed(() =>
  buildRows(byExercise(s1GroupVGs.value), byExercise(s1SchoolVGs.value))
);

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Schule vs. Bundesland (Lösungshäufigkeit)
// Diamond = school aggregate, Band = state aggregate
// Both pre-computed by the API — no granular student data needed
// ════════════════════════════════════════════════════════════════════════════════
const s2School = ref(SCHOOLS[0]);
const s2Loading = ref(false);
const s2Error = ref(null);
const s2SchoolVGs = ref([]);
const s2StateVGs = ref([]);

const fetchS2 = async () => {
  if (!s2School.value) return;
  s2Loading.value = true; s2Error.value = null;
  try {
    const [sRes, stRes] = await Promise.all([
      axios.get(`/schools/${s2School.value.id}/items`),
      axios.get(`/states/${s2School.value.stateId}/items`),
    ]);
    s2SchoolVGs.value = Array.isArray(sRes.data) ? sRes.data : [sRes.data];
    s2StateVGs.value = Array.isArray(stRes.data) ? stRes.data : [stRes.data];
  } catch (e) {
    s2Error.value = e.message; s2SchoolVGs.value = []; s2StateVGs.value = [];
  } finally { s2Loading.value = false; }
};
watch(() => s2School.value, fetchS2);
onMounted(fetchS2);

const s2Items = computed(() =>
  buildRows(byExercise(s2SchoolVGs.value), byExercise(s2StateVGs.value))
);

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 3 — Schüler*in Perzentilrang
// Computes true percentile rank per exercise from all student responses
// ════════════════════════════════════════════════════════════════════════════════
const BAND_RANGES = [
  { label: 'P25–P75 (Interquartil, 50%-Bereich)',  value: '25-75' },
  { label: 'P10–P90 (80%-Bereich)',                value: '10-90' },
  { label: 'P5–P95 (90%-Bereich)',                 value: '5-95'  },
];

const s3Group = ref(GROUPS[0]);
const s3StudentId = ref(null);
const s3BandRange = ref(BAND_RANGES[0]);
const s3Loading = ref(false);
const s3Error = ref(null);
const s3AllVGs = ref([]);

const fetchS3 = async () => {
  if (!s3Group.value) return;
  s3Loading.value = true; s3Error.value = null;
  try {
    const res = await axios.get(`/groups/${s3Group.value.id}/items?type=students`);
    s3AllVGs.value = Array.isArray(res.data) ? res.data : [res.data];
  } catch (e) {
    s3Error.value = e.message; s3AllVGs.value = [];
  } finally { s3Loading.value = false; }
};
watch(() => s3Group.value, fetchS3);
onMounted(fetchS3);

const s3Students = computed(() => {
  const seen = new Set();
  return s3AllVGs.value
    .filter((vg) => vg.type === 'student' && !seen.has(vg.id) && seen.add(vg.id))
    .map((vg) => ({ id: vg.id, name: vg.name }));
});
watch(s3Students, (list) => {
  if (list.length && !list.find((s) => s.id === s3StudentId.value))
    s3StudentId.value = list[0].id;
});
const s3Student = computed({
  get: () => s3Students.value.find((s) => s.id === s3StudentId.value) ?? null,
  set: (s) => { s3StudentId.value = s?.id ?? null; },
});

// Per-student exercise scores
const s3ExerciseScores = computed(() => {
  const byStudent = new Map();
  for (const vg of s3AllVGs.value) {
    if (vg.type !== 'student') continue;
    if (!byStudent.has(vg.id)) byStudent.set(vg.id, new Map());
    const sMap = byStudent.get(vg.id);
    for (const [exName, ex] of byExercise([vg])) {
      const score = avg(ex.items.map((i) => i.descriptiveStatistics?.mean ?? 0));
      sMap.set(exName, sMap.has(exName) ? (sMap.get(exName) + score) / 2 : score);
    }
  }
  return byStudent;
});

const s3ExMeta = computed(() => {
  const meta = new Map();
  for (const vg of s3AllVGs.value)
    for (const item of vg.items ?? []) {
      const ex = item.exercise?.name ?? item.iqbId;
      if (!meta.has(ex)) meta.set(ex, { refItem: item });
    }
  return meta;
});

const s3Items = computed(() => {
  void s3BandRange.value; // reactive dependency
  if (!s3StudentId.value || !s3ExerciseScores.value.size) return [];
  const myScores = s3ExerciseScores.value.get(s3StudentId.value);
  if (!myScores) return [];

  const allStudentMaps = [...s3ExerciseScores.value.values()];
  const rows = [];

  for (const [exName, meta] of s3ExMeta.value) {
    const myScore = myScores.get(exName);
    if (myScore === undefined) continue;

    const allScores = allStudentMaps
      .map((m) => m.get(exName))
      .filter((s) => s !== undefined)
      .sort((a, b) => a - b);
    if (allScores.length < 2) continue;

    const n = allScores.length;
    const scoreToPct = (s) => {
      const below = allScores.filter((x) => x < s).length;
      const tied  = allScores.filter((x) => x === s).length;
      return ((below + tied * 0.5) / n) * 100;
    };

    const [loQ, hiQ] = (s3BandRange.value?.value ?? '25-75').split('-').map(Number);
    const myPct   = scoreToPct(myScore);
    const p25pct  = scoreToPct(allScores[Math.floor(n * loQ / 100)]);
    const p75pct  = scoreToPct(allScores[Math.min(Math.floor(n * hiQ / 100), n - 1)]);

    rows.push({
      label: formatLabel(meta.refItem),
      bandLeft:  Math.min(p25pct, p75pct),
      bandRight: Math.max(p25pct, p75pct),
      studentScore: myPct,
    });
  }

  return sortByBand(rows);
});
</script>

<template>
  <main class="view-main">

    <!-- ── Section 1: Klasse vs. Schule ───────────────────────────────── -->
    <Card class="catalog-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="comp-name-row">
              <code class="comp-name">PercentileBandChart</code>
              <Tag value="Beispiel 1" severity="success" />
            </div>
            <p class="comp-desc">
              <strong>Klasse vs. Schule — Lösungshäufigkeit</strong><br />
              Diamant = Lösungshäufigkeit der Klasse pro Aufgabe.
              Band = Schulverteilung (MW&nbsp;±&nbsp;1&nbsp;SD) als Referenz.
              Aufgaben sortiert nach Bandmitte, sodass das Band als „blauer Fluss" von oben-rechts nach unten-links fließt.
            </p>
            <div class="use-case-note">
              <i class="pi pi-check-circle" />
              Sinnvoll für Aggregate: beide Seiten sind Mittelwerte, kein Einzelpersonenvergleich.
            </div>
          </div>
          <Tag value="SVG" severity="info" />
        </div>
      </template>
      <template #content>
        <div class="controls">
          <div class="ctrl-field">
            <label class="ctrl-label">Lerngruppe</label>
            <Select v-model="s1Group" :options="GROUPS" option-label="label"
              placeholder="Gruppe wählen" class="ctrl-select" />
          </div>
          <div class="ctrl-field">
            <label class="ctrl-label">Referenz (Schule)</label>
            <div class="ctrl-derived">
              <i class="pi pi-link" style="font-size:0.8rem" />
              {{ s1Group?.schoolId }}
            </div>
          </div>
        </div>
        <div v-if="s1Loading" class="skeleton-wrap">
          <Skeleton v-for="n in 14" :key="n" height="22px" class="mb-1" />
        </div>
        <Message v-else-if="s1Error" severity="error" :closable="false" class="mt-2">{{ s1Error }}</Message>
        <Message v-else-if="!s1Items.length" severity="info" :closable="false" class="mt-2">Keine übereinstimmenden Aufgaben.</Message>
        <div v-else class="chart-wrap">
          <PercentileBandChart
            :items="s1Items"
            :title="s1Group?.label"
            marker-label="Klassenmittelwert"
            band-label="Schulverteilung (MW ± 1 SD)"
            x-axis-label="Lösungshäufigkeit (%)"
          />
        </div>
      </template>
    </Card>

    <!-- ── Section 2: Schule vs. Bundesland ──────────────────────────── -->
    <Card class="catalog-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="comp-name-row">
              <code class="comp-name">PercentileBandChart</code>
              <Tag value="Beispiel 2" severity="secondary" />
            </div>
            <p class="comp-desc">
              <strong>Schule vs. Bundesland — Lösungshäufigkeit</strong><br />
              Diamant = schulweite Lösungshäufigkeit pro Aufgabe.
              Band = Landesverteilung (MW&nbsp;±&nbsp;1&nbsp;SD) als Referenz.
              Beide Werte kommen direkt aus den API-Endpunkten — keine granularen Schülerdaten nötig.
            </p>
            <div class="use-case-note use-case-api">
              <i class="pi pi-server" />
              <span>
                <code>/schools/{id}/items</code> → Diamant &nbsp;·&nbsp;
                <code>/states/{id}/items</code> → Band (Referenz).
                API liefert MW&nbsp;+&nbsp;SD fertig aggregiert.
              </span>
            </div>
          </div>
          <Tag value="SVG" severity="info" />
        </div>
      </template>
      <template #content>
        <div class="controls">
          <div class="ctrl-field">
            <label class="ctrl-label">Schule</label>
            <Select v-model="s2School" :options="SCHOOLS" option-label="label"
              placeholder="Schule wählen" class="ctrl-select" />
          </div>
          <div class="ctrl-field">
            <label class="ctrl-label">Referenz (Bundesland)</label>
            <div class="ctrl-derived">
              <i class="pi pi-link" style="font-size:0.8rem" />
              {{ s2School?.stateId }}
            </div>
          </div>
        </div>
        <div v-if="s2Loading" class="skeleton-wrap">
          <Skeleton v-for="n in 14" :key="n" height="22px" class="mb-1" />
        </div>
        <Message v-else-if="s2Error" severity="error" :closable="false" class="mt-2">{{ s2Error }}</Message>
        <Message v-else-if="!s2Items.length" severity="info" :closable="false" class="mt-2">Keine Daten.</Message>
        <div v-else class="chart-wrap">
          <PercentileBandChart
            :items="s2Items"
            :title="s2School?.label"
            marker-label="Schulmittelwert"
            band-label="Landesverteilung (MW ± 1 SD)"
            x-axis-label="Lösungshäufigkeit (%)"
          />
        </div>
      </template>
    </Card>

    <!-- ── Section 3: Schüler*in Perzentilrang ───────────────────────── -->
    <Card class="catalog-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="comp-name-row">
              <code class="comp-name">PercentileBandChart</code>
              <Tag value="Beispiel 3" severity="warning" />
            </div>
            <p class="comp-desc">
              <strong>Schüler*in Perzentilrang</strong><br />
              X-Achse = Perzentilrang (0&nbsp;=&nbsp;schwächste, 100&nbsp;=&nbsp;stärkste Leistung in der Klasse).
              Diamant = Rangposition der Schüler*in pro Aufgabe.
              Band = Interquartilsbereich P25–P75 aller Klassenmitglieder.
              Aufgaben sortiert nach Band-Mitte für den Fluss-Effekt.
            </p>
            <div class="use-case-note">
              <i class="pi pi-info-circle" />
              Sinnvoll für Einzelpersonen, weil die X-Achse relativer Rang ist, kein absoluter Score.
            </div>
          </div>
          <Tag value="SVG" severity="info" />
        </div>
      </template>
      <template #content>
        <div class="controls">
          <div class="ctrl-field">
            <label class="ctrl-label">Lerngruppe</label>
            <Select v-model="s3Group" :options="GROUPS" option-label="label"
              placeholder="Gruppe wählen" class="ctrl-select" />
          </div>
          <div class="ctrl-field">
            <label class="ctrl-label">Schüler*in</label>
            <Select v-model="s3Student" :options="s3Students" option-label="name"
              placeholder="Schüler*in wählen" :disabled="!s3Students.length || s3Loading"
              class="ctrl-select" />
          </div>
          <div class="ctrl-field">
            <label class="ctrl-label">Band (Referenzbereich)</label>
            <Select v-model="s3BandRange" :options="BAND_RANGES" option-label="label"
              class="ctrl-select-wide" />
          </div>
        </div>
        <div v-if="s3Loading" class="skeleton-wrap">
          <Skeleton v-for="n in 14" :key="n" height="22px" class="mb-1" />
        </div>
        <Message v-else-if="s3Error" severity="error" :closable="false" class="mt-2">{{ s3Error }}</Message>
        <div v-else-if="s3Items.length" class="chart-wrap">
          <PercentileBandChart
            :items="s3Items"
            :title="s3Group?.label"
            :marker-label="s3Student?.name ?? 'Schüler*in'"
            :band-label="`Klasse (${s3BandRange?.label?.split(' ')[0] ?? 'P25–P75'})`"
            x-axis-label="Perzentilrang in der Klasse"
          />
        </div>

        <ComponentDocs
          component-name="PercentileBandChart"
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
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.catalog-card { border-radius: 10px; }

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 0;
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
  display: flex; flex-wrap: wrap; gap: 12px 24px; margin-bottom: 20px;
}
.ctrl-field { display: flex; flex-direction: column; gap: 5px; }
.ctrl-label {
  font-size: 0.74rem; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.ctrl-select { min-width: 210px; }
.ctrl-select-wide { min-width: 280px; }
.ctrl-derived {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.85rem; color: #475569; background: #f8fafc;
  border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px;
  min-width: 210px; height: 38px;
}

.chart-wrap { overflow-x: auto; }
.skeleton-wrap { padding: 4px 0; }
.mb-1 { margin-bottom: 4px; }
.mt-2 { margin-top: 8px; }
</style>
