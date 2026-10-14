// Lösungsquote nach Merkmal — Berechnung.
//
// Aus den Rückmeldungen von indibit (Schul- und Schulaufsichtsrückmeldung,
// `app-covariate-gradient-chart`): die Lösungsquote je Ausprägung eines
// Hintergrundmerkmals — Geschlecht, Sprache zu Hause, Sozialindex — und daneben
// dieselbe Größe für die Bezugsgruppen. Ungleichheit wird damit als Muster
// sichtbar, nicht als ein einzelner Wert.
//
// Je Ausprägung eine Zeile, je Bezugsgruppe ein Punkt auf derselben Skala;
// eine Linie verbindet den kleinsten mit dem größten Wert der Zeile.

export const NAME = 'merkmal-gradient';

export const STANDARD = {
  titel: '',
  /** Wie das Merkmal heißt, etwa „Geschlecht“. */
  merkmal: '',
  /** Die Ausprägungen in der Reihenfolge, in der sie stehen sollen. */
  auspraegungen: [],
  /** Bezugsgruppen: [{ id, label, werte: { [auspraegung]: 0…100 }, n?: { [auspraegung]: Zahl } }] */
  reihen: [],
  min: 0,
  max: 100,
  einheit: '%',
};

export const MASSE = { labelBreite: 140, chartBreite: 380, zeile: 34, oben: 30, unten: 34, rechts: 16 };

export function gradient(props = {}) {
  const { titel, merkmal, auspraegungen, reihen, min, max, einheit } = { ...STANDARD, ...props };
  const m = MASSE;
  const spanne = Math.max(1e-6, max - min);
  const x = (w) => m.labelBreite + ((Math.max(min, Math.min(max, w)) - min) / spanne) * m.chartBreite;
  const liste = Array.isArray(reihen) ? reihen : [];

  const zeilen = (Array.isArray(auspraegungen) ? auspraegungen : []).map((a, i) => {
    const id = typeof a === 'object' ? a.id : a;
    const label = typeof a === 'object' ? (a.label ?? a.id) : a;
    const y = m.oben + i * m.zeile + m.zeile / 2;
    const punkte = liste
      .map((r, j) => ({ reihe: r.id, label: r.label, index: j, wert: r.werte?.[id], n: r.n?.[id] }))
      .filter((p) => p.wert !== null && p.wert !== undefined && Number.isFinite(p.wert))
      .map((p) => ({ ...p, x: x(p.wert), y, wertText: `${Math.round(p.wert)}${einheit}` }));
    const xs = punkte.map((p) => p.x);
    return {
      id, label, y, punkte,
      von: xs.length ? Math.min(...xs) : null,
      bis: xs.length ? Math.max(...xs) : null,
    };
  });

  const ticks = [0, 25, 50, 75, 100]
    .map((t) => min + (t / 100) * spanne)
    .map((w) => ({ wert: w, x: x(w), text: `${Math.round(w)}${einheit}` }));

  return {
    titel, merkmal, einheit,
    zeilen,
    legende: liste.map((r, j) => ({ id: r.id, label: r.label, index: j })),
    ticks,
    breite: m.labelBreite + m.chartBreite + m.rechts,
    hoehe: m.oben + zeilen.length * m.zeile + m.unten,
    masse: m,
  };
}

export default gradient;
