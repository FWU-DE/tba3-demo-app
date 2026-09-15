# @tba3/bausteine

Die TBA3-Visualisierungen als **native Web Component, Vue- und React-Komponente**.
Eine Implementierung, drei Fassungen. Ohne Abhängigkeiten, ohne Design.

**Demonstrator:** [`/bausteine`](https://tba3.vercel.app/bausteine) — alle
Bausteine in allen drei Fassungen nebeneinander, mit Theme-Umschalter.

---

## Katalog und Bausteine — der Unterschied

Zwei Bereiche zeigen Visualisierungen. Das verwirrt zu Recht:

| | `/katalog` | `/bausteine` |
|---|---|---|
| Was | die **Schau** | die **Bibliothek** |
| Daten | echte Antworten der Schnittstelle | Beispieldaten |
| Zweck | anschauen, verstehen, Quelltext lesen | einbauen, mitnehmen |
| Form | Vue-Ansichten mit Filtern und Doku | Paket in drei Fassungen |

Der Katalog ist älter. Seine Ansichten ziehen nach und nach auf die Bausteine
um — eine umgezogene Ansicht zeigt dann denselben Quelltext, den auch ein
fremdes Projekt bekommt. Die Übersicht steht in
[`apps/portal/bausteine/zuordnung.js`](../../apps/portal/bausteine/zuordnung.js),
wird auf `/bausteine` als Tabelle gezeigt und von
`zuordnung.test.mjs` gegen die Wirklichkeit geprüft — eine Zuordnungstabelle,
die niemand nachzieht, ist schlimmer als keine.

---

## Warum nicht dreimal geschrieben

Drei Fassungen von Hand hieße dreimal pflegen und dreimal auseinanderdriften.
Stattdessen:

```
kern/            reine Berechnung: Daten rein, Geometrie raus.
                 Zahlen und Objekte, keine Zeichenketten.
                 Keine Abhängigkeit, kein DOM, auf dem Server lauffähig.
webcomponents/   die eine echte Implementierung: echtes DOM, echte
                 Ereignis-Empfänger, Shadow DOM.
vue/             Hülle um das Custom Element
react/           Hülle um das Custom Element
```

**Der erste Entwurf gab fertiges SVG als Zeichenkette aus.** Das ließ sich zwar
in drei Frameworks einsetzen, aber nicht bedienen: an eine per `innerHTML`
eingesetzte Zeichenkette lassen sich keine Ereignisse hängen, und Tabellen und
Karten sind damit gar nicht zu bauen. Deshalb der Umbau — jetzt baut jeder
Baustein echte Knoten, und Tooltips, Sortierung, Klick und Tastaturbedienung
funktionieren.

Die Hüllen tun genau zwei Dinge, die Vue und React sonst falsch machen:

1. **Objekte und Arrays als Eigenschaft setzen, nicht als Attribut.** Sonst
   käme ein Array als `"[object Object]"` an.
2. **`CustomEvent` in die Framework-Welt übersetzen** — `@stufe-gewaehlt` in
   Vue, `onStufeGewaehlt` in React.

`__tests__/bausteine.test.jsx` rendert jeden Baustein in allen drei Fassungen
und vergleicht das erzeugte DOM Knoten für Knoten. Driftet eine, schlägt der
Test fehl.

---

## Bausteine

| Element | Zweck | Endpunkt | Ereignisse |
|---|---|---|---|
| `<tba3-kompetenzstufen-leiste>` | Gestapelte Balken je Bezugsgruppe, optional mit fairem Vergleich | `/groups/{id}/competence-levels` | `stufe-gewaehlt`, `stufe-betreten`, `stufe-verlassen` |
| `<tba3-aufgaben-tabelle>` | Sortierbare Tabelle der Aufgaben mit Abweichung zur Erwartung | `/groups/{id}/items` | `sortiert`, `aufgabe-gewaehlt` |
| `<tba3-mittelwert-vergleich>` | Diamant-Marker auf gemeinsamer Skala, mit Konfidenzintervall | `/groups`, `/schools`, `/states` | `zeile-gewaehlt` |
| `<tba3-erwartet-tatsaechlich>` | Tatsächliche gegen erwartete Lösungsquote je Aufgabe | `/groups/{id}/items` | `aufgabe-gewaehlt` |
| `<tba3-perzentilbaender>` | Mittlerer Bereich je Teilbereich, dazu der Wert einer Schüler:in | `/groups/{id}/aggregations` | `bereich-gewaehlt` |
| `<tba3-schueler-tabelle>` | Lösungsanteile je Schüler:in und Teilbereich, sortierbar, mit Auswahl | `/groups/{id}/items?type=students` | `sortiert`, `schueler-gewaehlt`, `auswahl-geaendert` |
| `<tba3-uebersichtskarten>` | Karten mit Ring, Kennzahl und aufklappbaren Details | `/groups/{id}/aggregations` | `karte-gewaehlt`, `karte-geoeffnet` |
| `<tba3-streudiagramm>` | Schüler:innen als Punktwolke, Tooltip außerhalb des SVG | `/groups/{id}/items?type=students` | `punkt-gewaehlt`, `punkt-betreten`, `punkt-verlassen` |
| `<tba3-bista-verteilung>` | Avatare auf der Punkteskala, Zonen von außen gesetzt | `/groups/{id}/aggregations` | `schueler-gewaehlt`, `zone-gewaehlt` |
| `<tba3-lernstands-verlauf>` | Mehrere Erhebungen als Linie, mit Band und Vergleichslinie | `/groups/{id}/aggregations` | `zeitpunkt-gewaehlt` |
| `<tba3-aufgaben-heatmap>` | Aufgaben gegen Lerngruppen, gefärbt nach Abweichung oder Wert | `/groups/{id}/items` | `zelle-gewaehlt` |
| `<tba3-kennzahl-kachel>` | Eine Zahl mit Vergleich und kleinem Verlauf | `/groups/{id}/aggregations` | `kachel-gewaehlt` |

Die letzten drei haben **keine** Katalog-Ansicht: der Verlauf braucht mehrere
Erhebungen, die Heatmap die Sicht über Lerngruppen hinweg, und die Kachel ist zu
klein für eine eigene Seite. Die Bibliothek ist eben nicht die Teilmenge der
Schau — `NUR_BAUSTEIN` in
[`zuordnung.js`](../../apps/portal/bausteine/zuordnung.js) hält das mit Grund
fest, und ein Test prüft, dass dort kein Baustein fehlt.

---

## Native Web Component

Ohne Build, ohne Framework, ohne Paketmanager:

```html
<script type="module">
  import { registrieren } from 'https://tba3.vercel.app/bausteine/webcomponents/index.js';
  registrieren();
</script>

<tba3-kompetenzstufen-leiste id="leiste" title="3a Deutsch"></tba3-kompetenzstufen-leiste>

<script type="module">
  const el = document.getElementById('leiste');
  el.rows = [
    { label: 'Klasse 3a', total: 25, levels: [
      { nameShort: 'I', pct: 8 }, { nameShort: 'II', pct: 22 },
      { nameShort: 'III', pct: 34 }, { nameShort: 'IV', pct: 24 },
      { nameShort: 'V', pct: 12 },
    ]},
  ];
  el.addEventListener('stufe-gewaehlt', (e) => console.log(e.detail));
</script>
```

Daten kommen über **Eigenschaften** (`el.rows = …`). Einfache Angaben gehen auch
als Attribut; Attribute mit JSON-Inhalt nehmen ebenfalls Daten entgegen, für
Seiten, die kein eigenes Skript ausführen sollen:

```html
<tba3-perzentilbaender
  items='[{"label":"Lesen","bandLeft":35,"bandRight":70,"studentScore":52}]'>
</tba3-perzentilbaender>
```

Mehrere Zuweisungen hintereinander zeichnen **einmal** neu, nicht dreimal —
das Element sammelt sie in einem Microtask.

## Vue

```js
import { KompetenzstufenLeiste } from '@tba3/bausteine/vue';
```

```vue
<KompetenzstufenLeiste :rows="zeilen" title="3a Deutsch" @stufe-gewaehlt="zeigen" />
```

Oder alle auf einmal — das Plugin meldet nebenbei die Custom Elements bei Vue an,
sonst warnt es bei jedem Rendern:

```js
import { bausteine } from '@tba3/bausteine/vue';
app.use(bausteine);
```

## React

```jsx
import { AufgabenTabelle } from '@tba3/bausteine/react';

<AufgabenTabelle items={items} onAufgabeGewaehlt={(detail) => zeigen(detail)} />
```

## Nur die Berechnung

Für PDF-Erzeugung, Serverrendern oder eine eigene Darstellung:

```js
import { leisteGeometrie, tabellenZeilen } from '@tba3/bausteine';

const { breite, hoehe, zeilen } = leisteGeometrie({ rows });
```

---

## Theming — die Bausteine bringen kein Design mit

Sie lesen CSS-Variablen und haben für jede einen **neutralen** Rückfallwert.
Steht ein Baustein in einer Seite mit eigenen Tokens, übernimmt er deren
Aussehen; steht er allein, sieht er unauffällig aus statt kaputt.

So lässt sich derselbe Baustein im FWU-Portal, bei einem Land mit eigenem Design
und in einer fremden Anwendung einsetzen, **ohne ihn zu forken**. Genau das ist
der Punkt der Nachnutzung.

```css
tba3-kompetenzstufen-leiste,
tba3-aufgaben-tabelle {
  --tba3-farbe-marke: #0000c4;
  --tba3-farbe-text: #0a0a0a;
  --tba3-stufe-3: #eab308;
  --tba3-schrift: Inter, sans-serif;
}
```

Die Namen sind bewusst eigenständig (`--tba3-*`) statt an die Tokens einer
bestimmten Seite gebunden: ein Baustein darf nicht davon abhängen, dass gerade
diese Seite ihn umgibt.

### Dark Mode kann jeder Baustein von selbst

Jede Variable hat **zwei** Vorgaben, hell und dunkel. Welche gilt, sagt die
Seite mit `color-scheme` — der Eigenschaft, die CSS genau dafür hat. Sie
vererbt, kommt also am Baustein an, ohne dass er etwas davon wissen muss:

```css
:root { color-scheme: light }       /* Bausteine hell */
:root { color-scheme: dark }        /* Bausteine dunkel — angehobene Töne,
                                       damit die Stufen nicht absaufen */
:root { color-scheme: light dark }  /* Bausteine folgen dem System */
```

Sagt eine Seite nichts, ist sie eine helle Seite, und die Bausteine sind hell.
Das ist bewusst so: ein Baustein kann nicht wissen, dass das Betriebssystem
dunkel steht, solange die Seite es nicht mitmacht. Genau daran ist die frühere
Vorgabe „folge `prefers-color-scheme`" gescheitert — im Katalog standen
schwarze Balken in weißen Karten, im Demonstrator weiße Schrift auf weißem
Grund, sobald jemand sein System dunkel gestellt hatte.

Erzwingen lässt sich der Modus am einzelnen Baustein über `data-thema` — **am
Element selbst**, nicht weiter oben im Baum: die Regel dahinter ist
`:host([data-thema="dunkel"])`, und `:host()` prüft nur das Wirtselement. Für
eine ganze Seite ist `color-scheme` der kürzere Weg.

```html
<tba3-aufgaben-tabelle data-thema="dunkel"></tba3-aufgaben-tabelle>
```

Eine Seite, die eine Variable selbst setzt, gewinnt in beiden Modi.

Zwei E2E-Tests in `e2e/katalog-bausteine.spec.js` öffnen Katalog und
Demonstrator mit dunkel gestelltem System und prüfen, dass der Text dunkel
bleibt.

### Warum die Vorgaben nicht am `:host` stehen

Ein `:host { --tba3-farbe-text: #1a1a1a }` setzt die Eigenschaft **auf dem
Element selbst** und schlägt damit jeden Wert, den die Seite vererbt — das
Theme der Seite käme nie an. Daran ist der erste Anlauf gescheitert: im dunklen
Thema blieb der Text schwarz auf schwarz.

Deshalb die Umleitung über einen privaten Namen:

```css
:host { --tba3-_farbe-text: var(--tba3-farbe-text, light-dark(#1a1a1a, #f1f3f5)); }
```

`color-scheme` steht aus demselben Grund **nicht** auf `:host`: es würde sonst
schlagen, was die Seite vererbt.

Gezeichnet wird mit `--tba3-_farbe-text`; gesetzt wird von außen
`--tba3-farbe-text`. Zwei Tests bewachen das: kein öffentlicher Name darf im
Shadow DOM zugewiesen werden, und kein Baustein darf mit einem öffentlichen
Namen zeichnen.

| Gruppe | Variablen |
|---|---|
| Schrift | `--tba3-schrift`, `--tba3-schrift-mono`, `--tba3-schrift-groesse` |
| Flächen | `--tba3-farbe-grund`, `--tba3-farbe-flaeche` |
| Linien | `--tba3-farbe-linie`, `--tba3-farbe-raster` |
| Text | `--tba3-farbe-text`, `--tba3-farbe-text-gedaempft`, `--tba3-farbe-text-invers` |
| Interaktion | `--tba3-farbe-marke`, `--tba3-farbe-fokus`, `--tba3-farbe-hervorhebung` |
| Kompetenzstufen | `--tba3-stufe-1` … `--tba3-stufe-5` |
| Schrift **auf** einer Stufe | `--tba3-stufe-1-text` … `--tba3-stufe-5-text` |
| Bewertung | `--tba3-farbe-ueber`, `--tba3-farbe-im-rahmen`, `--tba3-farbe-unter` |
| Maße | `--tba3-radius`, `--tba3-abstand` |

Die vollständige Liste mit Vorgaben steht in
[`kern/thema.js`](kern/thema.js). Ein Test prüft, dass dort **keine Markenfarbe
einer bestimmten Seite** steht.

Die Kompetenzstufen haben absichtlich einen Rot-Grün-Verlauf als Vorgabe und
keine beliebige Palette: die Stufen tragen eine Ordnung (unter / im / über
Standard), die ohne Verlauf verloren ginge.

### Wer die Stufenfarben ändert, ändert die Beschriftung mit

Auf jeder Stufenfarbe steht Text — das Kürzel im Balken, das Abzeichen in der
Tabelle, die Initialen im Avatar. Eine einzige Inversfarbe reicht dafür nicht:
Weiß auf dem Gelb der Stufe 3 hat ein Kontrastverhältnis von **2,0**, lesbar
ist ab **4,5**. Deshalb trägt jede Stufe ihre Beschriftungsfarbe selbst:

```css
tba3-kompetenzstufen-leiste {
  --tba3-stufe-3: #854d0e;        /* dunkler als die Vorgabe … */
  --tba3-stufe-3-text: #ffffff;   /* … also helle Schrift darauf */
}
```

**Ausrechnen statt raten** — die Rechnung steckt im Paket:

```js
import { pruefeThema } from '@tba3/bausteine';

const befunde = pruefeThema({ 'stufe-3': '#854d0e' }, { modus: 'hell' });
// [{ was: 'Beschriftung auf Kompetenzstufe 3', verhaeltnis: 2.54, … }]
```

`pruefeThema()` geht jedes Paar durch, an dem ein Baustein wirklich Text auf
Fläche legt, und gibt zurück, was unter 4,5 bleibt. Zwei Tests lassen sie
laufen: `__tests__/thema.test.mjs` über die Vorgaben der Bibliothek und
`apps/portal/bausteine/themen.test.mjs` über die vier Beispiel-Themen des
Demonstrators — ohne die Beschriftungsfarben fällt „hoher Kontrast" durch.

Kommt die Farbe als **Daten** herein (`levels: [{ nameShort, pct, color }]`),
rechnet der Baustein selbst: `lesbareSchrift()` wählt hell oder dunkel nach dem
Kontrast, weil dort ein echter Farbwert steht und keine Variable.

Zum Ausprobieren: der [Demonstrator](https://tba3.vercel.app/bausteine) hat
einen Theme-Umschalter mit FWU, neutral, hohem Kontrast und dunkel — derselbe
Quelltext, vier Anmutungen.

---

## Einen Baustein hinzufügen

1. `kern/<name>.js`: `STANDARD` exportieren und eine Funktion, die aus den
   Eigenschaften Geometrie bzw. aufbereitete Zeilen macht — Zahlen und Objekte,
   kein Markup.
2. `webcomponents/<name>.js`: `BAUPLAN` mit `name`, `titel`, `endpunkt`,
   `standard`, `ereignisse`, `stil` und `aufbauen(wurzel, zustand, el)`.
   `elementKlasse(BAUPLAN)` macht daraus das Custom Element.
3. In `webcomponents/index.js` unter `BAUPLAENE` und `ELEMENTE` eintragen, die
   öffentlichen Namen in `kern/index.js` weiterreichen und den Komponentennamen
   in `vue/index.js` und `react/index.js` mit ausschreiben.
4. Beispieldaten in `__tests__/bausteine.test.jsx` unter `DATEN` ergänzen und in
   `apps/portal/bausteine/demodaten.js` für **jeden** Datensatz.
5. In `apps/portal/bausteine/zuordnung.js` eintragen: entweder bei der
   Katalog-Ansicht, die ihn zeigt, oder unter `NUR_BAUSTEIN` mit Grund.

Die Schritte 3 bis 5 sind nicht Fleiß, sondern Prüfungen: `bausteine.test.jsx`,
`demodaten.test.mjs` und `zuordnung.test.mjs` schlagen fehl, solange einer
fehlt.

Vue- und React-Fassung entstehen daraus von selbst — die Adapter lesen nur
`BAUPLAENE`. Die Tests prüfen, dass alle drei übereinstimmen.

---

## Stand

Zwölf Bausteine, alle in drei Fassungen. **Alle neun Katalog-Ansichten laufen
über das Paket** — was die Schau zeigt, ist damit derselbe Quelltext, den auch
ein fremdes Projekt bekommt. Drei Bausteine stehen ohne Ansicht daneben
(Verlauf, Heatmap, Kachel).

Zwei Dinge sind beim Umzug bewusst liegen geblieben und stehen als Hinweis in
der Zuordnungstabelle: das K-Means-Clustering des alten Streudiagramms — Gruppen
zu bilden ist Auswertung und gehört nicht in einen Baustein — und die zufällige
vertikale Streuung der BISTA-Verteilung; gleiche Werte stapeln sich jetzt, was
die ehrlichere Anordnung ist.
