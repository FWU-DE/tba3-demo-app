// Die englischen Fassungen der Spezifikationen sind Übersetzungen der deutschen.
// Sie dürfen nur in Beschreibungstexten abweichen — und müssen zum aktuellen Stand
// der deutschen Datei gehören: die erste Zeile nennt deren sha256. Nach
// `npm run spec:update` bzw. `npm run material-spec:update` schlägt dieser Test
// deshalb fehl, bis die Übersetzung nachgezogen ist.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { load } from 'js-yaml';

const PAARE = [
  ['tba3-spec.yml', 'tba3-spec.en.yml', 'npm run spec:update'],
  ['material-spec.yml', 'material-spec.en.yml', 'npm run material-spec:update'],
];

const lies = (datei) => readFileSync(new URL(datei, import.meta.url));

// Übersetzt werden dürfen nur diese Texte. Was darunter an Beispieldaten steht
// (`value`, `example`, `enum` …), muss Wort für Wort gleich bleiben.
const TEXTFELDER = new Set(['title', 'summary', 'description']);
const DATEN = new Set(['example', 'value', 'enum', 'default', 'const']);

/**
 * Sammelt die Abweichungen zwischen deutscher und englischer Fassung, die keine
 * Übersetzung sind. Namen in einer `examples`-Sammlung sind Beschriftungen der
 * Auswahlliste und dürfen übersetzt sein — verglichen wird dort nach Position.
 */
function abweichungen(de, en, pfad = '', daten = false, fehler = []) {
  if (Array.isArray(de)) {
    if (!Array.isArray(en) || en.length !== de.length) {
      fehler.push(`${pfad || '/'}: Liste mit ${de.length} Einträgen erwartet`);
      return fehler;
    }
    de.forEach((wert, i) => abweichungen(wert, en[i], `${pfad}/${i}`, daten, fehler));
    return fehler;
  }
  if (de && typeof de === 'object') {
    if (!en || typeof en !== 'object' || Array.isArray(en)) {
      fehler.push(`${pfad || '/'}: Objekt erwartet`);
      return fehler;
    }
    const schluesselDe = Object.keys(de);
    const schluesselEn = Object.keys(en);
    const beispielSammlung = !daten && pfad.endsWith('/examples');
    if (beispielSammlung) {
      if (schluesselEn.length !== schluesselDe.length) {
        fehler.push(`${pfad}: ${schluesselDe.length} Beispiele erwartet, ${schluesselEn.length} gefunden`);
        return fehler;
      }
      schluesselDe.forEach((name, i) =>
        abweichungen(de[name], en[schluesselEn[i]], `${pfad}/${name}`, daten, fehler));
      return fehler;
    }
    if (schluesselDe.join('\n') !== schluesselEn.join('\n')) {
      const fehlt = schluesselDe.filter((s) => !(s in en));
      const zuviel = schluesselEn.filter((s) => !(s in de));
      fehler.push(`${pfad || '/'}: Schlüssel weichen ab (fehlt: ${fehlt.join(', ') || '—'}; zu viel: ${zuviel.join(', ') || '—'})`);
      return fehler;
    }
    for (const schluessel of schluesselDe) {
      const unterpfad = `${pfad}/${schluessel}`;
      const istDaten = daten || DATEN.has(schluessel) || (schluessel === 'examples' && Array.isArray(de[schluessel]));
      if (!istDaten && TEXTFELDER.has(schluessel) && typeof de[schluessel] === 'string') {
        if (typeof en[schluessel] !== 'string' || !en[schluessel].trim()) {
          fehler.push(`${unterpfad}: Übersetzung fehlt`);
        }
        continue;
      }
      abweichungen(de[schluessel], en[schluessel], unterpfad, istDaten, fehler);
    }
    return fehler;
  }
  if (de !== en) fehler.push(`${pfad}: ${JSON.stringify(de)} erwartet, ${JSON.stringify(en)} gefunden`);
  return fehler;
}

describe('Englische Fassungen der Spezifikationen', () => {
  for (const [deutsch, englisch, aktualisierung] of PAARE) {
    describe(englisch, () => {
      const quelle = lies(deutsch);
      const uebersetzung = lies(englisch).toString('utf8');

      it(`gehört zum aktuellen Stand von ${deutsch}`, () => {
        const sha = createHash('sha256').update(quelle).digest('hex');
        const kopf = uebersetzung.split('\n', 1)[0];
        const genannt = kopf.match(/^# Übersetzung von (\S+), sha256:([0-9a-f]{64})$/);
        expect(genannt, `${englisch}: erste Zeile muss „# Übersetzung von ${deutsch}, sha256:<hex>“ lauten`).toBeTruthy();
        expect(genannt[1]).toBe(deutsch);
        expect(
          genannt[2],
          `${deutsch} hat sich geändert (z. B. durch \`${aktualisierung}\`), ${englisch} ist aber noch die Übersetzung `
          + `des alten Stands. Übersetzung nachziehen: geänderte Beschreibungen in ${englisch} übertragen und in der `
          + `ersten Zeile sha256:${sha} eintragen.`
        ).toBe(sha);
      });

      it(`hat dieselbe Struktur wie ${deutsch} — nur Beschreibungstexte weichen ab`, () => {
        const fehler = abweichungen(load(quelle.toString('utf8')), load(uebersetzung));
        expect(
          fehler,
          `${englisch} weicht in der Struktur von ${deutsch} ab — Übersetzung nach \`${aktualisierung}\` nachziehen. `
          + 'Übersetzt werden nur title, summary, description und Namen von Beispielen.'
        ).toEqual([]);
      });
    });
  }
});
