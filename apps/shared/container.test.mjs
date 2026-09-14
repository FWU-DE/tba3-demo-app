// Eine Spalte für die ganze Seite (apps/shared/container.css).
//
// Der Fehler, den diese Prüfungen fangen, ist unauffällig: ein Bereich bringt
// eigene Maße mit, und sein Inhalt springt gegenüber der Leiste darüber ein.
// Auf einem breiten Schirm sieht das nach Absicht aus — bis man die Kanten
// nebeneinanderlegt. Genau so standen Portal, Rückmeldungen und Dokumentation
// auf 1040px und der Katalog auf 1050 bzw. 1100, während die Leiste 1200
// hatte.

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = join(HIER, '..', '..');
const lies = (...teile) => readFileSync(join(WURZEL, ...teile), 'utf8');

const REGEL = lies('apps/shared/container.css');

// Jede Seite, die die Leiste trägt, muss in derselben Spalte stehen.
const SEITEN = [
  'apps/portal/index.html',
  'apps/portal/schnittstelle/index.html',
  'apps/beispiele/index.html',
  'apps/katalog/index.html',
];

describe('container.css', () => {
  it('führt die Maße genau einmal', () => {
    expect(REGEL).toMatch(/--breite:\s*1200px/);
    expect(REGEL).toMatch(/--rand:\s*20px/);
    // Auf dem Telefon ist der Rand schmaler — wie in der Leiste seit jeher
    expect(REGEL).toMatch(/@media \(max-width: 640px\)[\s\S]*--rand:\s*12px/);
  });

  it('gibt .wrap die Spalte, ohne eine zweite Zahl zu nennen', () => {
    const wrap = /\.wrap \{([^}]*)\}/.exec(REGEL)?.[1] ?? '';
    expect(wrap).toMatch(/max-width:\s*var\(--breite\)/);
    expect(wrap).toMatch(/padding-inline:\s*var\(--rand\)/);
    expect(wrap).not.toMatch(/\d{3,4}px/);
  });
});

describe('die Bereiche', () => {
  it.each(SEITEN)('%s bindet die gemeinsame Regel ein', (seite) => {
    expect(lies(seite)).toContain('href="/gemeinsam/container.css"');
  });

  it('die Dokumentseiten binden sie auch ein', async () => {
    const { DOKUMENTE, seite } = await import('../../tools/dokumente.mjs');
    const html = seite(DOKUMENTE[0], '# T\n\nText.\n', null);
    expect(html).toContain('href="/gemeinsam/container.css"');
  });

  it('die Leiste nimmt die Maße statt eigener Zahlen', () => {
    const leiste = lies('apps/shared/tba3-leiste.js');
    const regel = /\.leiste \{([^}]*)\}/.exec(leiste)?.[1] ?? '';
    expect(regel).toMatch(/max-width:\s*var\(--breite, 1200px\)/);
    expect(regel).toMatch(/padding:\s*0 var\(--rand, 20px\)/);
  });

  // Der eigentliche Wächter: Wer einen Bereich anlegt und ihm aus Gewohnheit
  // ein eigenes max-width gibt, merkt den Versatz zur Leiste nicht — der
  // fällt erst auf, wenn jemand die Kanten vergleicht.
  it('kein Bereich bringt eine eigene Containerbreite mit', () => {
    const verdaechtig = [];
    const pruefe = (pfad, inhalt) => {
      for (const [zeile, treffer] of inhalt.split('\n').entries()) {
        const m = /max-width:\s*(1[0-3]\d{2})px/.exec(treffer);
        if (m) verdaechtig.push(`${pfad}:${zeile + 1} → ${m[1]}px`);
      }
    };
    const durchsuche = (ordner) => {
      for (const eintrag of readdirSync(join(WURZEL, ordner), { withFileTypes: true })) {
        const pfad = `${ordner}/${eintrag.name}`;
        if (eintrag.isDirectory()) {
          if (!['node_modules', 'dist'].includes(eintrag.name)) durchsuche(pfad);
        } else if (/\.(html|css|vue|jsx?)$/.test(eintrag.name) && !eintrag.name.endsWith('.test.mjs')) {
          pruefe(pfad, lies(pfad));
        }
      }
    };
    durchsuche('apps');
    expect(verdaechtig, 'var(--breite) nehmen statt einer eigenen Zahl').toEqual([]);
  });
});
