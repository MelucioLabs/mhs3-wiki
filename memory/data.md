# MHS3 Wiki - Data Model

## Database Tables

### monsties (84 entries)
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-increment |
| name_de | VARCHAR(100) | German name |
| name_en | VARCHAR(100) | English name |
| element | VARCHAR(50) | fire/water/thunder/ice/dragon/none |
| attack_type | VARCHAR(50) | power/speed/technical |
| ride_action | VARCHAR(100) | fly/swim/climb/dive/jump/stealth (comma-separated) |
| habitat_de | VARCHAR(100) | German habitat (Azuria, Canalta-Waldland, Tarkuan, Serathis) |
| habitat_en | VARCHAR(100) | English habitat |
| description_de | TEXT | German description |
| description_en | TEXT | English description |
| image_url | VARCHAR(255) | Image path (not yet populated) |
| created_at | TIMESTAMP | |

### monsters (bestiary, ~80 entries)
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| name_de/en | VARCHAR(100) | |
| species | VARCHAR(100) | herbivore/neopteron/lynian/snake_wyvern/bird_wyvern/fanged_beast/amphibian/carapaceon/temnoceran/brute_wyvern/piscine_wyvern/leviathan/fanged_wyvern/flying_wyvern/elder_dragon |
| weakness | VARCHAR(50) | Element weakness |
| habitat_de/en | VARCHAR(100) | |
| description_de/en | TEXT | |

### genes (25 entries)
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| name_de/en | VARCHAR(100) | |
| gene_type | VARCHAR(50) | power/speed/technical |
| element | VARCHAR(50) | fire/water/thunder/ice/dragon/none |
| skill_name_de/en | VARCHAR(100) | |
| description_de/en | TEXT | |

### equipment (10 entries)
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| name_de/en | VARCHAR(100) | |
| type | VARCHAR(50) | weapon/armor |
| rarity | INTEGER | 1-6 |
| stats | JSONB | {attack, defense, element, affinity, etc.} |
| materials_de/en | JSONB | Array of material strings |
| description_de/en | TEXT | |

## MHS3 Regions
| German | English |
|--------|---------|
| Azuria | Azuria |
| Canalta-Waldland | Canalta Timberland |
| Tarkuan | Tarkuan |
| Serathis | Serathis |
| Verschiedene | Various |

## FTS Indexes
- GIN indexes on monsties, monsters, equipment (both DE + EN)
- Search query uses `to_tsvector` + `plainto_tsquery`

## API Endpoints
- `GET /api/monsties` - list all monsties
- `GET /api/monsties/:id` - single monstie
- `GET /api/bestiary` - list all monsters
- `GET /api/bestiary/:id` - single monster
- `GET /api/equipment` - list all equipment
- `GET /api/equipment/:id` - single equipment
- `GET /api/search?q=` - full-text search
- `GET /api/i18n/:lang` - locale strings
- `GET /api/health` - health check
- `GET /sitemap.xml` - dynamic sitemap
