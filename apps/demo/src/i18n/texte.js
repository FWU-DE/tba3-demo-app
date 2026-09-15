// Alle sichtbaren Texte der Demoanwendung, Deutsch und Englisch.
//
// Geordnet wie die Oberfläche: ein Zweig je Bereich, darunter die Schlüssel in
// der Reihenfolge, in der sie auf dem Schirm auftauchen. Platzhalter stehen in
// geschweiften Klammern (`{n}`) und werden von `t()` gefüllt.
//
// Fachbegriffe bleiben, wo sie feststehen: Kompetenzstufe → competence level,
// Lerngruppe → learning group, Item bleibt Item.

export const TEXTE = {
  // ── Vokabular ────────────────────────────────────────────────────────────
  // Zu den Kennungen aus utils/constants.js; aufgelöst über useKonstanten().
  faecher: {
    DE: { de: 'Deutsch', en: 'German' },
    MA: { de: 'Mathematik', en: 'Mathematics' },
    EN: { de: 'Englisch', en: 'English' },
    FR: { de: 'Französisch', en: 'French' },
  },

  klassenstufen: {
    V3: { de: 'Klasse 3', en: 'Grade 3' },
    V8: { de: 'Klasse 8', en: 'Grade 8' },
    V3Beschreibung: {
      de: 'Vergleichsarbeiten Klasse 3',
      en: 'VERA comparative assessment, grade 3',
    },
    V8Beschreibung: {
      de: 'Vergleichsarbeiten Klasse 8',
      en: 'VERA comparative assessment, grade 8',
    },
  },

  kompetenzstufen: {
    I: {
      name: { de: 'Kompetenzstufe I', en: 'Competence level I' },
      beschreibung: { de: 'Unter Mindeststandard', en: 'Below minimum standard' },
    },
    II: {
      name: { de: 'Kompetenzstufe II', en: 'Competence level II' },
      beschreibung: { de: 'Mindeststandard', en: 'Minimum standard' },
    },
    III: {
      name: { de: 'Kompetenzstufe III', en: 'Competence level III' },
      beschreibung: { de: 'Regelstandard', en: 'Standard' },
    },
    IV: {
      name: { de: 'Kompetenzstufe IV', en: 'Competence level IV' },
      beschreibung: { de: 'Regelstandard Plus', en: 'Standard plus' },
    },
    V: {
      name: { de: 'Kompetenzstufe V', en: 'Competence level V' },
      beschreibung: { de: 'Optimalstandard', en: 'Optimal standard' },
    },
  },

  geschlechter: {
    f: { de: 'Weiblich', en: 'Female' },
    m: { de: 'Männlich', en: 'Male' },
    d: { de: 'Divers', en: 'Diverse' },
  },

  sprachen: {
    german: { de: 'Deutsch', en: 'German' },
    english: { de: 'Englisch', en: 'English' },
    french: { de: 'Französisch', en: 'French' },
    other: { de: 'Andere', en: 'Other' },
  },

  datentypen: {
    group: { de: 'Nur Gruppe', en: 'Group only' },
    students: { de: 'Nur Schüler*innen', en: 'Students only' },
    both: { de: 'Beide', en: 'Both' },
  },

  materialarten: {
    worksheet: { de: 'Übungsblatt', en: 'Worksheet' },
    video: { de: 'Lernvideo', en: 'Learning video' },
    game: { de: 'Lernspiel', en: 'Learning game' },
    task_set: { de: 'Aufgabenset', en: 'Task set' },
    support: { de: 'Fördermaterial', en: 'Support material' },
    reading: { de: 'Lesetext', en: 'Reading text' },
  },

  header: {
    dokumentTitel: { de: 'TBA3 Demoanwendung', en: 'TBA3 demo application' },
    titel: { de: 'TBA3 Demo', en: 'TBA3 demo' },
    untertitel: {
      de: 'VERA Auswertungsschnittstelle – Interaktive Datenvisualisierung',
      en: 'VERA reporting API – interactive data visualisation',
    },
    mockServer: { de: 'Mock Server', en: 'Mock server' },
    beobachterAn: {
      de: 'Observer-Modus deaktivieren',
      en: 'Turn observer mode off',
    },
    beobachterAus: {
      de: 'Observer-Modus aktivieren — Namen werden unkenntlich gemacht',
      en: 'Turn observer mode on — names are obscured',
    },
    beobachter: { de: 'Observer', en: 'Observer' },
    namen: { de: 'Namen', en: 'Names' },
    einstellungen: { de: 'Einstellungen', en: 'Settings' },
  },

  einstellungen: {
    nutzer: { de: 'Demo-Nutzer', en: 'Demo user' },
    schliessen: { de: 'Schließen', en: 'Close' },
    demodaten: { de: 'Demo-Daten', en: 'Demo data' },
    zuruecksetzenTitel: {
      de: 'Lokale Daten zurücksetzen',
      en: 'Reset local data',
    },
    zuruecksetzenText: {
      de: 'Löscht alle Zuweisungen, eigene Gruppen und importierten MUNDO-Materialien aus dem Browser-Speicher.',
      en: 'Clears all assignments, custom groups and imported MUNDO materials from browser storage.',
    },
    geloescht: { de: '✓ Gelöscht', en: '✓ Cleared' },
    zuruecksetzen: { de: 'Zurücksetzen', en: 'Reset' },
    appInfo: { de: 'App-Info', en: 'App info' },
    version: { de: 'Version', en: 'Version' },
    modus: { de: 'Modus', en: 'Mode' },
    datenspeicher: { de: 'Datenspeicher', en: 'Data storage' },
    datenspeicherWert: {
      de: 'localStorage (Browser)',
      en: 'localStorage (browser)',
    },
  },

  seitenleiste: {
    filter: { de: 'Filter', en: 'Filters' },
    ebene: { de: 'Ebene', en: 'Level' },
    gruppe: { de: 'Gruppe', en: 'Group' },
    schule: { de: 'Schule', en: 'School' },
    bundesland: { de: 'Bundesland', en: 'State' },
    lerngruppe: { de: 'Lerngruppe', en: 'Learning group' },
    keineGruppen: { de: 'Keine Gruppen verfügbar', en: 'No groups available' },
    fach: { de: 'Fach', en: 'Subject' },
    alleFaecher: { de: 'Alle Fächer', en: 'All subjects' },
    klassenstufe: { de: 'Klassenstufe', en: 'Grade' },
    alleKlassenstufen: { de: 'Alle Klassenstufen', en: 'All grades' },
    datentyp: { de: 'Datentyp', en: 'Data type' },
    fuss: {
      de: 'TBA3 Demonstration App',
      en: 'TBA3 demonstration app',
    },
  },

  reiter: {
    competence: { de: 'Kompetenzstufen', en: 'Competence levels' },
    delta: { de: 'Vergleichsauswertung', en: 'Comparison' },
    items: { de: 'Item-Statistiken', en: 'Item statistics' },
    aggregations: { de: 'Aggregationen', en: 'Aggregations' },
    students: { de: 'Schüler*innen', en: 'Students' },
    materials: { de: 'Lernmaterialien', en: 'Learning materials' },
    help: { de: 'Hilfe', en: 'Help' },
  },

  gemeinsam: {
    laden: { de: 'Laden...', en: 'Loading…' },
    fehlerTitel: { de: 'Fehler beim Laden der Daten', en: 'Could not load the data' },
    fehlerUnbekannt: {
      de: 'Ein unbekannter Fehler ist aufgetreten',
      en: 'An unknown error occurred',
    },
    erneutVersuchen: { de: 'Erneut versuchen', en: 'Try again' },
    entfernen: { de: 'Entfernen', en: 'Remove' },
    schuelerEiner: { de: '{n} Schüler*in', en: '{n} student' },
    schuelerMehrere: { de: '{n} Schüler*innen', en: '{n} students' },
    stufe: { de: 'Stufe {n}', en: 'Level {n}' },
  },

  uebersicht: {
    titel: { de: 'Kompetenzübersicht', en: 'Competence overview' },
    schuelerinnen: { de: 'Schüler*innen', en: 'Students' },
    kennzahlen: { de: 'Schlüsselkennzahlen', en: 'Key figures' },
    abMindeststandard: {
      de: 'Mindeststandard und darüber',
      en: 'At or above minimum standard',
    },
    abMindeststandardZusatz: {
      de: 'Kompetenzstufen II–V · {anzahl}',
      en: 'Competence levels II–V · {anzahl}',
    },
    unterMindeststandard: { de: 'Unter Mindeststandard', en: 'Below minimum standard' },
    unterMindeststandardZusatz: {
      de: 'Kompetenzstufe I · {anzahl}',
      en: 'Competence level I · {anzahl}',
    },
  },

  kompetenzstufenDiagramm: {
    titel: { de: 'Kompetenzstufen-Verteilung', en: 'Competence level distribution' },
    keineDaten: { de: 'Keine Daten verfügbar', en: 'No data available' },
    gesamt: { de: 'Gesamt', en: 'Total' },
    schuelerinnen: { de: 'Schüler*innen', en: 'Students' },
    unterStandard: { de: 'Unter Standard', en: 'Below standard' },
    stufeI: { de: 'Stufe I', en: 'Level I' },
    ueberStandard: { de: 'Über Standard', en: 'Above standard' },
    stufeIVundV: { de: 'Stufe IV & V', en: 'Levels IV & V' },
    anzahl: { de: 'Anzahl', en: 'Count' },
    anteil: { de: 'Anteil', en: 'Share' },
  },

  itemDiagramm: {
    titel: { de: 'Item-Statistiken', en: 'Item statistics' },
    keineDaten: { de: 'Keine Item-Daten verfügbar', en: 'No item data available' },
    einleitung: {
      de: 'Zeigt die Lösungshäufigkeit für jedes Item an. Bewegen Sie den Mauszeiger über einen Balken, um Details zu sehen.',
      en: 'Shows the solution frequency for each item. Hover over a bar to see the details.',
    },
    anzahlItems: { de: 'Anzahl Items:', en: 'Number of items:' },
    loesungshaeufigkeit: { de: 'Lösungshäufigkeit:', en: 'Solution frequency:' },
    aufgabe: { de: 'Aufgabe:', en: 'Exercise:' },
    kompetenzstufe: { de: 'Kompetenzstufe:', en: 'Competence level:' },
    metadaten: { de: 'IQB Metadaten:', en: 'IQB metadata:' },
  },

  aggregationen: {
    apiTitel: { de: 'API-Aggregationen', en: 'API aggregations' },
    gesamt: { de: 'Gesamt', en: 'Total' },
    verteilungTitel: {
      de: 'Kompetenzverteilung – {auswahl}',
      en: 'Competence distribution – {auswahl}',
    },
    alle: { de: 'Alle', en: 'All' },
    verteilungEinleitung: {
      de: 'Verteilung der Kompetenzstufen basierend auf den Schülerdaten der aktuellen Auswahl.',
      en: 'Distribution of competence levels based on the student data of the current selection.',
    },
    schuelerinnen: { de: 'Schüler*innen', en: 'Students' },
    haeufigsteStufe: { de: 'Häufigste Stufe', en: 'Most common level' },
    foerderbedarf: { de: 'Förder\u00adbedarf (I–II)', en: 'Needs support (I–II)' },
    anteilIundII: { de: 'Anteil I–II', en: 'Share I–II' },
    nachStufe: { de: 'Verteilung nach Kompetenzstufe', en: 'Distribution by competence level' },
    keineSchueler: {
      de: 'Keine Schüler*innen für diese Auswahl.',
      en: 'No students for this selection.',
    },
    nachTeilbereichen: { de: 'Verteilung nach Teilbereichen', en: 'Distribution by domain' },
    items: { de: '{n} Items', en: '{n} items' },
    mittlereLoesung: { de: 'Ø Lösungshäufigkeit', en: 'Avg. solution frequency' },
    haeufigkeit: { de: 'Häufigkeit', en: 'Frequency' },
    standardabweichung: { de: 'Standardabw.', en: 'Std. deviation' },
    stufenVerteilung: { de: 'Kompetenzstufen-Verteilung', en: 'Competence level distribution' },
    aufgabenLoesung: {
      de: 'Aufgaben – Lösungshäufigkeit ({n})',
      en: 'Exercises – solution frequency ({n})',
    },
    aufgabeKurz: { de: 'Aufg. {n}', en: 'Ex. {n}' },
    loesungshaeufigkeit: { de: 'Lösungshäufigkeit', en: 'Solution frequency' },
    schuelerZahl: { de: '{n} Schüler*innen', en: '{n} students' },
    anteilDerGruppe: { de: '{n}% der Gruppe', en: '{n}% of the group' },
    schuelerMitAnteil: { de: '{n} Schüler*innen ({pct}%)', en: '{n} students ({pct}%)' },
  },

  vergleich: {
    titel: { de: 'Vergleichsauswertung', en: 'Comparison' },
    keineGruppe: {
      de: 'Bitte eine Lerngruppe auswählen.',
      en: 'Please select a learning group.',
    },
    landesmittelwert: { de: 'Landesmittelwert', en: 'State average' },
    vergleichsschule: { de: 'Vergleichsschule', en: 'Comparison school' },
    testheft: { de: 'Testheft', en: 'Test booklet' },
    vergangene: { de: 'Vergangene Durchgänge', en: 'Past assessments' },
    domaenen: {
      ho: { de: 'Hörverstehen', en: 'Listening comprehension' },
      le: { de: 'Leseverstehen', en: 'Reading comprehension' },
      rs: { de: 'Rechtschreibung', en: 'Spelling' },
    },
    prozentpunkteZu: { de: '+{n} Pp.', en: '+{n} pp' },
    prozentpunkteAb: { de: '{n} Pp.', en: '{n} pp' },
    achseProzentpunkte: { de: '{n} Pp.', en: '{n} pp' },
    vergleicheWaehlen: { de: 'Vergleiche auswählen', en: 'Choose comparisons' },
    auswaehlen: { de: 'auswählen', en: 'choose' },
    gegen: { de: 'vs. {name}', en: 'vs. {name}' },
    obereStufen: {
      de: 'Obere Stufen <strong>{eigen} %</strong> / <strong style="color:{farbe}">{andere} %</strong>, Unter Mindeststandard <strong>{eigenUnten} %</strong> / <strong style="color:{farbe}">{andereUnten} %</strong>',
      en: 'Upper levels <strong>{eigen} %</strong> / <strong style="color:{farbe}">{andere} %</strong>, below minimum standard <strong>{eigenUnten} %</strong> / <strong style="color:{farbe}">{andereUnten} %</strong>',
    },
    vergleichMit: { de: 'Vergleich mit {name}', en: 'Comparison with {name}' },
    satzUnterMindest: {
      de: 'In <strong>Schule</strong> liegen <strong>{eigen} %</strong> der Teilnehmenden <span class="inline-block w-2 h-2 rounded-full bg-orange-400 mx-0.5 mb-0.5 align-middle"></span> <strong>unter Mindeststandard</strong>, bei <strong>{name}</strong> sind es <strong>{andere} %</strong>.',
      en: 'At <strong>school</strong> level, <strong>{eigen} %</strong> of participants are <span class="inline-block w-2 h-2 rounded-full bg-orange-400 mx-0.5 mb-0.5 align-middle"></span> <strong>below the minimum standard</strong>; for <strong>{name}</strong> it is <strong>{andere} %</strong>.',
    },
    satzOptimal: {
      de: 'In <strong>Schule</strong> erreichen <strong>{eigen} %</strong> der Teilnehmenden den <span class="inline-block w-2 h-2 rounded-full bg-yellow-400 mx-0.5 mb-0.5 align-middle"></span> <strong>Optimalstandard</strong>, bei <strong>{name}</strong> sind es <strong>{andere} %</strong>.',
      en: 'At <strong>school</strong> level, <strong>{eigen} %</strong> of participants reach the <span class="inline-block w-2 h-2 rounded-full bg-yellow-400 mx-0.5 mb-0.5 align-middle"></span> <strong>optimal standard</strong>; for <strong>{name}</strong> it is <strong>{andere} %</strong>.',
    },
    satzObereStufen: {
      de: 'In <strong>Schule</strong> erreichen <strong>{eigen} %</strong> der Teilnehmenden die <span class="inline-block w-2 h-2 rounded-full bg-blue-400 mx-0.5 mb-0.5 align-middle"></span><span class="inline-block w-2 h-2 rounded-full bg-yellow-400 mb-0.5 align-middle"></span> <strong>oberen Stufen</strong>, bei <strong>{name}</strong> sind es <strong>{andere} %</strong>.',
      en: 'At <strong>school</strong> level, <strong>{eigen} %</strong> of participants reach the <span class="inline-block w-2 h-2 rounded-full bg-blue-400 mx-0.5 mb-0.5 align-middle"></span><span class="inline-block w-2 h-2 rounded-full bg-yellow-400 mb-0.5 align-middle"></span> <strong>upper levels</strong>; for <strong>{name}</strong> it is <strong>{andere} %</strong>.',
    },
  },

  schueler: {
    titel: { de: 'Schüler*innen ({n})', en: 'Students ({n})' },
    datenblatt: { de: 'Datenblatt', en: 'Data sheet' },
    datenblattAnzeigen: { de: 'Datenblatt anzeigen', en: 'Show data sheet' },
    nameSuchen: { de: 'Name suchen…', en: 'Search by name…' },
    alleKlassen: { de: 'Alle Klassen', en: 'All classes' },
    alleFaecher: { de: 'Alle Fächer', en: 'All subjects' },
    alleKlassenstufen: { de: 'Alle Klassenstufen', en: 'All grades' },
    alleStufen: { de: 'Alle Stufen', en: 'All levels' },
    stufeMitText: { de: 'Stufe {n} – {text}', en: 'Level {n} – {text}' },
    angezeigtEiner: { de: '{n} Schüler*in angezeigt', en: '{n} student shown' },
    angezeigtMehrere: { de: '{n} Schüler*innen angezeigt', en: '{n} students shown' },
    ausgewaehltZusatz: { de: '· {n} ausgewählt', en: '· {n} selected' },
    auswahlAufheben: { de: 'Auswahl aufheben', en: 'Clear selection' },
    keineGefunden: { de: 'Keine Schüler*innen gefunden.', en: 'No students found.' },
    ausgewaehltEiner: { de: '{n} Schüler*in ausgewählt', en: '{n} student selected' },
    ausgewaehltMehrere: { de: '{n} Schüler*innen ausgewählt', en: '{n} students selected' },
    gruppeWaehlen: { de: 'Gruppe wählen…', en: 'Choose a group…' },
    hinzufuegen: { de: 'Hinzufügen', en: 'Add' },
    neuerGruppenname: { de: 'Name der neuen Gruppe…', en: 'Name of the new group…' },
    erstellenUndHinzufuegen: { de: 'Erstellen & hinzufügen', en: 'Create & add' },
    abbrechen: { de: 'Abbrechen', en: 'Cancel' },
    neueGruppe: { de: '+ Neue Gruppe erstellen', en: '+ Create a new group' },
    neueLeereGruppe: { de: '+ Neue leere Gruppe erstellen', en: '+ Create a new empty group' },
    gruppeErstellt: { de: 'Gruppe „{name}“ erstellt.', en: 'Group “{name}” created.' },
    zuGruppeHinzugefuegtEiner: {
      de: '{n} Schüler*in zu „{name}“ hinzugefügt.',
      en: '{n} student added to “{name}”.',
    },
    zuGruppeHinzugefuegtMehrere: {
      de: '{n} Schüler*innen zu „{name}“ hinzugefügt.',
      en: '{n} students added to “{name}”.',
    },
    karteTitel: { de: 'Schüler-Karte', en: 'Student map' },
    karteUnterzeile: {
      de: 'Interaktive 2D-Visualisierung · Clustering · Gruppenbildung',
      en: 'Interactive 2D visualisation · clustering · group building',
    },
    eigeneGruppen: { de: 'Eigene Gruppen', en: 'Custom groups' },
    keineEigenenGruppen: {
      de: 'Noch keine eigenen Gruppen. Wählen Sie Schüler*innen aus und erstellen Sie eine Gruppe.',
      en: 'No custom groups yet. Select students and create a group.',
    },
    erstellen: { de: 'Erstellen', en: 'Create' },
    gruppenname: { de: 'Gruppenname…', en: 'Group name…' },
    mitglieder: { de: '{n} Mitgl.', en: '{n} members' },
    umbenennen: { de: 'Umbenennen', en: 'Rename' },
    gruppeLoeschen: { de: 'Gruppe löschen', en: 'Delete group' },
    keineMitglieder: { de: 'Noch keine Mitglieder', en: 'No members yet' },
    mitgliederBearbeiten: { de: 'Mitglieder bearbeiten', en: 'Edit members' },
    materialien: { de: 'Materialien →', en: 'Materials →' },
    ausgewaehlt: { de: 'ausgewählt', en: 'selected' },
    neu: { de: '+{n} neu', en: '+{n} new' },
    entfernt: { de: '−{n} entfernt', en: '−{n} removed' },
    angezeigt: { de: '{n} angezeigt', en: '{n} shown' },
    speichern: { de: 'Speichern', en: 'Save' },
  },

  gruppierung: {
    titel: { de: 'Automatische Gruppierung', en: 'Automatic grouping' },
    unterzeile: {
      de: 'Schüler*innen anhand ihrer Kompetenzstufe automatisch in Gruppen einteilen',
      en: 'Sort students into groups automatically, based on their competence level',
    },
    strategie: { de: 'Strategie', en: 'Strategy' },
    strategien: {
      by_level: {
        label: { de: 'Nach Kompetenzstufe', en: 'By competence level' },
        beschreibung: { de: '5 Gruppen – eine pro Stufe', en: '5 groups – one per level' },
      },
      three_tier: {
        label: { de: 'Dreistufig', en: 'Three tiers' },
        beschreibung: {
          de: '3 Gruppen – Fördern · Regelstandard · Fordern',
          en: '3 groups – support · standard · challenge',
        },
      },
      two_tier: {
        label: { de: 'Zweigeteilt', en: 'Two tiers' },
        beschreibung: {
          de: '2 Gruppen – Förderung & Fortgeschrittene',
          en: '2 groups – support & advanced',
        },
      },
    },
    gruppen: {
      foerder: { de: 'Fördergruppe', en: 'Support group' },
      regel: { de: 'Regelgruppe', en: 'Standard group' },
      erweiter: { de: 'Erweiterungsgruppe', en: 'Extension group' },
      support: { de: 'Fördergruppe', en: 'Support group' },
      advanced: { de: 'Fortgeschrittene', en: 'Advanced' },
    },
    schuelerAus: { de: 'Schüler*innen aus', en: 'Students from' },
    alleKlassen: { de: 'Alle Klassen ({n})', en: 'All classes ({n})' },
    alleFaecher: { de: 'Alle Fächer', en: 'All subjects' },
    werdenEingeteilt: {
      de: '→ <strong>{n}</strong> Schüler*innen werden eingeteilt',
      en: '→ <strong>{n}</strong> students will be sorted',
    },
    namenszusatz: { de: 'Namenszusatz (optional)', en: 'Name suffix (optional)' },
    namenszusatzBeispiel: {
      de: 'z.B. Klasse 3a, Schuljahr 25/26',
      en: 'e.g. class 3a, school year 25/26',
    },
    namenszusatzVorschau: { de: '→ z.B. „{name}“', en: '→ e.g. “{name}”' },
    beispielZusatz: { de: 'Klasse 3a', en: 'class 3a' },
    vorschau: { de: 'Vorschau', en: 'Preview' },
    schuelerIn: { de: 'Schüler*in', en: 'students' },
    leereUeberspringen: { de: 'Leere Gruppen überspringen', en: 'Skip empty groups' },
    erstellen: {
      de: '{n} Gruppen automatisch erstellen',
      en: 'Create {n} groups automatically',
    },
    abbrechen: { de: 'Abbrechen', en: 'Cancel' },
    erstellt: {
      de: '{gruppen} Gruppen mit {schueler} Schüler*innen erstellt.',
      en: '{gruppen} groups with {schueler} students created.',
    },
  },

  karte: {
    achsen: {
      level: { de: 'Kompetenzstufe (gesamt)', en: 'Competence level (overall)' },
      score: { de: 'Rohwert (gesamt, %)', en: 'Raw score (overall, %)' },
      avgDomain: { de: 'Ø Teilkompetenz', en: 'Avg. sub-competence' },
      domainProzent: { de: '{domaene} (%)', en: '{domaene} (%)' },
    },
    keineSchueler: {
      de: 'Keine Schüler*innen für die aktuelle Filterauswahl gefunden.',
      en: 'No students found for the current filter selection.',
    },
    xAchse: { de: 'X-Achse', en: 'X axis' },
    yAchse: { de: 'Y-Achse', en: 'Y axis' },
    klasseFiltern: {
      de: 'Filtern Sie nach einer Klasse für Teilkompetenz-Achsen.',
      en: 'Filter by a class to get sub-competence axes.',
    },
    cluster: { de: 'Cluster', en: 'Clusters' },
    clustern: { de: 'Clustern', en: 'Cluster' },
    alleAlsGruppen: { de: 'Alle als Gruppen →', en: 'All as groups →' },
    clusterAufheben: { de: 'Cluster aufheben', en: 'Clear clusters' },
    hinweis: {
      de: 'Ziehen Sie ein Rechteck zur Gruppenauswahl · Klicken Sie auf Punkte zum Ein-/Ausschließen',
      en: 'Drag a rectangle to select a group · click points to include or exclude them',
    },
    hinweisCluster: {
      de: ' · Klicken auf Cluster-Fläche wählt alle darin aus · Punkte ziehen zum Umverteilen',
      en: ' · clicking a cluster area selects everything in it · drag points to reassign them',
    },
    clusterNummer: { de: 'Cluster {n}', en: 'Cluster {n}' },
    clusterMitAnzahl: { de: 'Cluster {n}', en: 'Cluster {n}' },
    rohwertGesamt: { de: 'Rohwert (gesamt)', en: 'Raw score (overall)' },
    schuelerZahl: { de: '{n} Schüler*innen', en: '{n} students' },
    ausgewaehltEiner: { de: '{n} Schüler*in ausgewählt', en: '{n} student selected' },
    ausgewaehltMehrere: { de: '{n} Schüler*innen ausgewählt', en: '{n} students selected' },
    gruppenname: { de: 'Gruppenname…', en: 'Group name…' },
    erstellen: { de: 'Erstellen', en: 'Create' },
    alsGruppeSpeichern: { de: 'Als Gruppe speichern', en: 'Save as group' },
    auswahlAufheben: { de: 'Auswahl aufheben', en: 'Clear selection' },
    gruppeErstellt: {
      de: 'Gruppe „{name}“ mit {n} Schüler*innen erstellt.',
      en: 'Group “{name}” created with {n} students.',
    },
    clusterGruppenErstellt: {
      de: '{n} Cluster-Gruppen erstellt.',
      en: '{n} cluster groups created.',
    },
  },

  materialien: {
    schuelerAnteil: { de: 'Schüler*innen ({pct}%)', en: 'students ({pct}%)' },
    zugewiesen: { de: '✓ Zugewiesen', en: '✓ Assigned' },
    externesMaterial: { de: 'Externes Material', en: 'External material' },
    keineZugewiesen: {
      de: 'Noch keine Materialien zugewiesen.',
      en: 'No materials assigned yet.',
    },
    auswaehlenTitel: { de: 'Materialien auswählen', en: 'Choose materials' },
    lokalOderMundo: {
      de: 'Lokale Materialien oder direkt aus MUNDO suchen:',
      en: 'Local materials, or search MUNDO directly:',
    },
    mundoSuche: { de: 'MUNDO Suche', en: 'Search MUNDO' },
    keinePassenden: {
      de: 'Keine passenden Materialien für diese Auswahl gefunden.',
      en: 'No matching materials found for this selection.',
    },
    zaehler: { de: '{lokal} lokal · {mundo} aus MUNDO', en: '{lokal} local · {mundo} from MUNDO' },
    ausgewaehltZusatz: { de: '· {n} ausgewählt', en: '· {n} selected' },
    lokalerPool: { de: 'Lokaler Pool', en: 'Local pool' },
    zuweisenEines: { de: '{n} Material zuweisen', en: 'Assign {n} material' },
    zuweisenMehrere: { de: '{n} Materialien zuweisen', en: 'Assign {n} materials' },
    materialWaehlen: { de: 'Material auswählen', en: 'Select a material' },
    erfolgreich: { de: '✓ Erfolgreich zugewiesen!', en: '✓ Assigned.' },
    modusStufe: { de: 'Nach Kompetenzstufe', en: 'By competence level' },
    modusGruppe: { de: 'Nach Gruppe', en: 'By group' },
    stufeWaehlen: { de: 'Kompetenzstufe wählen', en: 'Choose a competence level' },
    schueleranzahlAusLabel: { de: 'Schüleranzahl aus', en: 'student count from' },
    zugewieseneMaterialien: { de: 'Zugewiesene Materialien', en: 'Assigned materials' },
    stufeEinleitung: {
      de: 'Wählen Sie eine Kompetenzstufe aus und weisen Sie ihr passende Materialien zu. Die Zuweisung gilt global für alle Schüler*innen dieser Stufe.',
      en: 'Pick a competence level and assign matching materials to it. The assignment applies to all students at that level.',
    },
    gruppeWaehlen: { de: 'Gruppe wählen', en: 'Choose a group' },
    keineGruppen: {
      de: 'Noch keine eigenen Gruppen vorhanden.',
      en: 'No custom groups yet.',
    },
    keineGruppenZusatz: {
      de: 'Im Tab <strong>Schüler*innen</strong> erstellen.',
      en: 'Create one in the <strong>Students</strong> tab.',
    },
    mitglieder: { de: '{n} Mitgl.', en: '{n} members' },
    exportTitel: { de: 'Export', en: 'Export' },
    exportEinleitung: {
      de: 'Exportiert alle zugewiesenen Materialien (beide Modi) als IMS Common Cartridge oder PDF.',
      en: 'Exports all assigned materials (both modes) as an IMS Common Cartridge or a PDF.',
    },
    nachStufe: { de: 'nach Kompetenzstufe', en: 'by competence level' },
    nachGruppe: { de: 'nach Gruppe', en: 'by group' },
    exportiere: { de: 'Exportiere…', en: 'Exporting…' },
    alleImscc: { de: 'Alle als .imscc', en: 'All as .imscc' },
    allePdf: { de: 'Alle als PDF', en: 'All as PDF' },
    exportiertImscc: {
      de: '{n} Materialien als .imscc exportiert.',
      en: '{n} materials exported as .imscc.',
    },
    exportiertPdf: {
      de: '{n} Materialien als PDF exportiert.',
      en: '{n} materials exported as PDF.',
    },

    // ── Materialien aus der Schnittstelle (/materials) ──────────────────
    modusSchnittstelle: { de: 'Aus der Schnittstelle', en: 'From the API' },
    quelleSchnittstelle: { de: 'Schnittstelle', en: 'API' },
    schnittstelleEinleitung: {
      de: 'Diese Materialien kommen aus <code>/materials</code> — nicht aus dem lokalen Pool. Der Entwurf kennt sechs Zuordnungsarten; gezeigt wird, woran jedes Material hängt.',
      en: 'These materials come from <code>/materials</code>, not from the local pool. The draft defines six kinds of attachment; what each material is attached to is shown below.',
    },
    schnittstelleLaedt: { de: 'Materialien werden geladen …', en: 'Loading materials…' },
    schnittstelleLeer: {
      de: 'Die Schnittstelle liefert derzeit keine Materialien.',
      en: 'The API currently returns no materials.',
    },
    scopeAnzahl: { de: '{n} Materialien', en: '{n} materials' },
    scopeAnzahlEines: { de: '{n} Material', en: '{n} material' },

    scope: {
      'competence-level': { de: 'Zu einer Kompetenzstufe', en: 'For a competence level' },
      competence: { de: 'Zu einer Kompetenz', en: 'For a competence' },
      item: { de: 'Zu einem Item', en: 'For an item' },
      exercise: { de: 'Zu einer Aufgabe', en: 'For an exercise' },
      test: { de: 'Zum ganzen Test', en: 'For the whole test' },
      general: { de: 'Ohne festes Ziel', en: 'Not tied to anything' },
    },

    art: {
      support: { de: 'Förderung', en: 'Support' },
      diagnostic: { de: 'Diagnose', en: 'Diagnostic' },
      solution: { de: 'Lösung', en: 'Solution' },
      didactic: { de: 'Didaktik', en: 'Didactic' },
      'anchor-text': { de: 'Ankertext', en: 'Anchor text' },
      info: { de: 'Information', en: 'Information' },
      video: { de: 'Video', en: 'Video' },
      audio: { de: 'Audio', en: 'Audio' },
      transcript: { de: 'Transkript', en: 'Transcript' },
      example: { de: 'Beispiel', en: 'Example' },
      other: { de: 'Sonstiges', en: 'Other' },
    },

    zielgruppe: {
      teacher: { de: 'Lehrkraft', en: 'Teacher' },
      student: { de: 'Schüler*in', en: 'Student' },
      parents: { de: 'Eltern', en: 'Parents' },
      other: { de: 'Sonstige', en: 'Other' },
    },

    autoTitel: { de: 'Automatisch zuweisen', en: 'Assign automatically' },
    autoUnterzeile: {
      de: 'Was die Metadaten hergeben, ordnet die Anwendung selbst zu — den Rest nicht.',
      en: 'Whatever the metadata settles, the application assigns itself — and nothing beyond that.',
    },
    autoErklaerung: {
      de: 'Zugeordnet wird nur, was im Anhang eindeutig steht: ein Material zu einer Kompetenzstufe geht an diese Stufe, ein Material <em>ohne festes Ziel</em> an alle fünf. Was an einem Item, einer Aufgabe oder einem Test hängt, braucht den Einsatzkontext und bleibt Ihre Entscheidung.',
      en: 'Only unambiguous attachments are assigned: a material for a competence level goes to that level, a material <em>not tied to anything</em> goes to all five. Anything attached to an item, an exercise or a test needs the context it is used in, and stays your call.',
    },
    autoZiel: { de: 'Ziel', en: 'Target' },
    autoMaterialien: { de: 'Materialien', en: 'Materials' },
    autoAnzahl: { de: 'Anzahl', en: 'Count' },
    autoStufe: { de: 'Stufe {stufe}', en: 'Level {stufe}' },
    autoAlleStufen: { de: 'Alle Stufen', en: 'All levels' },
    autoOffen: {
      de: '{n} Materialien ordnet die Anwendung nicht zu — sie hängen an einem Item, einer Aufgabe, einem Test oder einer Kompetenz, oder ihr Stufenanhang zeigt auf eine Kennung, zu der die Schnittstelle keinen Namen führt.',
      en: '{n} materials are left alone — they are attached to an item, an exercise, a test or a competence, or their level attachment points at an identifier the API gives no name for.',
    },
    autoKnopf: { de: '{n} Materialien zuweisen', en: 'Assign {n} materials' },
    autoKnopfEines: { de: '{n} Material zuweisen', en: 'Assign {n} material' },
    autoNichts: { de: 'Nichts automatisch zuzuordnen', en: 'Nothing to assign automatically' },
    autoFertig: { de: '✓ {n} zugewiesen', en: '✓ {n} assigned' },
    autoSchliessen: { de: 'Schließen', en: 'Close' },
  },

  mundo: {
    standardTitel: { de: 'MUNDO Material', en: 'MUNDO material' },
    urlFehlt: {
      de: '⚠ URL fehlt – siehe Browser-Konsole (MUNDO LTI)',
      en: '⚠ URL missing – see the browser console (MUNDO LTI)',
    },
    entfernen: { de: 'Entfernen', en: 'Remove' },
    manuellEinleitung: {
      de: 'Suche auf <a href="https://mundo.schule/search" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-medium">mundo.schule ↗</a> und trage das Material hier ein:',
      en: 'Search on <a href="https://mundo.schule/search" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-medium">mundo.schule ↗</a> and enter the material here:',
    },
    titelFeld: { de: 'Titel *', en: 'Title *' },
    urlFeld: { de: 'URL (optional)', en: 'URL (optional)' },
    beschreibungFeld: { de: 'Beschreibung (optional)', en: 'Description (optional)' },
    hinzufuegen: { de: 'Hinzufügen', en: 'Add' },
    zugangsdaten: {
      de: 'Zugangsdaten findest du auf <a href="https://mundo.schule/cms/lti" target="_blank" rel="noopener noreferrer" class="font-semibold underline">mundo.schule/cms/lti ↗</a>. Kopiere <em>Consumer-Key</em> und <em>Shared Secret</em> und trage sie hier ein.',
      en: 'You will find the credentials at <a href="https://mundo.schule/cms/lti" target="_blank" rel="noopener noreferrer" class="font-semibold underline">mundo.schule/cms/lti ↗</a>. Copy the <em>consumer key</em> and <em>shared secret</em> and enter them here.',
    },
    toolUrl: { de: 'LTI Tool-URL', en: 'LTI tool URL' },
    toolUrlHinweis: {
      de: 'Die eigentliche Launch-URL des LTI-Tools (nicht die Info-Seite)',
      en: 'The actual launch URL of the LTI tool (not the info page)',
    },
    consumerKey: { de: 'Consumer Key', en: 'Consumer key' },
    sharedSecret: { de: 'Shared Secret', en: 'Shared secret' },
    speichernUndStarten: { de: 'Speichern & LTI starten', en: 'Save & start LTI' },
    callbackUrl: { de: 'Callback-URL:', en: 'Callback URL:' },
    titel: { de: 'MUNDO Materialsuche', en: 'MUNDO material search' },
    popupOffen: { de: 'Popup geöffnet', en: 'Pop-up open' },
    popupGeschlossen: { de: 'Popup geschlossen', en: 'Pop-up closed' },
    nichtGestartet: { de: 'nicht gestartet', en: 'not started' },
    reiterLti: { de: 'LTI-Suche', en: 'LTI search' },
    reiterManuell: { de: 'Manuell', en: 'Manual' },
    reiterKonfig: { de: '⚙ Konfig', en: '⚙ Config' },
    signiert: { de: 'LTI-Anfrage wird signiert…', en: 'Signing the LTI request…' },
    istGeoeffnet: { de: 'MUNDO ist geöffnet', en: 'MUNDO is open' },
    wurdeGeschlossen: { de: 'Popup wurde geschlossen', en: 'The pop-up was closed' },
    sucheStarten: { de: 'MUNDO Suche starten', en: 'Start the MUNDO search' },
    hinweisOffen: {
      de: 'Suche und wähle Materialien im MUNDO-Fenster aus. Sie erscheinen automatisch rechts.',
      en: 'Search and select materials in the MUNDO window. They appear on the right automatically.',
    },
    hinweisGeschlossen: {
      de: 'Das Popup wurde geschlossen. Erneut öffnen oder links ausgewählte Materialien übernehmen.',
      en: 'The pop-up was closed. Open it again, or take over the materials selected on the left.',
    },
    hinweisStart: {
      de: 'Öffnet ein Popup-Fenster mit der MUNDO-Suche über LTI.',
      en: 'Opens a pop-up window with the MUNDO search via LTI.',
    },
    erneutOeffnen: { de: 'Erneut öffnen', en: 'Open again' },
    oeffnen: { de: 'Öffnen', en: 'Open' },
    ausgewaehlt: { de: 'Ausgewählt', en: 'Selected' },
    nochNichts: {
      de: 'Materialien in der LTI-Suche auswählen.',
      en: 'Select materials in the LTI search.',
    },
    nochNichtsZusatz: {
      de: 'Sie erscheinen hier automatisch.',
      en: 'They appear here automatically.',
    },
    uebernehmenEines: { de: '{n} Material übernehmen', en: 'Take over {n} material' },
    uebernehmenMehrere: { de: '{n} Materialien übernehmen', en: 'Take over {n} materials' },
    auswaehlen: { de: 'Materialien auswählen', en: 'Select materials' },
    direktZugewiesen: { de: 'Werden direkt zugewiesen', en: 'Assigned straight away' },
  },

  datenblatt: {
    zurueck: { de: 'Zurück zur Schüler-Übersicht', en: 'Back to the student overview' },
    wirdErstellt: { de: 'Wird erstellt…', en: 'Creating…' },
    alsPdf: { de: 'Datenblatt als PDF', en: 'Data sheet as PDF' },
    kompetenzstufe: { de: 'Kompetenzstufe', en: 'Competence level' },
    gesamtergebnis: { de: 'Gesamtergebnis', en: 'Overall result' },
    radarTitel: { de: 'Kompetenzprofil (Spinnennetz)', en: 'Competence profile (radar)' },
    radarErklaerung: {
      de: 'Ungewichteter Durchschnittswert der Aufgaben je Teilbereich in Prozent (0 % innen – 100 % außen).',
      en: 'Unweighted average score of the items per domain, in percent (0 % at the centre – 100 % at the edge).',
    },
    punktwert: { de: 'Ø Punktwert', en: 'Avg. score' },
    punktwertZeile: { de: 'Ø Punktwert:', en: 'Avg. score:' },
    entspricht: { de: 'entspricht', en: 'corresponds to' },
    gesamt: { de: 'Gesamt', en: 'Overall' },
    schwellen: { de: 'Schwellen:', en: 'Thresholds:' },
    nachTeilbereich: { de: 'Ergebnisse nach Teilbereich', en: 'Results by domain' },
    uebersichtStufen: { de: 'Übersicht Kompetenzstufen', en: 'Competence levels at a glance' },
    gruppen: { de: 'Gruppen', en: 'Groups' },
    stufenbeschreibungen: { de: 'Stufenbeschreibungen', en: 'Level descriptions' },
    mitglieder: { de: '{n} Mitgl.', en: '{n} members' },
    aktuell: { de: '← aktuell', en: '← current' },
    empfohlene: { de: 'Empfohlene Lernmaterialien', en: 'Recommended learning materials' },
    diagnostik: { de: 'Ergänzende Diagnostik', en: 'Additional diagnostics' },
    optional: { de: 'optional', en: 'optional' },
    diagnostikText: {
      de: 'Diese kurzen Diagnose-Instrumente helfen, die konkrete Förderbaustelle innerhalb der Kompetenzstufe {stufe} präziser zu bestimmen, bevor mit der Förderung begonnen wird.',
      en: 'These short diagnostic instruments help pinpoint what exactly to work on within competence level {stufe}, before the support starts.',
    },
  },

  ausgabe: {
    lernmaterialien: { de: 'TBA3 Lernmaterialien', en: 'TBA3 learning materials' },
    seiteVon: { de: 'Seite {n} von {gesamt}', en: 'Page {n} of {gesamt}' },
    abschnitt: { de: 'Abschnitt', en: 'Section' },
    fusszeile: { de: 'TBA3 Lernmaterialien · {datum}', en: 'TBA3 learning materials · {datum}' },
    exportiertAus: {
      de: 'Exportiert aus TBA3 Demo App · {datum}',
      en: 'Exported from the TBA3 demo app · {datum}',
    },
    demoUrls: { de: 'Demo-URLs – keine echten Links', en: 'Demo URLs – not real links' },
    zugewiesene: { de: 'Zugewiesene Materialien', en: 'Assigned materials' },
    stufeMitText: {
      de: 'Kompetenzstufe {n}  –  {text}',
      en: 'Competence level {n}  –  {text}',
    },
    keinTitel: { de: '(kein Titel)', en: '(no title)' },
    keineFuerKlasse: {
      de: 'Keine zugewiesenen Materialien für diese Klasse.',
      en: 'No materials assigned for this class.',
    },
    keineVorhanden: {
      de: 'Keine zugewiesenen Materialien vorhanden.',
      en: 'No assigned materials.',
    },
    nachGruppe: { de: 'Nach Gruppe', en: 'By group' },
    nachStufe: { de: 'Nach Kompetenzstufe', en: 'By competence level' },
    zuordnungGruppe: {
      de: 'Materialzuordnung nach eigenen Gruppen',
      en: 'Material assignment by custom group',
    },
    zuordnungStufe: {
      de: 'Materialzuordnung nach Kompetenzstufe',
      en: 'Material assignment by competence level',
    },
    individuelleRueckmeldung: { de: 'Individuelle Rückmeldung', en: 'Individual report' },
    erreichteStufe: { de: 'Erreichte Kompetenzstufe', en: 'Competence level reached' },
    nachTeilbereich: { de: 'Ergebnisse nach Teilbereich', en: 'Results by domain' },
    stufeUndText: { de: 'Stufe {n} · {text}', en: 'Level {n} · {text}' },
    empfohlene: { de: 'Empfohlene Materialien', en: 'Recommended materials' },
    dateinameRueckmeldung: { de: 'Rueckmeldung', en: 'Report' },
    mundoExtern: { de: 'MUNDO (extern)', en: 'MUNDO (external)' },
    direktlink: { de: 'Direktlink', en: 'Direct link' },
    stufeMitBeschreibung: {
      de: 'Stufe {n}: {text}',
      en: 'Level {n}: {text}',
    },
    popupBlockiert: {
      de: 'Popup wurde blockiert. Bitte Popup-Blocker für diese Seite deaktivieren.',
      en: 'The pop-up was blocked. Please allow pop-ups for this page.',
    },
    unbekannteEbene: { de: 'Unbekannte Ebene: {ebene}', en: 'Unknown level: {ebene}' },
  },

  hilfe: {
    titel: {
      de: 'MCP-Server für TBA3-Ergebnisdaten',
      en: 'MCP server for TBA3 result data',
    },
    einleitung: {
      de: 'Der MCP-Server läuft <strong>auf dem Server in Docker</strong>. Lokal richten Sie nur die Verbindung ein – keine Installation, kein Projekt-Checkout nötig.',
      en: 'The MCP server runs <strong>on the server, in Docker</strong>. Locally you only set up the connection – no installation, no project checkout needed.',
    },
    dockerTitel: {
      de: 'Auf dem Server: MCP-Server in Docker betreiben',
      en: 'On the server: running the MCP server in Docker',
    },
    dockerUnterzeile: {
      de: 'Container starten, Umgebungsvariable setzen – fertig.',
      en: 'Start the container, set one environment variable – done.',
    },
    dockerAbsatz1: {
      de: 'Der MCP-Server wird als eigenes Docker-Image (z. B. <code>ghcr.io/…/…-mcp</code>) bereitgestellt. Auf dem Server Container starten und <strong>TBA3_API_BASE_URL</strong> auf die TBA3-API setzen (z. B. Ihre Mock- oder Backend-API). Der Endpunkt für Clients ist <code>POST /mcp</code> (Streamable HTTP).',
      en: 'The MCP server ships as its own Docker image (e.g. <code>ghcr.io/…/…-mcp</code>). Start the container on your server and point <strong>TBA3_API_BASE_URL</strong> at the TBA3 API (your mock or backend API). The endpoint for clients is <code>POST /mcp</code> (streamable HTTP).',
    },
    dockerAbsatz2: {
      de: 'Beispiel: <code>docker run -e TBA3_API_BASE_URL=https://api.example.com -p 3000:3000 …-mcp</code>. Die URL, die Cursor/Claude brauchen, ist dann <code>https://ihr-server/mcp</code> (je nach Reverse-Proxy/Ingress).',
      en: 'Example: <code>docker run -e TBA3_API_BASE_URL=https://api.example.com -p 3000:3000 …-mcp</code>. The URL Cursor or Claude needs is then <code>https://your-server/mcp</code> (depending on your reverse proxy or ingress).',
    },
    clientTitel: {
      de: 'Lokal: In Cursor oder Claude verbinden',
      en: 'Locally: connecting from Cursor or Claude',
    },
    clientUnterzeile: {
      de: 'Nur die Server-URL eintragen – kein Node, kein mcp-server-Checkout.',
      en: 'Just enter the server URL – no Node, no mcp-server checkout.',
    },
    clientUrl: {
      de: 'MCP-Server-URL (von Ihrem Deployment):',
      en: 'MCP server URL (from your deployment):',
    },
    cursorText: {
      de: 'Einstellungen → MCP → „Add new MCP server“ → Typ <strong>Streamable HTTP</strong>, URL: die obige Adresse. Oder im Projekt <code>.cursor/mcp.json</code> anlegen:',
      en: 'Settings → MCP → “Add new MCP server” → type <strong>Streamable HTTP</strong>, URL: the address above. Or create <code>.cursor/mcp.json</code> in the project:',
    },
    claudeText: {
      de: 'Konfigurationsdatei bearbeiten (Einstellungen → Developer → Edit Config): macOS <code>~/Library/Application Support/Claude/claude_desktop_config.json</code>, Windows <code>%APPDATA%\\Claude\\claude_desktop_config.json</code>. MCP-Server mit Typ <strong>sse</strong> und URL eintragen:',
      en: 'Edit the configuration file (Settings → Developer → Edit Config): macOS <code>~/Library/Application Support/Claude/claude_desktop_config.json</code>, Windows <code>%APPDATA%\\Claude\\claude_desktop_config.json</code>. Add an MCP server of type <strong>sse</strong> with the URL:',
    },
    claudeHinweis: {
      de: 'Wenn Ihre Claude-Version nur „command“-Server unterstützt, den MCP-Server lokal mit <code>node mcp-server/index.js</code> starten und in der Config command/args verwenden (siehe Projekt-README).',
      en: 'If your version of Claude only supports “command” servers, start the MCP server locally with <code>node mcp-server/index.js</code> and use command/args in the config (see the project README).',
    },
    werkzeugeTitel: { de: 'Verfügbare Tools', en: 'Available tools' },
    werkzeugeUnterzeile: {
      de: 'Diese Tools stehen dem Assistenten nach der Verbindung zur Verfügung.',
      en: 'These tools are available to the assistant once connected.',
    },
    spalteTool: { de: 'Tool', en: 'Tool' },
    spalteBeschreibung: { de: 'Beschreibung', en: 'Description' },
    werkzeuge: {
      listEntities: {
        de: 'Schulen, Lerngruppen/Klassen oder Bundesländer mit id, name, ggf. Fach/Klasse/Schulart. Optional filtern: <code>subject</code>, <code>grade</code> (bei group), <code>type</code> (bei school).',
        en: 'Schools, learning groups/classes or states with id, name and, where applicable, subject/grade/school type. Optional filters: <code>subject</code>, <code>grade</code> (for group), <code>type</code> (for school).',
      },
      listSubjects: {
        de: 'Liste der Fächer (code, name): Deutsch, Mathematik, Englisch, Französisch.',
        en: 'List of subjects (code, name): German, Mathematics, English, French.',
      },
      listGrades: {
        de: 'Jahrgangsstufen (Klasse 3, Klasse 8) mit code, name, description.',
        en: 'Grades (grade 3, grade 8) with code, name and description.',
      },
      competenceLevels: {
        de: 'Kompetenzstufen-Statistik (I–V) für eine Gruppe, Schule oder ein Land.',
        en: 'Competence level statistics (I–V) for a group, school or state.',
      },
      aggregations: {
        de: 'Aggregations-Statistiken (z. B. Mittelwert, Häufigkeit) für eine Einheit.',
        en: 'Aggregation statistics (e.g. mean, frequency) for one unit.',
      },
      items: {
        de: 'Item-Statistiken (z. B. Lösungsquote) pro Gruppe/Schule/Land.',
        en: 'Item statistics (e.g. solution rate) per group, school or state.',
      },
    },
    werkzeugeHinweis: {
      de: 'Bei den get-*-Tools kann optional <strong>type</strong> übergeben werden: <code>group</code>, <code>students</code> oder <code>group,students</code>.',
      en: 'The get-* tools optionally take <strong>type</strong>: <code>group</code>, <code>students</code> or <code>group,students</code>.',
    },
  },
};
