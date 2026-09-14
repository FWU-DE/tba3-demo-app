// Kennzahl-Kachel — Berechnung.
//
// Erfunden für die Bibliothek: der kleinste Baustein. Eine Zahl, woran sie
// gemessen wird, und wohin sie sich bewegt — das, was über jedem Diagramm
// steht und bisher jede Anwendung selbst gebaut hat.
//
// Bewusst ohne eigene Achse: die Kachel zeigt den Wert gegen genau eine
// Bezugsgröße. Wer zwei Bezugsgrößen braucht, braucht ein Diagramm.

export const NAME = 'kennzahl-kachel';

export const STANDARD = {
  label: '',
  wert: null,
  einheit: '%',
  /** Woran gemessen wird — etwa der faire Vergleich. */
  vergleich: null,
  vergleichLabel: 'fairer Vergleich',
  /** Frühere Werte, ältester zuerst — für den kleinen Verlauf. */
  verlauf: [],
  /** Ab welcher Abweichung die Kachel etwas behauptet. */
  schwelle: 5,
  hinweis: '',
  min: 0,
  max: 100,
};

export const MASSE = { verlaufBreite: 96, verlaufHoehe: 28 };

/** Über, unter oder im Rahmen — dieselbe Sprache wie die Aufgaben-Tabelle. */
export function bewertung(delta, schwelle = STANDARD.schwelle) {
  if (delta === null || delta === undefined) return 'im-rahmen';
  if (delta > schwelle) return 'ueber';
  if (delta < -schwelle) return 'unter';
  return 'im-rahmen';
}

export function kachel(props = {}) {
  const { label, wert, einheit, vergleich, vergleichLabel, verlauf, schwelle, hinweis, min, max } = {
    ...STANDARD,
    ...props,
  };
  const spanne = Math.max(1, max - min);
  const anteil = (w) => Math.max(0, Math.min(1, ((w ?? min) - min) / spanne));
  const delta = wert === null || wert === undefined || vergleich === null || vergleich === undefined
    ? null
    : Math.round(((wert ?? 0) - vergleich) * 10) / 10;

  const reihe = Array.isArray(verlauf) ? verlauf.filter((v) => v !== null && v !== undefined) : [];
  const m = MASSE;

  // Der Verlauf hat eine eigene Skala, nicht die von min/max. Auf 28 Pixel
  // Höhe wäre jede realistische Reihe sonst eine waagerechte Linie: 54 bis 62
  // Prozent sind auf einer Skala von 0 bis 100 keine zwei Pixel Unterschied.
  // Eine Sparkline, die immer gerade ist, zeigt nichts — sie soll die Form der
  // Bewegung zeigen, nicht ihre absolute Lage. Die steht als Zahl daneben.
  const tief = reihe.length ? Math.min(...reihe) : 0;
  const hoch = reihe.length ? Math.max(...reihe) : 1;
  const verlaufSpanne = Math.max(1e-6, hoch - tief);
  const verlaufAnteil = (w) => (hoch === tief ? 0.5 : (w - tief) / verlaufSpanne);
  // Oben und unten je ein Pixel Luft, sonst klebt die Linie am Rand.
  const luft = 1;
  const nutzhoehe = m.verlaufHoehe - 2 * luft;

  const punkte = reihe.map((v, i) => ({
    wert: v,
    x: reihe.length <= 1 ? m.verlaufBreite / 2 : (i / (reihe.length - 1)) * m.verlaufBreite,
    y: luft + nutzhoehe - verlaufAnteil(v) * nutzhoehe,
  }));

  return {
    label,
    wert,
    einheit,
    hatWert: wert !== null && wert !== undefined,
    anteil: anteil(wert),
    vergleich,
    vergleichLabel,
    vergleichAnteil: vergleich === null || vergleich === undefined ? null : anteil(vergleich),
    delta,
    deltaText: delta === null ? '' : `${delta > 0 ? '+' : ''}${delta}`,
    bewertung: bewertung(delta, schwelle),
    hinweis,
    verlauf: punkte,
    verlaufPfad: punkte.length > 1
      ? punkte.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
      : '',
    verlaufMasse: m,
  };
}

export default kachel;
