# MHS3 Wiki - Nächste Session

## Projekt
Fan-Wiki für "Monster Hunter Stories 3: Twisted Reflection" — Docker-deployed (Raspberry Pi via Tailscale).
- **Repo**: https://github.com/MelucioLabs/mhs3-wiki
- **Live**: https://mhs3.meluciolabs.de
- **Lokal**: http://localhost:3000
- **Tech**: Node.js 20/Express, PostgreSQL 16, Vanilla JS SPA, Leaflet.js Maps
- **Projekt-Verzeichnis**: `C:\Users\Startklar\Desktop\MHS3`

## Aktueller Stand (14. März 2026)
- **97 Monsties** (84 base + 13 Story) mit offiziellen DE/EN Namen aus dataminierten Spieldateien
- **98 Bestiary** Einträge mit bilingualen Habitaten
- **25 Gene**, **10 Equipment** Platzhalter-Items
- **Interaktive Karten** mit Game8-Map-Screenshots:
  - Azuria: 3 Sub-Maps (Hauptgebiet, Aschenpfad, Schloss Azuria)
  - Canalta-Waldland: 1 Map
  - Tarkuan, Serathis: Platzhalter ("Karte kommt bald")
- **Monstie-Liste pro Region** mit Sort-Toggle (Element/Name)
- **13 Story-Monsties** (Ratha V, Plessie, Gravy, Dee, Sereg, Gnocchi, Angie, Chirpy, Kagachi, Fawn, Lenox, Golma, Großpoogie) aus Map-Listen gefiltert
- **Modals** für Monstie/Bestiary/Equipment Details
- **Gene-Rechner** mit 3x3 Bingo-Bonus System
- **Full-Text-Search** (PostgreSQL GIN Indexes, DE+EN)
- **Cache-Busting** via `?v=3` Query-Parameter (Cloudflare CDN)

## Was als nächstes ansteht

### 1. Textur-Extraktion: Monster-Icons und HD-Karten
**Noesis ist installiert** (`noesis64` CLI-Alias via winget).

**Problem**: Die `.tex`-Dateien (Karten, Monster-Icons) liegen in den `.pak`-Archiven des Spiels. Workflow:
1. `.pak`-Archiv entpacken → braucht **RETool** (FluffyQuack) oder ähnliches
2. `.tex` → `.png` mit **Noesis** konvertieren

**Spielpfad ermitteln** (Steam-Installation, vermutlich `C:\Program Files (x86)\Steam\steamapps\common\MONSTER_HUNTER_STORIES_3_...`)

**Gesuchte Assets:**
- **Karten-Texturen**: `natives/stm/gui/ui_map/` → `bc110_IML3.tex` (Azuria=bc110, bc120=Canalta?, bc130=Tarkuan?, bc140=Serathis?)
- **Monster-Icons**: `natives/stm/gui/ui_monster/` oder `ui_otomon/`
- **Referenz-Pfad aus Gamedaten**: `GameDesign/GUI/Resource/StageMap/bc110MapTextureUserData.user`

**RETool beziehen**: Nicht per winget verfügbar. GitHub suchen: https://github.com/FluffyQuack/RETool oder Alternativen. Ggf. auch `REE.PAK.Tool` (https://github.com/Ekey/REE.PAK.Tool).

### 2. Sub-Habitate für Azuria (4 Gebiete)
- 4 Gebiete in Azuria, getrennt durch gepunktete Linien auf der Karte
- Vermutlich: Sunpetal Plains, Broadleaf Basin, Mirror Lake, Blightstone Woods
- Picturebook-Daten (`tools/parsed_output/picturebook.json`) haben `regionIds`/`areaIds` als Hashes, aber alle benannten Monsties landen in einer globalen Region
- Sub-Habitat-Zuordnung muss manuell oder aus Encounter-Tabellen kommen
- User schaut sich das selbst an

### 3. Equipment-Daten vollständig integrieren
- 210+ Waffen und 93 Rüstungen aus Gamedaten bereits geparst in `tools/parsed_output/`:
  - `weapons.json`: Greatswords (32), Longswords (34), Hammers (37), Bows (37), Horns (37), Gunlances (33)
  - `armors.json`: 93 Einträge
- Aktuell nur 10 Platzhalter-Einträge in der DB
- Braucht: SQL-Generation aus parsed JSON + Equipment-UI erweitern

### 4. Gene-Daten erweitern
- `genelottery` + `genepreset` aus Gamedaten exportiert
- `genedata_v_09_00` und `bingobonusdata` konnten nicht in REasy geöffnet werden
- Aktuell 25 Gene-Platzhalter in DB
- Gene-Rechner UI existiert bereits mit 3x3 Grid

## Technische Details

### Deployment
- **CI/CD**: GitHub Actions → SSH zu Pi (Tailscale `100.103.86.47`) → `git pull && docker compose up -d --build`
- **WICHTIG**: `docker compose up` resettet die DB NICHT! Bei init.sql-Änderungen: `docker compose down -v && docker compose up -d --build`
- **Docker API**: `DOCKER_API_VERSION=1.41` Prefix nötig auf Pi
- **SSH**: `ssh pi-t` (Tailscale-Alias)
- **Build-Cache**: `docker compose build --no-cache app` für sauberes Build
- **Branch-Mapping**: Lokal `master` → Remote `main` (push: `git push origin master:main`)

### Maps-Setup
- Map-Bilder in `maps/` (im `.gitignore`, nicht in Git!)
- Docker-Volume: `./maps:/app/maps:ro`
- Express: `/maps/` als statischer Pfad (`src/app.js`)
- Neue Maps hinzufügen:
  1. PNG in `maps/` ablegen
  2. `_mapConfig` in `src/public/js/main.js` erweitern
  3. Per SCP auf Pi: `scp maps/neue_map.png pi-t:~/apps/mhs3-wiki/maps/`
- Aktuelle Dateien: `azuria_main.png` (1065x1039), `azuria_ashen_pass.png` (959x1014), `azuria_azuria_castle.png` (963x965), `canalta_timperland_main.png` (923x913)

### Datamining-Tools & Erkenntnisse
- **REasy Editor v0.6.9**: GUI für `.user.3` Dateien (Gameplay-Daten)
- **Noesis**: Installiert via winget für `.tex` → `.png`
- **Parsed Output**: `tools/parsed_output/` (monsties_complete.json, weapons.json, armors.json, picturebook.json, enum_mappings.json, names_all_languages.json)
- **Parse-Skript**: `tools/parse_all_gamedata.js` (läuft im Docker-Container)
- **Erkenntnisse**:
  - `_defaultGoodElem` und `_triType` in otomondata ≠ In-Game Element/Angriffstyp!
  - Element/Attack-Type Daten kommen von Game8/Community-Quellen
  - MSG-Dateien (.msg.23) enthalten alle Sprachen (Index 1=EN, 4=DE)
  - 99 Einträge in otomondata (inkl. NPC/Story-Monsties)
- **Docker auf Windows**: `MSYS_NO_PATHCONV=1` Prefix für docker exec in Git Bash

### DB-Zugang
- Host: `postgres` (Container-intern)
- DB: `mhs3_wiki`
- User: `mhs3_user`
- PW: `changeme123`

### Wichtige Hinweise
- Kommunikation auf Deutsch
- Dark Theme durchgängig
- Modals statt separate Detail-Seiten
- Deutsche Angriffstypen: Kraft/Technik/Geschwindigkeit
- Cache-Busting bei CSS/JS-Änderungen: Version in index.html hochzählen (`?v=N`)
