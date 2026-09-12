// Sprachwahl für alle Bereiche — Deutsch und Englisch.
//
// Die Wahl steht im localStorage und gilt damit für die ganze Seite: wer im
// Portal auf Englisch umschaltet, landet auch in Demoanwendung, Komponenten und
// Rückmeldungsbeispielen auf Englisch. Angewandt wird sie über `lang` am
// <html>-Element; die statischen Bereiche blenden darüber die jeweils andere
// Fassung aus (`[lang="en"] { display: none }`), React und Vue hören auf das
// Ereignis `tba3-sprache`.
//
// Das Modul wird an zwei Wegen geladen — zur Laufzeit von der Navigationsleiste
// unter /gemeinsam/, und gebündelt in Demo und Katalog. Beide Kopien halten
// ihren eigenen Zustand; zusammen bleiben sie über localStorage und das Ereignis.

export const SPRACHEN = { de: 'Deutsch', en: 'English' };
export const STANDARD = 'de';

const SCHLUESSEL = 'tba3-sprache';
const EREIGNIS = 'tba3-sprache';

const gueltig = (wert) => (wert && Object.hasOwn(SPRACHEN, wert) ? wert : null);

// localStorage kann verboten sein (privates Fenster, geblockte Website-Daten) —
// die Seite muss auch dann funktionieren, nur eben ohne Erinnerung.
const gespeichert = () => {
  try {
    return gueltig(localStorage.getItem(SCHLUESSEL));
  } catch {
    return null;
  }
};

const merken = (sprache) => {
  try {
    localStorage.setItem(SCHLUESSEL, sprache);
  } catch {
    /* ohne Erinnerung weiter */
  }
};

// ?lang=en macht eine Fassung verschickbar, ohne dass sie in jeder Adresse steht:
// einmal gelesen, wird sie gemerkt und gilt fortan auch ohne den Parameter.
const ausAdresse = () => {
  if (typeof location === 'undefined') return null;
  return gueltig(new URLSearchParams(location.search).get('lang'));
};

const ausBrowser = () => {
  if (typeof navigator === 'undefined') return null;
  return gueltig(navigator.language?.slice(0, 2).toLowerCase());
};

let aktiv = null;

/** Die aktuell gültige Sprache: `de` oder `en`. */
export function sprache() {
  if (!aktiv) aktiv = ausAdresse() ?? gespeichert() ?? ausBrowser() ?? STANDARD;
  return aktiv;
}

/** Setzt `lang` am <html>-Element. Ohne das greifen die Stilregeln nicht. */
export function anwenden() {
  const gewaehlt = sprache();
  if (typeof document !== 'undefined') document.documentElement.lang = gewaehlt;
  return gewaehlt;
}

/** Wechselt die Sprache und sagt allen Bereichen Bescheid. */
export function setzeSprache(neu) {
  const gewaehlt = gueltig(neu) ?? STANDARD;
  if (gewaehlt === sprache()) return gewaehlt;
  aktiv = gewaehlt;
  merken(gewaehlt);
  anwenden();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EREIGNIS, { detail: { sprache: gewaehlt } }));
  }
  return gewaehlt;
}

/** Meldet `rueckruf` bei jedem Wechsel. Gibt die Abmeldung zurück. */
export function beiSprachwechsel(rueckruf) {
  if (typeof window === 'undefined') return () => {};
  const hoerer = (ereignis) => rueckruf(ereignis.detail?.sprache ?? sprache());
  window.addEventListener(EREIGNIS, hoerer);
  return () => window.removeEventListener(EREIGNIS, hoerer);
}

/**
 * Greift aus `{ de: '…', en: '…' }` die passende Fassung heraus. Fehlt die
 * Übersetzung, steht lieber der deutsche Text da als gar keiner.
 */
export function text(woerterbuch, gewaehlt = sprache()) {
  if (woerterbuch == null) return '';
  if (typeof woerterbuch === 'string') return woerterbuch;
  return woerterbuch[gewaehlt] ?? woerterbuch[STANDARD] ?? '';
}

/**
 * Hält `<title>` und die Meta-Beschreibung zweisprachig. Für die statischen
 * Bereiche gedacht, deren übriger Text im Markup doppelt steht und über
 * `html[lang]` umgeschaltet wird — Attribute lassen sich so nicht abdecken.
 */
export function dokumentKopf({ titel, beschreibung } = {}) {
  const setzen = () => {
    if (titel) document.title = text(titel);
    const meta = beschreibung && document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', text(beschreibung));
  };
  setzen();
  return beiSprachwechsel(setzen);
}

// Die zweite Kopie des Moduls erfährt vom Wechsel nur über das Ereignis.
if (typeof window !== 'undefined') {
  window.addEventListener(EREIGNIS, (ereignis) => {
    aktiv = gueltig(ereignis.detail?.sprache) ?? aktiv;
  });
}
