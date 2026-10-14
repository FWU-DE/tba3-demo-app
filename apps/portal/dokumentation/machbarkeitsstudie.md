# Machbarkeitsstudie

Die Demoanwendung zeigt, was eine Oberfläche mit den Antworten der
Auswertungsschnittstelle anfangen kann. Daneben entstanden Teilkonzepte für
das, was über die Schnittstelle hinausgeht: Lässt sich ein fremder Dienst
anbinden, und bringt das den Lehrkräften etwas?

![Schema: Die Lernstandserhebung VERA liefert Ergebnisse an die Auswertungsschnittstelle TBA3, diese an die Rückmeldung. Aus der Materialschnittstelle (Entwurf /materials) kommt Material je Aufgabe und Stufe dazu. Von der Rückmeldung führen Wege zur Mediathek MUNDO (LTI, gebaut), zur Lernplattform und aufs Papier (Common Cartridge und PDF, gebaut) und zum Lernsystem AIS.schule (Ergebnispaket, Konzept). MEM mit den IQB-Bildungsstandards ist gestrichelt mit der Schnittstelle (Kennung fehlt) und der Mediathek (nicht erschlossen) verbunden.](/dokumentation/bilder/machbarkeitsstudie-bausteine-de.svg)

> **Prototypen, keine Produkte.** Was in der Studie gebaut wurde, beantwortet
> die Frage *geht das, und was wäre dafür nötig?*. Es ist keine Empfehlung für
> den Betrieb und kein Teil der Schnittstelle.

## Die Teilkonzepte

| Teilkonzept | Prototyp | Ergebnis in einem Satz |
|---|---|---|
| [Mediatheken einbinden](machbarkeitsstudie-mediatheken.md): Material aus MUNDO direkt einer Kompetenzstufe zuordnen | Reiter „Lernmaterialien“ der Demoanwendung, Anbindung über LTI 1.1 | Technisch machbar. Hilfreich aber nur für Lehrkräfte, die schon wissen, was sie suchen. Eine Suche, die von der Rückmeldung ausgeht, scheitert an fehlenden Metadaten auf beiden Seiten. |
| [Materialsammlung an das LMS übergeben](machbarkeitsstudie-lms-export.md): Material, das zu einer Rückmeldung gesammelt wurde, geht als Common Cartridge an die Lernplattform oder als PDF aufs Papier | Export im Reiter „Lernmaterialien“ | Machbar, und zwar ohne Server. Moodle importiert die Cartridge, seit der Export Common Cartridge 1.1 schreibt. Sie transportiert Gliederung und Verweise, nicht das Material selbst. |
| [Ergebnisdaten zur Weiterarbeit übergeben](machbarkeitsstudie-ergebnisse-weitergeben.md): Ergebnisse einer Rückmeldung an ein Lernsystem geben, am Beispiel AIS.schule | Konzeptentwurf, kein Prototyp | Für Gruppenergebnisse machbar und ohne Personenbezug. Voraussetzung sind auflösbare Kennungen je Kompetenz; Einzelergebnisse brauchen zuerst eine Klärung durch die Länder. |
| [Ein Assistent, der die Auswertung lesen kann](machbarkeitsstudie-assistent.md): ein Sprachmodell stellt die Abfragen selbst zusammen | MCP-Server im Repository (`mcp-server/`) | Technisch machbar und stark bei Fragen, die mehrere Abfragen kreuzen. Die Hürde ist der Datenschutz: Im Pilot gehen auf Nachfrage Einzeldaten an das Sprachmodell. |
