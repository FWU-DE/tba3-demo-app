// Selbsteinschätzung gegen Ergebnis — Berechnung.
//
// Gefunden im Lernstand-Barometer des kompetenztest.de: `SelfEvaluationPage.vue`
// mit vier eigenen Druckansichten daneben. Kein Sachbericht nennt es.
//
// Der Baustein stellt zwei Zahlen je Merkmal nebeneinander: was die Schüler:in
// sich zutraut und was der Test misst. **Die Lücke dazwischen ist der Befund** —
// pädagogisch oft der interessantere als das Ergebnis allein. Wer sich
// unterschätzt, braucht etwas anderes als wer sich überschätzt, und beides
// sieht in einer reinen Ergebnisrückmeldung gleich aus.
//
// Eine Bewertung nimmt der Baustein nicht vor. Er sagt „weit auseinander", nicht
// „falsch eingeschätzt": welche Richtung erfreulich ist und welche nicht, ist
// eine pädagogische Frage und keine der Bibliothek.

export const NAME = 'selbsteinschaetzung';

export const STANDARD = {
  /** [{ label, selbst, gemessen }] — beide Werte in Prozent. */
  zeilen: [],
  title: '',
  selbstLabel: 'Selbsteinschätzung',
  gemessenLabel: 'Gemessen',
  /** Ab welcher Lücke in Prozentpunkten eine Zeile auffällt. */
  schwelle: 15,
  xTitel: 'Anteil (%)',
};

export const MASSE = {
  labelBreite: 168,
  chartBreite: 452,
  zeilenHoehe: 34,
  luecke: 10,
  oben: 34,
  unten: 44,
  rechts: 64,
  radius: 7,
  get breite() {
    return this.labelBreite + this.chartBreite + this.rechts;
  },
};

/**
 * Über-, Unterschätzung oder stimmig. Bewusst neutral benannt: „überschätzt"
 * klingt nach Fehler, und ob es einer ist, entscheidet nicht der Baustein.
 */
export function lage(delta, schwelle = STANDARD.schwelle) {
  if (!Number.isFinite(delta)) return 'unbekannt';
  if (delta > schwelle) return 'darueber';
  if (delta < -schwelle) return 'darunter';
  return 'stimmig';
}

export function einschaetzung(props = {}) {
  const { zeilen, title, selbstLabel, gemessenLabel, schwelle, xTitel } = { ...STANDARD, ...props };
  const m = MASSE;

  const x = (wert) => m.labelBreite + (Math.max(0, Math.min(100, wert)) / 100) * m.chartBreite;

  const reihen = (Array.isArray(zeilen) ? zeilen : [])
    .filter((z) => z && Number.isFinite(z.selbst) && Number.isFinite(z.gemessen))
    .map((z, i) => {
      const delta = Math.round(z.selbst - z.gemessen);
      return {
        ...z,
        index: i,
        y: m.oben + i * (m.zeilenHoehe + m.luecke) + m.zeilenHoehe / 2,
        xSelbst: x(z.selbst),
        xGemessen: x(z.gemessen),
        delta,
        deltaText: `${delta > 0 ? '+' : ''}${delta}`,
        lage: lage(delta, schwelle),
      };
    });

  return {
    title,
    selbstLabel,
    gemessenLabel,
    xTitel,
    zeilen: reihen,
    leer: reihen.length === 0,
    // Die Zahl, nach der zuerst gefragt wird: wie oft klaffen sie auseinander?
    auffaellig: reihen.filter((z) => z.lage !== 'stimmig').length,
    hoehe: m.oben + reihen.length * (m.zeilenHoehe + m.luecke) + m.unten,
    masse: m,
  };
}

export default einschaetzung;
