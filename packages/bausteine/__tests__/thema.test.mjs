// Die Vorgaben der Bibliothek müssen selbst lesbar sein.
//
// Ein Baustein, den niemand themt, steht mit diesen Farben da — und die Stelle,
// an der es zuerst schiefgeht, ist nicht der Fließtext, sondern die
// Beschriftung **auf** einer Fläche: das Kürzel im Balken, das Abzeichen in
// der Tabelle, die Initialen im Avatar. Weiß auf dem Gelb der Stufe 3 hat ein
// Verhältnis von 2,0; lesbar ist ab 4,5.

import { describe, expect, it } from 'vitest';

import { THEMA, themaCss } from '../kern/thema.js';
import {
  PAARE,
  SCHWELLE,
  farbe,
  kontrast,
  lesbareSchrift,
  pruefeThema,
} from '../kern/kontrast.js';

describe('Kontrastrechnung', () => {
  it('rechnet die bekannten Eckwerte richtig', () => {
    expect(kontrast(farbe('#000000'), farbe('#ffffff'))).toBeCloseTo(21, 1);
    expect(kontrast(farbe('#ffffff'), farbe('#ffffff'))).toBeCloseTo(1, 5);
    // Der Wert, an dem der Fehler aufgefallen ist: Weiß auf dem Gelb der Stufe 3
    expect(kontrast(farbe('#ffffff'), farbe('#d9b23a'))).toBeLessThan(SCHWELLE);
  });

  it('versteht Kurzform, Langform und Alphawerte', () => {
    expect(farbe('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 });
    expect(farbe('#aabbcc')).toEqual({ r: 170, g: 187, b: 204, a: 1 });
    expect(farbe('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
    expect(farbe('irgendwas')).toBeNull();
  });

  it('wählt zu einer mitgegebenen Farbe die lesbarere Schrift', () => {
    expect(lesbareSchrift('#d9b23a')).toBe('#1a1a1a');
    expect(lesbareSchrift('#15803d')).toBe('#ffffff');
    // Ein var(--…) lässt sich hier nicht auflösen — dann gilt das Thema.
    expect(lesbareSchrift('var(--tba3-_stufe-3)')).toBeNull();
  });
});

describe('Die Vorgaben der Bibliothek', () => {
  for (const modus of ['hell', 'dunkel']) {
    it(`sind im Modus „${modus}" durchgehend lesbar`, () => {
      const befunde = pruefeThema({}, { modus });
      expect(befunde, befunde.map((b) => `${b.was}: ${b.verhaeltnis}`).join('; ')).toEqual([]);
    });
  }

  it('führt zu jeder Kompetenzstufe eine Beschriftungsfarbe', () => {
    for (const nr of [1, 2, 3, 4, 5]) {
      expect(THEMA[`stufe-${nr}`], `stufe-${nr}`).toBeTruthy();
      expect(THEMA[`stufe-${nr}-text`], `stufe-${nr}-text`).toBeTruthy();
    }
  });

  it('unterscheidet hell und dunkel nur in Farben', () => {
    // `themaCss()` packt eine Vorgabe nur dann in `light-dark(hell, dunkel)`,
    // wenn sich die beiden unterscheiden. Das geht gut, solange alles, was
    // sich unterscheidet, eine Farbe ist: ein Wert mit Komma auf oberster
    // Ebene — `system-ui, sans-serif` — würde `light-dark()` als zwei
    // Argumente lesen und die Regel still verwerfen.
    for (const [name, { hell, dunkel }] of Object.entries(THEMA)) {
      if (hell === dunkel) continue;
      for (const wert of [hell, dunkel]) {
        expect(farbe(wert), `${name}: „${wert}" ist keine Farbe`).not.toBeNull();
      }
    }
  });

  it('fragt nicht mehr das Betriebssystem', () => {
    // Der Fehler, der das hier ausgelöst hat: dunkle Vorgaben in einer hellen
    // Seite, nur weil das System dunkel stand. Entscheiden darf das jetzt
    // `color-scheme`, und das kommt von der Seite.
    const css = themaCss();
    expect(css).not.toContain('prefers-color-scheme');
    expect(css).toContain('light-dark(#1a1a1a, #f1f3f5)');
    expect(css).toContain(':host([data-thema="hell"]) { color-scheme: light; }');
    expect(css).toContain(':host([data-thema="dunkel"]) { color-scheme: dark; }');
    // Die Schriftstapel tragen Kommas und dürfen deshalb nicht eingepackt sein.
    expect(css).toContain('var(--tba3-schrift, system-ui, sans-serif)');
  });

  it('prüft jedes Paar gegen beide Vorgaben', () => {
    // Ein Paar, dessen Namen es im Thema nicht gibt, würde stillschweigend
    // übersprungen — dann prüfte der Test weniger, als er behauptet.
    for (const paar of PAARE) {
      expect(THEMA[paar.vorn], `${paar.was}: ${paar.vorn} fehlt im Thema`).toBeTruthy();
      if (paar.hinten !== null) {
        expect(THEMA[paar.hinten], `${paar.was}: ${paar.hinten} fehlt im Thema`).toBeTruthy();
      }
    }
  });
});
