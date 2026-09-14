// Native Web Components für alle Bausteine.
//
// Jeder Baustein ist hier die **eine echte Implementierung**: echtes DOM,
// echte Ereignis-Empfänger, Shadow DOM. Die Vue- und React-Fassungen sind
// Hüllen um genau diese Elemente — damit gibt es die Visualisierung einmal,
// nicht dreimal, und sie kann in keiner Fassung anders aussehen oder anders
// reagieren.
//
// Keine Abhängigkeit, kein Build:
//
//   <script type="module">
//     import { registrieren } from '/bausteine/webcomponents/index.js';
//     registrieren();
//   </script>
//   <tba3-aufgaben-tabelle id="t"></tba3-aufgaben-tabelle>
//   <script type="module">
//     document.getElementById('t').items = [...];
//   </script>

import { BAUPLAN as LEISTE, KompetenzstufenLeisteElement } from './kompetenzstufen-leiste.js';
import { BAUPLAN as TABELLE, AufgabenTabelleElement } from './aufgaben-tabelle.js';
import { BAUPLAN as VERGLEICH, MittelwertVergleichElement } from './mittelwert-vergleich.js';
import { BAUPLAN as ERWARTUNG, ErwartetTatsaechlichElement } from './erwartet-tatsaechlich.js';
import { BAUPLAN as BAENDER, PerzentilbaenderElement } from './perzentilbaender.js';
import { elementKlasse } from './baustein-element.js';

export const PRAEFIX = 'tba3-';

/** Alle Baupläne — das Verzeichnis, aus dem sich jede Fassung bedient. */
export const BAUPLAENE = [LEISTE, TABELLE, VERGLEICH, ERWARTUNG, BAENDER];

/** Elementklassen, nach Elementnamen. */
export const ELEMENTE = {
  [`${PRAEFIX}${LEISTE.name}`]: KompetenzstufenLeisteElement,
  [`${PRAEFIX}${TABELLE.name}`]: AufgabenTabelleElement,
  [`${PRAEFIX}${VERGLEICH.name}`]: MittelwertVergleichElement,
  [`${PRAEFIX}${ERWARTUNG.name}`]: ErwartetTatsaechlichElement,
  [`${PRAEFIX}${BAENDER.name}`]: PerzentilbaenderElement,
};

/**
 * Alle Elemente registrieren. Mehrfaches Aufrufen ist harmlos: bereits
 * vergebene Namen werden übersprungen, sonst wirft der zweite Aufruf.
 *
 * @returns {string[]} die in diesem Aufruf vergebenen Namen
 */
export function registrieren(praefix = PRAEFIX) {
  if (typeof customElements === 'undefined') return [];
  const vergeben = [];
  for (const bauplan of BAUPLAENE) {
    const name = praefix + bauplan.name;
    if (customElements.get(name)) continue;
    customElements.define(
      name,
      praefix === PRAEFIX ? ELEMENTE[name] : elementKlasse(bauplan),
    );
    vergeben.push(name);
  }
  return vergeben;
}

export { elementKlasse };
export default registrieren;
