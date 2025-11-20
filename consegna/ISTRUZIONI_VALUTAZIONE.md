# Istruzioni per la Valutazione

**Progetto**: ZenithStore DevOps CI/CD
**Studente**: Francesco di Biase
**Repository**: https://github.com/Francescodib/zenithstore-devops

---

## Contenuto Consegna

Questa cartella contiene tutto il necessario per valutare il progetto:

```
consegna/
├── app/                          # Applicazione completa
├── .github/workflows/            # Pipeline CI/CD
├── monitoring/                   # Config Prometheus/Grafana
├── environments/                 # Configurazioni ambienti
├── scripts/                      # Script deploy/rollback
├── docs/                         # Documentazione tecnica
├── docker-compose*.yml           # Orchestrazione Docker
├── README.md                     # Guida principale
├── ISTRUZIONI_VALUTAZIONE.md     # Questo file
└── VALIDATION_REPORT.md          # Report di validazione
```

---

## Valutazione Rapida (5 minuti)

### 1. Verifica Repository GitHub

**Link**: https://github.com/Francescodib/zenithstore-devops

✅ Verificare:
- Repository pubblico esistente
- Codice sorgente completo
- GitHub Actions attiva
- Documentazione presente

### 2. Verifica Pipeline CI/CD

**Link**: https://github.com/Francescodib/zenithstore-devops/actions

✅ Verificare:
- Workflow "CI/CD Pipeline" presente
- Almeno un run completato con successo
- Job: Test → Build → Push visibili

### 3. Verifica Documentazione

✅ Controllare presenza di:
- README.md (guida principale)
- VALIDATION_REPORT.md (report tecnico)
- docs/OPERATIONS.md (procedure operative)
- docs/ARCHITECTURE.md (architettura)

---

## Valutazione Completa (30 minuti)

### Fase 1: Setup Ambiente (5 min)

**Prerequisiti**:
```bash
docker --version          # >= 20.10
docker-compose --version  # >= 2.0
```

**Clone Repository**:
```bash
git clone https://github.com/Francescodib/zenithstore-devops.git
cd zenithstore-devops
```

### Fase 2: Test Suite (5 min)

```bash
cd app
npm install
npm test
```

**Risultato Atteso**:
```
✅ Test Suites: 4 passed, 4 total
✅ Tests: 23 passed, 23 total
✅ Coverage: 97.36% statements
```

**Tempo**: ~30 secondi per test

### Fase 3: Build Docker (3 min)

```bash
cd ..
docker build -t zenithstore:eval ./app
```

**Risultato Atteso**:
```
✅ Build completato senza errori
✅ Image size: ~50MB
```

**Tempo**: ~15-20 secondi

### Fase 4: Deploy Completo (5 min)

```bash
# Deploy ambiente development
bash scripts/deploy.sh dev

# Oppure manualmente:
docker-compose -f docker-compose.dev.yml up -d
```

**Risultato Atteso**:
```
✅ 3 container avviati:
   - zenithstore-app-dev
   - zenithstore-prometheus-dev
   - zenithstore-grafana-dev
```

**Verifica Container**:
```bash
docker ps
```

### Fase 5: Test API (5 min)

```bash
# Health check
curl http://localhost:3000/api/health

# Lista prodotti
curl http://localhost:3000/api/products

# Singolo prodotto
curl http://localhost:3000/api/products/1

# Aggiungi al carrello
curl -X POST http://localhost:3000/api/cart/eval-user/add \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'

# Visualizza carrello
curl http://localhost:3000/api/cart/eval-user

# Crea ordine
curl -X POST http://localhost:3000/api/orders/eval-user

# Metriche
curl http://localhost:3000/metrics | head -n 20
```

**Tutti gli endpoint devono rispondere con status 200/201**.

### Fase 6: Verifica Monitoring (5 min)

**Prometheus**:
1. Aprire browser: http://localhost:9090
2. Status → Targets
3. Verificare target "zenithstore-app" = UP
4. Eseguire query: `up`

**Grafana**:
1. Aprire browser: http://localhost:3001
2. Login: admin/admin
3. Configuration → Data Sources
4. Verificare Prometheus configurabile

**Metriche**:
```bash
curl http://localhost:3000/metrics | grep http_requests_total
```

Deve mostrare contatori delle richieste.

### Fase 7: Cleanup (2 min)

```bash
docker-compose -f docker-compose.dev.yml down
```

---

## Checklist Valutazione

### Requisiti Funzionali

- [ ] **Pipeline CI/CD**
  - [ ] GitHub Actions configurata
  - [ ] Workflow eseguito con successo
  - [ ] Job Test, Build, Push presenti

- [ ] **Applicazione**
  - [ ] 6 endpoint REST funzionanti
  - [ ] Health check presente
  - [ ] Metriche Prometheus esposte

- [ ] **Testing**
  - [ ] Test suite eseguibile
  - [ ] 23 test passing
  - [ ] Coverage > 80%

- [ ] **Containerizzazione**
  - [ ] Dockerfile ottimizzato (multi-stage)
  - [ ] Image size < 100MB
  - [ ] Docker Compose funzionante

- [ ] **Multi-Environment**
  - [ ] 3 configurazioni (dev/staging/prod)
  - [ ] File .env separati
  - [ ] Docker compose per ogni ambiente

- [ ] **Monitoring**
  - [ ] Prometheus configurato
  - [ ] Metriche RED implementate
  - [ ] Grafana accessibile

- [ ] **Automazione**
  - [ ] Script deploy.sh funzionante
  - [ ] Script rollback.sh presente
  - [ ] Health check automatico

### Qualità Codice

- [ ] Test coverage > 80% (97.36% raggiunto)
- [ ] 0 vulnerabilità npm audit
- [ ] Codice ben strutturato (controller/routes/services)
- [ ] Error handling presente

### Documentazione

- [ ] README completo
- [ ] OPERATIONS.md dettagliato
- [ ] ARCHITECTURE.md presente
- [ ] VALIDATION_REPORT.md completo

---

## Criteri di Valutazione

| Categoria | Peso | Punti |
|-----------|------|-------|
| Pipeline CI/CD | 20% | /20 |
| Containerizzazione | 15% | /15 |
| Testing | 15% | /15 |
| Monitoring | 15% | /15 |
| Multi-Environment | 10% | /10 |
| Automazione | 10% | /10 |
| Documentazione | 10% | /10 |
| Qualità Codice | 5% | /5 |
| **TOTALE** | **100%** | **/100** |

---

## Evidenze Fornite

### 1. Repository GitHub
- URL: https://github.com/Francescodib/zenithstore-devops
- Visibilità: Pubblico
- Commit: 4 commit strutturati
- GitHub Actions: Pipeline attiva

### 2. Test Coverage
```
File             | % Stmts | % Branch | % Funcs | % Lines
-----------------|---------|----------|---------|----------
All files        |  97.36  |   91.89  |  92.85  |  97.90
```

### 3. Docker Image
```
Image: zenithstore:test
Size: 49.2 MB (content)
Build: Multi-stage
Base: node:18-alpine
```

### 4. Metriche
- Request Rate: Tracked ✅
- Error Rate: Tracked ✅
- Latency: Tracked (p50, p95, p99) ✅

### 5. Documentazione
- README: 290 righe
- OPERATIONS: 450 righe
- ARCHITECTURE: 520 righe
- VALIDATION_REPORT: 521 righe
- **Totale**: 2690+ righe

---

## Problemi Comuni e Soluzioni

### "Port already in use"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### "Docker not running"

Avviare Docker Desktop e attendere che sia completamente started.

### "npm install fails"

```bash
cd app
rm -rf node_modules package-lock.json
npm install
```

### "Container unhealthy"

```bash
docker logs zenithstore-app-dev
docker inspect zenithstore-app-dev | grep Health
```

---

## Tempi di Esecuzione

| Operazione | Tempo Stimato |
|------------|---------------|
| npm install | ~15s |
| npm test | ~2s |
| docker build | ~20s |
| docker-compose up | ~30s |
| health check | ~5s |
| **TOTALE SETUP** | **~1-2 minuti** |

---

## Contatti

Per domande o chiarimenti:
- **Repository**: https://github.com/Francescodib/zenithstore-devops
- **Issues**: https://github.com/Francescodib/zenithstore-devops/issues
- **Email**: fran.dibiase@gmail.com

---

## Conclusione

Il progetto è completo, testato e pronto per la valutazione. Tutti i requisiti della traccia sono stati implementati e validati.

**Status**: ✅ PRONTO PER VALUTAZIONE

**Data Consegna**: Novembre 2025
**Studente**: Francesco di Biase
