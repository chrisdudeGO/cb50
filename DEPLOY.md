# CB50 — Deployment Guide (IONOS VPS)

## Was du brauchst

1. **IONOS VPS** — kleinster Linux-Plan reicht (~€1-2/Monat)
   - Ubuntu 22.04 oder 24.04
   - [VPS bestellen](https://www.ionos.de/server/vps)

2. **Domain** — bei IONOS registrieren (~€1/Jahr für .de)
   - z.B. `chris-wird-50.de`, `cb50.de`, `chris50.hamburg`
   - [Domain registrieren](https://www.ionos.de/domains/domain-registrieren)

---

## Schritt 1: VPS bestellen & Domain registrieren

1. Geh zu [IONOS VPS](https://www.ionos.de/server/vps) → wähle **VPS Linux XS** (kleinster Plan)
2. Wähle **Ubuntu 24.04** als Betriebssystem
3. Notiere dir die **Server-IP** nach der Einrichtung
4. Registriere deine Domain unter [Domains](https://www.ionos.de/domains/domain-registrieren)

## Schritt 2: Domain auf VPS zeigen lassen

Im IONOS Control Panel:
1. Gehe zu **Domains & SSL** → deine Domain auswählen
2. **DNS-Einstellungen** → **A-Record** bearbeiten
3. Setze den A-Record auf die **IP-Adresse deines VPS**
4. Optional: Auch einen A-Record für `www.deinedomain.de` anlegen

> DNS-Änderungen können bis zu 24h dauern (meist geht's aber in Minuten).

## Schritt 3: Per SSH auf den Server verbinden

Öffne PowerShell (Windows) oder Terminal (Mac):

```bash
ssh root@DEINE_SERVER_IP
```

Beim ersten Mal wirst du nach dem Passwort gefragt (steht in der IONOS-Einrichtlings-Email).

## Schritt 4: Server einrichten

Auf dem Server diese Befehle ausführen:

```bash
# System updaten
apt update && apt upgrade -y

# Node.js 20 installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Build-Tools für native Module (better-sqlite3)
apt install -y build-essential python3

# PM2 (Process Manager) & Nginx (Webserver) installieren
npm install -g pm2
apt install -y nginx

# Certbot für SSL-Zertifikate
apt install -y certbot python3-certbot-nginx

# App-Verzeichnis anlegen
mkdir -p /var/www/cb50/data
mkdir -p /var/www/cb50/logs
```

## Schritt 5: Projekt hochladen

**Option A — Von deinem Windows-PC mit SCP** (einfachster Weg):

1. Erst lokal bauen:
```powershell
cd C:\Users\bertsch\Desktop\Temp\git_cb50
npm run build
```

2. Dann hochladen (in PowerShell):
```powershell
# Dist-Ordner hochladen
scp -r dist/* root@DEINE_SERVER_IP:/var/www/cb50/dist/

# Config-Dateien hochladen
scp package.json root@DEINE_SERVER_IP:/var/www/cb50/
scp package-lock.json root@DEINE_SERVER_IP:/var/www/cb50/
scp ecosystem.config.cjs root@DEINE_SERVER_IP:/var/www/cb50/
```

3. `.env` Datei auf dem Server erstellen:
```bash
# Auf dem Server (per SSH):
cat > /var/www/cb50/.env << 'EOF'
SITE_URL=https://deinedomain.de
ADMIN_PASSWORD=dein-sicheres-passwort-hier
HOST=127.0.0.1
PORT=4321
EOF
```

**Option B — Mit Git** (wenn du ein Repo hast):

```bash
# Auf dem Server:
cd /var/www
git clone https://github.com/DEIN_USER/cb50.git
cd cb50
npm ci
npm run build
```

## Schritt 6: Dependencies installieren & starten

Auf dem Server:

```bash
cd /var/www/cb50

# Nur Produktions-Dependencies
npm ci --omit=dev

# App mit PM2 starten
pm2 start ecosystem.config.cjs

# PM2 beim Neustart automatisch starten
pm2 save
pm2 startup
# → Den angezeigten Befehl kopieren und ausführen!
```

Testen ob die App läuft:
```bash
curl http://localhost:4321
# Sollte HTML zurückgeben
```

## Schritt 7: Nginx einrichten

```bash
# Nginx-Config kopieren
cat > /etc/nginx/sites-available/cb50 << 'NGINX'
server {
    listen 80;
    server_name DEINEDOMAIN.de www.DEINEDOMAIN.de;

    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_astro/ {
        proxy_pass http://127.0.0.1:4321;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

# Aktivieren
ln -sf /etc/nginx/sites-available/cb50 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testen & starten
nginx -t
systemctl reload nginx
```

Jetzt sollte `http://DEINEDOMAIN.de` (oder `http://DEINE_SERVER_IP`) die Seite zeigen!

## Schritt 8: SSL-Zertifikat (HTTPS)

```bash
certbot --nginx -d DEINEDOMAIN.de -d www.DEINEDOMAIN.de
```

Certbot fragt nach deiner Email und richtet automatisch ein kostenloses Let's Encrypt Zertifikat ein. Danach geht `https://DEINEDOMAIN.de` automatisch.

Auto-Renewal testen:
```bash
certbot renew --dry-run
```

## Schritt 9: Firewall einrichten

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## Updates deployen

Wenn du Änderungen machst:

```powershell
# Lokal (Windows):
cd C:\Users\bertsch\Desktop\Temp\git_cb50
npm run build

# Hochladen:
scp -r dist/* root@DEINE_SERVER_IP:/var/www/cb50/dist/
```

```bash
# Auf dem Server:
cd /var/www/cb50
pm2 restart cb50
```

---

## Nützliche Befehle

```bash
# App Status & Logs
pm2 status
pm2 logs cb50
pm2 logs cb50 --lines 50

# App neustarten
pm2 restart cb50

# Nginx Status
systemctl status nginx
nginx -t

# Datenbank-Backup (regelmäßig machen!)
cp /var/www/cb50/data/guests.db /var/www/cb50/data/guests_backup_$(date +%F).db
```

---

## Checkliste

- [ ] IONOS VPS bestellt (Ubuntu 24.04)
- [ ] Domain registriert
- [ ] DNS A-Record → Server-IP gesetzt
- [ ] SSH-Zugang funktioniert
- [ ] Node.js, PM2, Nginx installiert
- [ ] Projekt hochgeladen & gebaut
- [ ] `.env` mit sicherem Passwort erstellt
- [ ] PM2 läuft & ist für Autostart konfiguriert
- [ ] Nginx konfiguriert & aktiv
- [ ] SSL-Zertifikat eingerichtet
- [ ] Firewall aktiviert
- [ ] Seite unter `https://DEINEDOMAIN.de` erreichbar
- [ ] Admin-Login unter `https://DEINEDOMAIN.de/admin/login` funktioniert
