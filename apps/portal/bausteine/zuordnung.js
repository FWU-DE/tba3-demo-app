// Wie Katalog und Bausteine zusammenhängen.
//
// Zwei Bereiche zeigen Visualisierungen, und das verwirrt zu Recht:
//
//   /katalog    — die Schau: jede Visualisierung mit echten Daten aus der
//                 Schnittstelle, mit Einsatzzweck, Endpunkt und Quelltext.
//                 Zum Anschauen und Verstehen.
//   /bausteine  — die Bibliothek: dieselben Visualisierungen als Paket zum
//                 Mitnehmen, in drei Fassungen und themebar. Zum Einbauen.
//
// Der Katalog ist älter. Seine Ansichten wandern nach und nach auf die
// Bausteine um — eine umgezogene Ansicht zeigt dann denselben Quelltext, den
// auch ein fremdes Projekt bekommt. Diese Datei hält fest, wo das schon so ist.
//
// `apps/portal/bausteine/zuordnung.test.mjs` prüft die Tabelle gegen die
// Wirklichkeit: importiert eine Ansicht aus `@tba3/bausteine/vue`, muss sie
// hier als umgezogen stehen — und umgekehrt. Sonst veraltet die Übersicht
// still, und das ist schlimmer als keine.

/**
 * @typedef {Object} Zuordnung
 * @property {string} katalog    Name der Ansicht in apps/katalog/src/views (ohne "View")
 * @property {string} anzeige    Klartext für die Tabelle
 * @property {string|null} baustein  Elementname ohne Präfix, oder null
 * @property {'umgezogen'|'offen'} stand
 * @property {string} [hinweis]
 */

/** @type {Zuordnung[]} */
export const ZUORDNUNG = [
  {
    katalog: 'CompetenceLevels',
    anzeige: 'Kompetenzstufen-Leiste',
    baustein: 'kompetenzstufen-leiste',
    stand: 'umgezogen',
  },
  {
    katalog: 'MeanComparison',
    anzeige: 'Mittelwert-Vergleich',
    baustein: 'mittelwert-vergleich',
    stand: 'umgezogen',
  },
  {
    katalog: 'ItemExpectedActual',
    anzeige: 'Erwartete und tatsächliche Lösungsquote',
    baustein: 'erwartet-tatsaechlich',
    stand: 'umgezogen',
  },
  {
    katalog: 'PercentileBand',
    anzeige: 'Perzentilbänder',
    baustein: 'perzentilbaender',
    stand: 'umgezogen',
  },
  {
    katalog: 'ItemSolutionTable',
    anzeige: 'Lösungshäufigkeiten je Aufgabe',
    baustein: 'aufgaben-tabelle',
    stand: 'offen',
    hinweis:
      'Der Baustein steht bereits und kann sortieren; die Katalog-Ansicht nutzt ihn noch nicht.',
  },
  {
    katalog: 'StudentSolutionTable',
    anzeige: 'Lösungen je Schüler:in',
    baustein: null,
    stand: 'offen',
    hinweis: 'Tabelle mit Auswahl — braucht noch eine Auswahl-Schnittstelle im Baustein.',
  },
  {
    katalog: 'CompetencyOverview',
    anzeige: 'Übersichtskarten',
    baustein: null,
    stand: 'offen',
    hinweis: 'Karten statt Diagramm; aufklappbare Details.',
  },
  {
    katalog: 'StudentScatter',
    anzeige: 'Streudiagramm der Schüler:innen',
    baustein: null,
    stand: 'offen',
    hinweis: 'Tooltip folgt dem Zeiger — braucht eine Überlagerung außerhalb des SVG.',
  },
  {
    katalog: 'BistaDistribution',
    anzeige: 'BISTA-Verteilung',
    baustein: null,
    stand: 'offen',
    hinweis: 'Avatare mit Tooltip, wie beim Streudiagramm.',
  },
];

/** Bausteine ohne Katalog-Ansicht — die Bibliothek ist nicht nur eine Teilmenge. */
export const NUR_BAUSTEIN = [];

export const ZAHLEN = {
  get umgezogen() {
    return ZUORDNUNG.filter((z) => z.stand === 'umgezogen').length;
  },
  get gesamt() {
    return ZUORDNUNG.length;
  },
};

export default ZUORDNUNG;
