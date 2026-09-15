<script setup>
// Standard-Erreichung — aus der Schulrückmeldung von indibit herausgezogen.
//
// Die eine große Zahl, nach der zuerst gefragt wird, mit ihrer Aufschlüsselung
// direkt daneben. Getrennt wären es zwei Angaben, von denen die erste ohne die
// zweite in die Irre führt.
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import { StandardErreichung } from '@tba3/bausteine/vue';
import ComponentDocs from '../components/ComponentDocs.vue';
import { t } from '../i18n';

const DOCS = {
  githubFile: 'standard-erreichung.js',
  githubPath: 'packages/bausteine/webcomponents/standard-erreichung.js',
  propsDocs: [
    { name: 'label', type: 'String', default: "'Mindeststandard erreicht'", pfad: 'ansichten.standard.props.label' },
    { name: 'zeilen', type: 'Array', required: true, pfad: 'ansichten.standard.props.zeilen' },
    { name: 'wert', type: 'Number', default: 'null', pfad: 'ansichten.standard.props.wert' },
    { name: 'schwelle', type: 'Number', default: '10', pfad: 'ansichten.standard.props.schwelle' },
    { name: 'hinweis', type: 'String', default: "''", pfad: 'ansichten.standard.props.hinweis' },
  ],
  dataShape: `// zeilen-Element
{
  label:  'Leseverstehen',  // Fach oder Domäne
  wert:   83,               // Anteil ab Mindeststandard in Prozent
  gesamt: 25,               // Gruppengröße — gewichtet den Gesamtwert
}

// wert weggelassen → gewichtetes Mittel der Zeilen.
// Eine Zeile, die mehr als schwelle Punkte abweicht, wird eingefärbt.`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/competence-levels', pfad: 'ansichten.standard.endpunkte.gruppe' },
  ],
  apiNotePfad: 'ansichten.standard.hinweis',
};

const propsDocs = computed(() => DOCS.propsDocs.map(({ pfad, ...r }) => ({ ...r, description: t(pfad) })));
const apiEndpoints = computed(() => DOCS.apiEndpoints.map(({ pfad, ...r }) => ({ ...r, description: t(pfad) })));

const GROUPS = [
  { id: '3a-deutsch', label: '3a Deutsch' },
  { id: '3b-deutsch', label: '3b Deutsch' },
  { id: '3c-deutsch', label: '3c Deutsch' },
  { id: '8a-deutsch', label: '8a Deutsch' },
  { id: '8a-mathe', label: '8a Mathematik' },
];

const DOMAENEN = { le: 'ansichten.kontext.domaenen.le', ho: 'ansichten.kontext.domaenen.ho', rs: 'ansichten.kontext.domaenen.rs' };

const selectedGroup = ref(GROUPS[0]);
const loading = ref(false);
const error = ref(null);
const eintraege = ref([]);

const laden = async () => {
  loading.value = true; error.value = null;
  try {
    const { data } = await axios.get(`/groups/${selectedGroup.value.id}/competence-levels`, { params: { type: 'group' } });
    eintraege.value = Array.isArray(data) ? data : [data];
  } catch (e) {
    error.value = e.message;
    eintraege.value = [];
  } finally { loading.value = false; }
};

onMounted(laden);
watch(selectedGroup, laden);

// Stufe I ist definitionsgemäß unter dem Mindeststandard, alles andere darüber.
const zeilen = computed(() =>
  eintraege.value
    .filter((e) => e.type !== 'student' && e.competenceLevels?.length)
    .map((e) => {
      const gesamt = e.competenceLevels.reduce((n, l) => n + (l.descriptiveStatistics?.frequency ?? 0), 0);
      const erreicht = e.competenceLevels
        .filter((l) => l.nameShort !== 'I')
        .reduce((n, l) => n + (l.descriptiveStatistics?.frequency ?? 0), 0);
      const pfad = DOMAENEN[e.domain?.name];
      return {
        label: pfad ? t(pfad) : (e.domain?.name ?? '—'),
        wert: gesamt ? Math.round((erreicht / gesamt) * 100) : 0,
        gesamt,
      };
    }));

const gewaehlt = ref(null);
</script>

<template>
  <div class="ansicht">
    <header>
      <h1>{{ t('ansichten.standard.titel') }}</h1>
      <p>{{ t('ansichten.standard.zweck') }}</p>
    </header>

    <Card>
      <template #content>
        <div class="steuerung">
          <Select v-model="selectedGroup" :options="GROUPS" optionLabel="label"
                  data-testid="gruppe-waehlen" class="w-64" />
        </div>

        <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
        <Skeleton v-else-if="loading" height="220px" />
        <div v-else data-testid="erreichung">
          <StandardErreichung
            :label="t('ansichten.standard.label')"
            :zeilen="zeilen"
            @zeile-gewaehlt="gewaehlt = $event"
          />
        </div>

        <p v-if="gewaehlt" class="auswahl" data-testid="auswahl">
          {{ gewaehlt.label }}: {{ gewaehlt.wert }} % ({{ gewaehlt.bewertung }})
        </p>
      </template>
    </Card>

    <ComponentDocs v-bind="DOCS" :propsDocs="propsDocs" :apiEndpoints="apiEndpoints" />
  </div>
</template>

<style scoped>
.ansicht { display: flex; flex-direction: column; gap: 1.5rem; }
.steuerung { margin-bottom: 1rem; }
.auswahl { margin-top: 1rem; color: var(--p-text-muted-color); }
</style>
