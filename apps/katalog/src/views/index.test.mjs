// Die Übersicht des Katalogs gegen ihre Texte und Vorschauen.
//
// Anlass: Die drei aus den Rückmeldungen des Konsortiums herausgezogenen
// Ansichten standen auf der Übersicht mit **rohem Schlüsselnamen** da —
// „komponenten.ContextRing.beschreibung" statt eines Satzes —, und sie zeigten
// die Vorschau einer fremden Komponente.
//
// Beides fiel keinem Test auf, und zwar aus einem lehrreichen Grund: Der
// Prüfer für Textschlüssel (`i18n/texte.test.mjs`) sucht statische Aufrufe wie
// `t('ansichten.kontext.titel')`. Hier wird der Schlüssel aber aus dem
// Komponentennamen gebaut — `t(\`komponenten.${comp.name}.beschreibung\`) —,
// und ein dynamischer Schlüssel ist für einen Textscanner unsichtbar.
//
// Dieser Test schließt die Lücke an der einzigen Stelle, an der sie sich
// schließen lässt: bei der Liste selbst.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEXTE } from '../i18n/texte.js';

const HIER = dirname(fileURLToPath(import.meta.url));
const QUELLE = readFileSync(join(HIER, 'IndexView.vue'), 'utf8');

/** Die Einträge der Übersicht — gelesen, weil eine .vue-Datei sich hier nicht importieren lässt. */
const eintraege = () => {
  const block = /const COMPONENTS = \[([\s\S]*?)\n\];/.exec(QUELLE);
  expect(block, 'COMPONENTS nicht gefunden — Aufbau der Übersicht geändert?').toBeTruthy();
  return [...block[1].matchAll(
    /\{\s*name: '([\w]+)',\s*route: '([^']+)',\s*baustein: '([\w-]+)',[\s\S]*?preview: '([\w-]+)',\s*\}/g,
  )].map(([, name, route, baustein, preview]) => ({ name, route, baustein, preview }));
};

describe('Übersicht des Katalogs', () => {
  it('führt jeden Eintrag vollständig', () => {
    const liste = eintraege();
    // Zwölf Ansichten; die Zahl steht hier nicht, damit eine neue nicht an
    // dieser Stelle scheitert — geprüft wird, dass keiner halb dasteht.
    expect(liste.length).toBeGreaterThan(9);
    expect(new Set(liste.map((e) => e.name)).size).toBe(liste.length);
    expect(new Set(liste.map((e) => e.route)).size).toBe(liste.length);
  });

  it('hat zu jedem Eintrag Beschreibung und Anwendungsfälle in beiden Sprachen', () => {
    for (const { name } of eintraege()) {
      const eintrag = TEXTE.komponenten?.[name];
      expect(eintrag, `komponenten.${name} fehlt — auf der Übersicht stünde der Schlüsselname`).toBeTruthy();
      for (const sprache of ['de', 'en']) {
        expect(eintrag.beschreibung?.[sprache], `${name}.beschreibung.${sprache}`).toBeTruthy();
        expect(Array.isArray(eintrag.faelle?.[sprache]), `${name}.faelle.${sprache}`).toBe(true);
        expect(eintrag.faelle[sprache].length, `${name}.faelle.${sprache}`).toBeGreaterThan(0);
      }
    }
  });

  it('gibt jedem Eintrag eine eigene Vorschau', () => {
    const liste = eintraege();
    const doppelt = liste
      .map((e) => e.preview)
      .filter((p, i, alle) => alle.indexOf(p) !== i);
    // Eine geborgte Vorschau zeigt die falsche Komponente — und sieht dabei
    // völlig in Ordnung aus. Genau so sind die drei neuen Einträge
    // durchgerutscht.
    expect(doppelt, `Vorschau mehrfach vergeben: ${doppelt.join(', ')}`).toEqual([]);
  });

  it('zeichnet jede Vorschau, die die Liste nennt', () => {
    for (const { name, preview } of eintraege()) {
      expect(QUELLE, `Vorschau „${preview}" für ${name} ist nicht gezeichnet`)
        .toContain(`comp.preview === '${preview}'`);
    }
  });
});
