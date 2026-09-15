# TBA3-Demoanwendung: Rezepte

Die [Rezepte zur Schnittstelle](rezepte.md) beantworten, welche Anfrage zu welcher
Frage passt. Hier steht die andere Hälfte: was eine Oberfläche mit den Antworten
macht. Die Beispiele stammen aus der Demoanwendung dieses Repositories, beschreiben
aber Muster und keine Komponenten — nachbauen lässt sich jedes davon in einer
fremden Anwendung.

Dieses Dokument gehört zu dieser Seite und wird hier gepflegt, nicht in
`indibit-eu/tba3`.

## Individualergebnisse zeigen, ohne Namen zu zeigen: der Observer-Modus

### Die Lage

Auswertungen auf Individualebene werden selten allein gelesen. Sie liegen in der
Klassenkonferenz auf dem Beamer, sie gehen in einer Bildschirmfreigabe durch eine
Videokonferenz, sie stehen in einem Screenshot an einem Fehlerbericht — und jemand
schaut mit, der zu den Zahlen befugt ist, aber nicht zu den Namen dahinter.

Die naheliegende Antwort — in solchen Lagen eben keine Individualebene zeigen —
beendet das Gespräch, bevor es anfängt. Wer über Förderbedarf spricht, braucht die
einzelne Zeile; die Verteilung über die Gruppe sagt darüber nichts. Gesucht ist
also nicht weniger Inhalt, sondern derselbe Inhalt ohne den Namen.

### Der Schalter

Im Kopf der Demoanwendung sitzt dafür ein Schalter mit einem Auge, beschriftet mit
„Namen“ bzw. „Observer“ (`apps/demo/src/components/layout/Header.jsx`). Ein Klick
legt die ganze Anwendung um — nicht eine einzelne Ansicht, denn der Beamer zeigt
auch die nächste.

Der Zustand liegt neben den Filtern im `FilterContext`
(`apps/demo/src/context/FilterContext.jsx`), weil jede Ansicht, die Namen zeigt,
ohnehin schon an diesem Kontext hängt:

```jsx
const { observerMode } = useFilters();

<span className={observerMode ? 'blur select-none' : ''}>
  {student.firstName} {student.lastName}
</span>
```

Zwei Klassen, nicht eine: `blur` zeichnet weich, `select-none` verhindert, dass man
den unleserlichen Namen mit der Maus markiert und in die Zwischenablage zieht.

### Was verdeckt wird

| Ort | im Normalfall | im Observer-Modus |
|---|---|---|
| Schülerliste | Vor- und Nachname | weichgezeichnet |
| Mitgliederliste einer eigenen Gruppe | Vor- und Nachname | weichgezeichnet |
| Auswahlliste im Gruppeneditor | Vor- und Nachname | weichgezeichnet |
| Datenblatt (Modal und Vollansicht) | Name als Überschrift | weichgezeichnet |
| Schüler-Karte, Punktbeschriftung | Initialen (`AM`) | `••` |
| Schüler-Karte, Tooltip | Name | weichgezeichnet |

Die Punktbeschriftung ist der Fall, an dem der einfache Weg nicht reicht: zwei
Initialen sind auch weichgezeichnet noch zwei Zeichen an einer bekannten Stelle,
und in einer Klasse von zwölf sind sie damit so gut wie der Name. Deshalb werden
sie ersetzt statt verwischt (`StudentMapCard.jsx`) — wo die Verdeckung wenig
Material hat, muss sie das Material wegnehmen.

### Was mit Absicht stehen bleibt

Klasse, Fach, Klassenstufe, Kompetenzstufe und die Kovariaten bleiben lesbar. Das
ist der Punkt der Übung: verdeckt wird die Person, nicht das Ergebnis.

Damit ist auch gesagt, wogegen der Modus nicht schützt. Wer die Klasse kennt, kann
aus Klasse, Geschlecht und Sprache zu Hause oft genug auf die Person schließen —
in einer Gruppe von zwölf reicht manchmal eine Kovariate. Der Observer-Modus
schützt gegen den Blick von jemandem, der die Gruppe *nicht* kennt: gegen den
Beamer im vollen Raum, die Bildschirmfreigabe, den Screenshot. Gegen die Kollegin,
die die Klasse unterrichtet, schützt keine Unkenntlichmachung, die die Ergebnisse
stehen lässt.

### Was der Modus nicht leistet

- **Der Name steht weiter im DOM.** `blur` ist ein Darstellungsfilter, keine
  Schwärzung: in der Entwicklerkonsole, im Quelltext der Seite und für
  Vorlesesoftware ist der Name unverändert da. Das ist die Grenze zwischen
  „nicht sichtbar“ und „nicht vorhanden“, und der Modus liegt auf der ersten Seite.
- **Der Export trägt den Klarnamen.** Das PDF einer Einzelrückmeldung schreibt
  Name und Dateinamen unverändert (`apps/demo/src/utils/studentPdfExport.js`), auch
  bei eingeschaltetem Observer-Modus. Vertretbar ist das, weil eine Rückmeldung an
  die Person selbst geht und ein namenloses PDF dort nutzlos wäre — eine
  ausdrückliche Entscheidung ist es bisher nicht. Wer das Muster übernimmt, trifft
  sie besser bewusst.
- **Der Schalter überlebt kein Neuladen.** Er liegt in `useState` und nicht in der
  Adresszeile: nach `F5` stehen die Namen wieder da, und ein geteilter Deeplink
  trägt den Modus nicht mit. Für einen Schalter, der im Gespräch umgelegt wird,
  ist das brauchbar; als Voreinstellung einer Rolle „Beobachter“ wäre es zu wenig.

### Wo die Grenze wirklich liegt

Beim liefernden System. Die Schnittstelle verlangt keinen Klarnamen: `name` an der
Wertegruppe heißt in der Spezifikation „Bezeichnung der Wertegruppe“, und das
Beispiel dort ist bereits `Schüler 1`. Ob eine Antwort mit `type=students` einen
Namen, ein Kürzel oder ein Pseudonym trägt, entscheidet also die Stelle, die sie
ausliefert — nicht die Oberfläche, die sie anzeigt. Zu den Wertegruppen und zu
`type` siehe die [Endpunkt-Referenz](endpunkt-referenz.md).

Die Demoanwendung selbst hat gar keine echten Namen: sie erfindet sie deterministisch
im Browser (`apps/demo/src/utils/studentData.js`), damit eine Oberfläche mit Namen
überhaupt zu sehen ist. Der Observer-Modus schützt hier also nichts — er zeigt ein
Muster, das in einer echten Anwendung etwas zu schützen hätte.

Daraus folgt die Reihenfolge für ein echtes Vorhaben:

1. Liefere keine Namen, wo keine gebraucht werden — die Pseudonymisierung gehört
   ins Backend, nicht in ein CSS-Filter.
2. Zeige die Namen nur dort, wo die Rolle sie braucht (die Klassenleitung braucht
   sie, die Schulaufsicht nicht).
3. Und für die Momente, in denen jemand mitschaut, gibt es zusätzlich einen
   Schalter wie diesen.

Der Observer-Modus ist Schritt 3. Er ersetzt die Schritte 1 und 2 nicht.

### Nachbauen

Drei Zutaten, unabhängig vom Framework:

1. **Ein Merker an einer Stelle, die jede Ansicht schon kennt** — Kontext, Store,
   was die Anwendung eben hat. Pro Ansicht ein eigener Schalter wäre falsch: wer
   ihn umlegt, will ihn überall umgelegt haben.
2. **Eine Regel, was er trifft.** Die kurze Fassung: den Namen, sonst nichts. Alles
   andere ist Ergebnis und soll lesbar bleiben.
3. **Eine Sonderbehandlung für Kurzformen.** Initialen, Kürzel, Avatare mit
   Buchstaben — überall dort, wo wenig Zeichen an einer festen Stelle stehen,
   ersetzen statt weichzeichnen.

Und eine vierte, die leicht vergessen wird: ein Test, der beides prüft — dass der
Name verdeckt ist *und* dass das Ergebnis daneben noch dasteht. In diesem
Repository tut das `e2e/demo-schueler.spec.js` gegen den ausgelieferten Stand.
