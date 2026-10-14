// Farben der Kompetenzstufen für die Demoanwendung. Abgleich und Ordnung der
// Schreibweisen stehen in apps/shared/stufen.js — gemeinsam mit dem Katalog.

import { COMPETENCE_LEVELS } from './constants';
import { GER } from '../../../shared/stufen.js';

export * from '../../../shared/stufen.js';

const GER_FARBEN = ['#b91c1c', '#dc2626', '#ea580c', '#f97316', '#f59e0b', '#eab308', '#a3a635',
  '#84cc16', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#0f766e', '#115e59'];

/** Farbe einer Stufe: I–V aus den Konstanten, GER aus einer eigenen, geordneten Skala. */
export const stufenFarbe = (kuerzel) =>
  COMPETENCE_LEVELS[kuerzel]?.color ?? (GER.includes(kuerzel) ? GER_FARBEN[GER.indexOf(kuerzel)] : '#9ca3af');
