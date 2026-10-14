# Machbarkeitsstudie

Die Demoanwendung zeigt, was eine Oberfläche mit den Antworten der
Auswertungsschnittstelle anfangen kann. Daneben wurden einzelne Fragen
untersucht, die über die Schnittstelle hinausgehen: Lässt sich ein fremder
Dienst anbinden, und bringt das den Lehrkräften etwas?

Jede dieser Fragen bekommt eine eigene Seite. Sie folgt immer demselben Aufbau:
erst die Frage, dann die technische Umsetzung am Prototyp, dann eine
Einschätzung, die zwei Dinge auseinanderhält: **was technisch geht** und
**was es im Unterricht bringt**. Die beiden Antworten fallen nicht immer
gleich aus.

> **Prototypen, keine Produkte.** Was in der Studie gebaut wurde, beantwortet
> die Frage *geht das, und was wäre dafür nötig?*. Es ist keine Empfehlung für
> den Betrieb und kein Teil der Schnittstelle.

## Die Teilfragen

| Frage | Prototyp | Ergebnis in einem Satz |
|---|---|---|
| [Mediatheken einbinden](machbarkeitsstudie-mediatheken.md): Material aus MUNDO direkt einer Kompetenzstufe zuordnen | Reiter „Lernmaterialien“ der Demoanwendung, Anbindung über LTI 1.1 | Technisch machbar. Hilfreich aber nur für Lehrkräfte, die schon wissen, was sie suchen. Eine Suche, die von der Rückmeldung ausgeht, scheitert an fehlenden Metadaten auf beiden Seiten. |
| [Ein Assistent, der die Auswertung lesen kann](demo-rezepte.md#ein-assistent-der-die-auswertung-lesen-kann-der-mcp-server): ein Sprachmodell stellt die Abfragen selbst zusammen | MCP-Server im Repository (`mcp-server/`) | Als Pilot beschrieben in den Rezepten der Demoanwendung, mit den offenen Fragen für einen echten Betrieb. |

Weitere Teilfragen werden hier eingetragen, sobald ihre Seite steht.
