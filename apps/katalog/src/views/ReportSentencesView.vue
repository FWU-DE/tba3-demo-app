<script setup>
// Zeugnissätze — aus der Messwiederholung des kompetenztest.de herausgezogen
// (`ReportCardHelper.vue`, eigener Reiter neben Grafik und Tabelle).
//
// Der einzige Baustein der Bibliothek, dessen Ausgabe Text ist. Er formuliert
// nicht selbst: die Vorlagen stehen hier in der Ansicht, mit Platzhaltern. Wie
// über eine Lerngruppe geschrieben wird, ist keine Entscheidung einer
// Visualisierungsbibliothek.
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import { Zeugnissaetze } from '@tba3/bausteine/vue';
import ComponentDocs from '../components/ComponentDocs.vue';
import { t } from '../i18n';

const DOCS = {
  githubFile: 'zeugnissaetze.js',
  githubPath: 'packages/bausteine/webcomponents/zeugnissaetze.js',
  propsDocs: [
    { name: 'titel', type: 'String', default: "''", pfad: 'ansichten.saetze.props.titel' },
    { name: 'saetze', type: 'Array', required: true, pfad: 'ansichten.saetze.props.saetze' },
    { name: 'werte', type: 'Object', default: '{}', pfad: 'ansichten.saetze.props.werte' },
    { name: 'leerHinweis', type: 'String', default: "'Zu dieser Auswahl gibt es keinen Satz.'", pfad: 'ansichten.saetze.props.leerHinweis' },
  ],
  dataShape: `// saetze-Element
{
  id:        'lage',
  stufe:     'III',                       // optional, als Abzeichen
  vorlage:   '{name} erreicht Stufe {stufe}.',
  grundlage: 'Kompetenzstufe {stufe}',    // optional, steht klein darunter
  wenn:      { lage: 'auffaellig' },      // optional: Bedingung über werte
}

// Platzhalter werden aus werte gefüllt. Ein unbekannter bleibt sichtbar
// stehen, statt spurlos zu verschwinden.
// wenn ist ein Objekt aus Feld → Wert (oder Liste) — kein Ausdruck, der
// ausgewertet wird: eine Bibliothek, die fremde Zeichenketten als Code
// ausführt, ist ein Einfallstor.`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/competence-levels', pfad: 'ansichten.saetze.endpunkte.gruppe' },
  ],
  apiNotePfad: 'ansichten.saetze.hinweis',
};

const propsDocs = computed(() => DOCS.propsDocs.map(({ pfad, ...r }) => ({ ...r, description: t(pfad) })));
const apiEndpoints = computed(() => DOCS.apiEndpoints.map(({ pfad, ...r }) => ({ ...r, description: t(pfad) })));

const GROUPS = [
  { id: '3a-deutsch', label: '3a Deutsch' },
  { id: '3b-deutsch', label: '3b Deutsch' },
  { id: '8a-deutsch', label: '8a Deutsch' },
  { id: '8a-mathe', label: '8a Mathematik' },
];

const DOMAENEN = { le: 'ansichten.kontext.domaenen.le', ho: 'ansichten.kontext.domaenen.ho', rs: 'ansichten.kontext.domaenen.rs' };

const selectedGroup = ref(GROUPS[0]);
const loading = ref(false);
const error = ref(null);
const eintraege = ref([]);
const kopiert = ref(null);

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

// Die Domäne mit dem größten Anteil unter Mindeststandard — über die wird im
// Zeugnis am ehesten etwas zu sagen sein.
const werte = computed(() => {
  const bewertet = eintraege.value
    .filter((e) => e.type !== 'student' && e.competenceLevels?.length)
    .map((e) => {
      const gesamt = e.competenceLevels.reduce((n, l) => n + (l.descriptiveStatistics?.frequency ?? 0), 0);
      const unter = e.competenceLevels
        .filter((l) => l.nameShort === 'I')
        .reduce((n, l) => n + (l.descriptiveStatistics?.frequency ?? 0), 0);
      const haeufigste = [...e.competenceLevels]
        .sort((a, b) => (b.descriptiveStatistics?.frequency ?? 0) - (a.descriptiveStatistics?.frequency ?? 0))[0];
      const pfad = DOMAENEN[e.domain?.name];
      return {
        domaene: pfad ? t(pfad) : (e.domain?.name ?? '—'),
        anzahl: String(gesamt),
        stufe: haeufigste?.nameShort ?? '',
        unterAnteil: String(gesamt ? Math.round((unter / gesamt) * 100) : 0),
        abMindest: String(gesamt ? Math.round(((gesamt - unter) / gesamt) * 100) : 0),
      };
    })
    .sort((a, b) => Number(b.unterAnteil) - Number(a.unterAnteil));

  if (bewertet.length === 0) return {};
  return { ...bewertet[0], gruppe: selectedGroup.value.label, lage: Number(bewertet[0].unterAnteil) >= 20 ? 'auffaellig' : 'unauffaellig' };
});

const saetze = computed(() => [
  { id: 'lage', stufe: werte.value.stufe, vorlage: t('ansichten.saetze.satzLage'), grundlage: t('ansichten.saetze.grundlageLage') },
  { id: 'auffaellig', wenn: { lage: 'auffaellig' }, vorlage: t('ansichten.saetze.satzAuffaellig'), grundlage: t('ansichten.saetze.grundlageUnter') },
  { id: 'unauffaellig', wenn: { lage: 'unauffaellig' }, vorlage: t('ansichten.saetze.satzUnauffaellig'), grundlage: t('ansichten.saetze.grundlageUnter') },
]);
</script>

<template>
  <div class="ansicht">
    <header>
      <h1>{{ t('ansichten.saetze.titel') }}</h1>
      <p>{{ t('ansichten.saetze.zweck') }}</p>
    </header>

    <Card>
      <template #content>
        <div class="steuerung">
          <Select v-model="selectedGroup" :options="GROUPS" optionLabel="label"
                  data-testid="gruppe-waehlen" class="w-64" />
        </div>

        <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
        <Skeleton v-else-if="loading" height="180px" />
        <div v-else data-testid="saetze">
          <Zeugnissaetze
            :titel="t('ansichten.saetze.vorschlaege')"
            :saetze="saetze"
            :werte="werte"
            @satz-kopiert="kopiert = $event"
          />
        </div>

        <p v-if="kopiert" class="auswahl" data-testid="kopiert">
          {{ t('ansichten.saetze.kopiert') }}
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
