---
task: "TBA3 Materials API demo mode and auto-assign module"
slug: 20260521-tba3-materials-api-demo
project: tba3
effort: E3
effort_source: classifier
phase: observe
progress: 0/36
mode: interactive
started: 2026-05-21T00:00:00Z
updated: 2026-05-21T00:00:00Z
---

## Problem

Die TBA3-Demo-App zeigt Lernmaterialien bisher nur aus einem statischen lokalen Pool (`EDUCATIONAL_MATERIALS` in `constants.js`) im alten Format (`type`, `targetLevels`, `duration`). PR #54 entwirft eine neue, reichhaltige API-Schnittstelle (`/materials`) mit einem `Material`-Schema, das 6 Attachment-Scopes unterstützt: `test`, `exercise`, `item`, `competence`, `competence-level`, `general`. Diese neue Schnittstelle ist im Demo bisher unsichtbar — keine Demo-Daten, kein API-Modus, kein Auto-Assign.

## Vision

Die Lehrkraft öffnet den Lernmaterialien-Tab und sieht sofort einen dritten Modus „API-Materialien". Dort sind alle 6 Zuordnungsarten mit echten Beispielinhalten sichtbar — Fördermaterial zur Kompetenzstufe I neben Musterl"osungen zu einzelnen Items, Durchführungshandreichungen für den ganzen Test, Elternbriefe als „general". Ein Klick auf „Auto-Zuweisen" analysiert die `attachments`-Metadaten aller Materialien und zeigt eine Vorschau: „8 Materialien werden automatisch zugeordnet — 3 → Stufe I, 2 → Stufe II, 1 → Item AB1021, 2 → allgemein". Nach Bestätigung sind alle Materialien dem richtigen Kontext zugewiesen. Euphorie entsteht, wenn die Maschine die Zuordnungsarbeit übernimmt, die vorher manuell gewesen wäre.

## Out of Scope

Der echte `/materials`-API-Endpunkt wird nicht implementiert — nur gemockt. Die bestehenden Modi „Nach Kompetenzstufe" und „Nach Gruppe" werden nicht umgebaut. TypeScript wird nicht eingeführt. Neue globale State-Lösungen (Redux, Zustand) werden nicht hinzugefügt. LRMI/AMB-Metadaten-Verlinkungen sind nicht Teil der UI. Der Export (IMS CC / PDF) wird nicht auf neue Materialien erweitert.

## Principles

- Additiv: bestehende Komponenten und Modi bleiben unverändert funktionsfähig.
- Data-first: Demo-Daten sind die Quelle der Wahrheit; die UI folgt der Datenstruktur.
- Scope-Sichtbarkeit: jede der 6 Attachment-Arten muss im UI erkennbar differenziert werden.
- Ein Einstiegspunkt: API-Materialien-Modus liegt im bestehenden `EducationalMaterialsPanel`.

## Constraints

- Package Manager: npm (Projektvorgabe, kein bun)
- Keine neuen globalen State-Lösungen ohne ADR
- API-Aufrufe nur über `src/services/tba3Api.js`
- Alle neuen UI-Komponenten brauchen `data-testid` Attribute
- JSX ohne TypeScript (Projektstandard)
- `src/data/demoMaterials.js` als kanonischer Ort der Demo-Daten

## Goal

Erweitere den Lernmaterialien-Tab der TBA3-Demo-App um (1) 24+ Demo-Materialien im PR #54-Schema mit allen 6 Attachment-Scopes, (2) einen neuen API-Modus der diese Materialien gruppiert nach Scope anzeigt, und (3) ein Auto-Assign-Modul das `attachments`-Metadaten liest und Materialien per Vorschau+Bestätigung automatisch den Kompetenzstufen zuweist.

## Criteria

- [ ] ISC-1: `src/data/demoMaterials.js` existiert und exportiert ein Array `DEMO_MATERIALS`
- [ ] ISC-2: `DEMO_MATERIALS` enthält ≥24 Einträge
- [ ] ISC-3: ≥1 Material mit `attachments[0].scope === 'test'` vorhanden
- [ ] ISC-4: ≥1 Material mit `attachments[0].scope === 'exercise'` vorhanden
- [ ] ISC-5: ≥1 Material mit `attachments[0].scope === 'item'` vorhanden
- [ ] ISC-6: ≥1 Material mit `attachments[0].scope === 'competence'` vorhanden
- [ ] ISC-7: ≥3 Materialien mit `attachments[0].scope === 'competence-level'` vorhanden (min. 3 verschiedene Stufen I–V)
- [ ] ISC-8: ≥1 Material mit `attachments[0].scope === 'general'` vorhanden
- [ ] ISC-9: Jedes Material im `DEMO_MATERIALS`-Array hat Pflichtfelder `id`, `title`, `kind`, `attachments`
- [ ] ISC-10: Materialien haben verschiedene `kind`-Werte (≥4 verschiedene: support, diagnostic, solution, didactic, info, anchor-text)
- [ ] ISC-11: `src/hooks/useMaterials.js` existiert und exportiert `useMaterials`
- [ ] ISC-12: `useMaterials` gibt `{ data, loading, error }` zurück
- [ ] ISC-13: `useMaterials` fällt bei API-Fehler auf `DEMO_MATERIALS` zurück (demo-mode Fallback)
- [ ] ISC-14: `tba3Api.js` enthält Methode `getMaterials(params)`
- [ ] ISC-15: `EducationalMaterialsPanel` zeigt 3 Tabs: "Nach Kompetenzstufe", "Nach Gruppe", "API-Materialien"
- [ ] ISC-16: API-Materialien-Tab hat `data-testid="api-materials-tab"` Attribut
- [ ] ISC-17: API-Materialien-Tab zeigt Materialien gruppiert nach Attachment-Scope (6 Sektionen oder Scope-Filter)
- [ ] ISC-18: Jede Scope-Gruppe ist visuell unterscheidbar (Header, Badge oder Icon)
- [ ] ISC-19: Einzelne Materialkarte im API-Modus zeigt: `title`, `kind`-Badge, `scope`-Badge, `audience`-Badge (wenn vorhanden)
- [ ] ISC-20: Materialkarte zeigt `url`-Link oder `content`-Preview
- [ ] ISC-21: `src/components/charts/AutoAssignModule.jsx` existiert
- [ ] ISC-22: AutoAssignModule hat `data-testid="auto-assign-module"` Attribut
- [ ] ISC-23: AutoAssignModule liest `DEMO_MATERIALS` und berechnet Zuordnungsvorschläge
- [ ] ISC-24: AutoAssignModule zeigt Vorschau: Anzahl Materialien pro Kompetenzstufe und "allgemein"
- [ ] ISC-25: AutoAssignModule hat Button "Jetzt automatisch zuweisen" mit `data-testid="auto-assign-apply"`
- [ ] ISC-26: Klick auf Auto-Assign-Button weist Materialien dem `LEVEL_KEY`-Storage zu (competence-level scope → Stufe, general → alle Stufen)
- [ ] ISC-27: AutoAssignModule zeigt Erfolgsmeldung nach erfolgreicher Zuweisung
- [ ] ISC-28: AutoAssignModule ist im API-Materialien-Tab eingebettet oder verlinkt
- [ ] ISC-29: `npm run build` schlägt nicht fehl nach den Änderungen
- [ ] ISC-30: `npm run lint` schlägt nicht fehl nach den Änderungen
- [ ] ISC-31: Anti: Die bestehenden Modi "Nach Kompetenzstufe" und "Nach Gruppe" sind nach den Änderungen weiter funktionsfähig
- [ ] ISC-32: Anti: Kein direktes `fetch`/`axios` in neuen Komponenten — nur via `tba3Api.js`
- [ ] ISC-33: Anti: Keine TypeScript-Dateien eingeführt
- [ ] ISC-34: Materialien im API-Modus zeigen `source`-Feld wenn vorhanden (z.B. "IQB", "VERA")
- [ ] ISC-35: Demo-Daten enthalten ≥2 Materialien mit `audience: 'teacher'` und ≥1 mit `audience: 'parents'`
- [ ] ISC-36: Demo-Daten enthalten Materialien zu ≥2 Fächern (DE, MA mindestens)

## Features

| name | description | satisfies | depends_on | parallelizable |
|------|-------------|-----------|------------|----------------|
| demo-data | Erstelle `src/data/demoMaterials.js` mit 24+ Materialien, alle 6 scopes, PR #54 Schema | ISC-1..10,35,36 | — | false |
| materials-hook | Erstelle `src/hooks/useMaterials.js` mit API-Fallback auf Demo-Daten | ISC-11..14 | demo-data | false |
| api-materials-tab | Erweitere `EducationalMaterialsPanel` um dritten Tab mit Scope-Gruppierung | ISC-15..20,31..33 | materials-hook | false |
| auto-assign-module | Erstelle `AutoAssignModule.jsx` mit Vorschau und Batch-Zuweisung | ISC-21..28 | demo-data | false |
| build-check | `npm run lint && npm run build` sauber | ISC-29,30 | api-materials-tab,auto-assign-module | false |

## Test Strategy

| isc | type | check | threshold | tool |
|-----|------|-------|-----------|------|
| ISC-1 | file | Read `src/data/demoMaterials.js` confirms export | exists | Read |
| ISC-2 | data | `DEMO_MATERIALS.length >= 24` | 24 | Read/Grep |
| ISC-3..8 | data | Grep for each scope value in demoMaterials.js | ≥1 each | Grep |
| ISC-9 | data | Read file, verify all entries have id/title/kind/attachments | all | Read |
| ISC-10 | data | Grep for distinct kind values | ≥4 | Grep |
| ISC-11..14 | file | Read hooks/useMaterials.js and tba3Api.js | exists + content | Read |
| ISC-15 | ui | Read EducationalMaterialsPanel.jsx for 3-tab setup | present | Read/Grep |
| ISC-16..20 | ui | Read component for data-testid and structure | present | Grep |
| ISC-21..28 | ui | Read AutoAssignModule.jsx for module structure and logic | present | Read |
| ISC-29,30 | build | `npm run lint && npm run build` exit 0 | 0 | Bash |
| ISC-31..33 | regression | Read EducationalMaterialsPanel for preserved modes | present | Read |
