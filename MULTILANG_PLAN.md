# Multi-Language Implementation Plan

## Ziel
Weitere Sprachen hinzufügen (FR, ES, IT, JP, KR, ZH-TW, ZH-CN, PT-BR, RU, PL, AR, ES-LATAM).
Die Sprachdaten liegen bereits in den MSG-Dateien vor (33 Sprachslots).

## Verfügbare Sprach-Slots in MSG-Dateien
Die MSG-Dateien (`tools/parsed_output/msg/*.json`) enthalten bereits alle Sprachen:
- Slot 0: Japanese (JP)
- Slot 1: English (EN) ✅ bereits implementiert
- Slot 2: French (FR)
- Slot 3: Italian (IT)
- Slot 4: German (DE) ✅ bereits implementiert
- Slot 5: Spanish (ES)
- Slot 6: Russian (RU)
- Slot 7: Polish (PL)
- Slot 10: Portuguese-BR (PT-BR)
- Slot 11: Korean (KR)
- Slot 12: Traditional Chinese (ZH-TW)
- Slot 13: Simplified Chinese (ZH-CN)
- Slot 21: Arabic (AR)
- Slot 32: Latin American Spanish (ES-LATAM)

## Architektur-Änderungen nötig

### 1. DB-Schema (Migration)
Aktuell: Dedizierte Spalten `name_de`, `name_en`, `description_de`, `description_en` etc.
**Empfohlener Ansatz**: JSONB-Spalte `names` und `descriptions` statt einzelner Spalten pro Sprache.
```sql
-- Neue Spalten hinzufügen (bestehende behalten für Abwärtskompatibilität)
ALTER TABLE monsties ADD COLUMN IF NOT EXISTS names JSONB DEFAULT '{}';
ALTER TABLE monsties ADD COLUMN IF NOT EXISTS descriptions JSONB DEFAULT '{}';
-- Analog für monsters, equipment, genes
```
Migration: Bestehende `name_de`/`name_en` Daten in JSONB kopieren, dann API umstellen.

Alternativ (einfacher): Für jede neue Sprache neue Spalten `name_fr`, `name_es` etc. hinzufügen.
→ Nachteil: Viele Spalten, aber einfacher ohne Schema-Redesign.

### 2. MSG Parser erweitern (`tools/parse_msg.js`)
Aktuell extrahiert der Parser alle Sprachen, aber die Build-Scripts (`build_equipment_data.js`, `build_gene_data.js`) nutzen nur EN (Index 1) und DE (Index 4).
→ Build-Scripts müssen erweitert werden um alle gewünschten Sprachen zu extrahieren.

### 3. Locale-Dateien erstellen
Für jede Sprache eine `src/locales/{lang}.json` mit UI-Strings (Navigation, Labels, Enums).
→ Diese müssen manuell übersetzt oder aus Game-Daten abgeleitet werden.
→ Enum-Übersetzungen (Elemente, Angriffstypen, Spezies) sind NICHT in MSG-Dateien — diese müssen manuell übersetzt werden.

### 4. i18n Router erweitern (`src/modules/i18n/router.js`)
Zeile 10: `if (!['de', 'en'].includes(lang))` → erweitern um neue Sprachen

### 5. Frontend Language Dropdown
`src/public/js/main.js` — `_updateLangMenu()` erweitern um neue Flaggen/Labels.
SVG-Flaggen für jede Sprache hinzufügen.

### 6. API-Endpunkte
`src/modules/` — Alle API-Routen nutzen `req.query.lang || 'de'` und liefern `name_${lang}` etc.
→ Müssen dynamisch die richtige Spalte oder JSONB-Key zurückgeben.

### 7. Sitemap + SEO
`src/modules/seo/routes.js` — hreflang-Links für alle Sprachen generieren.

## Schritt-für-Schritt Implementierung

### Phase 1: DB + Parser (Backend)
1. DB-Migration: JSONB `names`/`descriptions` Spalten oder neue `name_fr` etc. Spalten
2. MSG-Parser Build-Scripts erweitern: Alle Sprachen in SQL-Seed aufnehmen
3. Seed-Dateien neu generieren mit allen Sprachen
4. API-Endpunkte anpassen (dynamische Sprachauswahl)

### Phase 2: Frontend UI-Strings
1. Locale-Dateien für FR, ES, IT, JP erstellen (UI-Labels übersetzen)
2. Enum-Übersetzungen manuell hinzufügen (Elemente, Angriffstypen etc.)
3. i18n Router Whitelist erweitern
4. Language Dropdown mit neuen Flaggen

### Phase 3: SEO + Polish
1. hreflang für alle Sprachen in Sitemap
2. Deep-Link SSR für alle Sprachen
3. Testen

## Wichtige Hinweise
- **"Ritus der Überlieferung"** = deutscher Name für "Rite of Channeling" (Gene Calculator Subtitle)
- Deutsche Angriffstypen: Kraft/Technik/Geschwindigkeit
- MSG-Dateien mit Monsternamen: `tools/parsed_output/monsties_complete.json` und in den REasy-Exports
- Monstie-Namen MSG: Noch nicht geparst! Braucht die richtige MSG-Datei aus dem Spiel.
  Aktuell kommen Monstie-/Monster-Namen aus manuellen Seeds, nicht aus MSG-Dateien.
- Equipment-Namen: Alle aus MSG-Dateien (greatsword.json, longsword.json etc.)
- Gene-Namen: Aus passiveskilldata.json MSG-Datei
