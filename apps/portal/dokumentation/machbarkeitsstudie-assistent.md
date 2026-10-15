# Ein Assistent, der die Auswertung lesen kann

Für dieses Teilkonzept gibt es einen Prototyp: einen **MCP-Server** im
Repository (`mcp-server/`). Er läuft nicht auf dieser Seite, sondern im
Docker-Abbild der Demoanwendung.

Die Bilder auf dieser Seite zeigen **nachgestellte Gespräche**. Fragen und
Antworttexte haben wir geschrieben. Die Zahlen in den Antworten haben wir nicht
erfunden: Für jedes Bild hat ein Skript den MCP-Server gestartet und genau die
Abfragen gestellt, die auch ein Assistent stellen würde, gegen die
Beispieldaten der Demoanwendung. Ändern sich die Beispieldaten, ändern sich die
Zahlen in den Bildern mit.

## Begriffe

- **Sprachmodell:** ein großes Sprachmodell (*Large Language Model*, LLM), wie
  es hinter ChatGPT, Claude oder Mistral steht. Es versteht eine Frage in
  natürlicher Sprache und formuliert eine Antwort.
- **Assistent:** die Anwendung, in der man mit dem Sprachmodell schreibt.
- **MCP (Model Context Protocol):** ein offener Standard, über den ein
  Assistent auf fremde Datenquellen zugreifen kann.
- **MCP-Server:** das Programm, das eine Datenquelle für den Assistenten
  erschließt. Unserer beschreibt dem Sprachmodell sieben **Werkzeuge**, also
  sieben Abfragen, die es stellen darf: zum Beispiel „liste die Lerngruppen
  auf“ oder „hole die Kompetenzstufen einer Lerngruppe“. Jedes Werkzeug ruft
  die Auswertungsschnittstelle TBA3 auf.

## Ergebnis

- **Technisch funktioniert es.** Das Sprachmodell wählt aus den sieben
  Werkzeugen die passenden aus, ruft sie auf und formuliert aus den Zahlen
  eine Antwort. Für die Frage muss vorher niemand eine eigene Ansicht gebaut
  haben.
- **Am meisten bringt es bei Fragen, die Zahlen aus mehreren Ansichten
  brauchen.** Ein Beispiel: „Wie steht meine Klasse im Vergleich zur Schule
  und zum Land?“ In einer Rückmeldung muss die Lehrkraft dafür drei Werte
  nachschlagen und nebeneinanderlegen. Der Assistent stellt die drei Abfragen
  selbst und antwortet mit einer Tabelle.
- **Die Antworten der Schnittstelle sind nicht immer eindeutig.** Für das Land
  liefert sie zum Beispiel zwei Testhefte, ohne zu sagen, welches die Klasse
  geschrieben hat. Ein Mensch würde nachfragen. Ein Sprachmodell rät, wenn man
  es nicht ausdrücklich anweist, beide Werte zu nennen.
- **Die größte Hürde ist der Datenschutz.** Der Prototyp gibt auf Nachfrage
  Ergebnisse einzelner Kinder samt Geschlecht und Familiensprache an das
  Sprachmodell weiter. Bevor so etwas in Schulen eingesetzt wird, müssen die
  Länder entscheiden, welches Sprachmodell welche Daten sehen darf.

## So läuft eine Anfrage ab

![Schema: Die Lehrkraft fragt in eigenen Worten. Der Assistent, ein Sprachmodell, wählt die Abfragen und formuliert die Antwort. Der MCP-Server beschreibt sieben Werkzeuge. Die Auswertungsschnittstelle TBA3 liefert die Zahlen. Rot markiert ist die Verbindung zwischen Assistent und MCP-Server: Hier verlassen die Daten die Schule, wenn das Sprachmodell ein fremder Dienst ist.](/dokumentation/bilder/assistent-schaubild-de.png "Vier Beteiligte. Rot markiert ist die Strecke, auf der Ergebnisdaten zum Sprachmodell gelangen.")

1. Die Lehrkraft stellt im Assistenten eine Frage in eigenen Worten.
2. Das Sprachmodell liest die Frage und die Beschreibungen der sieben
   Werkzeuge. Es entscheidet, welche Abfragen es braucht.
3. Der MCP-Server führt diese Abfragen bei der Auswertungsschnittstelle aus und
   gibt die Zahlen an das Sprachmodell zurück.
4. Das Sprachmodell formuliert aus den Zahlen die Antwort.

Eine Rückmeldung beantwortet nur die Fragen, für die beim Entwurf eine Ansicht
gebaut wurde. Mit einem Assistenten entscheidet die Lehrkraft, was sie wissen
will, und das Sprachmodell setzt die Abfragen dafür zusammen.

## Drei Fragestellungen

Jede Fragestellung zeigt einen anderen Aspekt: was der Assistent gut kann, wo
er an der Schnittstelle an Grenzen stößt und wo der Datenschutz ansetzen muss.

### Klasse, Schule und Land im Vergleich

![Nachgestelltes Gespräch: Eine Lehrkraft fragt, wie ihre 3a im Leseverstehen im Vergleich zu Schule und Land dasteht. Darunter vier Abfragen an die Auswertungsschnittstelle, dann eine Tabelle mit den Anteilen unter dem Mindeststandard und ab dem Regelstandard für Klasse, Schule und zwei Testhefte des Landes. Ein Hinweis sagt, dass die Antwort nicht verrät, welches Testheft die Klasse geschrieben hat.](/dokumentation/bilder/assistent-vergleich-de.png "Nachgestelltes Gespräch. Der graue Kasten zeigt die vier Abfragen, die der Assistent gestellt hat.")

- **Frage:** Wie steht die 3a im Leseverstehen da, verglichen mit der Schule und
  dem Land?
- **Was der Assistent tut:** Er schlägt zuerst nach, unter welcher Kennung die
  Klasse geführt wird (`3a-deutsch`). Dann holt er die Kompetenzstufen für
  Klasse, Schule und Land und stellt sie in einer Tabelle gegenüber.
- **Was sich zeigt:** Das Nachschlagen ist wichtig. Ein Sprachmodell, das eine
  Kennung raten muss, rät plausibel und falsch; deshalb hat der Prototyp eigene
  Werkzeuge zum Nachschlagen. Außerdem liefert die Schnittstelle für das Land
  zwei Testhefte, ohne zu sagen, welches zur Klasse gehört. Die Schnittstelle
  sollte deshalb bei jedem Ergebnis angeben, zu welchem Test es gehört.

### Schwierige Aufgaben und passendes Material

![Nachgestelltes Gespräch: Die Lehrkraft fragt, bei welchen Mathematikaufgaben die 3a deutlich unter anderen Grundschulen lag und ob es Material für Kinder auf Stufe II gibt. Zwei Abfragen, dann eine Tabelle mit drei Aufgaben, ihrer Kompetenzstufe und der Lösungshäufigkeit in der 3a gegenüber Grundschulen, darunter drei Materialien aus „Mathe sicher können“.](/dokumentation/bilder/assistent-material-de.png "Nachgestelltes Gespräch. Aufgabenergebnisse und Materialkatalog in einer Antwort.")

- **Frage:** Bei welchen Mathematikaufgaben lag die 3a deutlich unter anderen
  Grundschulen, und gibt es Material für die Kinder auf Stufe II?
- **Was der Assistent tut:** Er holt die Ergebnisse je Aufgabe und vergleicht
  sie mit der Lösungshäufigkeit an Grundschulen, die die Schnittstelle zu jeder
  Aufgabe mitliefert. Danach fragt er den Materialkatalog nach Material für
  Stufe II ab.
- **Was sich zeigt:** Zwei Quellen werden in einer Antwort verbunden. Ob das
  Material zu den Aufgaben passt, entscheidet die Lehrkraft, und der Assistent
  sagt das auch. Der Materialkatalog ist im Prototyp fest eingebaut und enthält
  nur Mathematik aus „Mathe sicher können“. Mit der Materialschnittstelle
  (`/materials`) könnte der Assistent Material abfragen, das genau einer
  Aufgabe oder Kompetenz zugeordnet ist.

### Einzelne Kinder: wo die Grenze liegt

![Nachgestelltes Gespräch: Die Lehrkraft fragt, welche Kinder der 3a im Leseverstehen unter dem Mindeststandard liegen. Eine Abfrage mit type=students, dann eine Tabelle mit drei Schülercodes samt Geschlecht und Familiensprache. Ein rot markierter Hinweis sagt, dass diese Einzeldaten an das Sprachmodell gegangen sind.](/dokumentation/bilder/assistent-grenze-de.png "Nachgestelltes Gespräch. Die Frage ist naheliegend, die Antwort ist das Problem.")

- **Frage:** Welche Kinder in der 3a liegen im Leseverstehen unter dem
  Mindeststandard?
- **Was der Assistent tut:** Er ruft die Ergebnisse der einzelnen Kinder ab.
  Die Schnittstelle liefert dabei Geschlecht und Familiensprache mit, und der
  Assistent gibt beides an das Sprachmodell weiter. Im Prototyp hält ihn nichts
  davon ab.
- **Was sich zeigt:** Alles, was eine Abfrage zurückgibt, landet beim
  Sprachmodell. Läuft das Modell bei einem fremden Anbieter, verlassen diese
  Daten die Schule. Die Codes sind keine Namen, aber zusammen mit Klasse,
  Geschlecht und Familiensprache lassen sie sich in einer Klasse von 25 Kindern
  schnell zuordnen.

## Was es im Unterricht bringt

- **Fragen in eigenen Worten** statt der Suche nach der richtigen Ansicht. Das
  hilft vor allem bei der Vorbereitung einer Fachkonferenz oder eines Gesprächs
  mit der Schulleitung, wenn mehrere Klassen und Ebenen zusammenkommen.
- **Die Abfragen müssen sichtbar sein.** Eine Zahl, deren Herkunft man nicht
  sieht, taugt nicht für ein Gespräch über Lernstände. Der graue Kasten in den
  Bildern ist deshalb kein Beiwerk, sondern eine Voraussetzung.
- **Der Assistent ersetzt die Rückmeldung nicht.** Er beantwortet Fragen, die
  die Rückmeldung offenlässt. Was ein Wert für den Unterricht bedeutet,
  entscheidet weiterhin die Lehrkraft.

## Was ein Betrieb klären müsste

- **Welches Sprachmodell?** Ein Modell beim Land oder bei einem Anbieter mit
  Vertrag zur Auftragsverarbeitung, oder ein frei verfügbarer Dienst. Davon
  hängt ab, welche Daten überhaupt an das Modell gehen dürfen.
- **Welche Daten?** Ein Assistent nur für Gruppenergebnisse ist eine andere
  Entscheidung als einer mit Ergebnissen einzelner Kinder. Der MCP-Server
  sollte Einzeldaten gar nicht anbieten, solange diese Frage offen ist.
- **Wer fragt?** Der Prototyp hat keine Anmeldung und keine Rollen. Er kann
  nicht auf „Ihre Klasse“ beschränken, selbst wenn er wollte.
- **Eindeutige Antworten.** Jedes Ergebnis sollte Test, Jahrgang und Testheft
  nennen, und die Liste der Lerngruppen sollte aus der Schnittstelle kommen
  statt aus einer fest eingebauten Liste.

Die technischen Einzelheiten stehen in den
[Rezepten der Demoanwendung](demo-rezepte.md#ein-assistent-der-die-auswertung-lesen-kann-der-mcp-server).
Dort sind die sieben Werkzeuge beschrieben, dazu die beiden Übertragungswege und
der Betrieb im Container.
