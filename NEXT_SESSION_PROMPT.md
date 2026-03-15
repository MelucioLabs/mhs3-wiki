# Nächste Session — MHS3 Wiki

## Erledigte Aufgaben
- [x] Equipment-Daten: 297 Items mit offiziellen DE/EN-Namen aus MSG-Dateien
- [x] Element-Filter + Element-Tags auf Equipment-Karten (übersetzt)
- [x] Melodie-Hash-Werte bei Jagdhörnern im UI versteckt
- [x] ALLE PAKs bereits entpackt (re_chunk_000.pak + sub_000.pak = 126K+ Dateien)
- [x] 18 MSG-Dateien geparst (Equipment, Skills, Melodien, Items)

## Sofort umsetzbar (Daten liegen bereit!)

### 1. Gene-Daten Integration (HÖCHSTE PRIORITÄT)
**Was haben wir:**
- `tools/parsed_output/msg/passiveskilldata.json` — 354 passive Skills (DE/EN Namen + Beschreibungen)
- `tools/parsed_output/msg/002_monsterskill.json` — 278 aktive Monster-Skills (DE/EN)
- `tools/parsed_output/msg/003_otskill.json` — 89 Kinship-Skills (DE/EN)
- `tools/REasy/exports/usr/genelottery/_Values.json` — Monstie → Gene-Mapping
- `tools/REasy/exports/usr/genepreset/_Values.json` — 3x3 Gen-Presets
- GeneDef.ID Enum in `tools/REasy/resources/data/enums/mhst3_enums.json` (~316 Gene)

**Was fehlt:**
- Cross-Referenz: GeneDef.ID_Fixed Hash → Skill-Name aus MSG (numerische IDs korrelieren: `PassiveSkillData_NAME_1` = Skill-ID 1)
- gendata Export LEER — Element/Typ pro Gen muss aus Enum oder anderem Weg ermittelt werden
- DB-Schema anpassen: aktuelle 25 Platzhalter-Gene ersetzen durch echte ~316 Gene

**Aktuelles DB-Schema (genes):**
```sql
id, name_de, name_en, gene_type (power/speed/technical), element, skill_name_de, skill_name_en, description_de, description_en
```

### 2. Horn-Melodien auflösen
**Was haben wir:**
- `tools/parsed_output/msg/melodydata.json` — 27 Melodien mit DE/EN Namen + Effektbeschreibungen
- Equipment JSONB hat `melody` und `partner_melody` als Hash-Arrays (z.B. `[-488356384, 23079]`)

**Was fehlt:**
- Mapping: Melody-Hash → Melodie-Name aus MSG. Die zweite Zahl im Array könnte eine Skill-ID sein.

### 3. Schmiederechner / Rezeptdaten
**Status:** `_Recipe` Feld meist 0. Rezept-Tabellen nicht gefunden.
**Nächster Schritt:** In REasy-Exports nach recipe/craft Daten suchen, oder weitere .user.3 Dateien exportieren.

### 4. Textur-Extraktion
**Status:** Alle PAKs entpackt. Monster-Icons und HD-Maps liegen als .tex Dateien vor.
**Tool:** Noesis (`noesis64` CLI) für `.tex` → `.png`

## Technische Hinweise
- Docker rebuild: `docker compose build --no-cache app && docker compose up -d app`
- DB-Reset: `docker compose down -v && docker compose up -d`
- MSG-Parser: `MSYS_NO_PATHCONV=1 docker exec mhs3-app node /app/tools/parse_msg.js /tmp/input.msg.23 /tmp/output.json`
- Branch-Mapping: `git push origin master:main` (triggert CI/CD → Deploy auf Pi)
- Cache-Busting: aktuell `?v=5`
- `tools/` ist in `.gitignore` — Rohdaten werden nicht committed
