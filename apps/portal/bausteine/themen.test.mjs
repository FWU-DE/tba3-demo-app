// Die Beispiel-Themen des Demonstrators gegen dieselbe Rechnung halten, die
// auch für die Vorgaben der Bibliothek gilt.
//
// Der Demonstrator ist das Versprechen der Bausteine in Kurzform: derselbe
// Quelltext, vier Anmutungen. Ein Thema, in dem eine Beschriftung nicht mehr
// lesbar ist, macht aus dem Versprechen eine Falle — und zwar genau für die
// Länder, die sich hier bedienen sollen.
//
// Gelesen wird aus `index.html`, nicht aus einer zweiten Liste: was die Seite
// zeigt, wird geprüft, und nicht eine Kopie davon.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { PAARE, SCHWELLE, pruefeThema } from '../../../packages/bausteine/kern/kontrast.js';

const HIER = dirname(fileURLToPath(import.meta.url));
const SEITE = readFileSync(join(HIER, 'index.html'), 'utf8');

/**
 * Welches Thema hell und welches dunkel ist, steht nicht im CSS — und der
 * Grund der Seite auch nicht, der kommt aus `/gemeinsam/tokens.css`. Beides
 * gehört zur Prüfung, deshalb steht es hier.
 */
const THEMEN = [
  { klasse: 'thema-fwu', name: 'FWU / VIDIS', modus: 'hell', grund: '#ffffff' },
  { klasse: null, name: 'neutral (Vorgabe, hell)', modus: 'hell', grund: '#ffffff' },
  { klasse: null, name: 'neutral (Vorgabe, dunkel)', modus: 'dunkel', grund: '#16181d' },
  { klasse: 'thema-hoher-kontrast', name: 'hoher Kontrast', modus: 'hell', grund: '#ffffff' },
  { klasse: 'thema-dunkel', name: 'dunkel', modus: 'dunkel', grund: '#16181d' },
];

/** Die `--tba3-*`-Zuweisungen einer Klasse aus dem Stilblock der Seite. */
function werteVon(klasse) {
  if (!klasse) return {};
  const block = SEITE.match(new RegExp(`\\.${klasse}\\s*\\{([^}]*)\\}`));
  if (!block) throw new Error(`Kein Block für .${klasse} in index.html`);
  return Object.fromEntries(
    [...block[1].matchAll(/--tba3-([a-z0-9-]+)\s*:\s*([^;]+);/g)].map((t) => [t[1], t[2].trim()]),
  );
}

describe('Die Beispiel-Themen des Demonstrators', () => {
  it('findet jedes Thema des Auswahlfelds im Stilblock', () => {
    const angeboten = [...SEITE.matchAll(/<option value="(thema-[a-z-]*)">/g)].map((t) => t[1]);
    for (const klasse of angeboten) {
      expect(SEITE, `.${klasse} fehlt`).toMatch(new RegExp(`\\.${klasse}\\s*\\{`));
    }
    // Und umgekehrt: kein Thema im Stilblock, das niemand wählen kann.
    const definiert = [...SEITE.matchAll(/\.(thema-[a-z-]+)\s*\{/g)].map((t) => t[1]);
    expect([...new Set(definiert)].sort()).toEqual([...new Set(angeboten)].sort());
  });

  for (const thema of THEMEN) {
    it(`hält im Thema „${thema.name}" jede Beschriftung lesbar`, () => {
      const befunde = pruefeThema(werteVon(thema.klasse), {
        modus: thema.modus,
        grund: thema.grund,
      });
      // Die Meldung nennt Paar und Verhältnis — sonst sucht man die Farbe.
      expect(befunde, befunde.map((b) => `${b.was}: ${b.verhaeltnis}`).join('; ')).toEqual([]);
    });
  }

  it('prüft dabei jede Stelle, an der ein Baustein Text auf Fläche legt', () => {
    // Wächst die Bibliothek um eine solche Stelle, gehört sie in PAARE —
    // sonst prüft der Test etwas anderes als die Seite zeigt.
    expect(PAARE.length).toBeGreaterThanOrEqual(15);
    expect(SCHWELLE).toBe(4.5);
  });
});
