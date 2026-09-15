// Das Dokument „Bausteine der Rückmeldungen" wird erzeugt, liegt aber
// eingecheckt auf der Platte — `tools/build-site.mjs` erwartet es dort, und der
// Stand soll im Diff sichtbar sein.
//
// Genau daraus entsteht die Falle, die dieser Test stellt: Wer die Daten in
// `apps/shared/konsortium.js` ändert und `npm run konsortium:doc` vergisst,
// bekommt eine Seite, die etwas anderes sagt als die Übersicht und die
// Demoanwendung — und niemandem fällt es auf, weil beide für sich stimmig sind.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { BAUSTEINE, RUECKMELDUNGEN } from '../apps/shared/konsortium.js';
import { DOKUMENTE } from './dokumente.mjs';
import { ZIEL, dokument } from './konsortium-dokument.mjs';

const eingecheckt = () => readFileSync(ZIEL, 'utf8');

describe('Bausteine der Rückmeldungen', () => {
  it('ist so eingecheckt, wie es erzeugt wird', () => {
    expect(eingecheckt(), 'npm run konsortium:doc ausführen').toBe(dokument());
  });

  it('steht als eigenes Dokument im Verzeichnis', () => {
    const eintrag = DOKUMENTE.find((d) => d.slug === 'bausteine-der-rueckmeldungen');
    expect(eintrag, 'nicht in DOKUMENTE — die Seite würde nicht gebaut').toBeTruthy();
    // `eigen: true` hält `npm run docs:update` davon ab, die erzeugte Datei mit
    // einer Kopie aus indibit-eu/tba3 zu überschreiben, die es dort nicht gibt.
    expect(eintrag.eigen).toBe(true);
  });

  it('führt jeden Baustein des Katalogs mit einem eigenen Abschnitt', () => {
    const text = eingecheckt();
    for (const b of BAUSTEINE) expect(text, b.id).toContain(`### ${b.name.de}`);
  });

  it('führt jede Rückmeldung mit ihren Adressen', () => {
    const text = eingecheckt();
    for (const r of RUECKMELDUNGEN) {
      expect(text, r.id).toContain(r.titel.de);
      for (const adresse of [r.demo, r.code, r.doku].filter(Boolean)) {
        expect(text, `${r.id}: ${adresse}`).toContain(adresse);
      }
    }
  });
});
