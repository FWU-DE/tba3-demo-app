// Aufgaben-Heatmap als Custom Element — ein Raster aus Knöpfen, kein Bild.
//
// Erfunden für die Bibliothek. Bewusst HTML statt SVG: jede Zelle ist ein
// Knopf, also mit Tabulator erreichbar und vorlesbar. Ein SVG-Raster sieht
// gleich aus und ist für eine Tastatur eine einzige Fläche.
//
//   el.addEventListener('zelle-gewaehlt', (e) => e.detail);

import { STANDARD, raster } from '../kern/aufgaben-heatmap.js';
import { elementKlasse } from './baustein-element.js';
import { h } from './svg.js';

const STIL = `
table { border-collapse: separate; border-spacing: 2px; font-variant-numeric: tabular-nums; }
caption { text-align: left; padding-bottom: var(--tba3-_abstand); }
th { font-weight: 600; font-size: 0.9em; color: var(--tba3-_farbe-text-gedaempft); }
th.spalte { writing-mode: vertical-rl; transform: rotate(180deg); padding: 0 2px;
  height: 64px; white-space: nowrap; text-align: left; }
th.zeile { text-align: left; padding-right: var(--tba3-_abstand); white-space: nowrap;
  color: var(--tba3-_farbe-text); }

.zelle {
  all: unset; cursor: pointer; display: block;
  width: 38px; height: 34px; border-radius: 3px;
  text-align: center; line-height: 34px; font-size: 0.85em;
  color: var(--tba3-_farbe-text);
}
.zelle:hover { outline: 2px solid var(--tba3-_farbe-text); outline-offset: -2px; }
.zelle.leer { color: var(--tba3-_farbe-text-gedaempft); cursor: default; }

.skala { display: flex; align-items: center; gap: var(--tba3-_abstand);
  margin-top: var(--tba3-_abstand); font-size: 0.9em; color: var(--tba3-_farbe-text-gedaempft); }
.verlauf { display: flex; }
.verlauf i { width: 18px; height: 10px; display: block; }

.leer-tafel {
  padding: calc(var(--tba3-_abstand) * 3); text-align: center;
  color: var(--tba3-_farbe-text-gedaempft);
  border: 1px dashed var(--tba3-_farbe-linie); border-radius: var(--tba3-_radius);
}
`;

function aufbauen(wurzel, zustand, el) {
  const g = raster(zustand);

  if (!g.zeilen.length || !g.spalten.length) {
    wurzel.append(h('p', { class: 'leer-tafel', text: 'Keine Werte' }));
    return;
  }

  const kopf = h('tr', {}, [
    h('th', { scope: 'col', 'aria-label': 'Aufgabe' }),
    ...g.spalten.map((sp) => h('th', { class: 'spalte', scope: 'col', text: sp.label })),
  ]);

  const koerper = g.zeilen.map((zeile) =>
    h('tr', {}, [
      h('th', { class: 'zeile', scope: 'row', text: zeile.label }),
      ...zeile.zellen.map((zelle) =>
        h('td', {}, [
          h('button', {
            class: `zelle${zelle.leer ? ' leer' : ''}`,
            type: 'button',
            disabled: zelle.leer,
            style: `background:${zelle.farbe}`,
            title: zelle.leer
              ? `${zeile.label} · ${zelle.spaltenLabel}: kein Wert`
              : `${zeile.label} · ${zelle.spaltenLabel}: ${Math.round(zelle.wert)} %` +
                (zelle.erwartet === null ? '' : ` (erwartet ${Math.round(zelle.erwartet)} %)`),
            text: zelle.leer ? '·' : String(Math.round(zelle.wert)),
            onclick: () => {
              if (!zelle.leer) el.melden('zelle-gewaehlt', { ...zelle, zeileLabel: zeile.label });
            },
          }),
        ]),
      ),
    ]),
  );

  const skala = h('div', { class: 'skala' }, [
    h('span', { text: g.skala === 'wert' ? 'niedrig' : 'unter Erwartung' }),
    h('span', { class: 'verlauf' },
      [-1, -0.5, 0, 0.5, 1].map((wert) =>
        h('i', {
          style: `background:color-mix(in srgb, ${wert >= 0 ? 'var(--tba3-_farbe-ueber)' : 'var(--tba3-_farbe-unter)'} ` +
            `${Math.round(Math.abs(wert) * 100)}%, var(--tba3-_farbe-flaeche))`,
        }),
      ),
    ),
    h('span', { text: g.skala === 'wert' ? 'hoch' : 'über Erwartung' }),
  ]);

  wurzel.append(
    h('div', { class: 'scroll' }, [
      h('table', {}, [
        zustand.title ? h('caption', { text: zustand.title }) : null,
        h('thead', {}, [kopf]),
        h('tbody', {}, koerper),
      ]),
    ]),
    skala,
  );
}

export const BAUPLAN = {
  name: 'aufgaben-heatmap',
  titel: 'Aufgaben-Heatmap',
  endpunkt: '/groups/{id}/items',
  standard: STANDARD,
  ereignisse: ['zelle-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const AufgabenHeatmapElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
