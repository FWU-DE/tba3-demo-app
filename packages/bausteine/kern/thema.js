// Das Thema der Bausteine.
//
// Die Bausteine bringen absichtlich **kein** Design mit. Sie lesen
// CSS-Variablen und haben für jede einen neutralen Rückfallwert. Steht ein
// Baustein in einer Seite mit eigenen Tokens, übernimmt er deren Aussehen;
// steht er allein, sieht er unauffällig aus statt kaputt.
//
// So lässt sich derselbe Baustein im FWU-Portal, bei einem Land mit eigenem
// Design und in einer fremden Anwendung einsetzen, ohne ihn zu forken. Genau
// das ist der Punkt der Nachnutzung.
//
//   tba3-kompetenzstufen-leiste {
//     --tba3-farbe-marke: #0000c4;
//     --tba3-stufe-3: #eab308;
//   }
//
// Die Namen sind bewusst eigenständig (`--tba3-*`) statt an die Tokens der
// FWU-Seite gebunden: ein Baustein darf nicht davon abhängen, dass gerade
// diese Seite ihn umgibt. Wer die FWU-Tokens hat, verdrahtet sie in einer
// Zeile — siehe README.

/**
 * Jede Variable mit ihrem neutralen Rückfallwert.
 * Die Reihenfolge ist die der Dokumentation.
 */
export const THEMA = {
  // Schrift
  '--tba3-schrift': 'system-ui, sans-serif',
  '--tba3-schrift-mono': 'ui-monospace, SFMono-Regular, Menlo, monospace',

  // Flächen und Linien
  '--tba3-farbe-grund': 'transparent',
  '--tba3-farbe-flaeche': '#f8f8f8',
  '--tba3-farbe-linie': '#e0e0e0',
  '--tba3-farbe-raster': '#ededed',

  // Text
  '--tba3-farbe-text': '#1a1a1a',
  '--tba3-farbe-text-gedaempft': '#6b6b6b',
  '--tba3-farbe-text-invers': '#ffffff',

  // Interaktion
  '--tba3-farbe-marke': '#3b5bdb',
  '--tba3-farbe-fokus': '#3b5bdb',
  '--tba3-farbe-hervorhebung': 'rgba(0, 0, 0, 0.04)',

  // Kompetenzstufen I–V. Neutral heißt hier nicht farblos: die Stufen tragen
  // eine Ordnung (unter / im / über Standard), die ohne Farbverlauf verloren
  // ginge. Die Vorgabe ist ein zurückhaltender Rot-Grün-Verlauf.
  '--tba3-stufe-1': '#d64545',
  '--tba3-stufe-2': '#e8833a',
  '--tba3-stufe-3': '#d9b23a',
  '--tba3-stufe-4': '#4a9e5c',
  '--tba3-stufe-5': '#2f7a44',

  // Bewertung gegen einen Erwartungswert
  '--tba3-farbe-ueber': '#2f7a44',
  '--tba3-farbe-im-rahmen': '#6b6b6b',
  '--tba3-farbe-unter': '#c2402d',

  // Maße
  '--tba3-radius': '4px',
  '--tba3-abstand': '8px',
  '--tba3-schrift-groesse': '13px',
};

/** Die CSS-Regeln, die die Rückfallwerte setzen. Kommt in jedes Shadow DOM. */
export function themaCss() {
  const zeilen = Object.entries(THEMA).map(([name, wert]) => `  ${name}: ${wert};`);
  return `:host {\n${zeilen.join('\n')}\n}`;
}

/** Kurzform für den Zugriff in Stilregeln: v('farbe-text') → var(--tba3-farbe-text) */
export function v(name) {
  return `var(--tba3-${name})`;
}

export default THEMA;
