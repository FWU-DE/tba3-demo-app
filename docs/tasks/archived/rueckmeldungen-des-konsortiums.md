# Die echten Rückmeldungen des Konsortiums eintragen und ihre Bausteine herausziehen

## Anlass

Die Abschlusssitzung der Steuergruppe am 15.09.2026 hat zum ersten Mal die
Repositorien und Demoadressen aller vier entwickelnden Einrichtungen
zusammengetragen (`2026_09_15_Abschluss_Konsortium.pdf`, Folie 0). Damit ist die
Grundlage da, auf der `/beispiele` bisher nur Platzhalter zeigen konnte: zwölf
ausformulierte Beispiele ohne Verweis, mit dem Hinweis „verbindlich ist daran
nichts".

Zugleich beschreiben die vier Sachberichte dieselben Darstellungen unter
verschiedenen Namen und in vier verschiedenen Technologien — Vue 3 mit Quasar,
Vue 3 mit Pinia, React 19 mit Material-UI, Angular 21 mit ECharts, Vanilla
JavaScript mit Tabulator und D3. Was sich daraus nachnutzen lässt, ist nicht der
Code, sondern der **Zuschnitt**: welche Bausteine eine Rückmeldung braucht, und
welche fachliche Frage jeder beantwortet.

## Akzeptanzkriterien

1. `/beispiele` führt die **zehn tatsächlichen Rückmeldungen** der vier
   Einrichtungen mit Demo-, Quelltext- und Dokumentationsverweis, nicht mehr die
   Platzhalter. Ein fehlender Verweis bleibt leer statt zu raten.
2. Die Einrichtung ist ein Filter neben Fach, Klassenstufe und Zielgruppe.
   Rückmeldungen ohne fachliche Festlegung („das Fach ist Filter, keine
   inhaltliche Festlegung") verschwinden nicht, wenn nach einem Fach gefiltert
   wird.
3. Ein **technologieagnostischer Katalog** der Bausteine liegt als Daten vor —
   Anzeigebausteine, Rückmeldeelemente, Rahmen —, jeder mit Zweck, Datenquelle
   und Herkunft (welche Rückmeldung hat ihn). Jeder Baustein nennt, ob
   `@tba3/bausteine` ihn schon führt.
4. Der Katalog steht als Dokument unter `/dokumentation` und wird dort aus
   denselben Daten gebaut, nicht abgeschrieben.
5. Die **Demoanwendung** zeigt den Katalog als eigenen Reiter und zeichnet jeden
   Baustein, für den sie Daten hat, mit den Daten der gewählten Ebene —
   ausdrücklich auch dort, wo ein anderer Reiter dasselbe schon zeigt.
6. Eine Zahl steht an einer Stelle: die Anzahl der Rückmeldungen und die der
   Bausteine kommen aus den Daten, nicht aus dem Fließtext.

## Nicht Teil des Tickets

- Die Rückmeldungen selbst einbetten oder nachbauen. Sie liegen bei den
  Einrichtungen und werden verlinkt.
- Neue Bausteine in `@tba3/bausteine`. Der Katalog hält fest, was fehlt; bauen
  ist ein eigener Schritt.
