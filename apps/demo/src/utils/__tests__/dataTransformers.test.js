import { describe, it, expect } from 'vitest';
import {
  calculateSummaryStats,
  collectItems,
  sortItems,
  transformCompetenceLevels,
  transformItems,
} from '../dataTransformers';

// Antwortform der TBA3-Schnittstelle: ein Eintrag je Domäne bzw. je Person,
// Kompetenzstufen mit descriptiveStatistics.frequency.
const domaene = (name, verteilung) => ({
  id: `g-${name}`,
  type: 'group',
  name,
  competenceLevels: Object.entries(verteilung).map(([nameShort, frequency]) => ({
    nameShort,
    name: `Stufe ${nameShort}`,
    descriptiveStatistics: { frequency },
  })),
});

describe('transformCompetenceLevels', () => {
  it('fasst mehrere Domänen je Stufe zusammen', () => {
    const daten = transformCompetenceLevels([
      domaene('Lesen', { I: 1, II: 2 }),
      domaene('Orthographie', { I: 3, III: 4 }),
    ]);

    expect(daten).toHaveLength(3);
    expect(daten.find((d) => d.level === 'I').count).toBe(4);
    expect(daten.find((d) => d.level === 'II').count).toBe(2);
    expect(daten.find((d) => d.level === 'III').count).toBe(4);
  });

  it('berechnet Anteile über alle Domänen hinweg', () => {
    const daten = transformCompetenceLevels([domaene('Lesen', { I: 1, II: 3 })]);
    expect(daten.find((d) => d.level === 'I').percentage).toBeCloseTo(0.25);
    expect(daten.find((d) => d.level === 'II').percentage).toBeCloseTo(0.75);
  });

  it('liefert eine leere Liste statt zu werfen, wenn Daten fehlen', () => {
    expect(transformCompetenceLevels(null)).toEqual([]);
    expect(transformCompetenceLevels(undefined)).toEqual([]);
    expect(transformCompetenceLevels({})).toEqual([]);
  });

  it('verkraftet Stufen ohne Statistik', () => {
    const daten = transformCompetenceLevels([
      { competenceLevels: [{ nameShort: 'I' }, { nameShort: 'II', descriptiveStatistics: {} }] },
    ]);
    expect(daten.every((d) => d.count === 0)).toBe(true);
  });
});

describe('calculateSummaryStats', () => {
  it('teilt in unter, auf und über Mindeststandard', () => {
    // I = unter, II+III = Mindest-/Regelstandard, IV+V = darüber
    const stats = calculateSummaryStats([domaene('Lesen', { I: 10, II: 20, III: 30, IV: 25, V: 15 })]);

    expect(stats.total).toBe(100);
    expect(stats.belowStandard).toBeCloseTo(0.1);
    expect(stats.atStandard).toBeCloseTo(0.5);
    expect(stats.aboveStandard).toBeCloseTo(0.4);
  });

  it('gewichtet den Mittelwert nach Stufennummer', () => {
    const stats = calculateSummaryStats([domaene('Lesen', { I: 1, V: 1 })]);
    expect(stats.mean).toBeCloseTo(3); // (1 + 5) / 2
  });

  it('liefert null, wenn niemand gezählt wurde', () => {
    expect(calculateSummaryStats([domaene('Lesen', {})])).toBeNull();
    expect(calculateSummaryStats(null)).toBeNull();
  });
});

describe('collectItems', () => {
  const aufgaben = (praefix) => [
    { iqbId: `${praefix}-1`, descriptiveStatistics: { mean: 0.4 } },
    { iqbId: `${praefix}-2`, descriptiveStatistics: { mean: 0.8 } },
  ];

  it('nimmt die Aggregatebene und ignoriert die Schülerdaten', () => {
    // Genau der Fehler, der zu über 1300 Balken führte: jede Person führt
    // dieselbe Aufgabenliste mit.
    const antwort = [
      { type: 'group', items: aufgaben('A') },
      { type: 'student', items: aufgaben('A') },
      { type: 'student', items: aufgaben('A') },
    ];
    expect(collectItems(antwort)).toHaveLength(2);
  });

  it('behält mehrere Domänen der Aggregatebene', () => {
    const antwort = [
      { type: 'group', items: aufgaben('Lesen') },
      { type: 'group', items: aufgaben('Ortho') },
    ];
    expect(collectItems(antwort)).toHaveLength(4);
  });

  it('mittelt je Aufgabe, wenn nur Schülerdaten vorliegen', () => {
    const antwort = [
      { type: 'student', items: [{ iqbId: 'A-1', descriptiveStatistics: { mean: 0.2 } }] },
      { type: 'student', items: [{ iqbId: 'A-1', descriptiveStatistics: { mean: 0.6 } }] },
      { type: 'student', items: [{ iqbId: 'A-1', descriptiveStatistics: { mean: 1.0 } }] },
    ];
    const gesammelt = collectItems(antwort);
    expect(gesammelt).toHaveLength(1);
    expect(gesammelt[0].descriptiveStatistics.mean).toBeCloseTo(0.6);
  });

  it('kommt mit leeren und unerwarteten Antworten klar', () => {
    expect(collectItems([])).toEqual([]);
    expect(collectItems(null)).toEqual([]);
    expect(collectItems([{ type: 'group' }])).toEqual([]);
    expect(collectItems({ items: aufgaben('A') })).toHaveLength(2);
  });
});

describe('transformItems', () => {
  it('übernimmt Lösungshäufigkeit, Aufgabe und Kompetenzstufe', () => {
    const [item] = transformItems([
      {
        iqbId: 'D38701',
        name: '1.1',
        exercise: { name: 'Geheimsache' },
        descriptiveStatistics: { mean: 0.84 },
        parameters: { competenceLevel: { nameShort: 'II' } },
      },
    ]);

    expect(item.id).toBe('D38701');
    expect(item.solutionFrequency).toBeCloseTo(0.84);
    expect(item.solutionFrequencyPercentage).toBeCloseTo(84);
    expect(item.exerciseId).toBe('Geheimsache');
    expect(item.competenceLevel).toBe('II');
  });

  it('fällt auf "unknown" zurück, wenn keine Aufgabe genannt ist', () => {
    const [item] = transformItems([{ id: 'x', descriptiveStatistics: { mean: 0 } }]);
    expect(item.exerciseId).toBe('unknown');
    expect(item.solutionFrequency).toBe(0);
  });
});

describe('sortItems', () => {
  it('ordnet nach Aufgabe, dann Position, dann Kennung', () => {
    const sortiert = sortItems([
      { exercise: { name: 'B' }, position: 1, iqbId: 'b1' },
      { exercise: { name: 'A' }, position: 2, iqbId: 'a2' },
      { exercise: { name: 'A' }, position: 1, iqbId: 'a1' },
    ]);
    expect(sortiert.map((i) => i.iqbId)).toEqual(['a1', 'a2', 'b1']);
  });

  it('lässt die übergebene Liste unverändert', () => {
    const original = [{ iqbId: 'b' }, { iqbId: 'a' }];
    sortItems(original);
    expect(original.map((i) => i.iqbId)).toEqual(['b', 'a']);
  });
});
