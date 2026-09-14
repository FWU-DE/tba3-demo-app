// Kompetenzstufen-Leiste — Berechnung.
//
// Dieser Kern liefert **Geometrie, keine Zeichenkette**: Zahlen und Objekte,
// aus denen jede Fassung ihr eigenes DOM baut. Das ist der Unterschied zum
// ersten Entwurf, der fertiges SVG ausgab — daran ließen sich keine Ereignisse
// hängen, weil das Framework den Inhalt nicht kannte.
//
// Der Kern ist rein: keine Abhängigkeit, kein DOM, auf dem Server lauffähig.
// Er ist der Teil, der nicht driften darf; das Zeichnen ist austauschbar.

export const NAME = 'kompetenzstufen-leiste';

export const STANDARD = {
  /** [{ label, total?, fair?, levels: [{ nameShort, pct, color? }] }] */
  rows: [],
  title: '',
  domain: '',
};

export const MASSE = {
  labelBreite: 160,
  balkenBreite: 560,
  balkenHoehe: 28,
  luecke: 12,
  oben: 28,
  unten: 40,
  rechts: 48,
  get breite() {
    return this.labelBreite + this.balkenBreite + this.rechts;
  },
};

export const TEILSTRICHE = [0, 25, 50, 75, 100];

/** Stufe 1–5 auf die Themenvariable abbilden, wenn die Daten keine Farbe nennen. */
export function stufenFarbe(index, eigene) {
  if (eigene) return eigene;
  return `var(--tba3-_stufe-${Math.min(index + 1, 5)})`;
}

/**
 * Die vollständige Geometrie einer Leiste.
 *
 * @returns {{
 *   breite: number, hoehe: number, balkenBlock: number,
 *   teilstriche: {pct: number, x: number}[],
 *   zeilen: {
 *     label: string, total: (number|string), fair: boolean, y: number,
 *     segmente: {x: number, breite: number, nameShort: string, pct: number,
 *                farbe: string, beschriftbar: boolean}[],
 *   }[],
 *   legende: {nameShort: string, farbe: string, x: number}[],
 *   legendeY: number,
 * }}
 */
export function geometrie(props = {}) {
  const { rows, title } = { ...STANDARD, ...props };
  const zeilenDaten = Array.isArray(rows) ? rows : [];
  const m = MASSE;

  const balkenBlock = Math.max(zeilenDaten.length * (m.balkenHoehe + m.luecke) - m.luecke, 0);
  const hoehe = m.oben + balkenBlock + m.unten;
  const x = (pct) => m.labelBreite + (pct / 100) * m.balkenBreite;

  const zeilen = zeilenDaten.map((row, i) => {
    const y = m.oben + i * (m.balkenHoehe + m.luecke);
    const segmente = [];
    let lauf = 0;
    (row.levels ?? []).forEach((lvl, j) => {
      // Anteile unter 0.1 % wären schmaler als ein Pixel und rissen nur eine
      // Fuge zwischen zwei sichtbaren Segmenten auf.
      if (!(lvl.pct >= 0.1)) return;
      const breite = (lvl.pct / 100) * m.balkenBreite;
      segmente.push({
        x: m.labelBreite + lauf,
        breite,
        nameShort: lvl.nameShort ?? '',
        pct: lvl.pct,
        farbe: stufenFarbe(j, lvl.color),
        // Beschriftung nur, wenn das Segment sie trägt — sonst steht die Stufe
        // über der Nachbarfarbe und ist nicht mehr zuzuordnen.
        beschriftbar: breite > 24,
      });
      lauf += breite;
    });
    return {
      label: row.label ?? '',
      total: row.total ?? '?',
      fair: Boolean(row.fair),
      y,
      segmente,
    };
  });

  const ersteStufen = zeilenDaten[0]?.levels ?? [];

  return {
    breite: m.breite,
    hoehe,
    balkenBlock,
    titel: title,
    teilstriche: TEILSTRICHE.map((pct) => ({ pct, x: x(pct) })),
    zeilen,
    legende: ersteStufen.map((lvl, i) => ({
      nameShort: lvl.nameShort ?? '',
      farbe: stufenFarbe(i, lvl.color),
      x: i * 90,
    })),
    legendeY: m.oben + balkenBlock + 10,
  };
}

export default geometrie;
