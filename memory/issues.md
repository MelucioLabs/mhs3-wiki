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
