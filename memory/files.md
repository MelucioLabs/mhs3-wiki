# MHS3 Wiki - File Map

```
src/
├── app.js                        # Express app, routes, middleware, server start
├── database/
│   ├── connection.js             # PostgreSQL pool (pg)
│   ├── init.sql                  # Schema + seed data (97 monsties, 98 bestiary, 25 genes)
│   └── equipment_seed.sql        # 297 equipment items (auto-generated, loaded as 02_*)
├── modules/
│   ├── monsties/
│   │   ├── router.js             # GET /api/monsties, /api/monsties/:id, /api/monsties/filters
│   │   └── controller.js         # DB queries for monsties
│   ├── bestiary/
│   │   ├── router.js             # GET /api/bestiary, /api/bestiary/:id, /api/bestiary/filters
│   │   └── controller.js         # DB queries for monsters
│   ├── equipment/
│   │   ├── router.js             # GET /api/equipment, /api/equipment/:id, /api/equipment/filters
│   │   └── controller.js         # DB queries, element filter via JSONB
│   ├── search/
│   │   ├── router.js             # GET /api/search?q=
│   │   └── controller.js         # Full-text search across all tables
│   ├── i18n/
│   │   ├── router.js             # GET /api/i18n/:lang
│   │   └── middleware.js         # Language detection middleware
│   └── seo/
│       └── routes.js             # GET /sitemap.xml (dynamic)
├── locales/
│   ├── de.json                   # German translations incl. enum translations
│   └── en.json                   # English translations
└── public/
    ├── index.html                # SPA shell with SEO meta, JSON-LD, cache-buster ?v=5
    ├── robots.txt                # Crawler rules
    ├── css/
    │   └── style.css             # Dark theme styles
    ├── js/
    │   ├── main.js               # SPA router, API calls, rendering, modals, equipment element filter
    │   └── gene-calculator.js    # 3x3 gene grid with bingo bonus
    ├── maps/                     # Map images (azuria_main.png, etc.)
    └── images/                   # Favicons, OG image

tools/
├── parse_msg.js                  # RE Engine MSG v23 binary parser (runs in Docker)
├── build_equipment_data.js       # Equipment pipeline: MSG + stats → SQL seed
├── parse_all_gamedata.js         # Generic game data parser
├── generate_sql.js               # SQL generation from parsed data
├── REasy/                        # REasy Editor exports (.user.3 → JSON)
│   └── exports/usr/              # genelottery, genepreset, otomondata, weapons, armors
├── REE.Unpacker/                 # Extracted .pak contents
│   └── output/natives/stm/       # Game files (MSG, textures, etc.)
├── RETool/                       # RETool v0.230 for .pak extraction
└── parsed_output/
    ├── msg/                      # Parsed MSG JSONs (9 files: weapons, armor, items)
    ├── equipment_seed.sql        # Copy of generated equipment seed
    └── equipment_complete.json   # All 297 items as JSON
```
