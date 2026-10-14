// Die Dokumentseiten unter /dokumentation entstehen beim Build aus den
// eingecheckten Markdown-Kopien (tools/dokumente.mjs). Geprüft wird hier
// zweierlei: das Rendern selbst an kleinen Beispielen, und die echten Kopien —
// denn die ändern sich mit `npm run docs:update`, und ein Verweis, der danach
// ins Leere zeigt, fiele sonst erst im Browser auf.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DOKUMENTE, ORDNER, anker, githubUrl, lokalerVerweis, oberseite, rendere, seite, uebersicht, zielgruppeVon } from './dokumente.mjs';

const ankerIn = (html) => [...html.matchAll(/<h[1-6] id="([^"]+)"/g)].map((m) => m[1]);

describe('rendere', () => {
  it('nimmt die erste Überschrift als Titel heraus, mit Auszeichnung', () => {
    const { titel, titelText, inhalt } = rendere('# Der `Bericht`\n\nText.\n');
    expect(titel).toBe('Der <code>Bericht</code>');
    // Für <title> und die Brotkrumen, wo kein Markup hingehört
    expect(titelText).toBe('Der Bericht');
    // Der Titel steht im Seitenkopf — noch einmal im Text wäre er doppelt
    expect(inhalt).not.toContain('<h1');
    expect(inhalt).toContain('<p>Text.</p>');
  });

  it('gibt Zwischenüberschriften als Gliederung zurück, h4 aufwärts nicht', () => {
    const { gliederung } = rendere('# T\n\n## Eins\n\n### Zwei\n\n#### Drei\n');
    expect(gliederung).toEqual([
      { tiefe: 2, id: 'eins', inhalt: 'Eins' },
      { tiefe: 3, id: 'zwei', inhalt: 'Zwei' },
    ]);
  });

  it('bildet Sprungmarken wie GitHub — Umlaute bleiben, Satzzeichen fallen', () => {
    // Die Dokumente verlinken untereinander auf genau diese Form
    expect(anker('Gruppierung nach Domäne: wann sinnvoll?')).toBe('gruppierung-nach-domäne-wann-sinnvoll');
    expect(anker('Umgang mit Kovariaten auf Schüler- und Gruppenebene'))
      .toBe('umgang-mit-kovariaten-auf-schüler--und-gruppenebene');
  });

  it('hält Sprungmarken eindeutig, wenn eine Überschrift zweimal vorkommt', () => {
    const { inhalt } = rendere('# T\n\n## Beispiel\n\n## Beispiel\n');
    expect(ankerIn(inhalt)).toEqual(['beispiel', 'beispiel-1']);
  });

  it('leitet Verweise auf Nachbardokumente auf die Seiten hier um', () => {
    const { inhalt } = rendere('# T\n\n[a](konzepte.md) [b](./rezepte.md#x) [c](https://example.org/y.md)\n');
    expect(inhalt).toContain('href="/dokumentation/konzepte"');
    expect(inhalt).toContain('href="/dokumentation/rezepte#x"');
    // Was nicht hier liegt, bleibt der externe Link, der es ist
    expect(inhalt).toContain('href="https://example.org/y.md"');
  });

  it('lässt ein Markdown in Ruhe, das hier nicht geführt wird', () => {
    expect(lokalerVerweis('README.md')).toBeNull();
    expect(lokalerVerweis('konzepte.md')).toBe('/dokumentation/konzepte');
  });

  it('macht aus einem Bild, das allein im Absatz steht, eine Abbildung mit Unterschrift', () => {
    const { inhalt } = rendere('# T\n\n![Die Liste](/dokumentation/bilder/x.png "So sieht sie aus.")\n');
    expect(inhalt).toContain('<figure class="abbildung">');
    expect(inhalt).toContain('alt="Die Liste"');
    // Der Titel wird zur sichtbaren Unterschrift, nicht zu einem title-Attribut,
    // das nur sieht, wer mit der Maus stehen bleibt
    expect(inhalt).toContain('<figcaption>So sieht sie aus.</figcaption>');
    expect(inhalt).not.toContain('<p><img');
  });

  it('lässt ein Bild mitten im Satz ein Bild mitten im Satz', () => {
    const { inhalt } = rendere('# T\n\nText mit ![einem](/y.png) Bild darin.\n');
    expect(inhalt).toContain('<p>Text mit <img');
    expect(inhalt).not.toContain('<figure');
  });

  it('rahmt Tabellen ein — sonst ziehen die breiten das Telefon auseinander', () => {
    const { inhalt } = rendere('# T\n\n| a | b |\n| - | - |\n| 1 | 2 |\n');
    expect(inhalt).toContain('<div class="tabelle"><table>');
  });
});

// Ein Dokument kann eine englische Fassung mitbringen. Alles, was für die
// deutsche Datei gilt — Überschrift, Verweise, Anker, Bilder —, gilt für sie
// genauso; ein Verweis, der nur auf Englisch ins Leere zeigt, ist derselbe Fehler.
const dateienVon = (dok) => [dok.datei, dok.englisch].filter(Boolean);
const ALLE_DATEIEN = DOKUMENTE.flatMap((dok) => dateienVon(dok).map((datei) => ({ dok, datei })));

describe('die eingecheckten Kopien', () => {
  it.each(ALLE_DATEIEN.map(({ datei }) => ({ datei })))('$datei liegt vor und trägt eine Überschrift', ({ datei: name }) => {
    const datei = join(ORDNER, name);
    expect(existsSync(datei), `${name} fehlt — \`npm run docs:update\``).toBe(true);
    expect(readFileSync(datei, 'utf8').trimStart().startsWith('# ')).toBe(true);
  });

  // Der eigentliche Grund für diesen Test: die Kopien kommen von oben. Ändert
  // sich dort eine Überschrift, zeigt ein Verweis aus einem anderen Dokument
  // danach ins Leere — und zwar leise, weil ein falscher Anker kein 404 ist.
  it('jeder Verweis zwischen den Dokumenten trifft einen Abschnitt', () => {
    const sprungmarken = new Map();
    const verweise = [];
    for (const { dok, datei } of ALLE_DATEIEN) {
      const markdown = readFileSync(join(ORDNER, datei), 'utf8');
      const pfad = `/dokumentation/${dok.slug}`;
      // Beide Fassungen stehen auf derselben Seite, ihre Anker also auch.
      const bisher = sprungmarken.get(pfad) ?? new Set();
      sprungmarken.set(pfad, new Set([...bisher, ...ankerIn(rendere(markdown).inhalt)]));
      for (const [, href] of markdown.matchAll(/\]\(([^)]+)\)/g)) {
        const ziel = lokalerVerweis(href);
        if (ziel) verweise.push({ von: datei, ziel });
      }
    }
    expect(verweise.length).toBeGreaterThan(0);
    for (const { von, ziel } of verweise) {
      const [pfad, marke] = ziel.split('#');
      expect(sprungmarken.has(pfad), `${von} → ${ziel}`).toBe(true);
      if (marke) expect(sprungmarken.get(pfad).has(marke), `${von} → ${ziel}`).toBe(true);
    }
  });

  // Ein Bild, das fehlt oder relativ verlinkt ist, ist im Deployment ein leerer
  // Rahmen. Relativ wäre besonders tückisch: die Seite liegt unter
  // /dokumentation/<slug>/, `bilder/x.png` zeigte also ein Verzeichnis zu tief.
  it('jedes Bild liegt vor und ist absolut verlinkt', () => {
    const bilder = [];
    for (const { datei } of ALLE_DATEIEN) {
      const markdown = readFileSync(join(ORDNER, datei), 'utf8');
      for (const [, quelle] of markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
        if (/^https?:/.test(quelle)) continue;
        bilder.push({ von: datei, quelle });
      }
    }
    for (const { von, quelle } of bilder) {
      expect(quelle.startsWith('/dokumentation/'), `${von} → ${quelle}`).toBe(true);
      const datei = join(ORDNER, quelle.replace('/dokumentation/', ''));
      expect(existsSync(datei), `${von} → ${quelle} fehlt`).toBe(true);
    }
  });

  it('jedes Dokument zeigt auf das Repository, in dem es gepflegt wird', () => {
    for (const dok of DOKUMENTE) {
      expect(githubUrl(dok), dok.datei).toContain(
        dok.eigen ? 'FWU-DE/tba3-demo-app' : 'indibit-eu/tba3',
      );
    }
  });

  it('kein Verweis auf ein Markdown, das hier nicht liegt', () => {
    const unbekannt = new Set();
    for (const { datei } of ALLE_DATEIEN) {
      const markdown = readFileSync(join(ORDNER, datei), 'utf8');
      for (const [, href] of markdown.matchAll(/\]\(([^)]+)\)/g)) {
        if (/^(?:\.\/)?[\w.-]+\.md(#|$)/.test(href) && !lokalerVerweis(href)) unbekannt.add(href);
      }
    }
    expect([...unbekannt], 'in DOKUMENTE aufnehmen oder als externen Link schreiben').toEqual([]);
  });
});

describe('die Seiten', () => {
  const markdown = '# Titel\n\n## Abschnitt\n\nText.\n';

  it('trägt Leiste, Gliederung und den Weg zurück zum Original', () => {
    const html = seite(DOKUMENTE[0], markdown, { abgerufen: '2026-09-14' });
    expect(html).toContain('<tba3-leiste aktiv="dokumentation">');
    expect(html).toContain('href="#abschnitt"');
    expect(html).toContain('href="https://github.com/indibit-eu/tba3/blob/main/docs/konzepte.md"');
    expect(html).toContain('href="/dokumentation/konzepte.md"');
    expect(html).toContain('14.09.2026');
  });

  it('sagt bei einem eigenen Dokument, dass docs:update es nicht anfasst', () => {
    const eigen = DOKUMENTE.find((d) => d.eigen);
    expect(eigen, 'kein eigenes Dokument in DOKUMENTE').toBeTruthy();
    const html = seite(eigen, markdown, { abgerufen: '2026-09-14' });
    // Der Verweis zeigt hierher, nicht ins Spezifikations-Repository
    expect(html).toContain(`href="https://github.com/FWU-DE/tba3-demo-app/blob/main/apps/portal/dokumentation/${eigen.datei}"`);
    expect(html).not.toContain('indibit-eu/tba3');
    expect(html).toContain('fasst dieses Dokument nicht an');
    // Ein „Stand“ wäre gelogen: das Dokument wird hier geschrieben, nicht geholt
    expect(html).not.toContain('14.09.2026');
  });

  it('kommt ohne Stand aus — dann steht eben kein Datum da', () => {
    const html = seite(DOKUMENTE[0], markdown, null);
    expect(html).not.toContain('Stand ');
    expect(html).toContain('<h1>Titel</h1>');
  });

  it('führt auf der Übersicht jedes Dokument in beiden Sprachen', () => {
    const html = uebersicht(DOKUMENTE, null);
    for (const dok of DOKUMENTE.filter((d) => !d.teil)) {
      expect(html).toContain(`href="/dokumentation/${dok.slug}"`);
      expect(html).toContain(dok.kurz.de);
      expect(html).toContain(dok.kurz.en);
    }
  });

  // Eine Unterseite hat keine eigene Karte. Gefunden wird sie nur über ihre
  // Landeseite — verlinkt die das nicht, ist die Seite gebaut, aber unerreichbar.
  // Zwei Zielgruppen lesen mit; jede Karte sagt, für wen sie ist.
  it('markiert jede Karte und jede Seite mit ihrer Zielgruppe', () => {
    const html = uebersicht(DOKUMENTE, null);
    const karten = DOKUMENTE.filter((d) => !d.teil);
    expect(html.match(/class="zielgruppe zielgruppe-/g)).toHaveLength(karten.length);
    expect(html).toContain('Ohne Technikkenntnisse');
    expect(html).toContain('Für Entwickler:innen');
    for (const dok of DOKUMENTE) {
      expect(['alle', 'technik']).toContain(zielgruppeVon(dok));
      expect(seite(dok, '# T\n', null)).toContain(`zielgruppe-${zielgruppeVon(dok)}`);
    }
    const unter = DOKUMENTE.find((d) => d.teil);
    expect(zielgruppeVon(unter)).toBe(zielgruppeVon(oberseite(unter)));
  });

  it('erreicht jede Unterseite über ihre Landeseite, nicht über eine eigene Karte', () => {
    const unterseiten = DOKUMENTE.filter((d) => d.teil);
    expect(unterseiten.length).toBeGreaterThan(0);
    const html = uebersicht(DOKUMENTE, null);
    for (const dok of unterseiten) {
      const oben = oberseite(dok);
      expect(oben, `${dok.slug}: teil „${dok.teil}“ steht nicht in DOKUMENTE`).toBeTruthy();
      expect(oben.teil, 'nur eine Ebene tief').toBeUndefined();
      expect(html).not.toContain(`href="/dokumentation/${dok.slug}"`);
      for (const datei of dateienVon(oben)) {
        const landeseite = readFileSync(join(ORDNER, datei), 'utf8');
        expect(landeseite, `${datei} verlinkt ${dok.datei} nicht`).toContain(`](${dok.datei}`);
      }
    }
  });

  // Zwei Fassungen auf einer Seite: html[lang] blendet die eine aus. Jede
  // Überschrift bleibt dabei ein Anker — zweimal dieselbe id, und der Sprung
  // landet in der Fassung, die gerade unsichtbar ist.
  it('setzt eine englische Fassung daneben, umschaltbar und ohne doppelte Anker', () => {
    const dok = DOKUMENTE.find((d) => d.englisch);
    expect(dok, 'kein Dokument mit englischer Fassung').toBeTruthy();
    const html = seite(dok, readFileSync(join(ORDNER, dok.datei), 'utf8'), null,
      readFileSync(join(ORDNER, dok.englisch), 'utf8'));
    expect(html).toMatch(/<div lang="de">[\s\S]*<div lang="en">/);
    expect(html).not.toContain('maintained in German and shown here unchanged');
    expect(html).toContain(`href="/dokumentation/${dok.englisch}"`);
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it('sagt bei einem Dokument ohne englische Fassung, dass es nur deutsch gepflegt wird', () => {
    const dok = DOKUMENTE.find((d) => !d.englisch);
    const html = seite(dok, '# Titel\n', null);
    expect(html).toContain('maintained in German and shown here unchanged');
  });

  it('führt den Pfad einer Unterseite über ihre Landeseite zurück', () => {
    const dok = DOKUMENTE.find((d) => d.teil);
    const html = seite(dok, '# Titel\n', null);
    const pfad = html.slice(html.indexOf('class="brotkrumen"'), html.indexOf('</nav>'));
    expect(pfad).toContain('href="/dokumentation"');
    expect(pfad).toContain(`href="/dokumentation/${dok.teil}"`);
  });

  it('schreibt auf jede Karte, woher ihr Text kommt', () => {
    const html = uebersicht(DOKUMENTE, null);
    expect(html).toContain('Kopie aus indibit-eu/tba3');
    expect(html).toContain('Zu dieser Seite');
    // Die Klasse gehört auf das <p>, nicht auf die Sprach-<span>s: sonst
    // schlägt `.karten .karte .quelle` die Regel, die eine Sprache ausblendet.
    expect(html).toContain('<p class="quelle"><span lang="de">');
  });
});
