# MHS3 Wiki - Data Model

## Database Tables

### monsties (97 entries: 84 base + 13 story)
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-increment |
| name_de | VARCHAR(100) | German name (official from game MSG files) |
| name_en | VARCHAR(100) | English name |
| element | VARCHAR(50) | fire/water/thunder/ice/dragon/none |
| attack_type | VARCHAR(50) | power/speed/technical |
| ride_action | VARCHAR(100) | fly/swim/climb/dive/jump/stealth (comma-separated) |
| habitat_de | VARCHAR(100) | German habitat |
| habitat_en | VARCHAR(100) | English habitat |
| description_de/en | TEXT | |
| image_url | VARCHAR(255) | Image path (not yet populated) |

### monsters (bestiary, 98 entries)
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| name_de/en | VARCHAR(100) | |
| species | VARCHAR(100) | herbivore/neopteron/lynian/bird_wyvern/fanged_beast/amphibian/carapaceon/temnoceran/brute_wyvern/leviathan/fanged_wyvern/flying_wyvern/elder_dragon |
| weakness | VARCHAR(50) | Element weakness |
| habitat_de/en | VARCHAR(100) | |
| description_de/en | TEXT | |

### genes (25 entries — PLACEHOLDER, needs real data)
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| name_de/en | VARCHAR(100) | Currently placeholder names |
| gene_type | VARCHAR(50) | power/speed/technical |
| element | VARCHAR(50) | fire/water/thunder/ice/dragon/none |
| skill_name_de/en | VARCHAR(100) | |
| description_de/en | TEXT | |

### equipment (297 entries — from datamined game files)
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| name_de/en | VARCHAR(100) | Official names from MSG files |
| type | VARCHAR(50) | greatsword/longsword/hammer/horn/bow/gunlance/armor |
| rarity | INTEGER | Currently all 1 (rarity data not yet parsed) |
| stats | JSONB | See below |
| materials_de/en | JSONB | Array of material strings (currently empty `[]`) |
| description_de/en | TEXT | Official descriptions from MSG files |

#### Equipment Stats JSONB Structure
**Weapons:**
```json
{"attack": 25, "defense": 0, "critical": 10, "max_level": 3, "element": "fire", "status": "poison", "status_rate": 8}
```
- `element`: fire/water/thunder/ice/dragon (absent = non-elemental)
- `status`: poison/paralysis/sleep/blast (optional)
- `melody`/`partner_melody`: Horn-only, raw hash arrays (hidden in UI)

**Armor:**
```json
{"defense": 30, "element_resist": {"fire": "resist", "water": "weak"}, "skills": ["Health Boost (S)"]}
```
- `element_resist`: Keys are element names, values are weak/very_weak/resist/strong_resist

## Equipment Element Hash Mapping (from datamining)
- -1719794688 = fire
- -1829686656 = thunder
- 825089408 = non_elemental
- 702712768 = water
- 1669704192 = ice
- 525126112 = dragon

## Gene Data Analysis (~316 real genes)
- genelottery: Maps OtomonID → 3 fixed genes + random pool
- genepreset: Complete 3x3 gene configurations (9 genes per preset)
- gendata/genebingobonus: Export FAILED in REasy (empty dirs)
- Gene names are only technical codes (GENE_1, PASSIVE_GENE_67) — need MSG file

## API Endpoints
- `GET /api/monsties[?element=&attack_type=&ride_action=]` - list/filter monsties
- `GET /api/monsties/:id` - single monstie
- `GET /api/monsties/filters` - available filter values
- `GET /api/bestiary[?weakness=&habitat=&species=]` - list/filter monsters
- `GET /api/bestiary/:id` - single monster
- `GET /api/bestiary/filters` - available filter values
- `GET /api/equipment[?type=&rarity=&element=]` - list/filter equipment
- `GET /api/equipment/:id` - single equipment
- `GET /api/equipment/filters` - types, rarities, elements
- `GET /api/search?q=` - full-text search
- `GET /api/i18n/:lang` - locale strings
- `GET /api/health` - health check
- `GET /sitemap.xml` - dynamic sitemap

## FTS Indexes
- GIN indexes on monsties, monsters, equipment (both DE + EN)
- Search query uses `to_tsvector` + `plainto_tsquery`
