// Kontextmerkmal als Ring — Berechnung.
//
// Gefunden in der Schulrückmeldung von indibit, wo vier davon nebeneinander
// stehen: sozioökonomischer Status, Teilnahmequote, Geschlecht, Sprache
// zuhause. Kein Sachbericht nennt den Baustein; die Anwendung zeigt ihn.
//
// Der Ring beantwortet die Frage, die vor jedem Ergebnis kommt: **wer ist
// diese Gruppe?** Eine Lösungsquote von 62 % heißt etwas anderes, wenn die
// Hälfte der Klasse nicht mitgeschrieben hat. Deshalb steht das Merkmal als
// Ring und nicht als Zeile in einer Fußnote.
//
// Die Mitte trägt bewusst **eine** Angabe: die Gesamtzahl, oder — wenn die
// Kategorien geordnet sind — die mittlere Kategorie. Zwei Zahlen in der Mitte
// eines Rings liest niemand.

export const NAME = 'kontextmerkmal-ring';

export const STANDARD = {
  label: '',
  /** [{ label, wert, farbe? }] — Anteile in beliebiger Einheit, es wird normiert. */
  segmente: [],
  /** Was in der Mitte steht. Leer = die Summe der Segmente. */
  mitte: '',
  /** Kleine Zeile unter der Mitte, etwa „Schul-Median". */
  mitteLabel: '',
  /** Sind die Kategorien geordnet (A–E, Stufen)? Dann ist der Median sinnvoll. */
  geordnet: false,
};

export const MASSE = { groesse: 148, aussen: 62, innen: 42 };

/** Punkt auf dem Kreis; 0 ist oben, im Uhrzeigersinn. */
const punkt = (mitte, radius, anteil) => {
  const winkel = anteil * 2 * Math.PI - Math.PI / 2;
  return [mitte + radius * Math.cos(winkel), mitte + radius * Math.sin(winkel)];
};

/**
 * Der Pfad eines Rings zwischen zwei Anteilen. Ein Segment, das den ganzen
 * Kreis füllt, bekommt zwei Bögen — mit einem einzigen wäre Anfang gleich Ende
 * und der Pfad bliebe leer. Genau daran scheitern Ringe mit nur einer
 * Kategorie, und „alle nehmen teil" ist kein seltener Fall.
 */
export function ringPfad(von, bis, { groesse, aussen, innen } = MASSE) {
  const m = groesse / 2;
  if (bis - von >= 1) {
    const halb = (r) => `M ${m} ${m - r} A ${r} ${r} 0 1 1 ${m - 0.01} ${m - r} Z`;
    return `${halb(aussen)} ${halb(innen)}`;
  }
  const gross = bis - von > 0.5 ? 1 : 0;
  const [ax, ay] = punkt(m, aussen, von);
  const [bx, by] = punkt(m, aussen, bis);
  const [cx, cy] = punkt(m, innen, bis);
  const [dx, dy] = punkt(m, innen, von);
  return [
    `M ${ax} ${ay}`,
    `A ${aussen} ${aussen} 0 ${gross} 1 ${bx} ${by}`,
    `L ${cx} ${cy}`,
    `A ${innen} ${innen} 0 ${gross} 0 ${dx} ${dy}`,
    'Z',
  ].join(' ');
}

export function ring(props = {}) {
  const { label, segmente, mitte, mitteLabel, geordnet } = { ...STANDARD, ...props };

  const gueltig = (Array.isArray(segmente) ? segmente : [])
    .filter((s) => s && Number.isFinite(s.wert) && s.wert > 0);
  const summe = gueltig.reduce((n, s) => n + s.wert, 0);

  let gelaufen = 0;
  const teile = gueltig.map((s, i) => {
    const anteil = summe ? s.wert / summe : 0;
    const von = gelaufen;
    gelaufen += anteil;
    return {
      ...s,
      index: i,
      anteil,
      prozent: Math.round(anteil * 100),
      von,
      bis: gelaufen,
      pfad: ringPfad(von, gelaufen),
    };
  });

  // Der Median einer geordneten Kategorienreihe: die Kategorie, in der die
  // Hälfte der Fälle überschritten wird. Nur sinnvoll, wenn die Reihenfolge
  // eine Bedeutung hat — bei „Deutsch / andere" wäre sie erfunden.
  let median = null;
  if (geordnet && summe) {
    let bisher = 0;
    for (const t of teile) {
      bisher += t.wert;
      if (bisher >= summe / 2) { median = t; break; }
    }
  }

  return {
    label,
    segmente: teile,
    summe,
    leer: teile.length === 0,
    mitte: mitte || (median ? median.label : String(summe)),
    mitteLabel: mitteLabel || (median ? 'Median' : ''),
    median,
    masse: MASSE,
  };
}

export default ring;
