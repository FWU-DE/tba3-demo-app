// Die Übersicht „Katalog ↔ Bausteine" gegen die Wirklichkeit prüfen.
//
// Eine Zuordnungstabelle, die niemand nachzieht, ist schlimmer als keine: sie
// behauptet einen Stand, den es nicht gibt. Deshalb liest dieser Test, welche
// Katalog-Ansicht tatsächlich aus `@tba3/bausteine/vue` importiert, und hält
// das gegen `zuordnung.js`.

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { NUR_BAUSTEIN, ZUORDNUNG } from './zuordnung.js';

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = join(HIER, '..', '..', '..');
const ANSICHTEN = join(WURZEL, 'apps/katalog/src/views');

/** Welche Ansichten beziehen ihre Komponente aus dem Paket? */
function ausDemPaket() {
  return readdirSync(ANSICHTEN)
    .filter((d) => d.endsWith('View.vue') && d !== 'IndexView.vue')
    .filter((d) => readFileSync(join(ANSICHTEN, d), 'utf8').includes("from '@tba3/bausteine/vue'"))
    .map((d) => d.replace(/View\.vue$/, ''))
    .sort();
}

/** Welche Bausteine gibt es? */
async function bausteinNamen() {
  const { BAUPLAENE } = await import('../../../packages/bausteine/webcomponents/index.js');
  return BAUPLAENE.map((b) => b.name).sort();
}

describe('Zuordnung Katalog ↔ Bausteine', () => {
  it('nennt jede Katalog-Ansicht genau einmal', () => {
    const genannt = ZUORDNUNG.map((z) => z.katalog);
    expect(new Set(genannt).size).toBe(genannt.length);

    const vorhanden = readdirSync(ANSICHTEN)
      .filter((d) => d.endsWith('View.vue') && d !== 'IndexView.vue')
      .map((d) => d.replace(/View\.vue$/, ''))
      .sort();
    expect(genannt.sort()).toEqual(vorhanden);
  });

  it('markiert genau die Ansichten als umgezogen, die aus dem Paket importieren', () => {
    const behauptet = ZUORDNUNG.filter((z) => z.stand === 'umgezogen').map((z) => z.katalog).sort();
    expect(behauptet).toEqual(ausDemPaket());
  });

  it('verweist nur auf Bausteine, die es gibt', async () => {
    const namen = await bausteinNamen();
    for (const z of ZUORDNUNG) {
      if (z.baustein === null) continue;
      expect(namen, `${z.katalog} verweist auf "${z.baustein}"`).toContain(z.baustein);
    }
  });

  it('gibt jeder offenen Zeile einen Hinweis, was noch fehlt', () => {
    for (const z of ZUORDNUNG.filter((x) => x.stand === 'offen')) {
      expect(z.hinweis, `${z.katalog} ohne Hinweis`).toBeTruthy();
    }
  });

  it('hat für jeden umgezogenen Eintrag einen Baustein', () => {
    for (const z of ZUORDNUNG.filter((x) => x.stand === 'umgezogen')) {
      expect(z.baustein, `${z.katalog} ist umgezogen, nennt aber keinen Baustein`).toBeTruthy();
    }
  });

  // Die Bibliothek ist mehr als die Schau: Bausteine ohne Katalog-Ansicht
  // stehen in NUR_BAUSTEIN, mit Grund. Ohne diese Prüfung fällt ein neuer
  // Baustein einfach aus der Übersicht heraus, und niemand merkt es.
  it('führt jeden Baustein entweder bei einer Ansicht oder in NUR_BAUSTEIN', async () => {
    const namen = await bausteinNamen();
    const genannt = [
      ...ZUORDNUNG.map((z) => z.baustein),
      ...NUR_BAUSTEIN.map((n) => n.baustein),
    ].filter(Boolean);

    expect([...new Set(genannt)].sort()).toEqual(namen);
  });

  it('begründet jeden Baustein ohne Ansicht', () => {
    for (const n of NUR_BAUSTEIN) {
      expect(n.anzeige, `${n.baustein} ohne Klartextnamen`).toBeTruthy();
      expect(n.grund, `${n.baustein} ohne Grund`).toBeTruthy();
    }
  });
});
