// Glossar mit Suche — Custom Element.
//
// Vorbild: `MaGlossarySearchModule` bei zepf, mit je einem eigenen Glossar für
// Mathematik, Englisch und die Schulleitung.
//
// Der einzige Baustein mit einem Eingabefeld. Den Suchtext hält er **nicht
// selbst**: er meldet ihn und zeichnet, was hereingereicht wird. Ein Baustein,
// der eigenen Zustand führt, lässt sich nicht mehr von außen steuern — und
// genau das braucht eine Seite, die den Suchtext in der Adresse halten will.
//
//   el.addEventListener('suche-geaendert', (e) => el.suche = e.detail.suche);

import { STANDARD, glossar } from '../kern/glossar.js';
import { elementKlasse } from './baustein-element.js';
import { h } from './svg.js';

const STIL = `
.block { display: flex; flex-direction: column; gap: var(--tba3-_abstand); }
.titel { font-weight: 600; }

.suchfeld {
  font: inherit; font-size: 0.95em;
  color: var(--tba3-_farbe-text);
  background: var(--tba3-_farbe-grund);
  border: 1px solid var(--tba3-_farbe-linie);
  border-radius: var(--tba3-_radius);
  padding: 8px 12px;
  width: 100%;
  box-sizing: border-box;
}
.suchfeld:focus-visible { outline: 2px solid var(--tba3-_farbe-fokus); outline-offset: 1px; }

.anzahl { font-size: 0.85em; color: var(--tba3-_farbe-text-gedaempft); }

.liste { list-style: none; margin: 0; padding: 0; display: flex;
  flex-direction: column; gap: 8px; }
.eintrag {
  all: unset; cursor: pointer; display: block;
  border: 1px solid var(--tba3-_farbe-linie);
  border-radius: var(--tba3-_radius);
  padding: 10px 13px;
  background: var(--tba3-_farbe-grund);
}
.eintrag:hover { border-color: var(--tba3-_farbe-marke); }
.eintrag:focus-visible { outline: 2px solid var(--tba3-_farbe-fokus); outline-offset: 2px; }
.begriff { font-weight: 650; }
.treffer { color: var(--tba3-_farbe-marke); }
.erklaerung { font-size: 0.9em; color: var(--tba3-_farbe-text-gedaempft); margin-top: 3px; }
.auch { font-size: 0.82em; color: var(--tba3-_farbe-text-gedaempft); margin-top: 3px; }
.leer { color: var(--tba3-_farbe-text-gedaempft); font-size: 0.9em; }
`;

function aufbauen(wurzel, zustand, el) {
  const g = glossar(zustand);
  const block = h('div', { class: 'block' });

  if (g.title) block.append(h('div', { class: 'titel', text: g.title }));

  const feld = h('input', {
    class: 'suchfeld',
    type: 'search',
    value: g.suche,
    placeholder: g.platzhalter,
    'aria-label': g.platzhalter,
    oninput: (e) => el.melden('suche-geaendert', { suche: e.target.value }),
  });
  block.append(feld);

  block.append(h('p', {
    class: 'anzahl',
    'aria-live': 'polite',
    text: g.gefiltert ? `${g.eintraege.length} von ${g.gesamt} Begriffen` : `${g.gesamt} Begriffe`,
  }));

  if (g.leer) {
    block.append(h('p', { class: 'leer', text: g.leerHinweis }));
    wurzel.append(block);
    return;
  }

  block.append(
    h('ul', { class: 'liste' }, g.eintraege.map((eintrag) =>
      h('li', {}, [
        h('button', {
          class: 'eintrag',
          type: 'button',
          onclick: () => el.melden('begriff-gewaehlt', { ...eintrag }),
        }, [
          h('div', { class: `begriff ${eintrag.imBegriff ? 'treffer' : ''}`.trim(), text: eintrag.begriff }),
          eintrag.erklaerung ? h('div', { class: 'erklaerung', text: eintrag.erklaerung }) : null,
          eintrag.auch?.length
            ? h('div', { class: 'auch', text: `auch: ${eintrag.auch.join(', ')}` })
            : null,
        ]),
      ]))),
  );

  wurzel.append(block);
}

export const BAUPLAN = {
  name: 'glossar',
  titel: 'Glossar mit Suche',
  endpunkt: 'keine — datenunabhängig gehalten',
  standard: STANDARD,
  ereignisse: ['suche-geaendert', 'begriff-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const GlossarElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
