// Kompetenzstufen-Leiste — gestapelte Balken je Bezugsgruppe.
//
// Portiert aus apps/katalog/src/components/CompetenceLevelBar.vue. Die Maße und
// Farben sind unverändert übernommen, damit die Vue-Fassung im Katalog und die
// neuen Adapter dasselbe Bild zeigen.

import { SCHRIFT, el, esc, kurz, leer, zusammen } from './svg.js';

export const NAME = 'kompetenzstufen-leiste';

/** Voreinstellungen — auch die Grundlage für die Attribute des Custom Elements. */
export const STANDARD = {
  rows: [],
  title: '',
  domain: '',
};

const LABEL_W = 160;
const BAR_W = 560;
const BAR_H = 28;
const GAP = 12;
const PAD_TOP = 28;
const PAD_BOTTOM = 40;
// 16 wie im Original reichte nicht: die n=-Angabe beginnt bei 725 und wurde
// vom rechten Rand des SVG abgeschnitten. In einer Bibliothek, die andere
// einbetten, ist eine halbe Beschriftung schlimmer als etwas Luft.
const PAD_RIGHT = 48;
const SVG_W = LABEL_W + BAR_W + PAD_RIGHT;
const TICKS = [0, 25, 50, 75, 100];

const xPx = (pct) => LABEL_W + (pct / 100) * BAR_W;

/**
 * Segmente einer Zeile. Anteile unter 0.1 % fallen weg: sie wären schmaler als
 * ein Pixel und würden die Fuge zwischen zwei sichtbaren Segmenten aufreißen.
 */
function segmente(levels = []) {
  const segs = [];
  let x = 0;
  for (const lvl of levels) {
    if (!(lvl.pct >= 0.1)) continue;
    const w = (lvl.pct / 100) * BAR_W;
    segs.push({ x, w, ...lvl });
    x += w;
  }
  return segs;
}

/**
 * @param {{rows?: Array, title?: string, domain?: string}} props
 * @returns {{breite: number, hoehe: number, svg: string, html: string}}
 */
export function kompetenzstufenLeiste(props = {}) {
  const { rows, title, domain } = { ...STANDARD, ...props };
  const zeilen = Array.isArray(rows) ? rows : [];

  const balkenBlock = zeilen.length * (BAR_H + GAP) - GAP;
  const hoehe = PAD_TOP + Math.max(balkenBlock, 0) + PAD_BOTTOM;
  const barY = (i) => PAD_TOP + i * (BAR_H + GAP);

  const raster = zeilen.length
    ? el(
        'g',
        {},
        zusammen(
          TICKS.map((t) =>
            zusammen(
              leer('line', {
                x1: xPx(t), y1: PAD_TOP - 8,
                x2: xPx(t), y2: PAD_TOP + balkenBlock,
                stroke: '#e2e8f0', 'stroke-width': 1,
              }),
              el(
                'text',
                {
                  x: xPx(t), y: PAD_TOP - 11, 'text-anchor': 'middle',
                  'font-size': 10, fill: '#94a3b8', 'font-family': SCHRIFT,
                },
                `${t}%`,
              ),
            ),
          ),
        ),
      )
    : '';

  const balken = zeilen.map((row, i) => {
    const y = barY(i);
    const fair = Boolean(row.fair);

    const beschriftung = el(
      'text',
      {
        x: fair ? LABEL_W - 22 : LABEL_W - 8,
        y: y + BAR_H / 2,
        'text-anchor': 'end', 'dominant-baseline': 'middle',
        'font-size': 12, fill: fair ? '#0f766e' : '#374151', 'font-family': SCHRIFT,
      },
      esc(row.label ?? ''),
    );

    const waage = fair
      ? el(
          'text',
          {
            x: LABEL_W - 8, y: y + BAR_H / 2,
            'text-anchor': 'end', 'dominant-baseline': 'middle',
            'font-size': 11, 'font-family': SCHRIFT,
          },
          '⚖',
        )
      : '';

    const stuecke = segmente(row.levels).map((seg) =>
      zusammen(
        leer('rect', {
          x: LABEL_W + seg.x, y, width: seg.w, height: BAR_H,
          fill: seg.color, rx: 0, opacity: fair ? 0.8 : 1,
        }),
        // Beschriftung nur, wenn das Segment sie trägt — sonst steht die Stufe
        // über der Nachbarfarbe und ist nicht mehr zuzuordnen.
        seg.w > 24
          ? el(
              'text',
              {
                x: LABEL_W + seg.x + seg.w / 2, y: y + BAR_H / 2,
                'text-anchor': 'middle', 'dominant-baseline': 'middle',
                'font-size': 10, fill: 'rgba(255,255,255,0.92)',
                'font-weight': 600, 'font-family': SCHRIFT,
              },
              esc(seg.nameShort ?? ''),
            )
          : '',
      ),
    );

    const rahmen = fair
      ? leer('rect', {
          x: LABEL_W, y, width: BAR_W, height: BAR_H,
          fill: 'none', stroke: '#0d9488', 'stroke-width': 2,
          'stroke-dasharray': '6,3', rx: 0,
        })
      : '';

    const anzahl = el(
      'text',
      {
        x: LABEL_W + BAR_W + 5, y: y + BAR_H / 2,
        'dominant-baseline': 'middle', 'font-size': 10,
        fill: '#64748b', 'font-family': SCHRIFT,
      },
      `n=${esc(row.total ?? '?')}`,
    );

    return el('g', {}, zusammen(beschriftung, waage, stuecke, rahmen, anzahl));
  });

  const legendeY = PAD_TOP + Math.max(balkenBlock, 0) + 10;
  const legende = el(
    'g',
    { transform: `translate(${LABEL_W}, ${kurz(legendeY)})` },
    zusammen(
      (zeilen[0]?.levels ?? []).map((lvl, i) =>
        el(
          'g',
          { transform: `translate(${i * 90}, 0)` },
          zusammen(
            leer('rect', { x: 0, y: 0, width: 12, height: 12, fill: lvl.color, rx: 2 }),
            el(
              'text',
              { x: 15, y: 10, 'font-size': 10, fill: '#475569', 'font-family': SCHRIFT },
              `Stufe ${esc(lvl.nameShort ?? '')}`,
            ),
          ),
        ),
      ),
    ),
  );

  const svg = el(
    'svg',
    {
      width: SVG_W, height: hoehe, viewBox: `0 0 ${SVG_W} ${kurz(hoehe)}`,
      xmlns: 'http://www.w3.org/2000/svg', role: 'img',
      'aria-label': esc(title || 'Kompetenzstufenverteilung'),
    },
    zusammen(raster, balken, legende),
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

export default kompetenzstufenLeiste;
