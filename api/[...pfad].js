// Eigener TBA3-Mock als Vercel-Funktion.
//
// Erreichbar über die Rewrites in vercel.json: /groups/**, /schools/**,
// /states/** und /tba3-api/** landen hier. Die Antworten stammen aus
// data/fixtures.mjs — einmal vom Referenzserver abgezogen, seitdem Teil des
// Repositories (npm run fixtures:update).

import { antwortFuer, stand, quelle } from '../tools/mock.mjs';

export default function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host ?? 'localhost'}`);

  // Vercel reicht den Originalpfad unter /api/… durch; /tba3-api ist die
  // Schreibweise, die das Docker-Image nutzt.
  const pfad = url.pathname.replace(/^\/api/, '').replace(/^\/tba3-api/, '');
  const query = Object.fromEntries(url.searchParams);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.setHeader('X-TBA3-Mock-Stand', stand);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const { daten, treffer } = antwortFuer(pfad, query);

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
