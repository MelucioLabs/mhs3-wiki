# MHS3 Wiki - Project Memory

## Overview
Fan-Wiki web app for "Monster Hunter Stories 3: Twisted Reflection". Docker-deployed (Raspberry Pi ARM64 + AWS EC2 amd64).

## Tech Stack
- **Backend**: Node.js 20 / Express, PostgreSQL 16-alpine, pg pool
- **Frontend**: Vanilla JS SPA, dark theme, no framework
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
- Prefers datamining over web scraping for game data

## Current State (15. März 2026, Abend)
- **97 monsties** (84 base + 13 story monsties) with official DE/EN names
- **98 bestiary entries** with bilingual habitats
- **115 genes** from game data (bilingual names/descriptions, element/type NULL)
- **297 equipment** items (32 GS, 34 LS, 37 Hammer, 37 Horn, 37 Bow, 33 GL, 87 Armor)
  - Status effects translated (poison→Gift, sleep→Schlaf etc.)
  - Element filter + tags, melody hashes hidden
  - Materials empty (recipe data not found yet)
- Gene Calculator with 3x3 Bingo-Bonus + search filter
- Full-text search (PostgreSQL GIN indexes, DE+EN)
- **Landing Page**: Hero gradient, 3+2 card grid with icons, colored accents
- **Nav-Tabs** with emoji icons (🐉📖⚔️🧬🗺️)
- **Interaktive Karten** (Leaflet.js CRS.Simple):
  - Azuria: 3 Sub-Maps, Canalta: 1 Map, Tarkuan/Serathis: Platzhalter
- **Auto Cache-Busting**: Git SHA timestamp via Docker ARG BUILD_VERSION in CI/CD
- **Auto-Migration**: `src/database/migrate.js` runs on startup, seeds genes/equipment if missing
- Docker running on localhost:3000
- **Live**: https://mhs3.meluciolabs.de
- CI/CD: GitHub Actions → SSH Pi via Tailscale (push to main)
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
- ✅ Sitemap.xml with all pages + individual monstie/monster URLs
- ✅ robots.txt, JSON-LD structured data, OG tags, hreflang
- ✅ Google Search Console verified (mccmdave@gmail.com) + Sitemap eingereicht
- ✅ Google verification file: `src/public/googlefbaf7bba739cdbf1.html`
- 💡 Portfolio meluciolabs.de sollte auch in GSC eingerichtet werden

## Pending Tasks (Priority Order)
1. **Gene Element/Type Data**: gendata/genebingobonus REasy export empty. Need alternative source for gene element + type to enable bingo bonuses. ← CURRENT
2. **Horn Melody Resolution**: melodydata.msg parsed — 27 melodies with DE/EN names. Map melody hash arrays in equipment JSONB to melody names. ← CURRENT
3. **Equipment Upgrade Pipeline**: Need weaponupgradedata/armorupgradedata from game files for per-level stats. User wants forge calculator showing stats per upgrade level (+ materials if available).
4. **Texture Extraction**: Monster icons + HD maps from already-extracted pak files. Noesis installed for `.tex` → `.png`

## Legal Note
Game data in GitHub repo — user should consider making repo private or excluding raw game data files from version control. See issues.md for details.
