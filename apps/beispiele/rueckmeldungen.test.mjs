import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { FILTER, RUECKMELDUNGEN, ZIELGRUPPEN, filtern, optionen } from './rueckmeldungen.js';
import { SPRACHEN, text } from '../shared/sprache.js';

describe('Rückmeldungen', () => {
  it('führt die 12 Prototypen mit eindeutigen Kennungen', () => {
    expect(RUECKMELDUNGEN).toHaveLength(12);
    expect(new Set(RUECKMELDUNGEN.map((r) => r.id)).size).toBe(12);
  });

  // Die Zahl stand in fünf Dateien und in beiden Sprachen ausgeschrieben — als
  // die Liste von 16 auf 12 schrumpfte, wäre sie an jeder einzelnen Stelle
  // stehen geblieben. Eine falsche Zahl auf der Startseite fällt niemandem auf,
  // der die Liste nicht nachzählt.
  it('nennt überall dieselbe Anzahl wie die Liste', () => {
    const wurzel = new URL('../../', import.meta.url);
    const dateien = [
      'apps/beispiele/rueckmeldungen.js',
      'apps/beispiele/index.html',
      'apps/beispiele/README.md',
      'apps/portal/index.html',
      'CLAUDE.md',
    ];
    const muster = /(\d+)\s+(?:[Pp]rototyp\w*|Einträge)/g;

    const gefunden = [];
    for (const datei of dateien) {
      const text = readFileSync(new URL(datei, wurzel), 'utf8');
      for (const [ganz, zahl] of text.matchAll(muster)) gefunden.push({ datei, ganz, zahl: Number(zahl) });
    }

    expect(gefunden.length, 'keine Fundstelle — Formulierung geändert?').toBeGreaterThan(5);
    for (const { datei, ganz, zahl } of gefunden) {
      expect(zahl, `${datei}: „${ganz}"`).toBe(RUECKMELDUNGEN.length);
    }
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
    expect(filtern(RUECKMELDUNGEN, {})).toHaveLength(12);
    expect(filtern(RUECKMELDUNGEN, { fach: '', stufe: '' })).toHaveLength(12);
  });

  it('schränkt je Feld ein und kombiniert die Felder', () => {
    const nurDeutsch = filtern(RUECKMELDUNGEN, { fach: 'DE' });
    expect(nurDeutsch.length).toBeGreaterThan(0);
    expect(nurDeutsch.every((r) => r.fach === 'DE')).toBe(true);

    const deutschKlasse3 = filtern(RUECKMELDUNGEN, { fach: 'DE', stufe: 'V3' });
    expect(deutschKlasse3.length).toBeLessThan(nurDeutsch.length);
    expect(deutschKlasse3.every((r) => r.fach === 'DE' && r.stufe === 'V3')).toBe(true);

    const fuerEltern = filtern(RUECKMELDUNGEN, { fach: 'DE', stufe: 'V3', zielgruppe: 'eltern' });
    expect(fuerEltern).toHaveLength(1);
    expect(fuerEltern[0].id).toBe('de-v3-elternbrief');
  });

  it('kennt Englisch und Französisch nur in Klasse 8', () => {
    // So wird VERA erhoben — die Liste soll das nicht verwischen.
    for (const fach of ['EN', 'FR']) {
      expect(filtern(RUECKMELDUNGEN, { fach, stufe: 'V3' })).toHaveLength(0);
      expect(filtern(RUECKMELDUNGEN, { fach, stufe: 'V8' }).length).toBeGreaterThan(0);
    }
  });

  it('ignoriert Felder, die kein Filter sind', () => {
    // Sonst würde ein beliebiger Adressparameter die Liste leerfiltern.
    expect(filtern(RUECKMELDUNGEN, { erfunden: 'x' })).toHaveLength(12);
  });

  it('liefert eine leere Liste, wenn nichts passt', () => {
    expect(filtern(RUECKMELDUNGEN, { fach: 'gibtsnicht' })).toHaveLength(0);
  });
});

describe('Optionen', () => {
  it('bietet nur Werte an, die auch vorkommen', () => {
    const zielgruppen = optionen(RUECKMELDUNGEN, 'zielgruppe').map((o) => o.wert);
    // Alle vier Zielgruppen sind belegt; kommt eine ohne Rückmeldung dazu, darf
    // sie nicht in der Auswahl stehen.
    expect(zielgruppen).toEqual(['lehrkraft', 'schulleitung', 'lernende', 'eltern']);
    expect(optionen(RUECKMELDUNGEN.filter((r) => r.zielgruppe !== 'eltern'), 'zielgruppe'))
      .not.toContainEqual(expect.objectContaining({ wert: 'eltern' }));
  });

  it('deckt jede Zielgruppe mit mindestens einer Rückmeldung ab', () => {
    for (const zielgruppe of Object.keys(ZIELGRUPPEN)) {
      expect(filtern(RUECKMELDUNGEN, { zielgruppe }).length, zielgruppe).toBeGreaterThan(0);
    }
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

describe('Seite', () => {
  // Die Seite ist unter /beispiele und /beispiele/ erreichbar — Vercel leitet
  // nicht um. Ein relativer Verweis löst ohne Schrägstrich gegen / auf und geht
  // ins Leere; die Seite bliebe dann ohne Filter und ohne Karten stehen.
  it('verweist ausschließlich über absolute Pfade', () => {
    const seite = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
    const verweise = [
      ...[...seite.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((m) => m[1]),
      ...[...seite.matchAll(/\bfrom\s+'([^']+)'/g)].map((m) => m[1]),
    ].filter((ziel) => !/^(https?:|#|mailto:|data:)/.test(ziel));

    expect(verweise.length).toBeGreaterThan(0);
    expect(verweise.filter((ziel) => !ziel.startsWith('/'))).toEqual([]);
  });
});
