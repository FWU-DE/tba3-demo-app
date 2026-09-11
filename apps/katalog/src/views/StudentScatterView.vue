<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import StudentScatterPlot from '../components/StudentScatterPlot.vue';
import ComponentDocs from '../components/ComponentDocs.vue';

const DOCS = {
  githubFile: 'StudentScatterPlot.vue',
  propsDocs: [
    { name: 'students',   type: 'Array',  required: true,  description: 'Schülerliste: { id, initials, name, x (Kompetenzstufe 1–5), y (Rohwert % 0–100), details: [{ domain, pct, levelX }] }' },
    { name: 'groupLabel', type: 'String', default: "''",   description: 'Gruppenbezeichnung für den Diagrammtitel.' },
  ],
  dataShape: `// students-Element
{
  id:       'st-3a-deutsch-0',
  initials: 'LB',           // 2-Buchstaben-Kürzel für den Avatar
  name:     'Leon Braun',
  x:        2.3,            // Kompetenzstufen-X (1–5, darf Dezimal sein)
  y:        47.5,           // Rohwert-Prozent (0–100)
  details: [
    { domain: 'le', pct: 52.0, levelX: 2 },
    { domain: 'ho', pct: 44.0, levelX: 3 },
  ],
}`,
  codeExample: `<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import StudentScatterPlot from './components/StudentScatterPlot.vue';

const students = ref([]);

const LEVEL_BREAKS = [0, 0.14, 0.38, 0.73, 0.91, 1.0]; // Grenzwerte Stufen I–V

const scoreToLevel = (pct) => {
  const frac = pct / 100;
  return LEVEL_BREAKS.findIndex((b, i) => frac < LEVEL_BREAKS[i + 1]) + 1 || 5;
};

onMounted(async () => {
  const { data } = await axios.get('/groups/3a-deutsch/items?type=students');

  // data ist Array von Value-Groups mit type='student'
  const byStudent = new Map();
  for (const vg of [].concat(data)) {
    if (vg.type !== 'student') continue;
    const id = vg.id ?? vg.studentId;
    if (!byStudent.has(id)) byStudent.set(id, { id, vgs: [] });
    byStudent.get(id).vgs.push(vg);
  }

  students.value = [...byStudent.entries()].map(([id, { vgs }], idx) => {
    const allMeans = vgs.flatMap(vg =>
      (vg.items ?? []).map(it => it.descriptiveStatistics?.mean ?? 0)
    );
    const overallPct = allMeans.length
      ? (allMeans.reduce((a, b) => a + b, 0) / allMeans.length) * 100
      : 0;
    const initials = (vgs[0]?.name ?? \`S\${idx + 1}\`).split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    const details = vgs.map(vg => {
      const domainMeans = (vg.items ?? []).map(it => it.descriptiveStatistics?.mean ?? 0);
      const pct = domainMeans.length ? (domainMeans.reduce((a, b) => a + b, 0) / domainMeans.length) * 100 : 0;
      return { domain: vg.domain?.name ?? vg.domain ?? '', pct, levelX: scoreToLevel(pct) };
    });
    return { id, initials, name: vgs[0]?.name ?? id, x: scoreToLevel(overallPct), y: overallPct, details };
  });
});
<\/script>

<template>
  <StudentScatterPlot
    :students="students"
    group-label="Klasse 3a"
  />
</template>`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/items?type=students', description: 'Schülerindividuelle Item-Lösungsquoten — Basis für X/Y-Position im Scatter' },
  ],
  apiNote: 'Der ?type=students-Parameter liefert Value-Groups mit type="student". x wird aus dem Gesamtscore → Kompetenzstufe abgeleitet; y ist der rohe Prozentsatz. K-Means-Clustering und Konvex-Hüllen werden komponentenintern berechnet.',
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

const selectedGroup = ref(GROUPS[0]);
const loading = ref(false);
const error = ref(null);
const rawVGs = ref([]);

const fetchData = async () => {
  if (!selectedGroup.value) return;
  loading.value = true; error.value = null;
  try {
    const res = await axios.get(`/groups/${selectedGroup.value.id}/items?type=students`);
    rawVGs.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    error.value = e.message; rawVGs.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => selectedGroup.value, fetchData);
onMounted(fetchData);

// ── Derive initials + pretty name from codename ────────────────────────────────
const toName = (code) => {
  const parts = String(code ?? '').split('.').filter(p => isNaN(p));
  return parts.slice(0, 2).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
};
const toInitials = (code) => {
  const parts = String(code ?? '').split('.').filter(p => isNaN(p));
  return parts.slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('');
};

// ── bistaPoints → x (0–5 scale) ────────────────────────────────────────────────
// Calibration: bista 270 → 0 (far below I), bista 540 → 4.9 (top of V)
const bistaToX = (bista) => Math.max(0, Math.min(5, (bista - 270) / 55));

// ── Process VGs → one student per ID ─────────────────────────────────────────
const students = computed(() => {
  if (!rawVGs.value.length) return [];

  // Group value groups by student ID
  const byId = new Map();
  for (const vg of rawVGs.value) {
    const id = vg.id;
    if (!byId.has(id)) byId.set(id, { id, name: vg.name, vgs: [] });
    byId.get(id).vgs.push(vg);
  }

  const result = [];
  for (const { id, name, vgs } of byId.values()) {
    // Collect all items across domains
    const allItems = [];
    const domainItems = new Map(); // domain → items[]

    for (const vg of vgs) {
      const domain = vg.domain?.name ?? 'unknown';
      const items = vg.items ?? [];
      allItems.push(...items);
      if (!domainItems.has(domain)) domainItems.set(domain, []);
      domainItems.get(domain).push(...items);
    }

    if (!allItems.length) continue;

    // Overall raw score: mean of all binary responses
    const y = allItems.reduce((s, it) => s + (it.descriptiveStatistics?.mean ?? 0), 0) / allItems.length * 100;

    // X (competence level): mean bistaPoints of correctly answered items
    const correctItems = allItems.filter(it => (it.descriptiveStatistics?.mean ?? 0) >= 0.5);
    let x;
    if (correctItems.length === 0) {
      // No correct items — place at very start, jitter by raw score
      x = Math.max(0.05, y / 100 * 0.8);
    } else {
      const meanBista = correctItems.reduce((s, it) => s + (it.parameters?.bistaPoints ?? 400), 0) / correctItems.length;
      x = bistaToX(meanBista);
    }

    // Per-domain details
    const details = [];
    for (const [domain, items] of domainItems) {
      const pct = items.reduce((s, it) => s + (it.descriptiveStatistics?.mean ?? 0), 0) / items.length * 100;
      const correct = items.filter(it => (it.descriptiveStatistics?.mean ?? 0) >= 0.5);
      const levelX = correct.length
        ? bistaToX(correct.reduce((s, it) => s + (it.parameters?.bistaPoints ?? 400), 0) / correct.length)
        : 0;
      details.push({ domain, pct, levelX });
    }

    result.push({ id, name: toName(name), initials: toInitials(name), x, y, details });
  }

  return result;
});
</script>

<template>
  <main class="view-main">
    <Card class="catalog-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="comp-name-row">
              <code class="comp-name">StudentScatterPlot</code>
              <Tag value="Neu" severity="contrast" />
            </div>
            <p class="comp-desc">
              <strong>Schüler*innen-Scatter: Kompetenzstufe × Rohwert</strong><br />
              Jede Schüler*in als Punkt (Initialen). K-Means-Clustering mit konfigurierbarer Clusteranzahl.
              Klick auf Punkt zeigt Detailcard mit Gesamtwert und Teilkompetenzen.
            </p>
            <div class="use-case-note use-case-api">
              <i class="pi pi-server" />
              <span><code>/groups/{id}/items?type=students</code></span>
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
        </div>

        <div v-if="loading" class="skeleton-wrap">
          <Skeleton height="460px" />
        </div>
        <Message v-else-if="error" severity="error" :closable="false" class="mt-2">
          {{ error }} — Läuft der Mock-Server auf localhost:8000?
        </Message>
        <Message v-else-if="!students.length" severity="info" :closable="false" class="mt-2">
          Keine Schüler*innen-Daten.
        </Message>

        <StudentScatterPlot
          v-else
          :students="students"
          :group-label="selectedGroup?.label ?? ''"
        />

        <ComponentDocs
          component-name="StudentScatterPlot"
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
.view-main { max-width: 1100px; margin: 28px auto; padding: 0 20px; }
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
  display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #0369a1;
  background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 5px; padding: 5px 10px;
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
.mt-2 { margin-top: 8px; }
</style>
