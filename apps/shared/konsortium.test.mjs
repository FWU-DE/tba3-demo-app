import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BAUSTEINE, EINRICHTUNGEN, FILTER, RUECKMELDUNGEN, SCHICHTEN,
  bausteineVon, filtern, nachSchichten, optionen, rueckmeldungenZu,
} from './konsortium.js';
import { SPRACHEN, text } from './sprache.js';

const zweisprachig = (paar, wo) => {
  for (const sprache of Object.keys(SPRACHEN)) {
    expect(text(paar, sprache), `${wo} (${sprache})`).toBeTruthy();
  }
};

describe('Rückmeldungen', () => {
  it('führt die zehn Anwendungen mit eindeutigen Kennungen', () => {
    expect(RUECKMELDUNGEN).toHaveLength(10);
    expect(new Set(RUECKMELDUNGEN.map((r) => r.id)).size).toBe(10);
  });

  it('ordnet jede einer bekannten Einrichtung zu und lässt keine leer ausgehen', () => {
    for (const r of RUECKMELDUNGEN) expect(Object.keys(EINRICHTUNGEN)).toContain(r.einrichtung);
    for (const einrichtung of Object.keys(EINRICHTUNGEN)) {
      expect(filtern(RUECKMELDUNGEN, { einrichtung }).length, einrichtung).toBeGreaterThan(0);
    }
  });

  it('führt Titel, Beschreibung und Technik in beiden Sprachen', () => {
    for (const r of RUECKMELDUNGEN) {
      zweisprachig(r.titel, `${r.id}.titel`);
      zweisprachig(r.beschreibung, `${r.id}.beschreibung`);
      zweisprachig(r.technik, `${r.id}.technik`);
      if (r.hinweis) zweisprachig(r.hinweis, `${r.id}.hinweis`);
    }
  });

  // Der Zweck der Liste ist der Verweis. Ein Eintrag ohne jede Adresse wäre
  // eine Behauptung, dass es etwas gibt, und sonst nichts.
  it('nennt zu jeder Rückmeldung mindestens eine erreichbare Adresse', () => {
    for (const r of RUECKMELDUNGEN) {
      const adressen = [r.demo, r.code, r.doku].filter(Boolean);
      expect(adressen.length, r.id).toBeGreaterThan(0);
      for (const adresse of adressen) expect(adresse, r.id).toMatch(/^https:\/\//);
    }
  });

  it('kennt nur Bausteine, die im Katalog stehen', () => {
    const bekannt = new Set(BAUSTEINE.map((b) => b.id));
    for (const r of RUECKMELDUNGEN) {
      for (const id of r.bausteine) expect(bekannt, `${r.id} → ${id}`).toContain(id);
      // Dieselbe Zuordnung zweimal wäre in der Liste nicht zu sehen.
      expect(new Set(r.bausteine).size, r.id).toBe(r.bausteine.length);
    }
  });
});

describe('Katalog', () => {
  it('führt jeden Baustein einmal, in einer bekannten Schicht', () => {
    expect(new Set(BAUSTEINE.map((b) => b.id)).size).toBe(BAUSTEINE.length);
    for (const b of BAUSTEINE) expect(Object.keys(SCHICHTEN), b.id).toContain(b.schicht);
    expect(nachSchichten().reduce((n, s) => n + s.bausteine.length, 0)).toBe(BAUSTEINE.length);
  });

  it('führt Name, Zweck und Datenquelle in beiden Sprachen', () => {
    for (const b of BAUSTEINE) {
      zweisprachig(b.name, `${b.id}.name`);
      zweisprachig(b.zweck, `${b.id}.zweck`);
      zweisprachig(b.daten, `${b.id}.daten`);
    }
  });

  // Der Katalog ist aus den Sachberichten gezogen. Ein Eintrag, den kein
  // Sachbericht nennt und den auch @tba3/bausteine nicht führt, wäre eine
  // Erfindung — und genau die soll hier nicht stehen.
  it('belegt jeden Eintrag: entweder eine Rückmeldung nennt ihn oder die Bibliothek führt ihn', () => {
    for (const b of BAUSTEINE) {
      const belegt = rueckmeldungenZu(b.id).length > 0 || b.element !== null;
      expect(belegt, `${b.id} steht ohne Beleg im Katalog`).toBe(true);
    }
  });

  it('nennt zu jeder Schicht mindestens einen Baustein', () => {
    for (const { id, bausteine } of nachSchichten()) expect(bausteine.length, id).toBeGreaterThan(0);
  });

  it('gibt die Bausteine einer Rückmeldung in der Reihenfolge des Katalogs', () => {
    const isq = RUECKMELDUNGEN.find((r) => r.id === 'isq-portal');
    const gezogen = bausteineVon(isq).map((b) => b.id);
    expect(gezogen).toHaveLength(isq.bausteine.length);
    expect(gezogen).toEqual(BAUSTEINE.map((b) => b.id).filter((id) => gezogen.includes(id)));
  });

  // Die Demoanwendung zeichnet nur, wofür sie Daten hat. Steht dort eine
  // Ressource, die sie nicht abruft, bleibt die Kachel leer und niemand merkt
  // es — außer hier.
  it('nennt als Quelle nur Ressourcen, die die Demoanwendung kennt', () => {
    const bekannt = [null, 'competence-levels', 'items', 'items-schueler'];
    for (const b of BAUSTEINE) expect(bekannt, b.id).toContain(b.quelle);
    for (const b of BAUSTEINE) {
      if (b.quelle) expect(b.element, `${b.id}: Quelle ohne Baustein`).not.toBeNull();
    }
  });

  // Ein Verweis auf einen Reiter, den es nicht gibt, ist schlimmer als keiner:
  // er schickt jemanden los, der dann nichts findet.
  // Ein Katalogeintrag, der auf einen Baustein zeigt, den es nicht gibt, wäre
  // ein toter Verweis — die Herkunftszeile bliebe aus, und die Dokumentation
  // versprüche ein Element, das niemand einbauen kann.
  //
  // Den umgekehrten Fall fängt dieser Test nicht: dass ein gebauter Baustein
  // im Katalog **nicht** eingetragen wird. Genau das ist bei `glossar`
  // passiert — der Baustein war ausgeliefert, der Eintrag zeigte weiter auf
  // nichts, und der Herkunfts-Test war grün, weil er Erwartung und Wirklichkeit
  // aus derselben Quelle zieht. Diese Verbindung ist eine Absicht, und
  // Absichten prüft kein Test.
  it('verweist nur auf Bausteine, die es wirklich gibt', async () => {
    const { BAUPLAENE } = await import('../../packages/bausteine/webcomponents/index.js');
    const vorhanden = new Set(BAUPLAENE.map((b) => b.name));
    for (const b of BAUSTEINE.filter((x) => x.element)) {
      expect(vorhanden, `${b.id} → <tba3-${b.element}>`).toContain(b.element);
    }
  });

  it('verweist nur auf Reiter, die die Demoanwendung hat', () => {
    const reiter = ['competence', 'delta', 'items', 'aggregations', 'students', 'materials', 'elemente', 'help'];
    for (const b of BAUSTEINE) {
      if (b.reiter) expect(reiter, b.id).toContain(b.reiter);
    }
  });

  // Ein Eintrag, der weder gezeichnet wird noch sagt, wo die Frage sonst
  // beantwortet ist, hinterlässt in der Demoanwendung eine leere Fläche. Eine
  // Lücke darf stehen bleiben — aber nicht schweigen: dann gehört ein Grund
  // dazu, und der wird auf der Karte auch gezeigt.
  it('zeichnet einen Anzeigebaustein, nennt seinen Reiter oder begründet die Lücke', () => {
    for (const b of BAUSTEINE.filter((x) => x.schicht === 'anzeige')) {
      expect(
        Boolean(b.element) || Boolean(b.reiter) || Boolean(b.offen),
        `${b.id}: weder Baustein noch Reiter noch Begründung`,
      ).toBe(true);
    }
  });

  it('führt die Begründung einer Lücke in beiden Sprachen', () => {
    for (const b of BAUSTEINE.filter((x) => x.offen)) zweisprachig(b.offen, `${b.id}.offen`);
  });
});

describe('Filtern', () => {
  it('lässt ohne Auswahl alles durch', () => {
    expect(filtern(RUECKMELDUNGEN, {})).toHaveLength(10);
    expect(filtern(RUECKMELDUNGEN, { fach: '', stufe: '' })).toHaveLength(10);
  });

  it('schränkt je Feld ein und kombiniert die Felder', () => {
    const nurZepf = filtern(RUECKMELDUNGEN, { einrichtung: 'zepf' });
    expect(nurZepf).toHaveLength(3);

    const zepfLehrkraft = filtern(RUECKMELDUNGEN, { einrichtung: 'zepf', zielgruppe: 'lehrkraft' });
    expect(zepfLehrkraft.map((r) => r.id)).toEqual(['zepf-ma3', 'zepf-en8']);
  });

  // „Das Fach ist Filter, keine inhaltliche Festlegung" — eine fachunabhängige
  // Rückmeldung darf nicht verschwinden, sobald jemand ein Fach wählt. Genau
  // das wäre passiert, als das Feld noch ein einzelner Wert war.
  it('behält fachunabhängige Rückmeldungen in jeder Fachauswahl', () => {
    const fachunabhaengig = RUECKMELDUNGEN.filter((r) => r.faecher.length === 0).map((r) => r.id);
    expect(fachunabhaengig.length).toBeGreaterThan(0);
    for (const fach of ['DE', 'MA', 'EN', 'FR']) {
      const ids = filtern(RUECKMELDUNGEN, { fach }).map((r) => r.id);
      for (const id of fachunabhaengig) expect(ids, `${fach}: ${id}`).toContain(id);
    }
  });

  it('findet eine Rückmeldung über jedes ihrer mehreren Fächer', () => {
    for (const fach of ['DE', 'MA', 'EN', 'FR']) {
      expect(filtern(RUECKMELDUNGEN, { fach }).map((r) => r.id)).toContain('isq-portal');
    }
  });

  it('ignoriert Felder, die kein Filter sind', () => {
    // Sonst würde ein beliebiger Adressparameter die Liste leerfiltern.
    expect(filtern(RUECKMELDUNGEN, { erfunden: 'x' })).toHaveLength(10);
  });

  it('liefert eine leere Liste, wenn ein geschlossenes Feld nicht passt', () => {
    expect(filtern(RUECKMELDUNGEN, { einrichtung: 'gibtsnicht' })).toHaveLength(0);
  });

  // Ein unbekanntes Fach ist etwas anderes als ein unbekannter Träger: übrig
  // bleiben genau die Rückmeldungen, die für jedes Fach gelten. Das ist die
  // Kehrseite von `offen` und keine Nachlässigkeit — deshalb steht sie hier.
  it('behält bei einem unbekannten Fach nur die fachunabhängigen', () => {
    const uebrig = filtern(RUECKMELDUNGEN, { fach: 'gibtsnicht' });
    expect(uebrig.map((r) => r.id)).toEqual(
      RUECKMELDUNGEN.filter((r) => r.faecher.length === 0).map((r) => r.id),
    );
  });
});

describe('Optionen', () => {
  it('bietet nur Werte an, die zu mindestens einer Rückmeldung führen', () => {
    for (const { param } of FILTER) {
      for (const { wert } of optionen(RUECKMELDUNGEN, param)) {
        expect(filtern(RUECKMELDUNGEN, { [param]: wert }).length, `${param}=${wert}`).toBeGreaterThan(0);
      }
    }
  });

  it('deckt jede Zielgruppe des Vokabulars mit mindestens einer Rückmeldung ab', () => {
    expect(optionen(RUECKMELDUNGEN, 'zielgruppe').map((o) => o.wert))
      .toEqual(['lehrkraft', 'fachkonferenz', 'schulleitung', 'schulaufsicht', 'lernende']);
  });

  it('behält die Reihenfolge des Vokabulars bei', () => {
    expect(optionen(RUECKMELDUNGEN, 'fach').map((o) => o.wert)).toEqual(['DE', 'MA', 'EN', 'FR']);
  });

  it('gibt die Beschriftung zweisprachig heraus — übersetzt wird auf der Seite', () => {
    const [deutsch] = optionen(RUECKMELDUNGEN, 'fach');
    expect(text(deutsch.text, 'de')).toBe('Deutsch');
    expect(text(deutsch.text, 'en')).toBe('German');
  });

  it('gibt für ein unbekanntes Feld nichts zurück', () => {
    expect(optionen(RUECKMELDUNGEN, 'erfunden')).toEqual([]);
  });
});

describe('Zahlen im Fließtext', () => {
  // Die Zahl stand einmal in fünf Dateien und in beiden Sprachen ausgeschrieben.
  // Als die Liste von 16 auf 12 schrumpfte, wäre sie an jeder einzelnen Stelle
  // stehen geblieben; eine falsche Zahl auf der Startseite fällt niemandem auf,
  // der die Liste nicht nachzählt.
  // fileURLToPath statt `new URL(datei, import.meta.url)`: dieser Bereich
  // läuft unter jsdom, und dort ist import.meta.url keine file:-Adresse mehr.
  const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '../..');
  const lies = (datei) => readFileSync(join(WURZEL, datei), 'utf8');

  it('nennt überall dieselbe Anzahl Rückmeldungen wie die Liste', () => {
    const dateien = [
      'apps/shared/konsortium.js',
      'apps/beispiele/index.html',
      'apps/beispiele/README.md',
      'apps/portal/index.html',
      'apps/portal/dokumentation/bausteine-der-rueckmeldungen.md',
      'CLAUDE.md',
    ];
    const muster = /(\d+)\s+(?:Rückmeldungen|reports)\b/g;

    const gefunden = [];
    for (const datei of dateien) {
      for (const [ganz, zahl] of lies(datei).matchAll(muster)) gefunden.push({ datei, ganz, zahl: Number(zahl) });
    }

    expect(gefunden.length, 'keine Fundstelle — Formulierung geändert?').toBeGreaterThan(5);
    for (const { datei, ganz, zahl } of gefunden) {
      expect(zahl, `${datei}: „${ganz}"`).toBe(RUECKMELDUNGEN.length);
    }
  });

  it('nennt überall dieselbe Anzahl Bausteine wie der Katalog', () => {
    const dateien = ['apps/portal/dokumentation/bausteine-der-rueckmeldungen.md', 'CLAUDE.md'];
    const muster = /(\d+)\s+Bausteine\b/g;

    const gefunden = [];
    for (const datei of dateien) {
      for (const [ganz, zahl] of lies(datei).matchAll(muster)) gefunden.push({ datei, ganz, zahl: Number(zahl) });
    }

    expect(gefunden.length, 'keine Fundstelle — Formulierung geändert?').toBeGreaterThan(1);
    for (const { datei, ganz, zahl } of gefunden) {
      expect(zahl, `${datei}: „${ganz}"`).toBe(BAUSTEINE.length);
    }
  });
});
