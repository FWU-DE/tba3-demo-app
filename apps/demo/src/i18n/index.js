// Zweisprachigkeit der Demoanwendung.
//
// Die Sprachwahl selbst gehört der ganzen Seite und sitzt in der gemeinsamen
// Navigationsleiste (`apps/shared/sprache.js`). Hier wird sie nur an React
// angeschlossen: `useTexte()` liefert `t()` und zeichnet die Komponente neu,
// wenn anderswo umgeschaltet wird.
//
//   const t = useTexte();
//   <h1>{t('header.titel')}</h1>
//   <p>{t('schueler.anzahl', { n: 23 })}</p>
//
// Die Texte stehen gesammelt in `texte.js` — nicht in den Komponenten, damit
// eine fehlende Übersetzung an einer Stelle auffällt und nicht an zwanzig.

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { STANDARD, beiSprachwechsel, sprache, text } from '../../../shared/sprache.js';
import { TEXTE } from './texte.js';
import {
  COMPETENCE_LEVELS,
  GENDER_CODES,
  GRADES,
  LANGUAGE_CODES,
  MATERIAL_TYPES,
  SUBJECTS,
  TYPE_VALUES,
} from '../utils/constants';

export { STANDARD, SPRACHEN, setzeSprache, sprache } from '../../../shared/sprache.js';

/** Die aktuelle Sprache; wechselt sie, zeichnet die Komponente neu. */
export function useSprache() {
  return useSyncExternalStore(beiSprachwechsel, sprache, () => STANDARD);
}

const auflösen = (pfad) => pfad.split('.').reduce((wert, teil) => wert?.[teil], TEXTE);

/**
 * Holt den Text zu `pfad` in der aktuellen Sprache. `werte` füllt Platzhalter
 * der Form `{name}`. Fehlt ein Eintrag, steht der Pfad da — auffällig genug,
 * um es zu bemerken, und harmlos genug, um die Seite nicht zu zerlegen.
 */
export function uebersetze(pfad, werte, gewaehlt = sprache()) {
  const eintrag = auflösen(pfad);
  if (eintrag == null) {
    if (import.meta.env?.DEV) console.warn(`[i18n] Kein Text für "${pfad}"`);
    return pfad;
  }
  const roh = text(eintrag, gewaehlt);
  if (!werte) return roh;
  return roh.replace(/\{(\w+)\}/g, (treffer, name) => (name in werte ? String(werte[name]) : treffer));
}

/** `t()` für die aktuelle Sprache. */
export function useTexte() {
  const gewaehlt = useSprache();
  return useCallback((pfad, werte) => uebersetze(pfad, werte, gewaehlt), [gewaehlt]);
}

// ── Konstanten mit Beschriftung ───────────────────────────────────────────────
//
// `utils/constants.js` führt nur Kennungen, Farben und Zeichen. Hier kommen die
// Beschriftungen dazu — in der gewählten Sprache, unter denselben Namen wie
// bisher. Eine Komponente holt sie sich mit
//
//   const { COMPETENCE_LEVELS, SUBJECTS } = useKonstanten();
//
// und arbeitet danach weiter wie zuvor.

const abbilden = (objekt, fn) =>
  Object.fromEntries(Object.entries(objekt).map(([schluessel, wert]) => [schluessel, fn(wert, schluessel)]));

export function konstanten(t) {
  return {
    COMPETENCE_LEVELS: abbilden(COMPETENCE_LEVELS, (stufe, code) => ({
      ...stufe,
      name: t(`kompetenzstufen.${code}.name`),
      description: t(`kompetenzstufen.${code}.beschreibung`),
    })),
    SUBJECTS: abbilden(SUBJECTS, (fach, code) => ({ ...fach, name: t(`faecher.${code}`) })),
    GRADES: abbilden(GRADES, (stufe, code) => ({
      ...stufe,
      name: t(`klassenstufen.${code}`),
      description: t(`klassenstufen.${code}Beschreibung`),
    })),
    GENDERS: Object.fromEntries(GENDER_CODES.map((code) => [code, t(`geschlechter.${code}`)])),
    LANGUAGES: Object.fromEntries(LANGUAGE_CODES.map((code) => [code, t(`sprachen.${code}`)])),
    TYPE_OPTIONS: TYPE_VALUES.map((value) => ({ value, label: t(`datentypen.${value}`) })),
    MATERIAL_TYPES: abbilden(MATERIAL_TYPES, (art, id) => ({ ...art, label: t(`materialarten.${id}`) })),
  };
}

/** Die Konstanten in der aktuellen Sprache. */
export function useKonstanten() {
  const t = useTexte();
  return useMemo(() => konstanten(t), [t]);
}

/**
 * Dieselben Konstanten außerhalb von React — für die Ausgabe-Werkzeuge (PDF,
 * Common Cartridge), die keine Komponente sind und die Sprache erst beim
 * Aufruf kennen.
 */
export const konstantenJetzt = () => konstanten((pfad, werte) => uebersetze(pfad, werte));
