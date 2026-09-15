// Die Zuordnung der Materialien aus `/materials`.
//
// Der Test läuft gegen die echten Beispieldaten des Entwurfs, nicht gegen
// selbstgebaute: genau dort steckt der Fall, an dem eine naive Fassung
// scheitert — die Anhänge zeigen mal über `refName`, mal über `refId` auf die
// Kompetenzstufe, und einer zeigt auf eine UUID, zu der es keinen Namen gibt.
// Eine Zuordnung, die stumpf `refName === 'I'` prüft, ordnet auf diesen Daten
// nichts zu und meldet trotzdem Erfolg.

import { describe, expect, it } from 'vitest';
import { antwortFuer } from '../../../../../tools/mock.mjs';
import {
  LEVEL_KEYS,
  SCOPES,
  nachScope,
  planAnwenden,
  scopeVon,
  stufeAusAnhang,
  zuordnungsplan,
} from '../materialien';

const MATERIALIEN = antwortFuer('/materials', {}).daten;

describe('stufeAusAnhang', () => {
  it('nimmt den Namen, wenn es einen gibt', () => {
    expect(stufeAusAnhang({ refName: 'III', refId: 'egal' })).toBe('III');
  });

  it('faltet die Teilstufen des IQB auf die fünf Stufen der Anwendung', () => {
    // Das IQB teilt die unterste Stufe in Ia und Ib; hier gibt es nur I.
    expect(stufeAusAnhang({ refName: 'Ia' })).toBe('I');
    expect(stufeAusAnhang({ refName: 'Ib' })).toBe('I');
    expect(stufeAusAnhang({ refName: 'IIb' })).toBe('II');
  });

  it('nimmt die Kennung, wenn sie selbst die Stufe ist', () => {
    expect(stufeAusAnhang({ refId: 'IV' })).toBe('IV');
  });

  it('gibt auf, wo nichts aufzulösen ist', () => {
    // Eine UUID ohne Namen: die Kompetenzstufen der Gruppen kommen ohne `id`,
    // es gibt also nichts, wogegen sie sich auflösen ließe.
    expect(stufeAusAnhang({ refId: '18488a76-0cb6-4d16-9f7b-d2c69f73e058' })).toBeNull();
    expect(stufeAusAnhang({ refName: 'VI' })).toBeNull();
    expect(stufeAusAnhang({})).toBeNull();
    expect(stufeAusAnhang(undefined)).toBeNull();
  });
});

describe('nachScope', () => {
  it('ordnet die Beispieldaten in die Reihenfolge des Entwurfs', () => {
    const gruppen = nachScope(MATERIALIEN);
    const reihenfolge = gruppen.map((g) => g.scope);
    expect(reihenfolge).toEqual(SCOPES.filter((s) => reihenfolge.includes(s)));
    // Kein Material geht unterwegs verloren.
    expect(gruppen.reduce((n, g) => n + g.materialien.length, 0)).toBe(MATERIALIEN.length);
  });

  it('lässt leere Arten weg', () => {
    const gruppen = nachScope([{ id: 'a', attachments: [{ scope: 'test' }] }]);
    expect(gruppen).toHaveLength(1);
    expect(gruppen[0].scope).toBe('test');
  });

  it('nimmt ein Material ohne brauchbaren Anhang als allgemein', () => {
    expect(scopeVon({ id: 'a' })).toBe('general');
    expect(scopeVon({ id: 'a', attachments: [{ scope: 'quatsch' }] })).toBe('general');
  });
});

describe('zuordnungsplan', () => {
  const plan = zuordnungsplan(MATERIALIEN);

  it('ordnet auf den echten Beispieldaten überhaupt etwas zu', () => {
    // Der eigentliche Befund: eine Zuordnung über `refName === 'I'` käme hier
    // auf 0 und sähe trotzdem nach Erfolg aus.
    expect(plan.anzahl).toBeGreaterThan(0);
  });

  it('trifft die Stufen, die in den Beispieldaten stehen', () => {
    // Ia → I, sowie II, III und zweimal IV aus den Kennungen.
    expect(plan.jeStufe.I.map((m) => m.title)).toEqual(['Förderheft Leseverstehen — Stufe Ia']);
    expect(plan.jeStufe.II).toHaveLength(1);
    expect(plan.jeStufe.III).toHaveLength(1);
    expect(plan.jeStufe.IV).toHaveLength(2);
    expect(plan.jeStufe.V).toHaveLength(0);
  });

  it('nimmt Material ohne festes Ziel für alle Stufen', () => {
    expect(plan.allgemein).toHaveLength(2);
  });

  it('lässt liegen, was Kontext braucht — und verschweigt es nicht', () => {
    // Item, Aufgabe, Test, Kompetenz: nichts davon gehört automatisch an eine
    // Stufe. Zusammen mit den Zugeordneten muss die Rechnung aufgehen.
    const liegen = plan.ohneStufe.length;
    expect(liegen).toBeGreaterThan(0);
    expect(plan.anzahl + liegen).toBe(MATERIALIEN.length);
  });

  it('kommt mit einer leeren Antwort zurecht', () => {
    const leer = zuordnungsplan([]);
    expect(leer.anzahl).toBe(0);
    expect(leer.ohneStufe).toEqual([]);
    expect(Object.keys(leer.jeStufe)).toEqual(LEVEL_KEYS);
  });
});

describe('planAnwenden', () => {
  const plan = zuordnungsplan(MATERIALIEN);

  it('hängt an jede Stufe ihre eigenen und die allgemeinen Materialien', () => {
    const zuordnung = planAnwenden(plan, {});
    const allgemein = plan.allgemein.map((m) => m.id);
    for (const stufe of LEVEL_KEYS) {
      expect(zuordnung[stufe]).toEqual(expect.arrayContaining(allgemein));
    }
    expect(zuordnung.I).toEqual(expect.arrayContaining(plan.jeStufe.I.map((m) => m.id)));
  });

  it('lässt bestehende Zuweisungen stehen und verdoppelt nichts', () => {
    const vorher = { I: ['schon-da', plan.allgemein[0].id] };
    const zuordnung = planAnwenden(plan, vorher);
    expect(zuordnung.I).toContain('schon-da');
    expect(zuordnung.I.filter((id) => id === plan.allgemein[0].id)).toHaveLength(1);
  });
});
