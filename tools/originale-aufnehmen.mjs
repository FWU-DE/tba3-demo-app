// Nimmt die Originale der Bausteine aus den Demos des Konsortiums auf.
//
// Jeder nachgebaute Baustein zeigt neben dem Nachbau das Original, aus dem er
// stammt — als Ausschnitt genau dieser Komponente, nicht als ganze Seite. Was
// nicht nachgebaut ist, zeigt wenigstens das Original.
//
// Die Rezepte stehen in `tools/originale-rezepte.json`: Adresse, Schritte
// dorthin, CSS-Wähler des Ausschnitts. Ein Rezept mit `fehlt` wird
// übersprungen und bleibt als Begründung stehen.
//
// Ausgabe:
//   apps/beispiele/bilder/originale/<baustein>[-<n>].jpg
//   apps/shared/originale.js   (erzeugt, eingecheckt; ausgeliefert unter /gemeinsam/)
//
// Aufruf: node tools/originale-aufnehmen.mjs [baustein …]
// Mit Namen werden nur diese neu aufgenommen; die übrigen Einträge bleiben.
//
// Braucht Netz, Playwright und `magick`. Ein gescheitertes Rezept bricht nicht
// ab, behält aber sein altes Bild, falls es eines gibt — sonst fiele ein
// Original weg, nur weil eine fremde Demo gerade hakt.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const REZEPTE = join(WURZEL, 'tools/originale-rezepte.json');
const BILDER = join(WURZEL, 'apps/beispiele/bilder/originale');
const MODUL = join(WURZEL, 'apps/shared/originale.js');

/** Breite der ausgelieferten Bilder: scharf auf einem 2×-Schirm in einer halben Spalte. */
const BREITE = 1200;

const dateiName = (rezept, n) => `${rezept.baustein}${n > 0 ? `-${n + 1}` : ''}.jpg`;

async function oeffnen(seite, url) {
  for (let versuch = 1; versuch <= 4; versuch += 1) {
    try {
      return await seite.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    } catch (fehler) {
      if (versuch === 4) throw fehler;
      await seite.waitForTimeout(4000 * versuch);
    }
  }
  return null;
}

async function schritt(seite, s) {
  if (s.klick) await seite.locator(s.klick).first().click();
  else if (s.waehle) await seite.locator(s.waehle).first().selectOption(s.wert);
  else if (s.text) await seite.getByText(s.text, { exact: true }).first().click();
  else if (s.warteAuf) await seite.locator(s.warteAuf).first().waitFor({ timeout: 30_000 });
  if (s.warte) await seite.waitForTimeout(s.warte);
}

async function aufnehmen(browser, rezept, ziel) {
  const seite = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, locale: 'de-DE' });
  try {
    await oeffnen(seite, rezept.adresse);
    for (const s of rezept.schritte ?? []) await schritt(seite, s);
    const ausschnitt = seite.locator(rezept.auswahl).first();
    await ausschnitt.scrollIntoViewIfNeeded();
    // Diagramme animieren beim Erscheinen.
    await seite.waitForTimeout(1500);
    const png = ziel.replace(/\.jpg$/, '.png');
    const hoch = rezept.hoehe && (await ausschnitt.boundingBox()).height > rezept.hoehe;
    if (hoch) {
      // Oben bündig ins Fenster und nur den oberen Teil: lange Tabellen
      // brauchen nicht alle Zeilen, um erkennbar zu sein.
      await ausschnitt.evaluate((e) => e.scrollIntoView({ block: 'start' }));
      await seite.waitForTimeout(300);
      const box = await ausschnitt.boundingBox();
      await seite.screenshot({ path: png, clip: { x: box.x, y: box.y, width: box.width, height: rezept.hoehe } });
    } else {
      await ausschnitt.screenshot({ path: png });
    }
    execFileSync('magick', [png, '-resize', `${BREITE}x>`, '-strip', '-quality', '82', '-interlace', 'Plane', ziel]);
    rmSync(png);
  } finally {
    await seite.close();
  }
}

const masse = (datei) => execFileSync('magick', ['identify', '-format', '%w %h', datei]).toString().split(' ').map(Number);

const rezepte = JSON.parse(readFileSync(REZEPTE, 'utf8'));
const nur = process.argv.slice(2);
mkdirSync(BILDER, { recursive: true });

const browser = await chromium.launch();
const zaehler = {};
const eintraege = {};
let gescheitert = 0;

for (const rezept of rezepte) {
  if (rezept.fehlt) continue;
  const n = zaehler[rezept.baustein] ?? 0;
  zaehler[rezept.baustein] = n + 1;
  const datei = dateiName(rezept, n);
  const ziel = join(BILDER, datei);

  if (nur.length === 0 || nur.includes(rezept.baustein)) {
    try {
      await aufnehmen(browser, rezept, ziel);
      console.log(`✓ ${datei}`);
    } catch (fehler) {
      gescheitert += 1;
      console.warn(`✗ ${datei}: ${fehler.message.split('\n')[0]}${existsSync(ziel) ? ' — altes Bild bleibt' : ''}`);
    }
  }
  if (!existsSync(ziel)) continue;

  const [breite, hoehe] = masse(ziel);
  (eintraege[rezept.baustein] ??= []).push({
    rueckmeldung: rezept.rueckmeldung,
    adresse: rezept.adresse,
    datei: `/beispiele/bilder/originale/${datei}`,
    breite, hoehe,
    alt: rezept.alt,
  });
}
await browser.close();

const stand = new Date().toISOString().slice(0, 10);
writeFileSync(MODUL, `// Erzeugt von tools/originale-aufnehmen.mjs — nicht von Hand ändern.
//
// Je Baustein des Katalogs die Ausschnitte aus den Rückmeldungen des
// Konsortiums, aus denen er stammt. Der erste Eintrag ist das Original, die
// übrigen zeigen dieselbe Komponente bei einer anderen Einrichtung.

export const ORIGINALE_STAND = '${stand}';

export const ORIGINALE = ${JSON.stringify(eintraege, null, 2)};
`);

// Gegenprobe: das Modul muss sich laden lassen.
await import(`${pathToFileURL(MODUL).href}?${Date.now()}`);
console.log(`\n${Object.keys(eintraege).length} Bausteine mit Original → ${MODUL.replace(`${WURZEL}/`, '')}`);
if (gescheitert) {
  console.warn(`${gescheitert} Aufnahme(n) gescheitert`);
  process.exitCode = 1;
}
