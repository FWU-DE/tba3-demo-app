// Führt das Inline-Modul der Seite wirklich aus und schaut nach, was im DOM
// ankommt — unter beiden Adressformen.
//
// Anlass: /beispiele und /beispiele/ liefern dieselbe Seite, ohne Umleitung.
// Ein relativer Import löste ohne Schrägstrich gegen / auf, das Modul kam nicht
// an, und die Seite blieb ohne Filter und ohne Karten stehen. Statuscodes
// bleiben dabei 200 — der Fehler ist nur zu sehen, wenn man das Skript
// tatsächlich laufen lässt.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BAUSTEINE } from '../shared/konsortium.js';
import { sprache, text } from '../shared/sprache.js';

const HIER = new URL('./', import.meta.url);
const SEITE = readFileSync(new URL('index.html', HIER), 'utf8');

// Die Seite lädt ihre Module über absolute Pfade des Deployments; im Test
// zeigen sie auf die Quelldateien.
const ZUORDNUNG = {
  '/gemeinsam/konsortium.js': new URL('../shared/konsortium.js', HIER),
  '/gemeinsam/sprache.js': new URL('../shared/sprache.js', HIER),
};

const inlineModul = () => {
  const module = [...SEITE.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
  expect(module.length, 'Inline-Modul der Seite').toBeGreaterThan(0);
  let quelle = module.at(-1)[1];
  for (const [pfad, ziel] of Object.entries(ZUORDNUNG)) {
    quelle = quelle.replaceAll(`'${pfad}'`, `'${pathToFileURL(fileURLToPath(ziel))}'`);
  }
  return quelle;
};

// Was das Seitenskript an Fenster-Globalen erwartet.
const GLOBALE = [
  'window', 'document', 'location', 'history', 'navigator',
  'URLSearchParams', 'Option', 'CustomEvent', 'addEventListener',
];
const gesichert = {};

// `navigator` und `location` sind in Node nur lesbar; deshalb defineProperty
// statt einfacher Zuweisung.
const setzen = (name, wert) =>
  Object.defineProperty(globalThis, name, { value: wert, configurable: true, writable: true });

const zeichnen = async (adresse) => {
  const dom = new JSDOM(SEITE, { url: adresse });
  const { window } = dom;
  setzen('window', window);
  setzen('document', window.document);
  setzen('location', window.location);
  setzen('history', window.history);
  setzen('navigator', window.navigator);
  setzen('URLSearchParams', window.URLSearchParams);
  setzen('Option', window.Option);
  setzen('CustomEvent', window.CustomEvent);
  setzen('addEventListener', window.addEventListener.bind(window));

  // Als Datei statt als data:-URL: so zeigt ein Fehler im Seitenskript einen
  // lesbaren Pfad mit Zeilennummer statt einer base64-Wand. Jede Ausführung
  // bekommt eine eigene Kopie, weil sich das Modul an sein Fenster hängt.
  const ordner = mkdtempSync(join(tmpdir(), 'tba3-beispiele-'));
  const datei = join(ordner, 'seite.mjs');
  writeFileSync(datei, inlineModul());
  try {
    await import(pathToFileURL(datei).href);
  } finally {
    rmSync(ordner, { recursive: true, force: true });
  }
  return window.document;
};

beforeEach(() => {
  for (const name of GLOBALE) gesichert[name] = globalThis[name];
});

afterEach(() => {
  for (const name of GLOBALE) setzen(name, gesichert[name]);
});

describe('Rückmeldungsseite', () => {
  it.each([
    ['ohne abschließenden Schrägstrich', 'http://localhost/beispiele'],
    ['mit abschließendem Schrägstrich', 'http://localhost/beispiele/'],
  ])('zeichnet alle zehn Karten %s', async (_name, adresse) => {
    const dokument = await zeichnen(adresse);

    expect(dokument.querySelectorAll('[data-testid^="rueckmeldung-"]')).toHaveLength(10);
    expect([...dokument.querySelectorAll('[data-testid^="filter-"]')].map((f) => f.dataset.testid))
      .toEqual(expect.arrayContaining(['filter-einrichtung', 'filter-fach', 'filter-stufe', 'filter-zielgruppe']));
    expect(dokument.querySelector('[data-testid="anzahl"]').textContent).toContain('10');
  });

  it('filtert nach der Auswahl in der Adresse', async () => {
    const dokument = await zeichnen('http://localhost/beispiele/?einrichtung=zepf');

    const karten = dokument.querySelectorAll('[data-testid^="rueckmeldung-"]');
    expect(karten).toHaveLength(3);
    for (const karte of karten) expect(karte.dataset.testid).toMatch(/^rueckmeldung-zepf-/);
    expect(dokument.querySelector('#filter-einrichtung').value).toBe('zepf');
  });

  // Der Zweck der Seite ist der Verweis. Jede der drei Adressen bekommt ihre
  // eigene Kennung, damit sich im Test unterscheiden lässt, welche fehlt —
  // „irgendein Link ist da" hätte den Umbau auf drei Verweise nicht bemerkt.
  it('verlinkt Demo, Quelltext und Dokumentation getrennt', async () => {
    const dokument = await zeichnen('http://localhost/beispiele/');

    const demo = dokument.querySelector('[data-testid="demo-isq-portal"]');
    expect(demo.getAttribute('href')).toBe('https://tba3.isqberlin.de/');
    expect(demo.getAttribute('rel')).toBe('noopener');
    expect(dokument.querySelector('[data-testid="code-isq-portal"]').getAttribute('href'))
      .toBe('https://git.imp.fu-berlin.de/isq/feedbacksysteme/tbaiii');

    // Das ISQ legt seine Dokumentation ins Repositorium — dafür steht kein
    // eigener Verweis, und geraten wird er nicht.
    expect(dokument.querySelector('[data-testid="doku-isq-portal"]')).toBeNull();
  });

  // Erwartet wird über `text(…, sprache())` statt über feste Wörter: welche
  // Sprache gilt, entscheidet in dieser Umgebung die Browsersprache, und das
  // Seitenskript liest dieselbe Kopie des Moduls wie dieser Test.
  // Ein Bild, das nicht lädt, fällt auf der Seite auf; eine Karte ohne Bild
  // nicht — sie sieht nur etwas karger aus. Deshalb hier gezählt.
  it('zeigt zu jeder Rückmeldung eine Aufnahme', async () => {
    const dokument = await zeichnen('http://localhost/beispiele/');

    const karten = [...dokument.querySelectorAll('[data-testid^="rueckmeldung-"]')];
    expect(karten).toHaveLength(10);
    for (const karte of karten) {
      const bild = karte.querySelector('.bild img');
      expect(bild, karte.dataset.testid).not.toBeNull();
      expect(bild.getAttribute('src'), karte.dataset.testid).toMatch(/^\/beispiele\/bilder\/.+\.jpg$/);
      expect(bild.getAttribute('alt'), karte.dataset.testid).toBeTruthy();
    }
  });

  it('nennt zu jeder Rückmeldung die Bausteine ihres Sachberichts', async () => {
    const dokument = await zeichnen('http://localhost/beispiele/');

    const bausteine = dokument.querySelector('[data-testid="bausteine-kt-m8-kompetenzstand"]');
    for (const id of ['einzelbericht', 'gefuehrter-ablauf']) {
      const name = text(BAUSTEINE.find((b) => b.id === id).name, sprache());
      expect(bausteine.textContent, id).toContain(name);
    }
  });
});
