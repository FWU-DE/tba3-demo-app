// Streudiagramm der Schüler:innen — Berechnung.
//
// Jede Schüler:in ein Punkt: Kompetenzstufe waagerecht, Lösungsquote
// senkrecht. Punkte, die aufeinanderfallen, werden leicht versetzt — sonst
// verdeckt in einer Klasse mit gleichen Werten ein Kind alle anderen.
//
// Der Tooltip gehört nicht hierher: er ist eine Überlagerung außerhalb des
// SVG, weil ein Tooltip im SVG am Rand abgeschnitten würde. Der Kern liefert
// nur die Koordinaten, an denen er stehen müsste.

export const NAME = 'streudiagramm';

export const STANDARD = {
  /** [{ id, initialen?, name, x, y, details? }] */
  punkte: [],
  title: '',
  xTitel: 'Kompetenzstufe',
  yTitel: 'Lösungsquote (%)',
  /** Stufen auf der X-Achse. */
  stufen: ['I', 'II', 'III', 'IV', 'V'],
  /** Waagerechte Marke, etwa der Klassenmittelwert. */
  mittelwert: null,
};

export const MASSE = {
  links: 52,
  rechts: 20,
  oben: 20,
  unten: 44,
  breite: 620,
  hoehe: 300,
  radius: 13,
};

export const TEILSTRICHE = [0, 25, 50, 75, 100];

/**
 * Punkte auf gleicher Stelle auseinanderziehen.
 *
 * Reihum links und rechts vom echten Ort, in wachsendem Abstand: so bleibt
 * die Wolke um ihren Wert zentriert, statt nach einer Seite zu wachsen.
 */
function versatz(anzahl) {
  const schritt = MASSE.radius * 1.7;
  return Array.from({ length: anzahl }, (_, i) => {
    const stufe = Math.ceil((i + 1) / 2);
    const seite = i % 2 === 0 ? -1 : 1;
    return i === 0 ? 0 : seite * stufe * schritt * 0.6;
  });
}

export function geometrie(props = {}) {
  const { punkte, title, xTitel, yTitel, stufen, mittelwert } = { ...STANDARD, ...props };
  const liste = Array.isArray(punkte) ? punkte : [];
  const m = MASSE;
  const feldBreite = m.breite - m.links - m.rechts;
  const feldHoehe = m.hoehe - m.oben - m.unten;
  const anzahlStufen = Math.max(1, stufen.length);

  const x = (stufe) => m.links + ((Math.max(1, Math.min(anzahlStufen, stufe ?? 1)) - 0.5) / anzahlStufen) * feldBreite;
  const y = (pct) => m.oben + feldHoehe - (Math.max(0, Math.min(100, pct ?? 0)) / 100) * feldHoehe;

  // Nach Rasterplatz gruppieren, damit gleiche Werte sich nicht verdecken.
  const gruppen = new Map();
  for (const p of liste) {
    const schluessel = `${Math.round((p.x ?? 1) * 4)}:${Math.round((p.y ?? 0) / 4)}`;
    if (!gruppen.has(schluessel)) gruppen.set(schluessel, []);
    gruppen.get(schluessel).push(p);
  }

  const gezeichnet = [];
  for (const gruppe of gruppen.values()) {
    const abstaende = versatz(gruppe.length);
    gruppe.forEach((p, i) => {
      const px = x(p.x) + abstaende[i];
      const py = y(p.y);
      gezeichnet.push({
        id: p.id ?? `${p.name}-${i}`,
        name: p.name ?? '',
        initialen: p.initialen ?? (p.name ?? '').split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase(),
        x: px,
        y: py,
        wertX: p.x,
        wertY: p.y,
        details: Array.isArray(p.details) ? p.details : [],
        // Wo eine Überlagerung stehen müsste: über dem Punkt, in Prozent des
        // Feldes, damit die Hülle sie ohne eigene Rechnung setzen kann.
        tooltipLinks: (px / m.breite) * 100,
        tooltipOben: (py / m.hoehe) * 100,
      });
    });
  }

  return {
    breite: m.breite,
    hoehe: m.hoehe,
    titel: title,
    xTitel,
    yTitel,
    radius: m.radius,
    feld: { x: m.links, y: m.oben, breite: feldBreite, hoehe: feldHoehe },
    stufen: stufen.map((label, i) => ({ label, x: x(i + 1) })),
    teilstriche: TEILSTRICHE.map((pct) => ({ pct, y: y(pct) })),
    mittelwert: mittelwert === null || mittelwert === undefined
      ? null
      : { wert: mittelwert, y: y(mittelwert) },
    punkte: gezeichnet,
  };
}

export default geometrie;
