# Ergebnisdaten zur Weiterarbeit übergeben: Konzeptentwurf am Beispiel AIS.schule

Teil der [Machbarkeitsstudie](machbarkeitsstudie.md). Anders als bei den anderen
Teilkonzepten gibt es hier **keinen Prototyp**; gebaut wurde nichts.
Die Seite beschreibt, welche Daten die Auswertungsschnittstelle hergibt, wo sie
in einem Lernsystem weiterwirken könnten und was dafür auf beiden Seiten fehlt.
Als Beispiel dient AIS.schule. Die Angaben zu AIS stammen von der öffentlichen
Projektseite [ais.schule](https://ais.schule/) und aus einer Durchsicht der
AIS-Repositorien am 14.10.2026, die noch nicht öffentlich sind. Was daraus
stammt, ist **abstrahiert**: Namen und Strukturen sind vereinfacht und auf
Deutsch übertragen, Quelltext ist nicht wiedergegeben. AIS ist in Entwicklung;
der Stand kann sich schnell ändern.

## Das Ergebnis vorweg

- **Fachlich passen beide zusammen.** VERA liefert eine Diagnose, AIS will
  Lehrkräften bei Diagnostik, Förderung und Unterrichtsplanung helfen. Beide
  dienen ausdrücklich nicht der Benotung. Eine Rückmeldung, die nicht im
  Bericht endet, sondern in der Planung weiterwirkt, ist genau der Fall, für den
  AIS gedacht ist.
- **Der erste Schritt kommt ohne personenbezogene Daten aus.** Übergeben wird das
  Ergebnis der *Lerngruppe*: wie sich die Klasse auf die Kompetenzstufen
  verteilt und bei welchen Kompetenzen sie unter dem Vergleichswert liegt.
  Daraus kann ein Lernsystem Vorschläge für Lernpfade und Material ableiten,
  über die die Lehrkraft entscheidet.
- **Es fehlt derselbe gemeinsame Schlüssel wie bei den Mediatheken.** Die
  Schnittstelle nennt Kompetenzen nur als Kürzel ohne Bezugssystem (`L2`,
  `3.3.b`). Ein anderes System kann damit nichts anfangen, solange nicht
  feststeht, welcher Bildungsstandard gemeint ist. Die Lösung ist dieselbe wie
  auf der Seite [Mediatheken einbinden](machbarkeitsstudie-mediatheken.md): eine
  auflösbare Kennung je Kompetenz.
- **Einzelergebnisse sind die hohe Hürde.** VERA-Codes und die Pseudonyme eines
  Lernsystems haben nichts gemeinsam. Eine Verknüpfung müsste die Lehrkraft
  selbst herstellen, und ob die Ergebnisse dafür überhaupt weitergegeben werden
  dürfen, ist eine Frage an die Länder, nicht an die Technik.
- **Im AIS-Piloten treffen sich die Jahrgänge nicht.** VERA wird in den Klassen 3
  und 8 geschrieben, der Pilot arbeitet in den Klassen 5 und 6. Für eine
  Erprobung bräuchte es also entweder ältere VERA-3-Ergebnisse als Ausgangslage
  nach dem Übergang oder einen späteren Ausbau von AIS auf weitere Jahrgänge.

## Die Frage

Eine Rückmeldung ist ein Endpunkt: Die Lehrkraft liest sie, zieht Schlüsse und
plant danach, meist im Kopf. Die vorigen Teilkonzepte haben untersucht, wie
*Material* aus der Rückmeldung in die Lernplattform kommt. Hier geht es um die
*Ergebnisse selbst*: Lassen sie sich an ein System übergeben, das mit ihnen
weiterarbeitet, etwa indem es Lernpfade vorschlägt oder den Lernstand einer
Klasse von Anfang an kennt, statt ihn erst mühsam zu ermitteln?

## AIS.schule in Kürze

AIS (Adaptives Intelligentes System) ist ein Projekt des FWU im Auftrag der
Länder, finanziert aus dem DigitalPakt Schule. Laut Projektseite entsteht eine
KI-gestützte Lehr- und Lernumgebung für allgemeinbildende Schulen:

- Schüler:innen bekommen **adaptive Lernpfade**, die sich nach Lernstand und
  Lernfortschritt verändern, und einen **KI-Tutor**.
- Lehrkräfte bekommen einen **Überblick über den Lernstand** ihrer Klasse, ein
  **Empfehlungssystem für die Unterrichtsplanung** und einen Editor für
  Lernmaterial.
- Medienanbieter und die OER-Community können Material einstellen.
- **„AIS dient nicht der Leistungsbewertung oder Benotung“**, sondern der
  Lernbegleitung.
- Zum Schuljahr 2026/27 startet ein **Pilot** an ausgewählten Schulen mit
  Material für Deutsch und Mathematik in den Klassen 5 und 6. Die Daten werden
  pseudonymisiert verarbeitet.

## Wo Ergebnisse in AIS ankämen (abstrahiert)

Für eine Übergabe zählen in AIS drei Dinge: wie AIS den Lernstand führt, wie
eine Lehrkraft plant und worauf sich beides fachlich bezieht. Vereinfacht sieht
das so aus:

```ts
// Fachmodell: Wissensbausteine, gebündelt zu Fertigkeiten und Bereichen,
// verbunden durch Voraussetzungen („erst A, dann B“).
type BausteinId = string;

// Lernstand: je Schüler:in und Wissensbaustein.
interface Lernstand {
  schueler: Pseudonym;     // kein Klarname, kein VERA-Code
  baustein: BausteinId;
  beherrschung: number;    // 0 … 1, aus den Antworten geschätzt
  verlauf: number[];
  versuche: number;        // 0 heißt: nie selbst gemessen, nur abgeleitet
}

// Überblick für Lehrkräfte: je Baustein verdichtet auf vier Klassen.
type Einordnung = 'beherrscht' | 'in Arbeit' | 'braucht Übung' | 'keine Daten';

// Planung: ein Abschnitt eines Lernpfads.
interface PlanAbschnitt {
  modus: 'beherrschen' | 'üben' | 'diagnose' | 'erkunden';
  bezug: { art: 'baustein' | 'fertigkeit' | 'bereich' | 'standard'; id: string }[];
  zugang?: {               // Differenzierung: wer diesen Abschnitt bekommt
    wenn: 'beherrschung unter' | 'beherrschung erreicht';
    baustein: BausteinId;
    schwelle: number;
  };
}
```

Daraus ergibt sich, wo die Ergebnisse der Schnittstelle andocken könnten und
wo nicht:

| Aus der Rückmeldung (TBA3) | In AIS | Passung |
|---|---|---|
| Kompetenz, Leitidee (heute nur als Kürzel) | Planbezug der Art `standard` | **Gut.** Den Bezug auf einen Standard sieht die Planung schon vor. Es fehlen die Kennungen auf TBA3-Seite und eine Zuordnung Standard → Bausteine in AIS. |
| Stufenverteilung der Gruppe je Teilbereich | `Einordnung` je Baustein im Überblick | **Mittel.** Andere Körnung: VERA misst Teilbereiche, AIS führt feine Bausteine. Für einen Kontext neben dem eigenen Bild (Weg 2) reicht das, für eine Verrechnung nicht. |
| Stufe I–V einer Person | `Lernstand.beherrschung` mit `versuche = 0` | **Als Startwert denkbar.** Die Unterscheidung zwischen „gemessen“ und „nur geschätzt“ gibt es schon, und ein VERA-Wert gehört klar zur zweiten Sorte. |

Vier Befunde aus der Durchsicht ergänzen das:

- **Der Lernstand hat mit Absicht keinen Schreibweg von außen.** Eine
  Anwendung darf ihn nicht setzen. Der Weg wurde geschlossen, damit sich
  niemand selbst einstufen kann. Ein Import von VERA-Ergebnissen bräuchte
  deshalb einen eigenen, ausgewiesenen Weg, der die Herkunft mitschreibt, und
  keinen Umweg über die bestehende Oberfläche.
- **Der Lehrplanbezug läuft über MEM, aber zu den Landeslehrplänen.** AIS
  ordnet seine Bausteine über MEM den Lehrplänen einzelner Länder zu (bisher
  Bayern und Sachsen, maschinell vorgeschlagen und in Prüfung). Eine Zuordnung
  zu den **KMK-Bildungsstandards des IQB**, in denen VERA denkt, gibt es nicht.
  Und weil MEM selbst keinen Weg vom Bildungsstandard zum Landeslehrplan kennt
  (siehe [Mediatheken einbinden](machbarkeitsstudie-mediatheken.md#was-zur-brücke-fehlt)),
  hilft auch der Umweg nicht. Diese Zuordnung wäre auf AIS-Seite neu zu bauen.
- **Personen gibt es nur als Pseudonym.** Die Schule ist nur als Prüfsumme
  hinterlegt, Klarnamen liegen getrennt in einer eigenen Ablage, und jede
  Datenbank trennt die Mandanten auf Zeilenebene. Einen gemeinsamen Schlüssel
  mit den VERA-Codes gibt es nicht, und das ist richtig so.
- **Die Lernanalyse ist kein offener Learning Record Store.** Der Dienst nimmt
  eine feste Liste von Verben an und nur von Diensten mit erhöhten Rechten. Das
  bestätigt die Einschätzung zu Weg 4 weiter unten.

In der Produktplanung von AIS stehen ein Lernstandsüberblick je Person,
Übungsempfehlungen aus der Diagnostik und Lerngruppen mit verdichtetem
Lernstand. Ein Gestaltungsentwurf zeigt den Lernstand je Standard auf einer
fünfstufigen Skala von „keine“ über Mindest-, Regel- und Regelstandard plus bis
„optimal“. Das entspricht fast genau den VERA-Stufen I bis V. Gebaut ist davon
der Entwurf, nicht die Anwendung. Pläne, die TBA3 oder VERA ausdrücklich
nennen, gibt es bisher nicht.

## Was die Schnittstelle übergeben könnte

Die Auswertungsschnittstelle liefert Ergebnisse auf drei Ebenen (Lerngruppe,
Schule, Land) und jeweils wahlweise für die Gruppe oder für jede einzelne Person
(`type=group` oder `type=students`). Für die Weiterarbeit in einem Lernsystem
zählen vor allem diese Antworten:

| Antwort | Inhalt | Personenbezug |
|---|---|---|
| `/groups/{id}/competence-levels` | Verteilung der Gruppe auf die Kompetenzstufen I–V, je Teilbereich | nein |
| `/groups/{id}/items` | Lösungshäufigkeit je Aufgabe, mit Kompetenzbezug, Anforderungsbereich und Stufe der Aufgabe | nein |
| `/groups/{id}/aggregations?aggregation=competence` | Ergebnisse je Kompetenz, verdichtet | nein |
| dieselben mit `type=students` | dasselbe je Schüler:in, unter einem Code | ja, pseudonym |
| `/schools/…`, `/states/…` | Vergleichswerte für Schule und Land | nein |

Die Gruppenebene sieht in der Demoanwendung so aus:

![Fünf Kacheln für die Kompetenzstufen I bis V mit Anzahl und Anteil der Schüler:innen der Lerngruppe 3a Deutsch.](/dokumentation/bilder/lms-stufen-de.png "Die Verteilung einer Lerngruppe auf die Kompetenzstufen, wie die Schnittstelle sie liefert. Genau diese Angabe, je Kompetenz statt je Test, wäre der Kern einer Übergabe.")

## Vier Wege, nach Eignung geordnet

### 1. Gruppenergebnis in die Planung

Die Lehrkraft übergibt aus der Rückmeldung das Ergebnis ihrer Klasse. Das
Lernsystem schlägt daraufhin vor, welche Kompetenzen in den nächsten Wochen
Vorrang haben und welche Lernpfade oder Materialien für welche Stufe passen.
Die Lehrkraft nimmt an, ändert oder verwirft.

- **Was TBA3 liefern muss:** je Kompetenz eine auflösbare Kennung, die
  Stufenverteilung und die Lösungshäufigkeit, dazu den Vergleichswert.
- **Was das Lernsystem bieten muss:** eine Stelle, an der eine Lehrkraft ein
  solches Paket für ihre Lerngruppe einspielt, und eine Zuordnung von
  Bildungsstandards zu den eigenen Lernzielen und Inhalten.
- **Datenschutz:** kein Personenbezug. Das ist der leichteste Fall.

### 2. Gruppenergebnis als Kontext im Überblick

Das Lernsystem zeigt das VERA-Ergebnis neben seinem eigenen Bild vom Lernstand
der Klasse, ohne es zu verrechnen. Die Lehrkraft sieht dann zum Beispiel, dass
die Klasse im VERA-Test bei *Messen* schwach war, im Lernsystem aber
inzwischen aufgeholt hat. Technisch braucht dieser Weg dasselbe wie der erste,
nur ohne Vorschläge.

### 3. Einzelergebnisse als Ausgangslage

Für jede Schülerin und jeden Schüler übernimmt das Lernsystem die erreichte
Stufe als Startpunkt, statt den Lernstand erst über eigene Aufgaben zu
ermitteln. Das wäre der größte Gewinn und die höchste Hürde:

- **Kein gemeinsamer Schlüssel.** VERA kennt die Kinder unter einem Testcode,
  ein Lernsystem unter seinem eigenen Pseudonym. Zusammenführen kann sie nur die
  Lehrkraft, und das am besten im eigenen Browser, sodass weder das Lernsystem
  die Testcodes noch die Schnittstelle die Pseudonyme erfährt.
- **Eine Testleistung ist kein Lernstand.** Ein VERA-Ergebnis ist eine Messung
  an einem Tag. Ein Lernsystem sollte es als Schätzung mit Herkunft und Datum
  führen, die eigene Beobachtungen überschreiben, nicht als festen Wert.
- **Die Weitergabe muss erlaubt sein.** Wofür VERA-Ergebnisse verwendet werden
  dürfen, regeln die Länder. Ob eine Weitergabe an ein Lernsystem darunter
  fällt, muss vor jedem Bau geklärt sein.

### 4. Lernanalyse-Standards wie xAPI

xAPI beschreibt einzelne Lernhandlungen („hat Aufgabe 3 gelöst“) und sammelt sie
in einem Learning Record Store. VERA-Ergebnisse sind das Gegenteil: verdichtete
Testergebnisse, oft auf Gruppenebene. Man kann sie in Statements zerlegen, aber
dabei geht verloren, was sie aussagekräftig macht (Stufe, Vergleichswert,
Bezugsgruppe). Für die Übergabe von Ergebnissen ist ein eigenes, kleines
Format passender. xAPI kommt erst in Frage, wenn einzelne Aufgabenantworten
weitergegeben werden sollen.

## Ein Übergabeformat als Entwurf

So könnte das Paket für den ersten Weg aussehen. Das Format ist ein Vorschlag
dieser Studie, kein Teil der Schnittstelle und mit niemandem abgestimmt. Die
Stufenverteilung stammt aus den Beispieldaten der Demoanwendung, die übrigen
Zahlen sind zur Veranschaulichung gesetzt:

```json
{
  "format": "tba3-ergebnispaket/0.1-entwurf",
  "erstellt": "2026-10-14",
  "test": {
    "name": "VERA 3 Deutsch",
    "bildungsstandards": "https://w3id.org/iqb/bista04-de-p/"
  },
  "lerngruppe": {
    "bezeichnung": "3a Deutsch",
    "fach": "Deutsch",
    "jahrgang": 3
  },
  "personenbezug": false,
  "teilbereiche": [
    {
      "kennung": "https://w3id.org/iqb/bista04-de-p/…",
      "bezeichnung": "Lesen – mit Texten und Medien umgehen",
      "kompetenzstufen": { "I": 0.08, "II": 0.22, "III": 0.34, "IV": 0.24, "V": 0.12 },
      "vergleich": { "ebene": "land", "mindeststandard_erreicht": 0.88 }
    }
  ],
  "kompetenzen": [
    {
      "kennung": "https://w3id.org/iqb/bista04-de-p/…",
      "kuerzel": "3.3",
      "bezeichnung": "Texte erschließen",
      "loesungshaeufigkeit": 0.61,
      "vergleich_land": 0.68
    }
  ]
}
```

Drei Entscheidungen stecken darin:

- **Die Kennung ist eine Adresse, das Kürzel nur Beiwerk.** `kennung` zeigt auf
  den Standard im Vokabular des IQB, wie es der Ontologieserver
  [MEM](machbarkeitsstudie-mediatheken.md#könnte-mem-die-zwischenschicht-sein)
  führt. Ein empfangendes System kann sie nachschlagen, statt eine Liste von
  Kürzeln je Fach und Fassung pflegen zu müssen. Die `…` stehen für die
  Kennungen, die die Schnittstelle heute noch nicht liefert. In der
  Spezifikation gibt es das Feld dafür schon (`competences[].id`), es bleibt
  nur leer.
- **Die Fassung der Standards steht im Paket.** Die Bildungsstandards von 2004
  und 2022 nummerieren dieselben Inhalte verschieden. Ohne Angabe der Fassung
  ist auch eine Adresse nicht eindeutig zuzuordnen.
- **`personenbezug` steht ausdrücklich da.** Ein Paket mit Einzelergebnissen
  wäre ein anderes Paket, mit anderen Regeln. Das empfangende System soll das
  nicht erst am Inhalt erkennen müssen.

## Wie die Übergabe ablaufen könnte

```
Rückmeldung (TBA3-Oberfläche)            Lernsystem (z. B. AIS)
─────────────────────────────            ──────────────────────
1. Lehrkraft öffnet die Rückmeldung
   ihrer Klasse
2. „An Lernsystem übergeben“
3. Paket entsteht im Browser
   (nur Gruppenebene)
4. Übergabe als Datei oder Link  ─────▶  5. Paket der eigenen Lerngruppe
                                            zuordnen
                                         6. Kennungen auflösen
                                            (Bildungsstandard → eigene
                                            Lernziele)
                                         7. Vorschläge für Lernpfade
                                            und Material je Stufe
                                         8. Lehrkraft entscheidet
```

Für die Übergabe in Schritt 4 gibt es drei Wege, vom einfachsten zum
aufwendigsten:

| Weg | Wie | Vorteil | Nachteil |
|---|---|---|---|
| Datei | Die Lehrkraft lädt das Paket herunter und im Lernsystem wieder hoch, wie bei der [Common Cartridge](machbarkeitsstudie-lms-export.md). | Keine Verbindung zwischen den Systemen, die Lehrkraft sieht, was übergeben wird. | Ein Arbeitsschritt mehr. |
| Link | Die Rückmeldung öffnet das Lernsystem und gibt das Paket beim Aufruf mit, zum Beispiel als Parameter eines LTI-Starts. | Ein Klick. | Beide Systeme müssen sich kennen. |
| Server zu Server | Das Lernsystem holt die Ergebnisse selbst über die Schnittstelle. | Immer aktuell. | Braucht Zugangsrechte auf die Ergebnisse; das ist datenschutzrechtlich der schwerste Fall. |

Für eine Erprobung reicht die Datei. Sie trennt die Systeme sauber und
lässt die Entscheidung über die Weitergabe dort, wo sie hingehört, bei der
Lehrkraft.

## Was dafür auf beiden Seiten fehlt

| Seite | Was fehlt | Aufwand |
|---|---|---|
| Schnittstelle (TBA3) | `competences[].id` und Teilbereiche mit auflösbarer Kennung füllen, Fassung der Standards mitgeben | gering, die Felder sind vorgesehen |
| Oberfläche der Rückmeldung | ein Export „An Lernsystem übergeben“ im Format oben | gering, ähnlich dem Cartridge-Export |
| Lernsystem (AIS) | ein Import für Gruppenergebnisse, der einer Lerngruppe zugeordnet wird und in der Planung als Bezug der Art `standard` auftaucht | mittel |
| Lernsystem (AIS) | eine Zuordnung der KMK-Bildungsstandards zu den eigenen Wissensbausteinen, neben der bestehenden Zuordnung zu Landeslehrplänen | hoch, fachlich zu prüfen |
| Lernsystem (AIS), nur für Einzelergebnisse | ein eigener, ausgewiesener Schreibweg für den Lernstand, der Herkunft und Datum führt und den Wert als „geschätzt“ markiert | mittel, aber erst nach der Klärung durch die Länder |
| Länder | Klärung, ob und wofür VERA-Ergebnisse an ein Lernsystem weitergegeben werden dürfen; für Einzelergebnisse zwingend | offen |

## Was daraus folgt

- **Die Übergabe von Gruppenergebnissen ist machbar und datenschutzrechtlich
  der leichte Fall.** Sie verlangt auf TBA3-Seite wenig: Kennungen statt
  Kürzel und einen Export.
- **Die Kennungen sind wieder der Hebel.** Ohne sie scheitert die Suche in der
  Mediathek, und ohne sie kann auch ein Lernsystem mit den Ergebnissen nichts
  anfangen. `competences[].id` zu füllen, nützt allen drei Teilkonzepten zugleich.
- **Die eigentliche Arbeit liegt im Lernsystem.** Es muss Bildungsstandards auf
  die eigenen Lernziele abbilden. Das ist fachliche, nicht technische Arbeit, und
  sie entscheidet darüber, ob die Vorschläge taugen.
- **Einzelergebnisse erst nach einer rechtlichen Klärung.** Technisch ließe sich
  eine Verknüpfung so bauen, dass kein System die Kennungen des anderen erfährt.
  Ob sie gebaut werden darf, entscheiden die Länder.
- **Für eine Erprobung mit AIS müssen die Jahrgänge zusammenpassen.** Im Pilot
  (Klassen 5 und 6) gibt es keine frischen VERA-Ergebnisse. Denkbar wäre, die
  VERA-3-Ergebnisse als Ausgangslage nach dem Übergang auf die weiterführende
  Schule zu nutzen. Sie sind dann aber rund anderthalb Jahre alt und stammen
  meist von einer anderen Schule, der Grundschule.
