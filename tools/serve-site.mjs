// Liefert das gebaute dist/ so aus, wie Vercel es tut — inklusive der
// API-Rewrites aus vercel.json. Damit lässt sich der zusammengesetzte Build
// lokal prüfen, bevor er deployt wird.
//
//   npm run build && npm run preview   → http://localhost:4173
//
// Backend über TBA3_API_BASE_URL umstellbar (z. B. auf den lokalen Mock-Server).

import { createServer } from 'node:http';
import { antwortFuer } from './mock.mjs';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const port = Number(process.env.PORT) || 4173;
// Ohne gesetzte Variable antwortet der eigene Mock aus data/fixtures.mjs —
// so läuft die Vorschau ohne Netz und zeigt dieselben Daten wie das Deployment.
const apiBase = process.env.TBA3_API_BASE_URL || null;

const API_PREFIXES = ['/groups', '/schools', '/states'];
// Bereiche mit eigenem SPA-Fallback — Reihenfolge wie in vercel.json
const SPA_ROOTS = ['/demo', '/katalog', '/beispiele'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const sendFile = (res, file) => {
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
};

const isFile = (p) => existsSync(p) && statSync(p).isFile();

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const pathname = decodeURIComponent(url.pathname);

  // 1. API — eigener Mock, oder Weiterleitung an ein echtes Backend
  const apiPrefix = API_PREFIXES.find((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (apiPrefix) {
    if (!apiBase) {
      const { daten, treffer } = antwortFuer(pathname, Object.fromEntries(url.searchParams));
      const status = treffer === 'keiner' ? 404 : 200;
      res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'X-TBA3-Mock-Treffer': treffer,
      });
      res.end(JSON.stringify(treffer === 'keiner'
        ? { fehler: 'Keine Beispieldaten für diese Anfrage', pfad: pathname }
        : daten));
      return;
    }
    try {
      const upstream = await fetch(`${apiBase}${pathname}${url.search}`, {
        headers: { Accept: 'application/json' },
      });
      res.writeHead(upstream.status, {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
      });
      res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Backend nicht erreichbar (${apiBase}): ${err.message}\n`);
    }
    return;
  }

  // 2. Referenz-Backend durchreichen (wie /referenz-api in vercel.json)
  if (pathname === '/referenz-api' || pathname.startsWith('/referenz-api/')) {
    const ziel = `https://apps.indibit.eu/tba3-api${pathname.slice('/referenz-api'.length)}${url.search}`;
    try {
      const upstream = await fetch(ziel, { headers: { Accept: 'application/json' } });
      res.writeHead(upstream.status, {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
      });
      res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Referenz-Backend nicht erreichbar: ${err.message}\n`);
    }
    return;
  }

  // 3. Statische Datei
  const rel = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const candidate = join(dist, rel);
  if (isFile(candidate)) return sendFile(res, candidate);
  if (isFile(join(candidate, 'index.html'))) return sendFile(res, join(candidate, 'index.html'));

  // 4. SPA-Fallback des jeweiligen Bereichs, sonst Portal
  const spaRoot = SPA_ROOTS.find((p) => pathname.startsWith(`${p}/`));
  const fallback = join(dist, spaRoot ? `${spaRoot}/index.html` : 'index.html');
  if (isFile(fallback)) return sendFile(res, fallback);

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 — nicht gefunden. Wurde `npm run build` ausgeführt?\n');
});

if (!existsSync(dist)) {
  console.error('dist/ fehlt — zuerst `npm run build` ausführen.');
  process.exit(1);
}

server.listen(port, () => {
  console.log(`TBA3-Site      → http://localhost:${port}`);
  console.log(`  Demo         → http://localhost:${port}/demo`);
  console.log(`  Katalog      → http://localhost:${port}/katalog`);
  console.log(`  Schnittstelle→ http://localhost:${port}/schnittstelle`);
  console.log(`  API          → ${apiBase ?? 'eigener Mock (data/fixtures.mjs)'}`);
});
