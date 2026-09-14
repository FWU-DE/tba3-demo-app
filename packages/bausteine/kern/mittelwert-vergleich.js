// Mittelwert-Vergleich — Diamant-Marker auf einer waagerechten Skala, dazu
// optionale Konfidenzintervalle.
//
// Portiert aus apps/katalog/src/components/MeanComparisonChart.vue. Die
// Achsenbeschriftung kommt dort aus der i18n der Vue-App; hier ist sie eine
// gewöhnliche Eigenschaft mit deutschem Standard, damit der Kern ohne
// Übersetzungsschicht auskommt.

import { SCHRIFT, el, esc, kurz, leer, zusammen } from './svg.js';

export const NAME = 'mittelwert-vergleich';

export const STANDARD = {
  rows: [],
  title: '',
  domain: '',
  xLabel: 'Mittlere Lösungsquote',
};

const LABEL_W = 170;
const CHART_W = 480;
const ROW_H = 36;
const GAP = 8;
const PAD_TOP = 32;
const PAD_BOTTOM = 36;
const PAD_RIGHT = 60;
const SVG_W = LABEL_W + CHART_W + PAD_RIGHT;
const TICKS = [0, 25, 50, 75, 100];

// Hintergrundbänder für die Kompetenzzonen — bewusst blass, sie sollen den
// Marker einordnen, nicht mit ihm konkurrieren.
const ZONEN = [
  { von: 0, bis: 30, farbe: '#fef2f2', text: 'KS I–II' },
  { von: 30, bis: 60, farbe: '#fefce8', text: 'KS III' },
  { von: 60, bis: 100, farbe: '#f0fdf4', text: 'KS IV–V' },
];

const cx = (pct) => LABEL_W + (pct / 100) * CHART_W;
const stil = (row) =>
  row.fair ? { farbe: '#0d9488', kante: '#0f766e' } : { farbe: '#3b82f6', kante: '#1d4ed8' };

export function mittelwertVergleich(props = {}) {
  const { rows, title, domain, xLabel } = { ...STANDARD, ...props };
  const zeilen = Array.isArray(rows) ? rows : [];

  const flaeche = Math.max(zeilen.length * (ROW_H + GAP) - GAP, 0);
  const hoehe = PAD_TOP + flaeche + PAD_BOTTOM;
  const rowY = (i) => PAD_TOP + i * (ROW_H + GAP);

  const zonen = el(
    'g',
    {},
    zusammen(
      ZONEN.map((z) =>
        leer('rect', {
          x: cx(z.von), y: PAD_TOP - 20,
          width: ((z.bis - z.von) / 100) * CHART_W, height: flaeche + 20,
          fill: z.farbe,
        }),
      ),
      ZONEN.map((z) =>
        el(
          'text',
          {
            x: cx((z.von + z.bis) / 2), y: PAD_TOP - 8,
            'text-anchor': 'middle', 'font-size': 8.5,
            fill: '#94a3b8', 'font-family': SCHRIFT,
          },
          esc(z.text),
        ),
      ),
    ),
  );

  const raster = el(
    'g',
    {},
    zusammen(
      TICKS.map((t) =>
        zusammen(
          leer('line', {
            x1: cx(t), y1: PAD_TOP - 20, x2: cx(t), y2: PAD_TOP + flaeche,
            stroke: '#e2e8f0', 'stroke-width': 1,
          }),
          el(
            'text',
            {
              x: cx(t), y: PAD_TOP + flaeche + 14, 'text-anchor': 'middle',
              'font-size': 10, fill: '#94a3b8', 'font-family': SCHRIFT,
            },
            `${t}%`,
          ),
        ),
      ),
    ),
  );

  const eintraege = zeilen.map((row, i) => {
    const mitte = rowY(i) + ROW_H / 2;
    const { farbe, kante } = stil(row);
    const fair = Boolean(row.fair);

    const grundlinie = leer('line', {
      x1: LABEL_W, y1: mitte, x2: LABEL_W + CHART_W, y2: mitte,
      stroke: '#f1f5f9', 'stroke-width': 1,
    });

    const beschriftung = el(
      'text',
      {
        x: LABEL_W - 10, y: mitte, 'text-anchor': 'end',
        'dominant-baseline': 'middle', 'font-size': 12,
        fill: fair ? '#0f766e' : '#374151', 'font-family': SCHRIFT,
      },
      esc(row.label ?? ''),
    );

    const waage = fair
      ? el(
          'text',
          {
            x: LABEL_W - 2, y: mitte, 'text-anchor': 'end',
            'dominant-baseline': 'middle', 'font-size': 11, 'font-family': SCHRIFT,
          },
          '⚖',
        )
      : '';

    const intervall =
      row.ciLow != null && row.ciHigh != null
        ? el(
            'g',
            {},
            zusammen(
              leer('line', {
                x1: cx(row.ciLow), y1: mitte, x2: cx(row.ciHigh), y2: mitte,
                stroke: farbe, 'stroke-width': 2.5, 'stroke-linecap': 'round',
              }),
              leer('line', {
                x1: cx(row.ciLow), y1: mitte - 6, x2: cx(row.ciLow), y2: mitte + 6,
                stroke: farbe, 'stroke-width': 1.5,
              }),
              leer('line', {
                x1: cx(row.ciHigh), y1: mitte - 6, x2: cx(row.ciHigh), y2: mitte + 6,
                stroke: farbe, 'stroke-width': 1.5,
              }),
            ),
          )
        : '';

    const marker = el(
      'g',
      { transform: `translate(${kurz(cx(row.mean ?? 0))}, ${kurz(mitte)})` },
      zusammen(
        leer('polygon', {
          points: '0,-9 9,0 0,9 -9,0', fill: farbe, stroke: kante, 'stroke-width': 1.5,
        }),
        el(
          'text',
          {
            y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
            'font-size': 7, 'font-weight': 700, fill: 'white', 'font-family': SCHRIFT,
          },
          String(Math.round(row.mean ?? 0)),
        ),
      ),
    );

    const anzahl =
      row.n != null
        ? el(
            'text',
            {
              x: LABEL_W + CHART_W + 8, y: mitte, 'dominant-baseline': 'middle',
              'font-size': 10, fill: '#94a3b8', 'font-family': SCHRIFT,
            },
            `n=${esc(row.n)}`,
          )
        : '';

    return el('g', {}, zusammen(grundlinie, beschriftung, waage, intervall, marker, anzahl));
  });

  const achse = el(
    'text',
    {
      x: LABEL_W + CHART_W / 2, y: hoehe - 4, 'text-anchor': 'middle',
      'font-size': 10, fill: '#64748b', 'font-family': SCHRIFT,
    },
    esc(xLabel ?? STANDARD.xLabel),
  );

  const svg = el(
    'svg',
    {
      width: SVG_W, height: hoehe, viewBox: `0 0 ${SVG_W} ${kurz(hoehe)}`,
      xmlns: 'http://www.w3.org/2000/svg', role: 'img',
      'aria-label': esc(title || 'Mittelwert-Vergleich'),
    },
    zusammen(zonen, raster, eintraege, achse),
  );

  const kopf = title
    ? el(
        'figcaption',
        { class: 'tba3-titel' },
        zusammen(esc(title), domain ? el('span', { class: 'tba3-domain' }, ` — ${esc(domain)}`) : ''),
      )
    : '';

  return {
    breite: SVG_W,
    hoehe,
    svg,
    html: el('figure', { class: 'tba3-figur' }, zusammen(kopf, el('div', { class: 'tba3-scroll' }, svg))),
  };
}

export default mittelwertVergleich;
