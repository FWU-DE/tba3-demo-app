// React-Adapter.
//
// Spiegelbild des Vue-Adapters: eine Hülle um dasselbe Custom Element. React
// braucht sie aus denselben zwei Gründen wie Vue —
//
//   1. React setzt unbekannte Props als **Attribute**; ein Array würde als
//      "[object Object]" ankommen. Deshalb werden sie über einen ref als
//      Eigenschaften gesetzt.
//   2. React kennt keine CustomEvents; `onStufeGewaehlt` gibt es nicht. Die
//      Hülle hängt echte Listener an und ruft die übergebenen Rückrufe.
//
// `react` ist peerDependency, sonst nichts. Bewusst ohne JSX, damit die Datei
// ohne Übersetzungsschritt läuft — auch im Node-Test.
//
//   import { AufgabenTabelle } from '@tba3/bausteine/react';
//   <AufgabenTabelle items={items} onAufgabeGewaehlt={zeigen} />

import { createElement, useEffect, useRef } from 'react';
import { BAUPLAENE, PRAEFIX, registrieren } from '../webcomponents/index.js';

registrieren();

function pascal(name) {
  return name.replace(/(^|-)([a-zäöü])/g, (_, __, c) => c.toUpperCase());
}

/** stufe-gewaehlt → onStufeGewaehlt */
function rueckrufName(ereignis) {
  return `on${pascal(ereignis)}`;
}

function komponenteBauen(bauplan) {
  const elementName = PRAEFIX + bauplan.name;
  const schluessel = Object.keys(bauplan.standard);
  const ereignisse = bauplan.ereignisse ?? [];

  function Baustein(props) {
    const knoten = useRef(null);

    // Eigenschaften setzen, nicht Attribute.
    useEffect(() => {
      const el = knoten.value ?? knoten.current;
      if (!el) return;
      el.props = Object.fromEntries(
        schluessel.map((k) => [k, props[k] === undefined ? bauplan.standard[k] : props[k]]),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, schluessel.map((k) => props[k]));

    // Ereignisse anhängen. Die Rückrufe stehen in einem ref, damit ein
    // Neuanhängen bei jedem Rendern entfällt und ein frisch übergebener
    // Rückruf trotzdem greift.
    const rueckrufe = useRef({});
    rueckrufe.current = Object.fromEntries(
      ereignisse.map((typ) => [typ, props[rueckrufName(typ)]]),
    );

    useEffect(() => {
      const el = knoten.current;
      if (!el) return undefined;
      const hoerer = ereignisse.map((typ) => {
        const fn = (ev) => rueckrufe.current[typ]?.(ev.detail, ev);
        el.addEventListener(typ, fn);
        return [typ, fn];
      });
      return () => hoerer.forEach(([typ, fn]) => el.removeEventListener(typ, fn));
    }, []);

    const durchreichen = { ...props };
    for (const k of schluessel) delete durchreichen[k];
    for (const typ of ereignisse) delete durchreichen[rueckrufName(typ)];

    return createElement(elementName, { ...durchreichen, ref: knoten });
  }

  Baustein.displayName = pascal(bauplan.name);
  return Baustein;
}

const gebaut = Object.fromEntries(
  BAUPLAENE.map((b) => [pascal(b.name), komponenteBauen(b)]),
);

export const {
  KompetenzstufenLeiste,
  AufgabenTabelle,
  MittelwertVergleich,
  ErwartetTatsaechlich,
  Perzentilbaender,
  SchuelerTabelle,
  Uebersichtskarten,
  Streudiagramm,
  BistaVerteilung,
  LernstandsVerlauf,
  AufgabenHeatmap,
  KennzahlKachel,
  KontextmerkmalRing,
  StandardErreichung,
  Zeugnissaetze,
} = gebaut;

/** Alle Komponenten, nach Namen. */
export const KOMPONENTEN = gebaut;

export { PRAEFIX, registrieren };
export default gebaut;
