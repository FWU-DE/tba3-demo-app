// Das Thema der Bausteine.
//
// Die Bausteine bringen absichtlich **kein** Design mit. Sie lesen
// CSS-Variablen und haben für jede eine Vorgabe — einmal hell, einmal dunkel.
// Steht ein Baustein in einer Seite mit eigenen Tokens, übernimmt er deren
// Aussehen; steht er allein, sieht er unauffällig aus statt kaputt, und im
// dunklen Systemthema von selbst dunkel.
//
//   tba3-kompetenzstufen-leiste {
//     --tba3-farbe-marke: #0000c4;
//     --tba3-stufe-3: #eab308;
//   }
//
// ── Warum die Vorgaben nicht einfach auf :host stehen ─────────────────────
//
// Ein `:host { --tba3-farbe-text: #1a1a1a }` setzt die Eigenschaft **auf dem
// Element selbst** — und schlägt damit jeden Wert, den die Seite weiter oben
// vererbt. Das Thema der Seite käme nie an. Genau daran ist der erste Anlauf
// gescheitert: im dunklen Thema blieb der Text schwarz.
//
// Deshalb die Umleitung über einen privaten Namen:
//
//   :host { --tba3-_farbe-text: var(--tba3-farbe-text, #1a1a1a); }
//   @media (prefers-color-scheme: dark) {
//     :host { --tba3-_farbe-text: var(--tba3-farbe-text, #f1f3f5); }
//   }
//
// Die Bausteine zeichnen mit `--tba3-_farbe-text`. Setzt die Seite den
// öffentlichen Namen, gewinnt sie — der private Wert liest ihn ja. Setzt sie
// nichts, greift die Vorgabe, und die hängt vom Systemthema ab. Den privaten
// Namen setzt niemand von außen; er ist nur die Leitung dazwischen.
// ──────────────────────────────────────────────────────────────────────────

/** Jede Variable mit Vorgabe für hell und dunkel. */
export const THEMA = {
  // Schrift
  'schrift': { hell: 'system-ui, sans-serif', dunkel: 'system-ui, sans-serif' },
  'schrift-mono': {
    hell: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    dunkel: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  'schrift-groesse': { hell: '13px', dunkel: '13px' },

  // Flächen und Linien
  'farbe-grund': { hell: 'transparent', dunkel: 'transparent' },
  'farbe-flaeche': { hell: '#f8f8f8', dunkel: '#23262d' },
  'farbe-linie': { hell: '#e0e0e0', dunkel: '#3a3f48' },
  'farbe-raster': { hell: '#ededed', dunkel: '#2c3038' },

  // Text
  'farbe-text': { hell: '#1a1a1a', dunkel: '#f1f3f5' },
  'farbe-text-gedaempft': { hell: '#6b6b6b', dunkel: '#a4aab4' },
  'farbe-text-invers': { hell: '#ffffff', dunkel: '#16181d' },

  // Interaktion
  'farbe-marke': { hell: '#3b5bdb', dunkel: '#8aa3ff' },
  'farbe-fokus': { hell: '#3b5bdb', dunkel: '#8aa3ff' },
  'farbe-hervorhebung': { hell: 'rgba(0, 0, 0, 0.04)', dunkel: 'rgba(255, 255, 255, 0.06)' },

  // Kompetenzstufen I–V. Neutral heißt hier nicht farblos: die Stufen tragen
  // eine Ordnung (unter / im / über Standard), die ohne Farbverlauf verloren
  // ginge. Im Dunklen sind die Töne angehoben, damit sie auf dunklem Grund
  // nicht absaufen.
  'stufe-1': { hell: '#cf3f3f', dunkel: '#f07070' },
  'stufe-2': { hell: '#e8833a', dunkel: '#f0a15e' },
  'stufe-3': { hell: '#d9b23a', dunkel: '#e8c65e' },
  'stufe-4': { hell: '#4a9e5c', dunkel: '#6fc785' },
  'stufe-5': { hell: '#2f7a44', dunkel: '#4da86a' },

  // Die Schrift, die **auf** einer Stufe steht: das Kürzel im Balken, das
  // Abzeichen in der Tabelle, die Initialen im Avatar.
  //
  // Eine einzige Inversfarbe reicht dafür nicht. Weiß auf dem Gelb der Stufe 3
  // hat ein Kontrastverhältnis von 2,0 — lesbar ist ab 4,5 —, und dieselbe
  // Wahl ist im dunklen Thema wieder falsch herum. Deshalb trägt jede Stufe
  // ihre Beschriftungsfarbe selbst, und `thema.test.mjs` rechnet für jede das
  // Verhältnis nach. Wer die Stufenfarben überschreibt, überschreibt diese
  // hier mit — sonst schlägt die Prüfung fehl.
  'stufe-1-text': { hell: '#ffffff', dunkel: '#16181d' },
  'stufe-2-text': { hell: '#1a1a1a', dunkel: '#16181d' },
  'stufe-3-text': { hell: '#1a1a1a', dunkel: '#16181d' },
  'stufe-4-text': { hell: '#1a1a1a', dunkel: '#16181d' },
  'stufe-5-text': { hell: '#ffffff', dunkel: '#16181d' },

  // Bewertung gegen einen Erwartungswert
  'farbe-ueber': { hell: '#2f7a44', dunkel: '#6fc785' },
  'farbe-im-rahmen': { hell: '#6b6b6b', dunkel: '#a4aab4' },
  'farbe-unter': { hell: '#c2402d', dunkel: '#f07a68' },

  // Perzentilbänder — eigene Töne, weil das Band kein Markenelement ist:
  // es soll die Raute tragen, nicht überstrahlen.
  'band': { hell: 'rgba(90,155,210,0.50)', dunkel: 'rgba(120,170,220,0.40)' },
  'band-kante': { hell: 'rgba(60,125,185,0.70)', dunkel: 'rgba(140,185,230,0.60)' },
  'band-unten': { hell: 'rgba(251,146,60,0.28)', dunkel: 'rgba(230,140,70,0.26)' },
  'band-oben': { hell: 'rgba(74,222,128,0.28)', dunkel: 'rgba(90,200,130,0.26)' },
  'band-grund': { hell: '#e8f2f9', dunkel: '#1d2630' },
  'band-marker': { hell: '#1e3a5f', dunkel: '#cdd9e8' },

  // Zonen im Mittelwert-Vergleich
  'zone-unten': { hell: '#fdf2f2', dunkel: '#2a1f22' },
  'zone-mitte': { hell: '#fdfbee', dunkel: '#292620' },
  'zone-oben': { hell: '#f0f8f2', dunkel: '#1f2a22' },

  // Maße
  'radius': { hell: '4px', dunkel: '4px' },
  'abstand': { hell: '8px', dunkel: '8px' },
};

/** Der öffentliche Name, den eine Seite setzt. */
export const oeffentlich = (name) => `--tba3-${name}`;

/** Der private Name, mit dem die Bausteine zeichnen. */
export const privat = (name) => `--tba3-_${name}`;

/** Kurzform für Stilregeln: v('farbe-text') → var(--tba3-_farbe-text) */
export const v = (name) => `var(${privat(name)})`;

/** Kompetenzstufe als Zahl: 'III' → 3. Alles andere ergibt null. */
export const stufenNummer = (stufe) => ({ I: 1, II: 2, III: 3, IV: 4, V: 5 })[stufe] ?? null;

/** Die Farbe der Stufe 1–5 (außerhalb des Bereichs wird geklemmt). */
export const stufenFlaeche = (nr) => v(`stufe-${Math.max(1, Math.min(5, nr))}`);

/**
 * Die Schrift, die auf dieser Stufe lesbar bleibt.
 *
 * Immer paarweise mit `stufenFlaeche` benutzen: wer eine Fläche in einer
 * Stufenfarbe zeichnet und Text hineinsetzt, nimmt hierfür diese Farbe und
 * nicht `farbe-text-invers` — sonst steht die Beschriftung im hellen Thema
 * weiß auf Gelb.
 */
export const stufenSchrift = (nr) => v(`stufe-${Math.max(1, Math.min(5, nr))}-text`);

/**
 * Die Umleitung als CSS. Kommt in jedes Shadow DOM.
 *
 * Zwei Blöcke: der erste bindet jeden privaten Namen an den öffentlichen mit
 * heller Vorgabe, der zweite tut dasselbe mit dunkler Vorgabe, sobald das
 * System auf Dunkel steht. Eine Seite, die den öffentlichen Namen setzt,
 * gewinnt in beiden Fällen.
 */
export function themaCss() {
  const zeile = (name, modus) =>
    `  ${privat(name)}: var(${oeffentlich(name)}, ${THEMA[name][modus]});`;
  const namen = Object.keys(THEMA);
  return [
    ':host {',
    ...namen.map((n) => zeile(n, 'hell')),
    '}',
    '@media (prefers-color-scheme: dark) {',
    '  :host {',
    ...namen.map((n) => '  ' + zeile(n, 'dunkel')),
    '  }',
    '}',
    // Wer den Modus erzwingen will, setzt `data-thema` **am Element selbst**:
    // `:host()` prüft nur das Wirtselement, ein Attribut weiter oben im Baum
    // greift hier nicht. Nötig ist das auf jeder Seite, die keinen eigenen
    // Dunkelmodus hat — sonst folgt der Baustein dem System, die Seite bleibt
    // hell, und heller Text steht auf hellem Grund.
    ':host([data-thema="hell"]) {',
    ...namen.map((n) => zeile(n, 'hell')),
    '}',
    ':host([data-thema="dunkel"]) {',
    ...namen.map((n) => zeile(n, 'dunkel')),
    '}',
  ].join('\n');
}

export default THEMA;
