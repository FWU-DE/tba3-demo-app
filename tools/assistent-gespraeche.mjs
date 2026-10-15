// Mockups für das Teilkonzept „Ein Assistent, der die Auswertung lesen kann“.
//
// Die Gespräche sind ausgedacht, die Zahlen nicht: jedes Szenario ruft die
// Werkzeuge des MCP-Piloten (`mcp-server/`) über einen echten MCP-Client auf,
// gegen den Mock der Vorschau, und baut die Antwort aus dem, was zurückkommt.
// Ändern sich die Beispieldaten, ändern sich die Bilder mit.
//
// Genutzt von tools/dokumentbilder.mjs. Braucht die Abhängigkeiten des
// MCP-Pakets (`npm --prefix mcp-server ci`) — das Paket ist bewusst kein
// Workspace.

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const SDK = join(WURZEL, 'mcp-server/node_modules/@modelcontextprotocol/sdk/dist/esm/client');

export const bereit = () => existsSync(join(SDK, 'index.js'));

/** Startet den MCP-Server per stdio und gibt eine Aufruffunktion zurück, die mitschreibt. */
async function verbinden(basis) {
  const { Client } = await import(pathToFileURL(join(SDK, 'index.js')).href);
  const { StdioClientTransport } = await import(pathToFileURL(join(SDK, 'stdio.js')).href);
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(WURZEL, 'mcp-server/index.js')],
    env: { ...process.env, TBA3_API_BASE_URL: basis },
  });
  const client = new Client({ name: 'tba3-dokumentbilder', version: '1.0.0' });
  await client.connect(transport);
  return {
    async rufen(protokoll, name, args) {
      const antwort = await client.callTool({ name, arguments: args });
      if (antwort.isError) throw new Error(`${name}: ${antwort.content?.[0]?.text}`);
      const daten = antwort.structuredContent;
      protokoll.push({ name, args, daten });
      return daten;
    },
    schliessen: () => client.close(),
  };
}

// ── Rechnen ──────────────────────────────────────────────────────────────────

const stufen = (vg) => Object.fromEntries((vg.competenceLevels ?? [])
  .map((s) => [s.nameShort, s.descriptiveStatistics?.frequency ?? 0]));
const summe = (o, keys) => keys.reduce((s, k) => s + (o[k] ?? 0), 0);
const gesamt = (vg) => vg.competenceLevels?.[0]?.descriptiveStatistics?.total ?? 0;

/** Anteil unter dem Mindeststandard (I bzw. Ia+Ib) und ab Regelstandard (III–V), in Prozent. */
const kennzahlen = (vg) => {
  const s = stufen(vg);
  const n = gesamt(vg);
  return {
    n,
    unter: Math.round((summe(s, ['I', 'Ia', 'Ib']) / n) * 100),
    ab: Math.round((summe(s, ['III', 'IV', 'V']) / n) * 100),
  };
};

const prozent = (x) => `${Math.round(x * 100)} %`;
const ART = {
  diagnostic: { de: 'Diagnose', en: 'diagnosis' },
  support: { de: 'Förderung', en: 'support' },
  didactic: { de: 'Didaktik', en: 'teaching guide' },
};
const zahl = (x) => `${x}`;

// ── Die Szenarien ────────────────────────────────────────────────────────────

async function vergleich(w) {
  const p = [];
  await w.rufen(p, 'tba3_list_entities', { entityType: 'group', subject: 'DE', grade: 'V3' });
  const klasse = (await w.rufen(p, 'tba3_get_competence_levels', { entityType: 'group', entityId: '3a-deutsch' }))
    .valueGroups.find((v) => v.domain?.name === 'le');
  const schule = (await w.rufen(p, 'tba3_get_competence_levels', { entityType: 'school', entityId: 'gs-musterstadt' }))
    .valueGroups.find((v) => v.type === 'school' && v.subject?.name === 'Deutsch' && v.domain?.name === 'le');
  const land = (await w.rufen(p, 'tba3_get_competence_levels', { entityType: 'state', entityId: 'beispielland' }))
    .valueGroups.filter((v) => v.name.startsWith('V3') && v.subject?.name === 'Deutsch' && v.domain?.name === 'le');
  const k = kennzahlen(klasse);
  const s = kennzahlen(schule);
  const l = land.map((v) => ({ heft: v.name.split('-').at(-1), ...kennzahlen(v) }));

  const zeilen = [
    { de: 'Ihre 3a', en: 'Your 3a', ...k },
    { de: 'Grundschule Musterstadt', en: 'Musterstadt primary school', ...s },
    ...l.map((x) => ({ de: `Land, Testheft ${x.heft}`, en: `State, test booklet ${x.heft}`, ...x })),
  ];
  // Die Sätze folgen aus den Zahlen, nicht umgekehrt.
  const lage = (a, b, sprache) => {
    const d = a - b;
    if (Math.abs(d) <= 2) return sprache === 'de' ? 'etwa auf dem Schulwert' : 'about level with the school';
    const wie = Math.abs(d) <= 6 ? (sprache === 'de' ? 'knapp' : 'slightly') : (sprache === 'de' ? 'deutlich' : 'clearly');
    return sprache === 'de' ? `${wie} ${d > 0 ? 'über' : 'unter'} dem Schulwert` : `${wie} ${d > 0 ? 'above' : 'below'} the school`;
  };
  const tabelle = (sprache) => `<table><thead><tr><th></th><th>${sprache === 'de' ? 'unter Mindeststandard' : 'below minimum standard'}</th><th>${sprache === 'de' ? 'Regelstandard und darüber' : 'standard and above'}</th></tr></thead><tbody>${
    zeilen.map((z) => `<tr><td>${z[sprache]} <span class="n">n = ${z.n}</span></td><td>${z.unter} %</td><td>${z.ab} %</td></tr>`).join('')}</tbody></table>`;

  return {
    id: 'vergleich',
    rolle: { de: 'Lehrkraft, 3a', en: 'Teacher, 3a' },
    frage: {
      de: 'Wie steht meine 3a im Leseverstehen da – im Vergleich zur Schule und zum Land?',
      en: 'How is my 3a doing in reading – compared with the school and the state?',
    },
    protokoll: p,
    antwort: {
      de: `<p>So verteilt sich Ihre 3a im <strong>Leseverstehen</strong>:</p>${tabelle('de')}
<p>${k.unter} % Ihrer Klasse liegen unter dem Mindeststandard, an der Schule sind es ${s.unter} %. Beim Regelstandard liegt die Klasse ${lage(k.ab, s.ab, 'de')}.</p>
<p class="vorbehalt">Für das Land liefert die Schnittstelle zwei Testhefte (${l.map((x) => x.heft).join(', ')}). Welches Ihre Klasse geschrieben hat, steht nicht in der Antwort – ich nenne deshalb beide.</p>`,
      en: `<p>This is how your 3a is distributed in <strong>reading</strong>:</p>${tabelle('en')}
<p>${k.unter} % of your class are below the minimum standard, compared with ${s.unter} % across the school. At the standard level, the class is ${lage(k.ab, s.ab, 'en')}.</p>
<p class="vorbehalt">For the state, the interface returns two test booklets (${l.map((x) => x.heft).join(', ')}). The response does not say which one your class took – so I list both.</p>`,
    },
  };
}

async function aufgabenUndMaterial(w) {
  const p = [];
  const vgs = (await w.rufen(p, 'tba3_get_items', { entityType: 'group', entityId: '3a-mathe' })).valueGroups;
  const aufgaben = vgs.flatMap((v) => v.items.map((it) => ({
    nr: it.name.replace(/\.0$/, ''),
    titel: (it.exercise?.name ?? '').replace(/_/g, ' '),
    stufe: it.parameters?.competenceLevel?.nameShort,
    klasse: it.descriptiveStatistics?.mean,
    bezug: it.parameters?.solutionFrequencyPrimarySchool,
  }))).filter((a) => Number.isFinite(a.klasse) && Number.isFinite(a.bezug))
    .sort((a, b) => (a.klasse - a.bezug) - (b.klasse - b.bezug))
    .slice(0, 3);
  const material = (await w.rufen(p, 'tba3_list_materials', { subject: 'MA', grade: 'V3', targetLevel: 'II' })).items;

  const liste = (sprache) => `<table><thead><tr><th>${sprache === 'de' ? 'Aufgabe' : 'Item'}</th><th>${sprache === 'de' ? 'Stufe' : 'Level'}</th><th>3a</th><th>${sprache === 'de' ? 'Grundschulen' : 'Primary schools'}</th></tr></thead><tbody>${
    aufgaben.map((a) => `<tr><td>${a.nr} ${a.titel}</td><td>${a.stufe}</td><td>${prozent(a.klasse)}</td><td>${prozent(a.bezug)}</td></tr>`).join('')}</tbody></table>`;
  const mat = (sprache) => `<ul>${material.map((m) => `<li><span class="link">${m.title.replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü')}</span> <span class="n">${ART[m.type]?.[sprache] ?? m.type}</span></li>`).join('')}</ul>`;

  return {
    id: 'material',
    rolle: { de: 'Lehrkraft, 3a', en: 'Teacher, 3a' },
    frage: {
      de: 'Bei welchen Mathe-Aufgaben lag die 3a deutlich unter anderen Grundschulen? Gibt es Material für die Kinder auf Stufe II?',
      en: 'Which maths items did 3a do clearly worse on than other primary schools? Is there material for the children at level II?',
    },
    protokoll: p,
    antwort: {
      de: `<p>Den größten Abstand zur Lösungshäufigkeit an Grundschulen hat die 3a bei diesen Aufgaben:</p>${liste('de')}
<p>Für Stufe II in Klasse 3 führt der Materialkatalog ${zahl(material.length)} Einträge aus „Mathe sicher können“:</p>${mat('de')}
<p class="vorbehalt">Die Aufgaben liegen auf den Stufen ${[...new Set(aufgaben.map((a) => a.stufe))].join(' und ')}. Das Material ist für Stufe II gedacht. Ob es zu diesen Aufgaben passt, entscheiden Sie.</p>`,
      en: `<p>Your 3a shows the largest gap to the solution frequency at primary schools on these items:</p>${liste('en')}
<p>For level II in grade 3, the material catalogue lists ${zahl(material.length)} entries from “Mathe sicher können”:</p>${mat('en')}
<p class="vorbehalt">The items are at levels ${[...new Set(aufgaben.map((a) => a.stufe))].join(' and ')}. The material is meant for level II. Whether it fits these items is your call.</p>`,
    },
  };
}

async function grenze(w) {
  const p = [];
  const vgs = (await w.rufen(p, 'tba3_get_competence_levels', { entityType: 'group', entityId: '3a-deutsch', type: 'students' })).valueGroups;
  const unter = vgs.filter((v) => v.domain?.name === 'le' && v.competenceLevels?.some((s) => s.nameShort === 'I'));
  const merkmal = (v, typ) => v.covariates?.find((c) => c.type === typ)?.value ?? '–';
  const zeilen = (sprache) => `<table><thead><tr><th>Code</th><th>${sprache === 'de' ? 'Geschlecht' : 'Gender'}</th><th>${sprache === 'de' ? 'Familiensprache' : 'Language at home'}</th></tr></thead><tbody>${
    unter.map((v) => `<tr><td>${v.name}</td><td>${merkmal(v, 'gender')}</td><td>${merkmal(v, 'languageAtHome')}</td></tr>`).join('')}</tbody></table>`;

  return {
    id: 'grenze',
    rolle: { de: 'Lehrkraft, 3a', en: 'Teacher, 3a' },
    frage: {
      de: 'Welche Kinder in der 3a liegen im Leseverstehen unter dem Mindeststandard?',
      en: 'Which children in 3a are below the minimum standard in reading?',
    },
    protokoll: p,
    warnung: true,
    antwort: {
      de: `<p>${unter.length} Kinder liegen im Leseverstehen auf Stufe I:</p>${zeilen('de')}
<p class="vorbehalt">Diese Einzeldaten hat der Assistent abgerufen und an das Sprachmodell weitergegeben, samt Geschlecht und Familiensprache. Im Pilot hält ihn nichts davon ab.</p>`,
      en: `<p>${unter.length} children are at level I in reading:</p>${zeilen('en')}
<p class="vorbehalt">The assistant retrieved this individual data and passed it to the language model, including gender and language at home. In the pilot, nothing stops it.</p>`,
    },
  };
}

/** Ruft alle Szenarien gegen `basis` auf. */
export async function aufnehmen(basis) {
  const w = await verbinden(basis);
  try {
    return [await vergleich(w), await aufgabenUndMaterial(w), await grenze(w)];
  } finally {
    await w.schliessen();
  }
}

// ── Darstellung ──────────────────────────────────────────────────────────────

const TEXTE = {
  de: {
    kopf: 'Assistent',
    verbunden: 'verbunden mit: TBA3-Ergebnisdaten (MCP-Server)',
    werkzeuge: (n) => `${n} ${n === 1 ? 'Abfrage' : 'Abfragen'} an die Auswertungsschnittstelle`,
    mockup: 'Nachgestelltes Gespräch · Zahlen aus echten Abfragen an die Beispieldaten',
    eingabe: 'Frage stellen …',
  },
  en: {
    kopf: 'Assistant',
    verbunden: 'connected to: TBA3 result data (MCP server)',
    werkzeuge: (n) => `${n} ${n === 1 ? 'query' : 'queries'} to the results interface`,
    mockup: 'Re-enacted conversation · figures from real queries against the sample data',
    eingabe: 'Ask a question …',
  },
};

const kurz = (args) => Object.entries(args)
  .map(([k, v]) => `<span class="k">${k}</span>=${v}`).join(' ');

const ergebnis = (daten) => {
  if (Array.isArray(daten?.valueGroups)) return `${daten.valueGroups.length} value groups`;
  if (Number.isFinite(daten?.count)) return `${daten.count} items`;
  return '';
};

export function seite(szenario, sprache) {
  const t = TEXTE[sprache];
  const aufrufe = szenario.protokoll.map((a) => `<li><span class="werkzeug">${a.name}</span> ${kurz(a.args)} <span class="ergebnis">→ ${ergebnis(a.daten)}</span></li>`).join('');
  return `<!doctype html><html lang="${sprache}"><head><meta charset="utf-8"><style>
* { box-sizing: border-box; }
body { margin: 0; padding: 24px; background: #e9edf2; font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; color: #1f2937; }
.gespraech { width: 760px; background: #fff; border-radius: 14px; box-shadow: 0 6px 24px rgba(15,23,42,.12); overflow: hidden; }
.kopf { display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-bottom: 1px solid #e5e7eb; }
.logo { width: 28px; height: 28px; border-radius: 8px; background: #4f46e5; color: #fff; display: grid; place-items: center; font-weight: 700; }
.kopf b { font-size: 15px; }
.kopf small { display: block; color: #059669; font-size: 12px; }
.kopf small::before { content: "●"; margin-right: 5px; }
.verlauf { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
.frage { align-self: flex-end; max-width: 78%; background: #eef2ff; border-radius: 14px 14px 4px 14px; padding: 10px 14px; }
.frage .rolle { display: block; font-size: 11px; color: #6366f1; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
.aufrufe { border: 1px solid #e5e7eb; border-radius: 10px; background: #f9fafb; padding: 8px 12px; font-size: 12.5px; }
.aufrufe summary { list-style: none; color: #4b5563; font-weight: 600; }
.aufrufe summary::before { content: "⚙ "; }
.aufrufe ul { margin: 6px 0 0; padding: 0; list-style: none; font-family: ui-monospace, Menlo, monospace; font-size: 11.5px; }
.aufrufe li { padding: 2px 0; color: #374151; }
.werkzeug { color: #4f46e5; font-weight: 600; }
.k { color: #6b7280; }
.ergebnis { color: #059669; }
.antwort { max-width: 92%; }
.antwort p { margin: 0 0 8px; }
.antwort table { border-collapse: collapse; margin: 4px 0 10px; font-size: 13.5px; }
.antwort th { text-align: left; font-weight: 600; color: #6b7280; font-size: 12px; padding: 4px 14px 4px 0; border-bottom: 1px solid #e5e7eb; }
.antwort td { padding: 4px 14px 4px 0; border-bottom: 1px solid #f3f4f6; }
.antwort td + td { font-variant-numeric: tabular-nums; }
.antwort ul { margin: 0 0 10px; padding-left: 18px; }
.n { color: #9ca3af; font-size: 12px; }
.link { color: #2563eb; text-decoration: underline; }
.vorbehalt { color: #6b7280; font-size: 13.5px; border-left: 3px solid #d1d5db; padding-left: 10px; }
.warnung .vorbehalt { color: #991b1b; border-left-color: #ef4444; background: #fef2f2; padding: 6px 10px; }
.eingabe { margin: 0 18px 18px; border: 1px solid #d1d5db; border-radius: 10px; padding: 10px 14px; color: #9ca3af; }
.mockup { padding: 8px 18px; background: #fffbeb; color: #92400e; font-size: 11.5px; border-top: 1px solid #fde68a; }
</style></head><body>
<div class="gespraech${szenario.warnung ? ' warnung' : ''}">
  <div class="kopf"><div class="logo">A</div><div><b>${t.kopf}</b><small>${t.verbunden}</small></div></div>
  <div class="verlauf">
    <div class="frage"><span class="rolle">${szenario.rolle[sprache]}</span>${szenario.frage[sprache]}</div>
    <details class="aufrufe" open><summary>${t.werkzeuge(szenario.protokoll.length)}</summary><ul>${aufrufe}</ul></details>
    <div class="antwort">${szenario.antwort[sprache]}</div>
  </div>
  <div class="eingabe">${t.eingabe}</div>
  <div class="mockup">${t.mockup}</div>
</div></body></html>`;
}

// ── Schaubild ────────────────────────────────────────────────────────────────

const SCHAUBILD = {
  de: {
    kaesten: [
      ['Lehrkraft', 'fragt in eigenen Worten'],
      ['Assistent', 'ein Sprachmodell: wählt die Abfragen und formuliert die Antwort'],
      ['MCP-Server', 'beschreibt sieben Werkzeuge: welche Abfragen es gibt und was sie brauchen'],
      ['Auswertungsschnittstelle', 'TBA3: liefert die Zahlen, wie jeder Rückmeldung'],
    ],
    pfeile: ['Frage\nAntwort', 'Werkzeugaufruf\nDaten', 'Anfrage\nWertegruppen'],
    grenze: 'Hier verlassen die Daten die Schule, wenn das Sprachmodell ein fremder Dienst ist.',
    mockup: 'Schema',
  },
  en: {
    kaesten: [
      ['Teacher', 'asks in their own words'],
      ['Assistant', 'a language model: picks the queries and phrases the answer'],
      ['MCP server', 'describes seven tools: which queries exist and what they need'],
      ['Results interface', 'TBA3: returns the figures, as for any report'],
    ],
    pfeile: ['question\nanswer', 'tool call\ndata', 'request\nvalue groups'],
    grenze: 'This is where the data leaves the school if the language model is an external service.',
    mockup: 'Diagram',
  },
};

export function schaubild(sprache) {
  const t = SCHAUBILD[sprache];
  const teile = t.kaesten.flatMap(([titel, text], i) => [
    `<div class="kasten k${i}"><b>${titel}</b><span>${text}</span></div>`,
    i < t.pfeile.length ? `<div class="pfeil${i === 1 ? ' grenze' : ''}"><span>${t.pfeile[i]}</span><i></i></div>` : '',
  ]).join('');
  return `<!doctype html><html lang="${sprache}"><head><meta charset="utf-8"><style>
body { margin: 0; padding: 24px; background: #fff; font: 14px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif; color: #1f2937; }
.schaubild { width: 1120px; padding: 20px 8px 8px; }
* { box-sizing: border-box; }
.reihe { display: flex; align-items: center; }
.kasten { flex: 0 0 200px; min-height: 110px; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 6px; border: 2px solid; }
.kasten b { font-size: 15px; }
.kasten span { font-size: 13px; color: #4b5563; }
.k0 { border-color: #a5b4fc; background: #eef2ff; }
.k1 { border-color: #c4b5fd; background: #f5f3ff; }
.k2 { border-color: #99f6e4; background: #f0fdfa; }
.k3 { border-color: #bfdbfe; background: #eff6ff; }
.pfeil { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 0 6px; }
.pfeil span { font-size: 12px; color: #6b7280; text-align: center; white-space: pre-line; }
.pfeil i { display: block; width: 100%; height: 2px; background: #9ca3af; position: relative; }
.pfeil i::before, .pfeil i::after { content: ""; position: absolute; top: -5px; border: 6px solid transparent; }
.pfeil i::after { right: -2px; border-left-color: #9ca3af; }
.pfeil i::before { left: -2px; border-right-color: #9ca3af; }
.grenze i { background: #ef4444; }
.grenze i::after { border-left-color: #ef4444; }
.grenze i::before { border-right-color: #ef4444; }
.hinweis { margin: 14px 0 0 455px; max-width: 330px; font-size: 12.5px; color: #991b1b; border-left: 3px solid #ef4444; padding: 4px 10px; background: #fef2f2; }
</style></head><body><div class="schaubild"><div class="reihe">${teile}</div><p class="hinweis">↑ ${t.grenze}</p></div></body></html>`;
}
