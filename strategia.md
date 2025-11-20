# Piano Strategico ZenithStore Online

## Architettura Target

**Stack minimo funzionale:**
- App: Node.js/Express con endpoint REST mock (prodotti, carrello, ordini)
- Containerizzazione: Docker + Docker Compose
- CI/CD: GitHub Actions
- Monitoring: Prometheus + Grafana
- Environments: dev, staging, prod (simulati localmente)

## Struttura Progetto

```
zenithstore-devops/
├── app/                    # Applicazione e-commerce mock
├── .github/workflows/      # Pipeline CI/CD
├── monitoring/             # Config Prometheus + Grafana
├── environments/           # Config per env (dev/staging/prod)
├── scripts/                # Script deploy e utility
├── docs/                   # Documentazione operativa
└── docker-compose.*.yml    # Orchestrazione per ogni env
```

## Metriche Prioritarie

**Core metrics (RED method):**
- **Rate**: requests/sec per endpoint
- **Errors**: error rate % (4xx, 5xx)
- **Duration**: response time (p50, p95, p99)

**System metrics:**
- CPU/Memory usage
- Uptime

## Strategia Operativa

### Fase 1: Setup Base (Giorni 1-2)
- Creare app Express con 5-6 endpoint REST mock
- Dockerfile + docker-compose base
- Testing: Jest con 10-15 unit test sui controller
- Branch: `main` + `develop`

### Fase 2: CI/CD Pipeline (Giorni 3-4)
- GitHub Actions workflow:
  1. Trigger su push/PR
  2. Build Docker image
  3. Run tests
  4. Push image a GitHub Container Registry (o DockerHub)
  5. Tag semver automatico
- Gestione secrets via GitHub Secrets

### Fase 3: Multi-Environment (Giorni 5-6)
- File env separati: `.env.dev`, `.env.staging`, `.env.prod`
- Script deploy: `./scripts/deploy.sh <env>`
- Docker Compose override per ogni env
- Versioning: git tags + image tags

### Fase 4: Monitoring (Giorni 7-8)
- Instrumentazione app con `prom-client`
- Prometheus config + targets
- Grafana dashboard con metriche RED
- Alerting rules base (opzionale)

### Fase 5: Documentazione (Giorni 9-10)
- `docs/OPERATIONS.md`: comandi, workflow, troubleshooting
- `docs/ARCHITECTURE.md`: diagrammi e decisioni
- `README.md` completo
- Procedure emergenza (rollback manuale via git tag)

## Pipeline CI/CD Detail

```yaml
# .github/workflows/ci-cd.yml
on: [push, pull_request]

jobs:
  test:
    - npm install
    - npm test
    - generate coverage report
  
  build:
    - docker build
    - run smoke test
  
  deploy-staging: # auto on main
    - deploy to staging env
    - health check
  
  deploy-prod: # manual approval
    - tag release
    - deploy to prod env
    - verify metrics
```

## Gestione Versioning

- **Semver**: `v1.2.3` (major.minor.patch)
- Git tags + Docker image tags allineati
- Rollback: `./scripts/deploy.sh prod v1.2.2`

## Best-Effort High Availability

- Health check endpoint: `/health`
- Graceful shutdown nell'app
- Deploy strategy: `docker-compose up -d` con recreate (non è zero-downtime ma accettabile per didattica)
- Note nella doc che in prod useremmo blue/green

## Deliverable per ZIP

```
zenithstore-devops.zip
├── Codice completo del progetto
├── docs/OPERATIONS.md (guida operativa)
├── docs/ARCHITECTURE.md
├── README.md (quickstart)
├── DEMO.md (screenshots/comandi per valutazione)
└── .env.example (template configurazioni)
```

## Timeline Consigliata

**10 giorni totali** (2-3h/giorno):
- Giorni 1-2: App + Docker
- Giorni 3-4: CI/CD
- Giorni 5-6: Multi-env
- Giorni 7-8: Monitoring
- Giorni 9-10: Docs + testing finale

## Domande Finali

1. I 10 giorni ti sembrano realistici con il tuo tempo disponibile?
2. Preferisci Node.js o Python per l'app mock?
3. GitHub Container Registry o DockerHub per le immagini?
4. Vuoi che aggiunga diagrammi all'architettura (Mermaid/PlantUML)?

Confermami e partiamo con la Fase 1 o fammi sapere se serve modificare qualcosa.