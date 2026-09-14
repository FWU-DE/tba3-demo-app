// Setzt die einzelnen App-Builds zu einer Site zusammen:
//
//   dist/            ← apps/portal (statisch, kein Build)
//   dist/demo/       ← apps/demo/dist       (React, base '/demo/')
//   dist/katalog/    ← apps/katalog/dist    (Vue,   base '/katalog/')
//   dist/beispiele/  ← apps/beispiele       (sobald vorhanden)
//
// Aufruf: node tools/build-site.mjs (via `npm run build` nach den App-Builds).

import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOKUMENTE, seite, stand, uebersicht } from './dokumente.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

// [Quelle, Zielpfad in dist, Pflicht?]
const PARTS = [
  ['apps/portal', '', true],
  ['apps/demo/dist', 'demo', true],
  ['apps/katalog/dist', 'katalog', true],
  ['apps/beispiele', 'beispiele', false],
];

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const [from, to, required] of PARTS) {
  const src = join(root, from);
  if (!existsSync(src)) {
    if (required) {
      console.error(`✗ ${from} fehlt — wurde der App-Build ausgeführt? (npm run build)`);
      process.exit(1);
    }
    console.log(`· ${from} (noch) nicht vorhanden — übersprungen`);
    continue;
  }
  const ziel = join(dist, to);
  cpSync(src, ziel, {
    recursive: true,
    // README.md und Tests o. ä. gehören nicht ins Deployment
    filter: (p) => !p.endsWith('README.md') && !p.endsWith('.test.mjs'),
  });

  // Ein Bereich, der nach dem Filtern leer ist, gehört nicht ins Deployment.
  if (to && readdirSync(ziel).length === 0) {
    rmSync(ziel, { recursive: true, force: true });
    console.log(`· ${from} enthält noch keine Inhalte — übersprungen`);
    continue;
  }
  console.log(`✓ ${from} → dist/${to || ''}`);
}

// Die ausgelieferte Spezifikation bekommt die Server ergänzt, die tatsächlich
// erreichbar sind: die eigenen Beispieldaten und — über denselben Host geleitet —
// der Referenzserver. Die eingecheckte Datei bleibt die unveränderte Kopie aus
// indibit-eu/tba3, damit `npm run spec:update` konfliktfrei bleibt.
const specDatei = join(dist, 'schnittstelle/tba3-spec.yml');
const spec = readFileSync(specDatei, 'utf8');
const serverBlock = /^servers:\n(?: {2}[-\s].*\n)+/m;
if (!serverBlock.test(spec)) {
  console.error('✗ servers-Block in tba3-spec.yml nicht gefunden — Aufbau der Spezifikation geändert?');
  process.exit(1);
}
writeFileSync(specDatei, spec.replace(serverBlock, `servers:
  # Ergänzt von tools/build-site.mjs — im Quell-Repository steht nur der Referenzserver.
  - url: /
    description: Diese Seite — eigene Beispieldaten
  - url: /referenz-api
    description: Referenzserver von indibit (über diese Seite geleitet)
`));
console.log('✓ Server der Spezifikation ergänzt');

// Die erklärenden Dokumente der Spezifikation liegen als Markdown-Kopie unter
// apps/portal/dokumentation (nachgezogen mit `npm run docs:update`) und werden
// hier zu Seiten gerendert — so stehen Konzepte, Endpunkt-Referenz und Rezepte
// in der Seite selbst statt nur als Link nach GitHub. Die Markdown-Dateien sind
// über den Portal-Kopierschritt schon in dist/ und bleiben dort abrufbar.
const standDaten = stand();
for (const dok of DOKUMENTE) {
  const quelle = join(root, 'apps/portal/dokumentation', dok.datei);
  if (!existsSync(quelle)) {
    console.error(`✗ apps/portal/dokumentation/${dok.datei} fehlt — \`npm run docs:update\` ausführen`);
    process.exit(1);
  }
  const ziel = join(dist, 'dokumentation', dok.slug);
  mkdirSync(ziel, { recursive: true });
  writeFileSync(join(ziel, 'index.html'), seite(dok, readFileSync(quelle, 'utf8'), standDaten));
}
writeFileSync(join(dist, 'dokumentation/index.html'), uebersicht(DOKUMENTE, standDaten));
console.log(`✓ ${DOKUMENTE.length} Dokumente gerendert → dist/dokumentation/`);

// Die gemeinsamen Dateien — Navigationsleiste, Sprachwahl und Containerregel — liegen unter
// /gemeinsam/ und werden von allen Bereichen eingebunden, auch von denen, die
// React bzw. Vue nutzen. Die Vite-Erweiterung daneben gehört nicht dazu: sie
// liefert dieselben Dateien im Dev-Server aus.
mkdirSync(join(dist, 'gemeinsam'), { recursive: true });
const gemeinsam = readdirSync(join(root, 'apps/shared'))
  .filter((datei) => /\.(js|css)$/.test(datei) && !datei.startsWith('vite-plugin-') && !datei.endsWith('.test.mjs'));
for (const datei of gemeinsam) {
  copyFileSync(join(root, 'apps/shared', datei), join(dist, 'gemeinsam', datei));
}
console.log(`✓ apps/shared/{${gemeinsam.join(', ')}} → dist/gemeinsam/`);

// Die Bausteine liegen als reines ESM vor und werden unverändert nach
// /bausteine/ kopiert — ohne Build, ohne Bündel. Wer sie nachnutzen will,
// braucht dann nur eine Zeile:
//
//   <script type="module">
//     import { registrieren } from 'https://<host>/bausteine/webcomponents/index.js';
//     registrieren();
//   </script>
//
// Die Import-Pfade innerhalb des Pakets sind relativ, deshalb genügt das Kopieren
// des Verzeichnisbaums; ein Bundler würde hier nur eine Abhängigkeit hinzufügen.
const bausteineQuelle = join(root, 'packages/bausteine');
const BAUSTEIN_ORDNER = ['kern', 'webcomponents', 'vue', 'react'];
let bausteineDateien = 0;
for (const ordner of BAUSTEIN_ORDNER) {
  const von = join(bausteineQuelle, ordner);
  const nach = join(dist, 'bausteine', ordner);
  mkdirSync(nach, { recursive: true });
  for (const datei of readdirSync(von).filter((d) => d.endsWith('.js'))) {
    copyFileSync(join(von, datei), join(nach, datei));
    bausteineDateien += 1;
  }
}
console.log(`✓ packages/bausteine → dist/bausteine/ (${bausteineDateien} Dateien)`);

// Swagger UI rendert die API-Referenz unter /schnittstelle. Die Dateien kommen aus
// node_modules statt von einem CDN — sonst hinge das Deployment an fremder Infrastruktur.
const SWAGGER_DATEIEN = ['swagger-ui-bundle.js', 'swagger-ui.css'];
for (const datei of SWAGGER_DATEIEN) {
  const quelle = join(root, 'node_modules/swagger-ui-dist', datei);
  if (!existsSync(quelle)) {
    console.error(`✗ node_modules/swagger-ui-dist/${datei} fehlt — \`npm install\` ausführen`);
    process.exit(1);
  }
  copyFileSync(quelle, join(dist, 'schnittstelle', datei));
}
console.log(`✓ swagger-ui → dist/schnittstelle/`);

console.log('\nSite gebaut → dist/  (lokal ansehen: npm run preview)');
