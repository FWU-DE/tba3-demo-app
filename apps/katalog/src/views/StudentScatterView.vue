<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { Streudiagramm } from '@tba3/bausteine/vue';
import ComponentDocs from '../components/ComponentDocs.vue';
import { t } from '../i18n';

const DOCS = {
  githubFile: 'streudiagramm.js',
  githubPath: 'packages/bausteine/webcomponents/streudiagramm.js',
  propsDocs: [
    { name: 'punkte',     type: 'Array',  required: true,        pfad: 'ansichten.scatter.props.punkte' },
    { name: 'title',      type: 'String', default: "''",         pfad: 'ansichten.scatter.props.title' },
    { name: 'stufen',     type: 'Array',  default: "['I'…'V']",  pfad: 'ansichten.scatter.props.stufen' },
    { name: 'mittelwert', type: 'Number', default: 'null',       pfad: 'ansichten.scatter.props.mittelwert' },
  ],
  dataShape: `// punkte-Element
{
  id:        'st-3a-deutsch-0',
  name:      'Leon Braun',
  initialen: 'LB',          // fehlt sie, bildet der Baustein sie aus dem Namen
  x:         2.3,           // Kompetenzstufe 1–5, Dezimalstellen erlaubt
  y:         47.5,          // Lösungsquote in Prozent (0–100)
  details: [                // stehen im Tooltip unter den Grundwerten
    { label: 'Leseverstehen', wert: 52.0 },
    { label: 'Hörverstehen',  wert: 44.0 },
  ],
}`,
  codeExample: `<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Streudiagramm } from '@tba3/bausteine/vue';

const punkte = ref([]);

// BISTA-Punkte auf die Stufenachse legen: 270 → ganz links, 540 → Stufe V
const bistaZuStufe = (bista) => Math.max(0, Math.min(5, (bista - 270) / 55));

onMounted(async () => {
  const { data } = await axios.get('/groups/3a-deutsch/items?type=students');

  // Value-Groups nach Schüler:in bündeln
  const nachId = new Map();
  for (const vg of [].concat(data)) {
    if (vg.type !== 'student') continue;
    const id = vg.id ?? vg.studentId;
    if (!nachId.has(id)) nachId.set(id, { id, name: vg.name ?? id, vgs: [] });
    nachId.get(id).vgs.push(vg);
  }

  const quote = (items) =>
    items.reduce((s, it) => s + (it.descriptiveStatistics?.mean ?? 0), 0) / (items.length || 1) * 100;

  punkte.value = [...nachId.values()].map(({ id, name, vgs }) => {
    const alle = vgs.flatMap(vg => vg.items ?? []);
    const geloest = alle.filter(it => (it.descriptiveStatistics?.mean ?? 0) >= 0.5);
    const mittleresBista = geloest.length
      ? geloest.reduce((s, it) => s + (it.parameters?.bistaPoints ?? 400), 0) / geloest.length
      : 400;

    return {
      id,
      name,
      x: bistaZuStufe(mittleresBista),
      y: quote(alle),
      details: vgs.map(vg => ({
        label: vg.domain?.name ?? vg.domain ?? '',
        wert: quote(vg.items ?? []),
      })),
    };
  });
});
<\/script>

<template>
  <Streudiagramm
    :punkte="punkte"
    title="3a Deutsch"
    @punkt-gewaehlt="p => console.log(p)"
  />
</template>`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/items?type=students', pfad: 'ansichten.scatter.endpunkte.schueler' },
  ],
  apiNotePfad: 'ansichten.scatter.hinweis',
};

// Die Doku-Texte folgen der Sprachwahl, die technischen Angaben bleiben.
const propsDocs = computed(() =>
  DOCS.propsDocs.map(({ pfad, ...rest }) => ({ ...rest, description: t(pfad) }))
);
const apiEndpoints = computed(() =>
  DOCS.apiEndpoints.map(({ pfad, ...rest }) => ({ ...rest, description: t(pfad) }))
);

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

    result.push({
      id,
      name: toName(name),
      initialen: toInitials(name),
      x,
      y,
      details: details.map((d) => ({ label: d.domain, wert: d.pct })),
    });
  }

  return result;
});

// Die waagerechte Marke: der Mittelwert der Lerngruppe. Ohne sie ist eine
// Punktwolke nur eine Punktwolke.
const mittelwert = computed(() => {
  if (!students.value.length) return null;
  return students.value.reduce((s, p) => s + p.y, 0) / students.value.length;
});

const gewaehlterPunkt = ref(null);
watch(() => selectedGroup.value, () => { gewaehlterPunkt.value = null; });
</script>

<template>
  <main class="view-main">
    <Card class="catalog-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="comp-name-row">
              <code class="comp-name">&lt;tba3-streudiagramm&gt;</code>
              <Tag :value="t('ansichten.gemeinsam.neu')" severity="contrast" />
            </div>
            <p class="comp-desc">
              <strong>{{ t('ansichten.scatter.titel') }}</strong><br />
              {{ t('ansichten.scatter.beschreibung') }}
              {{ t('ansichten.scatter.tooltipHinweis') }}
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
            <label class="ctrl-label">{{ t('ansichten.gemeinsam.lerngruppe') }}</label>
            <Select v-model="selectedGroup" :options="GROUPS" option-label="label"
              :placeholder="t('ansichten.gemeinsam.gruppeWaehlen')" class="ctrl-select" />
          </div>
        </div>

        <div v-if="loading" class="skeleton-wrap">
          <Skeleton height="460px" />
        </div>
        <Message v-else-if="error" severity="error" :closable="false" class="mt-2">
          {{ t('ansichten.gemeinsam.mockHinweis', { fehler: error }) }}
        </Message>
        <Message v-else-if="!students.length" severity="info" :closable="false" class="mt-2">
          {{ t('ansichten.scatter.keineDaten') }}
        </Message>

        <div v-else class="diagramm-flaeche">
          <Streudiagramm
            :punkte="students"
            :title="selectedGroup?.label ?? ''"
            :mittelwert="mittelwert"
            @punkt-gewaehlt="(p) => (gewaehlterPunkt = p)"
          />
        </div>
        <p v-if="gewaehlterPunkt" class="gewaehlt">
          <i class="pi pi-user" />
          {{ t('ansichten.scatter.gewaehlt', {
            name: gewaehlterPunkt.name,
            quote: Math.round(gewaehlterPunkt.wertY ?? 0),
          }) }}
        </p>

        <ComponentDocs
          component-name="tba3-streudiagramm"
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
.view-main { max-width: var(--breite); margin: 28px auto; padding: 0 var(--rand); }
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
.diagramm-flaeche { max-width: 760px; }
.gewaehlt {
  display: flex; align-items: center; gap: 6px; margin: 12px 0 0;
  font-size: 0.82rem; color: #0369a1; background: #f0f9ff;
  border: 1px solid #bae6fd; border-radius: 5px; padding: 6px 10px;
}
.skeleton-wrap { padding: 4px 0; }
.mt-2 { margin-top: 8px; }
</style>
