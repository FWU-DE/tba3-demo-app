// Ob ein Thema lesbar ist, lässt sich ausrechnen.
//
// Die Bausteine bringen kein Design mit — die Farben kommen von außen. Das ist
// die Stärke der Bibliothek und zugleich ihre offene Flanke: ein Land setzt
// seine Marke, überschreibt die Kompetenzstufen, und plötzlich steht das
// Kürzel „III" weiß auf Gelb. Genau das war hier der Fall, bevor jede Stufe
// ihre eigene Beschriftungsfarbe bekam.
//
// Deshalb steht die Prüfung im Paket und nicht nur in einem Test: wer ein
// eigenes Thema baut, kann sie über seine Werte laufen lassen.
//
//   import { pruefeThema } from '@tba3/bausteine';
//   const befunde = pruefeThema({ 'farbe-text': '#333', 'stufe-3': '#ffcc00', … });
//   if (befunde.length) console.table(befunde);
//
// Gerechnet wird nach WCAG 2.1: relative Leuchtkraft, Verhältnis (L1+0.05) /
// (L2+0.05). 4,5 ist die Schwelle für normalen Text (AA).

import { THEMA } from './thema.js';

/** '#abc', '#aabbcc' oder 'rgb()/rgba()' → { r, g, b, a } */
export function farbe(wert) {
  const text = String(wert ?? '').trim();
  if (text.startsWith('#')) {
    const roh = text.slice(1);
    const teile = roh.length === 3 ? [...roh].map((z) => z + z) : roh.match(/../g);
    if (!teile || teile.length < 3) return null;
    return { r: parseInt(teile[0], 16), g: parseInt(teile[1], 16), b: parseInt(teile[2], 16), a: 1 };
  }
  const treffer = text.match(/rgba?\(([^)]+)\)/);
  if (!treffer) return null;
  const zahlen = treffer[1].split(',').map((z) => Number.parseFloat(z));
  if (zahlen.length < 3 || zahlen.some((z) => Number.isNaN(z))) return null;
  return { r: zahlen[0], g: zahlen[1], b: zahlen[2], a: zahlen[3] === undefined ? 1 : zahlen[3] };
}

/** Eine durchscheinende Farbe auf ihren Untergrund rechnen. */
export function decken(vorn, hinten) {
  if (vorn.a >= 1) return vorn;
  return {
    r: vorn.r * vorn.a + hinten.r * (1 - vorn.a),
    g: vorn.g * vorn.a + hinten.g * (1 - vorn.a),
    b: vorn.b * vorn.a + hinten.b * (1 - vorn.a),
    a: 1,
  };
}

/** Relative Leuchtkraft nach WCAG 2.1. */
export function leuchtkraft({ r, g, b }) {
  const kanal = (wert) => {
    const anteil = wert / 255;
    return anteil <= 0.03928 ? anteil / 12.92 : ((anteil + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}

/** Das Kontrastverhältnis zweier Farben, 1 bis 21. */
export function kontrast(vorn, hinten) {
  const a = leuchtkraft(vorn);
  const b = leuchtkraft(hinten);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Die Schrift, die auf dieser Fläche lesbar ist — hell oder dunkel, je nachdem.
 *
 * Für Farben, die als **Daten** hereinkommen: ein Aufrufer darf jeder
 * Kompetenzstufe eine eigene Farbe mitgeben, und dann passt die
 * Beschriftungsfarbe des Themas nicht mehr dazu. Hier steht der Wert im
 * Klartext, also lässt sich die Frage ausrechnen, statt sie zu raten.
 *
 * Nur für echte Farbwerte — ein `var(--…)` kann diese Funktion nicht auflösen
 * und gibt dann `null` zurück; dann gilt wieder das Thema.
 */
export function lesbareSchrift(hintergrund, hell = '#ffffff', dunkel = '#1a1a1a') {
  const flaeche = farbe(hintergrund);
  if (!flaeche) return null;
  const gedeckt = decken(flaeche, farbe('#ffffff'));
  return kontrast(farbe(hell), gedeckt) >= kontrast(farbe(dunkel), gedeckt) ? hell : dunkel;
}

/**
 * Die Paare, die ein Thema tragen muss — jedes ist eine Stelle, an der ein
 * Baustein wirklich Text auf Fläche legt.
 *
 * `hinten: null` heißt: der Grund der Seite. `farbe-grund` ist in den Vorgaben
 * absichtlich `transparent`, damit ein Baustein die Farbe seiner Umgebung
 * annimmt; geprüft wird dann gegen den Grund, den die Seite mitgibt.
 */
export const PAARE = [
  { vorn: 'farbe-text', hinten: null, was: 'Fließtext' },
  { vorn: 'farbe-text-gedaempft', hinten: null, was: 'gedämpfter Text' },
  { vorn: 'farbe-text', hinten: 'farbe-flaeche', was: 'Text auf Fläche' },
  { vorn: 'farbe-text-gedaempft', hinten: 'farbe-flaeche', was: 'gedämpfter Text auf Fläche' },
  { vorn: 'farbe-marke', hinten: null, was: 'Markenfarbe' },
  { vorn: 'farbe-ueber', hinten: null, was: 'über Erwartung' },
  { vorn: 'farbe-unter', hinten: null, was: 'unter Erwartung' },
  { vorn: 'farbe-im-rahmen', hinten: null, was: 'im Erwartungsbereich' },
  { vorn: 'band-marker', hinten: 'band-grund', was: 'Raute im Perzentilband' },
  { vorn: 'farbe-text-invers', hinten: 'farbe-marke', was: 'Zahl auf dem Marker' },
  ...[1, 2, 3, 4, 5].map((nr) => ({
    vorn: `stufe-${nr}-text`,
    hinten: `stufe-${nr}`,
    was: `Beschriftung auf Kompetenzstufe ${nr}`,
  })),
];

/** Ab hier gilt Text als lesbar (WCAG 2.1 AA, normaler Text). */
export const SCHWELLE = 4.5;

/**
 * Prüft ein Thema und gibt zurück, was durchfällt.
 *
 * @param {Record<string, string>} werte  Überschreibungen, Namen ohne `--tba3-`
 * @param {object} [wahl]
 * @param {'hell'|'dunkel'} [wahl.modus]  welche Vorgabe unter den Werten liegt
 * @param {string} [wahl.grund]           der Grund der Seite, falls durchsichtig
 * @param {number} [wahl.schwelle]
 * @returns {{was: string, vorn: string, hinten: string, verhaeltnis: number}[]}
 */
export function pruefeThema(werte = {}, wahl = {}) {
  const { modus = 'hell', schwelle = SCHWELLE } = wahl;
  const grundVorgabe = wahl.grund ?? (modus === 'dunkel' ? '#16181d' : '#ffffff');
  const wert = (name) => werte[name] ?? THEMA[name]?.[modus];

  const grund = farbe(
    wert('farbe-grund') === 'transparent' || wert('farbe-grund') === undefined
      ? grundVorgabe
      : wert('farbe-grund'),
  );

  const befunde = [];
  for (const paar of PAARE) {
    const vorn = farbe(wert(paar.vorn));
    const hintenRoh = paar.hinten === null ? grund : farbe(wert(paar.hinten));
    if (!vorn || !hintenRoh || !grund) continue;

    const hinten = decken(hintenRoh, grund);
    const verhaeltnis = kontrast(decken(vorn, hinten), hinten);
    if (verhaeltnis < schwelle) {
      befunde.push({
        was: paar.was,
        vorn: paar.vorn,
        hinten: paar.hinten ?? 'grund der seite',
        verhaeltnis: Math.round(verhaeltnis * 100) / 100,
      });
    }
  }
  return befunde;
}

export default pruefeThema;
