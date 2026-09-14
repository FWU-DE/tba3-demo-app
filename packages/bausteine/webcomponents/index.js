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
import { BAUPLAN as SCHUELER, SchuelerTabelleElement } from './schueler-tabelle.js';
import { BAUPLAN as KARTEN, UebersichtskartenElement } from './uebersichtskarten.js';
import { BAUPLAN as STREU, StreudiagrammElement } from './streudiagramm.js';
import { BAUPLAN as BISTA, BistaVerteilungElement } from './bista-verteilung.js';
import { BAUPLAN as VERLAUF, LernstandsVerlaufElement } from './lernstands-verlauf.js';
import { BAUPLAN as HEATMAP, AufgabenHeatmapElement } from './aufgaben-heatmap.js';
import { BAUPLAN as KACHEL, KennzahlKachelElement } from './kennzahl-kachel.js';
import { elementKlasse } from './baustein-element.js';

export const PRAEFIX = 'tba3-';

/**
 * Alle Baupläne — das Verzeichnis, aus dem sich jede Fassung bedient.
 *
 * Reihenfolge: erst die fünf aus der ersten Runde, dann die vier aus dem
 * Katalog umgezogenen, zuletzt die drei, die es nur hier gibt.
 */
export const BAUPLAENE = [
  LEISTE, TABELLE, VERGLEICH, ERWARTUNG, BAENDER,
  SCHUELER, KARTEN, STREU, BISTA,
  VERLAUF, HEATMAP, KACHEL,
];

/** Elementklassen, nach Elementnamen. */
export const ELEMENTE = {
  [`${PRAEFIX}${LEISTE.name}`]: KompetenzstufenLeisteElement,
  [`${PRAEFIX}${TABELLE.name}`]: AufgabenTabelleElement,
  [`${PRAEFIX}${VERGLEICH.name}`]: MittelwertVergleichElement,
  [`${PRAEFIX}${ERWARTUNG.name}`]: ErwartetTatsaechlichElement,
  [`${PRAEFIX}${BAENDER.name}`]: PerzentilbaenderElement,
  [`${PRAEFIX}${SCHUELER.name}`]: SchuelerTabelleElement,
  [`${PRAEFIX}${KARTEN.name}`]: UebersichtskartenElement,
  [`${PRAEFIX}${STREU.name}`]: StreudiagrammElement,
  [`${PRAEFIX}${BISTA.name}`]: BistaVerteilungElement,
  [`${PRAEFIX}${VERLAUF.name}`]: LernstandsVerlaufElement,
  [`${PRAEFIX}${HEATMAP.name}`]: AufgabenHeatmapElement,
  [`${PRAEFIX}${KACHEL.name}`]: KennzahlKachelElement,
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
