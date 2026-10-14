// Die Common Cartridge, die der Reiter „Lernmaterialien“ ausgibt.
//
// Der Anlass war ein Import in Moodle 4.5, der an zwei Stellen scheiterte: die
// Cartridge trug den Namensraum von Version 1.3, den Moodle nicht kennt
// („unbekanntes Format“), und nach dem Umstellen auf 1.1 brach die
// Schemaprüfung ab, weil die Organisation einen eigenen <title> trug statt
// eines Wurzel-items. Beides fällt in keinem Browser auf — nur beim Import.

import { afterEach, describe, expect, it } from 'vitest';
import { setzeSprache } from '../../i18n';
import { buildManifest, buildMaterialHtml } from '../commonCartridgeExport';

const gruppe = { id: '__level_export__', name: 'Nach Kompetenzstufe' };
const material = {
  id: 'mundo-1',
  title: 'Flächeninhalt von Rechtecken',
  description: '',
  url: 'https://mundo.schule/details/SODIX-1',
  source: 'mundo',
};
const eintrag = (stufe, id) => ({
  group: gruppe,
  levelKey: stufe,
  material: { ...material, id, title: `Material ${id}` },
  resourceId: `res_${stufe}_${id}`,
  filePath: `content/stufe_${stufe}/${id}.html`,
});

const lies = (xml) => {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  return doc;
};

afterEach(() => setzeSprache('de'));

describe('das Manifest', () => {
  const xml = buildManifest([eintrag('II', 'a'), eintrag('II', 'b'), eintrag('III', 'c')]);

  it('ist Common Cartridge 1.1 — die Fassung, die Moodle beim Import erkennt', () => {
    const doc = lies(xml);
    expect(doc.documentElement.namespaceURI).toBe('http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1');
    expect(doc.getElementsByTagName('schemaversion')[0].textContent).toBe('1.1.0');
    expect(xml).not.toContain('imsccv1p3');
  });

  it('hängt die Gliederung an genau ein Wurzel-item ohne Titel', () => {
    const doc = lies(xml);
    const organisation = doc.getElementsByTagName('organization')[0];
    const kinder = [...organisation.children];
    expect(kinder.map((k) => k.localName)).toEqual(['item']);
    expect([...kinder[0].children].some((k) => k.localName === 'title')).toBe(false);
  });

  it('verweist aus jedem Blatt der Gliederung auf eine Ressource, die es gibt', () => {
    const doc = lies(xml);
    const ressourcen = new Set([...doc.getElementsByTagName('resource')].map((r) => r.getAttribute('identifier')));
    const verweise = [...doc.getElementsByTagName('item')]
      .map((i) => i.getAttribute('identifierref'))
      .filter(Boolean);
    expect(verweise).toHaveLength(3);
    for (const ref of verweise) expect(ressourcen.has(ref)).toBe(true);
  });

  it('nennt die Sprache, in der exportiert wurde', () => {
    setzeSprache('en');
    const doc = lies(buildManifest([eintrag('II', 'a')]));
    expect(doc.getElementsByTagName('lom:language')[0].textContent).toBe('en');
    expect(doc.getElementsByTagName('lom:string')[0].textContent).toBe('TBA3 learning materials');
  });
});

describe('die Seite je Material', () => {
  it('ist in der gewählten Sprache beschriftet, nicht halb deutsch', () => {
    setzeSprache('en');
    const html = buildMaterialHtml({ ...material, description: 'x' }, gruppe, 'II');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('Description');
    expect(html).toContain('Assigned to');
    expect(html).not.toMatch(/Beschreibung|Zugeordnet an|Gruppe:/);
  });

  it('lässt eine leere Beschreibung weg, statt eine leere Überschrift zu setzen', () => {
    const html = buildMaterialHtml(material, gruppe, 'II');
    expect(html).not.toContain('<h2>Beschreibung</h2>');
    expect(html).toContain('https://mundo.schule/details/SODIX-1');
  });
});
