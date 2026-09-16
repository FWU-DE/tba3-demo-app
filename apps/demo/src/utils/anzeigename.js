// Wie der Name einer Schüler:in auf dem Schirm erscheint.
//
// Der Observer-Modus zeichnete Namen bisher **weich** (`filter: blur`). Das
// sieht aus wie Schutz und ist keiner: `filter` ist rein visuell. Der Name
// bleibt im Barrierebaum, wird von Vorlesesoftware vorgelesen, steht in
// `document.body.innerText` und im Seitenquelltext. `select-none` verhindert
// das Markieren mit der Maus und sonst nichts.
//
// Das versagt ausgerechnet in dem Fall, für den der Modus gebaut ist: eine
// Konferenz, in der jemand mitliest. Die Messwiederholung des kompetenztest.de
// macht es richtig — sie schaltet zwischen „Namen" und „Codes" um, und ein
// Code ist kein Name. Genau diesen Baustein führt der Katalog des Konsortiums
// als `pseudonymisierung`.
//
// Deshalb wird der Name jetzt **ersetzt**, nicht überdeckt.

/**
 * Ein kurzer, stabiler Code aus der Kennung. Stabil, damit dieselbe Person in
 * Tabelle, Karte und Datenblatt denselben Code trägt — sonst lässt sich in
 * einer Konferenz nicht mehr über „die Dritte von oben" sprechen.
 *
 * Bewusst aus der Kennung und nicht aus dem Namen: aus einem Namen abgeleitete
 * Codes lassen sich zurückrechnen, sobald man die Klassenliste hat.
 */
export function code(id) {
  const text = String(id ?? '');
  let summe = 0;
  for (let i = 0; i < text.length; i += 1) summe = (summe * 31 + text.charCodeAt(i)) >>> 0;
  const buchstabe = String.fromCharCode(65 + (summe % 26));
  const zahl = String(summe % 900 + 100); // dreistellig, nie mit 0 beginnend
  return `${buchstabe}${zahl}`;
}

/** Der Name, wie er angezeigt werden soll. */
export function anzeigename(schueler, observerMode) {
  if (!schueler) return '';
  if (observerMode) return code(schueler.id);
  return `${schueler.firstName ?? ''} ${schueler.lastName ?? ''}`.trim();
}

/**
 * Die Initialen für Avatare und Karten. Im Observer-Modus die beiden letzten
 * Stellen des Codes — nicht „••", damit sich zwei Marken auf einer Karte noch
 * unterscheiden lassen.
 */
export function initialen(schueler, observerMode) {
  if (!schueler) return '';
  if (observerMode) return code(schueler.id).slice(-2);
  return `${schueler.firstName?.[0] ?? ''}${schueler.lastName?.[0] ?? ''}`;
}

export default anzeigename;
