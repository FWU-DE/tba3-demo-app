// Die erklärenden Dokumente der Spezifikation — Konzepte, Endpunkt-Referenz und
// Rezepte — liegen im Quell-Repository als Markdown. Statt dorthin zu verlinken,
// stehen sie hier als eingecheckte Kopie unter apps/portal/dokumentation/ und
// werden beim Build zu Seiten unter /dokumentation gerendert. Dasselbe Muster
// wie bei der OpenAPI-Spezifikation: die Seite hängt an nichts Externem, und
// `npm run docs:update` zieht den Stand nach — der Diff zeigt, was sich oben
// geändert hat.
//
// Diese Datei führt drei Dinge zusammen, die sonst auseinanderlaufen:
// das Verzeichnis der Dokumente, das Rendern und die Seitenvorlage.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked, Parser, Renderer } from 'marked';

export const QUELLE = { repo: 'indibit-eu/tba3', zweig: 'main', ordner: 'docs' };

// Nicht jedes Dokument kommt von oben. Ein Eintrag mit `eigen: true` wird hier
// geschrieben und gepflegt: `docs:update` fasst ihn nicht an, und die Seite sagt
// das auch, statt eine Herkunft zu behaupten, die es nicht gibt. Der Anlass war
// der Observer-Modus — der gehört zur Demoanwendung und nicht zur Schnittstelle,
// hätte in `rezepte.md` also beim nächsten Nachziehen nicht überlebt.
export const EIGENES = { repo: 'FWU-DE/tba3-demo-app', zweig: 'main', ordner: 'apps/portal/dokumentation' };

// Reihenfolge wie auf der Übersichtsseite: erst die Begriffe, dann die
// Endpunkte, dann die Anwendungsfälle.
export const DOKUMENTE = [
  {
    slug: 'konzepte',
    datei: 'konzepte.md',
    kurz: { de: 'Konzepte', en: 'Concepts' },
    beschreibung: {
      de: 'Lerngruppe, Bericht, Berichtselement — die Begriffe hinter der Schnittstelle und wie sie zusammenhängen.',
      en: 'Learning group, report, report element — the terms behind the API and how they fit together.',
    },
  },
  {
    slug: 'endpunkt-referenz',
    datei: 'endpunkt-referenz.md',
    kurz: { de: 'Endpunkt-Referenz', en: 'Endpoint reference' },
    beschreibung: {
      de: 'Konventionen für die offen gestalteten Teile der Spezifikation: Parameter, Typen und was eine Antwort enthält.',
      en: 'Conventions for the open parts of the specification: parameters, types and what a response contains.',
    },
  },
  {
    slug: 'rezepte',
    datei: 'rezepte.md',
    kurz: { de: 'Rezepte', en: 'Recipes' },
    beschreibung: {
      de: 'Wiederkehrende Aufgaben und wie man sie mit der Schnittstelle löst — mit Anfragen und Antworten.',
      en: 'Recurring tasks and how to solve them with the API — with requests and responses.',
    },
  },
  {
    slug: 'demo-rezepte',
    datei: 'demo-rezepte.md',
    eigen: true,
    kurz: { de: 'Rezepte der Demoanwendung', en: 'Demo application recipes' },
    beschreibung: {
      de: 'Was eine Oberfläche mit den Antworten macht: Namen verdecken, ohne die Ergebnisse zu verstecken, eine Rückmeldung erzeugen, die das Gerät verlässt — und der MCP-Pilot aus der Machbarkeitsstudie.',
      en: 'What a front end does with the responses: hiding names without hiding the results, producing a report that leaves the device — and the MCP pilot from the feasibility study.',
    },
  },
];

const hier = dirname(fileURLToPath(import.meta.url));
export const ORDNER = join(hier, '../apps/portal/dokumentation');

export const rohUrl = (dok) =>
  `https://raw.githubusercontent.com/${QUELLE.repo}/refs/heads/${QUELLE.zweig}/${QUELLE.ordner}/${dok.datei}`;
export const herkunft = (dok) => (dok.eigen ? EIGENES : QUELLE);
export const githubUrl = (dok) => {
  const h = herkunft(dok);
  return `https://github.com/${h.repo}/blob/${h.zweig}/${h.ordner}/${dok.datei}`;
};
export const seitenPfad = (dok) => `/dokumentation/${dok.slug}`;

/** Stand der Kopie, von tools/update-docs.mjs geschrieben. Fehlt er, wird er weggelassen. */
export const stand = () => {
  const datei = join(ORDNER, 'stand.json');
  if (!existsSync(datei)) return null;
  try {
    return JSON.parse(readFileSync(datei, 'utf8'));
  } catch {
    return null;
  }
};

const ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const schuetze = (text) => String(text).replace(/[&<>"']/g, (z) => ESCAPE[z]);

/**
 * Sprungmarke wie GitHub sie bildet: klein geschrieben, Satzzeichen weg,
 * Leerzeichen zu Bindestrichen. Umlaute bleiben stehen — die Dokumente
 * verlinken untereinander auf `#gruppierung-nach-domäne-wann-sinnvoll`,
 * und diese Verweise sollen hier genauso funktionieren wie dort.
 */
export const anker = (text) =>
  String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s/g, '-');

/** Verweise auf ein Nachbardokument (`konzepte.md`, `./rezepte.md#abschnitt`) zeigen hierher. */
export const lokalerVerweis = (href) => {
  const treffer = /^(?:\.\/)?([\w.-]+\.md)(#.*)?$/.exec(String(href));
  if (!treffer) return null;
  const dok = DOKUMENTE.find((d) => d.datei === treffer[1]);
  return dok ? `${seitenPfad(dok)}${treffer[2] ?? ''}` : null;
};

/**
 * Markdown → Seiteninhalt. Die erste Überschrift wird zum Titel der Seite und
 * steht deshalb nicht noch einmal im Text. Zurück kommen außerdem die
 * Zwischenüberschriften für die Gliederung am Rand.
 */
export function rendere(markdown) {
  const vergeben = new Map();
  const eindeutig = (roh) => {
    const basis = anker(roh) || 'abschnitt';
    const zahl = vergeben.get(basis) ?? 0;
    vergeben.set(basis, zahl + 1);
    return zahl === 0 ? basis : `${basis}-${zahl}`;
  };

  const gliederung = [];
  const renderer = new Renderer();

  renderer.heading = function ({ tokens, depth, text }) {
    const inhalt = this.parser.parseInline(tokens);
    const id = eindeutig(text);
    if (depth === 2 || depth === 3) gliederung.push({ tiefe: depth, id, inhalt });
    // Die Überschrift selbst ist der Anker — ein Klick auf das Zeichen daneben
    // kopiert die Adresse des Abschnitts.
    return `<h${depth} id="${schuetze(id)}">${inhalt}` +
      `<a class="sprungmarke" href="#${schuetze(id)}" aria-hidden="true" tabindex="-1">#</a>` +
      `</h${depth}>\n`;
  };

  renderer.link = function (token) {
    const ziel = lokalerVerweis(token.href);
    return Renderer.prototype.link.call(this, ziel ? { ...token, href: ziel } : token);
  };

  // Ein Bild, das allein in seinem Absatz steht, ist eine Abbildung und kein
  // Satzzeichen: es bekommt ein <figure>, und der Markdown-Titel
  // (`![alt](bild.png "Unterschrift")`) wird zur sichtbaren Bildunterschrift.
  // Ohne das stünde die Erklärung nur im title-Attribut — sichtbar allein für
  // den, der mit der Maus stehen bleibt, und für sonst niemanden.
  renderer.paragraph = function (token) {
    const kinder = token.tokens ?? [];
    const bild = kinder.length === 1 && kinder[0].type === 'image' ? kinder[0] : null;
    if (!bild) return Renderer.prototype.paragraph.call(this, token);
    return `<figure class="abbildung">` +
      `<img src="${schuetze(bild.href)}" alt="${schuetze(bild.text)}" loading="lazy" />` +
      (bild.title ? `<figcaption>${schuetze(bild.title)}</figcaption>` : '') +
      `</figure>\n`;
  };

  // Tabellen brauchen einen eigenen Rahmen: die Endpunkt-Referenz hat breite
  // Tabellen, die sonst das Layout auf dem Telefon auseinanderziehen.
  renderer.table = function (token) {
    return `<div class="tabelle">${Renderer.prototype.table.call(this, token)}</div>\n`;
  };

  const m = new Marked({ gfm: true, renderer });
  const tokens = m.lexer(markdown);
  const kopfIndex = tokens.findIndex((t) => t.type === 'heading' && t.depth === 1);
  const kopf = kopfIndex >= 0 ? tokens.splice(kopfIndex, 1)[0] : null;

  return {
    // Parser.parseInline und nicht m.parseInline: das eine nimmt die Token, die
    // hier schon vorliegen, das andere noch einmal Markdown als Text. Der Titel
    // darf Auszeichnung enthalten, roher Text wäre zu wenig.
    titel: kopf ? Parser.parseInline(kopf.tokens, m.defaults) : '',
    titelText: kopf ? kopf.text.replace(/[`*_]/g, '') : '',
    inhalt: m.parser(tokens),
    gliederung,
  };
}

const zweisprachig = (texte, klasse = '') => {
  const k = klasse ? ` class="${klasse}"` : '';
  return `<span${k} lang="de">${texte.de}</span><span${k} lang="en">${texte.en}</span>`;
};

const datumsText = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return {
    de: d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    en: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
};

const rahmen = ({ titel, beschreibung, koerper, klasse = '' }) => `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${schuetze(titel.de)}</title>
  <meta name="description" content="${schuetze(beschreibung.de)}" />
  <link rel="stylesheet" href="/gemeinsam/tokens.css" />
  <link rel="stylesheet" href="/gemeinsam/container.css" />
  <link rel="stylesheet" href="/dokumentation/dokument.css" />
</head>
<body${klasse ? ` class="${klasse}"` : ''}>

<tba3-leiste aktiv="dokumentation"></tba3-leiste>

${koerper}

<script type="module" src="/gemeinsam/tba3-leiste.js"></script>
<script type="module">
  // Titel und Beschreibung stehen in Attributen — die lassen sich nicht wie der
  // übrige Text über html[lang] umschalten.
  import { dokumentKopf } from '/gemeinsam/sprache.js';
  dokumentKopf({
    titel: ${JSON.stringify(titel)},
    beschreibung: ${JSON.stringify(beschreibung)},
  });
</script>

</body>
</html>
`;

/** Eine Dokumentseite: /dokumentation/<slug> */
export function seite(dok, markdown, standDaten = null) {
  const { titel, titelText, inhalt, gliederung } = rendere(markdown);
  const datum = datumsText(standDaten?.abgerufen);

  // Ein eigenes Dokument hat kein „abgerufen am“ — es entsteht hier. Die Zeile
  // darf das nicht verschweigen: wer etwas nachträgt, muss wissen, ob
  // `docs:update` seine Änderung beim nächsten Lauf wieder überschreibt.
  const woher = dok.eigen
    ? {
        de: `In diesem Repository geschrieben und gepflegt —
             <a href="${githubUrl(dok)}">${EIGENES.repo}</a>.
             <code>npm run docs:update</code> fasst dieses Dokument nicht an.`,
        en: `Written and maintained in this repository —
             <a href="${githubUrl(dok)}">${EIGENES.repo}</a>.
             <code>npm run docs:update</code> leaves this document alone.`,
      }
    : {
        de: `Kopie aus <a href="${githubUrl(dok)}">${QUELLE.repo}</a>${datum ? ` — Stand ${datum.de}` : ''}.
             Aktualisiert wird sie im Repository mit <code>npm run docs:update</code>.`,
        en: `A copy from <a href="${githubUrl(dok)}">${QUELLE.repo}</a>${datum ? ` — as of ${datum.en}` : ''}.
             It is updated in the repository with <code>npm run docs:update</code>.`,
      };

  const eintraege = gliederung
    .map((g) => `<li class="t${g.tiefe}"><a href="#${schuetze(g.id)}">${g.inhalt}</a></li>`)
    .join('\n        ');

  const koerper = `<main class="wrap dokument">

  <nav class="brotkrumen" aria-label="Pfad">
    <a href="/dokumentation">${zweisprachig({ de: 'Dokumentation', en: 'Documentation' })}</a>
    <span aria-hidden="true">/</span>
    <span>${dok.kurz.de}</span>
  </nav>

  <header class="dokument-kopf">
    <h1>${titel || dok.kurz.de}</h1>
    <p class="herkunft">
      ${zweisprachig(woher)}
      <span lang="en"><br />This document is maintained in German and shown here unchanged.</span>
    </p>
  </header>

  <div class="dokument-koerper">
    ${eintraege ? `<aside class="gliederung" aria-label="Inhalt">
      <h2>${zweisprachig({ de: 'Auf dieser Seite', en: 'On this page' })}</h2>
      <ul>
        ${eintraege}
      </ul>
    </aside>` : ''}

    <article class="inhalt">
${inhalt}
    </article>
  </div>

  <footer class="dokument-fuss">
    <a href="${githubUrl(dok)}">${zweisprachig(dok.eigen
      ? { de: 'Diese Seite auf GitHub', en: 'This page on GitHub' }
      : { de: 'Original auf GitHub', en: 'Original on GitHub' })}</a>
    <a href="/dokumentation/${dok.datei}">${zweisprachig({ de: 'Markdown dieser Seite', en: 'Markdown of this page' })}</a>
    <a href="/schnittstelle">${zweisprachig({ de: 'API-Referenz', en: 'API reference' })}</a>
  </footer>

</main>`;

  return rahmen({
    titel: {
      de: `${titelText || dok.kurz.de} — TBA3`,
      en: `${titelText || dok.kurz.en} — TBA3`,
    },
    beschreibung: dok.beschreibung,
    koerper,
  });
}

/** Die Übersicht: /dokumentation */
export function uebersicht(dokumente, standDaten = null) {
  const datum = datumsText(standDaten?.abgerufen);
  const karten = dokumente
    .map((dok) => `
    <a class="karte" href="${seitenPfad(dok)}">
      <p class="quelle">${zweisprachig(dok.eigen
        ? { de: 'Zu dieser Seite', en: 'Part of this site' }
        : { de: `Kopie aus ${QUELLE.repo}`, en: `A copy from ${QUELLE.repo}` })}</p>
      <h2>${zweisprachig(dok.kurz)}</h2>
      <p>${zweisprachig(dok.beschreibung)}</p>
      <span class="fuss">${zweisprachig({ de: 'Lesen →', en: 'Read →' })}</span>
    </a>`)
    .join('\n');

  const koerper = `<main class="wrap uebersicht">

  <header class="uebersicht-kopf">
    <h1>${zweisprachig({ de: 'Dokumentation', en: 'Documentation' })}</h1>
    <p>${zweisprachig({
      de: `Die erklärenden Texte zur Auswertungsschnittstelle — hier zu lesen, nicht erst auf GitHub.
           Die meisten stammen aus <a href="https://github.com/${QUELLE.repo}">${QUELLE.repo}</a> und liegen in
           dieser Seite als Kopie${datum ? ` (Stand ${datum.de})` : ''}; was die Demoanwendung selbst betrifft,
           wird hier gepflegt. Jede Karte sagt, woher ihr Text kommt. Die Endpunkte selbst stehen in der
           <a href="/schnittstelle">API-Referenz</a>.`,
      en: `The explanatory texts on the reporting API — readable here, not only on GitHub.
           Most come from <a href="https://github.com/${QUELLE.repo}">${QUELLE.repo}</a> and are kept in this
           site as a copy${datum ? ` (as of ${datum.en})` : ''}; what concerns the demo application itself is
           maintained here. Each card says where its text comes from. The endpoints themselves are in the
           <a href="/schnittstelle">API reference</a>. The documents are written in German.`,
    })}</p>
  </header>

  <div class="karten">${karten}
  </div>

</main>`;

  return rahmen({
    titel: { de: 'TBA3 — Dokumentation', en: 'TBA3 — documentation' },
    beschreibung: {
      de: 'Konzepte, Endpunkt-Referenz und Rezepte zur TBA3-Auswertungsschnittstelle — und die Rezepte der Demoanwendung.',
      en: 'Concepts, endpoint reference and recipes for the TBA3 reporting API — and the demo application recipes.',
    },
    koerper,
    klasse: 'seite-uebersicht',
  });
}
