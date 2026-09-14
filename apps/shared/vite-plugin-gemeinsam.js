import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));

const TYP = { '.js': 'text/javascript', '.css': 'text/css' };

/**
 * Liefert die gemeinsamen Dateien — Navigationsleiste, Sprachwahl und die
 * Containerregel — im Dev-Server unter /gemeinsam/ aus. Im Build übernimmt
 * das tools/build-site.mjs.
 */
export const gemeinsameDateien = () => ({
  name: 'tba3-gemeinsame-dateien',
  configureServer(server) {
    server.middlewares.use('/gemeinsam', (req, res, next) => {
      const datei = (req.url ?? '/').split('?')[0].replace(/^\/+/, '');
      const treffer = /^[\w.-]+(\.js|\.css)$/.exec(datei);
      if (!treffer) return next();
      try {
        const inhalt = readFileSync(join(HIER, datei), 'utf8');
        res.setHeader('Content-Type', `${TYP[treffer[1]]}; charset=utf-8`);
        res.end(inhalt);
      } catch {
        next();
      }
    });
  },
});

export default gemeinsameDateien;
