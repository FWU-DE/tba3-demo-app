// Netzdiagramm der Teilkompetenzen — Berechnung.
//
// Aus der Englisch-Rückmeldung des zepf (`styleSpiderChart`): mehrere
// Teilkompetenzen auf je einer Achse, eine Person gegen Klasse und
// Vergleichsgruppen. Das Profil ist die Aussage — ob es rund ist oder an einer
// Stelle einknickt.
//
// Unter drei Achsen ist ein Netz keine Fläche mehr; dann gibt der Kern
// `zuWenigAchsen` zurück, und das Element sagt das, statt eine Linie zu zeigen.

export const NAME = 'netzdiagramm';

export const STANDARD = {
  titel: '',
  /** [{ id, label }] — eine Achse je Teilkompetenz */
  achsen: [],
  /** [{ id, label, werte: { [achse]: 0…100 } }] — die erste Reihe ist die hervorgehobene */
  reihen: [],
  max: 100,
  ringe: [25, 50, 75, 100],
  einheit: '%',
};

// `rand` trägt die Achsennamen; lange Namen wie „Funktionaler Zusammenhang“
// brauchen links und rechts Platz.
export const MASSE = { radius: 120, rand: 170 };

export function netz(props = {}) {
  const { titel, achsen, reihen, max, ringe, einheit } = { ...STANDARD, ...props };
  const m = MASSE;
  const liste = Array.isArray(achsen) ? achsen : [];
  const mitte = m.radius + m.rand;
  const winkel = (i) => -Math.PI / 2 + (i / Math.max(1, liste.length)) * 2 * Math.PI;
  const punkt = (i, anteil) => ({
    x: mitte + Math.cos(winkel(i)) * m.radius * anteil,
    y: mitte + Math.sin(winkel(i)) * m.radius * anteil,
  });
  const anteil = (w) => Math.max(0, Math.min(1, (Number.isFinite(w) ? w : 0) / Math.max(1e-6, max)));

  const achsenGeo = liste.map((a, i) => {
    const ende = punkt(i, 1);
    const schrift = punkt(i, 1.14);
    const cos = Math.cos(winkel(i));
    return {
      id: a.id, label: a.label ?? a.id,
      x2: ende.x, y2: ende.y,
      lx: schrift.x, ly: schrift.y,
      anker: Math.abs(cos) < 0.2 ? 'middle' : cos > 0 ? 'start' : 'end',
    };
  });

  const ringGeo = (Array.isArray(ringe) ? ringe : []).map((r) => ({
    wert: r,
    text: `${r}${einheit}`,
    y: mitte - anteil(r) * m.radius,
    pfad: liste.map((_, i) => punkt(i, anteil(r)))
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z',
  }));

  const reihenGeo = (Array.isArray(reihen) ? reihen : []).map((r, j) => {
    const punkte = liste.map((a, i) => {
      const w = r.werte?.[a.id];
      return { achse: a.id, label: a.label ?? a.id, wert: w, text: Number.isFinite(w) ? `${Math.round(w)}${einheit}` : '–', ...punkt(i, anteil(w)) };
    });
    return {
      id: r.id, label: r.label, index: j,
      punkte,
      pfad: punkte.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z',
    };
  });

  return {
    titel,
    zuWenigAchsen: liste.length < 3,
    achsen: achsenGeo,
    ringe: ringGeo,
    reihen: reihenGeo,
    mitte,
    breite: mitte * 2,
    hoehe: mitte * 2,
    // Oben und unten reicht weniger Rand als seitlich — der viewBox-Ausschnitt.
    obenRand: m.rand - 40,
  };
}

export default netz;
