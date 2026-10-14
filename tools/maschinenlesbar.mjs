// Was der Build für Werkzeuge schreibt, die die Seite lesen statt ansehen:
//
//   /gemeinsam/konsortium.json   Rückmeldungen und Baustein-Katalog als Daten
//   /sitemap.xml                 jede Seite, mit englischer Fassung (?lang=en)
//   /robots.txt                  alles erlaubt, Verweis auf die Sitemap
//
// Agents finden eine Seite meist über eine Suche oder einen Link und lesen dann
// ihr HTML. Darauf zielt das hier: die Sitemap für die Suche, das JSON für
// alles, was mit den Daten weiterarbeitet. Die Quelle bleibt
// apps/shared/konsortium.js — das JSON ist eine erzeugte Ansicht davon.

import {
  BAUSTEINE, EINRICHTUNGEN, FAECHER, ORIGINALE_STAND, QUELLE, RUECKMELDUNGEN, SCHICHTEN, STUFEN, ZIELGRUPPEN,
  originaleZu, rueckmeldungenZu,
} from '../apps/shared/konsortium.js';
import { DOKUMENTE } from './dokumente.mjs';
import { REITER } from './ohne-javascript.mjs';

/** Die öffentliche Adresse der Seite; über SITE_URL umzustellen. */
export const BASIS = (process.env.SITE_URL || 'https://tba3.softwarehub.schule').replace(/\/$/, '');

export function konsortiumJson() {
  return {
    beschreibung: {
      de: 'Die Rückmeldungen des TBA-III-Konsortiums und der Katalog der Bausteine, aus denen sie bestehen. Erzeugt aus apps/shared/konsortium.js (FWU-DE/tba3-demo-app).',
      en: 'The reports of the TBA III consortium and the catalogue of building blocks they are made of. Generated from apps/shared/konsortium.js (FWU-DE/tba3-demo-app).',
    },
    quelle: QUELLE,
    originaleStand: ORIGINALE_STAND || null,
    einrichtungen: EINRICHTUNGEN,
    faecher: FAECHER,
    stufen: STUFEN,
    zielgruppen: ZIELGRUPPEN,
    schichten: SCHICHTEN,
    rueckmeldungen: RUECKMELDUNGEN,
    bausteine: BAUSTEINE.map((b) => ({
      ...b,
      rueckmeldungen: rueckmeldungenZu(b.id).map((r) => r.id),
      originale: originaleZu(b.id).map(({ rueckmeldung, ...o }) => ({ ...o, rueckmeldung: rueckmeldung?.id ?? null })),
      demonstrator: b.element ? `/bausteine/#${b.element}` : null,
    })),
  };
}

/** Alle Seiten, die eine eigene Adresse haben. */
export function seiten() {
  return [
    '/',
    '/beispiele',
    '/demo/',
    ...REITER.map(([id]) => `/demo/?tab=${id}`),
    // Die Ansichten des Katalogs liegen hinter #/…; eine Sitemap kennt keine
    // Fragmente. Sie stehen dafür in der Fassung ohne JavaScript unter /katalog/.
    '/katalog/',
    '/bausteine/',
    '/schnittstelle',
    '/dokumentation',
    ...DOKUMENTE.map((d) => `/dokumentation/${d.slug}`),
  ];
}

const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Die englische Fassung einer Adresse: dieselbe Seite mit ?lang=en. */
const englisch = (pfad) => `${pfad}${pfad.includes('?') ? '&' : '?'}lang=en`;

export function sitemap(basis = BASIS) {
  const eintraege = seiten().flatMap((pfad) => [pfad, englisch(pfad)].map((adresse) => `  <url>
    <loc>${xml(basis + adresse)}</loc>
    <xhtml:link rel="alternate" hreflang="de" href="${xml(basis + pfad)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${xml(basis + englisch(pfad))}"/>
  </url>`));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${eintraege.join('\n')}
</urlset>
`;
}

export const robots = (basis = BASIS) => `User-agent: *
Allow: /

Sitemap: ${basis}/sitemap.xml
`;
