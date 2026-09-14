// Gemeinsame Navigationsleiste über allen Bereichen (Portal, Demoanwendung,
// Komponentenbibliothek, Rückmeldungsbeispiele, Schnittstelle).
//
// Bewusst ein Custom Element mit Shadow DOM statt einer Komponente je Stack:
// die Bereiche laufen auf React, Vue und statischem HTML. Das Element steht im
// HTML-Dokument, nicht im Framework-Baum — so muss weder React noch Vue davon
// wissen, und das Shadow DOM hält Tailwind und PrimeVue aus den Stilen heraus.
//
//   <tba3-leiste aktiv="demo"></tba3-leiste>
//
// `aktiv` markiert den aktuellen Bereich:
// portal | demo | katalog | beispiele | dokumentation | schnittstelle
//
// Hier sitzt auch die Sprachwahl der ganzen Seite (siehe sprache.js): sie gilt
// für alle Bereiche, weil die Leiste in allen steht.

import { SPRACHEN, anwenden, beiSprachwechsel, setzeSprache, sprache, text } from './sprache.js';

const BEREICHE = [
  { id: 'portal',        text: { de: 'Übersicht',     en: 'Overview' },   pfad: '/' },
  { id: 'demo',          text: { de: 'Demoanwendung', en: 'Demo app' },   pfad: '/demo' },
  { id: 'katalog',       text: { de: 'Komponenten',   en: 'Components' }, pfad: '/katalog' },
  { id: 'beispiele',     text: { de: 'Rückmeldungen', en: 'Reports' },    pfad: '/beispiele' },
  { id: 'dokumentation', text: { de: 'Dokumentation', en: 'Docs' },       pfad: '/dokumentation' },
  { id: 'schnittstelle', text: { de: 'Schnittstelle', en: 'API' },        pfad: '/schnittstelle' },
];

const BESCHRIFTUNG = {
  bereiche: { de: 'Bereiche', en: 'Sections' },
  quelle: { de: 'Quelltext', en: 'Source' },
  sprache: { de: 'Sprache', en: 'Language' },
};

const STIL = `
  :host {
    position: sticky;
    top: 0;
    z-index: 9000;
    display: block;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    /* Eigener Grund, damit darunterliegende Inhalte beim Scrollen nicht durchscheinen */
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #e2e8f0;
  }

  .leiste {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    height: 48px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .marke {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: #0f172a;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: -0.01em;
    flex-shrink: 0;
  }
  .zeichen {
    width: 24px;
    height: 24px;
    border-radius: 7px;
    background: #2563eb;
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 10px;
    font-weight: 800;
  }

  nav {
    display: flex;
    align-items: center;
    gap: 2px;
    /* Auf schmalen Schirmen scrollt die Navigation, statt zu brechen */
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  nav::-webkit-scrollbar { display: none; }

  nav a {
    display: block;
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 13.5px;
    color: #64748b;
    text-decoration: none;
    white-space: nowrap;
    transition: color .12s, background-color .12s;
  }
  nav a:hover { color: #2563eb; background: #f1f5f9; }
  nav a[aria-current="page"] {
    color: #1d4ed8;
    background: #eff6ff;
    font-weight: 600;
  }

  .rechts {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .quelle {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12.5px;
    color: #94a3b8;
    text-decoration: none;
  }
  .quelle:hover { color: #2563eb; }
  .quelle svg { width: 14px; height: 14px; }

  .sprachen {
    display: flex;
    align-items: center;
    gap: 1px;
    padding: 2px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
  }
  .sprachen button {
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .02em;
    color: #64748b;
    background: none;
    border: none;
    border-radius: 6px;
    padding: 3px 8px;
    cursor: pointer;
  }
  .sprachen button:hover { color: #2563eb; }
  .sprachen button[aria-pressed="true"] {
    color: #1d4ed8;
    background: #fff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, .08);
  }

  /* Auf Telefonen weicht der GitHub-Verweis, Bereiche und Sprachwahl zählen mehr */
  @media (max-width: 640px) {
    .leiste { padding: 0 12px; gap: 10px; }
    .quelle span { display: none; }
    .sprachen button { padding: 3px 6px; }
  }
`;

// Pfad am Stück: beim Umbrechen verschmelzen sonst Koordinaten zu falschen Zahlen.
const GITHUB_PFAD = 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z';

class Tba3Leiste extends HTMLElement {
  static observedAttributes = ['aktiv'];

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    // Die Leiste steht in jedem Bereich — sie wendet die Sprache an, damit auch
    // rein statische Seiten nichts weiter einbinden müssen.
    anwenden();
    this.#abmelden = beiSprachwechsel(() => this.#zeichnen());
    this.#zeichnen();
  }

  disconnectedCallback() {
    this.#abmelden?.();
    this.#abmelden = null;
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.#zeichnen();
  }

  #abmelden = null;

  #zeichnen() {
    const aktiv = this.getAttribute('aktiv') ?? '';
    const gewaehlt = sprache();
    const eintraege = BEREICHE.map((b) => {
      const markiert = b.id === aktiv ? ' aria-current="page"' : '';
      return `<a href="${b.pfad}"${markiert}>${text(b.text, gewaehlt)}</a>`;
    }).join('');
    const schalter = Object.keys(SPRACHEN).map((kuerzel) => `
      <button type="button" data-sprache="${kuerzel}" lang="${kuerzel}"
              aria-pressed="${kuerzel === gewaehlt}" title="${SPRACHEN[kuerzel]}">
        ${kuerzel.toUpperCase()}
      </button>`).join('');

    this.shadowRoot.innerHTML = `
      <style>${STIL}</style>
      <div class="leiste">
        <a class="marke" href="/">
          <span class="zeichen" aria-hidden="true">T3</span>
          <span>TBA3</span>
        </a>
        <nav aria-label="${text(BESCHRIFTUNG.bereiche, gewaehlt)}">${eintraege}</nav>
        <div class="rechts">
          <a class="quelle" href="https://github.com/FWU-DE/tba3-demo-app" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${GITHUB_PFAD}"/></svg>
            <span>${text(BESCHRIFTUNG.quelle, gewaehlt)}</span>
          </a>
          <div class="sprachen" role="group" aria-label="${text(BESCHRIFTUNG.sprache, gewaehlt)}">${schalter}</div>
        </div>
      </div>
    `;

    for (const knopf of this.shadowRoot.querySelectorAll('[data-sprache]')) {
      knopf.addEventListener('click', () => setzeSprache(knopf.dataset.sprache));
    }
  }
}

if (!customElements.get('tba3-leiste')) {
  customElements.define('tba3-leiste', Tba3Leiste);
}
