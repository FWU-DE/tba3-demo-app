import { describe, it, expect } from 'vitest';
import { antwortFuer, normalisiereAbfrage, schluessel, stand } from './mock.mjs';

describe('Schlüssel', () => {
  it('lässt Parameter weg, die die Antwort nicht verändern', () => {
    // gender und languageAtHome kennt die Spezifikation nicht; die Demoanwendung
    // schickt sie trotzdem mit.
    expect(normalisiereAbfrage('/groups/3a/items', { type: 'students', gender: 'f' }))
      .toBe('/groups/3a/items?type=students');
  });

  it('ordnet Parameter stabil und ignoriert leere Werte', () => {
    expect(normalisiereAbfrage('/g/a', { type: 'x', aggregation: 'y' }))
      .toBe(normalisiereAbfrage('/g/a', { aggregation: 'y', type: 'x' }));
    expect(normalisiereAbfrage('/g/a', { type: '' })).toBe('/g/a');
  });

  it('schneidet abschließende Schrägstriche ab', () => {
    expect(normalisiereAbfrage('/materials/', {})).toBe('/materials');
  });
});

describe('Beispieldaten', () => {
  it('hält Antworten für alle drei Ebenen bereit', () => {
    const alle = schluessel();
    expect(alle.some((k) => k.startsWith('/groups/'))).toBe(true);
    expect(alle.some((k) => k.startsWith('/schools/'))).toBe(true);
    expect(alle.some((k) => k.startsWith('/states/'))).toBe(true);
    expect(stand).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('liefert Kompetenzstufen einer Lerngruppe', () => {
    const { daten, treffer } = antwortFuer('/groups/3a-deutsch/competence-levels');
    expect(treffer).toBe('genau');
    expect(Array.isArray(daten)).toBe(true);
    expect(daten[0].competenceLevels.length).toBeGreaterThan(0);
  });

  it('setzt type=group,students aus beiden Teilantworten zusammen', () => {
    const gruppe = antwortFuer('/groups/8a-deutsch/items').daten;
    const schueler = antwortFuer('/groups/8a-deutsch/items', { type: 'students' }).daten;
    const beides = antwortFuer('/groups/8a-deutsch/items', { type: 'group,students' }).daten;

    expect(beides).toHaveLength(gruppe.length + schueler.length);
    expect(beides.filter((e) => e.type === 'student')).toHaveLength(schueler.length);
  });

  it('weicht auf die allgemeinere Antwort aus, wenn die Kombination fehlt', () => {
    // Der Referenzserver lehnt aggregation=gender mit type=students ab.
    const { daten, treffer } = antwortFuer('/schools/gs-musterstadt/aggregations', {
      aggregation: 'gender',
      type: 'students',
    });
    expect(treffer).toBe('ersatz');
    expect(daten).toBeTruthy();
  });

  it('meldet unbekannte Ids als nicht gefunden', () => {
    expect(antwortFuer('/groups/gibtsnicht/items').treffer).toBe('keiner');
    expect(antwortFuer('/groups/gibtsnicht/items').daten).toBeNull();
  });

  it('beantwortet Pfade mit abschließendem Schrägstrich gleich', () => {
    const ohne = antwortFuer('/groups/3a-deutsch/competence-levels');
    const mit = antwortFuer('/groups/3a-deutsch/competence-levels/');
    expect(mit.treffer).toBe(ohne.treffer);
    expect(mit.daten).toEqual(ohne.daten);
  });
});

describe('Materialien', () => {
  const materialien = (query) => antwortFuer('/materials', query).daten;

  it('liefert ohne Filter alle Beispiele des Entwurfs', () => {
    expect(materialien({}).length).toBeGreaterThan(5);
  });

  it('filtert nach Art des Materials', () => {
    const treffer = materialien({ kind: 'solution' });
    expect(treffer.length).toBeGreaterThan(0);
    expect(treffer.every((m) => m.kind === 'solution')).toBe(true);
  });

  it('filtert nach Bezugspunkt', () => {
    const treffer = materialien({ scope: 'competence-level' });
    expect(treffer.length).toBeGreaterThan(0);
    expect(treffer.every((m) => m.attachments.some((a) => a.scope === 'competence-level'))).toBe(true);
  });

  it('versteht mehrere Bezugspunkte kommasepariert', () => {
    const einzeln = materialien({ scope: 'exercise' }).length;
    const zusammen = materialien({ scope: 'exercise,item' }).length;
    expect(zusammen).toBeGreaterThanOrEqual(einzeln);
  });

  it('berücksichtigt den Qualifizierer bei mehrdeutigen Kennungen', () => {
    const mitQualifizierer = materialien({ item: 'iqbId:AB1021' });
    expect(mitQualifizierer.length).toBeGreaterThan(0);
    expect(
      mitQualifizierer.every((m) =>
        m.attachments.some((a) => a.scope === 'item' && a.refKind === 'iqbId' && a.refId === 'AB1021')
      )
    ).toBe(true);

    // Derselbe Wert ohne passenden Qualifizierer trifft nichts
    expect(materialien({ item: 'nameShort:AB1021' })).toHaveLength(0);
  });

  it('findet Kompetenzstufen über das Kürzel', () => {
    expect(materialien({ competenceLevel: 'nameShort:Ia' }).length).toBeGreaterThan(0);
  });

  it('verknüpft mehrere Filter mit und', () => {
    const nurArt = materialien({ kind: 'support' }).length;
    const beides = materialien({ kind: 'support', audience: 'parents' }).length;
    expect(beides).toBeLessThanOrEqual(nurArt);
  });

  it('gibt bei unbekanntem Filterwert eine leere Liste zurück, keinen Fehler', () => {
    expect(materialien({ kind: 'gibtsnicht' })).toEqual([]);
  });

  it('liefert ein einzelnes Material über seine Id', () => {
    const [erstes] = materialien({});
    const { daten, treffer } = antwortFuer(`/materials/${erstes.id}`);
    expect(treffer).toBe('genau');
    expect(daten.title).toBe(erstes.title);
  });
});
