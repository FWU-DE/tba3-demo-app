// Das Verzeichnis aller Bausteine.
//
// Jeder Eintrag beschreibt eine Komponente vollständig: wie sie heißt, welche
// Eigenschaften sie kennt und welche Funktion daraus Markup macht. Die drei
// Adapter (Custom Element, Vue, React) lesen nur dieses Verzeichnis — dadurch
// bekommt jede neue Komponente alle drei Fassungen, ohne dass ein Adapter
// angefasst werden muss.

import { kompetenzstufenLeiste, STANDARD as LEISTE_STANDARD } from './kompetenzstufen-leiste.js';
import { mittelwertVergleich, STANDARD as VERGLEICH_STANDARD } from './mittelwert-vergleich.js';
import { erwartetTatsaechlich, STANDARD as ERWARTET_STANDARD } from './erwartet-tatsaechlich.js';
import { perzentilbaender, STANDARD as PERZENTIL_STANDARD } from './perzentilbaender.js';

export { STIL } from './stil.js';

/**
 * @typedef {Object} Baustein
 * @property {string} name        Kennung in kebab-case, zugleich der Elementname
 *                                ohne Präfix.
 * @property {string} titel       Klartext für Katalog und Dokumentation.
 * @property {string} endpunkt    Der TBA3-Endpunkt, aus dem die Daten kommen.
 * @property {object} standard    Voreinstellungen je Eigenschaft.
 * @property {(props: object) => {breite: number, hoehe: number, svg: string, html: string}} bauen
 */

/** @type {Baustein[]} */
export const BAUSTEINE = [
  {
    name: 'kompetenzstufen-leiste',
    titel: 'Kompetenzstufen-Leiste',
    endpunkt: '/groups/{id}/competence-levels',
    standard: LEISTE_STANDARD,
    bauen: kompetenzstufenLeiste,
  },
  {
    name: 'mittelwert-vergleich',
    titel: 'Mittelwert-Vergleich',
    endpunkt: '/groups, /schools, /states (items)',
    standard: VERGLEICH_STANDARD,
    bauen: mittelwertVergleich,
  },
  {
    name: 'erwartet-tatsaechlich',
    titel: 'Erwartete und tatsächliche Lösungsquote',
    endpunkt: '/groups/{id}/items',
    standard: ERWARTET_STANDARD,
    bauen: erwartetTatsaechlich,
  },
  {
    name: 'perzentilbaender',
    titel: 'Perzentilbänder',
    endpunkt: '/groups/{id}/aggregations',
    standard: PERZENTIL_STANDARD,
    bauen: perzentilbaender,
  },
];

/** Einen Baustein über seinen Namen holen. */
export function baustein(name) {
  const treffer = BAUSTEINE.find((b) => b.name === name);
  if (!treffer) throw new Error(`Unbekannter Baustein: ${name}`);
  return treffer;
}

export {
  kompetenzstufenLeiste,
  mittelwertVergleich,
  erwartetTatsaechlich,
  perzentilbaender,
};
