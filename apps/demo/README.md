# TBA3 Demo Application

Eine moderne, interaktive Frontend-Demo-Anwendung zur Visualisierung von Bildungstestdaten über die TBA3 (VERA Auswertungsschnittstelle) API.

> Teil des TBA3-Schaufensters — siehe [README im Repository-Wurzelverzeichnis](../../README.md).
> Ausgeliefert wird die Anwendung unter `/demo`.

## Überblick

Diese Demo-Anwendung zeigt die Möglichkeiten der TBA3 API durch ansprechende Datenvisualisierungen. Sie dient als Referenzimplementierung für Frontend-Entwickler, die TBA3-konforme Backends integrieren möchten.

## Features

- ✅ **Kompetenzstufen-Verteilung**: Visualisierung der Verteilung von Schülern über fünf Kompetenzstufen
- ✅ **Item-Statistiken**: Detaillierte Lösungshäufigkeiten für einzelne Test-Items
- ✅ **Multi-Level-Ansicht**: Datenansicht auf Gruppen-, Schul- und Bundeslandebene
- ✅ **Individuelle Rückmeldung**: Schülerdetails inkl. PDF-Export
- 🎨 **Modernes UI**: Sleek Design mit Tailwind CSS
- 📊 **Interaktive Charts**: Responsive Diagramme mit Recharts
- 🔍 **Erweiterte Filter**: Filterung nach Fach, Klassenstufe, Geschlecht, Sprache

## Technologie-Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **State Management**: React Context + Hooks

## Starten

Alle Kommandos laufen im Repository-Wurzelverzeichnis:

```bash
npm install          # einmalig, installiert alle Workspaces
npm run dev:demo     # Dev-Server → http://localhost:5173/demo/
```

Ohne lokalen Mock-Server bleiben die Daten leer — der Vite-Proxy erwartet ihn auf
`http://localhost:8000` (siehe [indibit-eu/tba3](https://github.com/indibit-eu/tba3/tree/main/mock-server)).

## Entwicklung

### Verzeichnisstruktur

```
apps/demo/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout-Komponenten (Header, Sidebar, Dashboard)
│   │   ├── charts/          # Chart-Komponenten (Kompetenzstufen, Items)
│   │   ├── common/          # Wiederverwendbare Komponenten (Card, Loading, Error)
│   │   └── HelpView.jsx     # MCP-Anbindung
│   ├── hooks/               # Custom React Hooks
│   ├── services/            # API Client
│   ├── utils/               # Hilfsfunktionen, PDF- und Cartridge-Export
│   ├── context/             # React Context (Filter State)
│   └── App.jsx              # Haupt-App-Komponente
├── public/                  # Statische Assets
├── index.html               # HTML Entry Point
├── vite.config.js           # Vite-Konfiguration (base: '/demo/')
├── tailwind.config.js       # Tailwind CSS Konfiguration
└── package.json             # Abhängigkeiten (Workspace @tba3/demo)
```

### Verfügbare Scripts

Im Repository-Wurzelverzeichnis:

- `npm run dev:demo` – Dev-Server dieser App (Port 5173, Pfad `/demo/`)
- `npm run build` – baut alle Bereiche und setzt sie zu `dist/` zusammen
- `npm run preview` – liefert `dist/` wie im Deployment aus
- `npm run lint` – ESLint über diese App

### API Endpoints

Die Anwendung kommuniziert mit folgenden TBA3 API Endpoints:

**Gruppen-Ebene**:
- `GET /groups/{id}/competence-levels` - Kompetenzstufen-Verteilung
- `GET /groups/{id}/items` - Item-Statistiken
- `GET /groups/{id}/aggregations` - Aggregationen

**Schul-Ebene**:
- `GET /schools/{id}/competence-levels`
- `GET /schools/{id}/items`
- `GET /schools/{id}/aggregations`

**Bundesland-Ebene**:
- `GET /states/{id}/competence-levels`
- `GET /states/{id}/items`
- `GET /states/{id}/aggregations`

### Query Parameter

Alle Endpoints unterstützen folgende Query Parameter:

- `type`: `group` | `students` | `both` - Datentyp
- `gender`: `f` | `m` | `d` - Geschlecht-Filter
- `languageAtHome`: `german` | `english` | `french` | `other` - Sprache-Filter

## Bekannte Probleme

### Python 3.14 Kompatibilität

Der Mock Server hat derzeit Probleme mit Python 3.14 aufgrund einer Inkompatibilität zwischen Pydantic und der neuen Python-Version.

**Lösung**: Verwenden Sie Python 3.11 oder 3.12 für den Mock Server.

### CORS

Falls CORS-Probleme auftreten, überprüfen Sie die Vite Proxy-Konfiguration in `vite.config.js`.

## Komponenten

### Kompetenzstufen-Chart

Zeigt die Verteilung der Schüler über die fünf Kompetenzstufen:

- **Level I**: Unter Mindeststandard (rot)
- **Level II**: Mindeststandard (orange)
- **Level III**: Regelstandard (gelb)
- **Level IV**: Regelstandard Plus (grün)
- **Level V**: Optimalstandard (dunkelgrün)

### Item-Statistiken-Chart

Horizontales Balkendiagramm der Lösungshäufigkeiten für alle Items:

- Sortiert nach Aufgabe (Exercise ID)
- Tooltip zeigt Item-Metadaten (IQB-Parameter)
- Anpassbare Höhe basierend auf Item-Anzahl

## Daten-Quellen

Die App verwendet Testdaten vom TBA3 Mock Server:

- **25 Gruppen**: Verschiedene Fächer (Deutsch, Mathe, Englisch, Französisch) und Klassenstufen (V3, V8)
- **2 Schulen**: Grundschule Musterstadt, Gymnasium Beispielstadt
- **1 Bundesland**: Beispielland

Alle Daten werden mit IRT-Modellen (Item Response Theory) generiert.

## Customization

### Farben anpassen

Bearbeiten Sie `tailwind.config.js` um das Farbschema anzupassen:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#2563eb',  // Hauptfarbe
      'competence': {
        1: '#ef4444',      // Level I
        // ...
      }
    }
  }
}
```

### Neue Visualisierungen hinzufügen

1. Erstellen Sie eine neue Komponente in `src/components/charts/`
2. Erstellen Sie einen Custom Hook in `src/hooks/` für Daten-Fetching
3. Fügen Sie die Komponente zu `Dashboard.jsx` hinzu

## Performance

- **Initial Load**: < 2s
- **Chart Render**: < 500ms
- **API Response**: < 1s (Mock Server)

## Browser-Kompatibilität

- Chrome/Edge (neueste Version)
- Firefox (neueste Version)
- Safari (neueste Version)

## Deployment

### Production Build erstellen

```bash
npm run build
```

Dies erstellt optimierte Dateien im `dist/` Verzeichnis.

### Mit anderem Backend verwenden

Setzen Sie die `VITE_API_BASE_URL` Umgebungsvariable:

```bash
VITE_API_BASE_URL=https://api.example.com npm run build
```

Oder erstellen Sie eine `.env` Datei:

```env
VITE_API_BASE_URL=https://api.example.com
```

## Mitwirkende

Entwickelt als Demo für die TBA3 VERA Auswertungsschnittstelle.

## Lizenz

Siehe TBA3 Repository für Lizenzinformationen.

## Support

Bei Fragen oder Problemen öffnen Sie bitte ein Issue im TBA3 Repository.

## Roadmap

- [ ] Aggregationen-Visualisierung
- [ ] Export-Funktionalität (CSV, PDF)
- [ ] Dark Mode
- [ ] Mobile-optimierte Ansicht
- [ ] Vergleichs-Ansicht (mehrere Gruppen gleichzeitig)
- [ ] Erweiterte Filter (Kombinationen)
- [ ] Daten-Caching für bessere Performance
