// Holt die OpenAPI-Spezifikation aus dem Spezifikations-Repository und legt sie
// neben der Referenz-Seite ab. Die Spec wird bewusst eingecheckt statt zur
// Laufzeit geladen — so hängt die Referenz an nichts Externem.
//
//   npm run spec:update
//
// Danach den Stand prüfen (git diff) und mit committen.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const QUELLE = 'https://raw.githubusercontent.com/indibit-eu/tba3/refs/heads/main/tba3-spec.yml';
const ZIEL = join(
  dirname(fileURLToPath(import.meta.url)),
  '../apps/portal/schnittstelle/tba3-spec.yml'
);

const antwort = await fetch(QUELLE);
if (!antwort.ok) {
  console.error(`✗ ${antwort.status} ${antwort.statusText} für ${QUELLE}`);
  process.exit(1);
}

const spec = await antwort.text();
if (!spec.startsWith('openapi:')) {
  console.error('✗ Antwort sieht nicht nach einer OpenAPI-Spezifikation aus — nichts geschrieben');
  process.exit(1);
}

writeFileSync(ZIEL, spec);

const version = spec.match(/^\s{2}version:\s*'?([^'\n]+)'?/m)?.[1] ?? 'unbekannt';
console.log(`✓ Spezifikation ${version} aktualisiert (${spec.length} Zeichen)`);
console.log(`  ${ZIEL}`);
console.log('\n  Stand prüfen: git diff -- apps/portal/schnittstelle/tba3-spec.yml');
