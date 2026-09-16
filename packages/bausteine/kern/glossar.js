// Glossar mit Suche — Berechnung.
//
// Gefunden bei zepf: `MaGlossarySearchModule`, dazu `maGlossary.js`,
// `enGlossary.js` und `slGlossary.js` — je Rückmeldung ein eigenes Glossar,
// und die Begriffe stehen in datenunabhängigen Dateien.
//
// „Kompetenzstufe", „fairer Vergleich", „Lösungshäufigkeit", „Mindeststandard"
// sind für die Lesenden nicht selbsterklärend. Ein Tooltip beantwortet nur die
// Frage, die man an genau dieser Stelle stellt — wer den Begriff zwei Ansichten
// später wiedersieht, steht erneut davor.
//
// Gesucht wird in Begriff **und** Erklärung: wer „fair" nicht kennt, sucht nach
// „Vergleich". Und die Suche ist diakritikafest — „Losungshaufigkeit" findet
// „Lösungshäufigkeit", weil auf einer Tastatur ohne Umlaute sonst nichts
// gefunden wird.

export const NAME = 'glossar';

export const STANDARD = {
  /** [{ id?, begriff, erklaerung, auch?: string[] }] */
  eintraege: [],
  /** Der aktuelle Suchtext — der Baustein hält ihn nicht selbst. */
  suche: '',
  title: '',
  platzhalter: 'Begriff suchen …',
  leerHinweis: 'Kein Eintrag passt zu dieser Suche.',
};

/**
 * Für den Vergleich normalisieren: klein, ohne Diakritika, ß als ss.
 * `normalize('NFD')` zerlegt „ö" in „o" + Zeichen, das dann wegfällt.
 */
export function normal(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function glossar(props = {}) {
  const { eintraege, suche, title, platzhalter, leerHinweis } = { ...STANDARD, ...props };

  const frage = normal(suche).trim();
  const alle = (Array.isArray(eintraege) ? eintraege : [])
    .filter((e) => e && e.begriff)
    .map((e, i) => ({ ...e, id: e.id ?? `begriff-${i}` }));

  const passt = (eintrag) => {
    if (!frage) return true;
    const felder = [eintrag.begriff, eintrag.erklaerung, ...(eintrag.auch ?? [])];
    return felder.some((f) => normal(f).includes(frage));
  };

  // Treffer im Begriff wiegen schwerer als Treffer in der Erklärung: wer
  // „Stufe" sucht, will „Kompetenzstufe" oben sehen, nicht jeden Eintrag, in
  // dessen Erklärung das Wort vorkommt.
  const gewicht = (eintrag) => (frage && normal(eintrag.begriff).includes(frage) ? 0 : 1);

  const treffer = alle
    .filter(passt)
    .map((e) => ({ ...e, imBegriff: gewicht(e) === 0 }))
    .sort((a, b) => gewicht(a) - gewicht(b) || a.begriff.localeCompare(b.begriff, 'de'));

  return {
    title,
    platzhalter,
    leerHinweis,
    suche,
    eintraege: treffer,
    gesamt: alle.length,
    leer: treffer.length === 0,
    gefiltert: Boolean(frage),
  };
}

export default glossar;
