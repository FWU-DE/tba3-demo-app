// Zweisprachigkeit des Komponentenkatalogs.
//
// Die Sprachwahl gehört der ganzen Seite und sitzt in der gemeinsamen
// Navigationsleiste (`apps/shared/sprache.js`). Hier wird sie an Vue
// angeschlossen: `t()` liest eine reaktive Referenz, deshalb zeichnen sich
// Vorlagen nach einem Wechsel von selbst neu.
//
//   import { t } from '../i18n';
//   <h1>{{ t('katalog.titel') }}</h1>
//   <p>{{ t('katalog.anzahl', { n: 7 }) }}</p>
//
// Die Texte stehen gesammelt in `texte.js`.

import { ref } from 'vue';
import { STANDARD, beiSprachwechsel, sprache, text } from '../../../shared/sprache.js';
import { TEXTE } from './texte.js';

export { STANDARD, SPRACHEN, setzeSprache } from '../../../shared/sprache.js';

/** Reaktive Sprache — Vorlagen, die `t()` aufrufen, hängen daran. */
export const aktuelleSprache = ref(sprache());

beiSprachwechsel((gewaehlt) => {
  aktuelleSprache.value = gewaehlt;
});

const auflösen = (pfad) => pfad.split('.').reduce((wert, teil) => wert?.[teil], TEXTE);

/**
 * Holt den Text zu `pfad`. `werte` füllt Platzhalter der Form `{name}`.
 * Fehlt ein Eintrag, steht der Pfad da — auffällig, aber harmlos.
 */
export function t(pfad, werte) {
  const gewaehlt = aktuelleSprache.value;
  // Kein Pfad ist derselbe Fall wie ein unbekannter — auffällig, aber harmlos.
  // Vorher nahm `undefined` die ganze Ansicht mit: `auflösen` warf, und Vue
  // riss das Setup ab. Eine Seite ohne Text ist besser als eine weiße Seite.
  if (typeof pfad !== 'string' || pfad === '') {
    if (import.meta.env?.DEV) console.warn('[i18n] t() ohne Pfad aufgerufen');
    return '';
  }
  const eintrag = auflösen(pfad);
  if (eintrag == null) {
    if (import.meta.env?.DEV) console.warn(`[i18n] Kein Text für "${pfad}"`);
    return pfad;
  }
  const roh = text(eintrag, gewaehlt);
  if (!werte) return roh;
  return roh.replace(/\{(\w+)\}/g, (treffer, name) => (name in werte ? String(werte[name]) : treffer));
}
