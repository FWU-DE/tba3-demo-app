// Demoanwendung und Katalog ohne JavaScript.
//
// Beide sind Single-Page-Apps: ihr HTML enthält einen leeren Container, alles
// Weitere zeichnet das Skript. Wer die Seite liest statt sie auszuführen — ein
// Agent, ein Suchindex, ein Sprachmodell hinter einem Abruf —, fand dort bisher
// rund 400 bzw. 800 Zeichen. Der Build schreibt deshalb in den Container, was
// die App zeigt und wo es weitergeht: die Reiter bzw. Ansichten mit ihren
// Adressen, die Endpunkte, die Dokumente als Markdown, die Daten als JSON.
//
// React und Vue ersetzen den Inhalt des Containers beim Start. Damit er in der
// Zwischenzeit nicht aufblitzt, ist er nur ohne JavaScript sichtbar; im HTML
// steht er trotzdem, und genau dort lesen Werkzeuge ihn.
//
// Die Texte kommen aus denselben Wörterbüchern wie die Apps (Reiter,
// Komponenten). Wer einen Reiter oder eine Ansicht hinzufügt, muss hier
// nichts nachtragen.

import { TEXTE as DEMO } from '../apps/demo/src/i18n/texte.js';
import { TEXTE as KATALOG } from '../apps/katalog/src/i18n/texte.js';
import { KOMPONENTEN } from '../apps/katalog/src/komponenten.js';

const schuetze = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Die Reiter der Demoanwendung mit dem Endpunkt, den sie abfragen. */
export const REITER = [
  ['competence', '/{groups|schools|states}/{id}/competence-levels'],
  ['delta', '/groups/{id}, /schools/{id}, /states/{id} → …/competence-levels'],
  ['items', '/{groups|schools|states}/{id}/items'],
  ['aggregations', '/{groups|schools|states}/{id}/aggregations?aggregation=competence|gender'],
  ['students', '/groups/{id}/competence-levels?type=students'],
  ['materials', '/materials'],
  ['elemente', '/gemeinsam/konsortium.json'],
  ['help', null],
];

const WEITER = {
  de: [
    ['/dokumentation', 'Dokumentation (jede Seite auch als Markdown, z. B. /dokumentation/konzepte.md)'],
    ['/schnittstelle/tba3-spec.yml', 'OpenAPI-Spezifikation der Auswertungsschnittstelle (YAML; englisch: tba3-spec.en.yml)'],
    ['/schnittstelle/material-spec.yml', 'OpenAPI-Entwurf der Materialschnittstelle (YAML; englisch: material-spec.en.yml)'],
    ['/gemeinsam/konsortium.json', 'Rückmeldungen und Baustein-Katalog des Konsortiums als JSON'],
    ['/groups/3a-deutsch/competence-levels', 'Beispielabfrage gegen den Mock'],
  ],
  en: [
    ['/dokumentation', 'Documentation (every page also as Markdown, e.g. /dokumentation/konzepte.en.md)'],
    ['/schnittstelle/tba3-spec.en.yml', 'OpenAPI specification of the reporting API (YAML; German: tba3-spec.yml)'],
    ['/schnittstelle/material-spec.en.yml', 'OpenAPI draft of the material API (YAML; German: material-spec.yml)'],
    ['/gemeinsam/konsortium.json', 'Reports and building-block catalogue of the consortium as JSON'],
    ['/groups/3a-deutsch/competence-levels', 'Sample request against the mock'],
  ],
};

const STIL = `<style>
  /* Nur ohne JavaScript sichtbar: mit Skript ersetzt die App den Inhalt, bevor
     jemand ihn sähe. Im HTML steht er in beiden Fällen. */
  .ohne-js { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
</style>
<noscript><style>.ohne-js { position: static; width: auto; height: auto; clip: auto; max-width: 760px; margin: 24px auto; padding: 0 20px; font: 16px/1.5 system-ui, sans-serif; }</style></noscript>`;

const liste = (eintraege) => `<ul>\n${eintraege.map((e) => `      <li>${e}</li>`).join('\n')}\n    </ul>`;
const verweis = (href, text) => `<a href="${schuetze(href)}">${schuetze(text)}</a>`;

function abschnitt(sprache, { titel, einleitung, punkte, punkteTitel }) {
  return `  <section lang="${sprache}">
    <h1>${schuetze(titel)}</h1>
    <p>${schuetze(einleitung)}</p>
    <h2>${schuetze(punkteTitel)}</h2>
    ${liste(punkte)}
    <h2>${sprache === 'de' ? 'Weiter' : 'More'}</h2>
    ${liste(WEITER[sprache].map(([href, text]) => verweis(href, text)))}
  </section>`;
}

export function demo() {
  const teile = ['de', 'en'].map((sprache) => abschnitt(sprache, {
    titel: sprache === 'de' ? 'TBA3 Demoanwendung' : 'TBA3 demo application',
    einleitung: sprache === 'de'
      ? 'Eine technische Demonstration, was die Auswertungsschnittstelle der Vergleichsarbeiten (VERA) ermöglicht: Ergebnisse auf Ebene von Lerngruppe, Schule und Land, mit Beispieldaten aus dem eigenen Mock. Keine nutzervalidierte Rückmeldung. Die Anwendung braucht JavaScript; jeder Reiter ist über seine Adresse direkt erreichbar.'
      : 'A technical demonstration of what the reporting API of the comparative tests (VERA) makes possible: results for learning group, school and state, with sample data from our own mock. Not a user-validated report. The application needs JavaScript; every tab can be opened directly by its address.',
    punkteTitel: sprache === 'de' ? 'Reiter' : 'Tabs',
    punkte: REITER.map(([id, endpunkt]) => `${verweis(`/demo/?tab=${id}${sprache === 'en' ? '&lang=en' : ''}`, DEMO.reiter[id][sprache])}${endpunkt ? ` — <code>${schuetze(endpunkt)}</code>` : ''}`),
  }));
  return `${STIL}\n<div class="ohne-js">\n${teile.join('\n')}\n</div>`;
}

export function katalog() {
  const teile = ['de', 'en'].map((sprache) => abschnitt(sprache, {
    titel: KATALOG.index.ueberschrift[sprache],
    einleitung: KATALOG.index.einleitung[sprache],
    punkteTitel: sprache === 'de' ? 'Ansichten' : 'Views',
    punkte: KOMPONENTEN.map((k) => {
      const texte = KATALOG.komponenten[k.name];
      return `${verweis(`/katalog/#${k.route}`, texte.titel[sprache])}: ${schuetze(texte.beschreibung[sprache])} <code>${schuetze(k.api)}</code>`;
    }),
  }));
  return `${STIL}\n<div class="ohne-js">\n${teile.join('\n')}\n</div>`;
}
