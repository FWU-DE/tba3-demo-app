// Nachschlage-Logik des eigenen Mock-Servers.
//
// Genutzt von der Vercel-Funktion (api/[...pfad].js), vom Docker-Mock
// (tools/mock-server.mjs) und vom Vorschau-Server (tools/serve-site.mjs).
//
// Die Antworten liegen gepackt in data/fixtures.mjs; ausgepackt wird erst,
// was wirklich angefragt wird.

import { brotliDecompressSync } from 'node:zlib';
import fixtures, { stand, quelle } from '../data/fixtures.mjs';
import materialFixtures from '../data/material-fixtures.mjs';
import { normalisiereAbfrage } from './mock-schluessel.mjs';

export { normalisiereAbfrage, stand, quelle };

const ausgepackt = new Map();

const hole = (schluessel) => {
  if (ausgepackt.has(schluessel)) return ausgepackt.get(schluessel);
  const gepackt = fixtures[schluessel] ?? materialFixtures[schluessel];
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

// Die Filter des Materialien-Entwurfs lassen sich direkt auf den Beispieldaten
// anwenden — sonst gäbe "Try it out" für jede Anfrage dieselbe Liste zurück.
const listen = (wert) => String(wert).split(',').map((t) => t.trim()).filter(Boolean);

const passtAufAnhang = (material, pruefung) =>
  (material.attachments ?? []).some(pruefung);

const materialFilter = {
  scope: (m, wert) => passtAufAnhang(m, (a) => listen(wert).includes(a.scope)),
  kind: (m, wert) => listen(wert).includes(m.kind),
  language: (m, wert) => m.language === wert,
  audience: (m, wert) => m.audience === wert,
  subject: (m, wert) => passtAufAnhang(m, (a) => a.subject?.name === wert || a.subject?.id === wert),
  domain: (m, wert) => passtAufAnhang(m, (a) => a.domain?.name === wert || a.domain?.id === wert),
};

// test, exercise, item, competence und competenceLevel zeigen alle auf refId bzw.
// refName des jeweiligen Scopes; 'iqbId:AB1021' und 'nameShort:Ia' sind erlaubt.
for (const [name, scope] of Object.entries({
  test: 'test',
  exercise: 'exercise',
  item: 'item',
  competence: 'competence',
  competenceLevel: 'competence-level',
})) {
  materialFilter[name] = (m, wert) => {
    const [qualifizierer, rest] = wert.includes(':') ? [wert.split(':')[0], wert.split(':').slice(1).join(':')] : [null, wert];
    return passtAufAnhang(m, (a) =>
      a.scope === scope &&
      (a.refId === rest || a.refName === rest) &&
      (!qualifizierer || a.refKind === qualifizierer)
    );
  };
}

const materialien = (query) => {
  const alle = hole('/materials');
  if (!Array.isArray(alle)) return undefined;
  const aktiv = Object.entries(query).filter(([name, wert]) => materialFilter[name] && wert !== '');
  if (aktiv.length === 0) return alle;
  return alle.filter((m) => aktiv.every(([name, wert]) => materialFilter[name](m, wert)));
};

/**
 * Sucht die passende Antwort. Gibt es die angefragte Parameterkombination
 * nicht, werden die Parameter der Reihe nach fallen gelassen (erst comparison,
 * dann aggregation, dann type), statt einen 404 zu liefern — die Anwendungen
 * sollen auch bei einer unbekannten Kombination etwas anzuzeigen haben.
 */
export const antwortFuer = (eingang, query = {}) => {
  // Der Rewrite kann einen abschließenden Schrägstrich liefern (/materials/) —
  // vor jedem Vergleich also abschneiden.
  const pfad = eingang.replace(/\/+$/, '') || '/';

  if (pfad === '/materials') {
    const daten = materialien(query);
    return daten === undefined ? { daten: null, treffer: 'keiner' } : { daten, treffer: 'genau' };
  }

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
