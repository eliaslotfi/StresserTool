# Stress Test Lab

Plateforme web de test de charge interne (HTTP/HTTPS) avec FastAPI + Next.js, WebSocket temps réel, métriques, proxies et persistance SQLite.

## Configuration (.env)

Créez un fichier `.env` (ou variables d'environnement) côté serveur:

```
STRESS_API_KEY=BrockLesnar77
STRESS_ALLOWED_IPS=
STRESS_DB_PATH=stresslab.db
```

- STRESS_API_KEY: mot de passe unique pour toutes les requêtes.
- STRESS_ALLOWED_IPS: vide = accessible à tous. Peut contenir IP/CIDR si vous voulez restreindre.
- STRESS_DB_PATH: chemin SQLite.

## Backend (FastAPI)

### Dépendances

```bash
python -m venv venv && . venv/Scripts/activate  # Windows PowerShell: .\venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

### Démarrage (dev)

```bash
uvicorn backend.backend_stress_test:app --host 0.0.0.0 --port 8000 --reload
```

### Démarrage (service systemd sur Linux)

Exemple `/etc/systemd/system/stresslab.service`:

```
[Unit]
Description=StressLab FastAPI Service
After=network.target

[Service]
WorkingDirectory=/opt/StresserTool/backend
Environment=STRESS_API_KEY=BrockLesnar77
Environment=STRESS_ALLOWED_IPS=
Environment=STRESS_DB_PATH=/opt/StresserTool/backend/stresslab.db
ExecStart=/opt/StresserTool/backend/venv/bin/uvicorn backend_stress_test:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Puis:

```bash
sudo systemctl daemon-reload
sudo systemctl enable stresslab
sudo systemctl start stresslab
sudo systemctl status stresslab
```

### Auth, anti-bruteforce et sécurité

- Auth requise pour tous les endpoints via header `x-api-key` ou `Authorization: Bearer <clé>`.
- WebSocket `/ws/tests/{id}`: passer `?key=<clé>` dans l'URL.
- Anti-bruteforce: 5 requêtes/min par IP (erreur 429 au-delà).
- Kill switch global: `POST /admin/kill_switch?enabled=true|false`.
- Si exposé publiquement, utilisez TLS (reverse proxy Nginx/Caddy) et monitorez les logs.

## Frontend (Next.js)

### Dépendances

```bash
pnpm install
```

### Configuration env frontend

Créer `.env.local` à la racine:

```
NEXT_PUBLIC_STRESS_API_BASE=http://<votre_serveur>:8000
NEXT_PUBLIC_STRESS_API_KEY=BrockLesnar77
```

### Dev

```bash
pnpm dev
```

### Build & Start (prod)

```bash
pnpm build
pnpm start -p 3000
```

Servez le frontend derrière un reverse proxy (Nginx/Caddy) si souhaité.

## Endpoints principaux

- `POST /tests` (start), `GET /tests/{id}` (status), `POST /tests/{id}/cancel` (stop)
- `GET /tests/{id}/report?format=json|csv` (export)
- `GET /history`, `GET /history/{id}` (persistance)
- `WS /ws/tests/{id}?key=<clé>` (temps réel)

## Exemple de charge utile

```json
{
  "url": "http://192.168.1.100",
  "duration": 60,
  "concurrency": 100,
  "proxies": ["socks5://127.0.0.1:9050"]
}
```
