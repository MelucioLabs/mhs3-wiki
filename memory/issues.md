# MHS3 Wiki - Issues & Solutions

## Session 2026-03-13: Datenbank-Erweiterung

### Problem: Nur 43 Monsties in DB
- **Ursache**: Initiale DB hatte nur Teilmenge der Monsties
- **Lösung**: Alle 84 bestätigten MHS3-Monsties aus Community-Quellen gesammelt und eingefügt
- **Quellen**: TheGamer (ride actions, attack types), Game8 (elements, weaknesses), Monster Hunter Wiki

### Korrekturen gegenüber alter DB
- Rathian: power → speed (Game8-Bestätigung)
- Malzeno: technical → speed (TheGamer-Bestätigung)
- Magnamalo: power → speed (Game8-Bestätigung)
- Glavenus: power → speed (TheGamer-Bestätigung)
- Barioth: speed → technical (TheGamer-Bestätigung)
- Seregios: speed → technical (TheGamer-Bestätigung)
- Nargacuga ride: jump → climb, stealth
- Odogaron ride: jump → climb
- Arkveld: power → technical

### Bekannte Fallstricke
- MHS3 Attack Types haben Normal + Enraged-Varianten (z.B. Rathian: Speed normal, Power enraged)
- In der DB speichern wir nur den "Normal"-Typ
- Ride Actions: Manche Monsties haben mehrere (z.B. Barioth: fly, climb)
- Deutsche Monsternamen: Die meisten bleiben auf Englisch, Unterarten/Deviants werden übersetzt
- Bestiary "weakness" ist das Element gegen das das Monster schwach ist, NICHT sein eigenes Element

## Session 2026-03-14/15: Equipment Datamining

### Problem: MSG v23 Binär-Parser
- **Ursache**: Erster handgeschriebener Parser hatte falsche Offset-Berechnung
- **Lösung**: Neuer Parser mit korrekter XOR-Entschlüsselung und UUID-Extraktion (`tools/parse_msg.js`)
- **Format**: GMSG Magic, XOR-verschlüsselte UTF-16LE Strings, 33 Sprachslots (0=JP, 1=EN, 4=DE)

### Problem: Node.js nicht im System-PATH
- **Lösung**: Docker-Container-Node v20 verwendet statt lokaler Installation

### Problem: Element-Anzeige auf Englisch im Equipment
- **Ursache**: Element ist als englischer Key im JSONB gespeichert (`"element":"fire"`), Frontend zeigte raw
- **Lösung**: `te('elements', elemKey)` für Übersetzung, Element-Tags auf Karten hinzugefügt

### Problem: Jagdhorn-Melodien als Hash-Werte
- **Ursache**: `melody` und `partner_melody` enthalten rohe Hash-IDs aus Spieldaten
- **Status**: Hashes werden jetzt im UI versteckt (`_hiddenStats` Set). Auflösung braucht MSG-Datei-Parsing.

### Problem: gendata/genebingobonus Export leer
- **Ursache**: REasy Editor Export fehlgeschlagen für diese Datentypen
- **Status**: OFFEN. Gene-Daten brauchen alternative Extraktionsmethode oder MSG-Datei-Suche.

### Problem: Rezeptdaten fehlen
- **Ursache**: `_Recipe` Feld in Waffen/Rüstungs-JSON ist meistens 0. Rezept-Tabellen noch nicht gefunden.
- **Status**: OFFEN. Materials-Arrays sind leer (`[]`) in der DB.

## Session 2026-03-15: Gene Integration, Cache-Busting, Landing Page

### Problem: Gene-Daten nur Platzhalter (25 Stück)
- **Lösung**: Pipeline `tools/build_gene_data.js` erstellt — GeneDef.ID → PassiveSkillData MSG cross-reference
- **Ergebnis**: 115 echte Gene mit bilingualen Namen/Descriptions geseeded
- **Offen**: Element/Type NULL (gendata REasy-Export leer)

### Problem: Equipment Status nicht übersetzt
- **Ursache**: `status` Wert aus JSONB ("poison", "sleep") wurde raw angezeigt
- **Lösung**: `te('status_effects', v)` in `_equipCards()` und `showEquipModal()`, neue Enum-Gruppe in Locale-Dateien

### Problem: Cloudflare Cache zeigt alte Version
- **Lösung**: Auto Cache-Busting via Docker ARG BUILD_VERSION — CI/CD injiziert Timestamp (`YYYYMMDDHHmm`) per `sed` in index.html

### Problem: DB-Seeds laufen nur bei frischem Volume
- **Ursache**: `docker-entrypoint-initdb.d` Scripts werden nur bei Volume-Erstellung ausgeführt
- **Lösung**: `src/database/migrate.js` — Auto-Migration/Seed beim App-Start, prüft Zählung und seeded bei Bedarf (idempotent)

### Problem: Equipment Seed mit Escaped Quotes
- **Ursache**: SQL-Statements mit `''` (escaped single quotes) werden beim naiven `;`-Split falsch geteilt
- **Lösung**: Regex-basierter Split `sql.match(/INSERT[^;]*(?:''[^;]*)*;/gi)` im migrate.js

### SEO-Audit Ergebnis
- **KRITISCH**: Hash-Routing (`#/monsties`) verhindert Google-Indexierung
- **GUT**: robots.txt, meta robots, viewport, JSON-LD, OG-Tags, hreflang
- **TODO**: Migration zu History API pushState Routing

## Session 2026-03-15: Map-Textur-Analyse

### Problem: Map-Extraktion aus Game-Dateien nicht möglich
- **Ursache**: Spiel rendert Karten in Echtzeit aus 3D-Terrain-Daten — es gibt keine vorgerenderten 2D-Übersichtskarten
- **Untersuchte Dateien**:
  - `.gtl` (30-50 MB) = 3D-Terrain-Quad-Tiles, NICHT 2D-Karten
  - `.uvs.8` (~1 KB) = UV-Atlas-Metadaten (nur Referenzen)
  - `.pfb.18` = Prefab-Container (nur Referenzen)
  - `mapveilrendertargettexture.rtex` = Render-Targets (live gerendert)
- **Region-Codes**: st100=Azuria, nt100=Canalta, dg100=Tarkuan, nt108=Serathis
- **Lösung**: Game8-Screenshots oder eigene In-Game-Screenshots nötig (so wie bestehende Azuria/Canalta-Maps)
- **Noesis**: Installiert via winget (Pfad: `AppData/Local/Microsoft/WinGet/Packages/RichWhitehouse.Noesis_*/Noesis64.exe`), aber für Map-Extraktion nicht hilfreich
- **Maps-Verzeichnis**: `maps/` im Projekt-Root, served via `app.use('/maps', express.static(...))`

## Session 2026-03-15: SEO Deep-Links, Theme Toggle, Language Dropdown

### SEO-Fixes implementiert
- **Sitemap Bug**: Equipment wurde abgefragt aber nicht in XML eingefügt → gefixt (jetzt 498 URLs)
- **Deep-Link SSR**: `/monstie/slug-id` etc. liefern dynamische meta/OG-Tags serverseitig (`buildDeepLinkHTML()` in app.js)
- **Deep-Link Frontend**: Regex-Match in `init()` erkennt `/monstie/slug-123` → navigiert zu Parent-Seite + öffnet Modal nach 500ms
- **hreflang**: Alle 5 Hauptseiten in sitemap.xml haben jetzt DE/EN hreflang-Links
- **OG-Tags dynamisch**: Frontend aktualisiert og:title, og:description, og:url bei Navigation

### Neues UI: Language Dropdown + Theme Toggle
- **Globus-Icon** statt "EN" Text-Button → öffnet Dropdown mit SVG-Flaggen
- **Sonnen/Mond-Toggle** für Light/Dark Mode, persistent in localStorage
- **Flaggen-Emojis auf Windows**: Werden als "DE"/"GB" Text gerendert → durch inline SVG-Flaggen ersetzt
- **Footer bilingual**: `data-i18n="footer.*"` mit `innerHTML` (wegen `&mdash;`)
- **Light Theme CSS**: `[data-theme="light"]` überschreibt CSS-Variablen

### Equipment Deep-Link Fix
- Equipment-Tabelle hat kein `element` Spalte → `stats->>'element'` aus JSONB extrahiert

### KHAI Color Palette
- **Problem**: Alte Farben nicht konsistent, hardcoded Hex-Werte verstreut
- **Lösung**: KHAI-Palette (MelucioLabs Design System) als CSS custom properties
- Dark: `#1A1A2E` bg, `#5CB85C` accent, `#5BC0DE` secondary, `#7C6AF5` purple
- Light: `#f5f5f5` bg, `#4CAF50` accent, `#2196F3` secondary, `#6355D0` purple
- Alle hardcoded Farben (`#22c55e`, `#0a0e14`, `#ec4899`, `#10b981`, `#7c3aed`) durch `var()` ersetzt

### Mobile Landing Page 2-Spalten-Grid
- **Problem**: Mobile Landing zeigte 1 Spalte mit vollen Karten → viel Scrollen
- **Lösung**: `repeat(2, 1fr)` Grid, `display: none` auf `.home-card p`, 5. Karte zentriert via `grid-column: 1 / -1` + `max-width: calc(50% - 0.375rem)`

## Session 2026-03-15: Deploy-Problem — Pi zieht nicht

### Problem: CI/CD meldet "success" aber Änderungen sind nicht live
- **Ursache**: Docker-Build `sed` Befehl (`RUN sed -i "s/?v=...`) änderte `index.html` im **Arbeitsverzeichnis** auf dem Pi (nicht nur im Container). Dadurch blockierte `git pull` bei jedem Deploy stillschweigend (dirty working tree).
- **Symptom**: GitHub Actions Workflow meldete "completed/success", aber `git pull` schlug fehl. Pi blieb 5-6 Commits hinter `origin/main`.
- **Fix**: `git restore src/public/index.html` auf dem Pi, dann `git pull origin main` + Docker rebuild
- **Präventiv-Fix**: `git checkout -- .` vor `git pull` in `deploy.yml` eingefügt (Commit `f8d5b2d`) ✅

## Rechtliche Hinweise (Capcom / Datamining)

### Risiko-Einschätzung: GitHub + Spieldaten
- **Geringes Risiko**: Fan-Wikis mit extrahierten Namen, Stats und Beschreibungen sind branchenüblich
- **Mittleres Risiko**: Rohe Spieldateien (MSG-Binaries, JSON-Exports) im Repo
- **Hohes Risiko**: Texturen, Modelle, Musik oder andere Assets im Repo
- **Empfehlung**:
  - `tools/REasy/`, `tools/REE.Unpacker/output/`, `tools/parsed_output/` in `.gitignore`
  - Nur abgeleitete Daten (SQL-Seeds) committen, nicht die Rohdaten
  - Fan-Wiki-Disclaimer im Footer ist bereits vorhanden (gut!)
  - Capcom hat historisch Fan-Wikis toleriert (Kiranico, MH Wiki etc.)
  - DMCA-Takedowns betreffen typischerweise Rips von Assets (Texturen, Sounds), nicht Stats/Namen

## Session 2026-03-15: Deployment-Fix Container Rebuild

### Problem: Änderungen nach Commit nicht sichtbar (localhost + live)
- **Ursache**: Docker-Container wurde nur `restart`-ed, aber Code-Änderungen (migrate.js) sind im **Image gebacken** — braucht `docker compose build --no-cache app`
- **Fix lokal**: `docker compose build --no-cache --build-arg BUILD_VERSION=$(date +%Y%m%d%H%M) app && docker compose up -d app`
- **Fix Pi**: `DOCKER_API_VERSION=1.41` vor docker compose Befehlen nötig (Docker Engine 20.10 + Compose v5.1.0 = API-Version-Mismatch)
- **Merke**: Immer `--build-arg BUILD_VERSION=$(date +%Y%m%d%H%M)` beim Build übergeben!

### Problem: Map-Bilder nicht aktualisiert trotz neuer Dateien
- **Ursache**: Map-Images (`/maps/*.png`) werden als Docker-Volume gemountet, kein Build-Cache-Busting
- **Fix**: `Date.now()` Query-Parameter an Map-URL im Frontend (`/maps/${file}?v=${Date.now()}`)

## Session 2026-03-15 (Abend): Gene Type/Element, Horn Melodies, Google Search Console

### Gene Type/Element aus Binärdaten extrahiert
- **Methode**: Direktes Parsen von `genedata_v_09_00.user.3` (RSZ v16 Format)
- **Problem**: REasy Export für gendata war leer, RSZ v16 Parser extrem komplex
- **Lösung**: Byte-Pattern-Analyse der Datensektion (56-Byte-Stride pro Gen-Eintrag)
- **Erkenntnisse**:
  - Field[0] = THREE_WAY_TYPE hash (inline, nicht Object-Ref)
  - Field[1] = EREM_ATTR_TYPE hash (inline)
  - Field[2] = GeneDef.ID_Fixed hash (unique per gene)
  - THREE_WAY Hashes: 0x3c1aeb40=NONE(null), 0x58201900=technical, 0xaeda6400=speed, 0xf08f0680=power
  - Nur 71 Gene haben GeneDef.ID_Fixed Hashes im Enum → 60 gematcht
  - 327 Gene total in genedata, nur 60 mit unseren 115 DB-Genen verknüpfbar

### Horn Melody Resolution
- **Methode**: WeaponDef.MELODY_ID + MELODY_ID_Fixed Enums → MelodyData MSG cross-reference
- **27 Melodien** komplett aufgelöst (bilingual DE/EN)
- **3 fehlende Hashes** manuell identifiziert:
  - -1506610944 → Wyvernfell Melody (default partner melody)
  - -349999872 → Elementless Melody (general horns)
  - -488356384 → Blazing Melody (fire horns: Rathalos, Anjanath etc.)
- Frontend: Melody-Tags auf Horn-Cards, Melodie-Sektion im Detail-Modal
- `_melodyLookup` Map direkt im Frontend (kein extra API-Call nötig)

### Google Search Console
- Verifizierung über `googlefbaf7bba739cdbf1.html` (statische Datei in src/public/)
- Sitemap eingereicht
- Account: mccmdave@gmail.com
- Hinweis: Verification-Datei kann für verschiedene Domains gleich sein wenn selber Account
