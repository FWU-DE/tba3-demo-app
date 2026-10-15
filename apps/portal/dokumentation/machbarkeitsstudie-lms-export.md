# Materialsammlung an das LMS übergeben: Common Cartridge und PDF

Geprüft am Prototyp im [Reiter „Lernmaterialien“](/demo/?tab=materials) der Demoanwendung und mit einem Import in Moodle 4.5 am
14.10.2026. So kommt man hin: In der Demoanwendung unter den Übersichtskarten
den Reiter „Lernmaterialien“ öffnen.

## Ergebnis

- **Machbar, und zwar ohne Server.** Eine Lehrkraft sammelt zu einer
  Rückmeldung Material, je Kompetenzstufe oder je Gruppe. Diese Sammlung gibt
  die Demoanwendung auf zwei Wegen aus: als **Common Cartridge** (`.imscc`)
  für die Lernplattform und als **PDF** für Papier und Ablage. Beide Dateien
  entstehen im Browser, keine Angabe aus der Rückmeldung verlässt dafür das
  Gerät.
- **Der Import in Moodle ging erst nach einer Korrektur.** In der Fassung,
  mit der der Prototyp gebaut wurde, lehnte Moodle die Cartridge ab. Sie trug
  die Kennung von Common Cartridge 1.3, die Moodle nicht kennt, und das
  Manifest verstieß gegen das Schema. Beides ist behoben: Die Demoanwendung
  schreibt jetzt Common Cartridge 1.1, und Moodle legt daraus ohne Nacharbeit
  einen Kurs an.
- **Die Cartridge transportiert Gliederung und Verweise, nicht das Material
  selbst.** In Moodle kommt je Kompetenzstufe eine Zwischenüberschrift an und je
  Material eine Textseite mit Beschreibung und Link. Dateien, interaktive
  Aufgaben oder Videos stecken nicht darin, denn die Demoanwendung kennt
  sie selbst nur als Verweis.
- **Das PDF ist der robustere Weg.** Es braucht keine Lernplattform und keine
  Rechte darin und liest sich auch ohne Anwendung. Dafür kann man darin nichts
  weiterbearbeiten.

## Die Fragestellung

Eine Rückmeldung zeigt, wo eine Lerngruppe steht. Daraus folgt eine Auswahl an
Material: Übungen für die Gruppe auf Stufe II, Fördermaterial für Stufe I,
etwas zur Vertiefung für Stufe IV. Gearbeitet wird mit diesem Material aber
nicht in der Rückmeldung, sondern in der Lernplattform der Schule oder auf
Papier.

Untersucht wurde, ob sich eine solche Sammlung so übergeben lässt, dass sie
dort ohne Abtippen ankommt und ihre Ordnung behält, also welches Material zu
welcher Stufe gehört.

## Material sammeln

Gesammelt wird im [Reiter „Lernmaterialien“](/demo/?tab=materials). Er kennt drei Modi, und alle drei
schreiben in dieselbe Ablage, aus der später exportiert wird.

**Nach Kompetenzstufe.** Die Lehrkraft wählt eine Stufe. Die Kacheln zeigen,
wie viele Schüler:innen der gewählten Gruppe dort liegen; die Zahlen kommen aus
der Schnittstelle (`/competence-levels`).

![Fünf Kacheln für die Kompetenzstufen I bis V mit Anzahl und Anteil der Schüler:innen; Stufe II ist ausgewählt.](/dokumentation/bilder/lms-stufen-de.png "Die Stufenwahl für die Lerngruppe 3a Deutsch. Die Zuweisung gilt für alle Schüler:innen der Stufe, nicht für einzelne.")

Darunter stehen die Materialien, die zu dieser Stufe passen. Ein Klick auf eine
Karte wählt sie aus, ein zweiter nimmt die Wahl zurück. Zugewiesen wird erst mit
dem Knopf darunter. Über „MUNDO Suche“ kommt Material aus der Mediathek dazu; wie
das funktioniert, beschreibt die Seite
[Mediatheken einbinden](machbarkeitsstudie-mediatheken.md).

![Drei Materialkarten, zwei davon mit Häkchen ausgewählt, darunter der Knopf „2 Materialien zuweisen“. Oben rechts der Knopf „MUNDO Suche“.](/dokumentation/bilder/lms-auswahl-de.png "Material an- und abwählen: zwei Karten sind gewählt, zugewiesen ist noch nichts.")

**Nach Gruppe.** Statt an eine Stufe hängt das Material an eine eigene Gruppe,
die die Lehrkraft vorher im Reiter „Schüler*innen“ angelegt hat, etwa eine
Fördergruppe aus fünf Namen.

**Aus der Schnittstelle.** Der Entwurf `/materials` liefert Material, das schon
beim Erstellen des Tests an Stufen, Kompetenzen oder Aufgaben gehängt wurde. Was
dort eindeutig einer Stufe zugeordnet ist, übernimmt die Anwendung auf Knopfdruck.

Die Zuordnungen liegen im `localStorage` des Browsers (`tba3_materials_by_level`,
`tba3_external_materials`). Der Export-Kasten am Ende des Reiters zählt, was
zusammengekommen ist, und bietet die beiden Ausgaben an.

![Der Kasten „Export“: drei Materialien nach Kompetenzstufe, null nach Gruppe, darunter die Knöpfe „Alle als .imscc“ und „Alle als PDF“.](/dokumentation/bilder/lms-export-de.png "Der Export fasst beide Modi zusammen. Ohne eine Zuweisung sind beide Knöpfe gesperrt.")

## Weg 1: Common Cartridge für die Lernplattform

### Was ist Common Cartridge?

IMS Common Cartridge ist ein offener Standard von 1EdTech (vormals IMS Global)
für den Austausch von Kursinhalten zwischen Lernplattformen. Eine Cartridge ist
ein ZIP-Archiv mit der Endung `.imscc`. Darin liegen die Inhalte und eine Datei
`imsmanifest.xml`, die sie gliedert. Moodle, Canvas, itslearning und weitere
Plattformen können Cartridges importieren, unterstützen aber nicht alle
Versionen und nicht alle Inhaltsarten.

### Was die Demoanwendung hineinschreibt

Erzeugt wird die Datei in `apps/demo/src/utils/commonCartridgeExport.js`, mit
JSZip, das erst beim Klick nachgeladen wird. Für die Auswahl oben (zwei
Materialien und ein MUNDO-Treffer auf Stufe II, eines auf Stufe III) sieht das
Archiv so aus:

```
tba3_alle_klassen_2026-10-14.imscc
├── imsmanifest.xml
└── content/__level_export__/
    ├── stufe_II/
    │   ├── mat-de-v3-01.html
    │   ├── mat-de-v3-02.html
    │   └── mundo-1791964302358-tjskw.html
    └── stufe_III/
        └── mat-de-v3-02.html
```

Jedes Material wird zu einer eigenen HTML-Seite mit Titel, Art, Dauer, Fach,
Klassenstufe, Ziel-Kompetenzstufen, Beschreibung und Direktlink. Das Manifest
ordnet die Seiten in drei Ebenen: Gruppe, Kompetenzstufe, Material.

```xml
<manifest identifier="tba3_cc_export"
  xmlns="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1" …>
  <metadata>
    <schema>IMS Common Cartridge</schema>
    <schemaversion>1.1.0</schemaversion>
    <lom:lom …>  <!-- Titel, Sprache, Beschreibung -->
  </metadata>
  <organizations>
    <organization identifier="tba3_org" structure="rooted-hierarchy">
      <item identifier="root">
        <item identifier="org_group___level_export__">
          <title>Nach Kompetenzstufe</title>
          <item identifier="org___level_export___level_II">
            <title>Kompetenzstufe II  –  Mindeststandard</title>
            <item identifierref="res___level_export___II_mat-de-v3-01">
              <title>Lesen üben: Satzverständnis</title>
            </item>
            …
  <resources>
    <resource identifier="res___level_export___II_mat-de-v3-01"
              type="webcontent"
              href="content/__level_export__/stufe_II/mat-de-v3-01.html">
      <file href="content/__level_export__/stufe_II/mat-de-v3-01.html"/>
    </resource>
    …
```

Beschriftungen und Seiten folgen der Sprache, die beim Klick eingestellt ist.
Die Titel der Materialien kommen aus den Daten und bleiben, wie sie sind.

### Der Test in Moodle

Für die Studie wurde Moodle 4.5.4 lokal in Docker aufgesetzt (Abbilder
`bitnamilegacy/moodle:4.5` und `bitnamilegacy/mariadb:11.4`). Importiert wurde
über Moodles Wiederherstellung, die Cartridges vor dem Import in ein
Moodle-Backup umwandelt. Eine Lehrkraft geht denselben Weg über
*Kurs → Mehr → Wiederherstellen*. In der Grundeinstellung darf die Rolle
„Trainer/in“ das im eigenen Kurs, ein Admin ist dafür nicht nötig.

Der erste Versuch mit der Datei des Prototyps scheiterte zweimal:

| Schritt | Meldung von Moodle | Ursache |
|---|---|---|
| Format erkennen | „Format: unknown“, der Import bricht ab | Das Manifest trug den Namensraum von **Common Cartridge 1.3**. Moodle 4.5 erkennt nur 1.0 und 1.1 (`backup/converter/imscc1`, `imscc11`). |
| Schema prüfen, nach Umstellen auf 1.1 | `Element 'title': This element is not expected. Expected is one of (item, metadata)` | Die `<organization>` trug einen eigenen `<title>`. Das Schema verlangt dort genau ein Wurzel-`<item>`. |

Beides ist jetzt im Export behoben: die Kennung von 1.1 statt 1.3 und ein
Wurzel-`item` ohne Titel. Mit 1.1 geht nichts verloren, denn die Cartridge
enthält nur Webseiten und eine Gliederung, und dafür reicht diese Fassung
vollständig. Ein Unit-Test
(`apps/demo/src/utils/__tests__/commonCartridgeExport.test.js`) hält beides
fest. Danach importierte Moodle die **unveränderte** Datei aus der
Demoanwendung, auf Deutsch wie auf Englisch:

![Moodle-Kursseite „Klasse 3a Deutsch – Material nach VERA“. Im Abschnitt „Allgemeines“ stehen die Zwischenüberschriften „Kompetenzstufe II – Mindeststandard“ und „Kompetenzstufe III – Regelstandard“, darunter jeweils die Materialien als Textseiten.](/dokumentation/bilder/lms-moodle-kurs-de.png "Der importierte Kurs in Moodle 4.5. Den Kursnamen haben wir beim Import vergeben; die Gliederung stammt aus der Cartridge.")

![Moodle-Textseite „Flächeninhalt von Rechtecken“ mit den Hinweisen MUNDO (extern), Stufe II: Mindeststandard, dem Direktlink zu mundo.schule und der Zeile „Zugeordnet an“.](/dokumentation/bilder/lms-moodle-seite-de.png "Ein Material als Textseite. Der Link führt zu MUNDO; das Material selbst liegt nicht in Moodle.")

| In der Cartridge | In Moodle |
|---|---|
| Gruppe (`Nach Kompetenzstufe`) | Textzeile oben im Abschnitt „Allgemeines“ |
| Kompetenzstufe | Textfeld (Label) als Zwischenüberschrift |
| Material (`webcontent`, HTML) | Aktivität „Textseite“ |
| LOM-Titel und -Beschreibung | werden nicht angezeigt |

Vor einem Einsatz zu glätten, den Import verhindern sie nicht:

- **Alles landet in einem Abschnitt.** Moodle macht aus den Gliederungsebenen
  keine Kursabschnitte, sondern Zwischenüberschriften in „Allgemeines“.
- **Vor jeder Stufe steht „Folder“.** Moodles Konverter setzt ein Ordnersymbol
  vor das Label, dessen Bild in Moodle 4.5 fehlt. Zu sehen ist deshalb der
  Ersatztext. Das liegt an Moodle, nicht an der Cartridge.
- **Die Gestaltung der Seiten geht zum Teil verloren.** Moodle übernimmt den
  Inhalt der Seiten, aber nicht ihr eingebettetes Stylesheet. Die farbigen
  Etiketten bleiben, Abstände und Kästen nicht.

Andere Lernplattformen (itslearning, Canvas, ILIAS, die Lernplattformen der
Länder) wurden nicht getestet. Common Cartridge 1.1 gilt als die am breitesten
unterstützte Fassung, ein Import ist dort also wahrscheinlich, aber nicht
belegt.

### Was die Cartridge nicht leistet

- **Sie enthält das Material nicht.** Jede Seite verweist auf ein Material, das
  woanders liegt. Bei MUNDO ist das die Detailseite in der Mediathek, bei den
  Beispielmaterialien der Demoanwendung eine Platzhalteradresse. Eine Cartridge
  kann auch Dateien und Aufgaben (QTI) tragen, aber dafür müsste die
  Anwendung das Material selbst besitzen.
- **Sie nennt im Stufenmodus keine Lerngruppe.** Die Gruppe heißt dann „Nach
  Kompetenzstufe“, nicht „3a Deutsch“. Den Kursnamen vergibt die Lehrkraft
  beim Import.
- **Sie weist niemandem etwas zu.** Die Stufen werden in Moodle zu
  Überschriften, nicht zu Gruppen. Wer welches Material bekommt, muss die
  Lehrkraft dort noch einmal festlegen, zum Beispiel über Gruppen und
  Voraussetzungen. Personenbezogene Daten stehen dafür bewusst nicht in der
  Datei.
- **Sie ist eine Kopie.** Ändert sich die Zuordnung in der Rückmeldung, bleibt
  der Kurs, wie er importiert wurde. Eine laufende Verbindung zwischen
  Rückmeldung und Lernplattform wäre LTI, nicht Common Cartridge.

## Weg 2: PDF für Papier und Ablage

Derselbe Export-Kasten erzeugt ein PDF: eine Seite je Gruppe, darin die
Materialien nach Kompetenzstufe, jedes als Karte mit Art, Dauer, Beschreibung,
Ziel-Stufen, Adresse und QR-Code. Das PDF entsteht mit jsPDF im Browser,
ebenfalls erst beim Klick geladen.

![Eine A4-Seite mit dem Kopf „Nach Kompetenzstufe“, einem Balken „Kompetenzstufe II – Mindeststandard“ und drei Materialkarten mit QR-Code, darunter der MUNDO-Treffer.](/dokumentation/bilder/lms-pdf-de.png "Die Materialzuordnung als PDF. Die QR-Codes der Beispielmaterialien zeigen auf Platzhalteradressen, die Fußzeile sagt das; der MUNDO-Treffer trägt seine echte Adresse.")

Das PDF ist für die Elternsprechstunde, den Ordner der Klassenleitung oder die
Kollegin gedacht, die keinen Zugang zur Rückmeldung hat. Es braucht keine
Lernplattform und keine Rechte darin. Der QR-Code bringt Schüler:innen vom
Arbeitsblatt zum Material. Wie die Datei gebaut ist (Schrift, Seitenumbruch,
QR-Codes, warum nichts davon auf einem Server passiert), steht ausführlich in
den [Rezepten der Demoanwendung](demo-rezepte.md#eine-rückmeldung-die-das-haus-verlässt-der-pdf-export).

Daneben gibt es ein zweites PDF, die **individuelle Rückmeldung** für eine
einzelne Person aus dem Datenblatt im Reiter „Schüler*innen“. Sie enthält die
erreichte Stufe, die Ergebnisse nach Teilbereich und die passenden Materialien.

## Beide Wege nebeneinander

| | Common Cartridge | PDF |
|---|---|---|
| Für | die Lernplattform | Papier, Ablage, Weitergabe |
| Datei | `.imscc` (ZIP mit Manifest und HTML-Seiten) | `.pdf`, eine Seite je Gruppe |
| Ordnung | Gruppe → Kompetenzstufe → Material, in Moodle als Überschriften | Gruppe → Kompetenzstufe → Material, als Abschnitte |
| Material | als Seite mit Link, nicht das Material selbst | als Karte mit Link und QR-Code |
| Weiterbearbeiten | ja, im Kurs der Lernplattform | nein |
| Braucht | Rechte zum Wiederherstellen im Kurs | nichts |
| Geprüft | Import in Moodle 4.5 | E2E-Test: Datei kommt an |
| Personenbezug | keiner | keiner (die individuelle Rückmeldung trägt den Namen) |

## Was daraus folgt

- **Die Übergabe an die Lernplattform ist mit einem offenen Standard machbar**,
  ohne Schnittstelle zur Plattform und ohne Server. Für Moodle ist das jetzt
  belegt.
- **Common Cartridge 1.1 ist die richtige Fassung.** Die neuere 1.3 bringt für
  diese Inhalte nichts und schließt Moodle aus. Wer den Export weiterbaut,
  prüft jede Änderung mit einem echten Import, denn eine Cartridge, die nur
  wohlgeformt ist, kann trotzdem abgelehnt werden.
- **Besser würde die Cartridge mit Weblinks statt Seiten.** Common Cartridge
  kennt eigene Weblink-Ressourcen (`imswl`), die Moodle als Aktivität „Link/URL“
  anlegt. Dann führt ein Klick direkt zum Material statt erst auf eine Seite
  mit einem Link. Die Zuordnung zur Stufe ginge dabei nicht verloren, denn die
  Stufe steht schon in der Gliederung.
- **Den Namen der Lerngruppe sollte der Export mitgeben.** „Nach
  Kompetenzstufe“ als Gruppenname ist eine Eigenheit der Demoanwendung, keine
  Grenze des Formats.
- **Erst mit Material, das die Anwendung selbst besitzt, trägt die Cartridge
  Inhalt.** Das ist dieselbe Grenze wie bei den
  [Mediatheken](machbarkeitsstudie-mediatheken.md): Solange Material nur als
  Verweis bekannt ist, kann auch die beste Übergabe nur Verweise übergeben.
