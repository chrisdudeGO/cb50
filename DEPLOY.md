# CB50 — Deployment Guide (Railway)

## Übersicht

Das Projekt wird über **Railway** deployed — entweder per CLI oder per Auto-Deploy bei Git-Push.

- **GitHub Repo:** `https://github.com/chrisdudeGO/cb50.git`
- **Railway Projekt:** `cb50` (Service: `cb50`, Environment: `production`)
- **Runtime:** Docker (via `Dockerfile`)

---

## Deployment

### Option A — Railway CLI (empfohlen)

Die Railway CLI ist installiert und mit dem Projekt verlinkt.

```powershell
cd C:\Users\bertsch\Desktop\Temp\git_cb50
railway up
```

Das baut und deployed direkt vom lokalen Rechner. Kein Git-Push nötig.

### Option B — Git Push (wenn Auto-Deploy aktiviert ist)

Falls im Railway Dashboard Auto-Deploy für den `master`-Branch aktiviert ist:

```powershell
cd C:\Users\bertsch\Desktop\Temp\git_cb50
git add -A
git commit -m "deine Änderung"
git push origin master
```

Railway baut dann automatisch.

### Status prüfen

```powershell
railway status    # Zeigt Projekt, Service, Environment
railway logs      # Live-Logs des laufenden Service
```

---

## Environment Variables (in Railway Dashboard)

Diese Variablen müssen im Railway-Projekt unter **Variables** gesetzt sein:

| Variable         | Wert                          |
|------------------|-------------------------------|
| `SITE_URL`       | `https://deine-railway-url`   |
| `ADMIN_PASSWORD` | Sicheres Passwort für Admin   |
| `HOST`           | `0.0.0.0`                     |
| `PORT`           | `4321`                        |

---

## Custom Domain (optional)

1. Railway Dashboard → **Settings** → **Networking** → **Custom Domain**
2. Domain eingeben (z.B. `chris-wird-50.de`)
3. DNS beim Domain-Anbieter: CNAME-Record auf die Railway-URL setzen
4. Railway stellt automatisch ein SSL-Zertifikat aus

---

## Nützliche Infos

- **Logs:** Railway Dashboard → Projekt → **Deployments** → Log-Ansicht
- **Datenbank:** SQLite in `/app/data/` — Railway Volume nötig für Persistenz!
- **Dockerfile:** Baut mit Node 20, installiert native Deps für `better-sqlite3`
- **Port:** App lauscht auf `4321`, Railway leitet automatisch darauf weiter

### Volume für SQLite-Datenbank

Damit die `guests.db` zwischen Deployments erhalten bleibt:

1. Railway Dashboard → **Volumes** → **New Volume**
2. Mount Path: `/app/data`
3. Railway mountet das Volume automatisch bei jedem Deploy

> Ohne Volume gehen Daten bei jedem Redeploy verloren!

---

## Checkliste

- [ ] GitHub Repo mit Railway verbunden
- [ ] Environment Variables in Railway gesetzt
- [ ] Volume für `/app/data` angelegt (SQLite-Persistenz)
- [ ] Push auf `master` löst Auto-Deploy aus
- [ ] Seite erreichbar unter Railway-URL
- [ ] Admin-Login unter `/admin/login` funktioniert
- [ ] Optional: Custom Domain konfiguriert
