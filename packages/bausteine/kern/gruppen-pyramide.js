// Zwei Gruppen gespiegelt — Berechnung.
//
// Aus der Schulleitungsrückmeldung des zepf (`groupComparisonConfig`): zwei
// Gruppen links und rechts einer Mittelachse, je Kompetenzstufe ein Balken —
// wie eine Bevölkerungspyramide. Unterschiede in der Form der Verteilung werden
// sichtbar, die ein Mittelwert verschluckt.
//
// Die Stufen stehen von oben nach unten absteigend, die höchste oben.

export const NAME = 'gruppen-pyramide';

export const STANDARD = {
  titel: '',
  /** { label, stufen: [{ stufe: 'I'…'V', anteil: 0…100, anzahl? }] } */
  links: { label: '', stufen: [] },
  rechts: { label: '', stufen: [] },
  /** Reihenfolge der Stufen, unterste zuerst. */
  stufen: ['I', 'II', 'III', 'IV', 'V'],
};

// `rand` lässt neben den Balken Platz für die Prozentzahl.
export const MASSE = { halbe: 200, mitte: 56, zeile: 30, oben: 34, unten: 12, rand: 44 };

export function pyramide(props = {}) {
  const { titel, links, rechts, stufen } = { ...STANDARD, ...props };
  const m = MASSE;
  const anteilVon = (seite, stufe) => {
    const e = (seite?.stufen ?? []).find((s) => s.stufe === stufe);
    return e && Number.isFinite(e.anteil) ? e.anteil : 0;
  };
  const alle = stufen.flatMap((s) => [anteilVon(links, s), anteilVon(rechts, s)]);
  // Gemeinsamer Maßstab für beide Seiten — sonst wäre der Vergleich keiner.
  const groesste = Math.max(10, ...alle);
  const laenge = (a) => (a / groesste) * m.halbe;
  const achseLinks = m.rand + m.halbe;
  const achseRechts = achseLinks + m.mitte;

  const zeilen = [...stufen].reverse().map((stufe, i) => {
    const l = anteilVon(links, stufe);
    const r = anteilVon(rechts, stufe);
    const nummer = stufen.indexOf(stufe) + 1;
    return {
      stufe, nummer,
      y: m.oben + i * m.zeile,
      links: { anteil: l, text: `${Math.round(l)}%`, x: achseLinks - laenge(l), breite: laenge(l) },
      rechts: { anteil: r, text: `${Math.round(r)}%`, x: achseRechts, breite: laenge(r) },
      differenz: Math.round((r - l) * 10) / 10,
    };
  });

  return {
    titel,
    linksLabel: links?.label ?? '',
    rechtsLabel: rechts?.label ?? '',
    zeilen,
    achseLinks, achseRechts,
    breite: 2 * (m.rand + m.halbe) + m.mitte,
    hoehe: m.oben + zeilen.length * m.zeile + m.unten,
    masse: m,
  };
}

export default pyramide;
