import { useEffect, useRef, useState } from 'react';
import { launchLtiPopup } from '../../utils/ltiOauth';

// ── Constants ─────────────────────────────────────────────────────────────────

const CONFIG_KEY = 'tba3_mundo_lti_config';

const MUNDO_DEFAULTS = {
  toolUrl:      'https://mundo.schule/lti/',
  consumerKey:  'none',
  sharedSecret: 'none',
};

const defaultConfig = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null');
    return stored ?? MUNDO_DEFAULTS;
  } catch { return MUNDO_DEFAULTS; }
};

const saveConfig = (cfg) => localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));

/** Derive the LTI callback URL from the current window origin */
const callbackUrl = () => `${window.location.origin}/lti-callback`;

// ── Parse the LTI content-item response ──────────────────────────────────────

const newId = () =>
  `mundo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const isAbsoluteUrl = (s) => typeof s === 'string' && /^https?:\/\//i.test(s);

const parseContentItems = (payload) => {
  // LTI 1.1 content_items is a JSON-encoded string in the form field
  let raw = payload;
  if (typeof payload?.content_items === 'string') {
    try { raw = JSON.parse(payload.content_items); } catch { /* fall through */ }
  }

  // Log raw payload so we can see what MUNDO actually returns
  console.log('[MUNDO LTI] raw payload:', JSON.stringify(raw, null, 2));

  const graph =
    raw?.['@graph'] ??
    raw?.content_items ??
    (Array.isArray(raw) ? raw : null);

  if (!graph) return [];

  return graph.map((item) => {
    console.log('[MUNDO LTI] item:', JSON.stringify(item));

    // @id in JSON-LD is often a local reference like ":item1", not a real URL.
    // Only use it as URL if it actually looks like one.
    // For LtiLinkItem, MUNDO sends no direct URL – derive it from the SODIX ID
    // in custom.mn: https://mundo.schule/material/<SODIX-ID>
    const sodixId = item.custom?.mn || item.custom?.id;
    const sodixUrl = sodixId ? `https://mundo.schule/details/${sodixId}` : null;

    const url =
      item.url ||
      item.launch_url ||
      item.href ||
      item.canonicalUrl ||
      (isAbsoluteUrl(item['@id']) ? item['@id'] : null) ||
      sodixUrl ||
      '';

    const title = item.title || item.text || item.label || 'MUNDO Material';
    const desc  = item.description || item.text || '';
    const thumb =
      (isAbsoluteUrl(item.thumbnail?.['@id']) ? item.thumbnail['@id'] : null) ||
      item.thumbnail?.url ||
      item.icon?.url ||
      null;

    return { id: newId(), title, description: desc, url, thumbnail: thumb, source: 'mundo', _raw: item };
  }).filter((i) => i.title);
};

// ── Sub-components ────────────────────────────────────────────────────────────

const ItemRow = ({ item, onRemove }) => (
  <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
    {item.thumbnail ? (
      <img src={item.thumbnail} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0 bg-gray-100" />
    ) : (
      <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
        <span className="text-blue-600 font-bold text-sm">M</span>
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
      {item.description && (
        <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
      )}
      {item.url ? (
        <a href={item.url} target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline truncate block mt-0.5">
          {item.url}
        </a>
      ) : (
        <span className="text-xs text-amber-500 mt-0.5 block">
          ⚠ URL fehlt – siehe Browser-Konsole (MUNDO LTI)
        </span>
      )}
    </div>
    {onRemove && (
      <button onClick={() => onRemove(item.id)}
        className="text-xs text-red-400 hover:text-red-600 flex-shrink-0 px-1 pt-0.5"
        title="Entfernen">✕</button>
    )}
  </div>
);

const ManualEntry = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [url,   setUrl]   = useState('');
  const [desc,  setDesc]  = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ id: newId(), title: title.trim(), description: desc.trim(), url: url.trim(), thumbnail: null, source: 'mundo' });
    setTitle(''); setUrl(''); setDesc('');
  };

  return (
    <form onSubmit={submit} className="space-y-2 p-6">
      <p className="text-sm text-gray-600 mb-3">
        Suche auf{' '}
        <a href="https://mundo.schule/search" target="_blank" rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-medium">
          mundo.schule ↗
        </a>{' '}
        und trage das Material hier ein:
      </p>
      <input required value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Titel *"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
      <input value={url} onChange={(e) => setUrl(e.target.value)}
        placeholder="URL (optional)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
      <input value={desc} onChange={(e) => setDesc(e.target.value)}
        placeholder="Beschreibung (optional)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
      <button type="submit" disabled={!title.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
        Hinzufügen
      </button>
    </form>
  );
};

// ── LTI config panel ──────────────────────────────────────────────────────────

const ConfigPanel = ({ config, onChange }) => {
  const [local, setLocal] = useState({ ...MUNDO_DEFAULTS, ...config });

  const set = (k, v) => setLocal((p) => ({ ...p, [k]: v }));

  const save = (e) => {
    e.preventDefault();
    onChange(local);
  };

  return (
    <form onSubmit={save} className="p-6 space-y-4">
      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-800">
        <span className="text-lg flex-shrink-0">ℹ️</span>
        <p>
          Zugangsdaten findest du auf{' '}
          <a href="https://mundo.schule/cms/lti" target="_blank" rel="noopener noreferrer"
            className="font-semibold underline">
            mundo.schule/cms/lti ↗
          </a>
          . Kopiere <em>Consumer-Key</em> und <em>Shared Secret</em> und trage sie hier ein.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">LTI Tool-URL</label>
          <input value={local.toolUrl ?? ''} onChange={(e) => set('toolUrl', e.target.value)}
            placeholder={MUNDO_DEFAULTS.toolUrl}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <p className="text-xs text-gray-400 mt-0.5">Die eigentliche Launch-URL des LTI-Tools (nicht die Info-Seite)</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Consumer Key</label>
          <input value={local.consumerKey ?? ''} onChange={(e) => set('consumerKey', e.target.value)}
            placeholder={MUNDO_DEFAULTS.consumerKey}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Shared Secret</label>
          <input type="password" value={local.sharedSecret ?? ''} onChange={(e) => set('sharedSecret', e.target.value)}
            placeholder={MUNDO_DEFAULTS.sharedSecret}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          Speichern &amp; LTI starten
        </button>
        <p className="text-xs text-gray-400">
          Callback-URL: <code className="bg-gray-100 px-1 rounded">{callbackUrl()}</code>
        </p>
      </div>
    </form>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────

const MundoSearchModal = ({ onSelect, onClose }) => {
  const popupRef = useRef(null);

  const [tab,      setTab]      = useState('lti');
  const [config,   setConfig]   = useState(defaultConfig);
  const [launching, setLaunching] = useState(false);
  const [launched,  setLaunched]  = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [launchErr, setLaunchErr] = useState(null);
  const [items,    setItems]    = useState([]);

  const hasConfig = !!(config.toolUrl && config.consumerKey && config.sharedSecret);

  // ── postMessage listener (popup sends window.opener.postMessage) ──
  useEffect(() => {
    const handler = (event) => {
      const data = event.data;
      if (!data) return;

      let parsed = [];
      if (data.type === 'lti-content-items' && data.payload) {
        parsed = parseContentItems(data.payload);
      } else {
        parsed = parseContentItems(data);
      }

      if (parsed.length > 0) {
        setItems((prev) => {
          const existing = new Set(prev.map((i) => i.url || i.title));
          return [...prev, ...parsed.filter((p) => !existing.has(p.url || p.title))];
        });
        // Close popup automatically after selection
        if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
        setPopupOpen(false);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Poll popup closed state
  useEffect(() => {
    if (!popupOpen) return;
    const id = setInterval(() => {
      if (popupRef.current?.closed) {
        setPopupOpen(false);
        clearInterval(id);
      }
    }, 500);
    return () => clearInterval(id);
  }, [popupOpen]);

  // Auto-launch on first open
  useEffect(() => {
    if (hasConfig) launch(config);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── LTI launch via popup (about:blank + document.write avoids Origin:null) ──
  const launch = async (cfg) => {
    setLaunchErr(null);
    setLaunching(true);
    setTab('lti');
    try {
      const popup = await launchLtiPopup(
        cfg.toolUrl,
        cfg.consumerKey,
        cfg.sharedSecret,
        callbackUrl()
      );
      popupRef.current = popup;
      setLaunched(true);
      setPopupOpen(true);
    } catch (err) {
      setLaunchErr(err.message);
    } finally {
      setLaunching(false);
    }
  };

  const handleConfigSave = (cfg) => {
    saveConfig(cfg);
    setConfig(cfg);
    launch(cfg);
  };

  const removeItem = (id) => setItems((p) => p.filter((i) => i.id !== id));
  const addManual  = (item) => setItems((p) => [...p, item]);

  const handleConfirm = () => {
    if (items.length === 0) return;
    onSelect(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
              <img src="https://mundo.schule/favicon.ico" alt="" className="w-6 h-6"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-none">MUNDO Materialsuche</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                LTI 1.1 ·{' '}
                {popupOpen
                  ? <span className="text-green-600 font-medium">Popup geöffnet</span>
                  : launched
                  ? <span className="text-gray-500">Popup geschlossen</span>
                  : <span>nicht gestartet</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs">
              {[
                { key: 'lti',    label: 'LTI-Suche' },
                { key: 'manual', label: 'Manuell' },
                { key: 'config', label: '⚙ Konfig' },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    tab === key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={onClose}
              className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
              ✕
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex min-h-0">

          {/* Left: status / manual / config */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

            {/* LTI tab */}
            {tab === 'lti' && (
              <div className="p-6 flex flex-col gap-4">
                {launching && (
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <svg className="animate-spin h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    LTI-Anfrage wird signiert…
                  </div>
                )}

                {launchErr && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {launchErr}
                  </div>
                )}

                {!launching && (
                  <div className={`flex items-start gap-4 p-4 rounded-xl border-2 ${
                    popupOpen ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <span className="text-3xl flex-shrink-0">{popupOpen ? '🟢' : '🌍'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {popupOpen ? 'MUNDO ist geöffnet' : launched ? 'Popup wurde geschlossen' : 'MUNDO Suche starten'}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {popupOpen
                          ? 'Suche und wähle Materialien im MUNDO-Fenster aus. Sie erscheinen automatisch rechts.'
                          : launched
                          ? 'Das Popup wurde geschlossen. Erneut öffnen oder links ausgewählte Materialien übernehmen.'
                          : 'Öffnet ein Popup-Fenster mit der MUNDO-Suche über LTI.'}
                      </p>
                    </div>
                    <button
                      onClick={() => launch(config)}
                      disabled={launching}
                      className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {launched && !popupOpen ? 'Erneut öffnen' : 'Öffnen'}
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  Callback-URL:{' '}
                  <code className="bg-gray-100 px-1 rounded">{callbackUrl()}</code>
                </p>
              </div>
            )}

            {/* Manual tab */}
            {tab === 'manual' && <ManualEntry onAdd={addManual} />}

            {/* Config tab */}
            {tab === 'config' && (
              <ConfigPanel config={config} onChange={handleConfigSave} />
            )}
          </div>

          {/* Right sidebar: selected items */}
          <div className="w-72 flex-shrink-0 border-l border-gray-100 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ausgewählt{items.length > 0 && ` (${items.length})`}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              {items.length === 0 ? (
                <p className="text-xs text-gray-400 text-center pt-8 leading-relaxed">
                  Materialien in der LTI-Suche auswählen.<br/>
                  Sie erscheinen hier automatisch.
                </p>
              ) : (
                items.map((item) => (
                  <ItemRow key={item.id} item={item} onRemove={removeItem} />
                ))
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-100">
              <button onClick={handleConfirm} disabled={items.length === 0}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  items.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}>
                {items.length > 0
                  ? `${items.length} Material${items.length !== 1 ? 'ien' : ''} übernehmen`
                  : 'Materialien auswählen'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">Werden direkt zugewiesen</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MundoSearchModal;
