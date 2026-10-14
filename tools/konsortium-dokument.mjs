// Erzeugt das Dokument „Bausteine der Rückmeldungen" aus apps/shared/konsortium.js,
// auf Deutsch und auf Englisch.
//
// Warum erzeugt und nicht geschrieben: dieselben Daten stehen in der
// Rückmeldungsübersicht und in der Demoanwendung. Ein von Hand gepflegtes
// Dokument daneben wäre die vierte Stelle — und die erste, die veraltet, weil
// ihr niemand ansieht, dass sie es ist.
//
// Die erzeugten Dateien sind trotzdem eingecheckt: `tools/build-site.mjs`
// erwartet die Markdown-Dateien auf der Platte, und der Stand soll im Diff
// sichtbar sein statt erst im Deployment. `konsortium-dokument.test.mjs` prüft,
// dass beides zusammenpasst — wer die Daten ändert und `npm run konsortium:doc`
// vergisst, merkt es beim Testlauf und nicht beim Lesen.
//
// Die Daten führen jeden Text als `{ de, en }`. Was hier als Fließtext steht,
// steht deshalb in `TEXTE` in beiden Sprachen.
//
// Aufruf: node tools/konsortium-dokument.mjs  (bzw. npm run konsortium:doc)

import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BAUSTEINE, EINRICHTUNGEN, FAECHER, QUELLE, RUECKMELDUNGEN, STUFEN, ZIELGRUPPEN,
  nachSchichten, originaleZu, rueckmeldungenZu,
} from '../apps/shared/konsortium.js';

const ORDNER = join(dirname(fileURLToPath(import.meta.url)), '../apps/portal/dokumentation');
export const ZIEL = join(ORDNER, 'bausteine-der-rueckmeldungen.md');
export const ZIEL_EN = join(ORDNER, 'bausteine-der-rueckmeldungen.en.md');

const BILDER = join(ORDNER, 'bilder');

/** Bildunterschriften stehen in Anführungszeichen; darin keine weiteren. */
const titel = (text) => text.replace(/"/g, '“');

/** Tabellenzelle: Senkrechte kämen sonst als Spaltentrenner an. */
const zelle = (inhalt) => String(inhalt).replace(/\|/g, '\\|');

const verweis = (url, wort) => (url ? `[${wort}](${url})` : '—');

const TEXTE = {
  de: {
    datum: (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }),
    kopf: (datum) => `# Bausteine der Rückmeldungen

Elf Rückmeldungen, vier Einrichtungen, fünf Technologien — und immer wieder
dieselben Darstellungen unter anderen Namen. Dieses Dokument zieht heraus, was
sich davon nachnutzen lässt: nicht der Code, sondern der **Zuschnitt**. Welche
Darstellung beantwortet welche fachliche Frage, und woher nimmt sie ihre Daten?

Die Grundlage ist der Sachbericht der Abschlusssitzung der Steuergruppe vom ${datum},
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

Dieses Dokument wird aus \`apps/shared/konsortium.js\` erzeugt
(\`npm run konsortium:doc\`). Dieselben Daten tragen die
[Rückmeldungsübersicht](/beispiele) und den Reiter „Rückmeldeelemente" der
[Demoanwendung](/demo/?tab=elemente). Als Daten liegen sie unter
[/gemeinsam/konsortium.json](/gemeinsam/konsortium.json).
`,
    rueckmeldungen: (n) => `## Die ${n} Rückmeldungen`,
    spalten: '| Einrichtung | Rückmeldung | Zielgruppen | Fach | Klasse | Adressen |',
    fachunabhaengig: 'fachunabhängig',
    alle: 'alle',
    vorlaeufig: 'Was an diesen Verweisen vorläufig ist:',
    daten: 'Daten',
    bibliothek: 'Bibliothek',
    nochKeiner: 'noch keiner',
    gefundenBei: 'Gefunden bei',
    genanntVon: 'Genannt von',
    keinemBericht: 'keinem Sachbericht — der Baustein kommt aus der Bibliothek',
    original: 'Original',
    nachbauAlt: (el) => `Nachbau als <tba3-${el}>`,
    nachbau: (el) => `Nachbau: <tba3-${el}>, mit Beispieldaten`,
    bilanz: ({ gesamt, ausSachbericht, ausArtefakt, artefaktNamen, mehrfach, ohne, ohneNamen, nur, nurNamen }) => `## Bilanz

Der Katalog führt **${gesamt} Bausteine** in drei Schichten:
${ausSachbericht} aus den Sachberichten, ${ausArtefakt} aus den laufenden
Demos und ihrem Quelltext.

**Was erst die Erhebung am Artefakt gezeigt hat:**
${artefaktNamen}. Keiner davon steht in einem
Sachbericht — was nichts über ihren Wert sagt, aber alles darüber, wie
vollständig eine Projektzusammenfassung sein kann. Wer nur die Berichte liest,
übersieht ein Viertel dessen, was gebaut wurde.

**Was mindestens drei der vier Einrichtungen unabhängig voneinander gebaut haben:**
${mehrfach}. Das ist der belastbare Kern einer
Rückmeldung — wer eine neue baut, fängt hier an.

**Was noch kein Baustein in \`@tba3/bausteine\` ist** (${ohne} Einträge):
${ohneNamen}. Ein Teil davon ist keine
Visualisierung, sondern ein Rahmen und gehört auch nicht in eine
Visualisierungsbibliothek. Der Rest ist eine Liste offener Arbeit.

**Was die Bibliothek führt, ohne dass ein Sachbericht es nennt**
(${nur} Einträge): ${nurNamen}.
Das ist kein Vorwurf an die Berichte — sie beschreiben, was die Gruppen
gefordert haben, nicht alles, was auf dem Schirm steht. Aber es ist der Teil des
Katalogs, für den der Beleg fehlt, und das soll man sehen können.
`,
  },
  en: {
    datum: (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    kopf: (datum) => `# Building blocks of the reports

Eleven reports, four institutions, five technologies — and again and again the
same displays under different names. This document extracts what can be reused:
not the code, but the **design**. Which display answers which subject question,
and where does it get its data?

The basis is the progress report of the steering group's closing meeting on ${datum},
in which the four developing institutions brought their results together. The
reports are built with Vue 3 and Quasar, Vue 3 and Pinia, React 19 and
Material-UI, Angular 21 and ECharts, and vanilla JavaScript with Tabulator and
D3. That is exactly why no technology appears here: what five implementations
have in common is the statement, not the framework.

> **Every assignment names its evidence.** “Named by” means the institution
> described the building block itself. “Found at” means it was found in the
> running demo or the open source code — the progress reports are summaries and
> by no means name everything that was built. Whatever has neither does not
> appear here.

The survey at the artefact ran on 15 September 2026: all ten demos opened in the
browser, plus shallow clones of the four open repositories and a read through
their component directories. indibit's repository was not yet published; there
the source is the running application, whose Angular components are visible in
the DOM.

This document is generated from \`apps/shared/konsortium.js\`
(\`npm run konsortium:doc\`). The same data drives the
[report overview](/beispiele) and the “Report elements” tab of the
[demo application](/demo/?tab=elemente). As data they are at
[/gemeinsam/konsortium.json](/gemeinsam/konsortium.json).
`,
    rueckmeldungen: (n) => `## The ${n} reports`,
    spalten: '| Institution | Report | Audiences | Subject | Grade | Links |',
    fachunabhaengig: 'any subject',
    alle: 'all',
    vorlaeufig: 'What is provisional about these links:',
    daten: 'Data',
    bibliothek: 'Library',
    nochKeiner: 'none yet',
    gefundenBei: 'Found at',
    genanntVon: 'Named by',
    keinemBericht: 'no progress report — the building block comes from the library',
    original: 'Original',
    nachbauAlt: (el) => `Rebuilt as <tba3-${el}>`,
    nachbau: (el) => `Rebuild: <tba3-${el}>, with sample data`,
    bilanz: ({ gesamt, ausSachbericht, ausArtefakt, artefaktNamen, mehrfach, ohne, ohneNamen, nur, nurNamen }) => `## Summary

The catalogue lists **${gesamt} building blocks** in three layers:
${ausSachbericht} from the progress reports, ${ausArtefakt} from the running
demos and their source code.

**What only the survey at the artefact revealed:**
${artefaktNamen}. None of these appears in a
progress report — which says nothing about their value, but a lot about how
complete a project summary can be. Anyone who only reads the reports misses a
quarter of what was built.

**What at least three of the four institutions built independently:**
${mehrfach}. This is the reliable core of a
report — anyone building a new one starts here.

**What is not yet a building block in \`@tba3/bausteine\`** (${ohne} entries):
${ohneNamen}. Some of these are not
visualisations but frames, and do not belong in a visualisation library either.
The rest is a list of open work.

**What the library contains without any progress report naming it**
(${nur} entries): ${nurNamen}.
This is no criticism of the reports — they describe what the groups asked for,
not everything on screen. But it is the part of the catalogue that lacks
evidence, and that should be visible.
`,
  },
};

function erzeugen(sprache) {
  const T = TEXTE[sprache];
  const w = (paar) => paar?.[sprache] ?? paar?.de ?? '';

  const aufzaehlung = (werte, woerterbuch, leer) =>
    werte.length === 0 ? leer : werte.map((x) => w(woerterbuch[x])).join(', ');

  /** Die Einrichtungen, die einen Baustein nennen — jede einmal, in ihrer Reihenfolge. */
  const traeger = (bausteinId) => {
    const genannt = new Set(rueckmeldungenZu(bausteinId).map((r) => r.einrichtung));
    return Object.keys(EINRICHTUNGEN).filter((e) => genannt.has(e)).map((e) => w(EINRICHTUNGEN[e]));
  };

  /**
   * Das Original aus der Rückmeldung und der Nachbau aus der Bibliothek, je ein
   * Absatz und damit je eine Abbildung. Der Nachbau fehlt, solange
   * `npm run docs:bilder` ihn nicht aufgenommen hat — dann steht nur das Original.
   */
  const abbildungen = (b) => {
    const [original] = originaleZu(b.id);
    const bilder = [];
    if (original) {
      const r = original.rueckmeldung;
      bilder.push(`![${titel(w(original.alt))}](${original.datei} "${titel(`${T.original}: ${w(EINRICHTUNGEN[r.einrichtung])}, ${w(r.titel)}`)}")`);
    }
    if (b.element && existsSync(join(BILDER, `baustein-${b.element}-${sprache}.png`))) {
      bilder.push(`![${T.nachbauAlt(b.element)}](/dokumentation/bilder/baustein-${b.element}-${sprache}.png "${titel(T.nachbau(b.element))}")`);
    }
    return bilder.map((bild) => `\n${bild}\n`).join('');
  };

  const kopf = () => T.kopf(T.datum(new Date(QUELLE.datum)));

  const rueckmeldungen = () => {
    const zeilen = RUECKMELDUNGEN.map((r) => {
      // Drei Adressen in einer Spalte: als drei eigene blieben zwei davon meist
      // leer und die Tabelle würde nur breiter, ohne mehr zu sagen.
      const adressen = [
        verweis(r.demo, 'Demo'),
        verweis(r.code, 'Code'),
        verweis(r.doku, sprache === 'de' ? 'Doku' : 'Docs'),
      ].filter((a) => a !== '—').join(' · ');
      const felder = [
        w(EINRICHTUNGEN[r.einrichtung]),
        w(r.titel),
        aufzaehlung(r.zielgruppen, ZIELGRUPPEN, '—'),
        aufzaehlung(r.faecher, FAECHER, T.fachunabhaengig),
        aufzaehlung(r.stufen, STUFEN, T.alle),
        adressen,
      ];
      return `| ${felder.map(zelle).join(' | ')} |`;
    });

    const hinweise = RUECKMELDUNGEN.filter((r) => r.hinweis)
      .map((r) => `- **${w(r.titel)}** (${w(EINRICHTUNGEN[r.einrichtung])}): ${w(r.hinweis)}`);

    return `${T.rueckmeldungen(RUECKMELDUNGEN.length)}

${T.spalten}
|---|---|---|---|---|---|
${zeilen.join('\n')}

${T.vorlaeufig}

${hinweise.join('\n')}
`;
  };

  const schichten = () => nachSchichten().map(({ kurz, beschreibung, bausteine }) => {
    const eintraege = bausteine.map((b) => {
      const genannt = traeger(b.id);
      const angaben = [
        `*${T.daten}:* ${w(b.daten)}`,
        b.element ? `*${T.bibliothek}:* \`<tba3-${b.element}>\`` : `*${T.bibliothek}:* ${T.nochKeiner}`,
        genannt.length
          ? `*${b.beleg === 'artefakt' ? T.gefundenBei : T.genanntVon}:* ${genannt.join(', ')}`
          : `*${T.genanntVon}:* ${T.keinemBericht}`,
      ];
      return `### ${w(b.name)}\n\n${w(b.zweck)}\n\n${angaben.join(' · ')}\n${abbildungen(b)}`;
    });
    return `## ${w(kurz)}\n\n${w(beschreibung)}\n\n${eintraege.join('\n')}`;
  }).join('\n');

  const bilanz = () => {
    const ohneBibliothek = BAUSTEINE.filter((b) => !b.element);
    const nurBibliothek = BAUSTEINE.filter((b) => b.element && rueckmeldungenZu(b.id).length === 0);
    const ausArtefakt = BAUSTEINE.filter((b) => b.beleg === 'artefakt');
    return T.bilanz({
      gesamt: BAUSTEINE.length,
      ausSachbericht: BAUSTEINE.filter((b) => b.beleg === 'sachbericht').length,
      ausArtefakt: ausArtefakt.length,
      artefaktNamen: ausArtefakt.map((b) => w(b.name)).join(', '),
      mehrfach: BAUSTEINE.filter((b) => traeger(b.id).length >= 3).map((b) => w(b.name)).join(', '),
      ohne: ohneBibliothek.length,
      ohneNamen: ohneBibliothek.map((b) => w(b.name)).join(', '),
      nur: nurBibliothek.length,
      nurNamen: nurBibliothek.map((b) => w(b.name)).join(', '),
    });
  };

  return [kopf(), rueckmeldungen(), schichten(), bilanz()].join('\n');
}

export const dokument = (sprache = 'de') => erzeugen(sprache);

const direktAufgerufen = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (direktAufgerufen) {
  writeFileSync(ZIEL, dokument('de'));
  writeFileSync(ZIEL_EN, dokument('en'));
  console.log(`✓ ${RUECKMELDUNGEN.length} Rückmeldungen, ${BAUSTEINE.length} Bausteine → ${ZIEL} (+ .en.md)`);
}
