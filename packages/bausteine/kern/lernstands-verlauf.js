// Lernstands-Verlauf — Berechnung.
//
// Erfunden für die Bibliothek: der Katalog zeigt jede Erhebung für sich, und
// die Frage, die Lehrkräfte zuerst stellen — „wird es besser?" — beantwortet
// keine Einzelansicht. Hier liegen mehrere Zeitpunkte auf einer Achse, mit dem
// Unsicherheitsband um jeden Wert.
//
// Das Band ist der Punkt der Sache: zwei Werte ohne Konfidenzintervall sehen
// immer nach Veränderung aus. Wo die Bänder sich überlappen, ist keine.

export const NAME = 'lernstands-verlauf';

export const STANDARD = {
  /** [{ label, mean, ciLow?, ciHigh?, n? }] — ein Eintrag je Erhebung. */
  punkte: [],
  /** Optionaler Vergleich, gleiche Länge: [{ mean }] — etwa der faire Vergleich. */
  vergleich: [],
  title: '',
  vergleichLabel: 'fairer Vergleich',
  yTitel: 'Lösungsquote (%)',
  yMin: 0,
  yMax: 100,
};

export const MASSE = {
  links: 52,
  rechts: 96,
  oben: 24,
  unten: 46,
  breite: 620,
  hoehe: 260,
  punktRadius: 5,
};

const f = (n) => Number(n).toFixed(1);

/** Ein Pfad durch die Punkte. Gerade Strecken: zwischen zwei Erhebungen ist
 *  nichts gemessen, und eine Kurve würde einen Verlauf behaupten. */
function linie(punkte) {
  return punkte.map((p, i) => `${i === 0 ? 'M' : 'L'} ${f(p.x)} ${f(p.y)}`).join(' ');
}

export function geometrie(props = {}) {
  const { punkte, vergleich, title, vergleichLabel, yTitel, yMin, yMax } = { ...STANDARD, ...props };
  const liste = Array.isArray(punkte) ? punkte : [];
  const gegen = Array.isArray(vergleich) ? vergleich : [];
  const m = MASSE;
  const feldBreite = m.breite - m.links - m.rechts;
  const feldHoehe = m.hoehe - m.oben - m.unten;
  const spanne = Math.max(1, yMax - yMin);

  const x = (i) => (liste.length <= 1
    ? m.links + feldBreite / 2
    : m.links + (i / (liste.length - 1)) * feldBreite);
  const y = (wert) => m.oben + feldHoehe - ((Math.max(yMin, Math.min(yMax, wert ?? yMin)) - yMin) / spanne) * feldHoehe;

  const gezeichnet = liste.map((p, i) => {
    const hatBand = p.ciLow !== null && p.ciLow !== undefined && p.ciHigh !== null && p.ciHigh !== undefined;
    return {
      index: i,
      label: p.label ?? String(i + 1),
      wert: p.mean ?? null,
      n: p.n ?? null,
      x: x(i),
      y: y(p.mean),
      hatBand,
      bandOben: hatBand ? y(p.ciHigh) : null,
      bandUnten: hatBand ? y(p.ciLow) : null,
      ciLow: p.ciLow ?? null,
      ciHigh: p.ciHigh ?? null,
      // Veränderung zum vorigen Zeitpunkt, und ob sie mehr ist als Rauschen:
      // überlappende Bänder heißen „kein belegter Unterschied".
      delta: i === 0 || liste[i - 1].mean == null || p.mean == null
        ? null
        : Math.round(((p.mean ?? 0) - (liste[i - 1].mean ?? 0)) * 10) / 10,
      belegt: i > 0 && hatBand && liste[i - 1].ciHigh !== undefined && liste[i - 1].ciLow !== undefined
        ? p.ciLow > liste[i - 1].ciHigh || p.ciHigh < liste[i - 1].ciLow
        : false,
    };
  });

  const bandPfad = gezeichnet.length && gezeichnet.every((p) => p.hatBand)
    ? `${gezeichnet.map((p, i) => `${i === 0 ? 'M' : 'L'} ${f(p.x)} ${f(p.bandOben)}`).join(' ')} ` +
      `${[...gezeichnet].reverse().map((p) => `L ${f(p.x)} ${f(p.bandUnten)}`).join(' ')} Z`
    : '';

  const vergleichPunkte = gegen.slice(0, liste.length).map((p, i) => ({
    index: i,
    wert: p.mean ?? null,
    x: x(i),
    y: y(p.mean),
  }));

  return {
    breite: m.breite,
    hoehe: m.hoehe,
    titel: title,
    yTitel,
    vergleichLabel,
    punktRadius: m.punktRadius,
    feld: { x: m.links, y: m.oben, breite: feldBreite, hoehe: feldHoehe },
    teilstriche: [0, 0.25, 0.5, 0.75, 1].map((anteil) => {
      const wert = Math.round(yMin + anteil * spanne);
      return { wert, y: y(wert) };
    }),
    bandPfad,
    linie: linie(gezeichnet),
    vergleichLinie: vergleichPunkte.length ? linie(vergleichPunkte) : '',
    punkte: gezeichnet,
    vergleich: vergleichPunkte,
    letzterWert: gezeichnet.at(-1) ?? null,
  };
}

export default geometrie;
