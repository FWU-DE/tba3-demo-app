// Schüler-Tabelle — Berechnung.
//
// Lösungen je Schüler:in: pro Teilbereich ein gestapelter Balken aus richtig,
// ausgelassen und falsch. Der Baustein, für den die Bibliothek eine
// Auswahl-Schnittstelle gebraucht hat — eine Tabelle, aus der man Zeilen
// mitnimmt, ist etwas anderes als eine, die man nur liest.
//
// Wie bei der Aufgaben-Tabelle hält der Kern keinen Zustand: Sortierung und
// Auswahl kommen herein, die fertigen Zeilen gehen heraus.

export const NAME = 'schueler-tabelle';

export const STANDARD = {
  /** [{ id, name, gender?, absent?, absentMessage?, domains: { key: { pctCorrect, pctOmitted, pctIncorrect } } }] */
  rows: [],
  /** [{ key, label }] — welche Teilbereiche als Spalten erscheinen. */
  domains: [
    { key: 'total', label: 'Insgesamt' },
    { key: 'reading', label: 'Lesen' },
    { key: 'listening', label: 'Zuhören' },
  ],
  title: '',
  /** Teilbereichs-Schlüssel, nach dem sortiert wird, oder 'name'. */
  sortierung: 'total',
  /** 'auf' | 'ab' */
  richtung: 'ab',
  /** Ausgewählte Zeilen-Kennungen. */
  auswahl: [],
  /** Auswahl überhaupt anbieten. */
  auswaehlbar: true,
};

/** Die drei Anteile eines Balkens, in dieser Reihenfolge. */
export const ANTEILE = [
  { id: 'richtig', feld: 'pctCorrect', label: 'richtig' },
  { id: 'ausgelassen', feld: 'pctOmitted', label: 'ausgelassen' },
  { id: 'falsch', feld: 'pctIncorrect', label: 'falsch' },
];

export const BALKEN = { breite: 160, hoehe: 10 };

/**
 * Nächste Sortierung beim Klick auf eine Spalte.
 *
 * Zahlen zuerst absteigend — wer auf „Lesen" klickt, sucht die höchsten
 * Quoten, nicht die niedrigsten. Der Name dagegen zuerst aufsteigend.
 */
export function naechsteSortierung(sortierung, richtung, ziel) {
  if (sortierung === ziel) {
    return { sortierung: ziel, richtung: richtung === 'auf' ? 'ab' : 'auf' };
  }
  return { sortierung: ziel, richtung: ziel === 'name' ? 'auf' : 'ab' };
}

/** Die Segmente eines Balkens: x, Breite und Anteil je Kategorie. */
export function segmente(bereich, breite = BALKEN.breite) {
  if (!bereich) return [];
  const stuecke = [];
  let x = 0;
  for (const anteil of ANTEILE) {
    const pct = Number(bereich[anteil.feld] ?? 0);
    if (!(pct > 0)) continue;
    const w = (pct / 100) * breite;
    stuecke.push({ id: anteil.id, label: anteil.label, pct, x, breite: w });
    x += w;
  }
  return stuecke;
}

/**
 * Die Zeilen in der gewünschten Reihenfolge.
 *
 * Abwesende stehen immer am Ende: sie haben keinen Wert, nach dem sich
 * sortieren ließe, und oben wären sie eine Reihe leerer Zeilen vor den Daten.
 * Stabil sortiert, damit beim Umschalten nichts grundlos springt.
 */
export function zeilen(props = {}) {
  const { rows, domains, sortierung, richtung, auswahl } = { ...STANDARD, ...props };
  const liste = Array.isArray(rows) ? rows : [];
  const spalten = Array.isArray(domains) && domains.length ? domains : STANDARD.domains;
  const gewaehlt = new Set(Array.isArray(auswahl) ? auswahl : []);

  const aufbereitet = liste.map((row, i) => ({
    ...row,
    index: i,
    id: row.id ?? String(i),
    name: row.name ?? '',
    abwesend: row.absent === true,
    gewaehlt: gewaehlt.has(row.id ?? String(i)),
    bereiche: spalten.map((sp) => {
      const werte = row.domains?.[sp.key];
      return {
        key: sp.key,
        vorhanden: Boolean(werte),
        wert: Number(werte?.pctCorrect ?? 0),
        segmente: segmente(werte),
      };
    }),
  }));

  const wertVon = (zeile) => {
    if (sortierung === 'name') return zeile.name;
    return zeile.bereiche.find((b) => b.key === sortierung)?.wert ?? 0;
  };

  const richtungsfaktor = richtung === 'ab' ? -1 : 1;
  return aufbereitet
    .map((zeile, i) => ({ zeile, i }))
    .sort((a, b) => {
      if (a.zeile.abwesend !== b.zeile.abwesend) return a.zeile.abwesend ? 1 : -1;
      const av = wertVon(a.zeile);
      const bv = wertVon(b.zeile);
      if (av === bv) return a.i - b.i;
      if (typeof av === 'string' || typeof bv === 'string') {
        return String(av).localeCompare(String(bv), 'de') * richtungsfaktor;
      }
      return (av - bv) * richtungsfaktor;
    })
    .map(({ zeile }) => zeile);
}

/** Die Auswahl nach einem Klick auf eine Zeile. */
export function auswahlUmschalten(auswahl, id) {
  const jetzt = Array.isArray(auswahl) ? auswahl : [];
  return jetzt.includes(id) ? jetzt.filter((x) => x !== id) : [...jetzt, id];
}

/** Die Spaltenköpfe, samt Zustand für aria-sort. */
export function spalten(props = {}) {
  const { domains, sortierung, richtung } = { ...STANDARD, ...props };
  const liste = Array.isArray(domains) && domains.length ? domains : STANDARD.domains;
  return [
    { key: 'name', label: 'Schüler:in', zahl: false },
    ...liste.map((sp) => ({ key: sp.key, label: sp.label ?? sp.key, zahl: true })),
  ].map((sp) => ({
    ...sp,
    aktiv: sp.key === sortierung,
    richtung: sp.key === sortierung ? richtung : null,
  }));
}

export default zeilen;
