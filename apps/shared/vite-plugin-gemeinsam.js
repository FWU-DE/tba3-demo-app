import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));

/**
 * Liefert die gemeinsamen Dateien (bisher die Navigationsleiste) im Dev-Server
 * unter /gemeinsam/ aus. Im Build übernimmt das tools/build-site.mjs.
 */
export const gemeinsameDateien = () => ({
  name: 'tba3-gemeinsame-dateien',
  configureServer(server) {
    server.middlewares.use('/gemeinsam', (req, res, next) => {
      const datei = (req.url ?? '/').split('?')[0].replace(/^\/+/, '');
      if (!/^[\w.-]+\.js$/.test(datei)) return next();
      try {
        const inhalt = readFileSync(join(HIER, datei), 'utf8');
        res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
        res.end(inhalt);
      } catch {
        next();
      }
    });
  },
});

export default gemeinsameDateien;
