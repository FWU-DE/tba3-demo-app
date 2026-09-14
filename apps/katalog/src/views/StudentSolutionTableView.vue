<script setup>
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import StudentSolutionTable from '../components/StudentSolutionTable.vue';
import ComponentDocs from '../components/ComponentDocs.vue';
import { t } from '../i18n';

const DOCS_META = {
  githubFile: 'StudentSolutionTable.vue',
  propsDocs: [
    { name: 'rows',    type: 'Array', required: true,  pfad: 'ansichten.schuelerTabelle.props.rows' },
    { name: 'domains', type: 'Array', default: '[Insgesamt, Lesen, Zuhören]', pfad: 'ansichten.schuelerTabelle.props.domains' },
  ],
  dataShape: `// rows-Element
{
  id:           'st-3a-001',
  name:         'Schülerin 001',
  gender:       'f',              // 'f' | 'm' | 'd'
  testBooklet:  { label: 'Testheft B – Lesen & Zuhören', url: '/booklets/b' },
  solutionUrl:  '/solutions/st-001',
  absent:       false,
  absentMessage: null,
  domains: {
    total:     { pctCorrect: 71, pctOmitted: 0,  pctIncorrect: 29 },
    reading:   { pctCorrect: 77, pctOmitted: 0,  pctIncorrect: 23 },
    listening: { pctCorrect: 65, pctOmitted: 2,  pctIncorrect: 33 },
  },
}`,
  codeExample: `<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import StudentSolutionTable from './components/StudentSolutionTable.vue';

const rows    = ref([]);
const domains = [
  { key: 'total',     label: 'Insgesamt' },
  { key: 'reading',   label: 'Lesen' },
  { key: 'listening', label: 'Zuhören' },
];

onMounted(async () => {
  const { data } = await axios.get('/groups/3a-deutsch/items?type=students');
  const vgs = [].concat(data);

  // Group value-groups by student
  const byStudent = new Map();
  for (const vg of vgs) {
    if (vg.type !== 'student') continue;
    const sid = vg.studentId ?? vg.id;
    if (!byStudent.has(sid)) byStudent.set(sid, { id: sid, name: vg.name ?? sid, gender: vg.gender ?? 'd', vgs: [] });
    byStudent.get(sid).vgs.push(vg);
  }

  const domainKey = (vg) => {
    const d = vg.domain?.name ?? vg.domain ?? '';
    if (d.includes('Lesen') || d === 'le') return 'reading';
    if (d.includes('Hören') || d.includes('Zuhören') || d === 'ho') return 'listening';
    return 'other';
  };

  const toPcts = (items) => {
    const correct   = items.filter(it => it.score >= 1).length;
    const omitted   = items.filter(it => it.score == null).length;
    const incorrect = items.length - correct - omitted;
    const total     = items.length || 1;
    return { pctCorrect: correct/total*100, pctOmitted: omitted/total*100, pctIncorrect: incorrect/total*100 };
  };

  rows.value = [...byStudent.values()].map(({ id, name, gender, vgs: svgs }) => {
    const allItems   = svgs.flatMap(vg => vg.items ?? []);
    const domainMap  = {};
    for (const vg of svgs) {
      const key = domainKey(vg);
      if (key !== 'total') domainMap[key] = toPcts(vg.items ?? []);
    }
    domainMap.total = toPcts(allItems);
    return { id, name, gender, testBooklet: null, solutionUrl: null, absent: false, absentMessage: null, domains: domainMap };
  });
});
<\/script>

<template>
  <StudentSolutionTable :rows="rows" :domains="domains" />
</template>`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/items?type=students', pfad: 'ansichten.schuelerTabelle.endpunkte.schueler' },
  ],
  apiNotePfad: 'ansichten.schuelerTabelle.hinweis',
};

// Die Doku-Texte folgen der Sprachwahl, die technischen Angaben bleiben.
const propsDocs = computed(() =>
  DOCS_META.propsDocs.map(({ pfad, ...rest }) => ({ ...rest, description: t(pfad) }))
);
const apiEndpoints = computed(() =>
  DOCS_META.apiEndpoints.map(({ pfad, ...rest }) => ({ ...rest, description: t(pfad) }))
);

// ── Mock data ─────────────────────────────────────────────────────────────────
const GROUPS = [
  { id: '3a-deutsch',  label: '3a Deutsch',    subject: 'DE', booklet: 'Testheft B – Lesen & Zuhören' },
  { id: '3b-deutsch',  label: '3b Deutsch',    subject: 'DE', booklet: 'Testheft B – Lesen & Zuhören' },
  { id: '8a-englisch', label: '8a Englisch',   subject: 'EN', booklet: 'Testheft A – Reading & Listening' },
  { id: '3a-mathe',    label: '3a Mathematik', subject: 'MA', booklet: 'Testheft A – Arithmetik & Geometrie' },
  { id: '8a-mathe',    label: '8a Mathematik', subject: 'MA', booklet: 'Testheft B – Algebra & Statistik' },
];

const DOMAINS_BY_SUBJECT = {
  DE: [
    { key: 'total',     label: 'Insgesamt' },
    { key: 'reading',   label: 'Lesen' },
    { key: 'listening', label: 'Zuhören' },
  ],
  EN: [
    { key: 'total',     label: 'Insgesamt' },
    { key: 'reading',   label: 'Reading' },
    { key: 'listening', label: 'Listening' },
  ],
  MA: [
    { key: 'total',     label: 'Insgesamt' },
    { key: 'arith',     label: 'Arithmetik' },
    { key: 'geo',       label: 'Geometrie' },
  ],
};

// Deterministic LCG
const seededRand = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223 >>> 0;
    return s / 0x100000000;
  };
};

const makeScores = (rand) => {
  const correct  = Math.round(rand() * 75 + 10); // 10–85
  const omitted  = Math.random() < 0.5 ? Math.round(rand() * 12) : 0; // often 0
  const incorrect = Math.max(0, 100 - correct - omitted);
  return { pctCorrect: correct, pctOmitted: omitted, pctIncorrect: incorrect };
};

const generateStudents = (group) => {
  const seed = group.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRand(seed);
  const count = 20 + Math.floor(rand() * 5); // 20–24

  // 2 absent students
  const absentSet = new Set();
  while (absentSet.size < 2) absentSet.add(Math.floor(rand() * count));

  const domainKeys = DOMAINS_BY_SUBJECT[group.subject].map(d => d.key).filter(k => k !== 'total');

  return Array.from({ length: count }, (_, i) => {
    const num    = String(i + 1).padStart(3, '0');
    const female = rand() > 0.5;
    const name   = female ? `Schülerin ${num}` : `Schüler ${num}`;
    const absent = absentSet.has(i);

    if (absent) {
      return {
        id: `${group.id}-${i}`,
        name,
        gender: female ? 'f' : 'm',
        testBooklet: { label: group.booklet, url: '#' },
        solutionUrl: null,
        absent: true,
        absentMessage: `${name} war am Testtag abwesend.`,
        domains: {},
      };
    }

    // Correlated domain scores: base correct rate + domain variance
    const baseCorrect = Math.round(rand() * 70 + 15);
    const domainScores = {};
    let sumCorrect = 0;

    for (const key of domainKeys) {
      const variance = Math.round((rand() - 0.5) * 30);
      const correct  = Math.max(5, Math.min(95, baseCorrect + variance));
      const omitted  = rand() < 0.4 ? Math.round(rand() * 10) : 0;
      const incorrect = Math.max(0, 100 - correct - omitted);
      domainScores[key] = { pctCorrect: correct, pctOmitted: omitted, pctIncorrect: incorrect };
      sumCorrect += correct;
    }

    // Total = average of domain scores
    const avgCorrect  = Math.round(sumCorrect / domainKeys.length);
    const omittedT    = rand() < 0.3 ? Math.round(rand() * 8) : 0;
    domainScores.total = {
      pctCorrect:   avgCorrect,
      pctOmitted:   omittedT,
      pctIncorrect: Math.max(0, 100 - avgCorrect - omittedT),
    };

    return {
      id: `${group.id}-${i}`,
      name,
      gender: female ? 'f' : 'm',
      testBooklet: { label: group.booklet, url: '#' },
      solutionUrl: '#',
      absent: false,
      absentMessage: null,
      domains: domainScores,
    };
  });
};

// ── State ─────────────────────────────────────────────────────────────────────
const selectedGroup = ref(GROUPS[0]);

const domains = computed(() => DOMAINS_BY_SUBJECT[selectedGroup.value.subject]);
const rows    = computed(() => generateStudents(selectedGroup.value));
</script>

<template>
  <main class="view-main">
    <Card class="catalog-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="comp-name-row">
              <code class="comp-name">StudentSolutionTable</code>
              <Tag :value="t('ansichten.gemeinsam.neu')" severity="contrast" />
            </div>
            <p class="comp-desc">
              <strong>{{ t('ansichten.schuelerTabelle.titel') }}</strong><br />
              {{ t('ansichten.schuelerTabelle.beschreibung') }}
            </p>
            <div class="use-case-note">
              <i class="pi pi-info-circle" />
              <span>{{ t('ansichten.schuelerTabelle.merkmale') }}</span>
            </div>
          </div>
          <Tag :value="t('index.tabelle')" severity="secondary" />
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

        <StudentSolutionTable :rows="rows" :domains="domains" />

        <ComponentDocs
          component-name="StudentSolutionTable"
          :github-file="DOCS_META.githubFile"
          :props-docs="propsDocs"
          :data-shape="DOCS_META.dataShape"
          :code-example="DOCS_META.codeExample"
          :api-endpoints="apiEndpoints"
          :api-note="t(DOCS_META.apiNotePfad)"
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
.comp-desc { font-size: 0.84rem; color: #475569; max-width: 620px; line-height: 1.55; }

.use-case-note {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.78rem; color: #0369a1; background: #f0f9ff;
  border: 1px solid #bae6fd; border-radius: 5px; padding: 5px 10px;
  margin-top: 8px; max-width: 600px;
}

.controls { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-bottom: 20px; }
.ctrl-field { display: flex; flex-direction: column; gap: 5px; }
.ctrl-label {
  font-size: 0.74rem; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.ctrl-select { min-width: 220px; }
</style>
