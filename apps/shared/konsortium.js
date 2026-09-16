// Die Rückmeldungen des TBA-III-Konsortiums und die Bausteine, aus denen sie
// bestehen.
//
// ► Quelle ist der Sachbericht der Abschlusssitzung der Steuergruppe vom
//   15.09.2026, in dem die vier entwickelnden Einrichtungen zum ersten Mal
//   Repositorien, Demoadressen und den Aufbau ihrer Rückmeldungen
//   zusammengetragen haben. Was hier steht, steht dort — nichts ist ergänzt,
//   ausgedacht oder aus dem Augenschein einer Demo abgelesen.
//
// Zwei Listen, ein Zusammenhang:
//
//   RUECKMELDUNGEN  Was es gibt: zehn Anwendungen in vier Einrichtungen, je mit
//                   Demo-, Quelltext- und Dokumentationsverweis.
//   BAUSTEINE       Woraus sie bestehen: der Katalog, technologieagnostisch.
//
// Die Rückmeldungen sind in fünf verschiedenen Technologien gebaut — Vue 3 mit
// Quasar, Vue 3 mit Pinia, React 19 mit Material-UI, Angular 21 mit ECharts und
// Vanilla JavaScript mit Tabulator und D3. Nachnutzbar ist deshalb nicht der
// Code, sondern der Zuschnitt: welche Darstellung welche fachliche Frage
// beantwortet und woher sie ihre Daten nimmt. Genau das hält der Katalog fest.
//
// **Jede Zuordnung nennt ihren Beleg.** `beleg: 'sachbericht'` heißt: die
// Einrichtung hat den Baustein selbst beschrieben. `beleg: 'artefakt'` heißt:
// er wurde in der laufenden Demo oder im offenen Quelltext gefunden — die
// Sachberichte sind Zusammenfassungen und nennen längst nicht alles, was
// gebaut wurde. Was weder das eine noch das andere hat, steht hier nicht.
//
// Die Erhebung am Artefakt lief am 15.09.2026: alle zehn Demos im Browser
// geöffnet, dazu die vier offenen Repositorien flach geklont und ihre
// Komponentenverzeichnisse gelesen (`report-messwiederholung`,
// `lernstand-barometer`, `kompetenzstand-mathematik`, `zepf-RPTU/TBA3`). Das
// Repositorium von indibit war noch nicht veröffentlicht; dort ist die Quelle
// die laufende Anwendung, deren Angular-Komponenten im DOM stehen.
//
// Alle sichtbaren Texte stehen als `{ de, en }` und werden von der jeweiligen
// Seite über `text()` aus /gemeinsam/sprache.js aufgelöst. Diese Datei
// importiert davon bewusst nichts: so bleibt sie reine Daten und Logik, läuft
// unverändert im Node-Test und lässt sich sowohl über /gemeinsam/konsortium.js
// im Browser als auch als Modul in der Demoanwendung einbinden.

export const QUELLE = {
  titel: { de: 'TBA III — Steuergruppensitzung', en: 'TBA III — steering group meeting' },
  datum: '2026-09-15',
  beleg: {
    de: 'Sachberichte der vier entwickelnden Einrichtungen zur Abschlusssitzung des Konsortiums',
    en: 'Progress reports of the four developing institutions for the consortium’s closing meeting',
  },
};

// ── Vokabular ──────────────────────────────────────────────────────────────

export const EINRICHTUNGEN = {
  kt: { de: 'kompetenztest.de (FSU Jena)', en: 'kompetenztest.de (FSU Jena)' },
  indibit: { de: 'indibit', en: 'indibit' },
  isq: { de: 'ISQ Berlin', en: 'ISQ Berlin' },
  zepf: { de: 'zepf (RPTU)', en: 'zepf (RPTU)' },
};

export const FAECHER = {
  DE: { de: 'Deutsch', en: 'German' },
  MA: { de: 'Mathematik', en: 'Mathematics' },
  EN: { de: 'Englisch', en: 'English' },
  FR: { de: 'Französisch', en: 'French' },
};

export const STUFEN = {
  V3: { de: 'Klasse 3', en: 'Grade 3' },
  V8: { de: 'Klasse 8', en: 'Grade 8' },
};

// Eltern kommen nicht vor: keine der zehn Rückmeldungen richtet sich an sie.
// Die Fachkonferenz dagegen schon — das Lernstand-Barometer nennt sie neben
// Fach- und Klassenlehrkräften ausdrücklich als eigene Adressatin.
export const ZIELGRUPPEN = {
  lehrkraft: { de: 'Lehrkraft', en: 'Teacher' },
  fachkonferenz: { de: 'Fachkonferenz', en: 'Subject department' },
  schulleitung: { de: 'Schulleitung', en: 'School leadership' },
  schulaufsicht: { de: 'Schulaufsicht', en: 'School supervision' },
  lernende: { de: 'Schüler:in', en: 'Student' },
};

/**
 * Reihenfolge der Filter auf der Seite.
 *
 * `param` ist der Name in der Adresszeile (`?fach=DE`), `feld` der Name in den
 * Daten. Sie gehen auseinander, weil ein Eintrag mehrere Fächer haben kann und
 * das Feld deshalb `faecher` heißt — in der Adresse stünde „faecher=DE" aber
 * nur im Weg.
 *
 * `offen: true` heißt: eine leere Liste bedeutet „gilt für alles", nicht „gilt
 * für nichts". Die Schulrückmeldung von indibit ist fachunabhängig — „das Fach
 * ist Filter, keine inhaltliche Festlegung" —, und sie darf nicht verschwinden,
 * sobald jemand nach Deutsch filtert.
 */
export const FILTER = [
  { param: 'einrichtung', feld: 'einrichtung', text: { de: 'Einrichtung', en: 'Institution' }, werte: EINRICHTUNGEN },
  { param: 'fach', feld: 'faecher', offen: true, text: { de: 'Fach', en: 'Subject' }, werte: FAECHER },
  { param: 'stufe', feld: 'stufen', offen: true, text: { de: 'Klassenstufe', en: 'Grade' }, werte: STUFEN },
  { param: 'zielgruppe', feld: 'zielgruppen', text: { de: 'Zielgruppe', en: 'Audience' }, werte: ZIELGRUPPEN },
];

// ── Die zehn Rückmeldungen ─────────────────────────────────────────────────

export const RUECKMELDUNGEN = [
  {
    id: 'kt-d3-messwiederholung',
    bild: { datei: '/beispiele/bilder/kt-d3-messwiederholung.jpg', alt: 'Vögel auf dem Lernverlauf, drei Messzeitpunkte nebeneinander' },
    einrichtung: 'kt',
    titel: {
      de: 'Messwiederholung Deutsch, Klasse 3',
      en: 'Repeated measurement, German, grade 3',
    },
    beschreibung: {
      de: 'Ansichten für Lehrkräfte und für Schüler:innen: die Lernentwicklung einzelner Schüler:innen als Figuren auf der Skala, die Entwicklung der ganzen Klasse über mehrere Messzeitpunkte hinweg — und von dort unmittelbare Anknüpfungspunkte an Fördermaterialien.',
      en: 'Views for teachers and for students: the learning progress of individual students as figures on a scale, the progress of the whole class across several measurement points — and from there direct links into support material.',
    },
    faecher: ['DE'],
    stufen: ['V3'],
    zielgruppen: ['lehrkraft', 'lernende'],
    demo: 'https://development.tba.i.c.netzkolchose.de/',
    code: 'https://github.com/kompetenztestde/report-messwiederholung',
    doku: null,
    hinweis: {
      de: 'KT-internes Hosting in Bearbeitung. Entstanden in Zusammenarbeit mit TBA II.',
      en: 'KT-internal hosting in progress. Built in cooperation with TBA II.',
    },
    technik: {
      de: 'Frontend Vue 3 mit der Komponentenbibliothek Quasar, Backend Django. Entwicklung: netzkolchose.de UG (Jena).',
      en: 'Vue 3 front end with the Quasar component library, Django back end. Development: netzkolchose.de UG (Jena).',
    },
    bausteine: [
      'positionsskala-mit-zonen',
      'verlauf-ueber-messzeitpunkte',
      'einzelbericht',
      'materialanbindung',
      'rollensichten',
          'lernverlauf-figuren', // BirdsResultsView.vue, Feather.vue, BirdColorPicker.vue
      'zeugnissaetze', // ReportCardHelper.vue, Reiter „Zeugnissätze“
      'pseudonymisierung', // Umschalter „Namen / Codes“ in der Demo
      'personen-tabelle', // ResultsTable.vue, Reiter „Tabelle“
    ],
  },
  {
    id: 'kt-d8-lernstand-barometer',
    bild: { datei: '/beispiele/bilder/kt-d8-lernstand-barometer.jpg', alt: 'Startseite des Lernstand-Barometers' },
    einrichtung: 'kt',
    titel: {
      de: 'Lernstand-Barometer Deutsch, Klasse 8',
      en: 'Learning status barometer, German, grade 8',
    },
    beschreibung: {
      de: 'Eine Rückmeldung für vier Adressatinnen zugleich — Fachlehrkraft, Klassenlehrkraft, Fachkonferenz und Schüler:in. Die Ansichten sind komponentenbasiert organisiert und lassen sich unabhängig voneinander einsetzen; ein optionales Backend macht daraus PDF-Dokumente.',
      en: 'One report for four audiences at once — subject teacher, class teacher, subject department and student. The views are organised as components and can be used independently of one another; an optional back end turns them into PDF documents.',
    },
    faecher: ['DE'],
    stufen: ['V8'],
    zielgruppen: ['lehrkraft', 'fachkonferenz', 'lernende'],
    demo: 'https://lernstand-barometer.ktest.de/login',
    code: 'https://github.com/kompetenztestde/lernstand-barometer',
    doku: null,
    hinweis: null,
    technik: {
      de: 'Vue 3 mit Composition API und TypeScript, gebaut mit Vite; optionales Backend mit Express.js und Puppeteer für die PDF-Ausgabe. Entwicklung: Uni Jena, UX/UI: Potter Web Development (Erfurt).',
      en: 'Vue 3 with the Composition API and TypeScript, built with Vite; optional back end with Express.js and Puppeteer for PDF output. Development: Uni Jena, UX/UI: Potter Web Development (Erfurt).',
    },
    bausteine: [
      'rollensichten',
      'einzelbericht',
      'bericht-ausgeben',
      'selbsteinschaetzung', // SelfEvaluationPage.vue und vier Druckansichten dazu
      'aufgabenbrowser', // TaskBrowserPage.vue
      'uebersichtskarten', // ResultDonutsSection.vue, FeedbackCircleD3.vue
      'personen-tabelle', // TableauCard.vue, TableauGroupRow.vue
    ],
  },
  {
    id: 'kt-m8-kompetenzstand',
    bild: { datei: '/beispiele/bilder/kt-m8-kompetenzstand.jpg', alt: 'Einstieg in den siebenstufigen Schüler:innenbericht' },
    einrichtung: 'kt',
    titel: {
      de: 'Kompetenzstand Mathematik, Klasse 8',
      en: 'Competence status, mathematics, grade 8',
    },
    beschreibung: {
      de: 'Der Schüler:innenbericht als siebenstufiger, sequenzieller Ablauf statt als Übersicht: Wer ihn öffnet, wird geführt und liest die Ergebnisse in einer Reihenfolge, die jemand gewählt hat. Die Ansichten stehen auf einer gemeinsamen Grundstruktur aus wiederverwendbaren Basiskomponenten.',
      en: 'The student report as a seven-step sequence rather than a dashboard: whoever opens it is guided and reads the results in an order someone chose. The views rest on a shared foundation of reusable base components.',
    },
    faecher: ['MA'],
    stufen: ['V8'],
    zielgruppen: ['lernende'],
    demo: 'https://kompetenztestde.github.io/kompetenzstand-mathematik',
    code: 'https://github.com/kompetenztestde/kompetenzstand-mathematik',
    doku: null,
    hinweis: null,
    technik: {
      de: 'Vue 3 mit Composition API und TypeScript, gebaut mit Vite; gemeinsame Grundstruktur aus Pinia-Stores, Composables und Routing. Entwicklung: OUTERMEDIA GmbH (Berlin).',
      en: 'Vue 3 with the Composition API and TypeScript, built with Vite; shared foundation of Pinia stores, composables and routing. Development: OUTERMEDIA GmbH (Berlin).',
    },
    bausteine: [
      'gefuehrter-ablauf',
      'einzelbericht',
      'kompetenzstufen-verteilung', // StackedBarChart.vue, SingleBarChart.vue
    ],
  },
  {
    id: 'indibit-klassenrueckmeldung',
    bild: { datei: '/beispiele/bilder/indibit-klassenrueckmeldung.jpg', alt: 'Übersicht der Klassenrückmeldung mit Reitern' },
    einrichtung: 'indibit',
    titel: {
      de: 'Klassenrückmeldung',
      en: 'Class report',
    },
    beschreibung: {
      de: 'Für Klassen- und Fachlehrkräfte. Aus dem Wunsch der Entwicklungsgruppe nach einem Leistungsprofil über alle Schüler:innen einer Klasse ist das Werkzeug „Weiterarbeit" geworden: vier Förderniveaus in zwei Sichten, Heatmap-Profilvergleich, manuelle Nachjustierung und Verlinkung auf Fördermaterial.',
      en: 'For class and subject teachers. The development group’s wish for a performance profile across a whole class became the “continued work” tool: four support levels in two views, a heat-map profile comparison, manual adjustment and links to support material.',
    },
    faecher: ['DE'],
    stufen: ['V8'],
    zielgruppen: ['lehrkraft'],
    demo: 'https://apps.indibit.eu/tba3/class-teacher',
    code: 'https://github.com/indibit-eu',
    doku: 'https://apps.indibit.eu/tba3/docs/',
    hinweis: {
      de: 'Der Repositoriumsname folgt mit der Veröffentlichung. Lizenz: MIT.',
      en: 'The repository name follows on publication. Licence: MIT.',
    },
    technik: {
      de: 'Angular 21 in modulfreier Bauweise mit signalbasierter Reaktivität, TypeScript im strikten Modus, Bootstrap 5, ECharts 6. Sieben Rückmeldeelemente sind als Web Components framework-unabhängig einbettbar.',
      en: 'Angular 21, module-free with signal-based reactivity, TypeScript in strict mode, Bootstrap 5, ECharts 6. Seven report elements are embeddable as framework-independent web components.',
    },
    bausteine: [
      'kompetenzstufen-verteilung',
      'loesungshaeufigkeit-je-aufgabe',
      'profil-heatmap',
      'foerdergruppen',
      'materialanbindung',
      'einzelbericht',
          'personen-tabelle', // Reiter „Schülerübersicht“
      'vergleichsebenen', // Reiter „Vergleich“
    ],
  },
  {
    id: 'indibit-schulrueckmeldung',
    bild: { datei: '/beispiele/bilder/indibit-schulrueckmeldung.jpg', alt: 'Kontextmerkmale als Ringe, Standard-Erreichung je Domäne' },
    einrichtung: 'indibit',
    titel: {
      de: 'Schulrückmeldung',
      en: 'School report',
    },
    beschreibung: {
      de: 'Für die Schulleitung, fachunabhängig ab Schulebene — das Fach ist ein Filter, keine inhaltliche Festlegung. Je Ebene liegen dieselben drei Ressourcen vor: Kompetenzstufen, Aufgaben und Aggregationen.',
      en: 'For school leadership, subject-independent from school level upwards — the subject is a filter, not a commitment of content. The same three resources are available at every level: competence levels, items and aggregations.',
    },
    faecher: [],
    stufen: [],
    zielgruppen: ['schulleitung'],
    demo: 'https://apps.indibit.eu/tba3/school-manager',
    code: 'https://github.com/indibit-eu',
    doku: 'https://apps.indibit.eu/tba3/docs/',
    hinweis: null,
    technik: {
      de: 'Dieselbe Komponentenbibliothek wie die Klassenrückmeldung; die Rollen-Sicht ist eine Komposition daraus. Datenvertrag ist die OpenAPI-3.1-Spezifikation, der API-Client wird vollautomatisch daraus erzeugt.',
      en: 'The same component library as the class report; the role view is a composition of it. The data contract is the OpenAPI 3.1 specification, from which the API client is generated automatically.',
    },
    bausteine: [
      'kompetenzstufen-verteilung',
      'loesungshaeufigkeit-je-aufgabe',
      'vergleichsebenen',
      'filterleiste',
          'kontextmerkmal-ring', // vier Ringe auf der Übersicht: Status, Teilnahme, Geschlecht, Sprache
      'standard-erreichung', // „Mindeststandard erreicht“ mit Balken je Fach
      'uebersichtskarten', // app-school-summary, app-participants-card
    ],
  },
  {
    id: 'indibit-schulaufsicht',
    bild: { datei: '/beispiele/bilder/indibit-schulaufsicht.jpg', alt: 'Übersicht einer Bezirksregierung über ihre Schulämter' },
    einrichtung: 'indibit',
    titel: {
      de: 'Schulaufsichtsrückmeldung',
      en: 'School supervision report',
    },
    beschreibung: {
      de: 'Fachunabhängig und über Schulen und Schulämter aggregiert. Alle Ebenen oberhalb der Schule laufen über einen einzigen Endpunkt, gesteuert über Typ und Filter — beliebige Zwischenebenen sind damit abbildbar, und ein Land ohne Bezirksebene braucht keine eigene Spezifikationsvariante.',
      en: 'Subject-independent and aggregated across schools and school authorities. Every level above the school runs through a single endpoint, steered by type and filter — arbitrary intermediate levels become expressible, and a state without a district level needs no specification variant of its own.',
    },
    faecher: [],
    stufen: [],
    zielgruppen: ['schulaufsicht'],
    demo: 'https://apps.indibit.eu/tba3/school-supervision',
    code: 'https://github.com/indibit-eu',
    doku: 'https://apps.indibit.eu/tba3/docs/',
    hinweis: {
      de: 'Das Land Hessen setzt für seine Rückmeldungen an die Schulaufsicht auf diesem Entwicklungsstand auf.',
      en: 'The state of Hesse is building its own school supervision reports on this development status.',
    },
    technik: {
      de: 'Handlungsfelder liegen als landesspezifische Konfigurationsschicht außerhalb der Spezifikation. Automatisierte Prüfungen auf API-Konformität, Austauschbarkeit der Komponenten und Barrierefreiheit (WCAG 2.1 AA, 95/100).',
      en: 'Fields of action sit outside the specification as a state-specific configuration layer. Automated checks for API conformance, component interchangeability and accessibility (WCAG 2.1 AA, 95/100).',
    },
    bausteine: [
      'vergleichsebenen',
      'kompetenzstufen-verteilung',
      'loesungshaeufigkeit-je-aufgabe',
      'filterleiste',
          'kennzahl-mit-vergleich', // app-comparison-stat-card
      'uebersichtskarten', // app-overview-dashboard
    ],
  },
  {
    id: 'isq-portal',
    bild: { datei: '/beispiele/bilder/isq-portal.jpg', alt: 'Anmeldung des rollenbasierten Rückmeldeportals' },
    einrichtung: 'isq',
    titel: {
      de: 'Rollenbasiertes Rückmeldeportal VERA 3 / VERA 8',
      en: 'Role-based feedback portal, VERA 3 / VERA 8',
    },
    beschreibung: {
      de: 'Vier Sichten mit kaskadierenden Rechten in einer Anwendung: Schulaufsicht (Bezirk), Schulleitung (Schule), Lehrkraft (Klasse und Schüler:in), Schüler:in (eigene Ergebnisse). Dazu Dinge, die über die klassische Ergebnisrückmeldung hinausgehen — automatisch erzeugte Hinweise, speicherbare Arbeitsstände mit Notizen und Kommentaren, Auszeichnungen, ein Fördersystem und eine interaktive Bezirkskarte.',
      en: 'Four views with cascading permissions in one application: school supervision (district), school leadership (school), teacher (class and student), student (own results). Plus things that go beyond classic result reporting — automatically generated insights, saved working states with notes and comments, awards, a support system and an interactive district map.',
    },
    faecher: ['DE', 'MA', 'EN', 'FR'],
    stufen: ['V3', 'V8'],
    zielgruppen: ['lehrkraft', 'schulleitung', 'schulaufsicht', 'lernende'],
    demo: 'https://tba3.isqberlin.de/',
    code: 'https://git.imp.fu-berlin.de/isq/feedbacksysteme/tbaiii',
    doku: null,
    hinweis: {
      de: 'Demo erreichbar bis 31.10.2027; Umzug des Repositoriums geplant. Gestaltungsentscheidungen, Architektur- und API-Dokumentation liegen im Repositorium. Fördersystem, Aufgabenempfehlungen und KI-Aufgaben sind als Beta gekennzeichnet.',
      en: 'Demo available until 31 Oct 2027; the repository is scheduled to move. Design decisions, architecture and API documentation live in the repository. The support system, item recommendations and AI items are marked beta.',
    },
    technik: {
      de: 'Frontend React 19 mit TypeScript, Vite, Material-UI, ECharts und Leaflet; Backend Node.js/Express mit REST-API und JWT-Prüfung. Datenhaltung: MongoDB für Testergebnisse, MySQL für den Aufgabenbrowser, Supabase/PostgreSQL für Auth, Profile und Arbeitsstände. Technische Umsetzung im Wesentlichen durch eine Entwicklerperson.',
      en: 'React 19 front end with TypeScript, Vite, Material-UI, ECharts and Leaflet; Node.js/Express back end with a REST API and JWT checks. Storage: MongoDB for test results, MySQL for the item browser, Supabase/PostgreSQL for auth, profiles and working states. Technical implementation essentially by one developer.',
    },
    bausteine: [
      'kompetenzstufen-verteilung',
      'loesungshaeufigkeit-je-aufgabe',
      'streubereich-je-merkmal',
      'verlauf-ueber-messzeitpunkte',
      'gebietskarte',
      'vergleichsebenen',
      'staerken-und-entwicklungsbedarfe',
      'foerdergruppen',
      'materialanbindung',
      'aufgabenbrowser',
      'einzelbericht',
      'automatische-hinweise',
      'auszeichnungen',
      'rollensichten',
      'filterleiste',
      'arbeitsstand',
      'bericht-ausgeben',
      'erklaertexte',
      'zweisprachigkeit',
      'barrierefreiheit',
    ],
  },
  {
    id: 'zepf-ma3',
    bild: { datei: '/beispiele/bilder/zepf-ma3.jpg', alt: 'Einstieg in die Mathematik-Rückmeldung' },
    einrichtung: 'zepf',
    titel: {
      de: 'Mathematik, Klasse 3',
      en: 'Mathematics, grade 3',
    },
    beschreibung: {
      de: 'Eine mehrseitige Anwendung, die je Ansicht eine eigene Fragestellung und Perspektive stellt: Module — Interface, Schaubilder, Tabellen — werden zielorientiert zusammengestellt, über Aggregationsebenen von der Aufgabe bis zum Land.',
      en: 'A multi-page application that poses its own question and perspective per view: modules — interface, diagrams, tables — are assembled towards a goal, across aggregation levels from the single item up to the state.',
    },
    faecher: ['MA'],
    stufen: ['V3'],
    zielgruppen: ['lehrkraft'],
    demo: 'https://zepf-rptu.github.io/TBA3/ma',
    code: 'https://github.com/zepf-RPTU/TBA3',
    doku: 'https://zepf-rptu.github.io/TBA3/docs/ma',
    hinweis: {
      de: 'Die Rückmeldungen befinden sich im Umzug von GitLab auf GitHub; die Verweise sind vorläufig.',
      en: 'The reports are being moved from GitLab to GitHub; the links are provisional.',
    },
    technik: {
      de: 'Vanilla JavaScript, CSS und HTML mit Tabulator und D3; ausschließlich clientseitiges Frontend. Gemeinsame Grundstruktur aus Basisklassen, Stilen und Hintergrundlogiken, dazu fach- und zielgruppenspezifische Module. Optimiert für Desktop und hochauflösende Tablets.',
      en: 'Vanilla JavaScript, CSS and HTML with Tabulator and D3; front end only. A shared foundation of base classes, styles and background logic, plus subject- and audience-specific modules. Optimised for desktop and high-resolution tablets.',
    },
    bausteine: [
      'kompetenzstufen-verteilung',
      'loesungshaeufigkeit-je-aufgabe',
      'vergleichsebenen',
      'personen-tabelle',
      'erklaertexte',
          'glossar-mit-suche', // MaGlossarySearchModule, maGlossary.js
      'aufgabenvorschau', // ItemPreviewOverlay
      'export-mit-auswahl', // ExportService, ExportSelectionManager
    ],
  },
  {
    id: 'zepf-en8',
    bild: { datei: '/beispiele/bilder/zepf-en8.jpg', alt: 'Einstieg in die Englisch-Rückmeldung' },
    einrichtung: 'zepf',
    titel: {
      de: 'Englisch, Klasse 8',
      en: 'English, grade 8',
    },
    beschreibung: {
      de: 'Derselbe Grundaufbau wie die Mathematik-Rückmeldung, auf das Fach zugeschnitten. Verarbeitet werden Kompetenzstufen und Lösungshäufigkeiten auf Landes-, Schul-, Klassen- und Schülerebene sowie auf Fach-, Domänen-, Teildomänen- und Aufgabenebene.',
      en: 'The same basic structure as the mathematics report, cut for the subject. It processes competence levels and solution frequencies at state, school, class and student level as well as at subject, domain, sub-domain and item level.',
    },
    faecher: ['EN'],
    stufen: ['V8'],
    zielgruppen: ['lehrkraft'],
    demo: 'https://zepf-rptu.github.io/TBA3/en',
    code: 'https://github.com/zepf-RPTU/TBA3',
    doku: 'https://zepf-rptu.github.io/TBA3/docs/en',
    hinweis: {
      de: 'Die Rückmeldungen befinden sich im Umzug von GitLab auf GitHub; die Verweise sind vorläufig.',
      en: 'The reports are being moved from GitLab to GitHub; the links are provisional.',
    },
    technik: {
      de: 'Wie die Mathematik-Rückmeldung: Vanilla JavaScript mit Tabulator und D3, gemeinsame technische Grundstruktur, fachspezifische Module. Textelemente wie Tooltips liegen in separaten, datenunabhängigen JSON-Dateien.',
      en: 'As the mathematics report: vanilla JavaScript with Tabulator and D3, a shared technical foundation, subject-specific modules. Text elements such as tooltips live in separate, data-independent JSON files.',
    },
    bausteine: [
      'kompetenzstufen-verteilung',
      'loesungshaeufigkeit-je-aufgabe',
      'vergleichsebenen',
      'personen-tabelle',
      'erklaertexte',
          'glossar-mit-suche', // enGlossary.js
      'aufgabenvorschau', // ItemPreviewOverlay
      'export-mit-auswahl', // ExportService, ExportSelectionManager
    ],
  },
  {
    id: 'zepf-sl',
    bild: { datei: '/beispiele/bilder/zepf-sl.jpg', alt: 'Schul- und Klassenleistung auf einen Blick' },
    einrichtung: 'zepf',
    titel: {
      de: 'Schulleitung',
      en: 'School leadership',
    },
    beschreibung: {
      de: 'Die Sicht der Schulleitung auf dieselbe Datenlage: Aggregationen über Klassen und Jahrgänge hinweg, in denselben Modulen wie die fachlichen Rückmeldungen, nur in anderer Zusammenstellung und Hierarchie.',
      en: 'The school leadership’s view of the same data: aggregations across classes and year groups, in the same modules as the subject reports, only in a different composition and hierarchy.',
    },
    faecher: [],
    stufen: [],
    zielgruppen: ['schulleitung'],
    demo: 'https://zepf-rptu.github.io/TBA3/sl',
    code: 'https://github.com/zepf-RPTU/TBA3',
    doku: 'https://zepf-rptu.github.io/TBA3/docs/sl',
    hinweis: {
      de: 'Die Rückmeldungen befinden sich im Umzug von GitLab auf GitHub; die Verweise sind vorläufig.',
      en: 'The reports are being moved from GitLab to GitHub; the links are provisional.',
    },
    technik: {
      de: 'Dieselbe Grundstruktur, zielgruppenspezifische Module. Streamlining der drei zepf-Rückmeldungen hinsichtlich Grundaufbau, technischer Umsetzung und übergreifender Funktionen war ein eigenes Arbeitspaket.',
      en: 'The same foundation, audience-specific modules. Streamlining the three zepf reports in terms of basic structure, technical implementation and cross-cutting functions was a work package of its own.',
    },
    bausteine: [
      'kompetenzstufen-verteilung',
      'vergleichsebenen',
      'erklaertexte',
      'verlauf-ueber-messzeitpunkte', // slLongitudinalViewModule
      'materialanbindung', // slMaterialViewModule
      'glossar-mit-suche', // slGlossary.js
      'export-mit-auswahl', // ExportService, ExportSelectionManager
      'kontextmerkmal-ring', // slStudentCovariates
    ],
  },
];

// ── Der Katalog ────────────────────────────────────────────────────────────

/**
 * Drei Schichten — der Aufbau, den indibit für die eigene Bibliothek
 * beschrieben hat (16 Anzeigekomponenten, 13 Rückmeldeelemente, 3 Rollen-Sichten)
 * und der auf die anderen drei Einrichtungen genauso passt. Er trennt sauber,
 * was sonst durcheinandergerät: eine Darstellung ohne Zuständigkeit für ihre
 * Daten, eine fachliche Aussage, und der Rahmen, der eine Anwendung erst
 * benutzbar macht.
 */
export const SCHICHTEN = {
  anzeige: {
    kurz: { de: 'Anzeigebausteine', en: 'Display blocks' },
    beschreibung: {
      de: 'Reine Darstellung, keine eigene Datenbeschaffung. Was hineingereicht wird, wird gezeichnet — austauschbar und ohne Wissen darüber, woher die Zahlen kommen.',
      en: 'Pure display, no data fetching of their own. Whatever is handed in gets drawn — interchangeable and with no knowledge of where the numbers came from.',
    },
  },
  element: {
    kurz: { de: 'Rückmeldeelemente', en: 'Report elements' },
    beschreibung: {
      de: 'Fachlich sinnvolle Gruppierungen — das eigentliche Rückmeldeformat. Ein Element beantwortet eine Frage, die jemand im Kollegium tatsächlich stellt, und ist einzeln nachnutzbar.',
      en: 'Groupings that make sense in the subject — the actual report format. An element answers a question someone in the staff room really asks, and can be reused on its own.',
    },
  },
  rahmen: {
    kurz: { de: 'Rahmen', en: 'Frame' },
    beschreibung: {
      de: 'Was jede Rückmeldung braucht, unabhängig von Fach und Jahrgang: wer was sehen darf, wie ausgewählt wird, wie etwas festgehalten und wieder aufgerufen wird, und wie das Ganze verständlich und bedienbar bleibt.',
      en: 'What every report needs regardless of subject and year: who may see what, how selections are made, how something is kept and recalled, and how the whole stays understandable and operable.',
    },
  },
};

/**
 * Der Katalog.
 *
 * @property {string} id
 * @property {'anzeige'|'element'|'rahmen'} schicht
 * @property {{de: string, en: string}} name
 * @property {{de: string, en: string}} zweck   Welche Frage beantwortet er?
 * @property {{de: string, en: string}} daten   Woher kommen die Zahlen — als Ressource, nicht als Endpunkt.
 * @property {string|null} element   Name in @tba3/bausteine, ohne Präfix, oder null
 * @property {string|null} quelle    Welche Ressource die Demoanwendung dafür abruft:
 *                                   'competence-levels' | 'items' | 'items-schueler' | null.
 *                                   Nur gesetzt, wo es auch einen Baustein gibt — sonst
 *                                   bliebe die Kachel leer.
 * @property {'sachbericht'|'artefakt'} beleg  Woher die Zuordnung stammt: aus dem
 *                                   Sachbericht der Einrichtung, oder aus der laufenden
 *                                   Demo bzw. ihrem offenen Quelltext.
 * @property {{de: string, en: string}} [offen]  Nur bei Anzeigebausteinen ohne Element und
 *                                   ohne Reiter: warum es beides nicht gibt. Ohne diese
 *                                   Begründung fiele der Eintrag durch den Test — eine
 *                                   Lücke darf hier stehen, aber nicht schweigen.
 * @property {string|null} reiter    Reiter der Demoanwendung, der dieselbe Frage sonst
 *                                   beantwortet. Für Bausteine ohne eigene Zeichnung ist das
 *                                   die ehrliche Antwort: „dafür gibt es hier schon eine
 *                                   Stelle", statt einer leeren Fläche.
 */
export const BAUSTEINE = [
  // ── Schicht 1: Anzeigebausteine ──────────────────────────────────────────
  {
    id: 'kompetenzstufen-verteilung',
    schicht: 'anzeige',
    name: { de: 'Verteilung über die Kompetenzstufen', en: 'Distribution across competence levels' },
    zweck: {
      de: 'Wie verteilt sich eine Gruppe über die Kompetenzstufen? Gestapelt, mit dem Mindeststandard als Marke und einer Farbskala, die die Ordnung der Stufen trägt statt sie zu verwischen.',
      en: 'How does a group spread across the competence levels? Stacked, with the minimum standard marked and a colour scale that carries the order of the levels rather than blurring it.',
    },
    daten: { de: 'Kompetenzstufen je Ebene', en: 'Competence levels per level' },
    element: 'kompetenzstufen-leiste',
    quelle: 'competence-levels',
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'loesungshaeufigkeit-je-aufgabe',
    schicht: 'anzeige',
    name: { de: 'Lösungshäufigkeit je Aufgabe', en: 'Solution frequency per item' },
    zweck: {
      de: 'Welche Aufgaben sind auffällig? Die Lösungshäufigkeit der Gruppe gegen den Referenzbereich, sortierbar — die Abweichung ist die Information, nicht der absolute Wert.',
      en: 'Which items stand out? The group’s solution frequency against the reference range, sortable — the deviation is the information, not the absolute value.',
    },
    daten: { de: 'Aufgaben je Ebene', en: 'Items per level' },
    element: 'aufgaben-tabelle',
    quelle: 'items',
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'erwartung-gegen-ergebnis',
    schicht: 'anzeige',
    name: { de: 'Erwartung gegen Ergebnis', en: 'Expectation against result' },
    zweck: {
      de: 'Dieselbe Frage als Bild: tatsächliche gegen erwartete Lösungsquote je Aufgabe. Was weit unter der Diagonalen liegt, ist schwerer gefallen als anderswo.',
      en: 'The same question as a picture: actual against expected solution rate per item. Whatever falls well below the diagonal was harder here than elsewhere.',
    },
    daten: { de: 'Aufgaben je Ebene, mit Referenzwert', en: 'Items per level, with a reference value' },
    element: 'erwartet-tatsaechlich',
    quelle: 'items',
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'mittelwert-mit-unsicherheit',
    schicht: 'anzeige',
    name: { de: 'Mittelwert mit Unsicherheit', en: 'Mean with uncertainty' },
    zweck: {
      de: 'Ein Wert je Bezugsgruppe auf einer gemeinsamen Skala, mit Unsicherheitsbereich. Kleine Kohorten sollen keine überdeutlichen Aussagen ergeben — der Bereich sagt, wie weit man dem Punkt trauen darf.',
      en: 'One value per reference group on a shared scale, with an uncertainty range. Small cohorts should not produce overconfident statements — the range says how far the point can be trusted.',
    },
    daten: { de: 'Aggregationen je Ebene', en: 'Aggregations per level' },
    element: 'mittelwert-vergleich',
    quelle: 'items',
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'streubereich-je-merkmal',
    schicht: 'anzeige',
    name: { de: 'Streubereich je Merkmal', en: 'Spread per characteristic' },
    zweck: {
      de: 'Wo liegt der mittlere Bereich je Teilbereich — und wo darin steht eine einzelne Schüler:in? Zeigt Streuung statt nur Mittelwert.',
      en: 'Where does the middle range lie per sub-domain — and where within it does a single student stand? Shows spread rather than only the mean.',
    },
    daten: { de: 'Aggregationen je Teilbereich', en: 'Aggregations per sub-domain' },
    element: 'perzentilbaender',
    quelle: 'items-schueler',
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'verlauf-ueber-messzeitpunkte',
    schicht: 'anzeige',
    name: { de: 'Verlauf über Messzeitpunkte', en: 'Progress across measurement points' },
    zweck: {
      de: 'Mehrere Erhebungen als Linie, mit Band und Vergleichslinie. Der einzige Baustein, der eine Entwicklung zeigen kann statt eines Zustands.',
      en: 'Several measurements as a line, with a band and a comparison line. The only block that can show a development rather than a state.',
    },
    daten: { de: 'Mehrere Erhebungen derselben Gruppe', en: 'Several measurements of the same group' },
    element: 'lernstands-verlauf',
    quelle: null,
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'profil-heatmap',
    schicht: 'anzeige',
    name: { de: 'Profil-Heatmap', en: 'Profile heat map' },
    zweck: {
      de: 'Aufgaben oder Merkmale gegen Personen oder Lerngruppen, gefärbt nach Abweichung. Das Muster ist die Aussage: eine Zeile, die durchgehend kühl ist, betrifft alle; eine kühle Spalte betrifft eine Person.',
      en: 'Items or characteristics against people or learning groups, coloured by deviation. The pattern is the statement: a row that is cool throughout concerns everyone; a cool column concerns one person.',
    },
    daten: { de: 'Aufgaben je Schüler:in', en: 'Items per student' },
    element: 'aufgaben-heatmap',
    quelle: 'items-schueler',
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'personen-tabelle',
    schicht: 'anzeige',
    name: { de: 'Tabelle je Person', en: 'Table per person' },
    zweck: {
      de: 'Lösungsanteile je Schüler:in und Teilbereich, sortierbar und auswählbar. Die Tabelle ist die ehrlichste Darstellung: sie verdichtet nichts und verschweigt nichts.',
      en: 'Solution shares per student and sub-domain, sortable and selectable. The table is the most honest display: it compresses nothing and hides nothing.',
    },
    daten: { de: 'Aufgaben je Schüler:in', en: 'Items per student' },
    element: 'schueler-tabelle',
    quelle: 'items-schueler',
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'punktwolke',
    schicht: 'anzeige',
    name: { de: 'Punktwolke', en: 'Scatter plot' },
    zweck: {
      de: 'Schüler:innen als Punkte in zwei Dimensionen. Zeigt Gruppen und Ausreißer, die in Tabelle und Balken untergehen.',
      en: 'Students as points in two dimensions. Shows clusters and outliers that a table or a bar chart swallows.',
    },
    daten: { de: 'Aufgaben je Schüler:in', en: 'Items per student' },
    element: 'streudiagramm',
    quelle: 'items-schueler',
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'positionsskala-mit-zonen',
    schicht: 'anzeige',
    name: { de: 'Positionsskala mit Zonen', en: 'Position scale with zones' },
    zweck: {
      de: 'Jede Schüler:in als eigene Marke auf einer durchgehenden Punkteskala, die Kompetenzstufen als Zonen darunter. Macht sichtbar, wie nah jemand an der nächsten Stufe steht — die Stufe allein sagt das nicht.',
      en: 'Every student as their own marker on a continuous point scale, the competence levels as zones beneath. Makes visible how close someone is to the next level — the level alone does not say that.',
    },
    daten: { de: 'Punktwerte je Schüler:in', en: 'Point values per student' },
    element: 'bista-verteilung',
    quelle: null,
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'kennzahl-mit-vergleich',
    schicht: 'anzeige',
    name: { de: 'Kennzahl mit Vergleich', en: 'Key figure with comparison' },
    zweck: {
      de: 'Eine Zahl, ein Bezugswert, ein kleiner Verlauf. Der Einstieg in jede Übersicht — und die Stelle, an der am leichtesten gelogen wird, wenn der Bezugswert fehlt.',
      en: 'One number, one reference value, a small trend. The entry point of every overview — and the place where it is easiest to lie when the reference value is missing.',
    },
    daten: { de: 'Kompetenzstufen oder Aggregationen je Ebene', en: 'Competence levels or aggregations per level' },
    element: 'kennzahl-kachel',
    quelle: 'competence-levels',
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'uebersichtskarten',
    schicht: 'anzeige',
    name: { de: 'Übersichtskarten', en: 'Overview cards' },
    zweck: {
      de: 'Je Bereich eine Karte mit Ring, Kennzahl und aufklappbarem Detail. Die Zusammenfassung, die man aufklappen kann, statt der Zusammenfassung, der man glauben muss.',
      en: 'One card per area, with a ring, a key figure and a detail that opens up. The summary you can unfold, rather than the summary you have to believe.',
    },
    daten: { de: 'Kompetenzstufen je Domäne', en: 'Competence levels per domain' },
    element: 'uebersichtskarten',
    quelle: 'competence-levels',
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'gebietskarte',
    schicht: 'anzeige',
    name: { de: 'Gebietskarte', en: 'Area map' },
    zweck: {
      de: 'Schulen und Gebiete auf einer Karte, gekoppelt mit Tabelle und Suche. Für die Schulaufsicht ist die Lage im Bezirk selbst ein Merkmal — in einer Liste ist sie unsichtbar.',
      en: 'Schools and areas on a map, coupled with a table and a search. For school supervision, the location within the district is itself a characteristic — in a list it is invisible.',
    },
    daten: { de: 'Schulen einer Ebene mit Ortsangabe', en: 'Schools of a level with location data' },
    element: null,
    quelle: null,
    reiter: 'students',
    beleg: 'sachbericht',
  },

  // ── Schicht 2: Rückmeldeelemente ─────────────────────────────────────────
  {
    id: 'vergleichsebenen',
    schicht: 'element',
    name: { de: 'Vergleichsebenen', en: 'Comparison levels' },
    zweck: {
      de: 'Dieselbe Größe auf mehreren Bezugsebenen nebeneinander: Klasse, Schule, fairer Vergleich mit strukturell ähnlichen Schulen, Bezirk, Land. Ohne Bezugsebene ist ein Ergebnis keine Aussage.',
      en: 'The same figure side by side at several reference levels: class, school, fair comparison with structurally similar schools, district, state. Without a reference level a result is not a statement.',
    },
    daten: { de: 'Dieselbe Ressource auf mehreren Ebenen', en: 'The same resource at several levels' },
    element: 'kompetenzstufen-leiste',
    quelle: 'competence-levels',
    reiter: 'delta',
    beleg: 'sachbericht',
  },
  {
    id: 'staerken-und-entwicklungsbedarfe',
    schicht: 'element',
    name: { de: 'Stärken und Entwicklungsbedarfe', en: 'Strengths and development needs' },
    zweck: {
      de: 'Merkmale nach dem Abstand zur Erwartung geordnet — oben abgelesen sind es Stärken, unten Entwicklungsbedarfe. Dieselbe Rechnung, zwei Enden, und keine Rangliste von Personen.',
      en: 'Characteristics ordered by their distance from the expectation — read from the top they are strengths, from the bottom development needs. One calculation, two ends, and no ranking of people.',
    },
    daten: { de: 'Aufgaben oder Merkmale gegen Referenzwert', en: 'Items or characteristics against a reference value' },
    element: 'aufgaben-tabelle',
    quelle: 'items',
    reiter: 'items',
    beleg: 'sachbericht',
  },
  {
    id: 'foerdergruppen',
    schicht: 'element',
    name: { de: 'Fördergruppen', en: 'Support groups' },
    zweck: {
      de: 'Lernende nach Förderniveau gebündelt, von Hand nachjustierbar. Der Übergabepunkt nach außen: weitergegeben wird nicht ein Ergebniswert, sondern eine Gruppe mit klarem Bedarf.',
      en: 'Learners bundled by support level, adjustable by hand. The hand-over point outwards: what gets passed on is not a result value but a group with a clear need.',
    },
    daten: { de: 'Ergebnisse je Schüler:in plus eine Regel', en: 'Results per student plus a rule' },
    element: 'schueler-tabelle',
    quelle: 'items-schueler',
    reiter: 'students',
    beleg: 'sachbericht',
  },
  {
    id: 'materialanbindung',
    schicht: 'element',
    name: { de: 'Materialanbindung', en: 'Material link-up' },
    zweck: {
      de: 'Von einem Befund zu passendem Fördermaterial, ohne die Anwendung zu verlassen. Der Schritt, an dem sich entscheidet, ob eine Rückmeldung etwas verändert oder nur beschreibt.',
      en: 'From a finding to fitting support material without leaving the application. The step that decides whether a report changes anything or merely describes.',
    },
    daten: { de: 'Merkmal oder Fördergruppe als Suchanfrage', en: 'A characteristic or support group as a query' },
    element: null,
    quelle: null,
    reiter: 'materials',
    beleg: 'sachbericht',
  },
  {
    id: 'aufgabenbrowser',
    schicht: 'element',
    name: { de: 'Aufgabenbrowser', en: 'Item browser' },
    zweck: {
      de: 'Aufgaben suchen, ansehen, sammeln und zuweisen — die Aufgabe selbst statt nur ihrer Kennung. Erst damit lässt sich prüfen, ob eine auffällige Lösungshäufigkeit am Können oder an der Aufgabe lag.',
      en: 'Search, view, collect and assign items — the item itself rather than only its identifier. Only then can one check whether a striking solution frequency was about ability or about the item.',
    },
    daten: { de: 'Aufgabenkatalog mit Inhalt', en: 'An item catalogue with content' },
    element: null,
    quelle: null,
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'einzelbericht',
    schicht: 'element',
    name: { de: 'Einzelbericht', en: 'Individual report' },
    zweck: {
      de: 'Die Rückmeldung einer einzelnen Person: Was konnte ich schon, wo liegt der nächste Schritt — ohne Rangliste und ohne Note. Dieselben Daten wie die Gruppensicht, eine andere Verantwortung.',
      en: 'One person’s own report: what I could already do, where the next step lies — no ranking, no mark. The same data as the group view, a different responsibility.',
    },
    daten: { de: 'Ergebnisse einer Schüler:in', en: 'One student’s results' },
    element: null,
    quelle: null,
    reiter: 'students',
    beleg: 'sachbericht',
  },
  {
    id: 'gefuehrter-ablauf',
    schicht: 'element',
    name: { de: 'Geführter Ablauf', en: 'Guided sequence' },
    zweck: {
      de: 'Der Bericht als nummerierte Schrittfolge statt als Dashboard. Wer nicht täglich mit Testdaten umgeht, bekommt eine Reihenfolge — beim Kompetenzstand Mathematik sind es sieben Schritte.',
      en: 'The report as a numbered sequence rather than a dashboard. Whoever does not handle test data daily is given an order — in the mathematics report it is seven steps.',
    },
    daten: { de: 'Dieselben Daten, nur in fester Reihenfolge', en: 'The same data, only in a fixed order' },
    element: null,
    quelle: null,
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'automatische-hinweise',
    schicht: 'element',
    name: { de: 'Automatische Hinweise', en: 'Automatic insights' },
    zweck: {
      de: 'Aus Verteilung, Vergleich und Entwicklung erzeugte Sätze, abhängig von den gesetzten Filtern. Nimmt der Leserin das Ablesen ab — und die Möglichkeit, es anders abzulesen. Deshalb gehört dazu, dass der Satz seine Rechnung nennt.',
      en: 'Sentences generated from distribution, comparison and development, depending on the filters set. It saves the reader the reading — and the chance to read it differently. Hence a sentence must name its calculation.',
    },
    daten: { de: 'Die gesetzten Filter und ihre Ergebnisse', en: 'The filters set and their results' },
    element: null,
    quelle: null,
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'auszeichnungen',
    schicht: 'element',
    name: { de: 'Auszeichnungen', en: 'Awards' },
    zweck: {
      de: 'Regelbasierte Hervorhebungen — „deutlich über dem Bezirksdurchschnitt", „übertrifft strukturell vergleichbare Schulen". Wirkt nur, solange die Regel offenliegt; sonst ist es eine Rangliste mit freundlichem Namen.',
      en: 'Rule-based highlights — “clearly above the district average”, “outperforms structurally comparable schools”. It works only as long as the rule is visible; otherwise it is a ranking with a friendly name.',
    },
    daten: { de: 'Vergleichswerte plus eine offengelegte Regel', en: 'Comparison values plus a disclosed rule' },
    element: null,
    quelle: null,
    reiter: null,
    beleg: 'sachbericht',
  },

  // ── Schicht 3: Rahmen ────────────────────────────────────────────────────
  {
    id: 'rollensichten',
    schicht: 'rahmen',
    name: { de: 'Rollensichten', en: 'Role views' },
    zweck: {
      de: 'Kaskadierende Sichten auf dieselbe Datenlage: Schulaufsicht sieht den Bezirk, Schulleitung die Schule, Lehrkraft die Klasse und einzelne Schüler:innen, Schüler:in die eigenen Ergebnisse. Eine Bibliothek, vier Kompositionen.',
      en: 'Cascading views of the same data: supervision sees the district, leadership the school, the teacher the class and individual students, the student their own results. One library, four compositions.',
    },
    daten: { de: 'Ebene und Rechte der angemeldeten Person', en: 'The level and permissions of the signed-in person' },
    element: null,
    quelle: null,
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'filterleiste',
    schicht: 'rahmen',
    name: { de: 'Filterleiste', en: 'Filter bar' },
    zweck: {
      de: 'Ebene, Fach, Jahrgang, Datentyp. Die Auswahl gehört in die Adresszeile, sonst lässt sich eine Ansicht nicht verschicken und der Zurück-Knopf tut das Falsche.',
      en: 'Level, subject, year, data type. The selection belongs in the address bar, otherwise a view cannot be shared and the back button does the wrong thing.',
    },
    daten: { de: 'Das Vokabular der Schnittstelle', en: 'The vocabulary of the API' },
    element: null,
    quelle: null,
    reiter: 'competence',
    beleg: 'sachbericht',
  },
  {
    id: 'arbeitsstand',
    schicht: 'rahmen',
    name: { de: 'Arbeitsstand', en: 'Working state' },
    zweck: {
      de: 'Gesetzte Filter, Notizen und Kommentare speichern und wieder aufrufen. Eine Rückmeldung wird selten in einer Sitzung gelesen; ohne Arbeitsstand beginnt jede Konferenz von vorn.',
      en: 'Saving and recalling the filters set, notes and comments. A report is rarely read in one sitting; without a working state every meeting starts over.',
    },
    daten: { de: 'Profil der angemeldeten Person', en: 'The signed-in person’s profile' },
    element: null,
    quelle: null,
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'bericht-ausgeben',
    schicht: 'rahmen',
    name: { de: 'Bericht ausgeben', en: 'Export the report' },
    zweck: {
      de: 'Eine Fassung, die das Gerät verlässt — an die gesetzten Filter gebunden und, wo sinnvoll, vor dem Export bearbeitbar. In der Konferenz liegt Papier auf dem Tisch, kein Dashboard.',
      en: 'A version that leaves the device — bound to the filters set and, where sensible, editable before export. In a meeting there is paper on the table, not a dashboard.',
    },
    daten: { de: 'Der aktuelle Stand der Ansicht', en: 'The current state of the view' },
    element: null,
    quelle: null,
    reiter: 'materials',
    beleg: 'sachbericht',
  },
  {
    id: 'erklaertexte',
    schicht: 'rahmen',
    name: { de: 'Erklärtexte', en: 'Explanatory texts' },
    zweck: {
      de: 'Tooltips, Glossar, Einführungstouren je Rolle. Datenunabhängig gehalten — bei zepf in eigenen JSON-Dateien —, damit sich der Text ändern lässt, ohne die Auswertung anzufassen.',
      en: 'Tooltips, a glossary, onboarding tours per role. Kept independent of the data — at zepf in separate JSON files — so the text can change without touching the analysis.',
    },
    daten: { de: 'Keine — bewusst getrennt gehalten', en: 'None — deliberately kept separate' },
    element: null,
    quelle: null,
    reiter: 'help',
    beleg: 'sachbericht',
  },
  {
    id: 'zweisprachigkeit',
    schicht: 'rahmen',
    name: { de: 'Zweisprachigkeit', en: 'Bilingualism' },
    zweck: {
      de: 'Deutsch und Englisch in derselben Anwendung. Die Wahl gehört der Leserin und gilt über alle Ansichten hinweg; Beispieldaten bleiben unübersetzt, weil sie im Betrieb aus der Schnittstelle kommen.',
      en: 'German and English in the same application. The choice belongs to the reader and holds across all views; sample data stays untranslated because in operation it comes from the API.',
    },
    daten: { de: 'Keine — Beschriftungen, nicht Ergebnisse', en: 'None — labels, not results' },
    element: null,
    quelle: null,
    reiter: null,
    beleg: 'sachbericht',
  },
  {
    id: 'barrierefreiheit',
    schicht: 'rahmen',
    name: { de: 'Barrierefreiheit', en: 'Accessibility' },
    zweck: {
      de: 'Kontrast, Tastaturbedienung, Bedeutung nicht allein über Farbe. Prüfbar gemacht statt angestrebt: indibit fährt WCAG 2.1 AA als festen Prozessschritt (95/100), das ISQ nennt sie ausdrücklich als angestrebt und nicht verbindlich geprüft.',
      en: 'Contrast, keyboard operation, meaning not carried by colour alone. Made checkable rather than aspired to: indibit runs WCAG 2.1 AA as a fixed process step (95/100), while ISQ states it is aimed at and not formally verified.',
    },
    daten: { de: 'Keine — eine Eigenschaft jeder Darstellung', en: 'None — a property of every display' },
    element: null,
    quelle: null,
    reiter: null,
    beleg: 'sachbericht',
  },
  // ── Am Artefakt gefunden ─────────────────────────────────────────────────
  // Was folgt, steht in keinem Sachbericht. Es stammt aus den laufenden Demos
  // und den offenen Repositorien — teils direkt aus Dateinamen, die keine
  // Auslegung brauchen (`BirdsResultsView.vue`, `ReportCardHelper.vue`,
  // `ItemPreviewOverlay`, `MaGlossarySearchModule`).
  {
    id: 'kontextmerkmal-ring',
    schicht: 'anzeige',
    name: { de: 'Kontextmerkmal als Ring', en: 'Context characteristic as a ring' },
    zweck: {
      de: 'Ein kategoriales Merkmal der Gruppe — sozioökonomischer Status, Teilnahmequote, Geschlecht, Sprache zuhause — als Ring mit Legende, die Mitte trägt die Gesamtzahl oder die mittlere Kategorie. Ergebnisse ohne Zusammensetzung der Gruppe sind nicht einzuordnen; deshalb steht dieser Ring in der Schulrückmeldung viermal nebeneinander.',
      en: 'One categorical characteristic of the group — socio-economic status, participation rate, gender, language at home — as a ring with a legend, the centre carrying the total or the median category. Results cannot be placed without the composition of the group; hence this ring appears four times side by side in the school report.',
    },
    daten: { de: 'Kovariaten je Schüler:in', en: 'Covariates per student' },
    element: 'kontextmerkmal-ring',
    quelle: 'items-schueler',
    reiter: null,
    beleg: 'artefakt',
  },
  {
    id: 'lernverlauf-figuren',
    schicht: 'anzeige',
    name: { de: 'Lernverlauf als Figuren', en: 'Learning progress as figures' },
    zweck: {
      de: 'Jede Schüler:in als eigene Figur auf einer Fläche aus Messzeitpunkt und Fähigkeit, die Kompetenzstufen als benannte Zonen statt als Zahlen. In der Messwiederholung sind es Vögel, deren Art die Stufe trägt — eine Darstellung, die eine Drittklässlerin über sich selbst lesen kann.',
      en: 'Every student as their own figure on a plane of measurement point and ability, the competence levels as named zones rather than numbers. In the repeated measurement they are birds whose species carries the level — a display a third-grader can read about herself.',
    },
    daten: { de: 'Mehrere Erhebungen je Schüler:in', en: 'Several measurements per student' },
    element: 'lernverlauf-figuren',
    quelle: null,
    reiter: null,
    beleg: 'artefakt',
  },
  {
    id: 'standard-erreichung',
    schicht: 'element',
    name: { de: 'Standard-Erreichung', en: 'Standard attainment' },
    zweck: {
      de: 'Ein Prozentwert als Schlagzeile — wie viele erreichen den Mindeststandard —, darunter je Fach oder Domäne ein Balken. Die eine Zahl, nach der zuerst gefragt wird, mit der Aufschlüsselung direkt daneben, damit sie nicht allein stehen bleibt.',
      en: 'One percentage as a headline — how many reach the minimum standard — with a bar per subject or domain beneath it. The number everyone asks for first, with its breakdown right next to it so it does not stand alone.',
    },
    daten: { de: 'Kompetenzstufen je Domäne', en: 'Competence levels per domain' },
    element: 'standard-erreichung',
    quelle: 'competence-levels',
    reiter: null,
    beleg: 'artefakt',
  },
  {
    id: 'zeugnissaetze',
    schicht: 'element',
    name: { de: 'Zeugnissätze', en: 'Report card sentences' },
    zweck: {
      de: 'Aus den Ergebnissen formulierte Sätze zum Übernehmen und Abwandeln. Der Schritt, den eine Lehrkraft nach der Rückmeldung ohnehin tut — und der einzige Baustein hier, dessen Ausgabe Text ist und kein Bild.',
      en: 'Sentences formulated from the results, to adopt and adapt. The step a teacher takes after the report anyway — and the only block here whose output is text rather than a picture.',
    },
    daten: { de: 'Kompetenzstufen je Schüler:in oder Gruppe', en: 'Competence levels per student or group' },
    element: 'zeugnissaetze',
    quelle: 'competence-levels',
    reiter: null,
    beleg: 'artefakt',
  },
  {
    id: 'selbsteinschaetzung',
    schicht: 'element',
    name: { de: 'Selbsteinschätzung gegen Ergebnis', en: 'Self-assessment against result' },
    zweck: {
      de: 'Was die Schüler:in sich zutraut, neben dem, was der Test misst. Die Lücke zwischen beidem ist pädagogisch oft der interessantere Befund als das Ergebnis allein — und sie taucht in keiner Ergebnisrückmeldung auf, die nur Ergebnisse kennt.',
      en: 'What the student thinks she can do, next to what the test measures. The gap between the two is often the more interesting finding than the result alone — and it appears in no report that knows only results.',
    },
    daten: { de: 'Erhobene Selbsteinschätzung, nicht Teil der Schnittstelle', en: 'Collected self-assessment, not part of the API' },
    element: 'selbsteinschaetzung',
    quelle: null,
    reiter: null,
    beleg: 'artefakt',
  },
  {
    id: 'aufgabenvorschau',
    schicht: 'element',
    name: { de: 'Aufgabenvorschau', en: 'Item preview' },
    zweck: {
      de: 'Die Aufgabe selbst in einem Überlagerungsfenster, aus der Tabelle heraus geöffnet. Ohne sie ist eine auffällige Lösungshäufigkeit eine Zahl, über die sich nicht entscheiden lässt, ob sie am Können lag oder an der Aufgabe.',
      en: 'The item itself in an overlay, opened from the table. Without it a striking solution frequency is a number about which one cannot decide whether it was about ability or about the item.',
    },
    daten: { de: 'Aufgabeninhalt, nicht nur Kennung und Statistik', en: 'Item content, not only identifier and statistics' },
    element: null,
    quelle: null,
    reiter: 'items',
    beleg: 'artefakt',
  },
  {
    id: 'pseudonymisierung',
    schicht: 'rahmen',
    name: { de: 'Namen gegen Codes', en: 'Names versus codes' },
    zweck: {
      de: 'Ein Umschalter, der Namen durch Codes ersetzt und die Ergebnisse stehen lässt. Wer eine Rückmeldung auf dem Beamer oder in einer Bildschirmfreigabe bespricht, braucht genau das — und braucht es als einen Griff, nicht als Vorbereitung.',
      en: 'A switch that replaces names with codes and leaves the results standing. Anyone discussing a report on a projector or in a screen share needs exactly this — and needs it as one action, not as preparation.',
    },
    daten: { de: 'Keine — eine Darstellungsentscheidung', en: 'None — a display decision' },
    element: null,
    quelle: null,
    reiter: 'students',
    beleg: 'artefakt',
  },
  {
    id: 'glossar-mit-suche',
    schicht: 'rahmen',
    name: { de: 'Glossar mit Suche', en: 'Glossary with search' },
    zweck: {
      de: 'Die Fachbegriffe an einer Stelle, durchsuchbar, aus jeder Ansicht erreichbar. „Kompetenzstufe", „fairer Vergleich", „Lösungshäufigkeit" sind für die Lesenden nicht selbsterklärend, und ein Tooltip beantwortet nur die Frage, die man an genau dieser Stelle stellt.',
      en: 'The technical terms in one place, searchable, reachable from every view. “Competence level”, “fair comparison”, “solution frequency” are not self-explanatory to readers, and a tooltip only answers the question asked at that exact spot.',
    },
    daten: { de: 'Keine — datenunabhängig gehalten', en: 'None — kept independent of the data' },
    element: null,
    quelle: null,
    reiter: 'help',
    beleg: 'artefakt',
  },
  {
    id: 'export-mit-auswahl',
    schicht: 'rahmen',
    name: { de: 'Export mit Auswahl', en: 'Export with a selection' },
    zweck: {
      de: 'Vor dem Export auswählen, was hineinkommt. Ein Bericht, der alles enthält, wird nicht gelesen; die Auswahl ist der Unterschied zwischen einer Ausgabe und einer Vorlage für die Konferenz.',
      en: 'Choosing what goes in before exporting. A report containing everything does not get read; the selection is the difference between an output and a template for the meeting.',
    },
    daten: { de: 'Der aktuelle Stand der Ansicht plus eine Auswahl', en: 'The current state of the view plus a selection' },
    element: null,
    quelle: null,
    reiter: 'materials',
    beleg: 'artefakt',
  },
];

// ── Logik ──────────────────────────────────────────────────────────────────

/** Trifft ein Eintrag die Auswahl in einem Feld? */
const trifft = (eintrag, { feld, offen }, wert) => {
  const vorhanden = eintrag[feld];
  if (Array.isArray(vorhanden)) {
    // Eine leere Liste heißt bei einem offenen Feld „gilt für alles".
    if (vorhanden.length === 0) return Boolean(offen);
    return vorhanden.includes(wert);
  }
  return vorhanden === wert;
};

/**
 * Filtert die Rückmeldungen. Felder ohne Wert („Alle") schränken nicht ein,
 * unbekannte Felder werden ignoriert — so kostet ein neuer Filter nur einen
 * Eintrag in FILTER. Gefiltert wird über Kürzel (DE, V3, lehrkraft), nicht über
 * Beschriftungen: die Auswahl übersteht damit einen Sprachwechsel.
 */
export function filtern(liste, auswahl = {}) {
  const aktiv = FILTER.filter((f) => auswahl[f.param]);
  return liste.filter((r) => aktiv.every((f) => trifft(r, f, auswahl[f.param])));
}

/**
 * Die auswählbaren Werte eines Feldes — in der Reihenfolge des Vokabulars, und
 * nur die, die zu mindestens einer Rückmeldung führen. Ein Filter zeigt damit
 * nie eine Auswahl, die ins Leere läuft.
 * `text` bleibt das `{ de, en }`-Paar; die Sprache wählt die Seite.
 */
export function optionen(liste, param) {
  const filter = FILTER.find((f) => f.param === param);
  if (!filter) return [];
  return Object.entries(filter.werte)
    .filter(([wert]) => liste.some((r) => trifft(r, filter, wert)))
    .map(([wert, text]) => ({ wert, text }));
}

/** Die Bausteine einer Rückmeldung, in der Reihenfolge des Katalogs. */
export function bausteineVon(rueckmeldung) {
  return BAUSTEINE.filter((b) => rueckmeldung.bausteine.includes(b.id));
}

/** Die Rückmeldungen, die einen Baustein nennen. */
export function rueckmeldungenZu(bausteinId) {
  return RUECKMELDUNGEN.filter((r) => r.bausteine.includes(bausteinId));
}

/** Der Katalog, nach Schichten gruppiert — in der Reihenfolge von SCHICHTEN. */
export function nachSchichten(katalog = BAUSTEINE) {
  return Object.entries(SCHICHTEN).map(([id, schicht]) => ({
    id,
    ...schicht,
    bausteine: katalog.filter((b) => b.schicht === id),
  }));
}
