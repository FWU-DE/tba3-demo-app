// Kleine Helfer für den Bau von SVG-Knoten (nicht Zeichenketten).
//
// SVG-Elemente brauchen createElementNS; `document.createElement('rect')`
// erzeugt ein HTML-Element namens "rect", das nichts zeichnet. Das ist der
// häufigste Fehler beim Wechsel von innerHTML auf echtes DOM.

const NS = 'http://www.w3.org/2000/svg';

/** Ein SVG-Element mit Attributen und Kindern. */
export function s(name, attrs = {}, kinder = []) {
  const el = document.createElementNS(NS, name);
  for (const [k, wert] of Object.entries(attrs)) {
    if (wert === null || wert === undefined || wert === false) continue;
    if (k === 'text') {
      el.textContent = String(wert);
      continue;
    }
    el.setAttribute(k, typeof wert === 'number' ? kurz(wert) : String(wert));
  }
  for (const kind of [kinder].flat(Infinity)) {
    if (kind) el.append(kind);
  }
  return el;
}

/** Ein HTML-Element mit Attributen, Klassen und Kindern. */
export function h(name, attrs = {}, kinder = []) {
  const el = document.createElement(name);
  for (const [k, wert] of Object.entries(attrs)) {
    if (wert === null || wert === undefined || wert === false) continue;
    if (k === 'class') el.className = wert;
    else if (k === 'text') el.textContent = String(wert);
    else if (k === 'html') el.innerHTML = String(wert);
    else if (k.startsWith('on') && typeof wert === 'function') {
      el.addEventListener(k.slice(2).toLowerCase(), wert);
    } else if (k === 'dataset') Object.assign(el.dataset, wert);
    else el.setAttribute(k, wert === true ? '' : String(wert));
  }
  for (const kind of [kinder].flat(Infinity)) {
    if (kind === null || kind === undefined || kind === false) continue;
    el.append(kind);
  }
  return el;
}

/** Zahl auf drei Nachkommastellen — sonst stehen Fließkomma-Reste im Markup. */
export function kurz(zahl) {
  if (!Number.isFinite(zahl)) return '0';
  return String(Math.round(zahl * 1000) / 1000);
}

export const SVG_NS = NS;
