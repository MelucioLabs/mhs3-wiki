# Nächste Session — MHS3 Wiki

## Erledigte Aufgaben
- [x] Equipment-Daten Integration: 297 Items (alle 6 Waffentypen + Rüstungen) mit offiziellen DE/EN-Namen aus MSG-Dateien
- [x] Element-Filter für Equipment (fire/water/thunder/ice/dragon/non_elemental)
- [x] Element-Anzeige auf Equipment-Karten (übersetzte Tags)
- [x] Melodie-Hash-Werte bei Jagdhörnern im UI versteckt
- [x] Cache-Busting auf v=5 aktualisiert

## Offene Aufgaben (Priorität)

### 1. Gene-Daten Integration
**Status:** ~316 Gene existieren im Spiel, aber nur technische IDs (GENE_1, PASSIVE_GENE_67 etc.)
**Blocker:** Lesbare Gen-Namen (DE/EN) brauchen MSG-Datei-Parsing. Kandidaten im REE.Unpacker Output:
- `tools/REE.Unpacker/output/natives/stm/gamedesign/text/excel_other/003_otskill.msg.23` (Otomon-Skills)
- Weitere MSG-Dateien in `excel/` und `excel_other/` Verzeichnissen durchsuchen
**Tools:** `tools/parse_msg.js` (funktioniert, läuft in Docker)
**Daten:** genelottery + genepreset existieren in `tools/REasy/exports/usr/`
**DB:** Aktuell 25 Platzhalter-Gene in `init.sql`

### 2. Schmiederechner / Rezeptdaten
**Status:** Materials-Arrays sind leer. `_Recipe` Feld in Waffen/Rüstungen ist meist 0.
**Nächster Schritt:** Rezept-Tabellen in den REasy-Exports oder MSG-Dateien suchen. `itemmaterialdata.msg.23` ist bereits geparst.
**Ziel:** Forge Calculator UI mit Materialien-Berechnung

### 3. Jagdhorn-Melodien
**Status:** Rohe Hash-Werte versteckt. Brauchen MSG-Datei für lesbare Melodie-Namen.
**Hinweis:** Melodie-Daten als Integer-Arrays im JSONB (z.B. `[-488356384, 23079]`)

### 4. Weitere PAK-Extraktion
**Status:** Nur `re_chunk_000.pak` extrahiert. Weitere PAKs vorhanden mit Texturen, Icons.
**Tool:** RETool v0.230 installiert unter `tools/RETool/`
**Hinweis:** Volle Extraktion ~36GB, aber kann nach Dateityp gefiltert werden

### 5. Textur-Extraktion
**Ziel:** Monster-Icons + HD-Karten aus extrahierten PAK-Dateien
**Tool:** Noesis installiert (`noesis64` CLI) für `.tex` → `.png`

## Technische Hinweise
- Docker: `docker compose build --no-cache app && docker compose up -d app` nach Code-Änderungen
- DB-Reset nötig bei Schema-Änderungen: `docker compose down -v && docker compose up -d`
- Equipment-Seed wird via `02_equipment_seed.sql` in docker-entrypoint-initdb.d geladen
- MSG-Parser läuft im Container: `MSYS_NO_PATHCONV=1 docker exec mhs3-app node /app/parse_msg.js /app/FILE.msg.23 /tmp/OUTPUT.json`
- Branch-Mapping: Lokal `master` → Remote `main` (`git push origin master:main`)
