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
