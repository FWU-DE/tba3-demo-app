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
//   - die Sprache: eingebaute Texte folgen dem `lang` des Dokuments
//
// Was der Baustein selbst tut: `aufbauen(wurzel, zustand, el, t)`.

import { themaCss } from '../kern/thema.js';
import { VORGABEN, spracheAus, uebersetzer } from '../kern/texte.js';

// ── Sprache ────────────────────────────────────────────────────────────────
//
// Ein Baustein spricht die Sprache der Stelle, an der er steht: `lang` des
// nächsten Vorfahren, auch über eine Shadow-Grenze hinweg, sonst
// `<html lang>`. Die Bibliothek fragt keine Einstellung der Seite ab — sie
// wird als eigenes Paket ausgeliefert und kennt deren Sprachwahl nicht. `lang`
// ist das, was jede Seite ohnehin setzt.
//
// Ändert sich `lang` irgendwo im Dokument, zeichnet sich jeder Baustein neu,
// dessen Sprache sich dadurch ändert. Ein einziger Beobachter für alle.

/** Die Sprache an der Stelle von `el`: 'de' oder 'en'. */
export function spracheVon(el) {
  let knoten = el;
  while (knoten) {
    const traeger = knoten.closest?.('[lang]:not([lang=""])');
    if (traeger) return spracheAus(traeger.getAttribute('lang'));
    knoten = knoten.getRootNode?.()?.host ?? null;
  }
  return spracheAus(typeof document === 'undefined' ? '' : document.documentElement?.lang);
}

const PRUEFEN = Symbol('sprachePruefen');
const angemeldet = new Set();
let beobachter = null;

function anmelden(el) {
  angemeldet.add(el);
  if (beobachter || typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;
  beobachter = new MutationObserver(() => {
    for (const baustein of angemeldet) baustein[PRUEFEN]();
  });
  beobachter.observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang'], subtree: true,
  });
}

const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);

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
 * @param {(wurzel: DocumentFragment|HTMLElement, zustand: object, el: HTMLElement,
 *          t: (schluessel: string, werte?: object) => string) => void} bauplan.aufbauen
 *        `zustand.sprache` und `t` sind die Sprache an der Stelle des Elements;
 *        `t` liest die Texte aus kern/texte.js.
 */
export function elementKlasse({ name, standard, stil, aufbauen }) {
  const eigenschaften = Object.keys(standard);
  // Eigenschaften, deren Vorgabe als sichtbarer Text endet: `{ de, en }` je Schlüssel.
  const uebersetzt = Object.entries(VORGABEN[name] ?? {});

  return class BausteinElement extends HTMLElement {
    static get observedAttributes() {
      return [...eigenschaften.map((e) => e.toLowerCase()), 'lang'];
    }

    /** Der Elementname ohne Präfix — für Fehlermeldungen und Tests. */
    static bausteinName = name;

    #werte = structuredClone(standard);
    #geplant = false;
    #verbunden = false;
    #sprache = null;

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
      anmelden(this);
      this.#zeichnen();
    }

    disconnectedCallback() {
      this.#verbunden = false;
      angemeldet.delete(this);
    }

    attributeChangedCallback(attr, alt, neu) {
      if (alt === neu) return;
      if (attr === 'lang') {
        this[PRUEFEN]();
        return;
      }
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

    /** Neu zeichnen, wenn sich die Sprache an dieser Stelle geändert hat. */
    [PRUEFEN]() {
      if (this.#verbunden && spracheVon(this) !== this.#sprache) this.#planen();
    }

    /**
     * Die Werte, wie sie gezeichnet werden: Vorgaben in der Sprache des
     * Dokuments. Was ein Aufrufer gesetzt hat, bleibt stehen — nur ein Wert,
     * der einer Vorgabe in irgendeiner Sprache gleicht, gilt als Vorgabe. So
     * übersteht die Übersetzung auch die Hüllen, die beim Durchreichen jede
     * Eigenschaft setzen, und ein `el.props = { ...el.props, … }`.
     */
    #lokal(sprache) {
      const werte = { ...this.#werte };
      for (const [schluessel, fassungen] of uebersetzt) {
        if (Object.values(fassungen).some((f) => gleich(werte[schluessel], f))) {
          werte[schluessel] = structuredClone(fassungen[sprache] ?? fassungen.de);
        }
      }
      return werte;
    }

    /** Die Sprache, in der der Baustein gerade zeichnet: 'de' oder 'en'. */
    get sprache() {
      return spracheVon(this);
    }

    #zeichnen() {
      if (!this.shadowRoot) return;
      this.shadowRoot.replaceChildren();
      const sprache = spracheVon(this);
      this.#sprache = sprache;

      const stilElement = document.createElement('style');
      stilElement.textContent = `${themaCss()}\n${GRUNDSTIL}\n${stil}`;
      this.shadowRoot.append(stilElement);

      const fragment = document.createDocumentFragment();
      aufbauen(fragment, { ...this.#lokal(sprache), sprache }, this, uebersetzer(sprache));
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
      return this.#lokal(spracheVon(this));
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
/*
 * Ein Diagramm, das breiter ist als sein Platz, wurde bisher nur gescrollt.
 * Auf dem Telefon hieß das: von einem gestapelten Balken waren 42 Prozent zu
 * sehen — und ein abgeschnittener Stapelbalken sieht aus wie ein
 * vollständiger. Wer die Kompetenzstufen-Leiste überflog, las „Stufe I und II
 * beherrschen das Bild", also das Gegenteil der Daten. Das ist schlimmer als
 * unbequem.
 *
 * Deshalb skaliert das Bild herunter, statt abgeschnitten zu werden: die
 * Beschriftung wird klein, aber die Anteile stimmen. .scroll bleibt für die
 * Tabellen, die nicht skalieren können, ohne unlesbar zu werden.
 *
 * Eine Untergrenze stand hier kurz und war wirkungslos: min(100%, 420px)
 * kann den Wirt nie überschreiten, und ohne min(100%, …) käme das Scrollen
 * zurück, das gerade abgeschafft wurde. Eine echte Untergrenze bräuchte
 * responsive Geometrie — die Bausteine rechnen ihre Maße heute aus festen
 * Konstanten in MASSE.
 */
.scroll svg {
  display: block;
  max-width: 100%;
  height: auto;
}
:where(button, [tabindex]):focus-visible {
  outline: 2px solid var(--tba3-_farbe-fokus);
  outline-offset: 2px;
}
`;

export default elementKlasse;
