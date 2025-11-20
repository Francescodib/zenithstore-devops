# ZenithStore - Progetto DevOps CI/CD

**Studente**: Francesco di Biase
**Repository**: https://github.com/Francescodib/zenithstore-devops
**Data Consegna**: Novembre 2025

---

## Descrizione Progetto

ZenithStore è un progetto DevOps che implementa una pipeline CI/CD completa per un'applicazione e-commerce mock. Include deployment automatizzato, monitoring con Prometheus/Grafana e gestione multi-environment.

### Caratteristiche Principali

- ✅ **Pipeline CI/CD** - GitHub Actions automatizzata
- ✅ **Multi-Environment** - Dev, Staging, Production
- ✅ **Monitoring** - Prometheus + Grafana con metriche RED
- ✅ **Containerizzazione** - Docker con build multi-stage
- ✅ **Health Checks** - Endpoint e Docker healthcheck
- ✅ **Deploy Automatizzato** - Script bash con rollback
- ✅ **Test Coverage** - 97.36% con Jest

---

## Stack Tecnologico

- **Backend**: Node.js 18, Express.js
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana
- **Metrics**: prom-client (RED method)

---

## Prerequisiti

Per eseguire il progetto sono necessari:

- **Docker Desktop** (Windows/Mac) o Docker Engine + Docker Compose (Linux)
- **Git**
- **Node.js 18+** (opzionale, solo per sviluppo locale)

### Verifica Installazione

```bash
docker --version          # Richiesto: >= 20.10
docker-compose --version  # Richiesto: >= 2.0
node --version            # Opzionale: >= 18.0
```

---

## Quick Start

### 1. Clone del Repository

```bash
git clone https://github.com/Francescodib/zenithstore-devops.git
cd zenithstore-devops
```

### 2. Deploy Ambiente Development

```bash
# Windows (Git Bash o WSL)
bash scripts/deploy.sh dev

# Linux/Mac
./scripts/deploy.sh dev
```

Lo script eseguirà automaticamente:
1. Build delle immagini Docker
2. Avvio dei container (app, Prometheus, Grafana)
3. Health check dell'applicazione

**Output atteso:**
```
[INFO] ╔═══════════════════════════════════════╗
[INFO] ║   Deployment Successful!              ║
[INFO] ╚═══════════════════════════════════════╝
[INFO] Application:  http://localhost:3000
[INFO] Prometheus:   http://localhost:9090
[INFO] Grafana:      http://localhost:3001
```

### 3. Verifica Deployment

```bash
# Health check
curl http://localhost:3000/api/health

# Test API
curl http://localhost:3000/api/products
```

---

## Accesso ai Servizi

### Applicazione
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Metriche**: http://localhost:3000/metrics

### Prometheus
- **URL**: http://localhost:9090
- **Targets**: http://localhost:9090/targets

### Grafana
- **URL**: http://localhost:3001
- **Username**: admin
- **Password**: admin

---

## API Endpoints

### Products
```bash
# Lista tutti i prodotti
GET /api/products

# Prodotto singolo
GET /api/products/:id

# Categorie
GET /api/products/categories
```

### Cart
```bash
# Aggiungi al carrello
POST /api/cart/:userId/add
Body: {"productId": 1, "quantity": 2}

# Visualizza carrello
GET /api/cart/:userId

# Svuota carrello
DELETE /api/cart/:userId/clear
```

### Orders
```bash
# Crea ordine
POST /api/orders/:userId

# Lista ordini utente
GET /api/orders/:userId

# Dettaglio ordine
GET /api/orders/:userId/:orderId
```

### System
```bash
# Health check
GET /api/health

# Metriche Prometheus
GET /metrics
```

---

## Esempi di Utilizzo

### Workflow Completo

```bash
# 1. Ottenere lista prodotti
curl http://localhost:3000/api/products

# 2. Aggiungere prodotto al carrello
curl -X POST http://localhost:3000/api/cart/user123/add \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'

# 3. Visualizzare carrello
curl http://localhost:3000/api/cart/user123

# 4. Creare ordine
curl -X POST http://localhost:3000/api/orders/user123

# 5. Visualizzare ordine creato
curl http://localhost:3000/api/orders/user123
```

---

## Multi-Environment

### Deploy Staging

```bash
bash scripts/deploy.sh staging
```

### Deploy Production

```bash
bash scripts/deploy.sh prod v1.0.0
```

### Rollback

```bash
bash scripts/rollback.sh prod v0.9.0
```

---

## Monitoring

### Metriche Disponibili

Il progetto implementa il **RED method**:

- **Rate**: Numero richieste al secondo
- **Errors**: Percentuale errori
- **Duration**: Latenza richieste (p50, p95, p99)

### Query Prometheus

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
sum(rate(http_request_errors_total[5m])) / sum(rate(http_requests_total[5m]))

# Latency p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Dashboard Grafana

1. Accedi a http://localhost:3001 (admin/admin)
2. Configuration → Data Sources → Add Prometheus
3. URL: `http://prometheus:9090`
4. Save & Test
5. Create Dashboard con le query sopra

---

## Testing

### Eseguire Test Suite

```bash
cd app
npm install
npm test
```

**Risultati Attesi:**
```
Test Suites: 4 passed, 4 total
Tests:       23 passed, 23 total
Coverage:    97.36% statements
```

---

## Pipeline CI/CD

### GitHub Actions

La pipeline si attiva automaticamente su:
- Push su branch `main` o `develop`
- Pull request verso `main` o `develop`

### Job Pipeline

1. **Test** - Esegue test suite Jest
2. **Build** - Crea immagine Docker
3. **Push** - Pubblica su GitHub Container Registry
4. **Deploy Staging** - Deploy automatico (solo main)
5. **Deploy Production** - Deploy con approval manuale

### Visualizzare Pipeline

https://github.com/Francescodib/zenithstore-devops/actions

---

## Gestione Container

### Comandi Utili

```bash
# Visualizzare container attivi
docker ps

# Visualizzare logs
docker-compose -f docker-compose.dev.yml logs -f app

# Fermare tutti i servizi
docker-compose -f docker-compose.dev.yml down

# Riavviare
docker-compose -f docker-compose.dev.yml restart app

# Rebuild forzato
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## Troubleshooting

### Porta già in uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Container non si avvia

```bash
# Visualizzare logs dettagliati
docker logs zenithstore-app-dev

# Controllare health status
docker inspect zenithstore-app-dev | grep Health
```

### Ricostruire tutto

```bash
# Fermare e rimuovere tutto
docker-compose -f docker-compose.dev.yml down -v

# Ricostruire da zero
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## Struttura Progetto

```
zenithstore-devops/
├── app/                    # Applicazione Node.js
│   ├── src/
│   │   ├── controllers/    # Business logic (products, cart, orders)
│   │   ├── routes/         # API routing
│   │   ├── middleware/     # Metrics middleware
│   │   └── services/       # Mock data service
│   ├── tests/              # Test suite Jest
│   ├── Dockerfile          # Multi-stage build
│   └── package.json        # Dependencies
│
├── .github/workflows/      # Pipeline CI/CD
├── monitoring/             # Prometheus & Grafana config
├── environments/           # Config multi-environment
├── scripts/                # Deploy & rollback scripts
├── docs/                   # Documentazione tecnica
└── docker-compose*.yml     # Orchestrazione container
```

---

## Documentazione Completa

### Guide Tecniche
- **[OPERATIONS.md](docs/OPERATIONS.md)** - Guida operativa dettagliata
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architettura e decisioni tecniche
- **[VALIDATION_REPORT.md](VALIDATION_REPORT.md)** - Report di validazione completo

### Repository
🔗 **https://github.com/Francescodib/zenithstore-devops**

---

## Metriche di Qualità

### Test Coverage
```
Statements   : 97.36%
Branches     : 91.89%
Functions    : 92.85%
Lines        : 97.90%
```

### Performance
```
Docker Image : 49.2 MB
Build Time   : ~18s
Startup Time : ~5s
API Latency  : <50ms p95
```

### Sicurezza
- ✅ Non-root Docker user
- ✅ Helmet.js security headers
- ✅ CORS configurato
- ✅ 0 vulnerabilità npm audit

---

## Conformità Requisiti

| Requisito | Status | Implementazione |
|-----------|--------|-----------------|
| Pipeline CI/CD | ✅ | GitHub Actions |
| Deploy automatizzato | ✅ | Script bash + GH Actions |
| Monitoring | ✅ | Prometheus + Grafana |
| Multi-environment | ✅ | dev/staging/prod |
| Health checks | ✅ | Endpoint + Docker |
| Rollback | ✅ | Script automatizzato |
| Documentazione | ✅ | 2690+ righe |
| Test coverage | ✅ | 97.36% |

---

## Comandi Rapidi Riferimento

```bash
# Deploy
bash scripts/deploy.sh dev

# Test
cd app && npm test

# Logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop
docker-compose -f docker-compose.dev.yml down

# Health
curl localhost:3000/api/health

# Metrics
curl localhost:3000/metrics
```

---

## Contatti e Supporto

- **Repository**: https://github.com/Francescodib/zenithstore-devops
- **Issues**: https://github.com/Francescodib/zenithstore-devops/issues
- **Studente**: Francesco di Biase

---

## Licenza

MIT License - Progetto didattico per corso DevOps

---

**Progetto completato e validato** ✅
