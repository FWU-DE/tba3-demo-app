// Farben der Kompetenzstufen für die Demoanwendung. Abgleich und Ordnung der
// Schreibweisen stehen in apps/shared/stufen.js — gemeinsam mit dem Katalog.

import { COMPETENCE_LEVELS } from './constants';
import { GER, GER_FARBEN } from '../../../shared/stufen.js';

export * from '../../../shared/stufen.js';

/** Farbe einer Stufe: I–V aus den Konstanten, GER aus einer eigenen, geordneten Skala. */
export const stufenFarbe = (kuerzel) =>
  COMPETENCE_LEVELS[kuerzel]?.color ?? (GER.includes(kuerzel) ? GER_FARBEN[GER.indexOf(kuerzel)] : '#9ca3af');
