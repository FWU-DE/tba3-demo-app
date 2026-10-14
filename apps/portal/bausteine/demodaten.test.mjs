// Der Demonstrator zeigt jeden Baustein mit Beispieldaten — und zwar in jedem
// Datensatz. Ein neuer Baustein ohne Daten stünde dort sonst leer da und sähe
// aus wie ein Fehler, obwohl nur die Daten fehlen.

import { describe, expect, it } from 'vitest';

import { DEMODATEN, istText, lokal } from './demodaten.js';
import { BAUPLAENE } from '../../../packages/bausteine/webcomponents/index.js';

const NAMEN = BAUPLAENE.map((b) => b.name).sort();

describe('Beispieldaten des Demonstrators', () => {
  it('bringt mindestens zwei Datensätze mit', () => {
    // Ein einziger Datensatz zeigt nicht, ob ein Baustein auf andere Daten
    // reagiert oder nur ein Bild ist.
    expect(DEMODATEN.length).toBeGreaterThanOrEqual(2);
  });

  it('hat in jedem Datensatz zu jedem Baustein Daten', () => {
    for (const [i, satz] of DEMODATEN.entries()) {
      expect(Object.keys(satz).sort(), `Datensatz ${i}`).toEqual(NAMEN);
    }
  });

  it('nennt keine Eigenschaft, die der Baustein nicht kennt', () => {
    // Ein Tippfehler im Schlüssel bliebe sonst stumm: das Element ignoriert,
    // was es nicht kennt, und zeigt seinen Leerzustand.
    const unbekannt = [];
    for (const [i, satz] of DEMODATEN.entries()) {
      for (const bauplan of BAUPLAENE) {
        const erlaubt = new Set(Object.keys(bauplan.standard));
        for (const schluessel of Object.keys(satz[bauplan.name] ?? {})) {
          if (!erlaubt.has(schluessel)) unbekannt.push(`${i}: ${bauplan.name}.${schluessel}`);
        }
      }
    }
    expect(unbekannt).toEqual([]);
  });

  // Beschriftungen stehen als { de, en } in den Daten und werden vor dem
  // Setzen aufgelöst. Bleibt eine stehen, landet ein Objekt im Baustein, und
  // der zeigt „[object Object]".
  it('löst jede Beschriftung in beide Sprachen auf', () => {
    const offen = (wert, pfad = '') => {
      if (istText(wert)) return [pfad];
      if (Array.isArray(wert)) return wert.flatMap((w, i) => offen(w, `${pfad}[${i}]`));
      if (wert && typeof wert === 'object') return Object.entries(wert).flatMap(([k, w]) => offen(w, `${pfad}.${k}`));
      return [];
    };
    for (const sprache of ['de', 'en']) {
      expect(offen(lokal(DEMODATEN, sprache)), sprache).toEqual([]);
    }
    expect(offen(DEMODATEN).length, 'keine einzige zweisprachige Beschriftung?').toBeGreaterThan(20);
    expect(lokal(DEMODATEN, 'en')[0]['kompetenzstufen-leiste'].rows[1].label).toBe('School');
    expect(lokal(DEMODATEN, 'de')[0]['kompetenzstufen-leiste'].rows[1].label).toBe('Schule');
  });
});
