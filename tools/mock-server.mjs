// Eigener TBA3-Mock als eigenständiger Server — für die Entwicklung
// (`npm run mock`, die Vite-Proxies zeigen hierher) und im Docker-Image,
// wo nginx /groups, /schools, /states und /lti-callback hierher weiterreicht.
//
// Dieselben Daten und dieselbe Logik wie die Vercel-Funktion (tools/mock.mjs).

import { createServer } from 'node:http';
import { antwortFuer, stand, quelle, schluessel } from './mock.mjs';

const port = Number(process.env.PORT) || 8000;

const sendeJson = (res, status, daten, kopfzeilen = {}) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'X-TBA3-Mock-Stand': stand,
    ...kopfzeilen,
  });
  res.end(JSON.stringify(daten));
};

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const pfad = url.pathname.replace(/^\/tba3-api/, '');

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // LTI 1.1 content-item callback: die Auswahl an das öffnende Fenster zurückgeben
  if (pfad === '/lti-callback') {
    if (req.method !== 'POST') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('LTI callback endpoint ready');
      return;
    }
    let koerper = '';
    req.on('data', (stueck) => { koerper += stueck; });
    req.on('end', () => {
      const nutzlast = Object.fromEntries(new URLSearchParams(koerper));
      const json = JSON.stringify(nutzlast).replace(/</g, '\\u003c');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<script>
  var data = ${json};
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'lti-content-items', payload: data }, '*');
  }
  if (window.opener) {
    window.opener.postMessage({ type: 'lti-content-items', payload: data }, '*');
  }
  document.body.innerHTML = '<p style="font-family:sans-serif;padding:20px">Materialien werden übertragen…</p>';
</script>
</body></html>`);
    });
    return;
  }

  if (pfad === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok\n');
    return;
  }

  const { daten, treffer } = antwortFuer(pfad, Object.fromEntries(url.searchParams));

  if (treffer === 'keiner') {
    sendeJson(res, 404, {
      fehler: 'Keine Beispieldaten für diese Anfrage',
      pfad,
      hinweis: `Beispieldaten stammen aus ${quelle}; bekannte Ids stehen in der Spezifikation.`,
    });
    return;
  }

  sendeJson(res, 200, daten, { 'X-TBA3-Mock-Treffer': treffer });
});

server.listen(port, () => {
  console.log(`TBA3-Mock       → http://localhost:${port}`);
  console.log(`  Antworten     → ${schluessel().length} (Stand ${stand.slice(0, 10)}, Quelle ${quelle})`);
  console.log(`  Beispiel      → http://localhost:${port}/groups/3a-deutsch/competence-levels`);
});
