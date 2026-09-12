// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Das Modul merkt sich die Sprache im Modulzustand — jeder Test bekommt deshalb
// über `resetModules` eine frische Kopie. Zwei Kopien nacheinander geholt sind
// genau die Lage im Betrieb: die Leiste lädt das Modul zur Laufzeit, Demo und
// Katalog bündeln es.
// jsdom meldet von sich aus en-US; die Tests setzen die Browsersprache deshalb
// selbst, statt sich auf die Umgebung zu verlassen.
const browserSprache = (wert) => {
  Object.defineProperty(navigator, 'language', { value: wert, configurable: true });
};

const frisch = async (adresse = '/') => {
  window.history.replaceState(null, '', adresse);
  document.documentElement.lang = 'de';
  vi.resetModules();
  return import('./sprache.js');
};

beforeEach(() => {
  localStorage.clear();
  browserSprache('de-DE');
});

describe('Sprachwahl', () => {
  it('nimmt die Sprache des Browsers, wenn nichts anderes vorliegt', async () => {
    browserSprache('en-GB');
    const { sprache } = await frisch();
    expect(sprache()).toBe('en');
  });

  it('nimmt Deutsch, wenn der Browser eine dritte Sprache meldet', async () => {
    browserSprache('fr-FR');
    const { sprache } = await frisch();
    expect(sprache()).toBe('de');
  });

  it('nimmt ohne Angaben Deutsch', async () => {
    const { sprache, STANDARD } = await frisch();
    expect(sprache()).toBe(STANDARD);
    expect(sprache()).toBe('de');
  });

  it('liest ?lang=en aus der Adresse', async () => {
    const { sprache } = await frisch('/?lang=en');
    expect(sprache()).toBe('en');
  });

  it('übergeht ein unbekanntes ?lang und nimmt die nächste Quelle', async () => {
    const { sprache } = await frisch('/?lang=kl');
    expect(sprache()).toBe('de');
  });

  it('lässt die gemerkte Wahl vor der Browsersprache gelten', async () => {
    browserSprache('en-GB');
    localStorage.setItem('tba3-sprache', 'de');
    const { sprache } = await frisch();
    expect(sprache()).toBe('de');
  });

  it('merkt sich den Wechsel und setzt lang am Dokument', async () => {
    const { setzeSprache } = await frisch();
    setzeSprache('en');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('tba3-sprache')).toBe('en');

    const { sprache } = await frisch();
    expect(sprache()).toBe('en');
  });

  it('sagt allen Bereichen Bescheid — auch einer zweiten Kopie des Moduls', async () => {
    const einer = await frisch();
    const anderer = await frisch();
    const gesehen = [];
    const abmelden = anderer.beiSprachwechsel((s) => gesehen.push(s));

    einer.setzeSprache('en');
    expect(gesehen).toEqual(['en']);
    expect(anderer.sprache()).toBe('en');

    abmelden();
    einer.setzeSprache('de');
    expect(gesehen).toEqual(['en']);
  });

  it('meldet denselben Wert nicht als Wechsel', async () => {
    const { setzeSprache, beiSprachwechsel } = await frisch();
    const gesehen = [];
    beiSprachwechsel((s) => gesehen.push(s));
    setzeSprache('de');
    expect(gesehen).toEqual([]);
  });
});

describe('Texte', () => {
  it('greift die passende Fassung heraus', async () => {
    const { text } = await frisch();
    expect(text({ de: 'Fach', en: 'Subject' }, 'en')).toBe('Subject');
    expect(text({ de: 'Fach', en: 'Subject' }, 'de')).toBe('Fach');
  });

  it('fällt auf Deutsch zurück, statt nichts anzuzeigen', async () => {
    const { text } = await frisch();
    expect(text({ de: 'Fach' }, 'en')).toBe('Fach');
    expect(text('unverändert', 'en')).toBe('unverändert');
    expect(text(null, 'en')).toBe('');
  });
});

describe('Dokumentkopf', () => {
  it('führt Titel und Beschreibung mit der Sprache mit', async () => {
    const { dokumentKopf, setzeSprache } = await frisch();
    document.head.innerHTML = '<meta name="description" content="" />';
    dokumentKopf({
      titel: { de: 'Titel', en: 'Title' },
      beschreibung: { de: 'Beschreibung', en: 'Description' },
    });
    expect(document.title).toBe('Titel');

    setzeSprache('en');
    expect(document.title).toBe('Title');
    expect(document.querySelector('meta[name="description"]').content).toBe('Description');
  });
});
