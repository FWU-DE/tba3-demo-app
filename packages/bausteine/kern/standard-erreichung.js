// Standard-Erreichung — Berechnung.
//
// Gefunden in der Schulrückmeldung von indibit: ein großer Prozentwert
// („80 % Mindeststandard erreicht") und daneben je Fach ein Balken mit der
// eigenen Zahl. Kein Sachbericht nennt ihn.
//
// Der Baustein besteht darauf, dass die Schlagzeile ihre Aufschlüsselung
// mitbringt. Eine Schule mit 80 % über alle Fächer, in der ein Fach bei 55 %
// liegt, hat kein Ergebnis von 80 % — sie hat ein Problem in einem Fach. Genau
// deshalb sind die beiden Angaben hier ein Baustein und nicht zwei.

export const NAME = 'standard-erreichung';

export const STANDARD = {
  label: 'Mindeststandard erreicht',
  /** [{ label, wert, gesamt? }] — Wert in Prozent. */
  zeilen: [],
  einheit: '%',
  /** Ab welchem Abstand zum Gesamtwert eine Zeile auffällt. */
  schwelle: 10,
  /** Gesamtwert; leer = das gewichtete Mittel der Zeilen. */
  wert: null,
  hinweis: '',
};

/** Über, unter oder im Rahmen — dieselbe Sprache wie überall in der Bibliothek. */
export function bewertung(delta, schwelle = STANDARD.schwelle) {
  if (delta === null || delta === undefined) return 'im-rahmen';
  if (delta > schwelle) return 'ueber';
  if (delta < -schwelle) return 'unter';
  return 'im-rahmen';
}

export function erreichung(props = {}) {
  const { label, zeilen, einheit, schwelle, wert, hinweis } = { ...STANDARD, ...props };

  const gueltig = (Array.isArray(zeilen) ? zeilen : [])
    .filter((z) => z && Number.isFinite(z.wert));

  // Gewichtet, wenn die Zeilen ihre Gruppengröße kennen: ein Fach mit vier
  // Lernenden soll den Gesamtwert nicht so stark ziehen wie eines mit hundert.
  const gewichte = gueltig.reduce((n, z) => n + (Number.isFinite(z.gesamt) ? z.gesamt : 1), 0);
  const gewichtet = gueltig.reduce(
    (n, z) => n + z.wert * (Number.isFinite(z.gesamt) ? z.gesamt : 1), 0,
  );
  const gesamtWert = wert ?? (gueltig.length ? Math.round(gewichtet / gewichte) : null);

  return {
    label,
    wert: gesamtWert,
    hatWert: gesamtWert !== null && gesamtWert !== undefined,
    einheit,
    hinweis,
    zeilen: gueltig.map((z) => {
      const delta = gesamtWert === null ? null : Math.round(z.wert - gesamtWert);
      return {
        ...z,
        anteil: Math.max(0, Math.min(1, z.wert / 100)),
        delta,
        bewertung: bewertung(delta, schwelle),
      };
    }),
  };
}

export default erreichung;
