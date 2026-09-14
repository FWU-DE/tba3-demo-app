// Kleine Helfer für den Bau von SVG-Zeichenketten.
//
// Die Kerne geben SVG als Zeichenkette zurück, nicht als DOM: nur so lässt sich
// dieselbe Implementierung in Vue, React, einem Custom Element und im Test auf
// dem Server benutzen. Ein DOM-Baum hinge an einer Umgebung, die es beim
// Serverrendern oder im Node-Test nicht gibt.

/** Text für den Einbau in Markup entschärfen. */
export function esc(wert) {
  return String(wert ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Attribute schreiben. `null`, `undefined` und `false` lassen das Attribut weg,
 * `true` schreibt es ohne Wert. Zahlen werden auf drei Nachkommastellen
 * gekürzt — sonst stehen Fließkomma-Reste wie 12.300000000000001 im Markup und
 * jeder Diff rauscht.
 */
export function attribute(paare) {
  return Object.entries(paare)
    .filter(([, wert]) => wert !== null && wert !== undefined && wert !== false)
    .map(([name, wert]) => {
      if (wert === true) return name;
      const v = typeof wert === 'number' ? kurz(wert) : wert;
      return `${name}="${esc(v)}"`;
    })
    .join(' ');
}

/** Zahl auf drei Nachkommastellen, ohne nachlaufende Nullen. */
export function kurz(zahl) {
  if (!Number.isFinite(zahl)) return '0';
  return String(Math.round(zahl * 1000) / 1000);
}

/** Ein Element mit Kindern. */
export function el(name, attrs = {}, kinder = '') {
  const a = attribute(attrs);
  const offen = a ? `<${name} ${a}>` : `<${name}>`;
  return `${offen}${kinder}</${name}>`;
}

/** Ein Element ohne Kinder. */
export function leer(name, attrs = {}) {
  const a = attribute(attrs);
  return a ? `<${name} ${a} />` : `<${name} />`;
}

/** Mehrere Stücke zusammensetzen, leere überspringen. */
export function zusammen(...stuecke) {
  return stuecke.flat(Infinity).filter(Boolean).join('');
}

/** Die Schriftfamilie, die alle Bausteine benutzen. */
export const SCHRIFT = 'system-ui,sans-serif';
