// Übersichtskarten — Berechnung.
//
// Karten statt Diagramm: je Teilbereich eine Kachel mit Ringdiagramm,
// Kennzahl und aufklappbaren Details. Der zweite Baustein, der kein SVG-Bild
// ist, sondern eine Anordnung aus Knoten — mit dem ersten Entwurf wäre er
// nicht zu bauen gewesen.
//
// Der Ring ist bewusst ein Ring und keine Torte: der freie Kern trägt die
// Kennzahl, und ohne sie wäre die Karte nur ein Bild.

export const NAME = 'uebersichtskarten';

export const STANDARD = {
  /** [{ id, label, wert, einheit?, anteile: [{ label, wert, farbe? }], details?: [{ label, wert }] }] */
  karten: [],
  title: '',
  /** Kennungen der aufgeklappten Karten. */
  geoeffnet: [],
  /** Wie viele Karten nebeneinander passen sollen. */
  spalten: 3,
};

export const RING = { groesse: 120, aussen: 52, innen: 34 };

/** Die Farben der Anteile, wenn keine mitgegeben wird. */
export const REIHENFOLGE = [
  'var(--tba3-_stufe-5)',
  'var(--tba3-_stufe-4)',
  'var(--tba3-_stufe-3)',
  'var(--tba3-_stufe-2)',
  'var(--tba3-_stufe-1)',
];

const f = (n) => Number(n).toFixed(2);

function punkt(grad, radius) {
  const rad = ((grad - 90) * Math.PI) / 180;
  return {
    x: RING.groesse / 2 + radius * Math.cos(rad),
    y: RING.groesse / 2 + radius * Math.sin(rad),
  };
}

/**
 * Ein Ringsegment als Pfad.
 *
 * 360° wird zu 359.99 gestaucht: ein Bogen, dessen Anfang genau auf seinem
 * Ende liegt, zeichnet in SVG nichts — ein voller Ring verschwände also.
 */
export function ringSegment(von, bis) {
  const ende = bis >= 360 ? 359.99 : bis;
  const gross = ende - von > 180 ? 1 : 0;
  const a = punkt(von, RING.aussen);
  const b = punkt(ende, RING.aussen);
  const c = punkt(ende, RING.innen);
  const d = punkt(von, RING.innen);
  return (
    `M ${f(a.x)} ${f(a.y)} A ${RING.aussen} ${RING.aussen} 0 ${gross} 1 ${f(b.x)} ${f(b.y)}` +
    ` L ${f(c.x)} ${f(c.y)} A ${RING.innen} ${RING.innen} 0 ${gross} 0 ${f(d.x)} ${f(d.y)} Z`
  );
}

/** Die Karten, jede mit fertigen Ringsegmenten und Zustand. */
export function karten(props = {}) {
  const { karten: liste, geoeffnet } = { ...STANDARD, ...props };
  const offen = new Set(Array.isArray(geoeffnet) ? geoeffnet : []);

  return (Array.isArray(liste) ? liste : []).map((karte, i) => {
    const anteile = Array.isArray(karte.anteile) ? karte.anteile : [];
    const summe = anteile.reduce((s, a) => s + Number(a.wert ?? 0), 0);
    let grad = 0;

    return {
      id: karte.id ?? String(i),
      index: i,
      label: karte.label ?? '',
      wert: karte.wert ?? null,
      einheit: karte.einheit ?? '',
      offen: offen.has(karte.id ?? String(i)),
      details: Array.isArray(karte.details) ? karte.details : [],
      hatDetails: Array.isArray(karte.details) && karte.details.length > 0,
      segmente: anteile.map((anteil, j) => {
        const wert = Number(anteil.wert ?? 0);
        const anteilProzent = summe > 0 ? wert / summe : 0;
        const von = grad;
        grad += anteilProzent * 360;
        return {
          label: anteil.label ?? '',
          wert,
          anteil: anteilProzent,
          farbe: anteil.farbe ?? REIHENFOLGE[j % REIHENFOLGE.length],
          pfad: ringSegment(von, grad),
        };
      }),
    };
  });
}

/** Die Karten-Kennungen nach einem Klick auf „aufklappen". */
export function umschalten(geoeffnet, id) {
  const jetzt = Array.isArray(geoeffnet) ? geoeffnet : [];
  return jetzt.includes(id) ? jetzt.filter((x) => x !== id) : [...jetzt, id];
}

export default karten;
