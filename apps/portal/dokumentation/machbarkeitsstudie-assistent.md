# Ein Assistent, der die Auswertung lesen kann

Prototyp: der MCP-Server im Repository (`mcp-server/`), ein Pilot. Die Gespräche
auf dieser Seite sind **Mockups**: Die Fragen und Formulierungen sind
ausgedacht. Die Zahlen sind echt. Für jedes Bild wurden die Werkzeuge des
Piloten tatsächlich aufgerufen, gegen die Beispieldaten der Demoanwendung.

## Ergebnis

- **Technisch geht es.** Ein Sprachmodell, dem man die Abfragen der
  Auswertungsschnittstelle beschreibt, stellt sie selbst zusammen. So
  beantwortet es Fragen, für die niemand eine Ansicht gebaut hat.
- **Der Gewinn liegt bei Fragen, die mehrere Abfragen kreuzen.** Die Klasse
  gegen Schule und Land, schwache Aufgaben samt passendem Material: Dafür
  braucht man in einer Rückmeldung mehrere Ansichten und den Kopf der Lehrkraft.
  Der Assistent erledigt das in einem Schritt.
- **Die Antworten der Schnittstelle sind für ein Modell nicht eindeutig genug.**
  Für das Land kommen zwei Testhefte zurück, ohne Angabe, welches die Klasse
  geschrieben hat. Ein Mensch fragt nach. Ein Modell rät, oder es nennt beides,
  wenn man es dazu anhält.
- **Die eigentliche Hürde ist der Datenschutz.** Der Pilot gibt auf Nachfrage
  Einzeldaten mit Geschlecht und Familiensprache an das Sprachmodell weiter.
  Bevor so etwas in Schulen läuft, müssen die Länder entscheiden, welches Modell
  die Daten sehen darf und welche Daten überhaupt.

## Wie es zusammenhängt

Eine Rückmeldung beantwortet die Fragen, die beim Entwurf vorhergesehen wurden.
„Bei welchen Aufgaben lag meine Klasse unter anderen Grundschulen, und gibt es
dazu Material?“ ist keine davon. Für jede solche Kreuzung eine eigene Ansicht zu
bauen, hört nie auf.

Das **Model Context Protocol (MCP)** ist ein offener Standard, über den ein
Assistent Werkzeuge nutzen kann. Der MCP-Server beschreibt ihm, welche Abfragen
es gibt und was sie brauchen. Welche davon eine Frage beantworten, entscheidet
das Sprachmodell.

![Schema: Die Lehrkraft fragt in eigenen Worten. Der Assistent, ein Sprachmodell, wählt die Abfragen und formuliert die Antwort. Der MCP-Server beschreibt sieben Werkzeuge. Die Auswertungsschnittstelle TBA3 liefert die Zahlen. Rot markiert ist die Verbindung zwischen Assistent und MCP-Server: Hier verlassen die Daten die Schule, wenn das Sprachmodell ein fremder Dienst ist.](/dokumentation/bilder/assistent-schaubild-de.png "Vier Beteiligte. Kritisch ist die Strecke zwischen MCP-Server und Sprachmodell.")

## Drei Gespräche

### Die Klasse im Vergleich

![Mockup eines Assistenten-Gesprächs: Eine Lehrkraft fragt, wie ihre 3a im Leseverstehen im Vergleich zu Schule und Land dasteht. Darunter vier Werkzeugaufrufe an die Auswertungsschnittstelle, dann eine Tabelle mit den Anteilen unter dem Mindeststandard und ab dem Regelstandard für Klasse, Schule und zwei Testhefte des Landes. Ein Hinweis sagt, dass die Antwort nicht verrät, welches Testheft die Klasse geschrieben hat.](/dokumentation/bilder/assistent-vergleich-de.png "Mockup. Vier Abfragen, eine Tabelle. Der graue Kasten zeigt, was im Hintergrund passiert ist.")

Der Assistent schlägt zuerst nach, wie die Klasse in den Daten heißt, und holt
dann die Kompetenzstufen für Klasse, Schule und Land. Diese Reihenfolge ist
kein Zufall: **Ein Modell, das eine Kennung wie `3a-deutsch` raten muss, rät
plausibel und falsch.** Deshalb hat der Pilot eigene Werkzeuge zum Nachschlagen.

Die Landesantwort enthält zwei Testhefte für Deutsch in Klasse 3, und nichts in
der Antwort sagt, welches zu dieser Klasse gehört. In einer Rückmeldung fällt
das nicht auf, weil die Ansicht es fest verdrahtet. Ein Assistent muss es
offenlegen. Für die Schnittstelle heißt das: Eine Wertegruppe sollte sagen,
zu welchem Test sie gehört.

### Schwache Aufgaben und passendes Material

![Mockup: Die Lehrkraft fragt, bei welchen Mathematikaufgaben die 3a deutlich unter anderen Grundschulen lag und ob es Material für Kinder auf Stufe II gibt. Zwei Werkzeugaufrufe, dann eine Tabelle mit drei Aufgaben, ihrer Kompetenzstufe und der Lösungshäufigkeit in der 3a gegenüber Grundschulen, darunter drei Materialien aus „Mathe sicher können“.](/dokumentation/bilder/assistent-material-de.png "Mockup. Aufgabenergebnisse und Materialkatalog in einer Antwort.")

Hier kreuzt der Assistent zwei Quellen: **die Lösungshäufigkeit je Aufgabe** mit
dem Bezugswert für Grundschulen, den jede Aufgabe mitbringt, und **den
Materialkatalog**. Die Entscheidung, ob das Material zu den Aufgaben passt,
bleibt bei der Lehrkraft. Das sagt der Assistent auch dazu.

Der Materialkatalog ist im Pilot fest eingebaut. Er enthält nur Mathematik aus
„Mathe sicher können“. Mit der Materialschnittstelle (`/materials`) könnte der
Assistent stattdessen Material abfragen, das einer Aufgabe oder einer
Kompetenz zugeordnet ist.

### Wo die Grenze liegt

![Mockup: Die Lehrkraft fragt, welche Kinder der 3a im Leseverstehen unter dem Mindeststandard liegen. Ein Werkzeugaufruf mit type=students, dann eine Tabelle mit drei Schülercodes samt Geschlecht und Familiensprache. Ein rot markierter Hinweis sagt, dass diese Einzeldaten an das Sprachmodell gegangen sind.](/dokumentation/bilder/assistent-grenze-de.png "Mockup. Die Frage ist naheliegend, die Antwort ist das Problem.")

Die Frage ist die, die eine Lehrkraft am ehesten stellt. **Im Pilot hält den
Assistenten nichts davon ab, sie zu beantworten.** Er ruft die Einzeldaten ab,
und mit ihnen Geschlecht und Familiensprache, weil die Schnittstelle sie
mitliefert. Alles, was ein Werkzeug zurückgibt, geht an das Sprachmodell.
Läuft das Modell bei einem fremden Anbieter, verlassen diese Daten die Schule.

Die Codes sind Pseudonyme, keine Namen. Zusammen mit Klasse, Geschlecht und
Familiensprache sind sie in einer Klasse von 25 Kindern trotzdem schnell
zuzuordnen.

## Was es im Unterricht bringt

- **Fragen in eigenen Worten** statt der Suche nach der richtigen Ansicht. Das
  hilft vor allem bei der Vorbereitung einer Fachkonferenz oder eines Gesprächs
  mit der Schulleitung, wenn mehrere Klassen und Ebenen zusammenkommen.
- **Die Abfragen müssen sichtbar sein.** Eine Zahl ohne Herkunft ist in einem
  Gespräch über Lernstände wertlos. Der graue Kasten in den Mockups ist kein
  Beiwerk, sondern Voraussetzung.
- **Der Assistent ersetzt die Rückmeldung nicht.** Er beantwortet Fragen, die
  die Rückmeldung offenlässt. Die Einordnung, also was ein Wert für den
  Unterricht bedeutet, bleibt bei der Lehrkraft.

## Was ein Betrieb klären müsste

- **Welches Modell?** Ein Modell beim Land oder bei einem Anbieter mit
  Auftragsverarbeitung, oder ein fremder Dienst. Davon hängt ab, welche Daten
  überhaupt an das Modell gehen dürfen.
- **Welche Daten?** Ein Assistent nur für Gruppenergebnisse ist eine andere
  Entscheidung als einer mit Einzeldaten. Das Werkzeug sollte Einzeldaten gar
  nicht anbieten, solange die Frage nicht beantwortet ist.
- **Wer fragt?** Der Pilot hat keine Anmeldung und keine Rollen. Er könnte
  nicht auf „Ihre Klasse“ einschränken, selbst wenn er wollte.
- **Eindeutige Antworten.** Wertegruppen sollten Test, Jahrgang und Testheft
  nennen, und ein Verzeichnis der Lerngruppen sollte aus der Schnittstelle
  kommen statt aus einer eingebauten Liste.

Die technischen Einzelheiten stehen in den
[Rezepten der Demoanwendung](demo-rezepte.md#ein-assistent-der-die-auswertung-lesen-kann-der-mcp-server).
Dort sind die sieben Werkzeuge beschrieben, dazu die beiden Transporte und der
Betrieb im Container.
