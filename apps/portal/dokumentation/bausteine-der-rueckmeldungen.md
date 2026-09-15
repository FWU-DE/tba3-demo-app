# Bausteine der Rückmeldungen

Zehn Rückmeldungen, vier Einrichtungen, fünf Technologien — und immer wieder
dieselben Darstellungen unter anderen Namen. Dieses Dokument zieht heraus, was
sich davon nachnutzen lässt: nicht der Code, sondern der **Zuschnitt**. Welche
Darstellung beantwortet welche fachliche Frage, und woher nimmt sie ihre Daten?

Die Grundlage ist der Sachbericht der Abschlusssitzung der Steuergruppe vom 15. September 2026,
in dem die vier entwickelnden Einrichtungen ihre Ergebnisse zusammengetragen
haben. Gebaut sind die Rückmeldungen in Vue 3 mit Quasar, Vue 3
mit Pinia, React 19 mit Material-UI, Angular 21 mit ECharts und Vanilla
JavaScript mit Tabulator und D3. Genau deshalb steht hier keine Technologie:
was fünf Umsetzungen gemeinsam haben, ist die Aussage, nicht das Framework.

> **Zugeordnet ist, was der Sachbericht nennt.** Eine Rückmeldung, die einen
> Baustein nicht in ihrer Liste hat, zeigt ihn womöglich trotzdem — sie hat ihn
> nur nicht berichtet. Zu raten wäre bequemer und wertlos: die Zuordnung soll
> belegen, nicht behaupten.

Dieses Dokument wird aus `apps/shared/konsortium.js` erzeugt
(`npm run konsortium:doc`). Dieselben Daten tragen die
[Rückmeldungsübersicht](/beispiele) und den Reiter „Rückmeldeelemente" der
[Demoanwendung](/demo/?tab=elemente).

## Die 10 Rückmeldungen

| Einrichtung | Rückmeldung | Zielgruppen | Fach | Klasse | Adressen |
|---|---|---|---|---|---|
| kompetenztest.de (FSU Jena) | Messwiederholung Deutsch, Klasse 3 | Lehrkraft, Schüler:in | Deutsch | Klasse 3 | [Demo](https://development.tba.i.c.netzkolchose.de/) · [Code](https://github.com/kompetenztestde/report-messwiederholung) |
| kompetenztest.de (FSU Jena) | Lernstand-Barometer Deutsch, Klasse 8 | Lehrkraft, Fachkonferenz, Schüler:in | Deutsch | Klasse 8 | [Demo](https://lernstand-barometer.ktest.de/login) · [Code](https://github.com/kompetenztestde/lernstand-barometer) |
| kompetenztest.de (FSU Jena) | Kompetenzstand Mathematik, Klasse 8 | Schüler:in | Mathematik | Klasse 8 | [Demo](https://kompetenztestde.github.io/kompetenzstand-mathematik) · [Code](https://github.com/kompetenztestde/kompetenzstand-mathematik) |
| indibit | Klassenrückmeldung | Lehrkraft | Deutsch | Klasse 8 | [Demo](https://apps.indibit.eu/tba3/class-teacher) · [Code](https://github.com/indibit-eu) · [Doku](https://apps.indibit.eu/tba3/docs/) |
| indibit | Schulrückmeldung | Schulleitung | fachunabhängig | alle | [Demo](https://apps.indibit.eu/tba3/school-manager) · [Code](https://github.com/indibit-eu) · [Doku](https://apps.indibit.eu/tba3/docs/) |
| indibit | Schulaufsichtsrückmeldung | Schulaufsicht | fachunabhängig | alle | [Demo](https://apps.indibit.eu/tba3/school-supervision) · [Code](https://github.com/indibit-eu) · [Doku](https://apps.indibit.eu/tba3/docs/) |
| ISQ Berlin | Rollenbasiertes Rückmeldeportal VERA 3 / VERA 8 | Lehrkraft, Schulleitung, Schulaufsicht, Schüler:in | Deutsch, Mathematik, Englisch, Französisch | Klasse 3, Klasse 8 | [Demo](https://tba3.isqberlin.de/) · [Code](https://git.imp.fu-berlin.de/isq/feedbacksysteme/tbaiii) |
| zepf (RPTU) | Mathematik, Klasse 3 | Lehrkraft | Mathematik | Klasse 3 | [Demo](https://zepf-rptu.github.io/TBA3/ma) · [Code](https://github.com/zepf-RPTU/TBA3) · [Doku](https://zepf-rptu.github.io/TBA3/docs/ma) |
| zepf (RPTU) | Englisch, Klasse 8 | Lehrkraft | Englisch | Klasse 8 | [Demo](https://zepf-rptu.github.io/TBA3/en) · [Code](https://github.com/zepf-RPTU/TBA3) · [Doku](https://zepf-rptu.github.io/TBA3/docs/en) |
| zepf (RPTU) | Schulleitung | Schulleitung | fachunabhängig | alle | [Demo](https://zepf-rptu.github.io/TBA3/sl) · [Code](https://github.com/zepf-RPTU/TBA3) · [Doku](https://zepf-rptu.github.io/TBA3/docs/sl) |

Was an diesen Verweisen vorläufig ist:

- **Messwiederholung Deutsch, Klasse 3** (kompetenztest.de (FSU Jena)): KT-internes Hosting in Bearbeitung. Entstanden in Zusammenarbeit mit TBA II.
- **Klassenrückmeldung** (indibit): Der Repositoriumsname folgt mit der Veröffentlichung. Lizenz: MIT.
- **Schulaufsichtsrückmeldung** (indibit): Das Land Hessen setzt für seine Rückmeldungen an die Schulaufsicht auf diesem Entwicklungsstand auf.
- **Rollenbasiertes Rückmeldeportal VERA 3 / VERA 8** (ISQ Berlin): Demo erreichbar bis 31.10.2027; Umzug des Repositoriums geplant. Gestaltungsentscheidungen, Architektur- und API-Dokumentation liegen im Repositorium. Fördersystem, Aufgabenempfehlungen und KI-Aufgaben sind als Beta gekennzeichnet.
- **Mathematik, Klasse 3** (zepf (RPTU)): Die Rückmeldungen befinden sich im Umzug von GitLab auf GitHub; die Verweise sind vorläufig.
- **Englisch, Klasse 8** (zepf (RPTU)): Die Rückmeldungen befinden sich im Umzug von GitLab auf GitHub; die Verweise sind vorläufig.
- **Schulleitung** (zepf (RPTU)): Die Rückmeldungen befinden sich im Umzug von GitLab auf GitHub; die Verweise sind vorläufig.

## Anzeigebausteine

Reine Darstellung, keine eigene Datenbeschaffung. Was hineingereicht wird, wird gezeichnet — austauschbar und ohne Wissen darüber, woher die Zahlen kommen.

### Verteilung über die Kompetenzstufen

Wie verteilt sich eine Gruppe über die Kompetenzstufen? Gestapelt, mit dem Mindeststandard als Marke und einer Farbskala, die die Ordnung der Stufen trägt statt sie zu verwischen.

*Daten:* Kompetenzstufen je Ebene · *Bibliothek:* `<tba3-kompetenzstufen-leiste>` · *Genannt von:* indibit, ISQ Berlin, zepf (RPTU)

### Lösungshäufigkeit je Aufgabe

Welche Aufgaben sind auffällig? Die Lösungshäufigkeit der Gruppe gegen den Referenzbereich, sortierbar — die Abweichung ist die Information, nicht der absolute Wert.

*Daten:* Aufgaben je Ebene · *Bibliothek:* `<tba3-aufgaben-tabelle>` · *Genannt von:* indibit, ISQ Berlin, zepf (RPTU)

### Erwartung gegen Ergebnis

Dieselbe Frage als Bild: tatsächliche gegen erwartete Lösungsquote je Aufgabe. Was weit unter der Diagonalen liegt, ist schwerer gefallen als anderswo.

*Daten:* Aufgaben je Ebene, mit Referenzwert · *Bibliothek:* `<tba3-erwartet-tatsaechlich>` · *Genannt von:* keinem Sachbericht — der Baustein kommt aus der Bibliothek

### Mittelwert mit Unsicherheit

Ein Wert je Bezugsgruppe auf einer gemeinsamen Skala, mit Unsicherheitsbereich. Kleine Kohorten sollen keine überdeutlichen Aussagen ergeben — der Bereich sagt, wie weit man dem Punkt trauen darf.

*Daten:* Aggregationen je Ebene · *Bibliothek:* `<tba3-mittelwert-vergleich>` · *Genannt von:* keinem Sachbericht — der Baustein kommt aus der Bibliothek

### Streubereich je Merkmal

Wo liegt der mittlere Bereich je Teilbereich — und wo darin steht eine einzelne Schüler:in? Zeigt Streuung statt nur Mittelwert.

*Daten:* Aggregationen je Teilbereich · *Bibliothek:* `<tba3-perzentilbaender>` · *Genannt von:* ISQ Berlin

### Verlauf über Messzeitpunkte

Mehrere Erhebungen als Linie, mit Band und Vergleichslinie. Der einzige Baustein, der eine Entwicklung zeigen kann statt eines Zustands.

*Daten:* Mehrere Erhebungen derselben Gruppe · *Bibliothek:* `<tba3-lernstands-verlauf>` · *Genannt von:* kompetenztest.de (FSU Jena), ISQ Berlin

### Profil-Heatmap

Aufgaben oder Merkmale gegen Personen oder Lerngruppen, gefärbt nach Abweichung. Das Muster ist die Aussage: eine Zeile, die durchgehend kühl ist, betrifft alle; eine kühle Spalte betrifft eine Person.

*Daten:* Aufgaben je Schüler:in · *Bibliothek:* `<tba3-aufgaben-heatmap>` · *Genannt von:* indibit

### Tabelle je Person

Lösungsanteile je Schüler:in und Teilbereich, sortierbar und auswählbar. Die Tabelle ist die ehrlichste Darstellung: sie verdichtet nichts und verschweigt nichts.

*Daten:* Aufgaben je Schüler:in · *Bibliothek:* `<tba3-schueler-tabelle>` · *Genannt von:* zepf (RPTU)

### Punktwolke

Schüler:innen als Punkte in zwei Dimensionen. Zeigt Gruppen und Ausreißer, die in Tabelle und Balken untergehen.

*Daten:* Aufgaben je Schüler:in · *Bibliothek:* `<tba3-streudiagramm>` · *Genannt von:* keinem Sachbericht — der Baustein kommt aus der Bibliothek

### Positionsskala mit Zonen

Jede Schüler:in als eigene Marke auf einer durchgehenden Punkteskala, die Kompetenzstufen als Zonen darunter. Macht sichtbar, wie nah jemand an der nächsten Stufe steht — die Stufe allein sagt das nicht.

*Daten:* Punktwerte je Schüler:in · *Bibliothek:* `<tba3-bista-verteilung>` · *Genannt von:* kompetenztest.de (FSU Jena)

### Kennzahl mit Vergleich

Eine Zahl, ein Bezugswert, ein kleiner Verlauf. Der Einstieg in jede Übersicht — und die Stelle, an der am leichtesten gelogen wird, wenn der Bezugswert fehlt.

*Daten:* Kompetenzstufen oder Aggregationen je Ebene · *Bibliothek:* `<tba3-kennzahl-kachel>` · *Genannt von:* keinem Sachbericht — der Baustein kommt aus der Bibliothek

### Übersichtskarten

Je Bereich eine Karte mit Ring, Kennzahl und aufklappbarem Detail. Die Zusammenfassung, die man aufklappen kann, statt der Zusammenfassung, der man glauben muss.

*Daten:* Kompetenzstufen je Domäne · *Bibliothek:* `<tba3-uebersichtskarten>` · *Genannt von:* keinem Sachbericht — der Baustein kommt aus der Bibliothek

### Gebietskarte

Schulen und Gebiete auf einer Karte, gekoppelt mit Tabelle und Suche. Für die Schulaufsicht ist die Lage im Bezirk selbst ein Merkmal — in einer Liste ist sie unsichtbar.

*Daten:* Schulen einer Ebene mit Ortsangabe · *Bibliothek:* noch keiner · *Genannt von:* ISQ Berlin

## Rückmeldeelemente

Fachlich sinnvolle Gruppierungen — das eigentliche Rückmeldeformat. Ein Element beantwortet eine Frage, die jemand im Kollegium tatsächlich stellt, und ist einzeln nachnutzbar.

### Vergleichsebenen

Dieselbe Größe auf mehreren Bezugsebenen nebeneinander: Klasse, Schule, fairer Vergleich mit strukturell ähnlichen Schulen, Bezirk, Land. Ohne Bezugsebene ist ein Ergebnis keine Aussage.

*Daten:* Dieselbe Ressource auf mehreren Ebenen · *Bibliothek:* `<tba3-kompetenzstufen-leiste>` · *Genannt von:* indibit, ISQ Berlin, zepf (RPTU)

### Stärken und Entwicklungsbedarfe

Merkmale nach dem Abstand zur Erwartung geordnet — oben abgelesen sind es Stärken, unten Entwicklungsbedarfe. Dieselbe Rechnung, zwei Enden, und keine Rangliste von Personen.

*Daten:* Aufgaben oder Merkmale gegen Referenzwert · *Bibliothek:* `<tba3-aufgaben-tabelle>` · *Genannt von:* ISQ Berlin

### Fördergruppen

Lernende nach Förderniveau gebündelt, von Hand nachjustierbar. Der Übergabepunkt nach außen: weitergegeben wird nicht ein Ergebniswert, sondern eine Gruppe mit klarem Bedarf.

*Daten:* Ergebnisse je Schüler:in plus eine Regel · *Bibliothek:* `<tba3-schueler-tabelle>` · *Genannt von:* indibit, ISQ Berlin

### Materialanbindung

Von einem Befund zu passendem Fördermaterial, ohne die Anwendung zu verlassen. Der Schritt, an dem sich entscheidet, ob eine Rückmeldung etwas verändert oder nur beschreibt.

*Daten:* Merkmal oder Fördergruppe als Suchanfrage · *Bibliothek:* noch keiner · *Genannt von:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin

### Aufgabenbrowser

Aufgaben suchen, ansehen, sammeln und zuweisen — die Aufgabe selbst statt nur ihrer Kennung. Erst damit lässt sich prüfen, ob eine auffällige Lösungshäufigkeit am Können oder an der Aufgabe lag.

*Daten:* Aufgabenkatalog mit Inhalt · *Bibliothek:* noch keiner · *Genannt von:* ISQ Berlin

### Einzelbericht

Die Rückmeldung einer einzelnen Person: Was konnte ich schon, wo liegt der nächste Schritt — ohne Rangliste und ohne Note. Dieselben Daten wie die Gruppensicht, eine andere Verantwortung.

*Daten:* Ergebnisse einer Schüler:in · *Bibliothek:* noch keiner · *Genannt von:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin

### Geführter Ablauf

Der Bericht als nummerierte Schrittfolge statt als Dashboard. Wer nicht täglich mit Testdaten umgeht, bekommt eine Reihenfolge — beim Kompetenzstand Mathematik sind es sieben Schritte.

*Daten:* Dieselben Daten, nur in fester Reihenfolge · *Bibliothek:* noch keiner · *Genannt von:* kompetenztest.de (FSU Jena)

### Automatische Hinweise

Aus Verteilung, Vergleich und Entwicklung erzeugte Sätze, abhängig von den gesetzten Filtern. Nimmt der Leserin das Ablesen ab — und die Möglichkeit, es anders abzulesen. Deshalb gehört dazu, dass der Satz seine Rechnung nennt.

*Daten:* Die gesetzten Filter und ihre Ergebnisse · *Bibliothek:* noch keiner · *Genannt von:* ISQ Berlin

### Auszeichnungen

Regelbasierte Hervorhebungen — „deutlich über dem Bezirksdurchschnitt", „übertrifft strukturell vergleichbare Schulen". Wirkt nur, solange die Regel offenliegt; sonst ist es eine Rangliste mit freundlichem Namen.

*Daten:* Vergleichswerte plus eine offengelegte Regel · *Bibliothek:* noch keiner · *Genannt von:* ISQ Berlin

## Rahmen

Was jede Rückmeldung braucht, unabhängig von Fach und Jahrgang: wer was sehen darf, wie ausgewählt wird, wie etwas festgehalten und wieder aufgerufen wird, und wie das Ganze verständlich und bedienbar bleibt.

### Rollensichten

Kaskadierende Sichten auf dieselbe Datenlage: Schulaufsicht sieht den Bezirk, Schulleitung die Schule, Lehrkraft die Klasse und einzelne Schüler:innen, Schüler:in die eigenen Ergebnisse. Eine Bibliothek, vier Kompositionen.

*Daten:* Ebene und Rechte der angemeldeten Person · *Bibliothek:* noch keiner · *Genannt von:* kompetenztest.de (FSU Jena), ISQ Berlin

### Filterleiste

Ebene, Fach, Jahrgang, Datentyp. Die Auswahl gehört in die Adresszeile, sonst lässt sich eine Ansicht nicht verschicken und der Zurück-Knopf tut das Falsche.

*Daten:* Das Vokabular der Schnittstelle · *Bibliothek:* noch keiner · *Genannt von:* indibit, ISQ Berlin

### Arbeitsstand

Gesetzte Filter, Notizen und Kommentare speichern und wieder aufrufen. Eine Rückmeldung wird selten in einer Sitzung gelesen; ohne Arbeitsstand beginnt jede Konferenz von vorn.

*Daten:* Profil der angemeldeten Person · *Bibliothek:* noch keiner · *Genannt von:* ISQ Berlin

### Bericht ausgeben

Eine Fassung, die das Gerät verlässt — an die gesetzten Filter gebunden und, wo sinnvoll, vor dem Export bearbeitbar. In der Konferenz liegt Papier auf dem Tisch, kein Dashboard.

*Daten:* Der aktuelle Stand der Ansicht · *Bibliothek:* noch keiner · *Genannt von:* kompetenztest.de (FSU Jena), ISQ Berlin

### Erklärtexte

Tooltips, Glossar, Einführungstouren je Rolle. Datenunabhängig gehalten — bei zepf in eigenen JSON-Dateien —, damit sich der Text ändern lässt, ohne die Auswertung anzufassen.

*Daten:* Keine — bewusst getrennt gehalten · *Bibliothek:* noch keiner · *Genannt von:* ISQ Berlin, zepf (RPTU)

### Zweisprachigkeit

Deutsch und Englisch in derselben Anwendung. Die Wahl gehört der Leserin und gilt über alle Ansichten hinweg; Beispieldaten bleiben unübersetzt, weil sie im Betrieb aus der Schnittstelle kommen.

*Daten:* Keine — Beschriftungen, nicht Ergebnisse · *Bibliothek:* noch keiner · *Genannt von:* ISQ Berlin

### Barrierefreiheit

Kontrast, Tastaturbedienung, Bedeutung nicht allein über Farbe. Prüfbar gemacht statt angestrebt: indibit fährt WCAG 2.1 AA als festen Prozessschritt (95/100), das ISQ nennt sie ausdrücklich als angestrebt und nicht verbindlich geprüft.

*Daten:* Keine — eine Eigenschaft jeder Darstellung · *Bibliothek:* noch keiner · *Genannt von:* ISQ Berlin

## Bilanz

Der Katalog führt **29 Bausteine** in drei Schichten. Drei Zahlen
daraus sind es wert, festgehalten zu werden.

**Was mindestens drei der vier Einrichtungen unabhängig voneinander gebaut haben:**
Verteilung über die Kompetenzstufen, Lösungshäufigkeit je Aufgabe, Vergleichsebenen, Materialanbindung, Einzelbericht. Das ist der belastbare Kern einer
Rückmeldung — wer eine neue baut, fängt hier an.

**Was noch kein Baustein in `@tba3/bausteine` ist** (14 Einträge):
Gebietskarte, Materialanbindung, Aufgabenbrowser, Einzelbericht, Geführter Ablauf, Automatische Hinweise, Auszeichnungen, Rollensichten, Filterleiste, Arbeitsstand, Bericht ausgeben, Erklärtexte, Zweisprachigkeit, Barrierefreiheit. Ein Teil davon ist keine
Visualisierung, sondern ein Rahmen und gehört auch nicht in eine
Visualisierungsbibliothek. Der Rest ist eine Liste offener Arbeit.

**Was die Bibliothek führt, ohne dass ein Sachbericht es nennt**
(5 Einträge): Erwartung gegen Ergebnis, Mittelwert mit Unsicherheit, Punktwolke, Kennzahl mit Vergleich, Übersichtskarten.
Das ist kein Vorwurf an die Berichte — sie beschreiben, was die Gruppen
gefordert haben, nicht alles, was auf dem Schirm steht. Aber es ist der Teil des
Katalogs, für den der Beleg fehlt, und das soll man sehen können.
