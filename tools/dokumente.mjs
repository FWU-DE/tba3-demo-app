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
    zielgruppe: 'technik',
    datei: 'konzepte.md',
    kurz: { de: 'Konzepte', en: 'Concepts' },
    beschreibung: {
      de: 'Lerngruppe, Bericht, Berichtselement — die Begriffe hinter der Schnittstelle und wie sie zusammenhängen.',
      en: 'Learning group, report, report element — the terms behind the API and how they fit together.',
    },
  },
  {
    slug: 'endpunkt-referenz',
    zielgruppe: 'technik',
    datei: 'endpunkt-referenz.md',
    kurz: { de: 'Endpunkt-Referenz', en: 'Endpoint reference' },
    beschreibung: {
      de: 'Konventionen für die offen gestalteten Teile der Spezifikation: Parameter, Typen und was eine Antwort enthält.',
      en: 'Conventions for the open parts of the specification: parameters, types and what a response contains.',
    },
  },
  {
    slug: 'rezepte',
    zielgruppe: 'technik',
    datei: 'rezepte.md',
    kurz: { de: 'Rezepte', en: 'Recipes' },
    beschreibung: {
      de: 'Wiederkehrende Aufgaben und wie man sie mit der Schnittstelle löst — mit Anfragen und Antworten.',
      en: 'Recurring tasks and how to solve them with the API — with requests and responses.',
    },
  },
  {
    slug: 'bausteine-der-rueckmeldungen',
    zielgruppe: 'alle',
    datei: 'bausteine-der-rueckmeldungen.md',
    eigen: true,
    // Erzeugt aus apps/shared/konsortium.js (`npm run konsortium:doc`), nicht
    // von Hand geschrieben — deshalb steht die Datei zwar hier, ist aber keine
    // Quelle, sondern ein Ergebnis.
    kurz: { de: 'Bausteine der Rückmeldungen', en: 'Building blocks of the reports' },
    beschreibung: {
      de: 'Was elf Rückmeldungen aus vier Einrichtungen gemeinsam haben, technologieagnostisch herausgezogen: Anzeigebausteine, Rückmeldeelemente und der Rahmen drumherum.',
      en: 'What eleven reports from four institutions have in common, extracted independently of technology: display blocks, report elements and the frame around them.',
    },
  },
  {
    slug: 'demo-rezepte',
    zielgruppe: 'technik',
    datei: 'demo-rezepte.md',
    eigen: true,
    kurz: { de: 'Rezepte der Demoanwendung', en: 'Demo application recipes' },
    beschreibung: {
      de: 'Was eine Oberfläche mit den Antworten macht: Namen verdecken, ohne die Ergebnisse zu verstecken, eine Rückmeldung erzeugen, die das Gerät verlässt — und der MCP-Pilot aus der Machbarkeitsstudie.',
      en: 'What a front end does with the responses: hiding names without hiding the results, producing a report that leaves the device — and the MCP pilot from the feasibility study.',
    },
  },
  {
    slug: 'machbarkeitsstudie',
    zielgruppe: 'alle',
    datei: 'machbarkeitsstudie.md',
    englisch: 'machbarkeitsstudie.en.md',
    eigen: true,
    kurz: { de: 'Machbarkeitsstudie', en: 'Feasibility study' },
    beschreibung: {
      de: 'Teilkonzepte für das, was über die Schnittstelle hinausgeht — je eine Seite: was der Prototyp tut, was technisch geht und was es im Unterricht bringt.',
      en: 'Sub-concepts for what goes beyond the API — one page each: what the prototype does, what is technically possible and what it is worth in the classroom.',
    },
  },
  {
    slug: 'machbarkeitsstudie-mediatheken',
    datei: 'machbarkeitsstudie-mediatheken.md',
    englisch: 'machbarkeitsstudie-mediatheken.en.md',
    eigen: true,
    teil: 'machbarkeitsstudie',
    kurz: { de: 'Mediatheken einbinden', en: 'Integrating media libraries' },
    beschreibung: {
      de: 'MUNDO über LTI an die Demoanwendung angebunden: technisch machbar, aber ohne gemeinsame Metadaten keine Suche von der Rückmeldung aus — und was MEM dazwischen leisten kann.',
      en: 'MUNDO connected to the demo application via LTI: technically feasible, but without shared metadata there is no search starting from the report — and what MEM can contribute in between.',
    },
  },
  {
    slug: 'machbarkeitsstudie-lms-export',
    datei: 'machbarkeitsstudie-lms-export.md',
    englisch: 'machbarkeitsstudie-lms-export.en.md',
    eigen: true,
    teil: 'machbarkeitsstudie',
    kurz: { de: 'Materialsammlung an das LMS', en: 'Material collection to the LMS' },
    beschreibung: {
      de: 'Material zu einer Rückmeldung sammeln und als Common Cartridge an die Lernplattform oder als PDF aufs Papier geben — mit dem Import in Moodle und dem, was dabei auffiel.',
      en: 'Collecting material for a report and handing it to the learning platform as a Common Cartridge or to paper as a PDF — with the import into Moodle and what it revealed.',
    },
  },
  {
    slug: 'machbarkeitsstudie-ergebnisse-weitergeben',
    datei: 'machbarkeitsstudie-ergebnisse-weitergeben.md',
    englisch: 'machbarkeitsstudie-ergebnisse-weitergeben.en.md',
    eigen: true,
    teil: 'machbarkeitsstudie',
    kurz: { de: 'Ergebnisdaten übergeben', en: 'Handing over result data' },
    beschreibung: {
      de: 'Konzeptentwurf: Ergebnisse einer Rückmeldung an ein Lernsystem übergeben, am Beispiel AIS.schule — welche Daten, welche Wege, was auf beiden Seiten fehlt.',
      en: 'Concept draft: handing a report’s results to a learning system, using AIS.schule as the example — which data, which routes, what is missing on both sides.',
    },
  },
];

// Ein Eintrag mit `teil` ist eine Unterseite: er steht nicht als eigene Karte
// auf der Übersicht, sondern wird von seiner Landeseite aus verlinkt, und der
// Pfad oben auf der Seite führt über sie zurück. Die Adresse bleibt flach
// (/dokumentation/<slug>), damit Querverweise wie bei allen anderen funktionieren.
// Ein Eintrag mit `englisch` bringt eine zweite Datei mit. Beide Fassungen
// stehen dann in derselben Seite und werden über html[lang] umgeschaltet, wie
// überall sonst auf der Seite. Die Kopien von oben haben keine — dort bleibt
// der Hinweis, dass das Dokument nur auf Deutsch gepflegt wird.
// Zwei Zielgruppen lesen hier mit: Ministerien und Institute ohne
// Technikkenntnisse und Entwickler:innen. Jede Karte und jede Seite sagt, für
// wen sie geschrieben ist. Unterseiten erben die Zielgruppe ihrer Landeseite.
export const ZIELGRUPPEN = {
  alle: { de: 'Ohne Technikkenntnisse', en: 'No technical background needed' },
  technik: { de: 'Für Entwickler:innen', en: 'For developers' },
};
export const zielgruppeVon = (dok) =>
  dok.zielgruppe ?? DOKUMENTE.find((d) => d.slug === dok.teil)?.zielgruppe ?? 'technik';
const zielgruppenMarke = (dok) => {
  const z = zielgruppeVon(dok);
  return `<span class="zielgruppe zielgruppe-${z}">${zweisprachig(ZIELGRUPPEN[z])}</span>`;
};

export const oberseite = (dok) => (dok.teil ? DOKUMENTE.find((d) => d.slug === dok.teil) : null);

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
export function seite(dok, markdown, standDaten = null, markdownEn = null) {
  const { titel, titelText, inhalt, gliederung } = rendere(markdown);
  const en = markdownEn ? rendere(markdownEn) : null;
  const datum = datumsText(standDaten?.abgerufen);
  const oben = oberseite(dok);

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

  const liste = (punkte, sprache = null) => punkte
    .map((g) => `<li class="t${g.tiefe}"${sprache ? ` lang="${sprache}"` : ''}><a href="#${schuetze(g.id)}">${g.inhalt}</a></li>`)
    .join('\n        ');
  const eintraege = en
    ? [liste(gliederung, 'de'), liste(en.gliederung, 'en')].filter(Boolean).join('\n        ')
    : liste(gliederung);

  const koerper = `<main class="wrap dokument">

  <nav class="brotkrumen" aria-label="Pfad">
    <a href="/dokumentation">${zweisprachig({ de: 'Dokumentation', en: 'Documentation' })}</a>
    <span aria-hidden="true">/</span>${oben ? `
    <a href="${seitenPfad(oben)}">${zweisprachig(oben.kurz)}</a>
    <span aria-hidden="true">/</span>` : ''}
    <span>${zweisprachig(dok.kurz)}</span>
  </nav>

  <header class="dokument-kopf">
    ${zielgruppenMarke(dok)}
    ${en
      ? `<h1><span lang="de">${titel || dok.kurz.de}</span><span lang="en">${en.titel || dok.kurz.en}</span></h1>`
      : `<h1>${titel || dok.kurz.de}</h1>`}
    <p class="herkunft">
      ${zweisprachig(woher)}${en ? '' : `
      <span lang="en"><br />This document is maintained in German and shown here unchanged.</span>`}
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
${en ? `<div lang="de">\n${inhalt}</div>\n<div lang="en">\n${en.inhalt}</div>` : inhalt}
    </article>
  </div>

  <footer class="dokument-fuss">
    <a href="${githubUrl(dok)}">${zweisprachig(dok.eigen
      ? { de: 'Diese Seite auf GitHub', en: 'This page on GitHub' }
      : { de: 'Original auf GitHub', en: 'Original on GitHub' })}</a>
    <a href="/dokumentation/${dok.datei}"${en ? ' lang="de"' : ''}>${en ? 'Markdown dieser Seite' : zweisprachig({ de: 'Markdown dieser Seite', en: 'Markdown of this page' })}</a>${en ? `
    <a href="/dokumentation/${dok.englisch}" lang="en">Markdown of this page</a>` : ''}
    <a href="/schnittstelle">${zweisprachig({ de: 'API-Referenz', en: 'API reference' })}</a>
  </footer>

</main>`;

  return rahmen({
    titel: {
      de: `${titelText || dok.kurz.de} — TBA3`,
      en: `${en?.titelText || titelText || dok.kurz.en} — TBA3`,
    },
    beschreibung: dok.beschreibung,
    koerper,
  });
}

/** Die Übersicht: /dokumentation */
export function uebersicht(dokumente, standDaten = null) {
  const datum = datumsText(standDaten?.abgerufen);
  const karten = dokumente
    .filter((dok) => !dok.teil)
    .map((dok) => `
    <a class="karte" href="${seitenPfad(dok)}">
      ${zielgruppenMarke(dok)}
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
