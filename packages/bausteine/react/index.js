// React-Adapter für alle Bausteine.
//
// Spiegelbild des Vue-Adapters: dieselben Kerne, dieselben Eigenschaften, nur
// die Einbettung unterscheidet sich.
//
//   import { KompetenzstufenLeiste } from '@tba3/bausteine/react';
//   <KompetenzstufenLeiste rows={zeilen} title="3a Deutsch" />
//
// `react` ist peerDependency. Bewusst ohne JSX geschrieben, damit die Datei
// ohne Übersetzungsschritt läuft — auch im Node-Test.

import { createElement, useMemo } from 'react';
import { BAUSTEINE } from '../kern/index.js';

function pascal(name) {
  return name.replace(/(^|-)([a-zäöü])/g, (_, __, c) => c.toUpperCase());
}

function komponenteBauen({ name, standard, bauen }) {
  const schluessel = Object.keys(standard);

  function Baustein(props) {
    // Die Kerne sind reine Funktionen — merken lohnt sich, solange die
    // Eigenschaften gleich bleiben. Die Abhängigkeitsliste ist absichtlich
    // aus den bekannten Schlüsseln gebaut statt aus `props`: so löst ein
    // zusätzliches, unbekanntes Attribut kein Neuzeichnen aus.
    const html = useMemo(
      () => bauen({ ...standard, ...props }).html,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      schluessel.map((k) => props[k]),
    );
    return createElement('div', {
      className: 'tba3-baustein',
      dangerouslySetInnerHTML: { __html: html },
    });
  }

  Baustein.displayName = pascal(name);
  return Baustein;
}

const gebaut = Object.fromEntries(BAUSTEINE.map((b) => [pascal(b.name), komponenteBauen(b)]));

export const {
  KompetenzstufenLeiste,
  MittelwertVergleich,
  ErwartetTatsaechlich,
  Perzentilbaender,
} = gebaut;

/** Alle Komponenten, nach Namen. */
export const KOMPONENTEN = gebaut;

export { STIL } from '../kern/index.js';
export default gebaut;
