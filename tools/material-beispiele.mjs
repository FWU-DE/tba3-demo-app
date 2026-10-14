// Beispielwerte für die Parameter von /materials in der API-Referenz.
//
// Der Entwurf (indibit-eu/tba3#54) beschreibt die Parameter, nennt aber nicht
// für jeden einen Wert. In „Try it out“ steht dann ein leeres Feld, und wer die
// Kennungen der Beispieldaten nicht kennt, weiß nicht, was er eintragen soll.
// Die Werte hier stammen aus genau diesen Beispieldaten (data/material-fixtures.mjs);
// tools/mock.test.mjs prüft, dass jeder von ihnen mindestens ein Material liefert.
//
// tools/build-material-spec.mjs ergänzt sie beim Zusammensetzen. Ein Parameter,
// der im Entwurf schon Beispiele trägt, behält sie.

export const BEISPIELE = {
  test: {
    'Testheft VERA 8 Deutsch': 'V8-2024-DE-TH01',
  },
  exercise: {
    'Aufgaben-ID': 'ex-at-the-summer-camp-001',
  },
  competence: {
    'Kompetenz-URI': 'https://w3id.org/kim/schulfaecher/s1002',
    'Name der Kompetenz': 'name:Leitidee Lesen',
  },
  competenceLevel: {
    'Kürzel der Stufe': 'nameShort:Ia',
    'ID der Stufe': 'IV',
  },
  subject: {
    Deutsch: 'de',
  },
  domain: {
    Leseverstehen: 'le',
  },
  kind: {
    Fördermaterial: 'support',
    'Lösungen und Beispiele': 'solution,example',
  },
  language: {
    Deutsch: 'de',
  },
  audience: {
    Lehrkräfte: 'teacher',
    Eltern: 'parents',
  },
};

export const ID_BEISPIEL = { Förderheft: '9a21ad44-3e8b-4a1e-9f76-2a1e8a6b0e5a' };

const alsExamples = (werte) =>
  Object.fromEntries(Object.entries(werte).map(([name, value]) => [name, { value }]));

// Swagger UI trägt in „Try it out“ das erste Beispiel jedes Parameters schon ein.
// Stünde dort ein echter Wert, filterte „Execute“ nach allen Parametern zugleich
// und lieferte eine leere Liste. Deshalb steht vorn ein leerer Eintrag — ein
// leerer Parameter wird nicht gesendet —, und die Beispiele wählt man aus.
export const KEIN_FILTER = '— kein Filter —';

/** Ergänzt Beispiele an /materials und /materials/{id}, ohne vorhandene zu überschreiben. */
export function beispieleErgaenzen(spec) {
  for (const p of spec.paths['/materials'].get.parameters) {
    const vorhanden = p.examples ?? (BEISPIELE[p.name] ? alsExamples(BEISPIELE[p.name]) : null);
    if (!vorhanden) continue;
    const { [KEIN_FILTER]: _, ...rest } = vorhanden;
    p.examples = { [KEIN_FILTER]: { value: '' }, ...rest };
    // Die Auswahlliste zeigt zunächst nur „kein Filter“; die Werte stehen
    // deshalb auch sichtbar in der Beschreibung.
    const werte = Object.values(rest).map((e) => `\`${e.value}\``).join(', ');
    const zeile = `Beispiele aus den Demodaten: ${werte}.`;
    if (BEISPIELE[p.name] && !String(p.description ?? '').includes('Beispiele aus den Demodaten')) {
      p.description = `${String(p.description ?? '').trimEnd()}\n\n${zeile}\n`;
    }
  }
  for (const p of spec.paths['/materials/{id}'].get.parameters) {
    if (p.name === 'id' && !p.examples) p.examples = alsExamples(ID_BEISPIEL);
  }
  return spec;
}
