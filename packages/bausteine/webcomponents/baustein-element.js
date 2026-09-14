// Die gemeinsame Grundlage aller Bausteine als Custom Element.
//
// Anders als der erste Entwurf setzt hier nichts mehr eine fertige
// Zeichenkette per innerHTML. Jeder Baustein baut echtes DOM und hängt echte
// Ereignis-Empfänger daran. Nur so gehen Tooltips, Sortierung, Auswahl und
// Tastaturbedienung — und nur so lassen sich Tabellen und Karten bauen, nicht
// nur Diagramme.
//
// Was diese Klasse abnimmt:
//   - Eigenschaften und Attribute (inklusive JSON in Attributen)
//   - Neuzeichnen zusammenfassen, statt bei jeder Zuweisung einmal
//   - Shadow DOM mit Thema und Stil
//   - Ereignisse nach außen geben
//
// Was der Baustein selbst tut: `aufbauen(wurzel)`.

import { themaCss } from '../kern/thema.js';

/** Aus einem Attributwert einen brauchbaren Wert machen. */
function ausAttribut(roh, vorgabe) {
  if (roh === null) return vorgabe;
  if (Array.isArray(vorgabe) || (vorgabe && typeof vorgabe === 'object')) {
    try {
      return JSON.parse(roh);
    } catch {
      console.warn(`[tba3-bausteine] Attribut enthält kein gültiges JSON: ${roh}`);
      return vorgabe;
    }
  }
  if (typeof vorgabe === 'number') {
    const zahl = Number(roh);
    return Number.isFinite(zahl) ? zahl : vorgabe;
  }
  if (typeof vorgabe === 'boolean') return roh !== 'false' && roh !== null;
  return roh;
}

/**
 * @param {object} bauplan
 * @param {string} bauplan.name       Elementname ohne Präfix
 * @param {object} bauplan.standard   Eigenschaften mit Vorgabewerten
 * @param {string} bauplan.stil       CSS für das Shadow DOM
 * @param {(wurzel: DocumentFragment|HTMLElement, zustand: object, el: HTMLElement) => void} bauplan.aufbauen
 */
export function elementKlasse({ name, standard, stil, aufbauen }) {
  const eigenschaften = Object.keys(standard);

  return class BausteinElement extends HTMLElement {
    static get observedAttributes() {
      return eigenschaften.map((e) => e.toLowerCase());
    }

    /** Der Elementname ohne Präfix — für Fehlermeldungen und Tests. */
    static bausteinName = name;

    #werte = structuredClone(standard);
    #geplant = false;
    #verbunden = false;

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      for (const e of eigenschaften) {
        const attr = this.getAttribute(e.toLowerCase());
        if (attr !== null) this.#werte[e] = ausAttribut(attr, standard[e]);
      }
      this.#verbunden = true;
      this.#zeichnen();
    }

    disconnectedCallback() {
      this.#verbunden = false;
    }

    attributeChangedCallback(attr, alt, neu) {
      if (alt === neu) return;
      const e = eigenschaften.find((k) => k.toLowerCase() === attr);
      if (!e) return;
      this.#werte[e] = ausAttribut(neu, standard[e]);
      this.#planen();
    }

    /**
     * Mehrere Zuweisungen hintereinander (el.rows = …; el.title = …) sollen
     * einmal zeichnen, nicht dreimal. Deshalb über einen Microtask sammeln.
     */
    #planen() {
      if (this.#geplant || !this.#verbunden) return;
      this.#geplant = true;
      queueMicrotask(() => {
        this.#geplant = false;
        this.#zeichnen();
      });
    }

    #zeichnen() {
      if (!this.shadowRoot) return;
      this.shadowRoot.replaceChildren();

      const stilElement = document.createElement('style');
      stilElement.textContent = `${themaCss()}\n${GRUNDSTIL}\n${stil}`;
      this.shadowRoot.append(stilElement);

      const fragment = document.createDocumentFragment();
      aufbauen(fragment, this.#werte, this);
      this.shadowRoot.append(fragment);
    }

    /** Ein Ereignis nach außen geben. Blubbert und tritt durch die Shadow-Grenze. */
    melden(typ, detail) {
      this.dispatchEvent(
        new CustomEvent(typ, { detail, bubbles: true, composed: true }),
      );
    }

    /** Alle Eigenschaften auf einmal setzen. */
    set props(werte) {
      Object.assign(this.#werte, werte);
      this.#planen();
    }

    get props() {
      return { ...this.#werte };
    }

    /** Von außen neu zeichnen lassen — für Fälle, die wir nicht beobachten. */
    aktualisieren() {
      this.#planen();
    }

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

/** Regeln, die jeder Baustein braucht. */
const GRUNDSTIL = `
:host {
  display: block;
  font-family: var(--tba3-_schrift);
  font-size: var(--tba3-_schrift-groesse);
  color: var(--tba3-_farbe-text);
  background: var(--tba3-_farbe-grund);
}
:host([hidden]) { display: none; }
* { box-sizing: border-box; }
figure { margin: 0; }
figcaption {
  font-size: 1.15em;
  font-weight: 600;
  margin-bottom: calc(var(--tba3-_abstand) * 1.5);
}
.gedaempft { color: var(--tba3-_farbe-text-gedaempft); font-weight: 400; }
.scroll { overflow-x: auto; }
.scroll svg { display: block; }
:where(button, [tabindex]):focus-visible {
  outline: 2px solid var(--tba3-_farbe-fokus);
  outline-offset: 2px;
}
`;

export default elementKlasse;
