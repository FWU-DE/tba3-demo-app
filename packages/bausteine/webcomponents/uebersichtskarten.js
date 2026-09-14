// Übersichtskarten als Custom Element — Karten mit Ring und Details.
//
// Kein Diagramm, sondern eine Anordnung: je Teilbereich eine Karte, im Kern
// des Rings die Kennzahl, darunter auf Wunsch die Einzelwerte. Aufklappen ist
// Zustand, und Zustand war der Grund, warum dieses Paket kein SVG mehr
// ausgibt.
//
//   el.addEventListener('karte-gewaehlt', (e) => e.detail);
//   el.addEventListener('karte-geoeffnet', (e) => e.detail); // { geoeffnet }

import { RING, STANDARD, karten, umschalten } from '../kern/uebersichtskarten.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
.raster { display: grid; gap: calc(var(--tba3-_abstand) * 2); }
.karte {
  border: 1px solid var(--tba3-_farbe-linie);
  border-radius: var(--tba3-_radius);
  background: var(--tba3-_farbe-grund);
  padding: calc(var(--tba3-_abstand) * 1.5);
  display: flex; flex-direction: column; gap: var(--tba3-_abstand);
}
.karte:hover { border-color: var(--tba3-_farbe-marke); }
.kopf { display: flex; align-items: baseline; justify-content: space-between; gap: var(--tba3-_abstand); }
.titel { all: unset; cursor: pointer; font-weight: 600; }
.titel:hover { color: var(--tba3-_farbe-marke); text-decoration: underline; }

.ring { display: flex; align-items: center; gap: calc(var(--tba3-_abstand) * 1.5); }
.kennzahl { font-size: 1.9em; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; }
.einheit { font-size: 0.5em; font-weight: 600; margin-left: 2px; color: var(--tba3-_farbe-text-gedaempft); }

.anteile { display: flex; flex-direction: column; gap: 4px; font-size: 0.9em; }
.anteil { display: flex; align-items: center; gap: 6px; }
.punkt { width: 10px; height: 10px; border-radius: 2px; flex: none; }
.anteil .wert { margin-left: auto; font-variant-numeric: tabular-nums;
  color: var(--tba3-_farbe-text-gedaempft); }

.mehr { all: unset; cursor: pointer; font-size: 0.9em; color: var(--tba3-_farbe-marke);
  display: inline-flex; align-items: center; gap: 4px; }
.mehr:hover { text-decoration: underline; }
.details { margin: 0; display: grid; grid-template-columns: 1fr auto; gap: 4px var(--tba3-_abstand);
  font-size: 0.9em; border-top: 1px solid var(--tba3-_farbe-linie); padding-top: var(--tba3-_abstand); }
.details dt { color: var(--tba3-_farbe-text-gedaempft); }
.details dd { margin: 0; text-align: right; font-variant-numeric: tabular-nums; }

.leer {
  padding: calc(var(--tba3-_abstand) * 3); text-align: center;
  color: var(--tba3-_farbe-text-gedaempft);
  border: 1px dashed var(--tba3-_farbe-linie); border-radius: var(--tba3-_radius);
}
`;

function ring(karte) {
  const mitte = RING.groesse / 2;
  return s('svg', {
    width: RING.groesse,
    height: RING.groesse,
    viewBox: `0 0 ${RING.groesse} ${RING.groesse}`,
    role: 'img',
    'aria-label': `${karte.label}: ${karte.wert ?? '—'}${karte.einheit}`,
  }, [
    s('circle', {
      cx: mitte, cy: mitte, r: (RING.aussen + RING.innen) / 2,
      fill: 'none', stroke: 'var(--tba3-_farbe-flaeche)',
      'stroke-width': RING.aussen - RING.innen,
    }),
    ...karte.segmente.map((seg) =>
      s('path', { d: seg.pfad, fill: seg.farbe }),
    ),
    s('text', {
      x: mitte, y: mitte + 6, 'text-anchor': 'middle',
      'font-size': 20, 'font-weight': 700, fill: 'var(--tba3-_farbe-text)',
      text: karte.wert === null ? '—' : String(karte.wert),
    }),
  ]);
}

function aufbauen(wurzel, zustand, el) {
  const liste = karten(zustand);

  if (!liste.length) {
    wurzel.append(h('p', { class: 'leer', text: 'Keine Teilbereiche' }));
    return;
  }

  const raster = h('div', {
    class: 'raster',
    style: `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); ` +
      `--spalten:${zustand.spalten}`,
  });

  for (const karte of liste) {
    const kachel = h('article', { class: 'karte' });

    kachel.append(
      h('div', { class: 'kopf' }, [
        h('button', {
          class: 'titel',
          type: 'button',
          text: karte.label,
          onclick: () => el.melden('karte-gewaehlt', { ...karte }),
        }),
        karte.wert === null
          ? null
          : h('span', { class: 'kennzahl' }, [
              String(karte.wert),
              karte.einheit ? h('span', { class: 'einheit', text: karte.einheit }) : null,
            ]),
      ]),
    );

    kachel.append(
      h('div', { class: 'ring' }, [
        ring(karte),
        h('div', { class: 'anteile' },
          karte.segmente.map((seg) =>
            h('div', { class: 'anteil' }, [
              h('span', { class: 'punkt', style: `background:${seg.farbe}` }),
              h('span', { text: seg.label }),
              h('span', { class: 'wert', text: `${Math.round(seg.anteil * 100)} %` }),
            ]),
          ),
        ),
      ]),
    );

    if (karte.hatDetails) {
      kachel.append(
        h('button', {
          class: 'mehr',
          type: 'button',
          'aria-expanded': karte.offen ? 'true' : 'false',
          onclick: () => {
            const geoeffnet = umschalten(zustand.geoeffnet, karte.id);
            el.props = { geoeffnet };
            el.melden('karte-geoeffnet', { geoeffnet, karte: karte.id });
          },
        }, [karte.offen ? '▾ weniger' : '▸ mehr']),
      );

      if (karte.offen) {
        const liste2 = h('dl', { class: 'details' });
        for (const detail of karte.details) {
          liste2.append(h('dt', { text: detail.label ?? '' }));
          liste2.append(h('dd', { text: String(detail.wert ?? '—') }));
        }
        kachel.append(liste2);
      }
    }

    raster.append(kachel);
  }

  wurzel.append(
    zustand.title ? h('figcaption', { text: zustand.title }) : null,
    raster,
  );
}

export const BAUPLAN = {
  name: 'uebersichtskarten',
  titel: 'Übersichtskarten',
  endpunkt: '/groups/{id}/aggregations',
  standard: STANDARD,
  ereignisse: ['karte-gewaehlt', 'karte-geoeffnet'],
  stil: STIL,
  aufbauen,
};

export const UebersichtskartenElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
