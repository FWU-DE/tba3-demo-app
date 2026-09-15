<script setup>
// Kontextmerkmal als Ring — aus der Schulrückmeldung von indibit herausgezogen.
//
// Die Ansicht zeigt, was vor jedem Ergebnis kommt: wer ist diese Gruppe? Die
// Schnittstelle führt Kovariaten je Schüler:in, und genau daraus baut indibit
// seine vier Ringe. Hier sind es zwei, weil die Beispieldaten zwei führen.
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import { KontextmerkmalRing } from '@tba3/bausteine/vue';
import ComponentDocs from '../components/ComponentDocs.vue';
import { t } from '../i18n';

const DOCS = {
  githubFile: 'kontextmerkmal-ring.js',
  githubPath: 'packages/bausteine/webcomponents/kontextmerkmal-ring.js',
  propsDocs: [
    { name: 'label', type: 'String', default: "''", pfad: 'ansichten.kontext.props.label' },
    { name: 'segmente', type: 'Array', required: true, pfad: 'ansichten.kontext.props.segmente' },
    { name: 'geordnet', type: 'Boolean', default: 'false', pfad: 'ansichten.kontext.props.geordnet' },
    { name: 'mitte', type: 'String', default: "''", pfad: 'ansichten.kontext.props.mitte' },
    { name: 'mitteLabel', type: 'String', default: "''", pfad: 'ansichten.kontext.props.mitteLabel' },
  ],
  dataShape: `// segmente-Element
{
  label: 'Deutsch',   // Beschriftung der Kategorie
  wert:  17,          // Häufigkeit; es wird normiert
  farbe: '#2563eb',   // optional — ohne läuft es durch die Stufenfarben
}

// geordnet: true → die Mitte trägt die Median-Kategorie statt der Summe.
// Nur setzen, wenn die Reihenfolge eine Bedeutung hat (A–E, Stufen).`,
  apiEndpoints: [
    { method: 'GET', path: '/groups/{id}/items?type=students', pfad: 'ansichten.kontext.endpunkte.gruppe' },
  ],
  apiNotePfad: 'ansichten.kontext.hinweis',
};

const propsDocs = computed(() => DOCS.propsDocs.map(({ pfad, ...r }) => ({ ...r, description: t(pfad) })));
const apiEndpoints = computed(() => DOCS.apiEndpoints.map(({ pfad, ...r }) => ({ ...r, description: t(pfad) })));

const GROUPS = [
  { id: '3a-deutsch', label: '3a Deutsch' },
  { id: '3b-deutsch', label: '3b Deutsch' },
  { id: '8a-deutsch', label: '8a Deutsch' },
  { id: '8a-mathe', label: '8a Mathematik' },
];

// Die Merkmale, die die Schnittstelle führt. Geschlecht und Sprache sind
// **ungeordnet** — deshalb keine Median-Mitte, sondern die Gesamtzahl, und
// deshalb eigene Farben statt der Vorgabe des Bausteins.
//
// Die Vorgabe läuft durch die Stufenfarben von Rot nach Grün. Das ist für
// geordnete Kategorien richtig (A–E) und für „männlich, weiblich, divers"
// falsch: eine Farbskala mit Richtung behauptet eine Rangfolge. Farben, die
// etwas behaupten, gehören zu den Daten — dieselbe Regel wie bei den
// Übersichtskarten.
const UNGEORDNET = ['#2563eb', '#7c3aed', '#0891b2', '#d97706', '#64748b'];

const MERKMALE = [
  { typ: 'gender', pfad: 'ansichten.kontext.geschlecht' },
  { typ: 'languageAtHome', pfad: 'ansichten.kontext.sprache' },
];

const selectedGroup = ref(GROUPS[0]);
const loading = ref(false);
const error = ref(null);
const eintraege = ref([]);

const laden = async () => {
  loading.value = true; error.value = null;
  try {
    const { data } = await axios.get(`/groups/${selectedGroup.value.id}/items`, { params: { type: 'students' } });
    eintraege.value = Array.isArray(data) ? data : [data];
  } catch (e) {
    error.value = e.message;
    eintraege.value = [];
  } finally { loading.value = false; }
};

onMounted(laden);
watch(selectedGroup, laden);

// Je Schüler:in einmal zählen — die Antwort führt einen Eintrag je Domäne.
const ringe = computed(() => {
  const gesehen = new Set();
  const zaehler = new Map(MERKMALE.map((m) => [m.typ, new Map()]));
  for (const eintrag of eintraege.value) {
    if (eintrag.type !== 'student' || gesehen.has(eintrag.id)) continue;
    gesehen.add(eintrag.id);
    for (const { typ } of MERKMALE) {
      const wert = eintrag.covariates?.find((k) => k.type === typ)?.value;
      if (!wert) continue;
      const m = zaehler.get(typ);
      m.set(wert, (m.get(wert) ?? 0) + 1);
    }
  }
  return MERKMALE.map(({ typ, pfad }) => ({
    typ,
    label: t(pfad),
    segmente: [...zaehler.get(typ)].map(([wert, anzahl], i) => ({
      label: t(`ansichten.kontext.werte.${wert}`) || wert,
      wert: anzahl,
      farbe: UNGEORDNET[i % UNGEORDNET.length],
    })),
  })).filter((r) => r.segmente.length > 0);
});

const gewaehlt = ref(null);
</script>

<template>
  <div class="ansicht">
    <header>
      <h1>{{ t('ansichten.kontext.titel') }}</h1>
      <p>{{ t('ansichten.kontext.zweck') }}</p>
    </header>

    <Card>
      <template #content>
        <div class="steuerung">
          <Select v-model="selectedGroup" :options="GROUPS" optionLabel="label"
                  data-testid="gruppe-waehlen" class="w-64" />
        </div>

        <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
        <Skeleton v-else-if="loading" height="220px" />
        <div v-else class="ringe" data-testid="ringe">
          <KontextmerkmalRing
            v-for="ring in ringe"
            :key="ring.typ"
            :label="ring.label"
            :segmente="ring.segmente"
            @segment-gewaehlt="gewaehlt = { ring: ring.label, ...$event }"
          />
        </div>

        <p v-if="gewaehlt" class="auswahl" data-testid="auswahl">
          {{ gewaehlt.ring }}: {{ gewaehlt.label }} — {{ gewaehlt.prozent }} %
        </p>
      </template>
    </Card>

    <ComponentDocs v-bind="DOCS" :propsDocs="propsDocs" :apiEndpoints="apiEndpoints" />
  </div>
</template>

<style scoped>
.ansicht { display: flex; flex-direction: column; gap: 1.5rem; }
.steuerung { margin-bottom: 1rem; }
.ringe { display: flex; flex-wrap: wrap; gap: 2.5rem; align-items: flex-start; }
.auswahl { margin-top: 1rem; color: var(--p-text-muted-color); }
</style>
