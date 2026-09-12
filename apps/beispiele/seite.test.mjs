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

const HIER = new URL('./', import.meta.url);
const SEITE = readFileSync(new URL('index.html', HIER), 'utf8');

// Die Seite lädt ihre Module über absolute Pfade des Deployments; im Test
// zeigen sie auf die Quelldateien.
const ZUORDNUNG = {
  '/beispiele/rueckmeldungen.js': new URL('rueckmeldungen.js', HIER),
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
  ])('zeichnet alle 16 Karten %s', async (_name, adresse) => {
    const dokument = await zeichnen(adresse);

    expect(dokument.querySelectorAll('[data-testid^="rueckmeldung-"]')).toHaveLength(16);
    expect([...dokument.querySelectorAll('[data-testid^="filter-"]')].map((f) => f.dataset.testid))
      .toEqual(expect.arrayContaining(['filter-fach', 'filter-stufe', 'filter-zielgruppe']));
    expect(dokument.querySelector('[data-testid="anzahl"]').textContent).toContain('16');
  });

  it('filtert nach der Auswahl in der Adresse', async () => {
    const dokument = await zeichnen('http://localhost/beispiele/?fach=DE&stufe=V3');

    const karten = dokument.querySelectorAll('[data-testid^="rueckmeldung-"]');
    expect(karten.length).toBeGreaterThan(0);
    expect(karten.length).toBeLessThan(16);
    for (const karte of karten) expect(karte.dataset.testid).toMatch(/^rueckmeldung-de-v3-/);
    expect(dokument.querySelector('#filter-fach').value).toBe('DE');
  });

  it('führt die Einträge ohne Verweis als nicht klickbar', async () => {
    const dokument = await zeichnen('http://localhost/beispiele/');

    // Solange keine Rückmeldung veröffentlicht ist, darf es keinen toten Link
    // geben — die Karten sind dann <div>, nicht <a>.
    expect(dokument.querySelectorAll('a[data-testid^="rueckmeldung-"]')).toHaveLength(0);
    expect(dokument.querySelectorAll('div[data-testid^="rueckmeldung-"]')).toHaveLength(16);
  });
});
