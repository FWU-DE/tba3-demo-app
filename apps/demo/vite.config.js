import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ── LTI callback handler ───────────────────────────────────────────────────
// When a LTI content-item tool (e.g. MUNDO) is launched in an iframe, the
// user's browser POSTs the selected content_items back to our
// content_item_return_url.  This middleware receives that POST, extracts the
// form-encoded payload, and returns a tiny HTML page that relays the data to
// the parent frame via window.parent.postMessage so the React app can pick
// it up without any server-to-server communication.
const ltiCallbackPlugin = {
  name: 'lti-callback',
  configureServer(server) {
    server.middlewares.use('/lti-callback', (req, res) => {
      if (req.method !== 'POST') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('LTI callback endpoint ready');
        return;
      }

      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        let payload;
        try {
          // LTI 1.1 sends application/x-www-form-urlencoded
          const params = new URLSearchParams(body);
          payload = Object.fromEntries(params.entries());
        } catch {
          payload = { raw: body };
        }

        const json = JSON.stringify(payload).replace(/</g, '\\u003c');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<script>
  var data = ${json};
  // Relay to parent React app
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
    });
  },
};

// https://vite.dev/config/
// Die Demo wird unter /demo/ ausgeliefert (siehe tools/build-site.mjs).
export default defineConfig({
  base: '/demo/',
  plugins: [react(), ltiCallbackPlugin],
  server: {
    proxy: {
      '/groups': 'http://localhost:8000',
      '/schools': 'http://localhost:8000',
      '/states': 'http://localhost:8000',
    }
  }
})
