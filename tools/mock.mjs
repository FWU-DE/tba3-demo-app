// Nachschlage-Logik des eigenen Mock-Servers.
//
// Genutzt von der Vercel-Funktion (api/[...pfad].js), vom Docker-Mock
// (tools/mock-server.mjs) und vom Vorschau-Server (tools/serve-site.mjs).
//
// Die Antworten liegen gepackt in data/fixtures.mjs; ausgepackt wird erst,
// was wirklich angefragt wird.

import { brotliDecompressSync } from 'node:zlib';
import fixtures, { stand, quelle } from '../data/fixtures.mjs';
import { normalisiereAbfrage } from './mock-schluessel.mjs';

export { normalisiereAbfrage, stand, quelle };

const ausgepackt = new Map();

const hole = (schluessel) => {
  if (ausgepackt.has(schluessel)) return ausgepackt.get(schluessel);
  const gepackt = fixtures[schluessel];
  if (gepackt === undefined) return undefined;
  const daten = JSON.parse(brotliDecompressSync(Buffer.from(gepackt, 'base64')).toString('utf8'));
  ausgepackt.set(schluessel, daten);
  return daten;
};

// 'group,students' liefert exakt Gruppen- und Schülerdaten hintereinander —
// deshalb wird diese Variante nicht vorgehalten, sondern zusammengesetzt.
const istBeides = (type) => type === 'group,students' || type === 'students,group';

const suche = (pfad, query) => {
  if (istBeides(query.type)) {
    const gruppe = hole(normalisiereAbfrage(pfad, { ...query, type: '' }));
    const schueler = hole(normalisiereAbfrage(pfad, { ...query, type: 'students' }));
    if (Array.isArray(gruppe) && Array.isArray(schueler)) return [...gruppe, ...schueler];
    return undefined;
  }
  return hole(normalisiereAbfrage(pfad, query));
};

/**
 * Sucht die passende Antwort. Gibt es die angefragte Parameterkombination
 * nicht, werden die Parameter der Reihe nach fallen gelassen (erst comparison,
 * dann aggregation, dann type), statt einen 404 zu liefern — die Anwendungen
 * sollen auch bei einer unbekannten Kombination etwas anzuzeigen haben.
 */
export const antwortFuer = (pfad, query = {}) => {
  const genau = suche(pfad, query);
  if (genau !== undefined) return { daten: genau, treffer: 'genau' };

  const rest = { ...query };
  for (const name of ['comparison', 'type', 'aggregation']) {
    if (rest[name] === undefined) continue;
    delete rest[name];
    const daten = suche(pfad, rest);
    if (daten !== undefined) return { daten, treffer: 'ersatz' };
  }

  return { daten: null, treffer: 'keiner' };
};

/** Alle hinterlegten Schlüssel — für Diagnose und Tests. */
export const schluessel = () => Object.keys(fixtures);
