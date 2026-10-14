# Bausteine der Rückmeldungen

Elf Rückmeldungen, vier Einrichtungen, fünf Technologien — und immer wieder
dieselben Darstellungen unter anderen Namen. Dieses Dokument zieht heraus, was
sich davon nachnutzen lässt: nicht der Code, sondern der **Zuschnitt**. Welche
Darstellung beantwortet welche fachliche Frage, und woher nimmt sie ihre Daten?

Die Grundlage ist der Sachbericht der Abschlusssitzung der Steuergruppe vom 15. September 2026,
in dem die vier entwickelnden Einrichtungen ihre Ergebnisse zusammengetragen
haben. Gebaut sind die Rückmeldungen in Vue 3 mit Quasar, Vue 3
mit Pinia, React 19 mit Material-UI, Angular 21 mit ECharts und Vanilla
JavaScript mit Tabulator und D3. Genau deshalb steht hier keine Technologie:
was fünf Umsetzungen gemeinsam haben, ist die Aussage, nicht das Framework.

> **Jede Zuordnung nennt ihren Beleg.** „Genannt von" heißt: die Einrichtung hat
> den Baustein selbst beschrieben. „Gefunden bei" heißt: er wurde in der
> laufenden Demo oder im offenen Quelltext gefunden — die Sachberichte sind
> Zusammenfassungen und nennen längst nicht alles, was gebaut wurde. Was weder
> das eine noch das andere hat, steht hier nicht.

Die Erhebung am Artefakt lief am 15.09.2026: alle zehn Demos im Browser
geöffnet, dazu die vier offenen Repositorien flach geklont und ihre
Komponentenverzeichnisse gelesen. Das Repositorium von indibit war noch nicht
veröffentlicht; dort ist die Quelle die laufende Anwendung, deren
Angular-Komponenten im DOM stehen.

Dieses Dokument wird aus `apps/shared/konsortium.js` erzeugt
(`npm run konsortium:doc`). Dieselben Daten tragen die
[Rückmeldungsübersicht](/beispiele) und den Reiter „Rückmeldeelemente" der
[Demoanwendung](/demo/?tab=elemente).

## Die 11 Rückmeldungen

| Einrichtung | Rückmeldung | Zielgruppen | Fach | Klasse | Adressen |
|---|---|---|---|---|---|
| kompetenztest.de (FSU Jena) | Messwiederholung Deutsch, Klasse 3 | Lehrkraft, Schüler:in | Deutsch | Klasse 3 | [Demo](https://development.tba.i.c.netzkolchose.de/) · [Code](https://github.com/kompetenztestde/report-messwiederholung) |
| kompetenztest.de (FSU Jena) | Lernstand-Barometer Deutsch, Klasse 8 | Lehrkraft, Fachkonferenz, Schüler:in | Deutsch | Klasse 8 | [Demo](https://lernstand-barometer.ktest.de/login) · [Code](https://github.com/kompetenztestde/lernstand-barometer) |
| kompetenztest.de (FSU Jena) | Kompetenzstand Mathematik: Schülerbericht, Klasse 8 | Schüler:in | Mathematik | Klasse 8 | [Demo](https://kompetenztestde.github.io/kompetenzstand-mathematik) · [Code](https://github.com/kompetenztestde/kompetenzstand-mathematik) |
| kompetenztest.de (FSU Jena) | Kompetenzstand Mathematik: Klassenbericht, Klasse 8 | Lehrkraft | Mathematik | Klasse 8 | [Demo](https://kompetenztestde.github.io/kompetenzstand-mathematik-klassenbericht/) · [Code](https://github.com/kompetenztestde/kompetenzstand-mathematik-klassenbericht) |
| indibit | Klassenrückmeldung | Lehrkraft | Deutsch | Klasse 8 | [Demo](https://apps.indibit.eu/tba3/class-teacher) · [Code](https://github.com/indibit-eu/tba3-elements) · [Doku](https://apps.indibit.eu/tba3/docs/) |
| indibit | Schulrückmeldung | Schulleitung | fachunabhängig | alle | [Demo](https://apps.indibit.eu/tba3/school-manager) · [Code](https://github.com/indibit-eu/tba3-elements) · [Doku](https://apps.indibit.eu/tba3/docs/) |
| indibit | Schulaufsichtsrückmeldung | Schulaufsicht | fachunabhängig | alle | [Demo](https://apps.indibit.eu/tba3/school-supervision) · [Code](https://github.com/indibit-eu/tba3-elements) · [Doku](https://apps.indibit.eu/tba3/docs/) |
| ISQ Berlin | Rollenbasiertes Rückmeldeportal VERA 3 / VERA 8 | Lehrkraft, Schulleitung, Schulaufsicht, Schüler:in | Deutsch, Mathematik, Englisch, Französisch | Klasse 3, Klasse 8 | [Demo](https://tba3.isqberlin.de/) · [Code](https://git.imp.fu-berlin.de/isq/feedbacksysteme/tbaiii) |
| zepf (RPTU) | Mathematik, Klasse 3 | Lehrkraft | Mathematik | Klasse 3 | [Demo](https://zepf-rptu.github.io/TBA3/ma) · [Code](https://github.com/zepf-RPTU/TBA3) · [Doku](https://zepf-rptu.github.io/TBA3/docs/) |
| zepf (RPTU) | Englisch, Klasse 8 | Lehrkraft | Englisch | Klasse 8 | [Demo](https://zepf-rptu.github.io/TBA3/en) · [Code](https://github.com/zepf-RPTU/TBA3) · [Doku](https://zepf-rptu.github.io/TBA3/docs/) |
| zepf (RPTU) | Schulleitung | Schulleitung | fachunabhängig | alle | [Demo](https://zepf-rptu.github.io/TBA3/sl) · [Code](https://github.com/zepf-RPTU/TBA3) · [Doku](https://zepf-rptu.github.io/TBA3/docs/) |

Was an diesen Verweisen vorläufig ist:

- **Messwiederholung Deutsch, Klasse 3** (kompetenztest.de (FSU Jena)): KT-internes Hosting in Bearbeitung. Entstanden in Zusammenarbeit mit TBA II.
- **Kompetenzstand Mathematik: Klassenbericht, Klasse 8** (kompetenztest.de (FSU Jena)): Nach dem Sachbericht veröffentlicht (08.10.2026) und mit der Erhebung vom 14.10.2026 aufgenommen. In der Demo „Demo-Zugang: Ja“ wählen und anmelden.
- **Klassenrückmeldung** (indibit): Die Komponentenbibliothek ist als tba3-elements veröffentlicht. Lizenz: MIT.
- **Schulaufsichtsrückmeldung** (indibit): Das Land Hessen setzt für seine Rückmeldungen an die Schulaufsicht auf diesem Entwicklungsstand auf.
- **Rollenbasiertes Rückmeldeportal VERA 3 / VERA 8** (ISQ Berlin): Demo erreichbar bis 31.10.2027; Umzug des Repositoriums geplant, die bisherige Adresse verlangt eine Anmeldung (Stand 14.10.2026). Gestaltungsentscheidungen, Architektur- und API-Dokumentation liegen im Repositorium. Fördersystem, Aufgabenempfehlungen und KI-Aufgaben sind als Beta gekennzeichnet.

## Anzeigebausteine

Reine Darstellung, keine eigene Datenbeschaffung. Was hineingereicht wird, wird gezeichnet — austauschbar und ohne Wissen darüber, woher die Zahlen kommen.

### Verteilung über die Kompetenzstufen

Wie verteilt sich eine Gruppe über die Kompetenzstufen? Gestapelt, mit dem Mindeststandard als Marke und einer Farbskala, die die Ordnung der Stufen trägt statt sie zu verwischen.

*Daten:* Kompetenzstufen je Ebene · *Bibliothek:* `<tba3-kompetenzstufen-leiste>` · *Genannt von:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin, zepf (RPTU)

![Säulendiagramm je Domäne: Anzahl der Schüler:innen auf den Kompetenzstufen Ia bis V, Mindeststandard unter Stufe II markiert, daneben Kennzahlen zu Optimal- und Mindeststandard.](/beispiele/bilder/originale/kompetenzstufen-verteilung.jpg "Original: indibit, Klassenrückmeldung")

![Nachbau als <tba3-kompetenzstufen-leiste>](/dokumentation/bilder/baustein-kompetenzstufen-leiste-de.png "Nachbau: <tba3-kompetenzstufen-leiste>, mit Beispieldaten")

### Lösungshäufigkeit je Aufgabe

Welche Aufgaben sind auffällig? Die Lösungshäufigkeit der Gruppe gegen den Referenzbereich, sortierbar — die Abweichung ist die Information, nicht der absolute Wert.

*Daten:* Aufgaben je Ebene · *Bibliothek:* `<tba3-aufgaben-tabelle>` · *Genannt von:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin, zepf (RPTU)

![Waagerechte Balken je Aufgabe mit der Lösungsquote der Klasse, grün über und rot unter dem Landesmittelwert, der als senkrechter Strich mit Beschriftung „Ø L“ markiert ist.](/beispiele/bilder/originale/loesungshaeufigkeit-je-aufgabe.jpg "Original: indibit, Klassenrückmeldung")

![Nachbau als <tba3-aufgaben-tabelle>](/dokumentation/bilder/baustein-aufgaben-tabelle-de.png "Nachbau: <tba3-aufgaben-tabelle>, mit Beispieldaten")

### Erwartung gegen Ergebnis

Dieselbe Frage als Bild: tatsächliche gegen erwartete Lösungsquote je Aufgabe. Was weit unter der Diagonalen liegt, ist schwerer gefallen als anderswo.

*Daten:* Aufgaben je Ebene, mit Referenzwert · *Bibliothek:* `<tba3-erwartet-tatsaechlich>` · *Genannt von:* keinem Sachbericht — der Baustein kommt aus der Bibliothek

![Aufgabenliste des Fachberichts: je Aufgabe Klassenmittelwert neben dem fairen Vergleichswert als zwei Balken](/beispiele/bilder/originale/erwartung-gegen-ergebnis.jpg "Original: kompetenztest.de (FSU Jena), Lernstand-Barometer Deutsch, Klasse 8")

![Nachbau als <tba3-erwartet-tatsaechlich>](/dokumentation/bilder/baustein-erwartet-tatsaechlich-de.png "Nachbau: <tba3-erwartet-tatsaechlich>, mit Beispieldaten")

### Mittelwert mit Unsicherheit

Ein Wert je Bezugsgruppe auf einer gemeinsamen Skala, mit Unsicherheitsbereich. Kleine Kohorten sollen keine überdeutlichen Aussagen ergeben — der Bereich sagt, wie weit man dem Punkt trauen darf.

*Daten:* Aggregationen je Ebene · *Bibliothek:* `<tba3-mittelwert-vergleich>` · *Genannt von:* keinem Sachbericht — der Baustein kommt aus der Bibliothek

![Nachbau als <tba3-mittelwert-vergleich>](/dokumentation/bilder/baustein-mittelwert-vergleich-de.png "Nachbau: <tba3-mittelwert-vergleich>, mit Beispieldaten")

### Streubereich je Merkmal

Wo liegt der mittlere Bereich je Teilbereich — und wo darin steht eine einzelne Schüler:in? Zeigt Streuung statt nur Mittelwert.

*Daten:* Aggregationen je Teilbereich · *Bibliothek:* `<tba3-perzentilbaender>` · *Genannt von:* kompetenztest.de (FSU Jena), ISQ Berlin

![„Homogenität der Klasse“: eine Markierung „Klasse“ auf einer Skala von eher homogener bis eher heterogener Klasse](/beispiele/bilder/originale/streubereich-je-merkmal.jpg "Original: kompetenztest.de (FSU Jena), Kompetenzstand Mathematik: Klassenbericht, Klasse 8")

![Nachbau als <tba3-perzentilbaender>](/dokumentation/bilder/baustein-perzentilbaender-de.png "Nachbau: <tba3-perzentilbaender>, mit Beispieldaten")

### Verlauf über Messzeitpunkte

Mehrere Erhebungen als Linie, mit Band und Vergleichslinie. Der einzige Baustein, der eine Entwicklung zeigen kann statt eines Zustands.

*Daten:* Mehrere Erhebungen derselben Gruppe · *Bibliothek:* `<tba3-lernstands-verlauf>` · *Genannt von:* kompetenztest.de (FSU Jena), ISQ Berlin, zepf (RPTU)

![Lernverlauf einer Schülerin über drei Messzeitpunkte als Linie durch die Vogelschar, die übrigen Schüler:innen blass im Hintergrund](/beispiele/bilder/originale/verlauf-ueber-messzeitpunkte.jpg "Original: kompetenztest.de (FSU Jena), Messwiederholung Deutsch, Klasse 3")

![Nachbau als <tba3-lernstands-verlauf>](/dokumentation/bilder/baustein-lernstands-verlauf-de.png "Nachbau: <tba3-lernstands-verlauf>, mit Beispieldaten")

### Profil-Heatmap

Aufgaben oder Merkmale gegen Personen oder Lerngruppen, gefärbt nach Abweichung. Das Muster ist die Aussage: eine Zeile, die durchgehend kühl ist, betrifft alle; eine kühle Spalte betrifft eine Person.

*Daten:* Aufgaben je Schüler:in · *Bibliothek:* `<tba3-aufgaben-heatmap>` · *Genannt von:* kompetenztest.de (FSU Jena), indibit

![„Ergebnisse im Detail“: Matrix Schüler:innen × Aufgaben, gelöste Aufgaben grün, nach Lösungshäufigkeit gruppiert, mit Halbjahresnote und Merkmalsspalten](/beispiele/bilder/originale/profil-heatmap.jpg "Original: kompetenztest.de (FSU Jena), Kompetenzstand Mathematik: Klassenbericht, Klasse 8")

![Nachbau als <tba3-aufgaben-heatmap>](/dokumentation/bilder/baustein-aufgaben-heatmap-de.png "Nachbau: <tba3-aufgaben-heatmap>, mit Beispieldaten")

### Tabelle je Person

Lösungsanteile je Schüler:in und Teilbereich, sortierbar und auswählbar. Die Tabelle ist die ehrlichste Darstellung: sie verdichtet nichts und verschweigt nichts.

*Daten:* Aufgaben je Schüler:in · *Bibliothek:* `<tba3-schueler-tabelle>` · *Genannt von:* kompetenztest.de (FSU Jena), indibit, zepf (RPTU)

![Klassentabelle der Mathematik-Rückmeldung mit einer Zeile je Schüler:in: Richtig-Anzahl, Verteilungsbalken und Kompetenzstufe](/beispiele/bilder/originale/personen-tabelle.jpg "Original: zepf (RPTU), Mathematik, Klasse 3")

![Nachbau als <tba3-schueler-tabelle>](/dokumentation/bilder/baustein-schueler-tabelle-de.png "Nachbau: <tba3-schueler-tabelle>, mit Beispieldaten")

### Punktwolke

Schüler:innen als Punkte in zwei Dimensionen. Zeigt Gruppen und Ausreißer, die in Tabelle und Balken untergehen.

*Daten:* Aufgaben je Schüler:in · *Bibliothek:* `<tba3-streudiagramm>` · *Genannt von:* zepf (RPTU)

![Punktwolke: Lösungsquote Hörverstehen gegen Leseverstehen je Schüler:in, mit GER-Schwellen und Markern für Klasse, Schule und Land](/beispiele/bilder/originale/punktwolke.jpg "Original: zepf (RPTU), Englisch, Klasse 8")

![Nachbau als <tba3-streudiagramm>](/dokumentation/bilder/baustein-streudiagramm-de.png "Nachbau: <tba3-streudiagramm>, mit Beispieldaten")

### Positionsskala mit Zonen

Jede Schüler:in als eigene Marke auf einer durchgehenden Punkteskala, die Kompetenzstufen als Zonen darunter. Macht sichtbar, wie nah jemand an der nächsten Stufe steht — die Stufe allein sagt das nicht.

*Daten:* Punktwerte je Schüler:in · *Bibliothek:* `<tba3-bista-verteilung>` · *Genannt von:* kompetenztest.de (FSU Jena)

![Messwiederholung Lesen: Vögel als Schüler:innen auf der Lesegeschwindigkeits-Skala zum Messzeitpunkt März 2026, rechts die Zonen Silben/Möwe, Wort/Fink, Text/Adler](/beispiele/bilder/originale/positionsskala-mit-zonen.jpg "Original: kompetenztest.de (FSU Jena), Messwiederholung Deutsch, Klasse 3")

![Nachbau als <tba3-bista-verteilung>](/dokumentation/bilder/baustein-bista-verteilung-de.png "Nachbau: <tba3-bista-verteilung>, mit Beispieldaten")

### Kennzahl mit Vergleich

Eine Zahl, ein Bezugswert, ein kleiner Verlauf. Der Einstieg in jede Übersicht — und die Stelle, an der am leichtesten gelogen wird, wenn der Bezugswert fehlt.

*Daten:* Kompetenzstufen oder Aggregationen je Ebene · *Bibliothek:* `<tba3-kennzahl-kachel>` · *Genannt von:* kompetenztest.de (FSU Jena), indibit

![Gesamtergebnis der Klasse 50 % als Balken über dem korrigierten Landesmittelwert 42 %](/beispiele/bilder/originale/kennzahl-mit-vergleich.jpg "Original: kompetenztest.de (FSU Jena), Kompetenzstand Mathematik: Klassenbericht, Klasse 8")

![Nachbau als <tba3-kennzahl-kachel>](/dokumentation/bilder/baustein-kennzahl-kachel-de.png "Nachbau: <tba3-kennzahl-kachel>, mit Beispieldaten")

### Übersichtskarten

Je Bereich eine Karte mit Ring, Kennzahl und aufklappbarem Detail. Die Zusammenfassung, die man aufklappen kann, statt der Zusammenfassung, der man glauben muss.

*Daten:* Kompetenzstufen je Domäne · *Bibliothek:* `<tba3-uebersichtskarten>` · *Genannt von:* kompetenztest.de (FSU Jena), indibit

![Übersicht der Schule: Zahl der Teilnehmenden, Ring zum sozioökonomischen Status, Anteil mit erreichtem Mindeststandard je Fach sowie Ringe zu Teilnahmequote, Geschlecht und Sprache zuhause.](/beispiele/bilder/originale/uebersichtskarten.jpg "Original: indibit, Schulrückmeldung")

![Nachbau als <tba3-uebersichtskarten>](/dokumentation/bilder/baustein-uebersichtskarten-de.png "Nachbau: <tba3-uebersichtskarten>, mit Beispieldaten")

### Gebietskarte

Schulen und Gebiete auf einer Karte, gekoppelt mit Tabelle und Suche. Für die Schulaufsicht ist die Lage im Bezirk selbst ein Merkmal — in einer Liste ist sie unsichtbar.

*Daten:* Schulen einer Ebene mit Ortsangabe · *Bibliothek:* noch keiner · *Genannt von:* ISQ Berlin

### Lösungsquote nach Merkmal

Wie hängt das Ergebnis mit einem Hintergrundmerkmal zusammen? Die Lösungsquote je Ausprägung (Sozialindex, Geschlecht, Herkunftssprache) neben den Vergleichsgruppen, mit Spannweite. Zeigt Ungleichheit als Verlauf statt als Einzelwert.

*Daten:* Aggregationen nach Kovariaten · *Bibliothek:* `<tba3-merkmal-gradient>` · *Gefunden bei:* indibit

![Gruppiertes Säulendiagramm: Lösungsquote nach Sozialstatus A bis E für die eigene Schule, die Vergleichsschule und den Landesmittelwert, mit Spannweite und erläuterndem Satz.](/beispiele/bilder/originale/sozialer-gradient.jpg "Original: indibit, Schulrückmeldung")

![Nachbau als <tba3-merkmal-gradient>](/dokumentation/bilder/baustein-merkmal-gradient-de.png "Nachbau: <tba3-merkmal-gradient>, mit Beispieldaten")

### Abweichung je Lerngruppe

Wie weit liegt jede Klasse über oder unter dem Wert der Schule? Ein Balken je Klasse um eine Nulllinie. Für die Schulleitung die schnellste Antwort auf die Frage, wo es sich zu reden lohnt.

*Daten:* Kompetenzstufen oder Lösungsquoten je Lerngruppe und Schule · *Bibliothek:* `<tba3-abweichung-je-gruppe>` · *Gefunden bei:* zepf (RPTU)

![Abweichung der Klassen vom Schulwert in Prozentpunkten, ein Balken je Klasse um eine Nulllinie, für Deutsch Rechtschreibung](/beispiele/bilder/originale/abweichung-je-lerngruppe.jpg "Original: zepf (RPTU), Schulleitung")

![Nachbau als <tba3-abweichung-je-gruppe>](/dokumentation/bilder/baustein-abweichung-je-gruppe-de.png "Nachbau: <tba3-abweichung-je-gruppe>, mit Beispieldaten")

### Zwei Gruppen gespiegelt

Zwei Gruppen links und rechts einer Mittelachse, nach Kompetenzstufen oder Punkten — wie eine Bevölkerungspyramide. Macht Unterschiede in der Form der Verteilung sichtbar, nicht nur im Mittelwert.

*Daten:* Kompetenzstufen zweier Lerngruppen · *Bibliothek:* `<tba3-gruppen-pyramide>` · *Gefunden bei:* zepf (RPTU)

![Gespiegelte Kompetenzstufenverteilung: Mädchen links, Jungen rechts der Mittelachse, wie eine Bevölkerungspyramide](/beispiele/bilder/originale/gruppen-gegenueberstellung.jpg "Original: zepf (RPTU), Schulleitung")

![Nachbau als <tba3-gruppen-pyramide>](/dokumentation/bilder/baustein-gruppen-pyramide-de.png "Nachbau: <tba3-gruppen-pyramide>, mit Beispieldaten")

### Netzdiagramm der Teilkompetenzen

Mehrere Teilkompetenzen auf je einer Achse, eine Person gegen Klasse und Vergleichsgruppen. Das Profil ist die Aussage — ob es rund ist oder an einer Stelle einknickt.

*Daten:* Ergebnisse je Teilkompetenz und Person · *Bibliothek:* `<tba3-netzdiagramm>` · *Gefunden bei:* zepf (RPTU)

![Netzdiagramm mit sechs Achsen (Hören und Lesen je global, detailliert, selektiv): eine Schülerin gegen Klasse, Schule und Land](/beispiele/bilder/originale/netzdiagramm.jpg "Original: zepf (RPTU), Englisch, Klasse 8")

![Nachbau als <tba3-netzdiagramm>](/dokumentation/bilder/baustein-netzdiagramm-de.png "Nachbau: <tba3-netzdiagramm>, mit Beispieldaten")

### Kontextmerkmal als Ring

Ein kategoriales Merkmal der Gruppe — sozioökonomischer Status, Teilnahmequote, Geschlecht, Sprache zuhause — als Ring mit Legende, die Mitte trägt die Gesamtzahl oder die mittlere Kategorie. Ergebnisse ohne Zusammensetzung der Gruppe sind nicht einzuordnen; deshalb steht dieser Ring in der Schulrückmeldung viermal nebeneinander.

*Daten:* Kovariaten je Schüler:in · *Bibliothek:* `<tba3-kontextmerkmal-ring>` · *Gefunden bei:* indibit, zepf (RPTU)

![Drei Ringdiagramme nebeneinander: Teilnahmequote 80 %, Geschlecht und Sprache zuhause mit Gesamtzahl 214 in der Mitte und Legende darunter.](/beispiele/bilder/originale/kontextmerkmal-ring.jpg "Original: indibit, Schulrückmeldung")

![Nachbau als <tba3-kontextmerkmal-ring>](/dokumentation/bilder/baustein-kontextmerkmal-ring-de.png "Nachbau: <tba3-kontextmerkmal-ring>, mit Beispieldaten")

### Lernverlauf als Figuren

Jede Schüler:in als eigene Figur auf einer Fläche aus Messzeitpunkt und Fähigkeit, die Kompetenzstufen als benannte Zonen statt als Zahlen. In der Messwiederholung sind es Vögel, deren Art die Stufe trägt — eine Darstellung, die eine Drittklässlerin über sich selbst lesen kann.

*Daten:* Mehrere Erhebungen je Schüler:in · *Bibliothek:* `<tba3-lernverlauf-figuren>` · *Gefunden bei:* kompetenztest.de (FSU Jena)

![Lehrkraftansicht der Messwiederholung: alle Schüler:innen als Vögel über drei Messzeitpunkte (März 2025, Herbst 2025, März 2026), Kompetenzstufen als Zonen Silben/Möwe, Wort/Fink, Text/Adler](/beispiele/bilder/originale/lernverlauf-figuren.jpg "Original: kompetenztest.de (FSU Jena), Messwiederholung Deutsch, Klasse 3")

![Nachbau als <tba3-lernverlauf-figuren>](/dokumentation/bilder/baustein-lernverlauf-figuren-de.png "Nachbau: <tba3-lernverlauf-figuren>, mit Beispieldaten")

## Rückmeldeelemente

Fachlich sinnvolle Gruppierungen — das eigentliche Rückmeldeformat. Ein Element beantwortet eine Frage, die jemand im Kollegium tatsächlich stellt, und ist einzeln nachnutzbar.

### Vergleichsebenen

Dieselbe Größe auf mehreren Bezugsebenen nebeneinander: Klasse, Schule, fairer Vergleich mit strukturell ähnlichen Schulen, Bezirk, Land. Ohne Bezugsebene ist ein Ergebnis keine Aussage.

*Daten:* Dieselbe Ressource auf mehreren Ebenen · *Bibliothek:* `<tba3-kompetenzstufen-leiste>` · *Genannt von:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin, zepf (RPTU)

![„Ergebnisse der Klasse in Teilbereichen“: Säulen Klassendurchschnitt gegen korrigierten Landesmittelwert für Gesamt, Leitideen, prozessbezogene Kompetenzen, Anforderungsbereiche und Kompetenzstufen, Schalter für Schuldurchschnitt](/beispiele/bilder/originale/vergleichsebenen.jpg "Original: kompetenztest.de (FSU Jena), Kompetenzstand Mathematik: Klassenbericht, Klasse 8")

![Nachbau als <tba3-kompetenzstufen-leiste>](/dokumentation/bilder/baustein-kompetenzstufen-leiste-de.png "Nachbau: <tba3-kompetenzstufen-leiste>, mit Beispieldaten")

### Stärken und Entwicklungsbedarfe

Merkmale nach dem Abstand zur Erwartung geordnet — oben abgelesen sind es Stärken, unten Entwicklungsbedarfe. Dieselbe Rechnung, zwei Enden, und keine Rangliste von Personen.

*Daten:* Aufgaben oder Merkmale gegen Referenzwert · *Bibliothek:* `<tba3-aufgaben-tabelle>` · *Genannt von:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin

![„Top Aufgaben“: drei Aufgaben, die die Klasse im Vergleich zum Landesmittelwert besonders gut gelöst hat, als Podest mit Klassen- und Landeswert](/beispiele/bilder/originale/staerken-und-entwicklungsbedarfe.jpg "Original: kompetenztest.de (FSU Jena), Kompetenzstand Mathematik: Klassenbericht, Klasse 8")

![Nachbau als <tba3-aufgaben-tabelle>](/dokumentation/bilder/baustein-aufgaben-tabelle-de.png "Nachbau: <tba3-aufgaben-tabelle>, mit Beispieldaten")

### Fördergruppen

Lernende nach Förderniveau gebündelt, von Hand nachjustierbar. Der Übergabepunkt nach außen: weitergegeben wird nicht ein Ergebniswert, sondern eine Gruppe mit klarem Bedarf.

*Daten:* Ergebnisse je Schüler:in plus eine Regel · *Bibliothek:* `<tba3-schueler-tabelle>` · *Genannt von:* indibit, ISQ Berlin

![Vier Förderbuckets zu einer Teilkompetenz: Intensivförderung, Förderung, Sicherung und Forderung, je mit Spanne der Lösungsquote und den zugeordneten Schüler:innen.](/beispiele/bilder/originale/foerdergruppen.jpg "Original: indibit, Klassenrückmeldung")

![Nachbau als <tba3-schueler-tabelle>](/dokumentation/bilder/baustein-schueler-tabelle-de.png "Nachbau: <tba3-schueler-tabelle>, mit Beispieldaten")

### Materialanbindung

Von einem Befund zu passendem Fördermaterial, ohne die Anwendung zu verlassen. Der Schritt, an dem sich entscheidet, ob eine Rückmeldung etwas verändert oder nur beschreibt.

*Daten:* Merkmal oder Fördergruppe als Suchanfrage · *Bibliothek:* noch keiner · *Genannt von:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin, zepf (RPTU)

![Messzeitpunkt März 2026 mit geöffnetem Fördermaterial „Flugtraining“ für die Gruppe Text/Adler: Lesetandem, Lesepass, Textabschnitte sortieren, Lesepilot, Lesetheater und weitere](/beispiele/bilder/originale/materialanbindung.jpg "Original: kompetenztest.de (FSU Jena), Messwiederholung Deutsch, Klasse 3")

### Aufgabenbrowser

Aufgaben suchen, ansehen, sammeln und zuweisen — die Aufgabe selbst statt nur ihrer Kennung. Erst damit lässt sich prüfen, ob eine auffällige Lösungshäufigkeit am Können oder an der Aufgabe lag.

*Daten:* Aufgabenkatalog mit Inhalt · *Bibliothek:* noch keiner · *Genannt von:* kompetenztest.de (FSU Jena), ISQ Berlin

![Seite „Fördermaterialien“: Hinweis auf den Aufgabenbrowser mit Vorschaubild und Knopf „Zum Aufgabenbrowser“](/beispiele/bilder/originale/aufgabenbrowser.jpg "Original: kompetenztest.de (FSU Jena), Lernstand-Barometer Deutsch, Klasse 8")

### Einzelbericht

Die Rückmeldung einer einzelnen Person: Was konnte ich schon, wo liegt der nächste Schritt — ohne Rangliste und ohne Note. Dieselben Daten wie die Gruppensicht, eine andere Verantwortung.

*Daten:* Ergebnisse einer Schüler:in · *Bibliothek:* noch keiner · *Genannt von:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin

![Schülerbericht, Schritt „Das ist uns aufgefallen“: Balken richtig gelöst 60 % gegen falsch gelöst 40 % und eine persönliche Einordnung](/beispiele/bilder/originale/einzelbericht.jpg "Original: kompetenztest.de (FSU Jena), Kompetenzstand Mathematik: Schülerbericht, Klasse 8")

### Geführter Ablauf

Der Bericht als nummerierte Schrittfolge statt als Dashboard. Wer nicht täglich mit Testdaten umgeht, bekommt eine Reihenfolge — beim Kompetenzstand Mathematik sind es sieben Schritte.

*Daten:* Dieselben Daten, nur in fester Reihenfolge · *Bibliothek:* noch keiner · *Genannt von:* kompetenztest.de (FSU Jena)

![Fußleiste des Klassenberichts mit Zurück- und Weiter-Knopf und sieben Punkten für die Schritte, der zweite aktiv](/beispiele/bilder/originale/gefuehrter-ablauf.jpg "Original: kompetenztest.de (FSU Jena), Kompetenzstand Mathematik: Klassenbericht, Klasse 8")

### Automatische Hinweise

Aus Verteilung, Vergleich und Entwicklung erzeugte Sätze, abhängig von den gesetzten Filtern. Nimmt der Leserin das Ablesen ab — und die Möglichkeit, es anders abzulesen. Deshalb gehört dazu, dass der Satz seine Rechnung nennt.

*Daten:* Die gesetzten Filter und ihre Ergebnisse · *Bibliothek:* noch keiner · *Genannt von:* indibit, ISQ Berlin, zepf (RPTU)

![Empfohlene Handlungsfelder: automatisch priorisierte Hinweiskarten mit Dringlichkeit, Begründung aus den Daten und Handlungsimpulsen.](/beispiele/bilder/originale/automatische-hinweise.jpg "Original: indibit, Schulrückmeldung")

### Auszeichnungen

Regelbasierte Hervorhebungen — „deutlich über dem Bezirksdurchschnitt", „übertrifft strukturell vergleichbare Schulen". Wirkt nur, solange die Regel offenliegt; sonst ist es eine Rangliste mit freundlichem Namen.

*Daten:* Vergleichswerte plus eine offengelegte Regel · *Bibliothek:* noch keiner · *Genannt von:* kompetenztest.de (FSU Jena), ISQ Berlin

![Fachkonferenz-Ansicht: je Aufgabe und Klasse ein farbiges Feld „Exzellent“, „Gut“, „Okay“, „Nicht gut“ relativ zum fairen Vergleichswert](/beispiele/bilder/originale/auszeichnungen.jpg "Original: kompetenztest.de (FSU Jena), Lernstand-Barometer Deutsch, Klasse 8")

### Fragebogenskalen neben dem Testergebnis

Selbstwirksamkeit und Unterrichtsqualität aus dem Begleitfragebogen, je Klasse als Boxplot oder gestapelter Balken und im Verlauf. Stellt neben das Testergebnis, wie die Klasse ihren Unterricht und sich selbst sieht.

*Daten:* Fragebogendaten — nicht Teil der Schnittstelle · *Bibliothek:* noch keiner · *Gefunden bei:* zepf (RPTU)

![Gestapelte Balken der Selbstwirksamkeit je Klasse und Schule in vier Bewertungsstufen](/beispiele/bilder/originale/fragebogenskalen.jpg "Original: zepf (RPTU), Schulleitung")

### Standard-Erreichung

Ein Prozentwert als Schlagzeile — wie viele erreichen den Mindeststandard —, darunter je Fach oder Domäne ein Balken. Die eine Zahl, nach der zuerst gefragt wird, mit der Aufschlüsselung direkt daneben, damit sie nicht allein stehen bleibt.

*Daten:* Kompetenzstufen je Domäne · *Bibliothek:* `<tba3-standard-erreichung>` · *Gefunden bei:* indibit

![80 % Mindeststandard erreicht als große Zahl, darunter je ein Balken für Deutsch (83 %) und Französisch (76 %).](/beispiele/bilder/originale/standard-erreichung.jpg "Original: indibit, Schulrückmeldung")

![Nachbau als <tba3-standard-erreichung>](/dokumentation/bilder/baustein-standard-erreichung-de.png "Nachbau: <tba3-standard-erreichung>, mit Beispieldaten")

### Zeugnissätze

Aus den Ergebnissen formulierte Sätze zum Übernehmen und Abwandeln. Der Schritt, den eine Lehrkraft nach der Rückmeldung ohnehin tut — und der einzige Baustein hier, dessen Ausgabe Text ist und kein Bild.

*Daten:* Kompetenzstufen je Schüler:in oder Gruppe · *Bibliothek:* `<tba3-zeugnissaetze>` · *Gefunden bei:* kompetenztest.de (FSU Jena)

![Reiter „Zeugnissätze“: Tabelle mit Schüler:in, Gesamtwert und formuliertem Zeugnissatz mit Kopierknopf](/beispiele/bilder/originale/zeugnissaetze.jpg "Original: kompetenztest.de (FSU Jena), Messwiederholung Deutsch, Klasse 3")

![Nachbau als <tba3-zeugnissaetze>](/dokumentation/bilder/baustein-zeugnissaetze-de.png "Nachbau: <tba3-zeugnissaetze>, mit Beispieldaten")

### Selbsteinschätzung gegen Ergebnis

Was die Schüler:in sich zutraut, neben dem, was der Test misst. Die Lücke zwischen beidem ist pädagogisch oft der interessantere Befund als das Ergebnis allein — und sie taucht in keiner Ergebnisrückmeldung auf, die nur Ergebnisse kennt.

*Daten:* Erhobene Selbsteinschätzung, nicht Teil der Schnittstelle · *Bibliothek:* `<tba3-selbsteinschaetzung>` · *Gefunden bei:* kompetenztest.de (FSU Jena)

![Gesprächsprotokoll der Selbsteinschätzung für Leseverstehen und Orthografie: Selbsteinschätzung und Ergebnis als Stufenleisten mit Schlüsselsymbolen, daneben „Noch zu üben“ und „Bereits geschafft“](/beispiele/bilder/originale/selbsteinschaetzung.jpg "Original: kompetenztest.de (FSU Jena), Lernstand-Barometer Deutsch, Klasse 8")

![Nachbau als <tba3-selbsteinschaetzung>](/dokumentation/bilder/baustein-selbsteinschaetzung-de.png "Nachbau: <tba3-selbsteinschaetzung>, mit Beispieldaten")

### Aufgabenvorschau

Die Aufgabe selbst in einem Überlagerungsfenster, aus der Tabelle heraus geöffnet. Ohne sie ist eine auffällige Lösungshäufigkeit eine Zahl, über die sich nicht entscheiden lässt, ob sie am Können lag oder an der Aufgabe.

*Daten:* Aufgabeninhalt, nicht nur Kennung und Statistik · *Bibliothek:* noch keiner · *Gefunden bei:* kompetenztest.de (FSU Jena), zepf (RPTU)

![Aufgeklappte Aufgabe 1.1 „Sportunterricht“: Klassenmittelwert und fairer Vergleichswert, richtige Lösung, Teilaufgabenmerkmale und Vorschaubilder von Stimulus und Aufgabe](/beispiele/bilder/originale/aufgabenvorschau.jpg "Original: kompetenztest.de (FSU Jena), Lernstand-Barometer Deutsch, Klasse 8")

## Rahmen

Was jede Rückmeldung braucht, unabhängig von Fach und Jahrgang: wer was sehen darf, wie ausgewählt wird, wie etwas festgehalten und wieder aufgerufen wird, und wie das Ganze verständlich und bedienbar bleibt.

### Rollensichten

Kaskadierende Sichten auf dieselbe Datenlage: Schulaufsicht sieht den Bezirk, Schulleitung die Schule, Lehrkraft die Klasse und einzelne Schüler:innen, Schüler:in die eigenen Ergebnisse. Eine Bibliothek, vier Kompositionen.

*Daten:* Ebene und Rechte der angemeldeten Person · *Bibliothek:* noch keiner · *Genannt von:* kompetenztest.de (FSU Jena), ISQ Berlin

![Schüler:innensicht derselben Daten: „Adrian – hier ist dein Testergebnis“ mit eigenem Vogel und Flugbahn über drei Messzeitpunkte](/beispiele/bilder/originale/rollensichten.jpg "Original: kompetenztest.de (FSU Jena), Messwiederholung Deutsch, Klasse 3")

### Filterleiste

Ebene, Fach, Jahrgang, Datentyp. Die Auswahl gehört in die Adresszeile, sonst lässt sich eine Ansicht nicht verschicken und der Zurück-Knopf tut das Falsche.

*Daten:* Das Vokabular der Schnittstelle · *Bibliothek:* noch keiner · *Genannt von:* indibit, ISQ Berlin

![Filterleiste: Auswahlliste Schulamt, darunter Knöpfe für Jahrgang (V3, V8) und Fach (Deutsch, Mathematik).](/beispiele/bilder/originale/filterleiste.jpg "Original: indibit, Schulaufsichtsrückmeldung")

### Arbeitsstand

Gesetzte Filter, Notizen und Kommentare speichern und wieder aufrufen. Eine Rückmeldung wird selten in einer Sitzung gelesen; ohne Arbeitsstand beginnt jede Konferenz von vorn.

*Daten:* Profil der angemeldeten Person · *Bibliothek:* noch keiner · *Genannt von:* ISQ Berlin, zepf (RPTU)

![Notizen-Schublade mit Seitenreitern, Formatierungsleiste und Knopf zum Verknüpfen mit einem Modul](/beispiele/bilder/originale/arbeitsstand.jpg "Original: zepf (RPTU), Mathematik, Klasse 3")

### Bericht ausgeben

Eine Fassung, die das Gerät verlässt — an die gesetzten Filter gebunden und, wo sinnvoll, vor dem Export bearbeitbar. In der Konferenz liegt Papier auf dem Tisch, kein Dashboard.

*Daten:* Der aktuelle Stand der Ansicht · *Bibliothek:* noch keiner · *Genannt von:* kompetenztest.de (FSU Jena), ISQ Berlin

![Seite „Berichte downloaden“: Fachbericht, Klassenbericht, Fachkonferenz und Selbsteinschätzung als PDF je Klasse, tabellarische Auswertung als HTML, ODS und CSV](/beispiele/bilder/originale/bericht-ausgeben.jpg "Original: kompetenztest.de (FSU Jena), Lernstand-Barometer Deutsch, Klasse 8")

### Erklärtexte

Tooltips, Glossar, Einführungstouren je Rolle. Datenunabhängig gehalten — bei zepf in eigenen JSON-Dateien —, damit sich der Text ändern lässt, ohne die Auswertung anzufassen.

*Daten:* Keine — bewusst getrennt gehalten · *Bibliothek:* noch keiner · *Genannt von:* kompetenztest.de (FSU Jena), ISQ Berlin, zepf (RPTU)

![Seitenpanel „Ergebnisse im Detail – Hilfe & Bedienung“ mit Vorlese-Knopf und nummerierten Erklärungen zu Ansichten, Optionen, Merkmalen und Sortierung](/beispiele/bilder/originale/erklaertexte.jpg "Original: kompetenztest.de (FSU Jena), Kompetenzstand Mathematik: Klassenbericht, Klasse 8")

### Zweisprachigkeit

Deutsch und Englisch in derselben Anwendung. Die Wahl gehört der Leserin und gilt über alle Ansichten hinweg; Beispieldaten bleiben unübersetzt, weil sie im Betrieb aus der Schnittstelle kommen.

*Daten:* Keine — Beschriftungen, nicht Ergebnisse · *Bibliothek:* noch keiner · *Genannt von:* ISQ Berlin

### Barrierefreiheit

Kontrast, Tastaturbedienung, Bedeutung nicht allein über Farbe. Prüfbar gemacht statt angestrebt: indibit fährt WCAG 2.1 AA als festen Prozessschritt (95/100), das ISQ nennt sie ausdrücklich als angestrebt und nicht verbindlich geprüft.

*Daten:* Keine — eine Eigenschaft jeder Darstellung · *Bibliothek:* noch keiner · *Genannt von:* ISQ Berlin

### Namen gegen Codes

Ein Umschalter, der Namen durch Codes ersetzt und die Ergebnisse stehen lässt. Wer eine Rückmeldung auf dem Beamer oder in einer Bildschirmfreigabe bespricht, braucht genau das — und braucht es als einen Griff, nicht als Vorbereitung.

*Daten:* Keine — eine Darstellungsentscheidung · *Bibliothek:* noch keiner · *Gefunden bei:* kompetenztest.de (FSU Jena)

![Umschalter „Namen / Codes“ auf „Codes“, die Vögel tragen statt Namen dreibuchstabige Codes](/beispiele/bilder/originale/pseudonymisierung.jpg "Original: kompetenztest.de (FSU Jena), Messwiederholung Deutsch, Klasse 3")

### Glossar mit Suche

Die Fachbegriffe an einer Stelle, durchsuchbar, aus jeder Ansicht erreichbar. „Kompetenzstufe", „fairer Vergleich", „Lösungshäufigkeit" sind für die Lesenden nicht selbsterklärend, und ein Tooltip beantwortet nur die Frage, die man an genau dieser Stelle stellt.

*Daten:* Keine — datenunabhängig gehalten · *Bibliothek:* `<tba3-glossar>` · *Gefunden bei:* zepf (RPTU)

![Glossar mit Suchfeld und aufklappbaren Begriffen, der erste Eintrag „Kompetenzstufe (primar)“ geöffnet](/beispiele/bilder/originale/glossar-mit-suche.jpg "Original: zepf (RPTU), Mathematik, Klasse 3")

![Nachbau als <tba3-glossar>](/dokumentation/bilder/baustein-glossar-de.png "Nachbau: <tba3-glossar>, mit Beispieldaten")

### Export mit Auswahl

Vor dem Export auswählen, was hineinkommt. Ein Bericht, der alles enthält, wird nicht gelesen; die Auswahl ist der Unterschied zwischen einer Ausgabe und einer Vorlage für die Konferenz.

*Daten:* Der aktuelle Stand der Ansicht plus eine Auswahl · *Bibliothek:* noch keiner · *Gefunden bei:* zepf (RPTU)

![Berichtsansicht mit zwei vorgemerkten Modulen auf einer Seitenvorschau und dem Knopf „Als PDF exportieren“](/beispiele/bilder/originale/export-mit-auswahl.jpg "Original: zepf (RPTU), Mathematik, Klasse 3")

## Bilanz

Der Katalog führt **43 Bausteine** in drei Schichten:
29 aus den Sachberichten, 14 aus den laufenden
Demos und ihrem Quelltext.

**Was erst die Erhebung am Artefakt gezeigt hat:**
Lösungsquote nach Merkmal, Abweichung je Lerngruppe, Zwei Gruppen gespiegelt, Netzdiagramm der Teilkompetenzen, Fragebogenskalen neben dem Testergebnis, Kontextmerkmal als Ring, Lernverlauf als Figuren, Standard-Erreichung, Zeugnissätze, Selbsteinschätzung gegen Ergebnis, Aufgabenvorschau, Namen gegen Codes, Glossar mit Suche, Export mit Auswahl. Keiner davon steht in einem
Sachbericht — was nichts über ihren Wert sagt, aber alles darüber, wie
vollständig eine Projektzusammenfassung sein kann. Wer nur die Berichte liest,
übersieht ein Viertel dessen, was gebaut wurde.

**Was mindestens drei der vier Einrichtungen unabhängig voneinander gebaut haben:**
Verteilung über die Kompetenzstufen, Lösungshäufigkeit je Aufgabe, Verlauf über Messzeitpunkte, Tabelle je Person, Vergleichsebenen, Stärken und Entwicklungsbedarfe, Materialanbindung, Einzelbericht, Automatische Hinweise, Erklärtexte. Das ist der belastbare Kern einer
Rückmeldung — wer eine neue baut, fängt hier an.

**Was noch kein Baustein in `@tba3/bausteine` ist** (18 Einträge):
Gebietskarte, Materialanbindung, Aufgabenbrowser, Einzelbericht, Geführter Ablauf, Automatische Hinweise, Auszeichnungen, Fragebogenskalen neben dem Testergebnis, Rollensichten, Filterleiste, Arbeitsstand, Bericht ausgeben, Erklärtexte, Zweisprachigkeit, Barrierefreiheit, Aufgabenvorschau, Namen gegen Codes, Export mit Auswahl. Ein Teil davon ist keine
Visualisierung, sondern ein Rahmen und gehört auch nicht in eine
Visualisierungsbibliothek. Der Rest ist eine Liste offener Arbeit.

**Was die Bibliothek führt, ohne dass ein Sachbericht es nennt**
(2 Einträge): Erwartung gegen Ergebnis, Mittelwert mit Unsicherheit.
Das ist kein Vorwurf an die Berichte — sie beschreiben, was die Gruppen
gefordert haben, nicht alles, was auf dem Schirm steht. Aber es ist der Teil des
Katalogs, für den der Beleg fehlt, und das soll man sehen können.
