// BISTA-Verteilung — Berechnung.
//
// Die Schüler:innen einer Gruppe auf der Punkteskala der Bildungsstandards,
// jede als Avatar über ihrem Wert. Wo mehrere denselben Wert haben, stapeln
// sie sich nach oben — deshalb wächst die Höhe mit der größten Säule und ist
// keine feste Zahl.
//
// Die Zonen (KS I, II, III) kommen von außen: welche Schwellen gelten, hängt
// an Fach und Jahrgang, und ein Baustein, der sie festschreibt, ist in der
// nächsten Erhebung falsch.

export const NAME = 'bista-verteilung';

export const STANDARD = {
  /** [{ id, name, initialen?, punkte }] */
  schueler: [],
  title: '',
  punkteMax: 565,
  punkteMin: 300,
  /** [{ id, label, von, bis, farbe? }] */
  zonen: [
    { id: 'ks1', label: 'KS I', von: 0, bis: 430 },
    { id: 'ks2', label: 'KS II', von: 430, bis: 500 },
    { id: 'ks3', label: 'KS III', von: 500, bis: 565 },
  ],
  /** Waagerechte Marke, etwa der Mittelwert der Gruppe. */
  mittelwert: null,
};

export const MASSE = {
  links: 46,
  rechts: 24,
  oben: 26,
  unten: 52,
  breite: 640,
  avatar: 15,
  reihe: 34,
  minHoehe: 180,
};

export function geometrie(props = {}) {
  const { schueler, title, punkteMin, punkteMax, zonen, mittelwert } = { ...STANDARD, ...props };
  const liste = Array.isArray(schueler) ? schueler : [];
  const m = MASSE;
  const feldBreite = m.breite - m.links - m.rechts;
  const spanne = Math.max(1, punkteMax - punkteMin);
  const x = (punkte) => m.links + ((Math.max(punkteMin, Math.min(punkteMax, punkte ?? punkteMin)) - punkteMin) / spanne) * feldBreite;

  // Nach Punktwert bündeln und stapeln: gleiche Werte stehen übereinander,
  // nicht ineinander.
  const eimer = new Map();
  const gestapelt = liste.map((s, i) => {
    const px = x(s.punkte);
    const schluessel = Math.round(px / (m.avatar * 1.6));
    const reihe = eimer.get(schluessel) ?? 0;
    eimer.set(schluessel, reihe + 1);
    return {
      id: s.id ?? String(i),
      name: s.name ?? '',
      initialen: s.initialen ?? (s.name ?? '').split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase(),
      punkte: s.punkte ?? null,
      x: px,
      reihe,
    };
  });

  const hoechsteSaeule = Math.max(1, ...[...eimer.values()]);
  const feldHoehe = Math.max(m.minHoehe - m.oben - m.unten, hoechsteSaeule * m.reihe);
  const hoehe = m.oben + feldHoehe + m.unten;
  const grundlinie = m.oben + feldHoehe;

  return {
    breite: m.breite,
    hoehe,
    titel: title,
    radius: m.avatar,
    grundlinie,
    feld: { x: m.links, y: m.oben, breite: feldBreite, hoehe: feldHoehe },
    zonen: (Array.isArray(zonen) ? zonen : []).map((z, i) => {
      const von = x(z.von);
      const bis = x(z.bis);
      return {
        id: z.id ?? String(i),
        label: z.label ?? '',
        x: von,
        breite: Math.max(0, bis - von),
        mitte: von + (bis - von) / 2,
        farbe: z.farbe ?? `var(--tba3-_stufe-${Math.min(5, i + 2)})`,
      };
    }),
    achse: [punkteMin, ...(Array.isArray(zonen) ? zonen : []).map((z) => z.bis)].map((wert) => ({
      wert,
      x: x(wert),
    })),
    mittelwert: mittelwert === null || mittelwert === undefined
      ? null
      : { wert: mittelwert, x: x(mittelwert) },
    schueler: gestapelt.map((s) => ({
      ...s,
      y: grundlinie - m.reihe / 2 - s.reihe * m.reihe,
    })),
  };
}

export default geometrie;
