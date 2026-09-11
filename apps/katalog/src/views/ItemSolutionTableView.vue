<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import ItemSolutionTable from '../components/ItemSolutionTable.vue';
import ComponentDocs from '../components/ComponentDocs.vue';

const DOCS = {
  githubFile: 'ItemSolutionTable.vue',
  propsDocs: [
    { name: 'rows',        type: 'Array',  required: true,  description: 'Aufgabenzeilen. Jede Zeile enthält iqbId, exercise, title, domain, competenceLevel, competenceType, classP, schoolP, stateP (alle % als 0–100).' },
    { name: 'groupLabel',  type: 'String', default: "'Klasse'",     description: 'Bezeichnung für die Klassen-Spalte und Legende.' },
    { name: 'schoolLabel', type: 'String', default: "'Schule'",     description: 'Bezeichnung für die Schul-Spalte.' },
    { name: 'stateLabel',  type: 'String', default: "'Bundesland'", description: 'Bezeichnung für die Bundesland-Spalte.' },
  ],
  dataShape: `// rows-Element
{
  iqbId:           'DE_V3_LE_026',        // IQB-Aufgaben-ID
  exercise:        'LE-026',              // Aufgabennummer
  title:           'Bilderbuch',          // optionaler Aufgabentitel
  domain:          'le',                  // Domänen-Kürzel (ho, le, sr, ma, en, fr)
  competenceLevel: 'III',                 // Kompetenzstufe (I–V)
  competenceType:  'Leseverstehen',       // optional
  classP:          62.4,                  // Klassen-Lösungsquote 0–100
  schoolP:         58.1,                  // Schul-Lösungsquote (null = ausgeblendet)
  stateP:          55.0,                  // Bundesland-Lösungsquote (null = ausgeblendet)
}`,
  codeExample: `<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import ItemSolutionTable from './components/ItemSolutionTable.vue';

const tableRows = ref([]);

onMounted(async () => {
  const [gRes, sRes, stRes] = await Promise.all([
    axios.get('/groups/3a-deutsch/items'),
    axios.get('/schools/gs-musterstadt/items'),
    axios.get('/states/beispielland/items'),
  ]);

  // Index school + state by iqbId for O(1) lookup
  const schoolMap = new Map(
    sRes.data.flatMap(vg => vg.items ?? []).map(it => [it.iqbId, it])
  );
  const stateMap = new Map(
    stRes.data.flatMap(vg => vg.items ?? []).map(it => [it.iqbId, it])
  );

  const mean = it => (it?.descriptiveStatistics?.mean ?? null);

  tableRows.value = gRes.data.flatMap(vg =>
    (vg.items ?? []).map(item => ({
      iqbId:           item.iqbId,
      exercise:        item.exercise?.name ?? item.iqbId,
      title:           item.exercise?.title ?? null,
      domain:          item.parameters?.domain ?? vg.domain?.name ?? null,
      competenceLevel: item.parameters?.competenceLevel?.nameShort ?? null,
      competenceType:  item.parameters?.competences?.find(c => c.type === 'Kompetenz')?.name ?? null,
      classP:          mean(item) != null ? mean(item) * 100 : null,
      schoolP:         mean(schoolMap.get(item.iqbId)) != null ? mean(schoolMap.get(item.iqbId)) * 100 : null,
      stateP:          mean(stateMap.get(item.iqbId)) != null ? mean(stateMap.get(item.iqbId)) * 100 : null,
    }))
  );
});
<\/script>

<template>
  <ItemSolutionTable
    :rows="tableRows"
    group-label="Klasse 3a"
    school-label="Schule"
    state-label="Bundesland"
  />
</template>`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/items',  description: 'Lösungsstatistiken aller Aufgaben der Lerngruppe' },
    { method: 'GET', path: '/schools/{id}/items', description: 'Schulweite Lösungsstatistiken (Referenz)' },
    { method: 'GET', path: '/states/{id}/items',  description: 'Bundeslandweite Lösungsstatistiken (Referenz)' },
  ],
  apiNote: 'Alle drei Endpunkte parallel fetchen und per iqbId joinen. descriptiveStatistics.mean ist ein Wert 0–1, muss mit ×100 in Prozent umgerechnet werden.',
};

const GROUPS = [
  { id: '3a-deutsch',  label: '3a Deutsch',     schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '3b-deutsch',  label: '3b Deutsch',     schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '3c-deutsch',  label: '3c Deutsch',     schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '8a-deutsch',  label: '8a Deutsch',     schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
  { id: '3a-mathe',    label: '3a Mathematik',  schoolId: 'gs-musterstadt',    stateId: 'beispielland' },
  { id: '8a-mathe',    label: '8a Mathematik',  schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
  { id: '8a-englisch', label: '8a Englisch',    schoolId: 'gym-beispielstadt', stateId: 'beispielland' },
];

const selectedGroup = ref(GROUPS[0]);
const loading = ref(false);
const error   = ref(null);

const groupItems = ref([]);
const schoolItems = ref([]);
const stateItems  = ref([]);

// Flatten value groups → items, stamping domain onto each item
const flattenItems = (vgs) => {
  const out = [];
  for (const vg of (Array.isArray(vgs) ? vgs : [])) {
    const domain = vg.domain?.name ?? vg.domain ?? null;
    for (const item of (vg.items ?? [])) {
      out.push({ ...item, _vgDomain: domain });
    }
  }
  return out;
};

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
    groupItems.value  = flattenItems(gRes.data);
    schoolItems.value = flattenItems(sRes.data);
    stateItems.value  = flattenItems(stRes.data);
  } catch (e) {
    error.value = e.message;
    groupItems.value = []; schoolItems.value = []; stateItems.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => selectedGroup.value, fetchAll);
onMounted(fetchAll);

// Index school + state items by iqbId for O(1) lookup
const schoolByIqbId = computed(() => {
  const m = new Map();
  for (const it of schoolItems.value) if (it.iqbId) m.set(it.iqbId, it);
  return m;
});
const stateByIqbId = computed(() => {
  const m = new Map();
  for (const it of stateItems.value) if (it.iqbId) m.set(it.iqbId, it);
  return m;
});

const meanPct = (item) => {
  const m = item?.descriptiveStatistics?.mean;
  return m != null ? m * 100 : null;
};

// ── Joined table rows ────────────────────────────────────────────────────────
const tableRows = computed(() => {
  return groupItems.value.map((it) => {
    const sIt  = schoolByIqbId.value.get(it.iqbId);
    const stIt = stateByIqbId.value.get(it.iqbId);

    const params = it.parameters ?? {};
    const competences = params.competences ?? [];
    const compType = competences.find(c => c.type === 'Kompetenz')?.name
      ?? competences[0]?.name
      ?? null;

    return {
      iqbId:           it.iqbId ?? '',
      exercise:        it.exercise?.name ?? it.iqbId ?? '',
      title:           it.exercise?.title ?? null,
      domain:          params.domain ?? it._vgDomain ?? null,
      competenceLevel: params.competenceLevel?.nameShort ?? null,
      competenceType:  compType,
      classP:          meanPct(it),
      schoolP:         meanPct(sIt),
      stateP:          meanPct(stIt),
    };
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
              <code class="comp-name">ItemSolutionTable</code>
              <Tag value="Neu" severity="contrast" />
            </div>
            <p class="comp-desc">
              <strong>Lösungsquoten auf Aufgabenebene — Klasse · Schule · Bundesland</strong><br />
              Tabelle mit internen Balkendiagrammen pro Aufgabe. Spaltentoggle, Textsuche,
              sortierbar. Zeigt Kompetenz, Stufe, Aufgabentitel und Lösungsquoten.
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
        </div>

        <div v-if="loading" class="skeleton-wrap">
          <Skeleton v-for="n in 8" :key="n" height="36px" class="mb-2" />
        </div>
        <Message v-else-if="error" severity="error" :closable="false" class="mt-2">
          {{ error }} — Läuft der Mock-Server auf localhost:8000?
        </Message>
        <Message v-else-if="!tableRows.length" severity="info" :closable="false" class="mt-2">
          Keine Daten.
        </Message>

        <ItemSolutionTable
          v-else
          :rows="tableRows"
          :group-label="selectedGroup?.label ?? 'Klasse'"
          school-label="Schule"
          state-label="Bundesland"
        />

        <ComponentDocs
          component-name="ItemSolutionTable"
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
  max-width: 1100px;
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

.controls { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-bottom: 20px; }
.ctrl-field { display: flex; flex-direction: column; gap: 5px; }
.ctrl-label {
  font-size: 0.74rem; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.ctrl-select { min-width: 210px; }

.skeleton-wrap { padding: 4px 0; }
.mb-2 { margin-bottom: 8px; }
.mt-2 { margin-top: 8px; }
</style>
