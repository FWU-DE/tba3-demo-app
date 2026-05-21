import { useState } from 'react';
import { useFilters } from '../../context/FilterContext';

// ── Settings dialog ────────────────────────────────────────────────────────────

const SettingsDialog = ({ onClose }) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleClearStorage = () => {
    localStorage.clear();
    setConfirmed(true);
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
              JR
            </div>
            <div>
              <p className="font-semibold text-gray-900 leading-none">Demo-Nutzer</p>
              <p className="text-xs text-gray-400 mt-0.5">demo@tba3.bildung.example</p>
            </div>
          </div>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* LocalStorage section */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Demo-Daten</p>
            </div>
            <div className="px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Lokale Daten zurücksetzen</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Löscht alle Zuweisungen, eigene Gruppen und importierten MUNDO-Materialien aus dem Browser-Speicher.
                  </p>
                </div>
                <button
                  onClick={handleClearStorage}
                  disabled={confirmed}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    confirmed
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  {confirmed ? '✓ Gelöscht' : 'Zurücksetzen'}
                </button>
              </div>
            </div>
          </div>

          {/* App info */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">App-Info</p>
            </div>
            <div className="px-4 py-3 space-y-1.5 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="font-mono text-gray-700">Demo</span>
              </div>
              <div className="flex justify-between">
                <span>Modus</span>
                <span className="font-mono text-gray-700">Mock Server</span>
              </div>
              <div className="flex justify-between">
                <span>Datenspeicher</span>
                <span className="font-mono text-gray-700">localStorage (Browser)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ── Header ─────────────────────────────────────────────────────────────────────

const Header = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { observerMode, setObserverMode } = useFilters();

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TBA3 Demo</h1>
              <p className="text-sm text-gray-600 mt-1">
                VERA Auswertungsschnittstelle – Interaktive Datenvisualisierung
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Mock Server
              </div>
              <button
                onClick={() => setObserverMode(!observerMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  observerMode
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={observerMode ? 'Observer-Modus deaktivieren' : 'Observer-Modus aktivieren — Namen werden unkenntlich gemacht'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {observerMode ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
                {observerMode ? 'Observer' : 'Namen'}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm transition-colors"
                title="Einstellungen"
              >
                JR
              </button>
            </div>
          </div>
        </div>
      </header>

      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} />}
    </>
  );
};

export default Header;
