# ZenithStore - Guida Demo e Valutazione

Questa guida fornisce un percorso step-by-step per testare e valutare il progetto ZenithStore DevOps.

## Prerequisiti

Assicurarsi di avere installato:
- Docker Desktop (Windows/Mac) o Docker Engine + Docker Compose (Linux)
- Git
- Node.js 18+ (opzionale, solo per test locali)
- curl o Postman (per testare API)

## Setup Iniziale

### 1. Clone del Repository

```bash
git clone https://github.com/YOUR_USERNAME/zenithstore-devops.git
cd zenithstore-devops
```

### 2. Verifica Struttura Progetto

```bash
# Windows PowerShell
tree /F

# Linux/Mac
tree -L 2

# Output atteso:
# .
# ├── app/
# │   ├── src/
# │   ├── tests/
# │   ├── Dockerfile
# │   └── package.json
# ├── .github/workflows/
# ├── monitoring/
# ├── environments/
# ├── scripts/
# └── docs/
```

---

## Demo 1: Test Suite

Dimostra che tutti i test passano.

```bash
# Entrare nella directory app
cd app

# Installare dipendenze
npm install

# Eseguire test
npm test
```

**Output Atteso:**
```
PASS  tests/products.test.js
PASS  tests/cart.test.js
PASS  tests/orders.test.js
PASS  tests/health.test.js

Test Suites: 4 passed, 4 total
Tests:       20 passed, 20 total
Coverage:    > 80%
```

**Screenshot da catturare:**
- [ ] Output completo test suite
- [ ] Coverage report

---

## Demo 2: Build Docker

Dimostra la containerizzazione funzionante.

```bash
# Tornare alla root
cd ..

# Build immagine Docker
docker build -t zenithstore:demo ./app

# Verificare immagine creata
docker images | grep zenithstore

# Output: zenithstore  demo  <hash>  X MB
```

**Verifiche:**
```bash
# Controllare dimensione immagine (dovrebbe essere ~50-60MB)
docker images zenithstore:demo --format "{{.Size}}"

# Ispezionare layers
docker history zenithstore:demo
```

**Screenshot da catturare:**
- [ ] Build output
- [ ] docker images output

---

## Demo 3: Deploy Development

Dimostra il deployment completo dell'ambiente dev.

```bash
# Deploy ambiente development
bash scripts/deploy.sh dev

# Oppure su Windows Git Bash:
sh scripts/deploy.sh dev
```

**Output Atteso:**
```
[INFO] ╔═══════════════════════════════════════╗
[INFO] ║   ZenithStore Deployment Script      ║
[INFO] ╚═══════════════════════════════════════╝
[INFO] Environment: dev
[INFO] Version: latest
[INFO] Loading environment configuration...
[INFO] Building Docker image...
[INFO] Starting containers...
[INFO] ✓ Application is healthy!

[INFO] ╔═══════════════════════════════════════╗
[INFO] ║   Deployment Successful!              ║
[INFO] ╚═══════════════════════════════════════╝

[INFO] Application:  http://localhost:3000
[INFO] Prometheus:   http://localhost:9090
[INFO] Grafana:      http://localhost:3001
```

**Verifiche:**

```bash
# Verificare container attivi
docker ps

# Output atteso: 3 container running
# - zenithstore-app-dev
# - zenithstore-prometheus-dev
# - zenithstore-grafana-dev
```

**Screenshot da catturare:**
- [ ] Deploy script output
- [ ] docker ps output

---

## Demo 4: Test API Endpoints

Dimostra che l'applicazione funziona correttamente.

### Health Check

```bash
curl http://localhost:3000/api/health
```

**Output Atteso:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 45.2,
  "environment": "development"
}
```

### Lista Prodotti

```bash
curl http://localhost:3000/api/products
```

**Output Atteso:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": 1,
      "name": "Premium Leather Wallet",
      "category": "Accessories",
      "price": 89.99,
      "stock": 45
    },
    ...
  ]
}
```

### Singolo Prodotto

```bash
curl http://localhost:3000/api/products/1
```

### Categorie

```bash
curl http://localhost:3000/api/products/categories
```

### Aggiungi al Carrello

```bash
curl -X POST http://localhost:3000/api/cart/demo-user/add \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'
```

**Output Atteso:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": [
    {
      "productId": 1,
      "name": "Premium Leather Wallet",
      "price": 89.99,
      "quantity": 2
    }
  ]
}
```

### Visualizza Carrello

```bash
curl http://localhost:3000/api/cart/demo-user
```

### Crea Ordine

```bash
curl -X POST http://localhost:3000/api/orders/demo-user
```

**Output Atteso:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": 1001,
    "userId": "demo-user",
    "items": [...],
    "total": 179.98,
    "status": "confirmed",
    "createdAt": "2024-01-20T10:35:00.000Z"
  }
}
```

**Screenshot da catturare:**
- [ ] Output health check
- [ ] Output API prodotti
- [ ] Output creazione ordine

---

## Demo 5: Metriche Prometheus

Dimostra il monitoring funzionante.

### Endpoint Metriche

```bash
curl http://localhost:3000/metrics
```

**Output Atteso (parziale):**
```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/api/products",status_code="200"} 15

# HELP http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.01",method="GET",route="/api/products",status_code="200"} 12
http_request_duration_seconds_bucket{le="0.05",method="GET",route="/api/products",status_code="200"} 15

# HELP nodejs_version_info Node.js version info
# TYPE nodejs_version_info gauge
nodejs_version_info{version="v18.x.x"} 1
```

### Prometheus UI

1. Aprire browser: http://localhost:9090
2. Navigare a **Status → Targets**
3. Verificare che `zenithstore-app` sia **UP**

**Query da testare in Prometheus:**

```promql
# Totale richieste
http_requests_total

# Rate richieste (req/sec)
rate(http_requests_total[5m])

# Latenza p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
sum(rate(http_request_errors_total[5m])) / sum(rate(http_requests_total[5m]))
```

**Screenshot da catturare:**
- [ ] Prometheus Targets (status UP)
- [ ] Query graph http_requests_total
- [ ] Metrics endpoint output

---

## Demo 6: Grafana Dashboard

Dimostra la visualizzazione delle metriche.

1. Aprire browser: http://localhost:3001
2. Login:
   - Username: `admin`
   - Password: `admin`
3. Aggiungere Datasource Prometheus:
   - Configuration → Data Sources → Add data source
   - Selezionare **Prometheus**
   - URL: `http://prometheus:9090`
   - Save & Test

4. Creare Dashboard:
   - Create → Dashboard → Add new panel
   - Query: `rate(http_requests_total[5m])`
   - Visualizzazione: Time series
   - Save

**Query da visualizzare:**

**Panel 1: Request Rate**
```promql
sum(rate(http_requests_total[5m])) by (route)
```

**Panel 2: Error Rate**
```promql
sum(rate(http_request_errors_total[5m])) / sum(rate(http_requests_total[5m])) * 100
```

**Panel 3: Latency p95**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Screenshot da catturare:**
- [ ] Grafana login
- [ ] Datasource configuration
- [ ] Dashboard con 3 panel

---

## Demo 7: Multi-Environment

Dimostra la gestione di più ambienti.

### Staging

```bash
# Deploy staging
bash scripts/deploy.sh staging

# Verificare ambiente
curl http://localhost:3000/api/health | grep staging
```

### Production

```bash
# Deploy production
bash scripts/deploy.sh prod

# Verificare environment variable
docker exec zenithstore-app-prod printenv NODE_ENV
# Output: production
```

**Confronto Configurazioni:**

```bash
# Visualizzare differenze
cat environments/.env.dev
cat environments/.env.staging
cat environments/.env.prod
```

**Screenshot da catturare:**
- [ ] Deploy staging output
- [ ] Differenze file .env

---

## Demo 8: Rollback

Dimostra la procedura di rollback.

```bash
# Simulare versione precedente
docker tag zenithstore:prod zenithstore:v1.0.0

# Deploy nuova versione
bash scripts/deploy.sh prod v1.1.0

# Rollback a versione precedente
bash scripts/rollback.sh prod v1.0.0

# Verificare rollback
curl http://localhost:3000/api/health
```

**Screenshot da catturare:**
- [ ] Rollback script output
- [ ] Health check post-rollback

---

## Demo 9: GitHub Actions (CI/CD)

**NOTA:** Questa demo richiede il repository su GitHub.

### Setup Repository GitHub

1. Creare repository su GitHub
2. Aggiungere remote:

```bash
git remote add origin https://github.com/YOUR_USERNAME/zenithstore-devops.git
```

3. Push codice:

```bash
git add .
git commit -m "Initial commit: ZenithStore DevOps project"
git push -u origin main
```

### Verifica Pipeline

1. Andare su GitHub → Actions
2. Verificare workflow "CI/CD Pipeline" in esecuzione
3. Controllare jobs:
   - ✅ Test
   - ✅ Build
   - ✅ Push Image
   - ⏸️ Deploy Staging (waiting)

**Screenshot da catturare:**
- [ ] GitHub Actions workflow
- [ ] Test job output
- [ ] Build job output
- [ ] Deploy staging (se configurato)

---

## Demo 10: Load Test (Opzionale)

Genera traffico per popolare metriche.

### Con Apache Bench (ab)

```bash
# Installare ab se necessario
# Ubuntu: apt-get install apache2-utils
# Mac: brew install httpd

# 1000 richieste, 10 concurrent
ab -n 1000 -c 10 http://localhost:3000/api/products
```

### Con hey

```bash
# Installare hey
go install github.com/rakyll/hey@latest

# 1000 richieste in 10 secondi
hey -z 10s -c 10 http://localhost:3000/api/products
```

**Dopo il load test:**

1. Aprire Prometheus: http://localhost:9090
2. Query: `rate(http_requests_total[1m])`
3. Visualizzare spike nel grafico

**Screenshot da catturare:**
- [ ] Load test output
- [ ] Prometheus graph durante load test
- [ ] Grafana dashboard durante load test

---

## Checklist Valutazione

### Requisiti Funzionali

- [ ] Pipeline CI/CD funzionante
- [ ] Multi-environment (dev/staging/prod)
- [ ] Monitoring con Prometheus
- [ ] Dashboard Grafana
- [ ] Health check endpoint
- [ ] Deploy automatizzato
- [ ] Rollback funzionante

### Requisiti Tecnici

- [ ] Test coverage > 80%
- [ ] Docker multi-stage build
- [ ] GitHub Actions workflow
- [ ] Metriche RED implementate
- [ ] Graceful shutdown
- [ ] Security headers (Helmet)

### Documentazione

- [ ] README.md completo
- [ ] OPERATIONS.md con procedure
- [ ] ARCHITECTURE.md con decisioni tecniche
- [ ] File .env.example

### Extra

- [ ] Script deploy.sh funzionante
- [ ] Script rollback.sh funzionante
- [ ] Logs strutturati
- [ ] Error handling

---

## Troubleshooting Demo

### Porta già in uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Docker Compose fallisce

```bash
# Pulire tutto
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a

# Rebuild
docker-compose -f docker-compose.dev.yml up -d --build
```

### Test falliscono

```bash
cd app
rm -rf node_modules package-lock.json
npm install
npm test
```

---

## Comandi Pulizia

Dopo la demo, pulire l'ambiente:

```bash
# Stop containers
docker-compose -f docker-compose.dev.yml down

# Rimuovere volumi
docker-compose -f docker-compose.dev.yml down -v

# Rimuovere immagini
docker rmi zenithstore:dev zenithstore:staging zenithstore:prod

# Pulizia completa Docker
docker system prune -a --volumes
```

---

## Video Demo (Suggerito)

Registrare un video di 5-10 minuti mostrando:

1. Esecuzione test suite (30s)
2. Deploy con script (1min)
3. Test API endpoints (2min)
4. Prometheus targets e query (2min)
5. Grafana dashboard (2min)
6. Rollback demo (1min)
7. GitHub Actions workflow (1min)

**Tool consigliati:**
- OBS Studio (free)
- Loom (cloud)
- QuickTime (Mac)

---

## Contatti

Per domande sulla demo:
- Email: ops@zenithstore.com
- Slack: #zenithstore-demo
