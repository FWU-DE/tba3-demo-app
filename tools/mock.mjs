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

// Die Spezifikation fragt nach Kürzeln („Fachkürzel (z. B. `de`, `ma`)“), die
// Beispiele des Entwurfs führen Namen („Deutsch“). Beides soll treffen — sonst
// liefert das Beispiel aus der Referenz eine leere Liste.
const FACH_KUERZEL = { de: 'Deutsch', ma: 'Mathematik', en: 'Englisch', fr: 'Französisch' };
const DOMAENEN_KUERZEL = { le: 'Leseverstehen', ho: 'Hörverstehen', rs: 'Rechtschreibung' };
const passtNamen = (eintrag, wert, kuerzel) => {
  if (!eintrag) return false;
  const gesucht = String(wert).toLowerCase();
  const name = kuerzel[gesucht] ?? wert;
  return eintrag.name === name || eintrag.id === wert || eintrag.name?.toLowerCase() === gesucht;
};

const materialFilter = {
  scope: (m, wert) => passtAufAnhang(m, (a) => listen(wert).includes(a.scope)),
  kind: (m, wert) => listen(wert).includes(m.kind),
  language: (m, wert) => m.language === wert,
  audience: (m, wert) => m.audience === wert,
  subject: (m, wert) => passtAufAnhang(m, (a) => passtNamen(a.subject, wert, FACH_KUERZEL)),
  domain: (m, wert) => passtAufAnhang(m, (a) => passtNamen(a.domain, wert, DOMAENEN_KUERZEL)),
};

// test, exercise, item, competence und competenceLevel zeigen alle auf refId bzw.
// refName des jeweiligen Scopes; 'iqbId:AB1021' und 'nameShort:Ia' sind erlaubt,
// 'name:Leitidee Lesen' sucht nur im Namen. Ein Präfix gilt nur, wenn es eines
// dieser drei ist — eine Kompetenz-URI („https://…“) enthält ebenfalls einen
// Doppelpunkt und wurde sonst als Präfix „https“ gelesen und fand nichts.
const QUALIFIZIERER = new Set(['iqbId', 'nameShort', 'name']);
for (const [name, scope] of Object.entries({
  test: 'test',
  exercise: 'exercise',
  item: 'item',
  competence: 'competence',
  competenceLevel: 'competence-level',
})) {
  materialFilter[name] = (m, wert) => {
    const praefix = wert.split(':')[0];
    const qualifizierer = wert.includes(':') && QUALIFIZIERER.has(praefix) ? praefix : null;
    const rest = qualifizierer ? wert.slice(praefix.length + 1) : wert;
    return passtAufAnhang(m, (a) => {
      if (a.scope !== scope) return false;
      if (qualifizierer === 'name') return a.refName === rest;
      return (a.refId === rest || a.refName === rest) && (!qualifizierer || a.refKind === qualifizierer);
    });
  };
}

const materialien = (query) => {
  const alle = hole('/materials');
  if (!Array.isArray(alle)) return undefined;
  const aktiv = Object.entries(query).filter(([name, wert]) => materialFilter[name] && wert !== '');
  if (aktiv.length === 0) return alle;
  return alle.filter((m) => aktiv.every(([name, wert]) => materialFilter[name](m, wert)));
};

// ── Fairer Vergleich (`comparison=faircomparison`) ───────────────────────────
// Die Endpunkt-Referenz sieht ihn vor, der Referenzserver liefert ihn noch nicht
// (indibit-eu/tba3#56). Der eigene Mock bildet ihn aus Werten, die schon in den
// Antworten stehen: jedes Item führt die Lösungshäufigkeit seiner Schulart
// (`parameters.solutionFrequencyPrimarySchool`, `…Gymnasium`). Die zusätzliche
// Wertegruppe trägt `type: 'faircomparison'` und die Schulart als Kovariate.
// Nur für `/items` — für Kompetenzstufen führen die Antworten keinen solchen Wert.
const FAIRER_VERGLEICH = new Set(['faircomparison', 'group-faircomparison', 'school-faircomparison']);

/** In den Demodaten hängt die Schulart an der Klassenstufe bzw. am Schulnamen. */
const SCHULART = {
  grundschule: { feld: 'solutionFrequencyPrimarySchool', wert: 'primarySchool', text: 'Grundschule' },
  gymnasium: { feld: 'solutionFrequencyGymnasium', wert: 'gymnasium', text: 'Gymnasium' },
};
const schulartVon = (pfad) => {
  if (/^\/groups\/3/.test(pfad) || /^\/schools\/gs-/.test(pfad)) return SCHULART.grundschule;
  if (/^\/groups\/\d/.test(pfad) || /^\/schools\/gym-/.test(pfad)) return SCHULART.gymnasium;
  return null;
};

export const fragtFairenVergleich = (pfad, query) =>
  /^\/(groups|schools)\/[^/]+\/items$/.test(pfad) &&
  listen(query.comparison ?? '').some((c) => FAIRER_VERGLEICH.has(c));

/** Je Wertegruppe der Ebene eine Wertegruppe „Fairer Vergleich“ mit den Bezugswerten der Schulart. */
export const fairerVergleich = (pfad, wertegruppen) => {
  const schulart = schulartVon(pfad);
  if (!schulart || !Array.isArray(wertegruppen)) return [];
  return wertegruppen
    .filter((vg) => vg.type === 'group' || vg.type === 'school')
    .map((vg) => ({
      ...vg,
      type: 'faircomparison',
      name: `Fairer Vergleich (${schulart.text})`,
      covariates: [{ type: 'schoolType', label: 'Schulart', value: schulart.wert }],
      properties: null,
      items: (vg.items ?? [])
        .filter((it) => Number.isFinite(it.parameters?.[schulart.feld]))
        .map((it) => ({
          ...it,
          descriptiveStatistics: { total: null, mean: it.parameters[schulart.feld], frequency: null, standardDeviation: null },
        })),
    }))
    .filter((vg) => vg.items.length > 0);
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

  if (fragtFairenVergleich(pfad, query)) {
    const { comparison, ...ohne } = query;
    const basis = antwortFuer(pfad, ohne);
    if (!Array.isArray(basis.daten)) return basis;
    // Andere Vergleichswerte der Anfrage kennt der Mock nicht; sie fallen weg.
    return { daten: [...basis.daten, ...fairerVergleich(pfad, basis.daten)], treffer: basis.treffer };
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
