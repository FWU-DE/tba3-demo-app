// Prüft die Textschlüssel der Demoanwendung gegen das Wörterbuch — ein
// Tippfehler in `t('header.titel')` fällt sonst erst im Browser auf.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEXTE } from './texte.js';
import { SPRACHEN } from '../../../shared/sprache.js';

const QUELLE = join(dirname(fileURLToPath(import.meta.url)), '..');

const dateien = (ordner) =>
  readdirSync(ordner).flatMap((eintrag) => {
    const pfad = join(ordner, eintrag);
    if (statSync(pfad).isDirectory()) return dateien(pfad);
    return /\.(jsx?|mjs)$/.test(pfad) ? [pfad] : [];
  });

// Nur feste Pfade; zusammengesetzte (`kompetenzstufen.${code}.name`) werden
// über die Vollständigkeitsprüfung des Vokabulars abgedeckt.
const verwendeteSchluessel = () => {
  const gefunden = new Set();
  for (const datei of dateien(QUELLE)) {
    if (datei.endsWith('.test.js') || datei.endsWith('.test.jsx')) continue;
    const inhalt = readFileSync(datei, 'utf8')
      .split('\n')
      .filter((zeile) => !zeile.trim().startsWith('//') && !zeile.trim().startsWith('*'))
      .join('\n');
    for (const treffer of inhalt.matchAll(/\b(?:t|uebersetze)\(\s*'([a-zA-Z0-9_.]+)'/g)) {
      gefunden.add(treffer[1]);
    }
    for (const treffer of inhalt.matchAll(/pfad="([a-zA-Z0-9_.]+)"/g)) gefunden.add(treffer[1]);
  }
  return [...gefunden].sort();
};

const auflösen = (pfad) => pfad.split('.').reduce((wert, teil) => wert?.[teil], TEXTE);

describe('Texte der Demoanwendung', () => {
  it('findet zu jedem verwendeten Schlüssel einen Eintrag', () => {
    const fehlend = verwendeteSchluessel().filter((pfad) => auflösen(pfad) == null);
    expect(fehlend).toEqual([]);
  });

  it('führt jeden Eintrag in beiden Sprachen', () => {
    const luecken = [];
    const gehen = (knoten, pfad) => {
      for (const [schluessel, wert] of Object.entries(knoten)) {
        const hier = pfad ? `${pfad}.${schluessel}` : schluessel;
        const istBlatt = wert && typeof wert === 'object' && wert.de !== undefined && typeof wert.de !== 'object';
        if (istBlatt) {
          for (const sprache of Object.keys(SPRACHEN)) {
            if (wert[sprache] == null || wert[sprache] === '') luecken.push(`${hier} (${sprache})`);
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
    const abweichungen = [];
    const platzhalter = (wert) => [...String(wert).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const gehen = (knoten, pfad) => {
      for (const [schluessel, wert] of Object.entries(knoten)) {
        const hier = pfad ? `${pfad}.${schluessel}` : schluessel;
        if (wert && typeof wert.de === 'string' && typeof wert.en === 'string') {
          if (String(platzhalter(wert.de)) !== String(platzhalter(wert.en))) abweichungen.push(hier);
        } else if (wert && typeof wert === 'object') {
          gehen(wert, hier);
        }
      }
    };
    gehen(TEXTE, '');
    expect(abweichungen).toEqual([]);
  });
});
