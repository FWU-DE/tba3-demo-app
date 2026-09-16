// Lernverlauf als Figuren — Berechnung.
//
// Gefunden in der Messwiederholung des kompetenztest.de: `BirdsResultsView.vue`
// neben `Feather.vue` und `BirdColorPicker.vue`. Jede Schüler:in ist dort ein
// Vogel, dessen **Art** die Kompetenzstufe trägt — Adler, Fink, Silbe, Möwe —,
// und der über die Messzeitpunkte hinweg steigt oder sinkt.
//
// Warum das mehr ist als ein hübsches Bild: Eine Drittklässlerin kann über sich
// selbst lesen, dass sie vom Finken zum Adler geworden ist. „Kompetenzstufe III
// im Leseverstehen" kann sie nicht lesen. Die Metapher ist die Übersetzung, und
// sie gehört zur Rückmeldung, nicht zur Verzierung.
//
// Der Baustein verallgemeinert das: **Figuren auf einer Fläche aus
// Messzeitpunkt und Fähigkeit, mit benannten Zonen statt Zahlen.** Welche
// Figur, welche Namen, welche Farben — das sagen die Daten. Eine Bibliothek,
// die Vögel fest einbaut, wäre für Mathematik unbrauchbar.

export const NAME = 'lernverlauf-figuren';

export const STANDARD = {
  /** [{ id?, label }] — die Messzeitpunkte, ältester zuerst. */
  zeitpunkte: [],
  /** [{ label, von, bis, farbe? }] — benannte Bänder, etwa Kompetenzstufen. */
  zonen: [],
  /** [{ id, name, zeichen?, farbe?, werte: [{ zeitpunkt, wert }] }] */
  personen: [],
  title: '',
  yTitel: '',
  min: 0,
  max: 100,
  /** Verbindet die Punkte einer Person; ohne Linie ist der Verlauf nicht zu lesen. */
  linien: true,
};

export const MASSE = {
  links: 116,
  rechts: 132,
  oben: 34,
  unten: 42,
  breite: 720,
  hoehe: 360,
  radius: 11,
  get flaecheBreite() {
    return this.breite - this.links - this.rechts;
  },
  get flaecheHoehe() {
    return this.hoehe - this.oben - this.unten;
  },
};

/** Zwei Buchstaben aus einem Namen — die Marke muss ohne Beschriftung erkennbar sein. */
export function zeichenVon(name) {
  const teile = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  if (teile.length === 0) return '?';
  if (teile.length === 1) return teile[0].slice(0, 2).toUpperCase();
  return (teile[0][0] + teile[teile.length - 1][0]).toUpperCase();
}

export function verlauf(props = {}) {
  const { zeitpunkte, zonen, personen, title, yTitel, min, max, linien } = { ...STANDARD, ...props };
  const m = MASSE;

  const punkteX = zeitpunkte.map((z, i) => ({
    ...z,
    id: z.id ?? String(i),
    index: i,
    // Bei einem einzigen Zeitpunkt in die Mitte — sonst klebte er am Rand.
    x: zeitpunkte.length <= 1
      ? m.links + m.flaecheBreite / 2
      : m.links + (i / (zeitpunkte.length - 1)) * m.flaecheBreite,
  }));
  const xVon = new Map(punkteX.map((z) => [z.id, z.x]));

  const spanne = Math.max(1e-6, max - min);
  const y = (wert) => m.oben + m.flaecheHoehe - ((Math.max(min, Math.min(max, wert)) - min) / spanne) * m.flaecheHoehe;

  const baender = zonen.map((zone, i) => {
    const oben = y(zone.bis);
    const unten = y(zone.von);
    return {
      ...zone,
      index: i,
      y: oben,
      hoehe: Math.max(0, unten - oben),
      mitteY: (oben + unten) / 2,
    };
  });

  const figuren = personen.map((person, i) => {
    const werte = (person.werte ?? [])
      .filter((w) => xVon.has(String(w.zeitpunkt)) && Number.isFinite(w.wert))
      .map((w) => ({ ...w, x: xVon.get(String(w.zeitpunkt)), y: y(w.wert) }));
    return {
      ...person,
      index: i,
      zeichen: person.zeichen ?? zeichenVon(person.name),
      punkte: werte,
      pfad: linien && werte.length > 1
        ? werte.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
        : '',
      // Die letzte Messung bestimmt, in welcher Zone die Figur steht — danach
      // wird sie eingefärbt, wenn die Daten keine eigene Farbe nennen.
      zone: werte.length
        ? baender.find((z) => werte.at(-1).wert >= z.von && werte.at(-1).wert <= z.bis) ?? null
        : null,
    };
  });

  return {
    title,
    yTitel,
    zeitpunkte: punkteX,
    zonen: baender,
    figuren,
    leer: figuren.every((f) => f.punkte.length === 0),
    masse: m,
  };
}

export default verlauf;
