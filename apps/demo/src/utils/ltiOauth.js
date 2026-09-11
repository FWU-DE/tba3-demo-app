/**
 * Minimal OAuth 1.0a signing for LTI 1.1 ContentItemSelectionRequest.
 * Uses the Web Crypto API (SubtleCrypto) — no external dependencies.
 */

// RFC 3986 percent-encoding (stricter than encodeURIComponent for !, ', (, ), *)
const enc = (s) =>
  encodeURIComponent(String(s))
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
// Note: encodeURIComponent already encodes * → %2A, so no need to replace

/** HMAC-SHA1 via SubtleCrypto, returns base64 string */
const hmacSha1 = async (key, message) => {
  const te = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    te.encode(key),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, te.encode(message));
  // Avoid spread on large arrays; iterate instead
  const bytes = new Uint8Array(sig);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

/**
 * Build and sign an LTI 1.1 ContentItemSelectionRequest parameter map.
 */
export const buildLtiParams = async (toolUrl, consumerKey, consumerSecret, returnUrl) => {
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const timestamp = String(Math.floor(Date.now() / 1000));

  const params = {
    // LTI required
    lti_message_type: 'ContentItemSelectionRequest',
    lti_version: 'LTI-1p0',
    resource_link_id: 'tba3-material-picker',
    // OAuth
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_version: '1.0',
    // Content item selection
    content_item_return_url: returnUrl,
    accept_media_types: 'application/vnd.ims.lti.v1.ltilink,text/html',
    accept_presentation_document_targets: 'window',
    // Context
    roles: 'Instructor',
    context_id: 'tba3-demo',
  };

  // Build the OAuth signature base string (RFC 5849 §3.4.1)
  // Sort by percent-encoded key, then by percent-encoded value
  const normalised = Object.entries(params)
    .map(([k, v]) => [enc(k), enc(v)])
    .sort(([ka, va], [kb, vb]) => (ka < kb ? -1 : ka > kb ? 1 : va < vb ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const base = `POST&${enc(toolUrl)}&${enc(normalised)}`;
  const signingKey = `${enc(consumerSecret)}&`; // token secret is empty

  const signature = await hmacSha1(signingKey, base);

  return { ...params, oauth_signature: signature };
};

/**
 * Open a popup window and submit the LTI launch form into it.
 * Using about:blank + document.write gives the form a real origin
 * (window.location.origin) instead of null (blob URL), avoiding
 * CSRF/origin checks on the LTI tool server.
 *
 * @returns {Window} The popup window reference
 */
export const launchLtiPopup = async (toolUrl, consumerKey, consumerSecret, returnUrl) => {
  const params = await buildLtiParams(toolUrl, consumerKey, consumerSecret, returnUrl);

  const xmlEsc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const inputs = Object.entries(params)
    .map(([k, v]) => `<input type="hidden" name="${xmlEsc(k)}" value="${xmlEsc(v)}">`)
    .join('\n');

  const popup = window.open(
    'about:blank',
    'mundo-lti',
    'width=1100,height=750,left=100,top=80,resizable=yes,scrollbars=yes'
  );

  if (!popup) throw new Error('Popup wurde blockiert. Bitte Popup-Blocker für diese Seite deaktivieren.');

  // Write directly into the popup — origin becomes window.location.origin, not null
  popup.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>MUNDO wird geladen…</title></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#6b7280;">
<div>
  <p style="font-size:1.1rem">MUNDO wird gestartet…</p>
  <form id="lti" method="POST" action="${xmlEsc(toolUrl)}">
${inputs}
  </form>
</div>
<script>document.getElementById('lti').submit();</script>
</body></html>`);
  popup.document.close();

  return popup;
};
