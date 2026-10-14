// Kompetenzstufen in einer Schreibweise. Anlass: in Mathematik Klasse 8 führt
// die Schnittstelle die Stufen arabisch (1a, 1b, 2 … 5) — die Demoanwendung
// zeigte dort schwarze Balken und Kennzahlen von 0 %.

import { describe, expect, it } from 'vitest';
import { antwortFuer } from '../../../../../tools/mock.mjs';
import { STUFEN, stufeNormal, stufenAntwortAbgleichen, stufenZusammenfassen } from '../stufen';

describe('stufeNormal', () => {
  it.each([
    ['1a', 'I'], ['1b', 'I'], ['Ia', 'I'], ['Ib', 'I'], ['I', 'I'],
    ['2', 'II'], ['II', 'II'], ['3', 'III'], ['4', 'IV'], ['5', 'V'], ['V', 'V'],
  ])('%s → %s', (roh, erwartet) => expect(stufeNormal(roh)).toBe(erwartet));

  it('lässt Unbekanntes stehen', () => expect(stufeNormal('X')).toBe('X'));
});

describe('stufenZusammenfassen', () => {
  it('führt Ia und Ib zu I zusammen und ordnet I bis V', () => {
    const ergebnis = stufenZusammenfassen([
      { nameShort: '2', descriptiveStatistics: { total: 10, mean: 0.3, frequency: 3 } },
      { nameShort: '1a', descriptiveStatistics: { total: 10, mean: 0.1, frequency: 1 } },
      { nameShort: '1b', descriptiveStatistics: { total: 10, mean: 0.2, frequency: 2 } },
    ]);
    expect(ergebnis.map((s) => s.nameShort)).toEqual(['I', 'II']);
    expect(ergebnis[0].descriptiveStatistics.frequency).toBe(3);
    expect(ergebnis[0].descriptiveStatistics.mean).toBeCloseTo(0.3);
    expect(ergebnis[0].descriptiveStatistics.total).toBe(10);
  });

  // Gegen die echten Beispieldaten: in jeder Gruppe kommen danach nur noch
  // die fünf Stufen vor, die die Anwendung kennt.
  it.each(['8a-mathe', '3a-deutsch', '8a-deutsch'])('gleicht die Beispieldaten von %s auf I–V ab', (gruppe) => {
    const daten = stufenAntwortAbgleichen(antwortFuer(`/groups/${gruppe}/competence-levels`, {}).daten);
    const kuerzel = new Set(daten.flatMap((e) => (e.competenceLevels ?? []).map((s) => s.nameShort)));
    for (const k of kuerzel) expect(STUFEN).toContain(k);
  });
});

describe('Stufen nach dem Referenzrahmen', () => {
  it('bleiben unverändert, geordnet und farbig', async () => {
    const { stufenFarbe, stufenOrdnung } = await import('../stufen');
    const daten = stufenAntwortAbgleichen(antwortFuer('/groups/8a-englisch/competence-levels', {}).daten);
    const kuerzel = daten[0].competenceLevels.map((s) => s.nameShort);
    expect(kuerzel[0]).toBe('A1.1');
    expect([...kuerzel].sort((a, b) => stufenOrdnung(a) - stufenOrdnung(b))).toEqual(kuerzel);
    for (const k of kuerzel) expect(stufenFarbe(k)).toMatch(/^#[0-9a-f]{6}$/);
  });
});

