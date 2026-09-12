// Alle sichtbaren Texte des Komponentenkatalogs, Deutsch und Englisch.
//
// Geordnet wie die Oberfläche: `huelle` für Kopf- und Brotkrumenleiste,
// `vokabular` für die immer wiederkehrenden Begriffe, `index` für die
// Übersichtsseite, `komponenten` für die Beschreibungen je Baustein und
// danach ein Zweig je Ansicht. Platzhalter stehen in geschweiften Klammern.
//
// Die Namen der Komponenten selbst (PercentileBandChart …) bleiben, wie sie im
// Quelltext heißen — sie werden nicht übersetzt.

export const TEXTE = {
  huelle: {
    titel: { de: 'TBA3 Komponentenkatalog', en: 'TBA3 component catalog' },
    stack: {
      de: 'Vue 3 · PrimeVue · Beispieldaten',
      en: 'Vue 3 · PrimeVue · sample data',
    },
    alleKomponenten: { de: 'Alle Komponenten', en: 'All components' },
  },

  vokabular: {
    klasse: { de: 'Klasse', en: 'Class' },
    schule: { de: 'Schule', en: 'School' },
    bundesland: { de: 'Bundesland', en: 'State' },
    land: { de: 'Land', en: 'State' },
    fairerVergleich: { de: 'Fairer Vergleich', en: 'Fair comparison' },
    fairerVergleichKurz: { de: 'Fairer Vgl.', en: 'Fair comp.' },
    schuelerinnen: { de: 'Schüler*innen', en: 'Students' },
    mindeststandardPlus: { de: 'Mindeststandard+', en: 'Min. standard+' },
    unterMindeststandard: { de: 'Unter Mindeststandard', en: 'Below min. standard' },
    stufenIIbisV: { de: 'Stufen II–V · {n} Schüler*innen', en: 'Levels II–V · {n} students' },
    stufeIMitZahl: { de: 'Stufe I · {n} Schüler*innen', en: 'Level I · {n} students' },
    stufe: { de: 'Stufe {n}', en: 'Level {n}' },
    kompetenzstufe: { de: 'Kompetenzstufe', en: 'Competence level' },
    loesungsquote: { de: 'Lösungsquote', en: 'Solution rate' },
    loesungshaeufigkeit: { de: 'Lösungshäufigkeit', en: 'Solution frequency' },
    aufgabe: { de: 'Aufgabe', en: 'Exercise' },
    rohwert: { de: 'Rohwert', en: 'Raw score' },
    perzentilrang: { de: 'Perzentilrang', en: 'Percentile rank' },
    schuelerinKurz: { de: 'SCHÜLER:IN', en: 'STUDENT' },
    hoerverstehen: { de: 'Hörverstehen', en: 'Listening' },
  },

  index: {
    ueberschrift: { de: 'Komponenten', en: 'Components' },
    einleitung: {
      de: 'Vue 3 SVG-Visualisierungen für VERA-Auswertungsdaten. Alle Komponenten lesen die TBA3-Auswertungsschnittstelle direkt — keine granularen Schülerdaten nötig.',
      en: 'Vue 3 SVG visualisations for VERA reporting data. Every component reads the TBA3 reporting API directly — no granular student data needed.',
    },
    quelltext: { de: 'Quelltext', en: 'Source' },
    oeffnen: { de: 'Öffnen', en: 'Open' },
    tabelle: { de: 'Tabelle', en: 'Table' },
  },

  doku: {
    quellcode: { de: 'Quellcode (GitHub)', en: 'Source code (GitHub)' },
    apiSpec: { de: 'TBA3 API Spec', en: 'TBA3 API spec' },
    props: { de: 'Props', en: 'Props' },
    spalteProp: { de: 'Prop', en: 'Prop' },
    spalteTyp: { de: 'Typ', en: 'Type' },
    spalteDefault: { de: 'Default', en: 'Default' },
    spalteBeschreibung: { de: 'Beschreibung', en: 'Description' },
    pflicht: { de: 'required', en: 'required' },
    datenstruktur: { de: 'Datenstruktur', en: 'Data structure' },
    verwendungsbeispiel: { de: 'Verwendungsbeispiel', en: 'Usage example' },
    kopiert: { de: 'Kopiert', en: 'Copied' },
    kopieren: { de: 'Kopieren', en: 'Copy' },
    endpunkte: { de: 'TBA3 API Endpunkte', en: 'TBA3 API endpoints' },
  },

  geschlechter: {
    weiblich: { de: 'weiblich', en: 'female' },
    maennlich: { de: 'männlich', en: 'male' },
    divers: { de: 'divers', en: 'diverse' },
  },

  bausteine: {
    bista: {
      zonen: {
        'KS I': {
          level: { de: 'Unter Mindeststandard', en: 'Below minimum standard' },
          desc: {
            de: 'Grundlegende Kompetenzen noch nicht gesichert.',
            en: 'Basic competences not yet secured.',
          },
        },
        'KS II': {
          level: { de: 'Mindeststandard', en: 'Minimum standard' },
          desc: { de: 'Grundlegende Kompetenzen vorhanden.', en: 'Basic competences in place.' },
        },
        'KS III': {
          level: { de: 'Über Mindeststandard', en: 'Above minimum standard' },
          desc: {
            de: 'Regelstandard oder Optimalstandard erreicht.',
            en: 'Standard or optimal standard reached.',
          },
        },
      },
      titel: {
        de: 'Verteilung der Kompetenzen in {fach} in der Klasse {klasse}',
        en: 'Distribution of competences in {fach} in class {klasse}',
      },
      achse: { de: 'BISTA Werte', en: 'BISTA values' },
    },

    uebersicht: {
      titel: { de: 'Kompetenzübersicht', en: 'Competence overview' },
      kennzahlen: { de: 'Schlüsselkennzahlen', en: 'Key figures' },
      schuelerinnen: { de: 'Schüler*innen', en: 'Students' },
      abMindeststandard: { de: 'Mindeststandard und darüber', en: 'At or above minimum standard' },
      abMindeststandardZusatz: {
        de: 'Kompetenzstufen II–V · {n} Schüler*innen',
        en: 'Competence levels II–V · {n} students',
      },
      unterMindeststandard: { de: 'Unter Mindeststandard', en: 'Below minimum standard' },
      unterMindeststandardZusatz: {
        de: 'Kompetenzstufe I · {n} Schüler*innen',
        en: 'Competence level I · {n} students',
      },
    },

    domaenen: {
      ho: { de: 'Hörverstehen', en: 'Listening comprehension' },
      le: { de: 'Leseverstehen', en: 'Reading comprehension' },
      sr: { de: 'Sprachgebrauch', en: 'Language use' },
      ma: { de: 'Mathematik', en: 'Mathematics' },
      en: { de: 'Englisch', en: 'English' },
      fr: { de: 'Französisch', en: 'French' },
    },

    itemDetail: {
      name: { de: 'Name', en: 'Name' },
      geloest: { de: 'Gelöst', en: 'Solved' },
      punkte: { de: 'Punkte', en: 'Points' },
      schuelerinnenUndSchueler: { de: 'Schülerinnen und Schüler', en: 'Students' },
      geloestVon: { de: '{n}/{gesamt} gelöst', en: '{n}/{gesamt} solved' },
    },

    erwartung: {
      ueber: { de: 'Über Erwartung (>+{n} PP)', en: 'Above expectation (>+{n} pp)' },
      im: { de: 'Im Erwartungsbereich', en: 'Within expectation' },
      unter: { de: 'Unter Erwartung (<−{n} PP)', en: 'Below expectation (<−{n} pp)' },
      wert: { de: 'Erwartungswert (Rasch)', en: 'Expected value (Rasch)' },
    },

    tabelle: {
      kompetenztyp: { de: 'Kompetenztyp', en: 'Competence type' },
      klasseProzent: { de: 'Klasse %', en: 'Class %' },
      schuleProzent: { de: 'Schule %', en: 'School %' },
      landProzent: { de: 'Bundesland %', en: 'State %' },
      suchen: { de: 'Suchen …', en: 'Search …' },
      spalten: { de: 'Spalten', en: 'Columns' },
      kompetenz: { de: 'Kompetenz', en: 'Competence' },
      stufe: { de: 'Stufe', en: 'Level' },
      aufgabentitel: { de: 'Nr. + Aufgabentitel', en: 'No. + exercise title' },
      grafik: { de: 'Grafik', en: 'Chart' },
      details: { de: 'Details', en: 'Details' },
      keineAufgaben: { de: 'Keine Aufgaben gefunden.', en: 'No exercises found.' },
      aufgabe: { de: 'Aufgabe', en: 'Exercise' },
      anzahlAufgaben: { de: '{n} Aufgaben', en: '{n} exercises' },
    },

    mittelwert: {
      achse: { de: 'Mittlere Lösungsquote (%)', en: 'Mean solution rate (%)' },
    },

    band: {
      ueberdurchschnittlich: { de: 'überdurchschnittlich', en: 'above average' },
      marker: { de: 'Schüler*in', en: 'Student' },
      band: { de: 'Streuungsband (MW ± 1 SD)', en: 'Spread band (mean ± 1 SD)' },
      achse: { de: 'Lösungshäufigkeit (%)', en: 'Solution frequency (%)' },
    },

    scatter: {
      xAchse: { de: 'X-Achse', en: 'X axis' },
      yAchse: { de: 'Y-Achse', en: 'Y axis' },
      xWert: { de: 'Kompetenzstufe (gesamt)', en: 'Competence level (overall)' },
      yWert: { de: 'Rohwert (gesamt, %)', en: 'Raw score (overall, %)' },
      cluster: { de: 'Cluster', en: 'Clusters' },
      clustern: { de: 'Clustern', en: 'Cluster' },
      alleAlsGruppen: { de: 'Alle als Gruppen →', en: 'All as groups →' },
      gruppenExportHinweis: {
        de: 'Gruppen-Export — in der Demo nicht umgesetzt',
        en: 'Group export — not implemented in the demo',
      },
      rohwert: { de: 'Rohwert (gesamt)', en: 'Raw score (overall)' },
    },

    schuelerTabelle: {
      insgesamt: { de: 'Insgesamt', en: 'Overall' },
      lesen: { de: 'Lesen', en: 'Reading' },
      hoeren: { de: 'Hören', en: 'Listening' },
      richtig: { de: 'Richtig', en: 'Correct' },
      ausgelassen: { de: 'Ausgelassen', en: 'Skipped' },
      falsch: { de: 'Falsch', en: 'Wrong' },
      schuelerin: { de: 'Schüler:in', en: 'Student' },
      loesungenOeffnen: { de: 'SuS-Lösungen öffnen', en: 'Open the students’ answers' },
      abwesend: {
        de: 'Schüler:in war am Testtag abwesend.',
        en: 'Student was absent on the test day.',
      },
    },

    tooltip: {
      bistaPunkte: { de: 'BISTA-Punkte', en: 'BISTA points' },
    },
  },

  ansichten: {
    gemeinsam: {
      lerngruppe: { de: 'Lerngruppe', en: 'Learning group' },
      gruppeWaehlen: { de: 'Gruppe wählen', en: 'Choose a group' },
      keineDaten: { de: 'Keine Daten.', en: 'No data.' },
      mockHinweis: {
        de: '{fehler} — Läuft der Mock-Server auf localhost:8000?',
        en: '{fehler} — is the mock server running on localhost:8000?',
      },
      neu: { de: 'Neu', en: 'New' },
      schule: { de: 'Schule', en: 'School' },
      bundesland: { de: 'Bundesland', en: 'State' },
      fach: { de: 'Fach', en: 'Subject' },
      ansicht: { de: 'Ansicht', en: 'View' },
      ebene: { de: 'Ebene', en: 'Level' },
    },

    stufen: {
      titel: {
        de: 'Kompetenzstufenverteilung — Klasse · Schule · Fairer Vergleich · Bundesland',
        en: 'Competence level distribution — class · school · fair comparison · state',
      },
      beschreibung: {
        de: 'Horizontale Stapelbalken für jede Ebene: Anteile der Schüler*innen in den Kompetenzstufen I–V. Mit optionalem <strong>Fairen Vergleich</strong> (⚖ Standorttyp) — Referenz zu Schulen mit ähnlicher sozialer Zusammensetzung.',
        en: 'Horizontal stacked bars for every level: the share of students in competence levels I–V. With an optional <strong>fair comparison</strong> (⚖ site type) — a reference to schools with a similar social composition.',
      },
      fairerVergleich: { de: 'Fairer Vergleich', en: 'Fair comparison' },
      fairHinweis: {
        de: 'Schulen mit ähnlicher sozialer Zusammensetzung',
        en: 'Schools with a similar social composition',
      },
      props: {
        rows: {
          de: 'Ein Eintrag pro Ebene (Klasse, Schule, Bundesland). Jeder Eintrag: { label: string, total: number, levels: [{ nameShort, pct }] }',
          en: 'One entry per level (class, school, state). Each entry: { label: string, total: number, levels: [{ nameShort, pct }] }',
        },
        title: {
          de: 'Optionaler Titel über den Balken (z. B. Gruppenname).',
          en: 'Optional title above the bars (e.g. the group name).',
        },
        domain: {
          de: 'Domänenname, der als Abschnittsüberschrift angezeigt wird (z. B. „Hörverstehen“).',
          en: 'Domain name shown as the section heading (e.g. “listening comprehension”).',
        },
      },
      endpunkte: {
        gruppe: {
          de: 'Kompetenzstufenverteilung der Lerngruppe',
          en: 'Competence level distribution of the learning group',
        },
        schule: { de: 'Verteilung auf Schulebene (Referenz)', en: 'Distribution at school level (reference)' },
        land: { de: 'Verteilung auf Bundeslandebene (Referenz)', en: 'Distribution at state level (reference)' },
      },
      hinweis: {
        de: 'Jede Antwort ist ein Array von Value-Groups (eine pro Domäne). Die Komponente benötigt aufbereitete rows-Objekte — siehe Verwendungsbeispiel für das Mapping.',
        en: 'Every response is an array of value groups (one per domain). The component needs prepared rows objects — see the usage example for the mapping.',
      },
    },

    band: {
      beispiel: { de: 'Beispiel {n}', en: 'Example {n}' },
      eins: {
        titel: { de: 'Klasse vs. Schule — Lösungshäufigkeit', en: 'Class vs. school — solution frequency' },
        beschreibung: {
          de: 'Diamant = Lösungshäufigkeit der Klasse pro Aufgabe. Aufgaben sortiert nach Bandmitte, sodass das Band als „blauer Fluss“ von oben-rechts nach unten-links fließt. Sinnvoll für Aggregate: beide Seiten sind Mittelwerte, kein Einzelpersonenvergleich.',
          en: 'Diamond = the class’s solution frequency per exercise. Exercises sorted by the middle of the band, so the band flows as a “blue river” from top right to bottom left. Useful for aggregates: both sides are means, not a comparison of individuals.',
        },
        referenz: { de: 'Referenz (Schule)', en: 'Reference (school)' },
        keineAufgaben: { de: 'Keine übereinstimmenden Aufgaben.', en: 'No matching exercises.' },
        bandHinweis: {
          de: 'Band = Schulverteilung (MW ± 1 SD) als Referenz.',
          en: 'Band = school distribution (mean ± 1 SD) as the reference.',
        },
        aggregatHinweis: {
          de: 'Sinnvoll für Aggregate: beide Seiten sind Mittelwerte, kein Einzelpersonenvergleich.',
          en: 'Useful for aggregates: both sides are means, not a comparison of individuals.',
        },
        marker: { de: 'Klassenmittelwert', en: 'Class mean' },
        band: { de: 'Schulverteilung (MW ± 1 SD)', en: 'School distribution (mean ± 1 SD)' },
      },
      zwei: {
        titel: { de: 'Schule vs. Bundesland — Lösungshäufigkeit', en: 'School vs. state — solution frequency' },
        beschreibung: {
          de: 'Diamant = schulweite Lösungshäufigkeit pro Aufgabe. Band = Landesverteilung (MW ± 1 SD) als Referenz.',
          en: 'Diamond = the school-wide solution frequency per exercise. Band = state distribution (mean ± 1 SD) as the reference.',
        },
        keineDaten: { de: 'Keine Daten.', en: 'No data.' },
        schuleWaehlen: { de: 'Schule wählen', en: 'Choose a school' },
        referenz: { de: 'Referenz (Bundesland)', en: 'Reference (state)' },
        apiHinweis: {
          de: 'Beide Werte kommen direkt aus den API-Endpunkten — keine granularen Schülerdaten nötig.',
          en: 'Both values come straight from the API endpoints — no granular student data needed.',
        },
        marker: { de: 'Schulmittelwert', en: 'School mean' },
        band: { de: 'Landesverteilung (MW ± 1 SD)', en: 'State distribution (mean ± 1 SD)' },
      },
      drei: {
        titel: { de: 'Schüler*in Perzentilrang', en: 'Student percentile rank' },
        beschreibung: {
          de: 'X-Achse = Perzentilrang (0 = schwächste, 100 = stärkste Leistung in der Klasse). Diamant = Rangposition der Schüler*in pro Aufgabe. Band = Interquartilsbereich P25–P75 aller Klassenmitglieder. Aufgaben sortiert nach Band-Mitte für den Fluss-Effekt.',
          en: 'X axis = percentile rank (0 = the weakest, 100 = the strongest performance in the class). Diamond = the student’s rank per exercise. Band = the interquartile range P25–P75 across the class. Exercises sorted by the middle of the band for the river effect.',
        },
        schuelerin: { de: 'Schüler*in', en: 'Student' },
        schuelerinWaehlen: { de: 'Schüler*in wählen', en: 'Choose a student' },
        bandBereich: { de: 'Band (Referenzbereich)', en: 'Band (reference range)' },
        achse: { de: 'Perzentilrang in der Klasse', en: 'Percentile rank within the class' },
        einzelHinweis: {
          de: 'Sinnvoll für Einzelpersonen, weil die X-Achse relativer Rang ist, kein absoluter Score.',
          en: 'Useful for individuals, because the x axis is a relative rank, not an absolute score.',
        },
      },
      titel: {
        de: 'Lösungshäufigkeit mit Streuungsband',
        en: 'Solution frequency with a spread band',
      },
      props: {
        items: {
          de: 'Ein Eintrag pro Aufgabe: { id, label, markerY, bandLow, bandMean, bandHigh }. Alle Werte in %. Aufgaben werden in der gegebenen Reihenfolge gezeichnet.',
          en: 'One entry per exercise: { id, label, markerY, bandLow, bandMean, bandHigh }. All values in %. Exercises are drawn in the given order.',
        },
        title: { de: 'Titel über dem Diagramm.', en: 'Title above the chart.' },
        markerLabel: {
          de: 'Legendenbezeichnung für den Diamant-Marker.',
          en: 'Legend label for the diamond marker.',
        },
        bandLabel: {
          de: 'Legendenbezeichnung für das Referenzband.',
          en: 'Legend label for the reference band.',
        },
        xAxisLabel: { de: 'Beschriftung der X-Achse.', en: 'Label of the x axis.' },
      },
      endpunkte: {
        gruppe: {
          de: 'Lösungsquoten der Lerngruppe pro Aufgabe (markerY)',
          en: 'Solution rates of the learning group per exercise (markerY)',
        },
        schule: {
          de: 'Schulweite Lösungsquoten für Band (MW ± SD)',
          en: 'School-wide solution rates for the band (mean ± SD)',
        },
        land: {
          de: 'Bundeslandweite Lösungsquoten für Band (Variante 2)',
          en: 'State-wide solution rates for the band (variant 2)',
        },
      },
      hinweis: {
        de: 'Für den Klasse-vs.-Schule-Modus: Gruppe fetchen (markerY) + Schule fetchen (Band). Für den Schüler:in-Perzentil-Modus: ?type=students fetchen, Rang der ausgewählten Person berechnen.',
        en: 'For class vs. school: fetch the group (markerY) and the school (band). For the student percentile mode: fetch ?type=students and compute the rank of the selected person.',
      },
    },

    tabelle: {
      titel: {
        de: 'Lösungsquoten auf Aufgabenebene — Klasse · Schule · Bundesland',
        en: 'Solution rates at exercise level — class · school · state',
      },
      beschreibung: {
        de: 'sortierbar. Zeigt Kompetenz, Stufe, Aufgabentitel und Lösungsquoten.',
        en: 'sortable. Shows competence, level, exercise title and solution rates.',
      },
      klasseMitName: { de: 'Klasse', en: 'Class' },
      props: {
        rows: {
          de: 'Aufgabenzeilen. Jede Zeile enthält iqbId, exercise, title, domain, competenceLevel, competenceType, classP, schoolP, stateP.',
          en: 'Exercise rows. Each row holds iqbId, exercise, title, domain, competenceLevel, competenceType, classP, schoolP, stateP.',
        },
        groupLabel: {
          de: 'Bezeichnung für die Klassen-Spalte und Legende.',
          en: 'Label for the class column and the legend.',
        },
        schoolLabel: { de: 'Bezeichnung für die Schul-Spalte.', en: 'Label for the school column.' },
        stateLabel: { de: 'Bezeichnung für die Bundesland-Spalte.', en: 'Label for the state column.' },
      },
      endpunkte: {
        gruppe: {
          de: 'Lösungsstatistiken aller Aufgaben der Lerngruppe',
          en: 'Solution statistics for all exercises of the learning group',
        },
        schule: {
          de: 'Schulweite Lösungsstatistiken (Referenz)',
          en: 'School-wide solution statistics (reference)',
        },
        land: {
          de: 'Bundeslandweite Lösungsstatistiken (Referenz)',
          en: 'State-wide solution statistics (reference)',
        },
      },
      hinweis: {
        de: 'Alle drei Endpunkte parallel fetchen und per iqbId joinen. descriptiveStatistics.mean ist ein Wert 0–1, muss mit ×100 in Prozent umgerechnet werden.',
        en: 'Fetch all three endpoints in parallel and join them by iqbId. descriptiveStatistics.mean is a value between 0 and 1 and has to be multiplied by 100 for percent.',
      },
    },

    scatter: {
      titel: {
        de: 'Schüler*innen-Scatter: Kompetenzstufe × Rohwert',
        en: 'Student scatter: competence level × raw score',
      },
      beschreibung: {
        de: 'Jede Schüler*in als Punkt (Initialen). K-Means-Clustering mit konfigurierbarer Clusteranzahl.',
        en: 'Every student as a dot (initials). K-means clustering with a configurable number of clusters.',
      },
      keineDaten: { de: 'Keine Schüler*innen-Daten.', en: 'No student data.' },
      props: {
        students: {
          de: 'Schülerliste: { id, initials, name, x (Kompetenzstufe 1–5), y (Rohwert % 0–100), details: [{ domain, pct, levelX }] }',
          en: 'Student list: { id, initials, name, x (competence level 1–5), y (raw score % 0–100), details: [{ domain, pct, levelX }] }',
        },
        groupLabel: {
          de: 'Gruppenbezeichnung für den Diagrammtitel.',
          en: 'Group label for the chart title.',
        },
      },
      endpunkte: {
        schueler: {
          de: 'Schülerindividuelle Item-Lösungsquoten — Basis für X/Y-Position im Scatter',
          en: 'Per-student item solution rates — the basis for the x/y position in the scatter plot',
        },
      },
      hinweis: {
        de: 'Der ?type=students-Parameter liefert Value-Groups mit type="student". x wird aus dem Gesamtscore → Kompetenzstufe abgeleitet; y ist der rohe Prozentsatz. K-Means-Clustering und Konvex-Hüllen werden komplett clientseitig berechnet.',
        en: 'The ?type=students parameter returns value groups with type="student". x is derived from the overall score → competence level; y is the raw percentage. K-means clustering and convex hulls are computed entirely on the client.',
      },
    },

    bista: {
      titel: {
        de: 'Kompetenzverteilung Einzelschüler — BISTA-Werte-Strahl',
        en: 'Competence distribution per student — BISTA scale',
      },
      beschreibung: {
        de: 'Zeigt alle Schüler*innen als Avatar-Icons auf einem horizontalen BISTA-Wertestrahl. Drei farbige Kompetenzstreifen (KS I–III) bilden den Hintergrund. Mouseover öffnet den <code>StudentTooltip</code> mit Detailinformationen.',
        en: 'Shows every student as an avatar icon on a horizontal BISTA scale. Three coloured competence bands (levels I–III) form the background. Hovering opens the <code>StudentTooltip</code> with the details.',
      },
      datenhinweis: {
        de: 'Schülerdaten mit BISTA-Werten · Klassen- oder Schulebene',
        en: 'Student data with BISTA values · class or school level',
      },
      tooltipZusatz: {
        de: 'Standalone — kann überall eingebettet werden',
        en: 'Standalone — can be embedded anywhere',
      },
      props: {
        students: {
          de: 'Schülerliste: { id, name, bistaScore, yFrac (0–1, vertikale Streuung), emoji, ringColor, zone?, competencyLevel?, competencyDesc? }',
          en: 'Student list: { id, name, bistaScore, yFrac (0–1, vertical spread), emoji, ringColor, zone?, competencyLevel?, competencyDesc? }',
        },
        subject: {
          de: 'Fachbezeichnung für die Achsenbeschriftung.',
          en: 'Subject label for the axis caption.',
        },
        groupClass: {
          de: 'Klassenkürzel (z. B. „8a“), wird im Titel angezeigt.',
          en: 'Class code (e.g. “8a”), shown in the title.',
        },
        title: {
          de: 'Optionaler Override-Titel. Wird automatisch aus subject + groupClass generiert wenn null.',
          en: 'Optional override title. Generated from subject + groupClass when null.',
        },
        scoreMax: { de: 'Maximaler BISTA-Wert (Ende der X-Achse).', en: 'Maximum BISTA value (end of the x axis).' },
        zones: {
          de: 'Kompetenzstreifen: [{ id, label, from, to, color }]. color=null aktiviert den KS-I-Farbverlauf.',
          en: 'Competence bands: [{ id, label, from, to, color }]. color=null switches on the level I gradient.',
        },
      },
      endpunkte: {
        schueler: {
          de: 'Schülerindividuelle Items inkl. Gesamtscore — Basis für BISTA-Werte',
          en: 'Per-student items including the overall score — the basis for the BISTA values',
        },
      },
      hinweis: {
        de: 'Die Komponente benötigt BISTA-Werte pro Schüler:in. Diese werden typischerweise aus dem ?type=students-Endpunkt abgeleitet (Gesamtscore → BISTA-Skala). Die ringColor und zone werden lokal aus dem Score bestimmt.',
        en: 'The component needs a BISTA value per student. These are typically derived from the ?type=students endpoint (overall score → BISTA scale). ringColor and zone are determined locally from the score.',
      },
    },

    schuelerTabelle: {
      titel: {
        de: 'Lösungshäufigkeiten auf Schüler:innen-Ebene',
        en: 'Solution frequencies at student level',
      },
      beschreibung: {
        de: 'Sortierbare Tabelle mit barrierefreien Balken (kein Rot/Grün) pro Schüler:in und Kompetenzbereich. Enthält Verlinkung zu Testheft und SuS-Lösungen sowie Anzeige abwesender Schüler:innen.',
        en: 'A sortable table with accessible bars (no red/green) per student and competence area. Includes links to the test booklet and the students’ answers, and shows absent students.',
      },
      merkmale: {
        de: 'Barrierearm (Blau/Orange) · Sortierbar nach Lösungsquote · Testheft- & Lösungslinks',
        en: 'Accessible (blue/orange) · sortable by solution rate · booklet and answer links',
      },
      props: {
        rows: {
          de: 'Schüler:innen-Zeilen. Jede Zeile: { id, name, gender, testBooklet: { label, url } | null, solutionUrl: string | null, absent?, domains }',
          en: 'Student rows. Each row: { id, name, gender, testBooklet: { label, url } | null, solutionUrl: string | null, absent?, domains }',
        },
        domains: {
          de: 'Domänen-Konfiguration: [{ key: string, label: string }]. key muss einem Schlüssel in row.domains entsprechen.',
          en: 'Domain configuration: [{ key: string, label: string }]. key has to match a key in row.domains.',
        },
      },
      endpunkte: {
        schueler: {
          de: 'Schülerindividuelle Lösungsquoten — eine Value-Group pro Schüler:in und Domäne',
          en: 'Per-student solution rates — one value group per student and domain',
        },
      },
      hinweis: {
        de: '?type=students liefert Value-Groups mit type="student". Jede Value-Group enthält items mit score-Feldern. pctCorrect/Omitted/Incorrect müssen aus den Einzelscores berechnet werden.',
        en: '?type=students returns value groups with type="student". Every value group holds items with score fields. pctCorrect/Omitted/Incorrect have to be computed from the individual scores.',
      },
    },

    mittelwert: {
      titel: {
        de: 'Mittlere Lösungsquote — Klasse · Schule · Fairer Vergleich · Bundesland',
        en: 'Mean solution rate — class · school · fair comparison · state',
      },
      beschreibung: {
        de: 'Diamant-Marker auf einer horizontalen Skala zeigen die mittlere Lösungsquote je Ebene.',
        en: 'Diamond markers on a horizontal scale show the mean solution rate per level.',
      },
      props: {
        rows: {
          de: 'Ein Eintrag pro Vergleichsebene. Jeder Eintrag: { label, mean, ciLow?, ciHigh?, n?, fair? }. mean in Prozent (0–100).',
          en: 'One entry per comparison level. Each entry: { label, mean, ciLow?, ciHigh?, n?, fair? }. mean in percent (0–100).',
        },
        title: { de: 'Optionaler Titel.', en: 'Optional title.' },
        domain: { de: 'Domänenname als Abschnittsüberschrift.', en: 'Domain name as the section heading.' },
        xLabel: { de: 'Beschriftung der X-Achse.', en: 'Label of the x axis.' },
      },
      endpunkte: {
        gruppe: {
          de: 'Aufgabendaten der Lerngruppe (für Mittelwert)',
          en: 'Exercise data of the learning group (for the mean)',
        },
        schule: { de: 'Schulebene (Referenz)', en: 'School level (reference)' },
        land: { de: 'Bundeslandebene (Referenz)', en: 'State level (reference)' },
      },
      hinweis: {
        de: 'Der Mittelwert wird als Durchschnitt der descriptiveStatistics.mean-Werte aller Items berechnet (0–1 → × 100). CI-Grenzen müssen extern berechnet werden.',
        en: 'The mean is the average of the descriptiveStatistics.mean values across all items (0–1 → × 100). Confidence bounds have to be computed elsewhere.',
      },
    },

    erwartung: {
      titel: {
        de: 'Tatsächliche vs. erwartete Lösungsquote pro Aufgabe',
        en: 'Actual vs. expected solution rate per exercise',
      },
      beschreibung: {
        de: 'Zeigt für jede Aufgabe, ob die Klasse über oder unter dem statistisch erwarteten Wert liegt. Der Erwartungswert wird clientseitig via <strong>Rasch-Modell</strong> aus den BISTA-Schwierigkeitsparametern und dem geschätzten Klassen-Niveau berechnet.',
        en: 'Shows, for every exercise, whether the class is above or below the statistically expected value. The expected value is computed on the client via the <strong>Rasch model</strong>, from the BISTA difficulty parameters and the estimated class level.',
      },
      keinEndpunkt: { de: '— kein zusätzlicher Endpunkt', en: '— no extra endpoint' },
      formelZusatz: {
        de: 'θ = mittl. BISTA gelöster Aufgaben',
        en: 'θ = mean BISTA of the solved exercises',
      },
      klassenNiveau: { de: 'Geschätztes Klassen-Niveau', en: 'Estimated class level' },
      props: {
        items: {
          de: 'Ein Eintrag pro Aufgabe: { label, level, actual, expected }. actual und expected in Prozent (0–100).',
          en: 'One entry per exercise: { label, level, actual, expected }. actual and expected in percent (0–100).',
        },
        title: { de: 'Optionaler Titel.', en: 'Optional title.' },
        domain: { de: 'Domänenname als Abschnittsüberschrift.', en: 'Domain name as the section heading.' },
      },
      endpunkte: {
        gruppe: {
          de: 'Aufgabendaten mit descriptiveStatistics.mean und parameters.bistaPoints',
          en: 'Exercise data with descriptiveStatistics.mean and parameters.bistaPoints',
        },
      },
      hinweis: {
        de: 'Kein zusätzlicher Endpunkt nötig. Der Erwartungswert wird clientseitig via Rasch-Modell aus bistaPoints und dem geschätzten Klassen-BISTA berechnet.',
        en: 'No extra endpoint needed. The expected value is computed on the client via the Rasch model, from bistaPoints and the estimated class BISTA.',
      },
    },

    uebersicht: {
      titel: {
        de: 'Kompetenzübersicht — Donut-Diagramm & Schlüsselkennzahlen',
        en: 'Competence overview — donut chart & key figures',
      },
      beschreibung: {
        de: 'Zwei Karten nebeneinander: Links ein SVG-Donut-Diagramm mit Kompetenzstufenverteilung, rechts die Schlüsselkennzahlen „Mindeststandard und darüber“ vs. „Unter Mindeststandard“.',
        en: 'Two cards side by side: on the left an SVG donut chart of the competence level distribution, on the right the key figures “at or above the minimum standard” vs. “below the minimum standard”.',
      },
      props: {
        chartData: {
          de: 'Ein Eintrag pro Kompetenzstufe: { level, count, percentage (0–1), color, name }',
          en: 'One entry per competence level: { level, count, percentage (0–1), color, name }',
        },
        stats: {
          de: '{ total, belowStandard, atStandard, aboveStandard } — alle als Anteile (0–1)',
          en: '{ total, belowStandard, atStandard, aboveStandard } — all as shares (0–1)',
        },
        subject: {
          de: 'Fachbezeichnung, die im Donut-Zentrum angezeigt wird (z. B. „Deutsch“).',
          en: 'Subject label shown at the centre of the donut (e.g. “German”).',
        },
      },
      endpunkt: {
        de: 'Kompetenzstufenverteilung der Lerngruppe (aggregiert über alle Domänen)',
        en: 'Competence level distribution of the learning group (aggregated across all domains)',
      },
      hinweis: {
        de: 'Die Komponente aggregiert alle Domänen zu einer Gesamtverteilung. Für eine domänenspezifische Ansicht bitte CompetenceLevelBar verwenden.',
        en: 'The component aggregates all domains into one overall distribution. For a domain-specific view, use CompetenceLevelBar instead.',
      },
    },
  },

  komponenten: {
    ItemExpectedActualChart: {
      beschreibung: {
        de: 'Tatsächliche vs. erwartete Lösungsquote pro Aufgabe. Der Erwartungswert kommt aus dem Rasch-Modell (BISTA-Parameter). Rot = unter Erwartung → direkter didaktischer Hinweis.',
        en: 'Actual vs. expected solution rate per exercise. The expected value comes from the Rasch model (BISTA parameters). Red = below expectation → a direct pedagogical cue.',
      },
      faelle: {
        de: [
          'Welche Aufgaben hat die Klasse besser/schlechter als erwartet gelöst?',
          'Didaktischer Handlungsbedarf auf Aufgabenebene erkennen',
          'Rasch-Erwartungswert aus bistaPoints, kein neuer Endpunkt nötig',
        ],
        en: [
          'Which exercises did the class solve better or worse than expected?',
          'Spot where teaching action is needed, exercise by exercise',
          'Rasch expectation from bistaPoints — no new endpoint required',
        ],
      },
    },
    MeanComparisonChart: {
      beschreibung: {
        de: 'Mittlere Lösungsquote als Diamant-Marker auf einer horizontalen Skala. Vergleicht Klasse, Schule, Fairen Vergleich (⚖ Standorttyp) und Bundesland — inkl. optionaler Konfidenzintervalle.',
        en: 'Mean solution rate as a diamond marker on a horizontal scale. Compares class, school, fair comparison (⚖ site type) and state — with optional confidence intervals.',
      },
      faelle: {
        de: [
          'Wo liegt meine Klasse im Vergleich zu ähnlichen Schulen?',
          'Fairer Vergleich (Standorttyp) als Referenzlinie',
          'Konfidenzintervalle für Lehrpersonen-Feedback',
        ],
        en: [
          'Where does my class stand compared with similar schools?',
          'Fair comparison (site type) as a reference line',
          'Confidence intervals for feedback to teachers',
        ],
      },
    },
    BistaDistributionChart: {
      beschreibung: {
        de: 'Alle Schüler*innen als Avatar-Icons auf einem horizontalen BISTA-Wertestrahl. Drei Kompetenzstreifen (KS I–III) als Hintergrund. Mouseover zeigt StudentTooltip mit Detailinformationen.',
        en: 'Every student as an avatar icon on a horizontal BISTA scale. Three competence bands (levels I–III) in the background. Hovering shows StudentTooltip with the details.',
      },
      faelle: {
        de: [
          'Individuelle BISTA-Scores einer Klasse visualisieren',
          'Kompetenzzonenverteilung auf Schüler*innenebene',
        ],
        en: [
          'Visualise the individual BISTA scores of a class',
          'Distribution across competence zones, student by student',
        ],
      },
    },
    CompetencyOverviewCards: {
      beschreibung: {
        de: 'Zwei Karten nebeneinander: SVG-Donut-Diagramm mit Kompetenzstufenverteilung und Schlüsselkennzahlen (Mindeststandard und darüber vs. darunter).',
        en: 'Two cards side by side: an SVG donut chart of the competence level distribution, and the key figures (at or above the minimum standard vs. below).',
      },
      faelle: {
        de: [
          'Schnellübersicht Kompetenzverteilung einer Klasse',
          'Anteil Schüler*innen über/unter Mindeststandard',
        ],
        en: [
          'A quick view of a class’s competence distribution',
          'Share of students above and below the minimum standard',
        ],
      },
    },
    PercentileBandChart: {
      beschreibung: {
        de: 'Visualisiert Lösungshäufigkeit oder Perzentilrang pro Aufgabe als Diamant-Marker, überlagert mit einem Streuungsband der Referenzgruppe.',
        en: 'Shows the solution frequency or percentile rank per exercise as a diamond marker, laid over the spread band of the reference group.',
      },
      faelle: {
        de: [
          'Klasse vs. Schule — Lösungshäufigkeit',
          'Schule vs. Bundesland — Lösungshäufigkeit',
          'Schüler*in Perzentilrang in der Klasse',
        ],
        en: [
          'Class vs. school — solution frequency',
          'School vs. state — solution frequency',
          'A student’s percentile rank within the class',
        ],
      },
    },
    CompetenceLevelBar: {
      beschreibung: {
        de: 'Zeigt die Kompetenzstufenverteilung (I–V) als horizontale Stapelbalken. Mehrere Ebenen (Klasse, Schule, Bundesland) direkt vergleichbar.',
        en: 'Shows the competence level distribution (I–V) as horizontal stacked bars. Several levels (class, school, state) can be compared directly.',
      },
      faelle: {
        de: [
          'Kompetenzstufenverteilung einer Klasse',
          'Vergleich Klasse · Schule · Bundesland',
        ],
        en: [
          'Competence level distribution of a class',
          'Comparison of class · school · state',
        ],
      },
    },
    StudentSolutionTable: {
      beschreibung: {
        de: 'Lösungshäufigkeiten auf Schüler:innen-Ebene. Barrierefreie Balken (Blau/Orange statt Rot/Grün), sortierbar nach Lösungsquote, Verlinkung zu Testheft und SuS-Lösungen.',
        en: 'Solution frequencies at student level. Accessible bars (blue/orange instead of red/green), sortable by solution rate, with links to the test booklet and the students’ answers.',
      },
      faelle: {
        de: [
          'Individuelle Lösungsquoten pro Schüler:in und Kompetenzbereich',
          'Sortierung hoch → tief / tief → hoch nach Lösungsquote',
          'Verlinkung zu Testheft und SuS-Lösungsansichten',
        ],
        en: [
          'Individual solution rates per student and competence area',
          'Sorting high → low and low → high by solution rate',
          'Links to the test booklet and the students’ answer views',
        ],
      },
    },
    ItemSolutionTable: {
      beschreibung: {
        de: 'Lösungsquoten auf Aufgabenebene als sortierbare Tabelle mit internen Balkendiagrammen. Spaltentoggle und Textsuche für Kompetenz, Stufe und Aufgabentitel.',
        en: 'Solution rates at exercise level as a sortable table with inline bar charts. Column toggles and a text search across competence, level and exercise title.',
      },
      faelle: {
        de: [
          'Lösungsquoten Klasse vs. Schule vs. Bundesland',
          'Suche & Filter nach Aufgabe / Kompetenz / Stufe',
          'Opt-in: Kompetenztyp und numerische Prozentwerte',
        ],
        en: [
          'Solution rates for class vs. school vs. state',
          'Search and filter by exercise, competence or level',
          'Opt-in: competence type and numeric percentages',
        ],
      },
    },
    StudentScatterPlot: {
      beschreibung: {
        de: 'Schüler*innen-Scatter: Kompetenzstufe (X) × Rohwert % (Y) mit K-Means-Clustering, Konvex-Hüll-Regionen (dashed) und interaktiver Detailcard.',
        en: 'Student scatter plot: competence level (x) × raw score % (y) with k-means clustering, convex hull regions (dashed) and an interactive detail card.',
      },
      faelle: {
        de: [
          'Leistungsverteilung einer Klasse im Überblick',
          'Gruppen ähnlicher Schüler*innen identifizieren',
          'Einzelne Schüler*in im Klassenkontext verorten',
        ],
        en: [
          'The performance spread of a class at a glance',
          'Identify groups of similar students',
          'Place an individual student in the context of the class',
        ],
      },
    },
  },
};
