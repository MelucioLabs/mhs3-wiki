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

## Current State (March 2026)
- **84 monsties** with element, attack_type, ride_action, habitat data (DE+EN)
- **~80 bestiary entries** including small monsters, with species + weakness
- **25 genes** covering all elements + non-elemental + support
- **10 equipment items** (weapons + armor)
- Gene Calculator with 3x3 Bingo-Bonus system
- **Interactive Map** with Leaflet.js, custom SVG world map, region filters
- Full-text search (PostgreSQL GIN indexes, DE+EN)
- SEO: meta tags, OG, Twitter, JSON-LD, sitemap.xml, robots.txt, hreflang
- Docker running on localhost:3000
- Live: mhs3.meluciolabs.de (SSH: pi-t)

## Pending Tasks
- Login-System für Fortschritt-Tracking
- Datamining aus Spieldateien (re_chunk_000.pak)
- Map: In-Game Screenshots als Karten-Tiles einbinden (Hybrid-Ansatz)
