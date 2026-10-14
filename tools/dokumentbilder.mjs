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

// ── Die Hilfe-Ansicht mit der MCP-Anbindung ──────────────────────────────────
{
  const seite = await laden('/demo/?lang=de&tab=help');
  await seite.getByTestId('ansicht-hilfe').waitFor();
  await seite.waitForTimeout(300);
  // Einleitung und Betrieb im Container — und nur die. Der Abschnitt darunter
  // zeigt die Client-Konfiguration mit einer Adresse aus `window.location.origin`;
  // in einer Aufnahme stünde dort der Port, unter dem die Vorschau gerade lief.
  //
  // Ausgeschnitten wird aus der ganzen Seite statt über das Element: eine
  // Element-Aufnahme rollt ihr Ziel in den Blick, und dort liegt die
  // Navigationsleiste darüber.
  const kasten = await seite.evaluate(() => {
    const ansicht = document.querySelector('[data-testid="ansicht-hilfe"]');
    const oben = ansicht.getBoundingClientRect();
    const zweiter = ansicht.querySelectorAll('section')[1].getBoundingClientRect();
    return {
      x: Math.round(oben.left + window.scrollX),
      y: Math.round(oben.top + window.scrollY),
      width: Math.round(oben.width),
      height: Math.round(zweiter.top - oben.top) - 16,
    };
  });
  await seite.screenshot({ path: join(ZIEL, 'mcp-hilfe.png'), fullPage: true, clip: kasten });
  console.log('✓ mcp-hilfe.png');
  await seite.close();
}

// ── Machbarkeitsstudie: Material sammeln, MUNDO, Export ─────────────────────
//
// Diese Seiten gibt es auf Deutsch und Englisch, ihre Bilder also auch:
// `<name>-de.png` und `<name>-en.png`. Die Oberfläche wird über ?lang=
// umgeschaltet, das PDF folgt der Sprache beim Klick.
//
// Ausgeschnitten wird wie bei der Hilfe-Ansicht aus der ganzen Seite: eine
// Element-Aufnahme rollt ihr Ziel in den Blick, und dort läge die
// Navigationsleiste darüber.
const ausschnitt = async (seite, testId, datei) => {
  const kasten = await seite.getByTestId(testId).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.left + window.scrollX),
      y: Math.round(r.top + window.scrollY),
      width: Math.round(r.width),
      height: Math.round(r.height),
    };
  });
  await seite.screenshot({ path: join(ZIEL, datei), fullPage: true, clip: kasten });
  console.log(`✓ ${datei}`);
};

const MUNDO_BEISPIEL = {
  de: 'Flächeninhalt von Rechtecken',
  en: 'Area of rectangles',
};

for (const sprache of ['de', 'en']) {
  const kontext = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const seite = await kontext.newPage();
  // Der MUNDO-Dialog öffnet beim ersten Aufruf ein Popup zu mundo.schule. Das
  // braucht Zugangsdaten und Netz; für die Bilder genügt der Dialog selbst.
  kontext.on('page', (neu) => { if (neu !== seite) neu.close().catch(() => {}); });
  await seite.goto(`${BASIS}/demo/?lang=${sprache}&tab=materials`, { waitUntil: 'networkidle' });
  await seite.getByTestId('ansicht-materialien').waitFor();

  // Stufe II wählen, zwei Materialien anklicken — noch nicht zugewiesen.
  await seite.getByTestId('materialien-stufe-II').click();
  const karten = seite.getByTestId(/^material-/);
  await karten.nth(0).click();
  await karten.nth(1).click();
  await seite.waitForTimeout(200);
  await ausschnitt(seite, 'materialien-stufen', `lms-stufen-${sprache}.png`);
  await ausschnitt(seite, 'materialien-auswahl', `lms-auswahl-${sprache}.png`);
  await seite.getByTestId('materialien-zuweisen').click();

  // Ein Material aus MUNDO, von Hand eingetragen — derselbe Weg, den die
  // LTI-Auswahl nimmt, ohne Zugangsdaten.
  await seite.getByTestId('mundo-oeffnen').click();
  await seite.getByTestId('mundo-dialog').waitFor();
  await seite.getByTestId('mundo-reiter-manual').click();
  await seite.getByTestId('mundo-manuell-titel').fill(MUNDO_BEISPIEL[sprache]);
  await seite.getByTestId('mundo-manuell-url').fill('https://mundo.schule/details/SODIX-0000000000001');
  await seite.getByTestId('mundo-manuell-hinzufuegen').click();
  await seite.getByTestId('mundo-dialog').screenshot({ path: join(ZIEL, `mundo-dialog-${sprache}.png`) });
  console.log(`✓ mundo-dialog-${sprache}.png`);
  await seite.getByTestId('mundo-uebernehmen').click();
  await seite.waitForTimeout(300);
  await ausschnitt(seite, 'materialien-zugewiesen', `mundo-zugewiesen-${sprache}.png`);

  await ausschnitt(seite, 'materialien-export', `lms-export-${sprache}.png`);
  seiteAlsBild(await herunterladen(seite, 'export-pdf', `lms-pdf-${sprache}`), `lms-pdf-${sprache}`);
  await kontext.close();
}

// ── Optional: die Cartridge nach dem Import in Moodle ────────────────────────
//
// Läuft nur, wenn ein Moodle mit den importierten Kursen erreichbar ist —
// Kurzname TBA3-DE und TBA3-EN, je aus der Cartridge der Sprache. Wie man so
// eins aufsetzt, steht in /dokumentation/machbarkeitsstudie-lms-export.
//
//   DOCS_MOODLE=http://127.0.0.1:8088 DOCS_MOODLE_NUTZER=admin \
//   DOCS_MOODLE_KENNWORT=… npm run docs:bilder
if (process.env.DOCS_MOODLE) {
  const M = process.env.DOCS_MOODLE;
  const kontext = await browser.newContext({ viewport: { width: 1280, height: 760 } });
  const seite = await kontext.newPage();
  await seite.goto(`${M}/login/index.php`);
  await seite.fill('#username', process.env.DOCS_MOODLE_NUTZER ?? 'admin');
  await seite.fill('#password', process.env.DOCS_MOODLE_KENNWORT ?? '');
  await seite.click('#loginbtn');
  await seite.waitForLoadState('networkidle');
  for (const sprache of ['de', 'en']) {
    await seite.goto(`${M}/course/view.php?name=TBA3-${sprache.toUpperCase()}&lang=${sprache}`, { waitUntil: 'networkidle' });
    await seite.screenshot({ path: join(ZIEL, `lms-moodle-kurs-${sprache}.png`) });
    console.log(`✓ lms-moodle-kurs-${sprache}.png`);
    await seite.getByRole('link', { name: MUNDO_BEISPIEL[sprache] }).first().click();
    await seite.waitForLoadState('networkidle');
    await seite.screenshot({ path: join(ZIEL, `lms-moodle-seite-${sprache}.png`) });
    console.log(`✓ lms-moodle-seite-${sprache}.png`);
  }
  await kontext.close();
} else {
  console.log('· DOCS_MOODLE nicht gesetzt — die Moodle-Bilder bleiben, wie sie sind');
}

// ── Die Nachbauten der Bausteine, für „Bausteine der Rückmeldungen“ ─────────
// Je Baustein, den der Katalog einem Element zuordnet, die Fassung als Web
// Component aus dem Demonstrator — neben das Original aus der Rückmeldung.
{
  const { BAUSTEINE } = await import('../apps/shared/konsortium.js');
  const elemente = [...new Set(BAUSTEINE.map((b) => b.element).filter(Boolean))];
  const seite = await laden('/bausteine/?lang=de');
  for (const name of elemente) {
    const buehne = seite.locator(`section#${name} .buehne[data-fassung="Native Web Component"]`);
    await buehne.scrollIntoViewIfNeeded();
    await seite.waitForTimeout(300);
    const roh = join(tmp, `baustein-${name}.png`);
    await buehne.screenshot({ path: roh });
    execFileSync('magick', [roh, '-trim', '-bordercolor', 'white', '-border', '16', '-resize', `${BREITE}x>`,
      '-strip', join(ZIEL, `baustein-${name}.png`)]);
    console.log(`✓ baustein-${name}.png`);
  }
}

// ── Der Assistent aus der Machbarkeitsstudie: Gespräche und Schaubild ────────
// Die Gespräche rufen die Werkzeuge des MCP-Piloten gegen den Mock auf; die
// Zahlen darin sind echt, die Formulierungen ausgedacht.
{
  const assistent = await import('./assistent-gespraeche.mjs');
  if (!assistent.bereit()) {
    console.log('· mcp-server/node_modules fehlt (npm --prefix mcp-server ci) — die Assistenten-Bilder bleiben, wie sie sind');
  } else {
    const szenarien = await assistent.aufnehmen(BASIS);
    // Doppelte Pixeldichte: die Bilder sind Text, und Text soll scharf sein.
    const kontext = await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
    const seite = await kontext.newPage();
    for (const sprache of ['de', 'en']) {
      for (const sz of szenarien) {
        await seite.setContent(assistent.seite(sz, sprache));
        const roh = join(tmp, `assistent-${sz.id}-${sprache}.png`);
        await seite.locator('.gespraech').screenshot({ path: roh });
        execFileSync('magick', [roh, '-resize', `${BREITE}x>`, '-strip', join(ZIEL, `assistent-${sz.id}-${sprache}.png`)]);
        console.log(`✓ assistent-${sz.id}-${sprache}.png`);
      }
      await seite.setContent(assistent.schaubild(sprache));
      const roh = join(tmp, `assistent-schaubild-${sprache}.png`);
      await seite.locator('.schaubild').screenshot({ path: roh });
      execFileSync('magick', [roh, '-resize', `${BREITE}x>`, '-strip', join(ZIEL, `assistent-schaubild-${sprache}.png`)]);
      console.log(`✓ assistent-schaubild-${sprache}.png`);
    }
    await kontext.close();
  }
}

await browser.close();
console.log(`\nFertig → apps/portal/dokumentation/bilder/`);
console.log('  Stand prüfen: git diff --stat -- apps/portal/dokumentation/bilder/');
