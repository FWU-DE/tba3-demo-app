// Setzt die einzelnen App-Builds zu einer Site zusammen:
//
//   dist/            ← apps/portal (statisch, kein Build)
//   dist/demo/       ← apps/demo/dist       (React, base '/demo/')
//   dist/katalog/    ← apps/katalog/dist    (Vue,   base '/katalog/')
//   dist/beispiele/  ← apps/beispiele       (sobald vorhanden)
//
// Aufruf: node tools/build-site.mjs (via `npm run build` nach den App-Builds).

import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
    // README.md o. ä. gehören nicht ins Deployment
    filter: (p) => !p.endsWith('README.md'),
  });

  // Ein Bereich, der nach dem Filtern leer ist, gehört nicht ins Deployment.
  if (to && readdirSync(ziel).length === 0) {
    rmSync(ziel, { recursive: true, force: true });
    console.log(`· ${from} enthält noch keine Inhalte — übersprungen`);
    continue;
  }
  console.log(`✓ ${from} → dist/${to || ''}`);
}

// Redoc rendert die API-Referenz unter /schnittstelle. Das Bundle kommt aus
// node_modules statt von einem CDN — sonst hinge das Deployment an fremder Infrastruktur.
const redoc = join(root, 'node_modules/redoc/bundles/redoc.standalone.js');
if (existsSync(redoc)) {
  copyFileSync(redoc, join(dist, 'schnittstelle/redoc.standalone.js'));
  console.log('✓ redoc.standalone.js → dist/schnittstelle/');
} else {
  console.error('✗ node_modules/redoc fehlt — `npm install` ausführen');
  process.exit(1);
}

console.log('\nSite gebaut → dist/  (lokal ansehen: npm run preview)');
