// Erzeugt die Abbildungen der Dokumentseiten neu:
//
//   npm run build && npm run preview     # in einem zweiten Fenster
//   npm run docs:bilder
//
// Die Bilder unter apps/portal/dokumentation/bilder/ zeigen Oberflächen und
// erzeugte Dateien. Beide veralten, wenn sich die Demoanwendung ändert — und
// ein veraltetes Bild in einer Dokumentation ist schlimmer als keines, weil
// niemand ihm ansieht, dass es von gestern ist. Deshalb entstehen sie hier aus
// dem ausgelieferten Stand und nicht von Hand.
//
// Gebraucht werden dafür zwei Programme, die nicht über npm kommen:
// `pdftoppm` (poppler-utils) rendert die PDF-Seite, `magick` (ImageMagick)
// skaliert sie. Fehlt eines, sagt das Skript welches — die eingecheckten
// Bilder bleiben dann, wie sie sind.

import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = join(root, 'apps/portal/dokumentation/bilder');
const BASIS = process.env.DOCS_BASIS ?? 'http://localhost:4173';
const BREITE = 1100; // gut doppelt so breit wie die Textspalte (760px)

const vorhanden = (programm) => {
  try {
    execFileSync(programm, ['-v'], { stdio: 'ignore' });
    return true;
  } catch (err) {
    return err.status !== undefined; // aufgerufen, aber mit Fehlercode: da
  }
};

for (const [programm, paket] of [['pdftoppm', 'poppler-utils'], ['magick', 'ImageMagick']]) {
  if (!vorhanden(programm)) {
    console.error(`✗ ${programm} fehlt — aus ${paket} installieren. Nichts geschrieben.`);
    process.exit(1);
  }
}

const tmp = mkdtempSync(join(tmpdir(), 'tba3-dokumentbilder-'));
mkdirSync(ZIEL, { recursive: true });

/** Erste Seite eines PDF als PNG, auf Textspaltenbreite skaliert. */
const seiteAlsBild = (pdf, name) => {
  execFileSync('pdftoppm', ['-png', '-r', '130', '-f', '1', '-l', '1', pdf, join(tmp, name)]);
  execFileSync('magick', [join(tmp, `${name}-1.png`), '-resize', `${BREITE}x`, '-strip', join(ZIEL, `${name}.png`)]);
  console.log(`✓ ${name}.png`);
};

const browser = await chromium.launch();
// Die Dokumente sind deutsch — die Abbildungen also auch.
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });

const laden = async (pfad) => {
  const seite = await ctx.newPage();
  await seite.goto(`${BASIS}${pfad}`, { waitUntil: 'networkidle' });
  return seite;
};

const herunterladen = async (seite, testId, name) => {
  const warten = seite.waitForEvent('download', { timeout: 30_000 });
  await seite.getByTestId(testId).click();
  const datei = await warten;
  const pfad = join(tmp, `${name}.pdf`);
  await datei.saveAs(pfad);
  return pfad;
};

// ── Die Schülerliste im Observer-Modus ───────────────────────────────────────
{
  const seite = await laden('/demo/?lang=de&tab=students');
  await seite.getByTestId('ansicht-schueler').waitFor();
  await seite.getByTestId('observer-schalter').click();
  await seite.waitForTimeout(400);
  const roh = join(tmp, 'observer-roh.png');
  await seite.getByTestId('schueler-liste').screenshot({ path: roh });
  // Unten abschneiden, wo die Liste mitten in einer Zeile aufhört: ein
  // angeschnittener Datensatz sieht nach Fehler aus, nicht nach Ausschnitt.
  execFileSync('magick', [roh, '-crop', '590x712+0+0', '+repage', '-strip', join(ZIEL, 'observer-liste.png')]);
  console.log('✓ observer-liste.png');
  await seite.close();
}

// ── Die individuelle Rückmeldung ─────────────────────────────────────────────
{
  // Eine Schülerin auf Stufe III: dort greifen mehrere Materialien, die Seite
  // zeigt also auch den Abschnitt, um den es geht.
  const seite = await laden('/demo/?lang=de&tab=students&student=st-3a-deutsch-4');
  await seite.getByTestId('schueler-datenblatt').waitFor();
  seiteAlsBild(await herunterladen(seite, 'datenblatt-pdf', 'rueckmeldung'), 'pdf-rueckmeldung');
  await seite.close();
}

// ── Die Materialzuordnung ────────────────────────────────────────────────────
{
  const seite = await laden('/demo/?lang=de&tab=materials');
  await seite.getByTestId('ansicht-materialien').waitFor();
  await seite.getByTestId('materialien-stufe-II').click();
  for (const nr of [0, 1, 2]) {
    const karte = seite.getByTestId(/^material-/).nth(nr);
    if (await karte.count()) await karte.click();
  }
  await seite.getByTestId('materialien-zuweisen').click();
  seiteAlsBild(await herunterladen(seite, 'export-pdf', 'materialzuordnung'), 'pdf-materialzuordnung');
  await seite.close();
}

await browser.close();
console.log(`\nFertig → apps/portal/dokumentation/bilder/`);
console.log('  Stand prüfen: git diff --stat -- apps/portal/dokumentation/bilder/');
