// Die Reihenfolge der Bereiche in der Navigationsleiste.
//
// Sie ist eine inhaltliche Aussage und keine Gewohnheit: „Rückmeldungen" steht
// an zweiter Stelle, weil dort das Ergebnis des Projekts liegt — die zehn
// Anwendungen der vier Einrichtungen. Alles dazwischen ist Werkzeug.
//
// Ohne diesen Test wandert so etwas zurück, und zwar unauffällig: wer einen
// Bereich ergänzt, hängt ihn ans Ende oder sortiert nach Gefühl, und niemandem
// fällt auf, dass eine Entscheidung rückgängig gemacht wurde. Die Leiste wird
// von keinem anderen Test auf ihre Reihenfolge angesehen.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Die Leiste lässt sich hier nicht importieren: sie registriert beim Laden ein
// Custom Element und greift dafür auf `customElements` zu. Gelesen wird
// deshalb die Quelle — für eine Liste von Kennungen reicht das.
const QUELLE = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'tba3-leiste.js'),
  'utf8',
);

const bereiche = () => {
  const block = /const BEREICHE = \[([\s\S]*?)\n\];/.exec(QUELLE);
  expect(block, 'BEREICHE nicht gefunden — Aufbau der Leiste geändert?').toBeTruthy();
  return [...block[1].matchAll(/\bid: '([\w-]+)'/g)].map((m) => m[1]);
};

describe('Navigationsleiste', () => {
  it('führt die Bereiche in der festgelegten Reihenfolge', () => {
    expect(bereiche()).toEqual([
      'portal',
      'beispiele',
      'demo',
      'katalog',
      'bausteine',
      'dokumentation',
      'schnittstelle',
    ]);
  });

  it('stellt die Rückmeldungen direkt hinter die Übersicht', () => {
    // Der eigentliche Punkt, noch einmal als eigene Zusage: das Ergebnis des
    // Projekts steht vor dem Werkzeug, mit dem es gebaut wurde.
    const [erster, zweiter] = bereiche();
    expect(erster).toBe('portal');
    expect(zweiter).toBe('beispiele');
  });

  it('gibt jedem Bereich einen Pfad und beide Sprachen', () => {
    const eintraege = [...QUELLE.matchAll(
      /\{ id: '([\w-]+)',\s*text: \{ de: '([^']+)',\s*en: '([^']+)' \},\s*pfad: '([^']+)' \}/g,
    )];
    expect(eintraege).toHaveLength(bereiche().length);
    for (const [, id, de, en, pfad] of eintraege) {
      expect(de, id).toBeTruthy();
      expect(en, id).toBeTruthy();
      expect(pfad, id).toMatch(/^\//);
    }
  });
});
