// Abweichung je Lerngruppe — Berechnung.
//
// Aus der Schulleitungsrückmeldung des zepf (`classDeviationConfig`): ein
// Balken je Klasse um eine Nulllinie, die der Wert der Schule ist. Für die
// Schulleitung die schnellste Antwort auf die Frage, wo es sich zu reden lohnt.
//
// Gezeigt wird die Differenz in Prozentpunkten, nicht der Wert selbst — der
// steht als Zahl daneben. Eine Schwelle trennt „auffällig“ von „im Rahmen“,
// dieselbe Sprache wie Aufgaben-Tabelle und Kennzahl-Kachel.

export const NAME = 'abweichung-je-gruppe';

export const STANDARD = {
  titel: '',
  /** Der Bezugswert, etwa die Schule: { label, wert } */
  bezug: { label: 'Schule', wert: null },
  /** [{ id, label, wert, n? }] */
  gruppen: [],
  einheit: '%',
  /** Ab welcher Abweichung in Prozentpunkten ein Balken als auffällig gilt. */
  schwelle: 5,
};

export const MASSE = { labelBreite: 130, chartBreite: 360, zeile: 30, oben: 28, unten: 30, rechts: 70 };

export function bewertung(delta, schwelle = STANDARD.schwelle) {
  if (delta > schwelle) return 'ueber';
  if (delta < -schwelle) return 'unter';
  return 'im-rahmen';
}

export function abweichung(props = {}) {
  const { titel, bezug, gruppen, einheit, schwelle } = { ...STANDARD, ...props };
  const m = MASSE;
  const liste = (Array.isArray(gruppen) ? gruppen : [])
    .filter((g) => g && Number.isFinite(g.wert));
  const basis = bezug && Number.isFinite(bezug.wert) ? bezug.wert : null;

  const deltas = liste.map((g) => (basis === null ? 0 : g.wert - basis));
  // Symmetrische Skala, damit gleiche Abweichungen gleich lang sind — und nie
  // enger als ±10, sonst wirkt ein Punkt Unterschied wie ein Ereignis.
  const reichweite = Math.max(10, ...deltas.map((d) => Math.ceil(Math.abs(d) / 5) * 5));
  const mitte = m.labelBreite + m.chartBreite / 2;
  const x = (d) => mitte + (d / reichweite) * (m.chartBreite / 2);

  const zeilen = liste.map((g, i) => {
    const delta = Math.round(deltas[i] * 10) / 10;
    const y = m.oben + i * m.zeile;
    return {
      id: g.id, label: g.label, wert: g.wert, n: g.n ?? null,
      delta,
      deltaText: `${delta > 0 ? '+' : ''}${delta}`,
      bewertung: bewertung(delta, schwelle),
      y,
      x: Math.min(x(0), x(delta)),
      breite: Math.abs(x(delta) - x(0)),
      wertText: `${Math.round(g.wert)}${einheit}`,
    };
  });

  return {
    titel, einheit,
    bezug: basis === null ? null : { label: bezug.label, wert: basis, wertText: `${Math.round(basis)}${einheit}` },
    zeilen,
    mitte,
    ticks: [-reichweite, -reichweite / 2, 0, reichweite / 2, reichweite]
      .map((d) => ({ wert: d, x: x(d), text: `${d > 0 ? '+' : ''}${d}` })),
    breite: m.labelBreite + m.chartBreite + m.rechts,
    hoehe: m.oben + liste.length * m.zeile + m.unten,
    masse: m,
  };
}

export default abweichung;
