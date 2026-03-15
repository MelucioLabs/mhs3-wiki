# MHS3 Wiki - Architecture

## Build/Deploy
- Docker Compose: app (Node), postgres, pgadmin
- Multi-arch: ARM64 (Raspberry Pi) + AMD64 (AWS EC2)
- Live domain: mhs3.meluciolabs.de (SSH: pi-t)
- DB init: `src/database/init.sql` runs on container startup

## Backend
- Express.js with modular routing
- Modules: monsties, bestiary, equipment, search, i18n, seo
- Each module: router.js + controller.js
- DB: pg pool connection (`src/database/connection.js`)
- Compression, Helmet (CSP disabled), CORS enabled
- SPA fallback: all non-API routes serve index.html

## Frontend
- Vanilla JS SPA (`src/public/js/main.js`)
- Dark theme CSS (`src/public/css/style.css`)
- Gene Calculator (`src/public/js/gene-calculator.js`)
- History API pushState routing (/monsties, /bestiary, /equipment, /gene-calc, /map)
- Legacy hash URL redirect (#/monsties → /monsties)
- Detail views: Modal overlays (not separate pages)
- Horn melody resolution: `_melodyLookup` map converts hash→bilingual name client-side
- i18n: client-side, fetches `/api/i18n/:lang`

## SEO Strategy
- Static meta/OG/Twitter tags in index.html
- JSON-LD: WebSite, VideoGame, FAQPage schemas
- Dynamic sitemap.xml from DB data
- robots.txt with API disallow
- hreflang for DE/EN
- Noscript fallback content for crawlers

## Design Decisions
- Modals over separate pages: faster UX, less routing complexity
- Emoji-based element icons (placeholder): no external icon dependencies
- Attack types stored as EN keys, translated in frontend
- Ride actions comma-separated in single column (simpler than junction table)
