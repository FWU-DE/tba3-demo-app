// Aufgaben-Tabelle — Berechnung.
//
// Der Baustein, an dem sich zeigt, dass der Umbau nötig war: eine Tabelle mit
// Sortierung ist kein SVG und braucht Zustand. Mit einer fertigen Zeichenkette
// wäre sie nicht zu bauen gewesen.
//
// Der Kern hält keinen Zustand — er bekommt die gewünschte Sortierung herein
// und gibt die sortierten Zeilen heraus. Den Zustand hält das Element.

export const NAME = 'aufgaben-tabelle';

export const STANDARD = {
  /** [{ label, level, exercise?, actual, expected? }] */
  items: [],
  title: '',
  /** Spaltenkennung, nach der sortiert wird. */
  sortierung: 'position',
  /** 'auf' | 'ab' */
  richtung: 'auf',
};

/** Die Spalten der Tabelle. `zahl` steuert Ausrichtung und Vergleich. */
export const SPALTEN = [
  { id: 'position', titel: 'Aufgabe', zahl: false, wert: (it, i) => it.label ?? String(i) },
  { id: 'exercise', titel: 'Aufgabenname', zahl: false, wert: (it) => it.exercise ?? '' },
  { id: 'level', titel: 'Stufe', zahl: false, wert: (it) => it.level ?? '' },
  { id: 'actual', titel: 'Lösungsquote', zahl: true, wert: (it) => it.actual ?? 0 },
  { id: 'expected', titel: 'Erwartet', zahl: true, wert: (it) => it.expected ?? null },
  { id: 'delta', titel: 'Abweichung', zahl: true, wert: (it) =>
      it.expected == null ? null : Math.round((it.actual ?? 0) - it.expected) },
];

export const SCHWELLE = 7;

/** Grün über Erwartung, rot darunter, neutral im Rahmen. */
export function bewertung(delta) {
  if (delta === null || delta === undefined) return 'im-rahmen';
  if (delta > SCHWELLE) return 'ueber';
  if (delta < -SCHWELLE) return 'unter';
  return 'im-rahmen';
}

/**
 * Die Zeilen in der gewünschten Reihenfolge, samt abgeleiteter Werte.
 *
 * Stabil sortiert: bei gleichen Werten bleibt die ursprüngliche Reihenfolge,
 * sonst springen Zeilen beim Umschalten scheinbar grundlos.
 */
export function zeilen(props = {}) {
  const { items, sortierung, richtung } = { ...STANDARD, ...props };
  const liste = Array.isArray(items) ? items : [];
  const spalte = SPALTEN.find((sp) => sp.id === sortierung) ?? SPALTEN[0];

  const aufbereitet = liste.map((it, i) => {
    const delta = it.expected == null ? null : Math.round((it.actual ?? 0) - it.expected);
    return {
      ...it,
      index: i,
      label: it.label ?? String(i + 1),
      delta,
      bewertung: bewertung(delta),
      sortierwert: spalte.wert(it, i),
    };
  });

  const vorzeichen = richtung === 'ab' ? -1 : 1;
  aufbereitet.sort((a, b) => {
    const x = a.sortierwert;
    const y = b.sortierwert;
    if (x === y) return a.index - b.index;
    // Leere Werte immer ans Ende, unabhängig von der Richtung — eine leere
    // Zelle ist kein "kleinster Wert", sie ist gar keiner.
    if (x === null || x === undefined || x === '') return 1;
    if (y === null || y === undefined || y === '') return -1;
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * vorzeichen;
    return String(x).localeCompare(String(y), 'de', { numeric: true }) * vorzeichen;
  });

  return aufbereitet;
}

/** Welche Sortierung ein Klick auf `spalteId` ergibt. */
export function naechsteSortierung(aktuell, richtung, spalteId) {
  if (aktuell !== spalteId) {
    const spalte = SPALTEN.find((sp) => sp.id === spalteId);
    // Zahlen zuerst absteigend: „die auffälligsten zuerst" ist beim Klick auf
    // eine Kennzahl fast immer gemeint.
    return { sortierung: spalteId, richtung: spalte?.zahl ? 'ab' : 'auf' };
  }
  return { sortierung: spalteId, richtung: richtung === 'auf' ? 'ab' : 'auf' };
}

export default zeilen;
