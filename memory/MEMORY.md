# MHS3 Wiki - Project Memory

## Overview
Fan-Wiki web app for "Monster Hunter Stories 3: Twisted Reflection". Docker-deployed (Raspberry Pi ARM64 + AWS EC2 amd64).

## Tech Stack
- **Backend**: Node.js 20 / Express, PostgreSQL 16-alpine, pg pool
- **Frontend**: Vanilla JS SPA, dark/light theme toggle, no framework
- **Docker**: 3 services (app, postgres, pgadmin) via docker-compose
- **i18n**: DE/EN bilingual, enum translation system

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

## Current State (15. März 2026, Nacht)
- **97 monsties** (84 base + 13 story monsties) with official DE/EN names
- **98 bestiary entries** with bilingual habitats
- **115 genes** from game data (bilingual names/descriptions, **alle 115 mit Element**, **73 mit gene_type** — 42 sind "rainbow"/NULL = korrekt)
- **297 equipment** items (32 GS, 34 LS, 37 Hammer, 37 Horn, 37 Bow, 33 GL, 87 Armor)
  - Status effects translated (poison→Gift, sleep→Schlaf etc.)
  - Element filter + tags
  - **Horn melodies resolved**: 27 melodies mapped (hash→bilingual name), shown on cards + modals
  - Materials empty (recipe data not found yet)
- Gene Calculator with 3x3 Bingo-Bonus, type/element filter dropdowns, drag & drop, sticky header
- Full-text search (PostgreSQL GIN indexes, DE+EN)
- **Landing Page**: Hero gradient, 3+3 card grid (6 cards) with icons, colored accents
- **Forge Planner**: Funktionale Seite mit Typ-Filter, Suche, per-Level Attack/Defense Bars für alle 297 Equipment
- **Nav-Tabs** with emoji icons (🐉📖⚔️🧬🔨🗺️)
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
- ✅ hreflang per page in sitemap (DE/EN for all 5 main pages)
- ✅ Deep-Link SSR: `/monstie/slug-id`, `/monster/slug-id`, `/equipment/slug-id` → dynamic meta/OG tags
- ✅ Dynamic OG/Twitter tags per page (frontend JS + backend SSR)
- ✅ robots.txt, JSON-LD structured data
- ✅ Google Search Console verified (mccmdave@gmail.com) + Sitemap eingereicht
- ✅ Google verification file: `src/public/googlefbaf7bba739cdbf1.html`
- 💡 Portfolio meluciolabs.de sollte auch in GSC eingerichtet werden

## UI Features
- **KHAI Color Palette**: Dark (#1A1A2E bg, #5CB85C accent, #5BC0DE secondary, #7C6AF5 purple) + Light (#f5f5f5 bg, #4CAF50 accent, #2196F3 secondary, #6355D0 purple)
- **Language Dropdown**: Globe icon button → dropdown with SVG flags (DE/EN), green highlight for active
- **Theme Toggle**: Sun/Moon icon button, dark mode default, persistent via localStorage
- **Mobile Landing**: 2-column grid with icon+title only (no description), 3×2 even layout
- **Footer**: Bilingual (data-i18n with innerHTML for &mdash;)
- **Cache-Busting**: `?v=6` lokal (Platzhalter), CI/CD ersetzt automatisch via Docker ARG BUILD_VERSION (Timestamp `YYYYMMDDHHmm`)
- **All colors via CSS custom properties** — no hardcoded hex values in component styles

## Scheduled Tasks
- **mhs3-multilang**: Multi-Language Support (FR, ES, IT, JP) — manuell startbar über Claude Sidebar → "Scheduled". Details in `MULTILANG_PLAN.md`.

## Pending Tasks (Priority Order)
1. **Multi-Language Support**: FR, ES, IT, JP (Schedule erstellt, Plan in MULTILANG_PLAN.md)
2. **Equipment Upgrade Verifikation**: Per-Level Werte aus Binärdaten müssen gegen In-Game-Daten verifiziert werden. Materials noch leer.
3. **Texture Extraction**: Monster icons from pak files. Noesis installed for `.tex` → `.png`
4. **Map-Bilder Tarkuan/Serathis**: Game-Dateien enthalten KEINE 2D-Karten (live-gerendert aus 3D-Daten). Braucht Game8-Screenshots oder eigene In-Game-Screenshots (wie bei Azuria/Canalta)

## Erledigte Meilensteine
- ✅ **Gene Element/Type VOLLSTÄNDIG** (15.03.2026): Alle 115 Gene haben Element, 73 haben gene_type (42 rainbow=NULL korrekt). Gelöst durch binäres Parsing von `genedata_v_09_00.user.3` — Einträge korrespondieren 1:1 mit GeneDef.ID sequential values. Hash-Mapping: `-1361419264`=speed, `-259062144`=power, `1478498560`=technical, `1008397120`=rainbow/null.
- ✅ **Map-Bilder Azuria** transparent ersetzt (15.03.2026): Ingame-Screenshots mit transparentem Hintergrund statt Game8-Screenshots
- ✅ **Gene Calculator Filter & Drag&Drop** (15.03.2026): Typ/Element-Dropdowns, Drag&Drop von Genen ins Grid, sticky Header, 2-Zeilen-Beschreibungen
- ✅ **CI/CD Deploy-Fix** (15.03.2026): `DOCKER_API_VERSION=1.41` + `BUILD_VERSION` im deploy.yml, läuft jetzt sauber durch
- ✅ **Equipment Upgrade Pipeline** (16.03.2026): Binäres Parsing von `*param.user.3` Dateien (Stride 68, typ-spezifische Hashes). Per-Level Attack/Defense für alle 297 Equipment. Forge-Seite implementiert.

## Legal Note
Game data in GitHub repo — user should consider making repo private or excluding raw game data files from version control. See issues.md for details.
