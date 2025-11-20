# Architettura ZenithStore DevOps

Questo documento descrive l'architettura tecnica del progetto ZenithStore e le decisioni di design.

## Indice

1. [Overview Architetturale](#overview-architetturale)
2. [Stack Tecnologico](#stack-tecnologico)
3. [Componenti Sistema](#componenti-sistema)
4. [Pipeline CI/CD](#pipeline-cicd)
5. [Monitoring & Observability](#monitoring--observability)
6. [Decisioni Tecniche](#decisioni-tecniche)

---

## Overview Architetturale

### Architettura ad Alto Livello

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer Workflow                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      GitHub Repository                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Source  │  │  Tests   │  │  Docker  │  │  CI/CD   │   │
│  │   Code   │  │  Suite   │  │  Config  │  │ Pipeline │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions (CI/CD)                    │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐           │
│  │  Test  │→ │ Build  │→ │  Push  │→ │ Deploy │           │
│  └────────┘  └────────┘  └────────┘  └────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Container Registry (ghcr.io)                    │
│         ┌──────────────────────────────┐                    │
│         │  Docker Images (Versioned)   │                    │
│         └──────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │   Dev    │  │ Staging  │  │   Prod   │
         └──────────┘  └──────────┘  └──────────┘
```

### Architettura Runtime

```
┌───────────────────────────────────────────────────────────┐
│                    Docker Network                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  ┌──────────────┐      ┌──────────────┐           │  │
│  │  │              │      │              │           │  │
│  │  │  Express App │─────▶│  Prometheus  │           │  │
│  │  │  (Node.js)   │      │   (Metrics)  │           │  │
│  │  │              │      │              │           │  │
│  │  │  Port: 3000  │      │  Port: 9090  │           │  │
│  │  │              │      │              │           │  │
│  │  └──────────────┘      └──────┬───────┘           │  │
│  │         │                      │                   │  │
│  │         │ /metrics             │                   │  │
│  │         │                      │                   │  │
│  │         ▼                      ▼                   │  │
│  │  ┌──────────────────────────────────┐             │  │
│  │  │          Grafana                 │             │  │
│  │  │       (Dashboards)               │             │  │
│  │  │        Port: 3001                │             │  │
│  │  └──────────────────────────────────┘             │  │
│  │                                                     │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## Stack Tecnologico

### Application Layer

**Node.js 18**
- Motivo: LTS con supporto lungo termine
- Vantaggi: Performance, ecosistema npm ricco
- Alternative considerate: Python (FastAPI), Go

**Express.js 4**
- Motivo: Framework maturo e minimalista
- Vantaggi: Flessibilità, middleware ecosystem
- Alternative considerate: Fastify, Koa

### Containerization

**Docker**
- Multi-stage builds per ottimizzare size
- Alpine Linux per immagini leggere (~50MB vs ~900MB)
- Non-root user per security

**Docker Compose**
- Orchestrazione locale multi-container
- File separati per environment
- Network isolation

### CI/CD

**GitHub Actions**
- Motivo: Integrazione nativa con GitHub
- Vantaggi: Free per repository pubblici, facile setup
- Alternative considerate: GitLab CI, Jenkins

### Monitoring

**Prometheus**
- Pull-based metrics collection
- PromQL per query potenti
- Time-series database efficiente

**Grafana**
- Visualizzazione metriche
- Alerting (opzionale)
- Dashboard as code

**prom-client**
- Libreria ufficiale Prometheus per Node.js
- Supporto metriche RED
- Performance overhead minimo

---

## Componenti Sistema

### 1. Applicazione Express

**Struttura:**
```
app/src/
├── server.js           # Entry point
├── app.js              # Express configuration
├── controllers/        # Business logic
├── routes/             # Route definitions
├── middleware/         # Metrics, logging
└── services/           # Data layer (mock)
```

**Endpoint Principali:**
- `/api/products` - Catalogo prodotti
- `/api/cart/:userId` - Gestione carrello
- `/api/orders/:userId` - Gestione ordini
- `/api/health` - Health check
- `/metrics` - Metriche Prometheus

**Features:**
- Graceful shutdown (SIGTERM/SIGINT)
- Health checks
- Error handling centralizzato
- Request logging con Morgan
- Security headers con Helmet

### 2. Testing Suite

**Framework: Jest + Supertest**

Coverage targets:
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

Test types:
- Unit tests: Controller logic
- Integration tests: API endpoints
- Health checks: System endpoints

### 3. Docker Configuration

**Dockerfile Ottimizzato:**
```dockerfile
# Multi-stage per ridurre size
FROM node:18-alpine AS builder
# ... build steps

FROM node:18-alpine
# ... runtime only
```

**Features:**
- Multi-stage build (-85% size)
- Non-root user (security)
- Health check integrato
- Layer caching ottimizzato

### 4. Prometheus

**Configurazione:**
- Scrape interval: 15s
- Retention: 30d (prod), 7d (staging)
- Targets: app:3000/metrics

**Metriche Collezionate:**
- http_requests_total (Counter)
- http_request_duration_seconds (Histogram)
- http_request_errors_total (Counter)
- process_* (Default Node.js metrics)
- nodejs_* (V8 internals)

### 5. Grafana

**Datasource:**
- Prometheus (http://prometheus:9090)

**Dashboard:**
- RED metrics visualization
- Request rate graphs
- Error rate percentage
- Latency percentiles (p50, p95, p99)
- System resources

---

## Pipeline CI/CD

### Workflow Completo

```yaml
Trigger: Push/PR
    │
    ▼
┌────────────┐
│    Test    │  npm ci && npm test
└─────┬──────┘
      │ ✓
      ▼
┌────────────┐
│   Build    │  docker build
└─────┬──────┘
      │ ✓
      ▼
┌────────────┐
│ Smoke Test │  Health check su container
└─────┬──────┘
      │ ✓
      ▼
┌────────────┐
│    Push    │  ghcr.io push (only main/develop)
└─────┬──────┘
      │ ✓
      ▼
┌────────────┐
│  Staging   │  Auto deploy (only main)
└─────┬──────┘
      │ ✓
      ▼
┌────────────┐
│ Production │  Manual approval required
└────────────┘
```

### Jobs Dettagliati

**1. Test Job**
- Setup Node.js 18
- npm ci (clean install)
- npm test
- Upload coverage

**2. Build Job**
- Docker Buildx setup
- Build immagine
- Cache optimization (GHA cache)
- Smoke test (health endpoint)

**3. Push Job**
- Login ghcr.io
- Metadata extraction
- Tag semver
- Push registry

**4. Deploy Staging**
- Checkout code
- Simulate deploy
- Health check
- Metrics verification

**5. Deploy Production**
- Manual approval gate
- Create release tag
- Production deploy
- Post-deploy monitoring
- Team notification

---

## Monitoring & Observability

### RED Method

**Rate:**
```promql
sum(rate(http_requests_total[5m])) by (route)
```

**Errors:**
```promql
sum(rate(http_request_errors_total[5m])) / sum(rate(http_requests_total[5m]))
```

**Duration:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Logs

**Formato:**
- Morgan (combined format)
- JSON structured logs (producibile)

**Retention:**
- Docker log rotation: 10MB × 3 files
- Centralized logging: Non implementato (futuro: ELK/Loki)

### Tracing

Non implementato nella versione corrente.

**Future:** OpenTelemetry integration

---

## Decisioni Tecniche

### 1. Perché Node.js invece di Python/Go?

**Pro Node.js:**
- Familiarità team
- Ecosystem npm ricco
- Async I/O nativo (buono per API)
- JSON handling ottimale

**Contro:**
- Single-threaded (limitato per CPU-intensive)
- Memory usage più alto di Go

**Decisione:** Node.js per prototipo rapido e skill team

### 2. Perché Docker Compose invece di Kubernetes?

**Pro Docker Compose:**
- Setup semplice
- Overhead minimo
- Ideale per sviluppo locale
- Sufficient per didattica

**Contro:**
- No orchestration avanzata
- No auto-scaling
- No multi-host

**Decisione:** Docker Compose per scope progetto didattico
**Future:** Migrazione K8s per production-grade

### 3. Perché GitHub Actions invece di Jenkins?

**Pro GitHub Actions:**
- Zero setup infrastructure
- Integrazione nativa GitHub
- Free tier generoso
- YAML configuration

**Contro:**
- Lock-in GitHub
- Limitazioni customization

**Decisione:** GitHub Actions per time-to-market

### 4. Deployment Strategy

**Attuale:** Recreate
- Docker Compose down + up
- Downtime: ~5-10 secondi

**Limitazioni:**
- Non zero-downtime
- Non adatto production

**Alternative Future:**
- Blue/Green deployment
- Rolling updates (Kubernetes)
- Canary releases

### 5. Data Persistence

**Attuale:** In-memory (Map/Array)

**Motivo:**
- Progetto didattico
- Focus su DevOps, non data

**Production:**
- PostgreSQL/MongoDB
- Redis per cache
- Persistent volumes

### 6. Security Considerations

**Implementato:**
- Helmet.js (security headers)
- Non-root Docker user
- CORS configuration
- Secrets via environment

**TODO Production:**
- TLS/HTTPS
- Rate limiting
- API authentication
- Secrets management (Vault)

### 7. Scalability

**Limitazioni Attuali:**
- Single instance
- In-memory state
- No load balancing

**Scale Strategy:**
- Horizontal: Multiple instances + LB
- Vertical: Resource limits increase
- Database: Separate tier
- Cache: Redis cluster

---

## Metriche Performance

### Benchmark Applicazione

**Hardware di riferimento:**
- CPU: 2 cores
- RAM: 512MB
- Disco: SSD

**Performance:**
- RPS sostenibili: ~1000
- Latenza media: <20ms
- p95 latency: <50ms
- Cold start: ~2s
- Container size: ~55MB

### Resource Usage

**Idle:**
- CPU: <1%
- Memory: ~50MB

**Under Load (100 RPS):**
- CPU: ~15%
- Memory: ~80MB

---

## Diagrammi

### Sequence Diagram: Deploy Flow

```
Developer → GitHub: git push
GitHub → Actions: Trigger workflow
Actions → Actions: Run tests
Actions → Actions: Build Docker
Actions → Registry: Push image
Actions → Staging: Deploy
Staging → Staging: Health check
Actions → Human: Request approval
Human → Actions: Approve
Actions → Production: Deploy
Production → Monitoring: Report metrics
```

### Component Diagram

```
┌─────────────────────────────────────┐
│          Load Balancer (future)      │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│   App 1     │  │   App 2     │
│  (Node.js)  │  │  (Node.js)  │
└──────┬──────┘  └──────┬───────┘
       │                │
       └────────┬───────┘
                ▼
       ┌─────────────────┐
       │   Database      │
       │  (PostgreSQL)   │
       └─────────────────┘
```

---

## Riferimenti

- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Express.js Production](https://expressjs.com/en/advanced/best-practice-performance.html)
- [RED Method](https://www.weave.works/blog/the-red-method-key-metrics-for-microservices-architecture/)
