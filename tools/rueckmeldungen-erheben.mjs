// Erhebt die zehn Rückmeldungen des Konsortiums am Artefakt.
//
// Warum ein Werkzeug und kein Einmal-Skript: Der Katalog in
// `apps/shared/konsortium.js` steht auf zwei Quellen. Die eine sind die
// Sachberichte — die ändern sich nicht mehr. Die andere sind die laufenden
// Demos, und die ändern sich sehr wohl: das zepf zieht von GitLab auf GitHub,
// das ISQ plant den Umzug seines Repositoriums, indibits Repositorium ist noch
// nicht veröffentlicht. Eine Erhebung, die sich nicht wiederholen lässt,
// veraltet still.
//
// Das Skript tut zwei Dinge:
//
//   1. Es ruft jede Demo auf und schreibt einen Befund — erreichbar? welcher
//      Titel? welche Reiter? welche Bibliotheken? welche eigenen Elemente?
//      Gerade die eigenen Elementnamen sind ergiebig: die Angular-Anwendungen
//      von indibit tragen ihre Komponentennamen im DOM (`app-school-summary`,
//      `app-comparison-stat-card`).
//   2. Es nimmt von jeder ein Bild auf, das die Übersichtsseite zeigt.
//
// Aufruf: node tools/rueckmeldungen-erheben.mjs [--nur-bilder]
//
// Braucht Playwright (ist devDependency) und einen Netzzugang. `magick`
// (ImageMagick) für die Bilder; fehlt es, bleiben die Aufnahmen als PNG liegen
// und werden nicht verkleinert — dann besser nicht einchecken.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { RUECKMELDUNGEN } from '../apps/shared/konsortium.js';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const BILDER = join(WURZEL, 'apps/beispiele/bilder');
const BEFUNDE = join(WURZEL, 'docs/erhebung');

const nurBilder = process.argv.includes('--nur-bilder');

/** Vier Anläufe: die Demos hängen an fremder Infrastruktur, und eine hakt immer. */
async function oeffnen(seite, url) {
  for (let versuch = 1; versuch <= 4; versuch += 1) {
    try {
      return await seite.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    } catch (fehler) {
      if (versuch === 4) throw fehler;
      await seite.waitForTimeout(4000 * versuch);
    }
  }
  return null;
}

/** Was im Browser abgelesen wird. Läuft im Seitenkontext, nicht hier. */
function ablesen() {
  const zaehl = (wahl) => document.querySelectorAll(wahl).length;
  const texte = (wahl, n) => [...document.querySelectorAll(wahl)].slice(0, n)
    .map((e) => e.textContent.trim().replace(/\s+/g, ' ').slice(0, 90)).filter(Boolean);
  return {
    titel: document.title,
    h1: texte('h1', 6),
    h2: texte('h2', 14),
    reiter: texte('[role=tab], .tab, .nav-link, .v-tab', 14),
    zaehler: {
      svg: zaehl('svg'), canvas: zaehl('canvas'), tabelle: zaehl('table'),
      auswahl: zaehl('select'), eingabe: zaehl('input'),
    },
    // Custom Elements verraten die Komponentennamen — bei Angular-Anwendungen
    // ist das praktisch das Inhaltsverzeichnis der Bibliothek.
    eigeneElemente: [...new Set([...document.querySelectorAll('*')]
      .map((e) => e.tagName.toLowerCase()).filter((t) => t.includes('-')))].slice(0, 24),
    bibliotheken: Object.fromEntries(Object.entries({
      echarts: !!window.echarts, d3: !!window.d3, Tabulator: !!window.Tabulator,
      Chart: !!window.Chart, Highcharts: !!window.Highcharts, leaflet: !!window.L,
      quasar: !!window.Quasar,
    }).filter(([, da]) => da)),
  };
}

mkdirSync(BILDER, { recursive: true });
mkdirSync(BEFUNDE, { recursive: true });

const browser = await chromium.launch();
const befunde = [];

for (const r of RUECKMELDUNGEN) {
  if (!r.demo) continue;
  const seite = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'de-DE' });
  const befund = { id: r.id, einrichtung: r.einrichtung, url: r.demo };
  try {
    const antwort = await oeffnen(seite, r.demo);
    befund.status = antwort?.status() ?? null;
    await seite.waitForTimeout(6000);
    if (!nurBilder) Object.assign(befund, await seite.evaluate(ablesen));

    // 1280×800 ist das Format, das auf einer Übersichtskarte etwas zeigt statt
    // eine Briefmarke zu sein; die Karte schneidet auf 8:5 zurecht.
    await seite.setViewportSize({ width: 1280, height: 800 });
    await seite.waitForTimeout(1200);
    const png = join(BILDER, `${r.id}.png`);
    await seite.screenshot({ path: png });
    try {
      execFileSync('magick', [png, '-resize', '800x500', '-strip', '-quality', '82',
        join(BILDER, `${r.id}.jpg`)]);
      execFileSync('rm', ['-f', png]);
    } catch {
      console.warn(`  · magick fehlt — ${r.id}.png bleibt unverkleinert liegen`);
    }
  } catch (fehler) {
    befund.fehler = String(fehler).slice(0, 200);
  }
  befunde.push(befund);
  console.log(`${r.id.padEnd(28)} ${befund.status ?? '—'}  ${befund.fehler ?? befund.titel ?? ''}`.trim());
  await seite.close();
}

await browser.close();

if (!nurBilder) {
  const datei = join(BEFUNDE, 'rueckmeldungen.json');
  writeFileSync(datei, `${JSON.stringify({ stand: new Date().toISOString(), befunde }, null, 2)}\n`);
  console.log(`\n✓ Befunde → ${datei}`);
}
console.log(`✓ Bilder → ${BILDER}`);
