// Eigener TBA3-Mock als Vercel-Funktion.
//
// Erreichbar über die Rewrites in vercel.json: /groups/**, /schools/**,
// /states/** und /tba3-api/** landen hier, den ursprünglichen Pfad im
// Parameter `pfad`. Die Antworten stammen aus data/fixtures.mjs — einmal vom
// Referenzserver abgezogen, seitdem Teil des Repositories
// (npm run fixtures:update).
//
// Bewusst ein fester Dateiname statt api/[...pfad].js: außerhalb von Next.js
// routet Vercel eine Catch-all-Funktion nur einstufig ('^/api/([^/]+)$'),
// mehrgliedrige Pfade wie /api/groups/3a-deutsch/items liefen in einen 404.

import { antwortFuer, stand, quelle } from '../tools/mock.mjs';

export default function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host ?? 'localhost'}`);
  const query = Object.fromEntries(url.searchParams);

  // Den Originalpfad setzt der Rewrite in `pfad`; beim direkten Aufruf steht er
  // im Pfad selbst.
  const { pfad: ausRewrite, ...restQuery } = query;
  const pfad = ausRewrite
    ? `/${ausRewrite.replace(/^\/+/, '')}`
    : url.pathname.replace(/^\/api/, '').replace(/^\/tba3-api/, '');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.setHeader('X-TBA3-Mock-Stand', stand);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const { daten, treffer } = antwortFuer(pfad, restQuery);

  if (treffer === 'keiner') {
    res.status(404).json({
      fehler: 'Keine Beispieldaten für diese Anfrage',
      pfad,
      hinweis: `Dieser Mock liefert die Beispieldaten aus ${quelle}. Bekannte Ids stehen in der Spezifikation unter /schnittstelle.`,
    });
    return;
  }

  // Sagt ehrlich, ob die angefragte Parameterkombination hinterlegt ist oder
  // ob auf eine allgemeinere Antwort ausgewichen wurde.
  res.setHeader('X-TBA3-Mock-Treffer', treffer);
  res.status(200).json(daten);
}
