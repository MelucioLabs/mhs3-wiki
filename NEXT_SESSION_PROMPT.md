# Prompt für nächste Session: MHS3 Wiki - Daten & Karte

## Kontext
MHS3 Wiki (Monster Hunter Stories 3: Twisted Reflection) - Fan-Wiki als Docker-App (Node.js/Express + PostgreSQL).
Projekt-Verzeichnis: `C:\Users\Startklar\Desktop\MHS3`
Live unter: `mhs3.meluciolabs.de` (Pi via SSH: `pi-t`)

## Aufgabe 1: Monstie/Monster-Datenbank vervollständigen (PRIORITÄT)

### Aktuelle Lage
- DB hat nur **43 Monsties** und **30 Bestiary-Einträge** in `src/database/init.sql`
- Das Spiel hat **120+ Monsties** und noch mehr Bestiary-Monster
- Schema: `monsties` (name_de/en, element, attack_type, ride_action, habitat_de/en, description_de/en)
- Schema: `monsters` (name_de/en, species, weakness, habitat_de/en, description_de/en)
- Schema: `genes` (name_de/en, gene_type, element, skill_name_de/en, description_de/en)

### Bereits gesammelte Daten aus Community-Quellen

**Ride Actions (aus TheGamer):**
- **Fly:** Yian Kut-Ku, Blue Yian Kut-Ku, Gypceros, Purple Gypceros, Aknosom, Pukei-Pukei, Yian Garuga, Deadeye Yian Garuga, Bishaten, Blood Orange Bishaten, Tobi-Kadachi, Paolumu, Khezu, Red Khezu, Rathian, Pink Rathian, Dreadqueen Rathian, Legiana, Barioth, Sand Barioth, Astalos, Boltreaver Astalos, Rathalos, Azure Rathalos, Dreadking Rathalos, Gravios, Black Gravios, Seregios, Espinas, Rey Dau, Arkveld, Namielle, Velkhana, Malzeno
- **Swim:** Plesioth, Green Plesioth, Royal Ludroth, Purple Ludroth, Somnacanth, Aurora Somnacanth, Lagiacrus, Ivory Lagiacrus, Mizutsune, Soulseer Mizutsune, Almudron
- **Climb:** Bishaten, Blood Orange Bishaten, Blangonga, Garangolm, Ajarakan, Canyne, Nerscylla, Shrouded Nerscylla, Tobi-Kadachi, Odogaron, Ebony Odogaron, Zinogre, Stygian Zinogre, Thunderlord Zinogre, Lunagaron, Magnamalo, Nargacuga, Green Nargacuga, Silverwind Nargacuga, Tigrex, Brute Tigrex, Grimclaw Tigrex, Barioth, Sand Barioth
- **Dive (Ground Dig):** Canyne, Shogun Ceanataur, Barroth, Jade Barroth, Almudron, Gravios, Black Gravios, Diablos, Black Diablos, Bloodbath Diablos
- **Stealth:** Nargacuga, Green Nargacuga, Silverwind Nargacuga
- **Jump (Basic):** Velocidrome, Kulu-Ya-Ku, Arzuros, Chatacabra, Brachydios, Rakna-Kadaki
- Manche Monsties haben MEHRERE Ride Actions (z.B. Barioth: fly+climb, Gravios: fly+dive)

**Monster-Daten (aus TheGamer - Habitats/Regionen in MHS3):**
- Azuria (Sunpetal Plains, Broadleaf Basin) - Startgebiet
- Canalta Timberland - Waldgebiet
- Tarkuan (Colossal Dragon's Remains) - Wüste/Ruinen
- Serathis - Spätes Gebiet
- Weitere Regionen existieren

**Neue Monsties die NICHT in unserer DB sind (Auswahl):**
Astalos, Boltreaver Astalos, Azure Rathalos, Dreadking Rathalos, Pink Rathian, Dreadqueen Rathian, Yian Garuga, Deadeye Yian Garuga, Gypceros, Purple Gypceros, Blue Yian Kut-Ku, Red Khezu, Black Gravios, Sand Barioth, Green Nargacuga, Silverwind Nargacuga, Brute Tigrex, Grimclaw Tigrex, Ivory Lagiacrus, Soulseer Mizutsune, Purple Ludroth, Aurora Somnacanth, Stygian Zinogre, Thunderlord Zinogre, Ebony Odogaron, Jade Barroth, Plesioth, Green Plesioth, Blangonga, Ajarakan, Canyne, Shrouded Nerscylla, Blood Orange Bishaten, Black Diablos, Bloodbath Diablos, Diablos, Namielle, Great Izuchi, Aknosom (fehlte evtl.), und weitere...

### Quellen zum Fetchen (in dieser Reihenfolge)
1. **Game8:** https://game8.co/games/Monster-Hunter-Stories-3/archives/584376 (Komplette Monstie-Liste)
2. **Monster Hunter Wiki:** https://monsterhunterwiki.org/wiki/MHST3/Monsties (Details pro Monstie)
3. **TheGamer Complete List:** https://www.thegamer.com/monster-hunter-stories-3-twisted-reflection-monsters-weaknesses-type-location-loot-info/
4. **Deltia's Gaming:** https://deltiasgaming.com/monster-hunter-stories-3-monster-list-guide/

### Was zu tun ist
1. Fetch die Quellen oben und sammle ALLE Monstie-Daten
2. Für jedes Monstie brauchen wir: name_de, name_en, element, attack_type (power/speed/technical), ride_action, habitat_de, habitat_en, description_de, description_en
3. Aktualisiere `src/database/init.sql` mit allen ~120+ Monsties
4. Aktualisiere auch die `monsters` (Bestiary) Tabelle - inkl. Small Monsters
5. Erweitere die `genes` Tabelle mit mehr Genen
6. Deutsche Namen: Verwende offizielle DE-Lokalisierung (die meisten Monsternamen bleiben gleich)
7. Attack Types auf Deutsch: Kraft=Power, Technik=Technical, Geschwindigkeit=Speed (werden im Frontend übersetzt)
8. Regionen DE: Azuria, Canalta-Waldland, Tarkuan, Serathis (offizielle DE-Namen von der Capcom-Seite holen)

### Sekundär: Datamining aus Spieldateien
- Spiel installiert unter: `C:\Program Files (x86)\Steam\steamapps\common\MONSTER_HUNTER_STORIES_3_TWISTED_REFLECTION`
- Hauptdateien: `re_chunk_000.pak` + `re_chunk_000.pak.sub_000.pak` (je 18GB, RE Engine Format)
- Tool zum Entpacken: https://github.com/Ekey/REE.PAK.Tool
- Falls REE.PAK.Tool verfügbar: Entpacke die .pak und suche nach JSON/CSV/MSG-Dateien mit Monster-Daten
- MSG-Dateien (.msg.22) enthalten Lokalisierungstexte
- user/*.user.2 Dateien enthalten Gameplay-Parameter

---

## Aufgabe 2: Interaktive Karte integrieren

### Anforderungen
- Eigene interaktive Karte der MHS3-Spielwelt
- Basiert auf Leaflet.js (bereits als Dependency vorhanden oder hinzufügen)
- Regionen: Azuria, Canalta Timberland, Tarkuan, Serathis und weitere
- Markierungen für Monstie-Fundorte, Eier-Nester, NPCs, Truhen etc.
- **Ohne Login:** Karte ist für jeden nutzbar als Research-Tool
- **Mit Login:** User können gefundene Monsties "abhaken" und Fortschritt speichern
- Login-System kommt separat (erstmal nur die Karte ohne Auth)

### Technisch
- Neue Route: `/map` oder als eigener Bereich im SPA
- Kartenbild: Entweder selbst erstellen aus In-Game-Screenshots oder Community-Map als Vorlage
- Marker-Daten in DB speichern (neue Tabelle `map_markers`)
- Frontend: Leaflet.js mit Custom Tiles oder einzelnem großen Bild
- Responsive, touch-fähig

### Karten-Vorlage
- Eventuell von Community-Maps (z.B. mapgenie.io) als Vorlage inspirieren lassen
- Eigene Karte erstellen die zu unserem Dark-Theme passt

---

## SEO (falls noch nicht gemacht)
- Meta-Tags mit "MHS3 Wiki", "Monster Hunter Stories 3 Wiki", "Interaktive Karte"
- Open Graph Tags für Social Sharing
- Strukturierte Daten (JSON-LD) für die Monster-Einträge
- Sitemap.xml und robots.txt
- Seitentitel-Pattern: "Monstie-Name | MHS3 Wiki - Monster Hunter Stories 3"

---

## Wichtige Hinweise
- Kommunikation auf Deutsch
- Dark Theme ist bereits implementiert
- Modals statt separate Detail-Seiten
- Docker-Deployment: Raspberry Pi (ARM64) + AWS EC2 (AMD64)
- PostgreSQL mit GIN Full-Text-Search Indexes (DE+EN)
- Live-Server: mhs3.meluciolabs.de (SSH: pi-t)
