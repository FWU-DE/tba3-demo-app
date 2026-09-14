// Holt die erklärenden Dokumente aus dem Spezifikations-Repository und legt sie
// als Kopie neben die Seiten. Gerendert werden sie beim Build
// (tools/build-site.mjs), zu lesen sind sie unter /dokumentation.
//
//   npm run docs:update
//
// Danach den Stand prüfen (git diff) und mit committen. Der Diff ist die
// eigentliche Aufgabe dieses Skripts: er zeigt, was sich oben geändert hat.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DOKUMENTE, ORDNER, lokalerVerweis, rohUrl } from './dokumente.mjs';

mkdirSync(ORDNER, { recursive: true });

let fehler = 0;
let geaendert = 0;
const unbekannteVerweise = new Set();

for (const dok of DOKUMENTE) {
  const url = rohUrl(dok);
  let text;
  try {
    const antwort = await fetch(url);
    if (!antwort.ok) {
      console.error(`✗ ${dok.datei}: ${antwort.status} ${antwort.statusText}`);
      fehler++;
      continue;
    }
    text = await antwort.text();
  } catch (err) {
    console.error(`✗ ${dok.datei}: ${err.message}`);
    fehler++;
    continue;
  }

  // Eine Fehlerseite oder eine leere Antwort soll die eingecheckte Kopie nicht
  // überschreiben — lieber den alten Stand behalten und Bescheid sagen.
  if (!text.trimStart().startsWith('# ') || text.length < 500) {
    console.error(`✗ ${dok.datei}: Antwort sieht nicht nach dem Dokument aus (${text.length} Zeichen) — nichts geschrieben`);
    fehler++;
    continue;
  }

  const ziel = join(ORDNER, dok.datei);
  const alt = existsSync(ziel) ? readFileSync(ziel, 'utf8') : null;
  if (alt === text) {
    console.log(`· ${dok.datei} unverändert`);
  } else {
    writeFileSync(ziel, text);
    geaendert++;
    console.log(`✓ ${dok.datei} ${alt === null ? 'angelegt' : 'aktualisiert'} (${text.length} Zeichen)`);
  }

  // Verweist ein Dokument auf ein Markdown, das hier nicht geführt wird, ginge
  // der Link im Deployment ins Leere. Das fällt sonst erst im Browser auf.
  for (const [, href] of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/\.md(#|$)/.test(href) && !lokalerVerweis(href)) unbekannteVerweise.add(href);
  }
}

if (fehler === DOKUMENTE.length) {
  console.error('\n✗ Kein Dokument konnte geholt werden — Stand unverändert.');
  process.exit(1);
}

writeFileSync(
  join(ORDNER, 'stand.json'),
  `${JSON.stringify({ abgerufen: new Date().toISOString().slice(0, 10), quelle: 'indibit-eu/tba3', zweig: 'main' }, null, 2)}\n`
);

if (unbekannteVerweise.size > 0) {
  console.log('\n! Verweise auf Dokumente, die hier nicht geführt werden:');
  for (const href of unbekannteVerweise) console.log(`    ${href}`);
  console.log('  → in DOKUMENTE (tools/dokumente.mjs) aufnehmen oder als externen Link belassen.');
}

console.log(`\n${geaendert === 0 ? 'Alles auf Stand' : `${geaendert} Dokument(e) aktualisiert`} → apps/portal/dokumentation/`);
console.log('  Stand prüfen: git diff -- apps/portal/dokumentation/');
if (fehler > 0) process.exit(1);
