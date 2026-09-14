// Native Web Components für alle Bausteine.
//
// Ein Custom Element je Baustein, erzeugt aus dem Verzeichnis in ../kern. Keine
// Abhängigkeit, kein Build: die Datei lässt sich direkt als <script type="module">
// einbinden, auch in einer Seite, die weder Vue noch React kennt.
//
//   <script type="module" src="/bausteine/webcomponents.js"></script>
//   <tba3-kompetenzstufen-leiste title="3a Deutsch"></tba3-kompetenzstufen-leiste>
//   <script>
//     document.querySelector('tba3-kompetenzstufen-leiste').rows = [...];
//   </script>
//
// Daten kommen über Eigenschaften (rows, items), einfache Angaben zusätzlich
// über Attribute. Attribute tragen nur Zeichenketten — deshalb nimmt ein
// Attribut mit JSON-Inhalt ebenfalls Daten entgegen, für Fälle, in denen die
// Seite kein Skript ausführen soll.

import { BAUSTEINE, STIL } from '../kern/index.js';

const PRAEFIX = 'tba3-';

/** Aus dem Attributwert einen brauchbaren Wert machen. */
function ausAttribut(roh, vorgabe) {
  if (roh === null) return vorgabe;
  if (Array.isArray(vorgabe) || (vorgabe && typeof vorgabe === 'object')) {
    try {
      return JSON.parse(roh);
    } catch {
      // Ungültiges JSON ist ein Autorenfehler, kein Grund die Seite zu zerlegen:
      // die Vorgabe greift, und die Meldung sagt, wo es klemmt.
      console.warn(`[tba3-bausteine] Attribut enthält kein gültiges JSON: ${roh}`);
      return vorgabe;
    }
  }
  if (typeof vorgabe === 'number') {
    const zahl = Number(roh);
    return Number.isFinite(zahl) ? zahl : vorgabe;
  }
  if (typeof vorgabe === 'boolean') return roh !== 'false';
  return roh;
}

function elementBauen({ name, standard, bauen }) {
  const eigenschaften = Object.keys(standard);

  return class extends HTMLElement {
    static get observedAttributes() {
      return eigenschaften.map((e) => e.toLowerCase());
    }

    #werte = { ...standard };

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      for (const e of eigenschaften) {
        const attr = this.getAttribute(e.toLowerCase());
        if (attr !== null) this.#werte[e] = ausAttribut(attr, standard[e]);
      }
      this.#zeichnen();
    }

    attributeChangedCallback(attr, alt, neu) {
      if (alt === neu) return;
      const e = eigenschaften.find((k) => k.toLowerCase() === attr);
      if (!e) return;
      this.#werte[e] = ausAttribut(neu, standard[e]);
      this.#zeichnen();
    }

    #zeichnen() {
      if (!this.shadowRoot) return;
      const { html } = bauen(this.#werte);
      this.shadowRoot.innerHTML = `<style>${STIL}${LEGENDE_STIL}</style>${html}`;
    }

    /** Alle Eigenschaften auf einmal setzen. */
    set props(werte) {
      this.#werte = { ...this.#werte, ...werte };
      this.#zeichnen();
    }

    get props() {
      return { ...this.#werte };
    }

    // Je Eigenschaft ein Zugriffspaar, damit `el.rows = [...]` funktioniert —
    // der übliche Weg, Daten an ein Custom Element zu geben.
    static {
      for (const e of eigenschaften) {
        Object.defineProperty(this.prototype, e, {
          get() {
            return this.props[e];
          },
          set(wert) {
            this.props = { [e]: wert };
          },
          enumerable: true,
          configurable: true,
        });
      }
    }
  };
}

// Die Legende der Erwartungs-Komponente lebt außerhalb des SVG und braucht
// deshalb eigene Regeln im Shadow DOM.
const LEGENDE_STIL = `
.tba3-legende {
  display: flex; flex-wrap: wrap; gap: 4px 16px;
  font-size: 0.75rem; color: #475569; margin-bottom: 10px;
  font-family: system-ui, sans-serif;
}
.tba3-legende-eintrag { display: flex; align-items: center; gap: 5px; }
.tba3-legende-punkt { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.tba3-legende-linie {
  width: 16px; height: 0; flex-shrink: 0;
  border-top: 2px dashed #0f172a;
}
`;

/** Elementklassen je Baustein — auch ohne Registrierung benutzbar. */
export const ELEMENTE = Object.fromEntries(
  BAUSTEINE.map((b) => [PRAEFIX + b.name, elementBauen(b)]),
);

/**
 * Alle Elemente registrieren. Mehrfaches Aufrufen ist harmlos: bereits
 * vergebene Namen werden übersprungen, sonst wirft der zweite Aufruf.
 */
export function registrieren(praefix = PRAEFIX) {
  if (typeof customElements === 'undefined') return [];
  const vergeben = [];
  for (const b of BAUSTEINE) {
    const name = praefix + b.name;
    if (customElements.get(name)) continue;
    customElements.define(name, praefix === PRAEFIX ? ELEMENTE[name] : elementBauen(b));
    vergeben.push(name);
  }
  return vergeben;
}

export default registrieren;
