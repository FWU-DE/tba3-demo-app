# @tba3/bausteine

Die TBA3-Visualisierungen als **Web Component, Vue-Komponente und React-Komponente** —
eine Implementierung, drei Fassungen.

Wer nur die Kompetenzstufen-Leiste braucht, nimmt nur die. Wer sie in einer
React-App braucht, bekommt eine React-Komponente. Wer gar kein Framework
einsetzt, bindet ein Custom Element ein. Der Quelltext dahinter ist derselbe.

---

## Warum nicht dreimal geschrieben

Drei Fassungen von Hand hieße dreimal pflegen und dreimal auseinanderdriften.
Stattdessen:

```
kern/            reine Funktionen: Daten rein, SVG-Zeichenkette raus.
                 Keine Abhängigkeit, kein DOM, überall lauffähig.
webcomponents/   Custom Elements um den Kern
vue/             Vue-Komponenten um den Kern
react/           React-Komponenten um den Kern
```

Die Adapter lesen das Verzeichnis in `kern/index.js`. Ein neuer Baustein dort
bekommt automatisch alle drei Fassungen — kein Adapter muss angefasst werden.

`packages/bausteine/__tests__/bausteine.test.jsx` vergleicht für jeden Baustein
das SVG aus allen drei Fassungen Zeichen für Zeichen. Driftet eine, schlägt der
Test fehl.

---

## Bausteine

| Name | Zweck | Endpunkt |
|---|---|---|
| `kompetenzstufen-leiste` | Gestapelte Balken je Bezugsgruppe, optional mit fairem Vergleich | `/groups/{id}/competence-levels` |
| `mittelwert-vergleich` | Diamant-Marker auf gemeinsamer Skala, optional mit Konfidenzintervall | `/groups`, `/schools`, `/states` (items) |
| `erwartet-tatsaechlich` | Tatsächliche gegen erwartete Lösungsquote je Aufgabe | `/groups/{id}/items` |
| `perzentilbaender` | Mittlerer Bereich je Teilbereich, dazu der Wert einer Schüler:in | `/groups/{id}/aggregations` |

---

## Native Web Component

Ohne Build, ohne Framework, ohne Paketmanager:

```html
<script type="module">
  import { registrieren } from 'https://<host>/bausteine/webcomponents/index.js';
  registrieren();
</script>

<tba3-kompetenzstufen-leiste id="leiste" title="3a Deutsch"></tba3-kompetenzstufen-leiste>

<script type="module">
  document.getElementById('leiste').rows = [
    { label: 'Klasse 3a', total: 25, levels: [
      { nameShort: 'I', pct: 8, color: '#ef4444' },
      { nameShort: 'II', pct: 22, color: '#f97316' },
      { nameShort: 'III', pct: 34, color: '#eab308' },
      { nameShort: 'IV', pct: 24, color: '#22c55e' },
      { nameShort: 'V', pct: 12, color: '#15803d' },
    ]},
  ];
</script>
```

Daten kommen über Eigenschaften (`el.rows = …`). Einfache Angaben gehen auch als
Attribut; Attribute mit JSON-Inhalt nehmen ebenfalls Daten entgegen, für Seiten,
die kein eigenes Skript ausführen sollen:

```html
<tba3-perzentilbaender
  items='[{"label":"Lesen","bandLeft":35,"bandRight":70,"studentScore":52}]'>
</tba3-perzentilbaender>
```

Jedes Element bringt seine Stile im Shadow DOM mit — es gibt nichts einzubinden
und nichts, was mit den Stilen der umgebenden Seite kollidiert.

---

## Vue

```js
import { KompetenzstufenLeiste } from '@tba3/bausteine/vue';
```

```vue
<KompetenzstufenLeiste :rows="zeilen" title="3a Deutsch" domain="Lesen" />
```

Oder alle auf einmal:

```js
import { bausteine } from '@tba3/bausteine/vue';
app.use(bausteine);
```

## React

```jsx
import { KompetenzstufenLeiste } from '@tba3/bausteine/react';

<KompetenzstufenLeiste rows={zeilen} title="3a Deutsch" domain="Lesen" />
```

## Ohne Framework, nur das SVG

Für PDF-Erzeugung, E-Mail oder Serverrendern:

```js
import { kompetenzstufenLeiste } from '@tba3/bausteine';

const { svg, breite, hoehe } = kompetenzstufenLeiste({ rows: zeilen });
```

---

## Einen Baustein hinzufügen

1. `kern/<name>.js` anlegen: `STANDARD` exportieren und eine Funktion, die
   `{ breite, hoehe, svg, html }` liefert.
2. In `kern/index.js` unter `BAUSTEINE` eintragen.
3. Beispieldaten in `__tests__/bausteine.test.jsx` unter `DATEN` ergänzen.

Die drei Fassungen entstehen daraus von selbst; die Tests prüfen, dass sie
übereinstimmen.

---

## Stand

Vier der zwölf Visualisierungen des Katalogs sind portiert — die vier ohne
eigenen Zustand. Die übrigen acht (`ItemSolutionTable`, `StudentScatterPlot`,
`CompetencyOverviewCards`, `BistaDistributionChart`, `StudentSolutionTable`,
`StudentTooltip`, `ItemDetailView`, `ComponentDocs`) bringen Sortierung,
Tooltips oder Auswahl mit. Für sie reicht eine SVG-Zeichenkette nicht; sie
brauchen im Kern eine kleine Ereignisschicht, bevor sie denselben Weg gehen
können.
