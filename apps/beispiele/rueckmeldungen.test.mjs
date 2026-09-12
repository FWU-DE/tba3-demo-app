import { describe, it, expect } from 'vitest';
import { FILTER, RUECKMELDUNGEN, filtern, optionen } from './rueckmeldungen.js';
import { SPRACHEN, text } from '../shared/sprache.js';

describe('Rückmeldungen', () => {
  it('führt die 16 Prototypen mit eindeutigen Kennungen', () => {
    expect(RUECKMELDUNGEN).toHaveLength(16);
    expect(new Set(RUECKMELDUNGEN.map((r) => r.id)).size).toBe(16);
  });

  it('gibt jeder Rückmeldung die Werte, nach denen gefiltert wird', () => {
    for (const r of RUECKMELDUNGEN) {
      for (const { feld, werte } of FILTER) expect(Object.keys(werte)).toContain(r[feld]);
    }
  });

  it('führt Titel und Beschreibung in beiden Sprachen', () => {
    for (const r of RUECKMELDUNGEN) {
      for (const sprache of Object.keys(SPRACHEN)) {
        expect(text(r.titel, sprache)).toBeTruthy();
        expect(text(r.beschreibung, sprache)).toBeTruthy();
      }
    }
  });
});

describe('Filtern', () => {
  it('lässt ohne Auswahl alles durch', () => {
    expect(filtern(RUECKMELDUNGEN, {})).toHaveLength(16);
    expect(filtern(RUECKMELDUNGEN, { fach: '', stufe: '' })).toHaveLength(16);
  });

  it('schränkt je Feld ein und kombiniert die Felder', () => {
    expect(filtern(RUECKMELDUNGEN, { fach: 'DE' })).toHaveLength(4);
    expect(filtern(RUECKMELDUNGEN, { fach: 'DE', stufe: 'V3' })).toHaveLength(2);
    const einzeln = filtern(RUECKMELDUNGEN, { fach: 'DE', stufe: 'V3', zielgruppe: 'lehrkraft' });
    expect(einzeln).toHaveLength(1);
    expect(einzeln[0].fach).toBe('DE');
  });

  it('ignoriert Felder, die kein Filter sind', () => {
    // Sonst würde ein beliebiger Adressparameter die Liste leerfiltern.
    expect(filtern(RUECKMELDUNGEN, { erfunden: 'x' })).toHaveLength(16);
  });

  it('liefert eine leere Liste, wenn nichts passt', () => {
    expect(filtern(RUECKMELDUNGEN, { fach: 'gibtsnicht' })).toHaveLength(0);
  });
});

describe('Optionen', () => {
  it('bietet nur Werte an, die auch vorkommen', () => {
    const zielgruppen = optionen(RUECKMELDUNGEN, 'zielgruppe').map((o) => o.wert);
    expect(zielgruppen).toContain('lehrkraft');
    // Eltern und Schüler:innen stehen im Vokabular, haben aber noch keine Rückmeldung.
    expect(zielgruppen).not.toContain('eltern');
  });

  it('behält die Reihenfolge des Vokabulars bei', () => {
    expect(optionen(RUECKMELDUNGEN, 'fach').map((o) => o.wert)).toEqual(['DE', 'MA', 'EN', 'FR']);
  });

  it('gibt die Beschriftung zweisprachig heraus — übersetzt wird auf der Seite', () => {
    const [deutsch] = optionen(RUECKMELDUNGEN, 'fach');
    expect(text(deutsch.text, 'de')).toBe('Deutsch');
    expect(text(deutsch.text, 'en')).toBe('German');
  });

  it('gibt für ein unbekanntes Feld nichts zurück', () => {
    expect(optionen(RUECKMELDUNGEN, 'erfunden')).toEqual([]);
  });
});
