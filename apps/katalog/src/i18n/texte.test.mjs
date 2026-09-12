// Prüft die Textschlüssel des Katalogs gegen das Wörterbuch: Ein Tippfehler in
// `t('ansichten.stufen.titel')` fällt sonst erst im Browser auf — und dort nur,
// wenn jemand genau diese Ansicht öffnet.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEXTE } from './texte.js';
import { SPRACHEN, text } from '../../../shared/sprache.js';

const QUELLE = join(dirname(fileURLToPath(import.meta.url)), '..');

const dateien = (ordner) =>
  readdirSync(ordner).flatMap((eintrag) => {
    const pfad = join(ordner, eintrag);
    if (statSync(pfad).isDirectory()) return dateien(pfad);
    return pfad.endsWith('.vue') || pfad.endsWith('.js') ? [pfad] : [];
  });

// Nur feste Pfade; zusammengesetzte (`komponenten.${name}.beschreibung`) lassen
// sich hier nicht auflösen und werden über die Vokabular-Prüfung abgedeckt.
const verwendeteSchluessel = () => {
  const gefunden = new Set();
  for (const datei of dateien(QUELLE)) {
    if (datei.endsWith('texte.test.mjs')) continue;
    // Kommentarzeilen weglassen: die Beispiele in i18n/index.js meinen keine
    // echten Schlüssel.
    const inhalt = readFileSync(datei, 'utf8')
      .split('\n')
      .filter((zeile) => !zeile.trim().startsWith('//'))
      .join('\n');
    for (const treffer of inhalt.matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) gefunden.add(treffer[1]);
    for (const treffer of inhalt.matchAll(/pfad: '([a-zA-Z0-9_.]+)'/g)) gefunden.add(treffer[1]);
  }
  return [...gefunden].sort();
};

const auflösen = (pfad) => pfad.split('.').reduce((wert, teil) => wert?.[teil], TEXTE);

describe('Texte des Katalogs', () => {
  it('findet zu jedem verwendeten Schlüssel einen Eintrag', () => {
    const fehlend = verwendeteSchluessel().filter((pfad) => auflösen(pfad) == null);
    expect(fehlend).toEqual([]);
  });

  it('führt jeden Eintrag in beiden Sprachen', () => {
    const luecken = [];
    const gehen = (knoten, pfad) => {
      for (const [schluessel, wert] of Object.entries(knoten)) {
        const hier = pfad ? `${pfad}.${schluessel}` : schluessel;
        // Ein Blatt ist { de, en } mit Text oder Liste — `bausteine.domaenen`
        // hat zwar einen Schlüssel `en`, dessen Wert ist aber wieder ein Paar.
        const istBlatt = wert && typeof wert === 'object'
          && typeof wert.de !== 'object' && wert.de !== undefined
          || (Array.isArray(wert?.de) && Array.isArray(wert?.en));
        if (istBlatt) {
          for (const sprache of Object.keys(SPRACHEN)) {
            const fassung = wert[sprache];
            const leer = fassung == null || (Array.isArray(fassung) ? fassung.length === 0 : fassung === '');
            if (leer) luecken.push(`${hier} (${sprache})`);
          }
        } else if (wert && typeof wert === 'object') {
          gehen(wert, hier);
        }
      }
    };
    gehen(TEXTE, '');
    expect(luecken).toEqual([]);
  });

  it('löst Platzhalter in beiden Sprachen gleich auf', () => {
    // Wer im Deutschen {n} schreibt, muss es im Englischen auch tun — sonst
    // steht dort eine Zahl zu wenig.
    const abweichungen = [];
    const platzhalter = (wert) => [...String(wert).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const gehen = (knoten, pfad) => {
      for (const [schluessel, wert] of Object.entries(knoten)) {
        const hier = pfad ? `${pfad}.${schluessel}` : schluessel;
        if (wert && typeof wert === 'object' && 'de' in wert && 'en' in wert) {
          if (typeof wert.de === 'string' && String(platzhalter(wert.de)) !== String(platzhalter(wert.en))) {
            abweichungen.push(hier);
          }
        } else if (wert && typeof wert === 'object') {
          gehen(wert, hier);
        }
      }
    };
    gehen(TEXTE, '');
    expect(abweichungen).toEqual([]);
  });

  it('liefert die Beschreibungen der Bausteine in beiden Sprachen', () => {
    for (const [name, eintrag] of Object.entries(TEXTE.komponenten)) {
      for (const sprache of Object.keys(SPRACHEN)) {
        expect(text(eintrag.beschreibung, sprache), name).toBeTruthy();
        expect(eintrag.faelle[sprache].length, name).toBeGreaterThan(0);
      }
    }
  });
});
