# MHS3 Wiki - File Map

```
src/
├── app.js                        # Express app, routes, middleware, server start
├── database/
│   ├── connection.js             # PostgreSQL pool (pg)
│   └── init.sql                  # Schema + seed data (84 monsties, ~80 bestiary, 25 genes, 10 equipment)
├── modules/
│   ├── monsties/
│   │   ├── router.js             # GET /api/monsties, /api/monsties/:id
│   │   └── controller.js         # DB queries for monsties
│   ├── bestiary/
│   │   ├── router.js             # GET /api/bestiary, /api/bestiary/:id
│   │   └── controller.js         # DB queries for monsters
│   ├── equipment/
│   │   ├── router.js             # GET /api/equipment, /api/equipment/:id
│   │   └── controller.js         # DB queries for equipment
│   ├── search/
│   │   ├── router.js             # GET /api/search?q=
│   │   └── controller.js         # Full-text search across all tables
│   ├── i18n/
│   │   ├── router.js             # GET /api/i18n/:lang
│   │   └── middleware.js         # Language detection middleware
│   └── seo/
│       └── routes.js             # GET /sitemap.xml (dynamic)
└── public/
    ├── index.html                # SPA shell with SEO meta, JSON-LD
    ├── robots.txt                # Crawler rules
    ├── css/
    │   └── style.css             # Dark theme styles
    ├── js/
    │   ├── main.js               # SPA router, API calls, rendering, modals
    │   └── gene-calculator.js    # 3x3 gene grid with bingo bonus
    └── images/                   # Favicons, OG image
```
