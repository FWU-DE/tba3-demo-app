<script setup>
import { ref, computed, watch } from 'vue';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import { BistaVerteilung } from '@tba3/bausteine/vue';
import StudentTooltip from '../components/StudentTooltip.vue';
import ComponentDocs from '../components/ComponentDocs.vue';
import { t } from '../i18n';

const DOCS = {
  githubFile: 'bista-verteilung.js',
  githubPath: 'packages/bausteine/webcomponents/bista-verteilung.js',
  propsDocs: [
    { name: 'schueler',   type: 'Array',  required: true, pfad: 'ansichten.bista.props.schueler' },
    { name: 'title',      type: 'String', default: "''",  pfad: 'ansichten.bista.props.title' },
    { name: 'zonen',      type: 'Array',  default: '[KS I, KS II, KS III]', pfad: 'ansichten.bista.props.zonen' },
    { name: 'punkteMin',  type: 'Number', default: '300', pfad: 'ansichten.bista.props.punkteMin' },
    { name: 'punkteMax',  type: 'Number', default: '565', pfad: 'ansichten.bista.props.punkteMax' },
    { name: 'mittelwert', type: 'Number', default: 'null', pfad: 'ansichten.bista.props.mittelwert' },
  ],
  dataShape: `// schueler-Element
{
  id:        1,
  name:      'Emma Fischer',
  initialen: 'EF',        // fehlt sie, bildet der Baustein sie aus dem Namen
  punkte:    391,         // BISTA-Punktwert, zwischen punkteMin und punkteMax
}

// zonen-Element
{ id: 'ks2', label: 'KS II', von: 430, bis: 500, farbe: '#e0f2fe' }`,
  codeExample: `<script setup>
import { ref } from 'vue';
import { BistaVerteilung } from '@tba3/bausteine/vue';

// Die Schwellen hängen an Fach und Jahrgang und kommen deshalb von außen.
const zonen = [
  { id: 'ks1', label: 'KS I',   von: 300, bis: 430 },
  { id: 'ks2', label: 'KS II',  von: 430, bis: 500 },
  { id: 'ks3', label: 'KS III', von: 500, bis: 565 },
];

const schueler = ref([
  { id: 1, name: 'Leon Braun',   punkte: 342 },
  { id: 2, name: 'Emma Fischer', punkte: 391 },
  { id: 3, name: 'Paul Schmidt', punkte: 325 },
  { id: 4, name: 'Mia Lange',    punkte: 449 },
  { id: 5, name: 'Jonas Koch',   punkte: 469 },
]);
<\/script>

<template>
  <BistaVerteilung
    :schueler="schueler"
    :zonen="zonen"
    title="8a Deutsch"
    :mittelwert="395"
    @schueler-gewaehlt="s => console.log(s)"
  />
</template>`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/items?type=students', pfad: 'ansichten.bista.endpunkte.schueler' },
  ],
  apiNotePfad: 'ansichten.bista.hinweis',
};

// Die Doku-Texte folgen der Sprachwahl, die technischen Angaben bleiben.
const propsDocs = computed(() =>
  DOCS.propsDocs.map(({ pfad, ...rest }) => ({ ...rest, description: t(pfad) }))
);
const apiEndpoints = computed(() =>
  DOCS.apiEndpoints.map(({ pfad, ...rest }) => ({ ...rest, description: t(pfad) }))
);

const GROUPS = [
  { id: '8a-deutsch',  label: '8a Deutsch',    subject: 'Deutsch',     groupClass: '8a', offset:   0 },
  { id: '3a-deutsch',  label: '3a Deutsch',    subject: 'Deutsch',     groupClass: '3a', offset: -40 },
  { id: '3b-deutsch',  label: '3b Deutsch',    subject: 'Deutsch',     groupClass: '3b', offset: -55 },
  { id: '3c-deutsch',  label: '3c Deutsch',    subject: 'Deutsch',     groupClass: '3c', offset: -25 },
  { id: '3a-mathe',    label: '3a Mathematik', subject: 'Mathematik',  groupClass: '3a', offset: -30 },
  { id: '8a-mathe',    label: '8a Mathematik', subject: 'Mathematik',  groupClass: '8a', offset: +20 },
  { id: '8a-englisch', label: '8a Englisch',   subject: 'Englisch',    groupClass: '8a', offset: +10 },
];

const RING_COLORS = ['#f43f5e', '#14b8a6', '#3b82f6', '#f43f5e', '#8b5cf6', '#f97316', '#f43f5e', '#14b8a6'];

// Base student list — yFrac determines vertical scatter position
const BASE_STUDENTS = [
  { id: 1,  name: 'Leon Braun',      gender: 'male',   bistaBase: 242, yFrac: 0.55, emoji: '👦' },
  { id: 2,  name: 'Emma Fischer',    gender: 'female', bistaBase: 291, yFrac: 0.30, emoji: '👧' },
  { id: 3,  name: 'Finn Weber',      gender: 'male',   bistaBase: 298, yFrac: 0.52, emoji: '🧒' },
  { id: 4,  name: 'Lena Koch',       gender: 'female', bistaBase: 318, yFrac: 0.20, emoji: '👩' },
  { id: 5,  name: 'Paul Schmidt',    gender: 'male',   bistaBase: 325, yFrac: 0.65, emoji: '👦' },
  { id: 6,  name: 'Anna Wagner',     gender: 'female', bistaBase: 341, yFrac: 0.42, emoji: '👧' },
  { id: 7,  name: 'Tim Müller',      gender: 'male',   bistaBase: 353, yFrac: 0.72, emoji: '👦' },
  { id: 8,  name: 'Lisa Becker',     gender: 'female', bistaBase: 367, yFrac: 0.25, emoji: '👩' },
  { id: 9,  name: 'Jan Schulz',      gender: 'male',   bistaBase: 376, yFrac: 0.60, emoji: '🧑' },
  { id: 10, name: 'Sophie Meyer',    gender: 'female', bistaBase: 385, yFrac: 0.38, emoji: '👧' },
  { id: 11, name: 'Nico Krause',     gender: 'male',   bistaBase: 392, yFrac: 0.80, emoji: '👦' },
  { id: 12, name: 'Marie Wolf',      gender: 'female', bistaBase: 399, yFrac: 0.15, emoji: '🧒' },
  { id: 13, name: 'Felix Hofmann',   gender: 'male',   bistaBase: 406, yFrac: 0.56, emoji: '👨' },
  { id: 14, name: 'Clara Zimm.',     gender: 'female', bistaBase: 416, yFrac: 0.45, emoji: '👩' },
  { id: 15, name: 'Max Richter',     gender: 'male',   bistaBase: 425, yFrac: 0.70, emoji: '👦' },
  { id: 16, name: 'Hannah Neumann',  gender: 'female', bistaBase: 434, yFrac: 0.25, emoji: '👧' },
  { id: 17, name: 'Lukas Bauer',     gender: 'male',   bistaBase: 441, yFrac: 0.50, emoji: '🧑' },
  { id: 18, name: 'Mia Lange',       gender: 'female', bistaBase: 449, yFrac: 0.75, emoji: '👩' },
  { id: 19, name: 'Noah Schäfer',    gender: 'male',   bistaBase: 456, yFrac: 0.35, emoji: '👦' },
  { id: 20, name: 'Laura Schulte',   gender: 'female', bistaBase: 461, yFrac: 0.62, emoji: '👧' },
  { id: 21, name: 'Jonas Koch',      gender: 'male',   bistaBase: 469, yFrac: 0.20, emoji: '🧒' },
  { id: 22, name: 'Lea Engel',       gender: 'female', bistaBase: 476, yFrac: 0.82, emoji: '👩' },
  { id: 23, name: 'David Braun',     gender: 'male',   bistaBase: 481, yFrac: 0.44, emoji: '👨' },
  { id: 24, name: 'Amelie Vogt',     gender: 'female', bistaBase: 488, yFrac: 0.65, emoji: '👧' },
  { id: 25, name: 'Elias König',     gender: 'male',   bistaBase: 494, yFrac: 0.30, emoji: '👦' },
  { id: 26, name: 'Julia Maier',     gender: 'female', bistaBase: 498, yFrac: 0.55, emoji: '🧒' },
  { id: 27, name: 'Tobias Werner',   gender: 'male',   bistaBase: 509, yFrac: 0.72, emoji: '👦' },
  { id: 28, name: 'Nora Schneider',  gender: 'female', bistaBase: 516, yFrac: 0.45, emoji: '👩' },
  { id: 29, name: 'Ben Fischer',     gender: 'male',   bistaBase: 526, yFrac: 0.25, emoji: '🧑' },
  { id: 30, name: 'Eva Klein',       gender: 'female', bistaBase: 541, yFrac: 0.60, emoji: '👧' },
  { id: 31, name: 'Moritz Hartmann', gender: 'male',   bistaBase: 549, yFrac: 0.30, emoji: '👦' },
  { id: 32, name: 'Sara Huber',      gender: 'female', bistaBase: 556, yFrac: 0.50, emoji: '👩' },
];

const selectedGroup = ref(GROUPS[0]);

const students = computed(() => {
  const offset = selectedGroup.value?.offset ?? 0;
  return BASE_STUDENTS.map((s, i) => ({
    ...s,
    bistaScore: Math.max(50, Math.min(565, s.bistaBase + offset)),
    ringColor: RING_COLORS[i % RING_COLORS.length],
  }));
});

// Für den Baustein: Name und Punktwert reichen, die Initialen bildet er selbst.
// Die vertikale Streuung (yFrac) fällt weg — wer denselben Wert hat, steht
// beim Baustein übereinander statt zufällig verteilt, und das ist die
// ehrlichere Anordnung.
const schuelerFuerBaustein = computed(() =>
  students.value.map(({ id, name, bistaScore }) => ({ id, name, punkte: bistaScore })),
);

// Die Schwellen der Kompetenzstufen gehören zur Auswertung, nicht zum
// Baustein — deshalb stehen sie hier und nicht dort.
const ZONEN = [
  { id: 'ks1', label: 'KS I', von: 300, bis: 430 },
  { id: 'ks2', label: 'KS II', von: 430, bis: 500 },
  { id: 'ks3', label: 'KS III', von: 500, bis: 565 },
];

const mittelwert = computed(() => {
  const liste = schuelerFuerBaustein.value;
  if (!liste.length) return null;
  return liste.reduce((s, x) => s + x.punkte, 0) / liste.length;
});

const gewaehlt = ref(null);
watch(() => selectedGroup.value, () => { gewaehlt.value = null; });

// Three example students for the standalone StudentTooltip demo
const DEMO_ZONE_DATA = {
  'KS I':   { zone: 'KS I',   competencyLevel: 'Unter Mindeststandard', competencyDesc: 'Grundlegende Kompetenzen noch nicht gesichert.' },
  'KS II':  { zone: 'KS II',  competencyLevel: 'Mindeststandard',        competencyDesc: 'Grundlegende Kompetenzen vorhanden.'            },
  'KS III': { zone: 'KS III', competencyLevel: 'Über Mindeststandard',   competencyDesc: 'Regelstandard oder Optimalstandard erreicht.'   },
};

const tooltipDemos = computed(() => [
  { ...BASE_STUDENTS[4],  bistaScore: 325, ringColor: '#f43f5e', ...DEMO_ZONE_DATA['KS I']   },
  { ...BASE_STUDENTS[16], bistaScore: 441, ringColor: '#3b82f6', ...DEMO_ZONE_DATA['KS II']  },
  { ...BASE_STUDENTS[28], bistaScore: 526, ringColor: '#14b8a6', ...DEMO_ZONE_DATA['KS III'] },
]);
</script>

<template>
  <main class="view-main">
    <Card class="catalog-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="comp-name-row">
              <code class="comp-name">&lt;tba3-bista-verteilung&gt;</code>
              <Tag :value="t('ansichten.gemeinsam.neu')" severity="contrast" />
            </div>
            <p class="comp-desc">
              <strong>{{ t('ansichten.bista.titel') }}</strong><br />
              <span v-html="t('ansichten.bista.beschreibung')" />
            </p>
            <div class="use-case-note">
              <i class="pi pi-users" />
              <span>{{ t('ansichten.bista.datenhinweis') }}</span>
            </div>
          </div>
          <Tag value="SVG" severity="info" />
        </div>
      </template>

      <template #content>

        <!-- ── StudentTooltip standalone demo ──────────────────────────────── -->
        <div class="section-label">
          <code class="comp-name-sm">StudentTooltip</code>
          <span class="section-sub">{{ t('ansichten.bista.tooltipZusatz') }}</span>
        </div>
        <div class="tooltip-demo">
          <StudentTooltip v-for="s in tooltipDemos" :key="s.id" :student="s" />
        </div>

        <div class="section-divider" />

        <!-- ── Chart controls ──────────────────────────────────────────────── -->
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

        <!-- ── Chart ───────────────────────────────────────────────────────── -->
        <div class="diagramm-flaeche">
          <BistaVerteilung
            :schueler="schuelerFuerBaustein"
            :zonen="ZONEN"
            :title="selectedGroup?.label"
            :mittelwert="mittelwert"
            @schueler-gewaehlt="(s) => (gewaehlt = s)"
            @zone-gewaehlt="() => (gewaehlt = null)"
          />
        </div>
        <p v-if="gewaehlt" class="gewaehlt-hinweis" data-testid="schueler-gewaehlt">
          <i class="pi pi-user" />
          {{ t('ansichten.bista.gewaehlt', { name: gewaehlt.name, punkte: Math.round(gewaehlt.punkte ?? 0) }) }}
        </p>

        <ComponentDocs
          component-name="tba3-bista-verteilung"
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
  max-width: 980px;
  margin: 28px auto;
  padding: 0 20px;
}

.catalog-card { border-radius: 10px; }

.diagramm-flaeche { max-width: 760px; }
.gewaehlt-hinweis {
  display: flex; align-items: center; gap: 6px; margin: 12px 0 0;
  font-size: 0.82rem; color: #0369a1; background: #f0f9ff;
  border: 1px solid #bae6fd; border-radius: 5px; padding: 6px 10px;
}

.card-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 12px; padding: 18px 20px 0;
}

.comp-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.comp-name {
  font-size: 0.95rem; font-weight: 700; font-family: ui-monospace, monospace;
  color: #1e3a5f; background: #eff6ff; padding: 2px 8px; border-radius: 4px;
}
.comp-desc { font-size: 0.84rem; color: #475569; max-width: 660px; line-height: 1.55; }
.comp-desc code {
  font-family: ui-monospace, monospace; background: #f1f5f9;
  padding: 1px 4px; border-radius: 3px; font-size: 0.8rem;
}
.use-case-note {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.78rem; color: #0369a1; background: #f0f9ff;
  border: 1px solid #bae6fd; border-radius: 5px; padding: 5px 10px; margin-top: 8px;
}

/* Standalone tooltip demo */
.section-label {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 12px;
}
.comp-name-sm {
  font-size: 0.82rem; font-weight: 700; font-family: ui-monospace, monospace;
  color: #1e3a5f; background: #eff6ff; padding: 2px 7px; border-radius: 4px;
}
.section-sub { font-size: 0.78rem; color: #64748b; }

.tooltip-demo {
  display: flex; flex-wrap: wrap; gap: 14px;
  margin-bottom: 4px;
}

.section-divider {
  border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;
}

/* Controls */
.controls { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-bottom: 20px; }
.ctrl-field { display: flex; flex-direction: column; gap: 5px; }
.ctrl-label {
  font-size: 0.74rem; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.ctrl-select { min-width: 210px; }
</style>
