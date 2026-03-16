# MHS3 Wiki - Project Memory

## Overview
Fan-Wiki web app for "Monster Hunter Stories 3: Twisted Reflection". Docker-deployed (Raspberry Pi ARM64 + AWS EC2 amd64).

## Tech Stack
- **Backend**: Node.js 20 / Express, PostgreSQL 16-alpine, pg pool
- **Frontend**: Vanilla JS SPA, dark/light theme toggle, no framework
- **Docker**: 3 services (app, postgres, pgadmin) via docker-compose
- **i18n**: 6 Sprachen: DE/EN/FR/ES/IT/JA, COALESCE-Fallback auf EN

## Key Architecture Details → [architecture.md](architecture.md)
## File Map → [files.md](files.md)
## Data Model → [data.md](data.md)
## Resolved Issues → [issues.md](issues.md)

## User Preferences
- Language: German (communicates in German)
- Prefers concise updates
- Wants modal overlays instead of separate detail pages
- German attack types: Kraft/Technik/Geschwindigkeit (not Power/Speed)
- "Rite of Channeling" = "Ritus der Überlieferung" (DE)
- Prefers datamining over web scraping for game data

## Current State (16. März 2026, aktualisiert)
- **97 monsties** (84 base + 13 story monsties) with official DE/EN names
- **98 bestiary entries** with bilingual habitats
- **354 genes** from PassiveSkillData MSG (alle Sprachen, 137 mit Element, 62 mit gene_type — Rest sind Regenbogen-Gene)
- **297 equipment** items (32 GS, 34 LS, 37 Hammer, 37 Horn, 37 Bow, 33 GL, 87 Armor)
  - Status effects translated (poison→Gift, sleep→Schlaf etc.)
  - Element filter + text search + type filter (client-side)
  - Sorted alphabetically by name_en (default)
  - **Horn melodies resolved**: 27 melodies mapped (hash→bilingual name), shown on cards + modals
  - **Per-Level Upgrade Stats** in Equipment-Modals (Lv.1/2/3 Attack/Defense Bars)
  - Materials empty — **Rezeptdaten nicht in Gamedateien** (`_Recipe` = 0 für alle, `_Rare` = 1 für alle)
  - Rarity display removed (useless, all items = 1)
- Gene Calculator with 3x3 Bingo-Bonus, type/element filter dropdowns, drag & drop, sticky header
- Full-text search (PostgreSQL GIN indexes, DE+EN+FR+IT+ES+simple für JA)
- **Landing Page**: Hero gradient, 3+2 card grid (5 cards) with icons, colored accents
- **Forge Planner ENTFERNT**: Upgrade-Daten stattdessen in Equipment-Modals integriert
- **Nav-Tabs** with emoji icons (🐉📖⚔️🧬🗺️)
- **Interaktive Karten** (Leaflet.js CRS.Simple):
  - Azuria: 3 Sub-Maps, Canalta: 1 Map, Tarkuan/Serathis: Platzhalter
- **Auto Cache-Busting**: Docker ARG BUILD_VERSION (Timestamp) in CI/CD — **immer `--build-arg BUILD_VERSION=$(date +%Y%m%d%H%M)` beim Build!**
- **Auto-Migration**: `src/database/migrate.js` runs on startup, seeds genes/equipment if missing
- Docker running on localhost:3000
- **Live**: https://mhs3.meluciolabs.de
- CI/CD: GitHub Actions → SSH Pi via Tailscale (push to main) ✅ **funktioniert einwandfrei**
- **Pi Docker**: `DOCKER_API_VERSION=1.41` nötig (Engine 20.10 + Compose v5.1.0)
- Remote: https://github.com/MelucioLabs/mhs3-wiki
- **Branch-Mapping**: Lokal `master` → Remote `main` (`git push origin master:main`)

## Datamining Pipeline
- **MSG Parser**: `tools/parse_msg.js` — RE Engine MSG v23 binary parser with XOR decryption
- **Equipment Builder**: `tools/build_equipment_data.js` — cross-references UUID names from MSG files with weapon/armor stats
- **REasy Editor v0.6.9** for .user.3 game data exports
- **REE.Unpacker** — BOTH PAKs already fully extracted (re_chunk_000.pak + sub_000.pak)
  - 44,930 files in `natives/`, 81,299 in `__Unknown/`, 712 MSG files total
- **RETool v0.230** installed at `tools/RETool/` (alternative extractor)
- **TEX→PNG Pipeline**: `MHWs_Tex_Chopper` (GDeflate decompress) → `texconv.exe` (BC7→PNG). Tools in `tools/`
  - Demo-Dateiliste: `tools/REE.Unpacker/Projects/MHS3_TR_STM_Demo.list` (57K Einträge, nur Demo-Content)
  - Extrahierte TEX: `tools/tex_input/`, konvertierte PNGs: `tools/extracted_icons/`
- Parsed MSG JSONs: `tools/parsed_output/msg/` (18 files total)
- Equipment seed: `src/database/equipment_seed.sql` (auto-loaded via docker-entrypoint-initdb.d)

## Parsed MSG Files Available (ready for use)
- **Equipment**: greatsword, longsword, hammer, horn, bow, gunlance, armor (names + descriptions)
- **Skills**: passiveskilldata (354 passive skills), 002_monsterskill (278 active skills), 003_otskill (89 kinship skills)
- **Melodies**: melodydata (27 horn melodies with DE/EN names + effect descriptions)
- **Other**: commonskillstatus, skillvariation, commonequipment, commonitem, 000_commonskill
- **Items**: itemdata, itemmaterialdata

## SEO Status
- ✅ History API pushState routing (no more hash URLs)
- ✅ Sitemap.xml: 498 URLs (main pages + individual monstie/monster/equipment)
- ✅ hreflang per page in sitemap (DE/EN/FR/ES/IT/JA für alle 6 Haupt-Seiten)
- ✅ Deep-Link SSR: `/monstie/slug-id`, `/monster/slug-id`, `/equipment/slug-id` → dynamic meta/OG tags
- ✅ Dynamic OG/Twitter tags per page (frontend JS + backend SSR)
- ✅ robots.txt, JSON-LD structured data
- ✅ Google Search Console verified (mccmdave@gmail.com) + Sitemap eingereicht
- ✅ Google verification file: `src/public/googlefbaf7bba739cdbf1.html`
- 💡 Portfolio meluciolabs.de sollte auch in GSC eingerichtet werden

## UI Features
- **KHAI Color Palette**: Dark (#1A1A2E bg, #5CB85C accent, #5BC0DE secondary, #7C6AF5 purple) + Light (#f5f5f5 bg, #4CAF50 accent, #2196F3 secondary, #6355D0 purple)
- **Language Dropdown**: Globe icon button → dropdown mit SVG-Flaggen (DE/EN/FR/ES/IT/JA), grüner Marker für aktiv
- **Theme Toggle**: Sun/Moon icon button, dark mode default, persistent via localStorage
- **Mobile Landing**: 2-column grid with icon+title only (no description), 3×2 even layout
- **Footer**: Bilingual (data-i18n with innerHTML for &mdash;)
- **Cache-Busting**: `?v=6` lokal (Platzhalter), CI/CD ersetzt automatisch via Docker ARG BUILD_VERSION (Timestamp `YYYYMMDDHHmm`)
- **All colors via CSS custom properties** — no hardcoded hex values in component styles

## Pending Tasks (Priority Order)
1. **Karten: NPCs & POIs**: NPCs, Händler, Quest-Geber etc. als Marker auf den interaktiven Karten hinterlegen
2. **Monstie-Habitate auf Karten**: Habitat-Daten (bereits in DB) auf der Karte anzeigen / mit Monstie-Liste verknüpfen (User will Ingame-Sidebar-Stil, Screenshot kommt später)
3. **Equipment Upgrade Verifikation**: Per-Level Werte aus Binärdaten müssen gegen In-Game-Daten verifiziert werden.
4. **Map-Bilder Tarkuan/Serathis**: Game-Dateien enthalten KEINE 2D-Karten (live-gerendert aus 3D-Daten). Braucht In-Game-Screenshots

## Multilang-Architektur (implementiert 16.03.2026)
- **6 Sprachen**: DE, EN, FR, ES, IT, JA — Whitelist in `middleware.js` + `router.js`
- **DB-Schema**: Neue Spalten `name_fr/es/it/ja`, `description_fr/es/it/ja`, `habitat_fr/es/it/ja`, `materials_fr/es/it/ja` per `ALTER TABLE IF NOT EXISTS` in migrate.js
- **Datenbefüllung**: `tools/build_multilang_docker.js` generiert `/tmp/multilang_seed.sql` → `docker cp` nach `src/database/multilang_seed.sql`. Daten in `/tmp/mhs3_data/` im Container.
  - **Equipment (297)**: Vollständig aus MSG-Dateien (greatsword/longsword/hammer/horn/bow/gunlance/armor.json)
  - **Genes (354)**: Alle PassiveSkillData MSG-Einträge (NAME_N/EXP_N), cross-ref mit GeneDef.ID Enum für Kategorien (normal/s_rank/passive)
  - **Monsters/Monsties (98)**: Aus names_all_languages.json — viele Namen international gleich (Rathalos=Rathalos)
- **COALESCE-Fallback**: `COALESCE(name_fr, name_en)` in allen Controllern — neue Sprachen zeigen EN wenn keine Übersetzung
- **Locale-Dateien**: `src/locales/fr.json`, `es.json`, `it.json`, `ja.json` mit UI-Strings + Enum-Übersetzungen
- **FTS-Configs**: `german`, `english`, `french`, `italian`, `spanish`, `simple` (für JA) in search.controller
- **SEO**: hreflang für alle 6 Sprachen in sitemap.xml via `hreflangLinks()` Helfer-Funktion
- **Docker**: Beim nächsten Rebuild wird `multilang_seed.sql` automatisch via migrate.js angewendet

## Erledigte Meilensteine
- ✅ **Gene Element/Type v3** (16.03.2026): 94 Gene aus Binary gemappt via GeneDef.ID enum-value → hash. THREE_WAY Field[3] + EREM_ATTR Field[4] in 56-Byte-Stride. 62 gene_type, 137 Element (inkl. Name-Inferenz). 217 ohne Element = Regenbogen-Gene (korrekt).
- ✅ **Map-Bilder Azuria** transparent ersetzt (15.03.2026): Ingame-Screenshots mit transparentem Hintergrund statt Game8-Screenshots
- ✅ **Gene Calculator Filter & Drag&Drop** (15.03.2026): Typ/Element-Dropdowns, Drag&Drop von Genen ins Grid, sticky Header, 2-Zeilen-Beschreibungen
- ✅ **CI/CD Deploy-Fix** (15.03.2026): `DOCKER_API_VERSION=1.41` + `BUILD_VERSION` im deploy.yml, läuft jetzt sauber durch
- ✅ **Equipment Upgrade Pipeline** (16.03.2026): Binäres Parsing von `*param.user.3` Dateien (Stride 68, typ-spezifische Hashes). Per-Level Attack/Defense für alle 297 Equipment.
- ✅ **Forge → Equipment-Modal Merge** (16.03.2026): Forge-Seite entfernt, Upgrade-Tabellen in Equipment-Modals integriert. Equipment-Seite: Textsuche, sort_id-Sortierung, Rarity-Filter entfernt.
- ✅ **Multi-Language Support** (16.03.2026): FR/ES/IT/JA implementiert — Equipment (297), Genes (354), Monster (98), Monsties (98) haben Übersetzungen. Locale-Dateien, COALESCE-Controller, SVG-Flaggen im Dropdown, hreflang SEO.
- ✅ **Gene Pipeline v2** (16.03.2026): 116→354 Gene. Alle PassiveSkillData MSG-Einträge als Primärquelle. Cross-ref mit GeneDef.ID (116 normal + 27 s_rank + 173 passive + 122 msg-only). Element-Inferenz aus Skill-Namen. `elementClass('non_elemental')` → 'none' Fix für Light-Mode Tag-Sichtbarkeit.
- ✅ **Map-Bilder aufgeräumt** (16.03.2026): Backups in `maps/backups/`, Duplikate gelöscht. Azuria Aschenpfad transparent.
- ✅ **Texture Extraction abgeschlossen** (16.03.2026): Pipeline TEX→GDeflate→DDS→PNG funktioniert. Ergebnis: **Monster-Icons existieren NICHT als statische Texturen** — werden in Echtzeit aus 3D-Modellen gerendert. Nur Tier-Portraits (14 Tiere), Ei-Muster und Rang-Icons extrahierbar, aber für Wiki nicht brauchbar. Game8 hat niedrigauflösende Monster-Icons als Alternative.

## Legal Note
Game data in GitHub repo — user should consider making repo private or excluding raw game data files from version control. See issues.md for details.
