// Setzt den Materialien-Entwurf aus indibit-eu/tba3#54 zu einer eigenständigen
// OpenAPI-Datei zusammen und legt die mitgelieferten Beispiele als Mock-Antworten ab.
//
//   npm run material-spec:update
//
// Der Entwurf liegt dort als Fragmente (paths/, schemas/, beispiele/) und nicht als
// fertige Spezifikation — deshalb dieses Skript statt einer schlichten Kopie.
// Solange der Pull Request offen ist, wird aus seinem Branch gelesen.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync } from 'node:zlib';
import { load as yamlLaden, dump as yamlSchreiben } from 'js-yaml';

const BRANCH = 'https://raw.githubusercontent.com/janrenz/tba3/wip/materialien-schnittstelle-entwurf';
const ENTWURF = `${BRANCH}/docs/entwuerfe/materialien`;
const HIER = dirname(fileURLToPath(import.meta.url));

const hole = async (url) => {
  const antwort = await fetch(url);
  if (!antwort.ok) throw new Error(`${antwort.status} für ${url}`);
  return antwort.text();
};

const holeYaml = async (url) => yamlLaden(await hole(url));
const holeJson = async (url) => JSON.parse(await hole(url));

// Die Fragmente verweisen mit Dateipfaden aufeinander; in einer einzelnen Datei
// müssen daraus interne Verweise werden.
const REF_ZUORDNUNG = {
  '../schemas/material.yml': '#/components/schemas/Material',
  './material.yml': '#/components/schemas/Material',
  './material-attachment.yml': '#/components/schemas/MaterialAttachment',
  './material-reference.yml': '#/components/schemas/MaterialReference',
  '../../../../api/components/schemas/subject.yml': '#/components/schemas/Subject',
  '../../../../api/components/schemas/domain.yml': '#/components/schemas/Domain',
};

const refsUmschreiben = (knoten) => {
  if (Array.isArray(knoten)) return knoten.map(refsUmschreiben);
  if (knoten && typeof knoten === 'object') {
    return Object.fromEntries(
      Object.entries(knoten).map(([schluessel, wert]) => {
        if (schluessel === '$ref' && typeof wert === 'string') {
          const ziel = REF_ZUORDNUNG[wert];
          if (!ziel) throw new Error(`Unbekannter Verweis: ${wert}`);
          return [schluessel, ziel];
        }
        return [schluessel, refsUmschreiben(wert)];
      })
    );
  }
  return knoten;
};

console.log('Entwurf aus indibit-eu/tba3#54 holen …');

const [liste, einzeln, material, attachment, referenz, subject, domain] = await Promise.all([
  holeYaml(`${ENTWURF}/paths/materials-list.yml`),
  holeYaml(`${ENTWURF}/paths/materials-by-id.yml`),
  holeYaml(`${ENTWURF}/schemas/material.yml`),
  holeYaml(`${ENTWURF}/schemas/material-attachment.yml`),
  holeYaml(`${ENTWURF}/schemas/material-reference.yml`),
  holeYaml(`${BRANCH}/api/components/schemas/subject.yml`),
  holeYaml(`${BRANCH}/api/components/schemas/domain.yml`),
]);

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'TBA III — Materialien',
    summary: 'Entwurf: Begleitmaterialien zu Auswertungsdaten',
    description: [
      '**Status: Entwurf.** Diese Erweiterung ist noch nicht Teil der offiziellen',
      'Spezifikation — sie steht als Pull Request',
      '[indibit-eu/tba3#54](https://github.com/indibit-eu/tba3/pull/54) zur Diskussion.',
      '',
      'Materialien (Handreichungen, Fördermaterial, Musterlösungen, Transkripte, …)',
      'werden über `attachments[]` an Bezugspunkte der Auswertung geknüpft: an den Test,',
      'eine Kompetenz oder Leitidee, eine Aufgabe, ein Item, eine Kompetenzstufe — oder',
      'ohne spezifischen Bezug.',
      '',
      'Die Erweiterung ist additiv: alle Felder sind optional, bestehende Backends und',
      'Frontends bleiben spec-konform. Die vollständige Begründung steht im Entwurf unter',
      '[docs/entwuerfe/materialien](https://github.com/indibit-eu/tba3/pull/54/files).',
    ].join('\n'),
    version: '0.1-entwurf',
    license: { name: 'MIT', url: 'https://opensource.org/license/MIT' },
  },
  servers: [{ url: '/', description: 'Diese Seite — Beispiele aus dem Entwurf' }],
  tags: [
    {
      name: 'materials',
      description: 'Begleitmaterialien zu Tests, Aufgaben, Items, Kompetenzen und Kompetenzstufen',
    },
  ],
  paths: {
    '/materials': { get: refsUmschreiben(liste.get) },
    '/materials/{id}': { get: refsUmschreiben(einzeln.get) },
  },
  components: {
    schemas: {
      Material: refsUmschreiben(material),
      MaterialAttachment: refsUmschreiben(attachment),
      MaterialReference: refsUmschreiben(referenz),
      Subject: refsUmschreiben(subject),
      Domain: refsUmschreiben(domain),
    },
  },
};

const kopf = [
  '# Zusammengesetzt von tools/build-material-spec.mjs — nicht von Hand bearbeiten.',
  '#',
  '# Quelle: indibit-eu/tba3#54 (Branch janrenz:wip/materialien-schnittstelle-entwurf),',
  '# dort als Fragmente unter docs/entwuerfe/materialien/.',
  '# Aktualisieren: npm run material-spec:update',
  '',
].join('\n');

const specDatei = join(HIER, '../apps/portal/schnittstelle/material-spec.yml');
writeFileSync(specDatei, kopf + yamlSchreiben(spec, { lineWidth: 100, noRefs: true }));
console.log(`✓ ${specDatei.split('/').slice(-1)[0]} geschrieben`);

// ── Beispiele als Mock-Antworten ──────────────────────────────────────────────
const materialien = await holeJson(`${ENTWURF}/beispiele/material-list.json`);
const fixtures = {
  '/materials': materialien,
  ...Object.fromEntries(materialien.map((m) => [`/materials/${m.id}`, m])),
};

const gepackt = Object.fromEntries(
  Object.entries(fixtures).map(([k, v]) => [k, brotliCompressSync(JSON.stringify(v)).toString('base64')])
);

const fixtureDatei = join(HIER, '../data/material-fixtures.mjs');
writeFileSync(
  fixtureDatei,
  `// Automatisch erzeugt von tools/build-material-spec.mjs — nicht von Hand bearbeiten.
//
// Beispiele aus dem Materialien-Entwurf (indibit-eu/tba3#54), damit "Try it out"
// in der API-Referenz auch für /materials etwas zurückgibt.
// Aktualisieren: npm run material-spec:update

export default ${JSON.stringify(gepackt, null, 0)};
`
);
console.log(`✓ material-fixtures.mjs mit ${Object.keys(fixtures).length} Antworten`);
