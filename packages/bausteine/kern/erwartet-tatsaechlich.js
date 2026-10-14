// Erwartete gegen tatsächliche Lösungsquote je Aufgabe — Berechnung.
//
// Der Erwartungswert stammt aus dem Rasch-Modell (BISTA-Parameter); die
// Abweichung ist der eigentliche didaktische Hinweis, deshalb trägt sie die
// Farbe.

import { text } from './texte.js';

export const NAME = 'erwartet-tatsaechlich';

export const STANDARD = {
  /** [{ label, level, actual, expected }] */
  items: [],
  title: '',
  domain: '',
  /** Ab welcher Abweichung in Prozentpunkten eine Aufgabe auffällt. */
  schwelle: 7,
};

export const MASSE = {
  labelBreite: 80,
  abzeichen: 22,
  chartBreite: 440,
  zeilenHoehe: 22,
  luecke: 6,
  oben: 28,
  unten: 28,
  rechts: 72,
  get chartX() {
    return this.labelBreite + this.abzeichen + 8;
  },
  get breite() {
    return this.chartX + this.chartBreite + this.rechts;
  },
};

export const TEILSTRICHE = [0, 25, 50, 75, 100];

/** Grün über Erwartung, rot darunter, neutral im Rahmen. */
export function bewertung(actual, expected, schwelle) {
  const d = (actual ?? 0) - (expected ?? 0);
  if (d > schwelle) return 'ueber';
  if (d < -schwelle) return 'unter';
  return 'im-rahmen';
}

/** Die Legende als Daten — die Fassungen bauen daraus ihr eigenes Markup. */
export function legende(schwelle = STANDARD.schwelle, sprache = 'de') {
  return [
    { art: 'punkt', bewertung: 'ueber', text: text('erwartung.ueber', sprache, { n: schwelle }) },
    { art: 'punkt', bewertung: 'im-rahmen', text: text('erwartung.im-rahmen', sprache) },
    { art: 'punkt', bewertung: 'unter', text: text('erwartung.unter', sprache, { n: schwelle }) },
    { art: 'linie', bewertung: null, text: text('erwartung.linie', sprache) },
  ];
}

export function geometrie(props = {}) {
  const { items, title, domain, schwelle, sprache } = { ...STANDARD, ...props };
  const liste = Array.isArray(items) ? items : [];
  const m = MASSE;

  const flaeche = Math.max(liste.length * (m.zeilenHoehe + m.luecke) - m.luecke, 0);
  const hoehe = m.oben + flaeche + m.unten;
  const x = (pct) => m.chartX + (Math.max(0, Math.min(100, pct ?? 0)) / 100) * m.chartBreite;

  return {
    breite: m.breite,
    hoehe,
    flaeche,
    titel: title,
    domain,
    schwelle,
    legende: legende(schwelle, sprache),
    teilstriche: TEILSTRICHE.map((pct) => ({ pct, x: x(pct) })),
    zeilen: liste.map((it, i) => {
      const actual = it.actual ?? 0;
      const expected = it.expected ?? 0;
      const y = m.oben + i * (m.zeilenHoehe + m.luecke);
      const delta = Math.round(actual - expected);
      return {
        label: it.label ?? '',
        level: it.level ?? '',
        actual,
        expected,
        delta,
        bewertung: bewertung(actual, expected, schwelle),
        auffaellig: Math.abs(delta) > schwelle,
        y,
        balkenBreite: (actual / 100) * m.chartBreite,
        erwartungX: x(expected),
        luecke: {
          x: Math.min(x(actual), x(expected)),
          breite: (Math.abs(actual - expected) / 100) * m.chartBreite,
        },
      };
    }),
  };
}

export default geometrie;
