<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { AufgabenTabelle } from '@tba3/bausteine/vue';
import ComponentDocs from '../components/ComponentDocs.vue';
import { t } from '../i18n';

const DOCS = {
  githubFile: 'aufgaben-tabelle.js',
  githubPath: 'packages/bausteine/webcomponents/aufgaben-tabelle.js',
  propsDocs: [
    { name: 'items',      type: 'Array',  required: true, pfad: 'ansichten.tabelle.props.items' },
    { name: 'title',      type: 'String', default: "''",         pfad: 'ansichten.tabelle.props.title' },
    { name: 'sortierung', type: 'String', default: "'position'", pfad: 'ansichten.tabelle.props.sortierung' },
    { name: 'richtung',   type: 'String', default: "'auf'",      pfad: 'ansichten.tabelle.props.richtung' },
  ],
  dataShape: `// items-Element
{
  label:    '1.1',           // Aufgabennummer im Testheft, erste Spalte
  exercise: 'Geheimsache',   // Name der Aufgabe, zu der das Item gehört
  level:    'III',           // Kompetenzstufe (I–V)
  actual:   62.4,            // Lösungsquote der Lerngruppe, 0–100
  expected: 58.1,            // Referenzquote; null blendet Erwartung und
                             // Abweichung in dieser Zeile aus
}`,
  codeExample: `<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { AufgabenTabelle } from '@tba3/bausteine/vue';

const items = ref([]);

onMounted(async () => {
  const [gRes, sRes] = await Promise.all([
    axios.get('/groups/3a-deutsch/items'),
    axios.get('/schools/gs-musterstadt/items'),
  ]);

  // Referenz nach iqbId aufschlüsseln, damit der Vergleich O(1) bleibt
  const referenz = new Map(
    sRes.data.flatMap(vg => vg.items ?? []).map(it => [it.iqbId, it])
  );
  const quote = it => (it?.descriptiveStatistics?.mean ?? null) != null
    ? it.descriptiveStatistics.mean * 100
    : null;

  items.value = gRes.data.flatMap(vg =>
    (vg.items ?? []).map(item => ({
      label:    item.name ?? item.iqbId,
      exercise: item.exercise?.name ?? '',
      level:    item.parameters?.competenceLevel?.nameShort ?? null,
      actual:   quote(item),
      expected: quote(referenz.get(item.iqbId)),
    }))
  );
});
<\/script>

<template>
  <AufgabenTabelle
    :items="items"
    title="Leseverstehen"
    @sortiert="s => console.log(s)"
    @aufgabe-gewaehlt="a => console.log(a)"
  />
</template>`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/items',  pfad: 'ansichten.tabelle.endpunkte.gruppe' },
    { method: 'GET', path: '/schools/{id}/items', pfad: 'ansichten.tabelle.endpunkte.schule' },
    { method: 'GET', path: '/states/{id}/items',  pfad: 'ansichten.tabelle.endpunkte.land' },
  ],
  apiNotePfad: 'ansichten.tabelle.hinweis',
};

// Die Doku-Texte folgen der Sprachwahl, die technischen Angaben bleiben.
const propsDocs = computed(() =>
  DOCS.propsDocs.map(({ pfad, ...rest }) => ({ ...rest, description: t(pfad) }))
);
const apiEndpoints = computed(() =>
  DOCS.apiEndpoints.map(({ pfad, ...rest }) => ({ ...rest, description: t(pfad) }))
);

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

// Woran die Lösungsquote der Lerngruppe gemessen wird. Der Baustein zeigt
// eine Erwartungsspalte, nicht drei Ebenen nebeneinander — welche Ebene das
// ist, entscheidet hier die Wahl statt einer festen Annahme.
const REFERENZEN = [
  { id: 'school', pfad: 'ansichten.gemeinsam.schule' },
  { id: 'state', pfad: 'ansichten.gemeinsam.bundesland' },
];
const referenzen = computed(() =>
  REFERENZEN.map((r) => ({ ...r, label: t(r.pfad) })),
);
const referenz = ref(REFERENZEN[0].id);

const DOMAIN_CODES = ['ho', 'le', 'sr', 'ma', 'en', 'fr'];
const domainLabel = (d) =>
  (DOMAIN_CODES.includes(d) ? t(`bausteine.domaenen.${d}`) : (d?.toUpperCase() ?? ''));

// ── Zeilen für den Baustein ──────────────────────────────────────────────────
// Eine Tabelle je Domäne: der Baustein zeigt eine Aufgabenliste, und
// Leseverstehen und Mathematik in einer Liste zu mischen vergleicht Dinge,
// die nichts miteinander zu tun haben.
const tabellenNachDomaene = computed(() => {
  const nachDomaene = new Map();

  for (const it of groupItems.value) {
    const params = it.parameters ?? {};
    const domain = params.domain ?? it._vgDomain ?? '';
    const referenzItem = referenz.value === 'state'
      ? stateByIqbId.value.get(it.iqbId)
      : schoolByIqbId.value.get(it.iqbId);

    if (!nachDomaene.has(domain)) nachDomaene.set(domain, []);
    nachDomaene.get(domain).push({
      // `name` ist die Aufgabennummer im Testheft („1.1"), `exercise.name` der
      // Name der Aufgabe, zu der mehrere Items gehören („Geheimsache").
      label: it.name ?? it.iqbId ?? '',
      exercise: it.exercise?.name ?? '',
      level: params.competenceLevel?.nameShort ?? null,
      actual: meanPct(it),
      expected: meanPct(referenzItem),
    });
  }

  return [...nachDomaene].map(([domain, items]) => ({
    domain,
    label: domainLabel(domain),
    items,
  }));
});

const gewaehlteAufgabe = ref(null);
</script>

<template>
  <main class="view-main">
    <Card class="catalog-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="comp-name-row">
              <code class="comp-name">&lt;tba3-aufgaben-tabelle&gt;</code>
              <Tag :value="t('ansichten.gemeinsam.neu')" severity="contrast" />
            </div>
            <p class="comp-desc">
              <strong>{{ t('ansichten.tabelle.titel') }}</strong><br />
              {{ t('ansichten.tabelle.beschreibung') }}
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
            <label class="ctrl-label">{{ t('ansichten.gemeinsam.lerngruppe') }}</label>
            <Select v-model="selectedGroup" :options="GROUPS" option-label="label"
              :placeholder="t('ansichten.gemeinsam.gruppeWaehlen')" class="ctrl-select" />
          </div>
          <div class="ctrl-field">
            <label class="ctrl-label">{{ t('ansichten.tabelle.referenz') }}</label>
            <Select v-model="referenz" :options="referenzen" option-label="label"
              option-value="id" class="ctrl-select" data-testid="referenz-wahl" />
          </div>
        </div>

        <div v-if="loading" class="skeleton-wrap">
          <Skeleton v-for="n in 8" :key="n" height="36px" class="mb-2" />
        </div>
        <Message v-else-if="error" severity="error" :closable="false" class="mt-2">
          {{ t('ansichten.gemeinsam.mockHinweis', { fehler: error }) }}
        </Message>
        <Message v-else-if="!tabellenNachDomaene.length" severity="info" :closable="false" class="mt-2">
          {{ t('ansichten.gemeinsam.keineDaten') }}
        </Message>

        <div v-else class="tabellen">
          <AufgabenTabelle
            v-for="tabelle in tabellenNachDomaene"
            :key="tabelle.domain"
            :items="tabelle.items"
            :title="tabelle.label"
            sortierung="delta"
            richtung="auf"
            @aufgabe-gewaehlt="(a) => (gewaehlteAufgabe = a)"
          />
          <p v-if="gewaehlteAufgabe" class="gewaehlt" data-testid="aufgabe-gewaehlt">
            <i class="pi pi-arrow-right" />
            {{ t('ansichten.tabelle.gewaehlt', {
              aufgabe: gewaehlteAufgabe.label,
              quote: Math.round(gewaehlteAufgabe.actual ?? 0),
            }) }}
          </p>
        </div>

        <ComponentDocs
          component-name="tba3-aufgaben-tabelle"
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
  max-width: var(--breite);
  margin: 28px auto;
  padding: 0 var(--rand);
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

.tabellen { display: flex; flex-direction: column; gap: 28px; }
.gewaehlt {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.82rem; color: #0369a1; background: #f0f9ff;
  border: 1px solid #bae6fd; border-radius: 5px; padding: 6px 10px; margin: 0;
}

.skeleton-wrap { padding: 4px 0; }
.mb-2 { margin-bottom: 8px; }
.mt-2 { margin-top: 8px; }
</style>
