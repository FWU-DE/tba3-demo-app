// Erzeugt das Dokument „Bausteine der Rückmeldungen" aus apps/shared/konsortium.js.
//
// Warum erzeugt und nicht geschrieben: dieselben Daten stehen in der
// Rückmeldungsübersicht und in der Demoanwendung. Ein von Hand gepflegtes
// Dokument daneben wäre die vierte Stelle — und die erste, die veraltet, weil
// ihr niemand ansieht, dass sie es ist.
//
// Die erzeugte Datei ist trotzdem eingecheckt: `tools/build-site.mjs` erwartet
// die Markdown-Datei auf der Platte, und der Stand soll im Diff sichtbar sein
// statt erst im Deployment. `konsortium-dokument.test.mjs` prüft, dass beides
// zusammenpasst — wer die Daten ändert und `npm run konsortium:doc` vergisst,
// merkt es beim Testlauf und nicht beim Lesen.
//
// Aufruf: node tools/konsortium-dokument.mjs  (bzw. npm run konsortium:doc)

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BAUSTEINE, EINRICHTUNGEN, FAECHER, QUELLE, RUECKMELDUNGEN, STUFEN, ZIELGRUPPEN,
  nachSchichten, rueckmeldungenZu,
} from '../apps/shared/konsortium.js';

export const ZIEL = join(
  dirname(fileURLToPath(import.meta.url)),
  '../apps/portal/dokumentation/bausteine-der-rueckmeldungen.md',
);

const de = (paar) => paar.de;

const datum = () =>
  new Date(QUELLE.datum).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

/** Tabellenzelle: Senkrechte kämen sonst als Spaltentrenner an. */
const zelle = (inhalt) => String(inhalt).replace(/\|/g, '\\|');

const verweis = (url, wort) => (url ? `[${wort}](${url})` : '—');

const aufzaehlung = (werte, woerterbuch, leer) =>
  werte.length === 0 ? leer : werte.map((w) => de(woerterbuch[w])).join(', ');

/** Die Einrichtungen, die einen Baustein nennen — jede einmal, in ihrer Reihenfolge. */
const traeger = (bausteinId) => {
  const genannt = new Set(rueckmeldungenZu(bausteinId).map((r) => r.einrichtung));
  return Object.keys(EINRICHTUNGEN).filter((e) => genannt.has(e)).map((e) => de(EINRICHTUNGEN[e]));
};

function kopf() {
  return `# Bausteine der Rückmeldungen

Zehn Rückmeldungen, vier Einrichtungen, fünf Technologien — und immer wieder
dieselben Darstellungen unter anderen Namen. Dieses Dokument zieht heraus, was
sich davon nachnutzen lässt: nicht der Code, sondern der **Zuschnitt**. Welche
Darstellung beantwortet welche fachliche Frage, und woher nimmt sie ihre Daten?

Die Grundlage ist der Sachbericht der Abschlusssitzung der Steuergruppe vom ${datum()},
in dem die vier entwickelnden Einrichtungen ihre Ergebnisse zusammengetragen
haben. Gebaut sind die Rückmeldungen in Vue 3 mit Quasar, Vue 3
mit Pinia, React 19 mit Material-UI, Angular 21 mit ECharts und Vanilla
JavaScript mit Tabulator und D3. Genau deshalb steht hier keine Technologie:
was fünf Umsetzungen gemeinsam haben, ist die Aussage, nicht das Framework.

> **Zugeordnet ist, was der Sachbericht nennt.** Eine Rückmeldung, die einen
> Baustein nicht in ihrer Liste hat, zeigt ihn womöglich trotzdem — sie hat ihn
> nur nicht berichtet. Zu raten wäre bequemer und wertlos: die Zuordnung soll
> belegen, nicht behaupten.

Dieses Dokument wird aus \`apps/shared/konsortium.js\` erzeugt
(\`npm run konsortium:doc\`). Dieselben Daten tragen die
[Rückmeldungsübersicht](/beispiele) und den Reiter „Rückmeldeelemente" der
[Demoanwendung](/demo/?tab=elemente).
`;
}

function rueckmeldungen() {
  const zeilen = RUECKMELDUNGEN.map((r) => {
    // Drei Adressen in einer Spalte: als drei eigene blieben zwei davon meist
    // leer und die Tabelle würde nur breiter, ohne mehr zu sagen.
    const adressen = [
      verweis(r.demo, 'Demo'),
      verweis(r.code, 'Code'),
      verweis(r.doku, 'Doku'),
    ].filter((a) => a !== '—').join(' · ');
    const felder = [
      de(EINRICHTUNGEN[r.einrichtung]),
      de(r.titel),
      aufzaehlung(r.zielgruppen, ZIELGRUPPEN, '—'),
      aufzaehlung(r.faecher, FAECHER, 'fachunabhängig'),
      aufzaehlung(r.stufen, STUFEN, 'alle'),
      adressen,
    ];
    return `| ${felder.map(zelle).join(' | ')} |`;
  });


  const hinweise = RUECKMELDUNGEN.filter((r) => r.hinweis)
    .map((r) => `- **${de(r.titel)}** (${de(EINRICHTUNGEN[r.einrichtung])}): ${de(r.hinweis)}`);

  return `## Die ${RUECKMELDUNGEN.length} Rückmeldungen

| Einrichtung | Rückmeldung | Zielgruppen | Fach | Klasse | Adressen |
|---|---|---|---|---|---|
${zeilen.join('\n')}

Was an diesen Verweisen vorläufig ist:

${hinweise.join('\n')}
`;
}

function schichten() {
  return nachSchichten().map(({ kurz, beschreibung, bausteine }) => {
    const eintraege = bausteine.map((b) => {
      const genannt = traeger(b.id);
      const angaben = [
        `*Daten:* ${de(b.daten)}`,
        b.element ? `*Bibliothek:* \`<tba3-${b.element}>\`` : '*Bibliothek:* noch keiner',
        genannt.length
          ? `*Genannt von:* ${genannt.join(', ')}`
          : '*Genannt von:* keinem Sachbericht — der Baustein kommt aus der Bibliothek',
      ];
      return `### ${de(b.name)}\n\n${de(b.zweck)}\n\n${angaben.join(' · ')}\n`;
    });
    return `## ${de(kurz)}\n\n${de(beschreibung)}\n\n${eintraege.join('\n')}`;
  }).join('\n');
}

function bilanz() {
  const ohneBibliothek = BAUSTEINE.filter((b) => !b.element);
  const nurBibliothek = BAUSTEINE.filter((b) => b.element && rueckmeldungenZu(b.id).length === 0);
  const mehrfach = BAUSTEINE
    .map((b) => ({ b, n: traeger(b.id).length }))
    .filter(({ n }) => n >= 3)
    .map(({ b }) => de(b.name));

  return `## Bilanz

Der Katalog führt **${BAUSTEINE.length} Bausteine** in drei Schichten. Drei Zahlen
daraus sind es wert, festgehalten zu werden.

**Was mindestens drei der vier Einrichtungen unabhängig voneinander gebaut haben:**
${mehrfach.map((n) => `${n}`).join(', ')}. Das ist der belastbare Kern einer
Rückmeldung — wer eine neue baut, fängt hier an.

**Was noch kein Baustein in \`@tba3/bausteine\` ist** (${ohneBibliothek.length} Einträge):
${ohneBibliothek.map((b) => de(b.name)).join(', ')}. Ein Teil davon ist keine
Visualisierung, sondern ein Rahmen und gehört auch nicht in eine
Visualisierungsbibliothek. Der Rest ist eine Liste offener Arbeit.

**Was die Bibliothek führt, ohne dass ein Sachbericht es nennt**
(${nurBibliothek.length} Einträge): ${nurBibliothek.map((b) => de(b.name)).join(', ')}.
Das ist kein Vorwurf an die Berichte — sie beschreiben, was die Gruppen
gefordert haben, nicht alles, was auf dem Schirm steht. Aber es ist der Teil des
Katalogs, für den der Beleg fehlt, und das soll man sehen können.
`;
}

export function dokument() {
  return [kopf(), rueckmeldungen(), schichten(), bilanz()].join('\n');
}

const direktAufgerufen = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (direktAufgerufen) {
  writeFileSync(ZIEL, dokument());
  console.log(`✓ ${RUECKMELDUNGEN.length} Rückmeldungen, ${BAUSTEINE.length} Bausteine → ${ZIEL}`);
}
