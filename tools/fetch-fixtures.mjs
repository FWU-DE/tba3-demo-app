// Zieht die Antworten des Referenz-Mock-Servers einmal ab und legt sie als
// data/fixtures.mjs im Repository ab. Aus dieser Datei bedient der eigene
// Mock (api/, tools/mock-server.mjs, tools/serve-site.mjs) die Anwendungen —
// zur Laufzeit hängt damit nichts mehr an apps.indibit.eu.
//
//   npm run fixtures:update
//
// Danach `git diff --stat -- data/fixtures.mjs` prüfen und mit committen.

import { writeFileSync } from 'node:fs';
import { brotliCompressSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalisiereAbfrage } from './mock-schluessel.mjs';

const QUELLE = process.env.TBA3_API_BASE_URL || 'https://apps.indibit.eu/tba3-api';
const ZIEL = join(dirname(fileURLToPath(import.meta.url)), '../data/fixtures.mjs');

// IDs aus den Beispielen der Spezifikation plus denen, die die Demoanwendung
// in apps/demo/src/utils/constants.js kennt.
const GRUPPEN = [
  '3a-deutsch', '3b-deutsch', '3c-deutsch',
  '3a-mathe', '3b-mathe', '3c-mathe',
  '8a-deutsch', '8b-deutsch', '8c-deutsch',
  '8a-mathe', '8b-mathe', '8c-mathe', '8d-mathe',
  '8a-englisch', '8b-englisch', '8c-englisch',
  '8a-franzoesisch', '8b-franzoesisch', '8c-franzoesisch',
];
const SCHULEN = ['gs-musterstadt', 'gym-beispielstadt'];
const LAENDER = ['beispielland'];

// Die Spezifikation kennt an Abfrageparametern type, comparison und aggregation.
// gender und languageAtHome schickt die Demoanwendung zwar mit, die Antwort
// ändert sich dadurch nicht — deshalb hier keine eigenen Varianten dafür.
//
// 'group,students' wird nicht abgezogen: die Antwort ist exakt die Verkettung
// von Gruppen- und Schülerdaten und wird beim Nachschlagen zusammengesetzt
// (tools/mock.mjs). Das spart rund die Hälfte der Datenmenge.
const TYPEN = ['', 'students'];
const AGGREGATIONEN = ['competence', 'gender'];

const varianten = (art, endpunkt) => {
  if (endpunkt === 'aggregations') {
    return AGGREGATIONEN.flatMap((aggregation) =>
      ['', 'students'].map((type) => ({ aggregation, ...(type && { type }) }))
    );
  }
  const typen = art === 'states' ? [...TYPEN, 'state,district'] : TYPEN;
  return typen.map((type) => (type ? { type } : {}));
};

const ENTITAETEN = [
  ...GRUPPEN.map((id) => ['groups', id]),
  ...SCHULEN.map((id) => ['schools', id]),
  ...LAENDER.map((id) => ['states', id]),
];
const ENDPUNKTE = ['competence-levels', 'items', 'aggregations'];

const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));

const fixtures = {};
let geholt = 0;
let fehlend = 0;

for (const [art, id] of ENTITAETEN) {
  for (const endpunkt of ENDPUNKTE) {
    for (const query of varianten(art, endpunkt)) {
      const pfad = `/${art}/${id}/${endpunkt}`;
      const suchstring = new URLSearchParams(query).toString();
      const url = `${QUELLE}${pfad}${suchstring ? `?${suchstring}` : ''}`;

      try {
        const antwort = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!antwort.ok) {
          console.warn(`· ${antwort.status} ${pfad}${suchstring ? `?${suchstring}` : ''}`);
          fehlend++;
        } else {
          // Jede Antwort einzeln packen — zur Laufzeit wird nur die angefragte
          // wieder ausgepackt, nicht der gesamte Bestand.
          const roh = JSON.stringify(await antwort.json());
          fixtures[normalisiereAbfrage(pfad, query)] = brotliCompressSync(roh).toString('base64');
          geholt++;
        }
      } catch (fehler) {
        console.error(`✗ ${pfad}: ${fehler.message}`);
        fehlend++;
      }
      // Den Referenzserver nicht überrennen
      await schlaf(60);
    }
  }
}

const inhalt = `// Automatisch erzeugt von tools/fetch-fixtures.mjs — nicht von Hand bearbeiten.
//
// Abgezogen am ${new Date().toISOString().slice(0, 10)} von ${QUELLE}.
// Aktualisieren: npm run fixtures:update
//
// Jeder Wert ist die zugehörige Antwort als JSON, brotli-gepackt und base64-kodiert;
// ausgepackt wird erst beim Nachschlagen (tools/mock.mjs).

export const stand = '${new Date().toISOString()}';
export const quelle = '${QUELLE}';

export default ${JSON.stringify(fixtures, null, 0)};
`;

writeFileSync(ZIEL, inhalt);

console.log(`\n✓ ${geholt} Antworten abgelegt${fehlend ? `, ${fehlend} ohne Ergebnis` : ''}`);
console.log(`  ${ZIEL} (${(inhalt.length / 1024).toFixed(0)} KB)`);
