// Was der Build für Werkzeuge schreibt, die die Seite lesen statt ansehen.
// Geprüft wird vor allem, dass nichts davon hinter der Oberfläche zurückbleibt:
// ein neuer Reiter, eine neue Ansicht, ein neues Dokument müssen hier ohne
// Nachtrag auftauchen.

import { describe, expect, it } from 'vitest';
import { BAUSTEINE, RUECKMELDUNGEN } from '../apps/shared/konsortium.js';
import { TEXTE as DEMO } from '../apps/demo/src/i18n/texte.js';
import { KOMPONENTEN } from '../apps/katalog/src/komponenten.js';
import { DOKUMENTE } from './dokumente.mjs';
import { konsortiumJson, robots, sitemap } from './maschinenlesbar.mjs';
import { REITER, demo, katalog } from './ohne-javascript.mjs';

describe('ohne JavaScript', () => {
  it('führt jeden Reiter der Demoanwendung, in beiden Sprachen', () => {
    expect(REITER.map(([id]) => id).sort()).toEqual(Object.keys(DEMO.reiter).sort());
    const html = demo();
    for (const [id] of REITER) {
      expect(html).toContain(`href="/demo/?tab=${id}"`);
      expect(html).toContain(DEMO.reiter[id].de);
      expect(html).toContain(DEMO.reiter[id].en);
    }
  });

  it('führt jede Ansicht des Katalogs mit ihrer Adresse', () => {
    const html = katalog();
    for (const k of KOMPONENTEN) expect(html).toContain(`href="/katalog/#${k.route}"`);
    expect(html).toContain('lang="de"');
    expect(html).toContain('lang="en"');
  });
});

describe('Daten, Sitemap, robots.txt', () => {
  it('gibt Rückmeldungen und Bausteine vollständig als JSON aus', () => {
    const daten = JSON.parse(JSON.stringify(konsortiumJson()));
    expect(daten.rueckmeldungen).toHaveLength(RUECKMELDUNGEN.length);
    expect(daten.bausteine).toHaveLength(BAUSTEINE.length);
    const mitOriginal = daten.bausteine.find((b) => b.originale.length > 0);
    expect(typeof mitOriginal.originale[0].rueckmeldung).toBe('string');
  });

  it('nennt jede Seite in beiden Sprachen in der Sitemap', () => {
    const xml = sitemap('https://beispiel.test');
    for (const d of DOKUMENTE) {
      expect(xml).toContain(`<loc>https://beispiel.test/dokumentation/${d.slug}</loc>`);
      expect(xml).toContain(`<loc>https://beispiel.test/dokumentation/${d.slug}?lang=en</loc>`);
    }
    expect(xml).toContain('<loc>https://beispiel.test/demo/?tab=students&amp;lang=en</loc>');
  });

  it('verweist in robots.txt auf die Sitemap', () => {
    expect(robots('https://beispiel.test')).toContain('Sitemap: https://beispiel.test/sitemap.xml');
  });
});
