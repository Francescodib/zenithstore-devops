# ZenithStore DevOps Project

Deploy automatizzato di un e-commerce senza downtime con pipeline CI/CD completa.

## Panoramica

ZenithStore è un progetto didattico che implementa best practices DevOps per il deploy continuo di un'applicazione e-commerce. Include pipeline CI/CD, monitoring con Prometheus/Grafana, gestione multi-environment e automazione completa.

## Caratteristiche Principali

- **API REST Mock** - 6 endpoint per products, cart e orders
- **CI/CD Pipeline** - GitHub Actions per test, build e deploy automatico
- **Multi-Environment** - Configurazioni separate per dev, staging e production
- **Monitoring** - Metriche RED (Rate, Errors, Duration) con Prometheus
- **Dashboards** - Grafana per visualizzazione metriche real-time
- **Health Checks** - Endpoint `/health` con graceful shutdown
- **Docker** - Containerizzazione completa con Docker Compose
- **Testing** - Suite completa con Jest (unit + integration tests)

## Architettura

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   GitHub    │────▶│GitHub Actions│────▶│   Docker    │
│ Repository  │     │   Pipeline   │     │   Registry  │
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  Environments │
                    ├──────────────┤
                    │     Dev      │
                    │   Staging    │
                    │  Production  │
                    └──────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│     App      │   │  Prometheus  │   │   Grafana    │
│  (Node.js)   │───│  (Metrics)   │───│ (Dashboard)  │
└──────────────┘   └──────────────┘   └──────────────┘
```

## Quick Start

### Prerequisiti

- Docker & Docker Compose
- Node.js 18+ (per sviluppo locale)
- Git
- Account GitHub

### 1. Clone del Repository

```bash
git clone https://github.com/YOUR_USERNAME/zenithstore-devops.git
cd zenithstore-devops
```

### 2. Installazione Dipendenze (Locale)

```bash
cd app
npm install
```

### 3. Esecuzione Test

```bash
# Nella directory app/
npm test

# Oppure tramite script
cd ..
bash scripts/test.sh
```

### 4. Deploy Locale (Development)

```bash
# Deploy ambiente development
bash scripts/deploy.sh dev

# L'applicazione sarà disponibile su:
# - API: http://localhost:3000
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001
```

### 5. Deploy Altri Ambienti

```bash
# Staging
bash scripts/deploy.sh staging

# Production
bash scripts/deploy.sh prod
```

## Endpoint API

### Products
- `GET /api/products` - Lista prodotti (filtri: category, minPrice, maxPrice)
- `GET /api/products/:id` - Dettaglio prodotto
- `GET /api/products/categories` - Lista categorie

### Cart
- `POST /api/cart/:userId/add` - Aggiungi al carrello
- `GET /api/cart/:userId` - Visualizza carrello
- `DELETE /api/cart/:userId/clear` - Svuota carrello

### Orders
- `POST /api/orders/:userId` - Crea ordine dal carrello
- `GET /api/orders/:userId` - Lista ordini utente
- `GET /api/orders/:userId/:orderId` - Dettaglio ordine

### System
- `GET /api/health` - Health check
- `GET /metrics` - Metriche Prometheus

## Esempi di Utilizzo

```bash
# Ottenere tutti i prodotti
curl http://localhost:3000/api/products

# Filtrare per categoria
curl http://localhost:3000/api/products?category=Accessories

# Aggiungere al carrello
curl -X POST http://localhost:3000/api/cart/user123/add \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'

# Visualizzare carrello
curl http://localhost:3000/api/cart/user123

# Creare ordine
curl -X POST http://localhost:3000/api/orders/user123

# Health check
curl http://localhost:3000/api/health
```

## Pipeline CI/CD

La pipeline si attiva automaticamente su:
- Push su branch `main` o `develop`
- Pull request

### Fasi della Pipeline

1. **Test** - Esegue test suite completa
2. **Build** - Crea immagine Docker
3. **Push** - Pubblica su GitHub Container Registry
4. **Deploy Staging** - Deploy automatico su staging (solo main)
5. **Deploy Production** - Deploy manuale su production (richiede approval)

## Monitoring

### Metriche Disponibili

**RED Metrics:**
- `http_requests_total` - Totale richieste per endpoint
- `http_request_duration_seconds` - Latenza richieste (p50, p95, p99)
- `http_request_errors_total` - Totale errori HTTP

**System Metrics:**
- CPU usage
- Memory usage
- Process uptime
- Node.js internals

### Accesso Grafana

```
URL: http://localhost:3001
Username: admin
Password: admin (dev) / staging123 (staging) / configurabile (prod)
```

## Gestione Versioni

### Tagging e Rollback

```bash
# Deploy specifica versione
bash scripts/deploy.sh prod v1.2.3

# Rollback a versione precedente
bash scripts/rollback.sh prod v1.2.2
```

### Semantic Versioning

Il progetto usa semver: `vMAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: Nuove features
- **PATCH**: Bug fixes

## Struttura File

```
zenithstore-devops/
├── app/                    # Applicazione Node.js
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Metrics, logging
│   │   └── services/       # Mock data
│   ├── tests/              # Test suite
│   ├── Dockerfile
│   └── package.json
├── .github/workflows/      # CI/CD pipeline
├── monitoring/             # Prometheus & Grafana config
├── environments/           # Config per environment
├── scripts/                # Deploy & utility scripts
├── docs/                   # Documentazione dettagliata
└── docker-compose.*.yml    # Orchestrazione containers
```

## Comandi Utili

```bash
# Visualizzare logs
docker-compose -f docker-compose.dev.yml logs -f app

# Fermare tutti i container
docker-compose -f docker-compose.dev.yml down

# Rebuild forzato
docker-compose -f docker-compose.dev.yml up -d --build

# Visualizzare container attivi
docker ps

# Eseguire test in watch mode
cd app && npm run test:watch
```

## Troubleshooting

### Porta già in uso
```bash
# Trovare processo su porta 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Killare processo
kill -9 <PID>
```

### Container non parte
```bash
# Visualizzare logs dettagliati
docker-compose -f docker-compose.dev.yml logs app

# Controllare health status
docker inspect <container_id> | grep Health
```

### Test falliscono
```bash
# Pulire cache npm
cd app
rm -rf node_modules package-lock.json
npm install

# Eseguire test con output verbose
npm test -- --verbose
```

## Documentazione Dettagliata

Per informazioni approfondite consulta:

- [docs/OPERATIONS.md](docs/OPERATIONS.md) - Guida operativa completa
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Architettura e decisioni tecniche

## Tecnologie Utilizzate

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Testing**: Jest + Supertest
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Metrics**: prom-client (RED method)

## Licenza

MIT

## Autore

Francesco di Biase - Francescodibiase.com
