# MHS3 Wiki - Monster Hunter Stories 3: Twisted Reflection

Fan-Wiki mit Monstie-Datenbank, Bestiarum, Ausrüstung und Gene-Rechner.

## Tech Stack

- **Backend:** Node.js + Express (modulare Router-Struktur)
- **Datenbank:** PostgreSQL mit Full-Text-Search
- **Frontend:** Vanilla JS + HTML/CSS
- **Deployment:** Docker Compose

## Quick Start

```bash
# 1. .env erstellen
cp .env.example .env
# Passwörter in .env anpassen!

# 2. Starten
docker compose up -d

# 3. Fertig!
# Wiki:     http://localhost:3000
# pgAdmin:  http://localhost:5050
```

## Setup auf Raspberry Pi 4/5

### Voraussetzungen

```bash
# Docker installieren
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Neu einloggen, dann:
docker --version
```

### Deployment

```bash
git clone <repo-url> ~/mhs3-wiki
cd ~/mhs3-wiki
cp .env.example .env
nano .env  # Passwörter ändern!
docker compose up -d
```

Die App läuft auf `http://<pi-ip>:3000`.

## Setup auf AWS EC2

### 1. EC2-Instanz starten

- **AMI:** Ubuntu 22.04 LTS oder Amazon Linux 2023
- **Typ:** t3.small (oder t4g.small für ARM/Graviton)
- **Security Group:** Ports 80, 443, 22 öffnen

### 2. Docker installieren

```bash
# Ubuntu
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Amazon Linux 2023
sudo yum install -y docker
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 3. App deployen

```bash
git clone <repo-url> ~/mhs3-wiki
cd ~/mhs3-wiki
cp .env.example .env
nano .env  # NODE_ENV=production, sichere Passwörter setzen!
docker compose up -d
```

### 4. nginx + SSL (optional)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp nginx/nginx.conf.example /etc/nginx/sites-available/mhs3-wiki
sudo ln -s /etc/nginx/sites-available/mhs3-wiki /etc/nginx/sites-enabled/
# Domain in der Config anpassen, dann:
sudo certbot --nginx -d your-domain.com
sudo systemctl reload nginx
```

## Projektstruktur

```
src/
├── app.js                  # Express Server
├── database/
│   ├── connection.js       # PostgreSQL Connection Pool
│   └── init.sql            # Schema + Seed-Daten
├── modules/
│   ├── monsties/           # Monstie-Datenbank + Genes
│   ├── bestiary/           # Monster-Bestiarum
│   ├── equipment/          # Waffen & Rüstungen
│   ├── i18n/               # Mehrsprachigkeit (DE/EN)
│   └── search/             # PostgreSQL Full-Text-Search
├── public/                 # Frontend (HTML/CSS/JS)
└── locales/                # Sprachdateien
```

## API Endpoints

| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/api/monsties` | Alle Monsties (Filter: element, attack_type, ride_action) |
| GET | `/api/monsties/:id` | Monstie-Details |
| GET | `/api/monsties/genes` | Alle Genes (Filter: gene_type, element) |
| GET | `/api/monsties/filters` | Verfügbare Filterwerte |
| GET | `/api/bestiary` | Alle Monster (Filter: weakness, habitat, species) |
| GET | `/api/bestiary/:id` | Monster-Details |
| GET | `/api/equipment` | Alle Ausrüstung (Filter: type, rarity) |
| GET | `/api/equipment/:id` | Ausrüstungs-Details |
| GET | `/api/search?q=...` | Volltextsuche |
| GET | `/api/i18n/:lang` | Sprachdatei (de/en) |
| GET | `/api/health` | Health-Check |

Alle Endpoints unterstützen `?lang=de` oder `?lang=en`.

## Verwaltung

```bash
# Logs anschauen
docker compose logs -f app

# Neustart
docker compose restart app

# Alles stoppen
docker compose down

# Datenbank zurücksetzen (ACHTUNG: löscht alle Daten!)
docker compose down -v
docker compose up -d
```
