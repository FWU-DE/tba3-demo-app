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
 * @property {Text} anzeige      Klartext für die Tabelle
 * @property {string|null} baustein  Elementname ohne Präfix, oder null
 * @property {'umgezogen'|'offen'} stand
 * @property {Text} [hinweis]
 */

/**
 * Sichtbarer Text, in beiden Sprachen der Seite.
 * @typedef {{ de: string, en: string }} Text
 */

/** @type {Zuordnung[]} */
export const ZUORDNUNG = [
  // Aus den Rückmeldungen des Konsortiums herausgezogen — die einzigen drei,
  // die nicht aus der Schau gewachsen sind, sondern aus einer fremden
  // Anwendung. Siehe /dokumentation/bausteine-der-rueckmeldungen.
  {
    katalog: 'ContextRing',
    anzeige: { de: 'Kontextmerkmal als Ring', en: 'Context characteristic as a ring' },
    baustein: 'kontextmerkmal-ring',
    stand: 'umgezogen',
    hinweis: {
      de: 'Aus der Schulrückmeldung von indibit; die Kovariaten dafür führt die Schnittstelle bereits.',
      en: 'From the indibit school report; the API already provides the covariates for it.',
    },
  },
  {
    katalog: 'StandardAttainment',
    anzeige: { de: 'Standard-Erreichung', en: 'Standard attainment' },
    baustein: 'standard-erreichung',
    stand: 'umgezogen',
    hinweis: {
      de: 'Ebenfalls von indibit. Die große Zahl bringt ihre Aufschlüsselung mit, sonst führt sie in die Irre.',
      en: 'Also from indibit. The big number comes with its breakdown; without it, it would mislead.',
    },
  },
  {
    katalog: 'ReportSentences',
    anzeige: { de: 'Zeugnissätze', en: 'Report card sentences' },
    baustein: 'zeugnissaetze',
    stand: 'umgezogen',
    hinweis: {
      de: 'Aus der Messwiederholung des kompetenztest.de. Der einzige Baustein, dessen Ausgabe Text ist.',
      en: 'From the repeated measurement by kompetenztest.de. The only building block whose output is text.',
    },
  },
  {
    katalog: 'CompetenceLevels',
    anzeige: { de: 'Kompetenzstufen-Leiste', en: 'Competence level bar' },
    baustein: 'kompetenzstufen-leiste',
    stand: 'umgezogen',
  },
  {
    katalog: 'MeanComparison',
    anzeige: { de: 'Mittelwert-Vergleich', en: 'Mean comparison' },
    baustein: 'mittelwert-vergleich',
    stand: 'umgezogen',
  },
  {
    katalog: 'ItemExpectedActual',
    anzeige: { de: 'Erwartete und tatsächliche Lösungsquote', en: 'Expected and actual solution rate' },
    baustein: 'erwartet-tatsaechlich',
    stand: 'umgezogen',
  },
  {
    katalog: 'PercentileBand',
    anzeige: { de: 'Perzentilbänder', en: 'Percentile bands' },
    baustein: 'perzentilbaender',
    stand: 'umgezogen',
  },
  {
    katalog: 'ItemSolutionTable',
    anzeige: { de: 'Lösungshäufigkeiten je Aufgabe', en: 'Solution frequencies per item' },
    baustein: 'aufgaben-tabelle',
    stand: 'umgezogen',
    hinweis: {
      de: 'Eine Tabelle je Domäne; welche Ebene die Erwartung stellt — Schule oder Bundesland —, wählt die Ansicht.',
      en: 'One table per domain; the view chooses which level sets the expectation — school or state.',
    },
  },
  {
    katalog: 'StudentSolutionTable',
    anzeige: { de: 'Lösungen je Schüler:in', en: 'Solutions per student' },
    baustein: 'schueler-tabelle',
    stand: 'umgezogen',
    hinweis: {
      de: 'Die Auswahl hält die Ansicht, der Baustein meldet sie nur.',
      en: 'The view keeps the selection; the building block only reports it.',
    },
  },
  {
    katalog: 'CompetencyOverview',
    anzeige: { de: 'Übersichtskarten', en: 'Overview cards' },
    baustein: 'uebersichtskarten',
    stand: 'umgezogen',
    hinweis: {
      de: 'Aus zwei Karten wurden drei: die Verteilung und die beiden Aussagen dazu.',
      en: 'Two cards became three: the distribution and the two statements about it.',
    },
  },
  {
    katalog: 'StudentScatter',
    anzeige: { de: 'Streudiagramm der Schüler:innen', en: 'Scatter plot of students' },
    baustein: 'streudiagramm',
    stand: 'umgezogen',
    hinweis: {
      de: 'Ohne das K-Means-Clustering der alten Ansicht — Gruppen zu bilden ist Auswertung und gehört nicht in den Baustein.',
      en: 'Without the k-means clustering of the old view — forming groups is analysis and does not belong in the building block.',
    },
  },
  {
    katalog: 'BistaDistribution',
    anzeige: { de: 'BISTA-Verteilung', en: 'BISTA distribution' },
    baustein: 'bista-verteilung',
    stand: 'umgezogen',
    hinweis: {
      de: 'Gleiche Werte stapeln sich, statt zufällig zu streuen; die Schwellen der Kompetenzstufen kommen aus der Ansicht.',
      en: 'Equal values stack instead of scattering at random; the view supplies the competence level thresholds.',
    },
  },
];

/** Bausteine ohne Katalog-Ansicht — die Bibliothek ist nicht nur eine Teilmenge. */
export const NUR_BAUSTEIN = [
  {
    baustein: 'lernstands-verlauf',
    anzeige: { de: 'Lernstands-Verlauf', en: 'Attainment trend' },
    grund: {
      de: 'Mehrere Erhebungen nebeneinander — der Katalog zeigt immer eine. Wer den Baustein einbaut, hat die Zeitreihe meist schon.',
      en: 'Several assessments side by side — the catalogue always shows one. Whoever builds this block in usually has the time series already.',
    },
  },
  {
    baustein: 'aufgaben-heatmap',
    anzeige: { de: 'Aufgaben-Heatmap', en: 'Item heatmap' },
    grund: {
      de: 'Aufgaben gegen Lerngruppen: die Sicht der Schulleitung, nicht die der Lehrkraft — und deshalb keine Ansicht der Schau.',
      en: 'Items against learning groups: the view of school leadership, not of the teacher — and therefore not a view of the catalogue.',
    },
  },
  {
    baustein: 'kennzahl-kachel',
    anzeige: { de: 'Kennzahl-Kachel', en: 'Key figure tile' },
    grund: {
      de: 'Eine einzelne Zahl mit Vergleich und kleinem Verlauf. Zu klein für eine eigene Ansicht, zu oft gebraucht, um sie wegzulassen.',
      en: 'A single number with a comparison and a small trend. Too small for a view of its own, needed too often to leave out.',
    },
  },
  {
    baustein: 'lernverlauf-figuren',
    anzeige: { de: 'Lernverlauf als Figuren', en: 'Learning progress as figures' },
    grund: {
      de: 'Braucht mehrere Erhebungen derselben Personen; die Schnittstelle liefert eine. Aus der Messwiederholung des kompetenztest.de, wo die Figuren Vögel sind.',
      en: 'Needs several assessments of the same people; the API delivers one. From the repeated measurement by kompetenztest.de, where the figures are birds.',
    },
  },
  {
    baustein: 'selbsteinschaetzung',
    anzeige: { de: 'Selbsteinschätzung gegen Ergebnis', en: 'Self-assessment versus result' },
    grund: {
      de: 'Die Selbsteinschätzung wird erhoben, nicht gemessen — sie steht in keiner Antwort der Schnittstelle. Aus dem Lernstand-Barometer.',
      en: 'Self-assessment is collected, not measured — it is in no API response. From the Lernstand-Barometer.',
    },
  },
  {
    baustein: 'glossar',
    anzeige: { de: 'Glossar mit Suche', en: 'Glossary with search' },
    grund: {
      de: 'Datenunabhängig: die Begriffe kommen aus der Seite, nicht aus der Auswertung. Aus den drei Glossaren von zepf.',
      en: 'Independent of data: the terms come from the page, not from the analysis. From the three glossaries by zepf.',
    },
  },
  {
    baustein: 'merkmal-gradient',
    anzeige: { de: 'Lösungsquote nach Merkmal', en: 'Solution rate by characteristic' },
    grund: {
      de: 'Vergleicht Ausprägungen eines Hintergrundmerkmals über mehrere Ebenen — die Schau zeigt je Ansicht eine Ebene. Aus den Rückmeldungen von indibit (Erhebung 14.10.2026).',
      en: 'Compares the values of a background characteristic across several levels — the catalogue shows one level per view. From the indibit reports (survey of 14 Oct 2026).',
    },
  },
  {
    baustein: 'abweichung-je-gruppe',
    anzeige: { de: 'Abweichung je Lerngruppe', en: 'Deviation per learning group' },
    grund: {
      de: 'Braucht alle Lerngruppen einer Schule zugleich, die Schau zeigt eine. Aus der Schulleitungsrückmeldung des zepf (Erhebung 14.10.2026).',
      en: 'Needs all learning groups of a school at once; the catalogue shows one. From the zepf school leadership report (survey of 14 Oct 2026).',
    },
  },
  {
    baustein: 'gruppen-pyramide',
    anzeige: { de: 'Zwei Gruppen gespiegelt', en: 'Two groups mirrored' },
    grund: {
      de: 'Stellt zwei Lerngruppen gegeneinander, die Schau zeigt eine. Aus der Schulleitungsrückmeldung des zepf (Erhebung 14.10.2026).',
      en: 'Sets two learning groups against each other; the catalogue shows one. From the zepf school leadership report (survey of 14 Oct 2026).',
    },
  },
  {
    baustein: 'netzdiagramm',
    anzeige: { de: 'Netzdiagramm der Teilkompetenzen', en: 'Radar chart of sub-competences' },
    grund: {
      de: 'Das Profil einer Person über die Teilbereiche — die Schau ordnet nach Aufgaben und Stufen, nicht nach Personen. Aus der Englisch-Rückmeldung des zepf (Erhebung 14.10.2026).',
      en: 'The profile of one person across the domains — the catalogue is organised by items and levels, not by people. From the zepf English report (survey of 14 Oct 2026).',
    },
  },
];

export const ZAHLEN = {
  get umgezogen() {
    return ZUORDNUNG.filter((z) => z.stand === 'umgezogen').length;
  },
  get gesamt() {
    return ZUORDNUNG.length;
  },
};

export default ZUORDNUNG;
