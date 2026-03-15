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

## Current State (15. März 2026)
- **97 monsties** (84 base + 13 story monsties) with official DE/EN names
- **98 bestiary entries** with bilingual habitats
- **25 genes** (placeholder data, needs MSG file parsing for real names)
- **297 equipment** items (32 GS, 34 LS, 37 Hammer, 37 Horn, 37 Bow, 33 GL, 87 Armor)
  - All with official DE/EN names from parsed MSG files
  - Element filter (fire/water/thunder/ice/dragon/non_elemental)
  - Element tags on cards, translated to DE/EN
  - Melody hash values hidden (need MSG resolution)
  - Materials empty (recipe data not yet found in game files)
- Gene Calculator with 3x3 Bingo-Bonus system
- Full-text search (PostgreSQL GIN indexes, DE+EN)
- **Interaktive Karten** (Leaflet.js CRS.Simple):
  - Azuria: 3 Sub-Maps, Canalta: 1 Map, Tarkuan/Serathis: Platzhalter
- **Cache-Busting** via `?v=5` query parameter (Cloudflare CDN)
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

## Pending Tasks (Priority Order)
1. **Gene Data Integration**: MSG files NOW PARSED — 354 passive + 278 active skill names available. Need to cross-reference with genelottery/genepreset hash IDs to build gene DB. gendata export failed in REasy but skill names are in MSG files.
2. **Horn Melody Resolution**: melodydata.msg parsed — 27 melodies with DE/EN names. Need to map melody hash arrays in equipment JSONB to melody names.
3. **Forge Calculator / Schmiederechner**: Materials/recipes needed. `_Recipe` field in weapons mostly 0. Recipe tables not found yet.
4. **Texture Extraction**: Monster icons + HD maps from already-extracted pak files. Noesis installed for `.tex` → `.png`

## Legal Note
Game data in GitHub repo — user should consider making repo private or excluding raw game data files from version control. See issues.md for details.
