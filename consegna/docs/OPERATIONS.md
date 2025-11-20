# Guida Operativa ZenithStore

Questa guida descrive tutte le procedure operative per la gestione del sistema ZenithStore.

## Indice

1. [Deploy](#deploy)
2. [Monitoring](#monitoring)
3. [Troubleshooting](#troubleshooting)
4. [Procedure di Emergenza](#procedure-di-emergenza)
5. [Manutenzione](#manutenzione)

---

## Deploy

### Deploy Standard

Il deploy standard segue questa procedura:

```bash
# 1. Verificare lo stato del repository
git status
git pull origin main

# 2. Eseguire i test
bash scripts/test.sh

# 3. Deploy all'ambiente desiderato
bash scripts/deploy.sh <environment> [version]
```

**Parametri:**
- `environment`: `dev`, `staging`, o `prod`
- `version`: (opzionale) tag versione es. `v1.2.3`

### Deploy per Ambiente

#### Development

```bash
bash scripts/deploy.sh dev
```

**Caratteristiche:**
- Hot reload abilitato
- Volumi montati per development
- Log verbose
- No resource limits

#### Staging

```bash
bash scripts/deploy.sh staging v1.2.3
```

**Caratteristiche:**
- Simula ambiente production
- Metriche complete
- Retention 7 giorni
- Password dedicata Grafana

#### Production

```bash
bash scripts/deploy.sh prod v1.2.3
```

**Caratteristiche:**
- Resource limits attivi
- Retention Prometheus 30 giorni
- Auto-restart always
- Password sicura Grafana (da configurare)

### Verifica Post-Deploy

Dopo ogni deploy eseguire:

```bash
# 1. Verificare health check
curl http://localhost:3000/api/health

# 2. Testare endpoint critici
curl http://localhost:3000/api/products
curl http://localhost:3000/api/products/1

# 3. Controllare metriche
curl http://localhost:3000/metrics | grep http_requests_total

# 4. Verificare logs
docker-compose -f docker-compose.<env>.yml logs --tail=50 app

# 5. Controllare Prometheus targets
# Andare su http://localhost:9090/targets
# Verificare che "zenithstore-app" sia UP
```

---

## Monitoring

### Dashboard Grafana

**Accesso:**
```
URL: http://localhost:3001
Username: admin
Password:
  - dev: admin
  - staging: staging123
  - prod: vedere .env.prod
```

### Metriche Chiave da Monitorare

#### 1. Rate (Richieste al secondo)

Query Prometheus:
```promql
rate(http_requests_total[5m])
```

**Soglie normali:**
- Dev: < 10 req/s
- Staging: < 50 req/s
- Prod: < 1000 req/s

#### 2. Errors (Tasso di errore)

Query Prometheus:
```promql
sum(rate(http_request_errors_total[5m])) / sum(rate(http_requests_total[5m])) * 100
```

**Soglie di allerta:**
- Warning: > 1%
- Critical: > 5%

#### 3. Duration (Latenza)

Query Prometheus (p95):
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Soglie accettabili:**
- p50: < 50ms
- p95: < 200ms
- p99: < 500ms

### Alert da Configurare

#### High Error Rate
```yaml
alert: HighErrorRate
expr: (sum(rate(http_request_errors_total[5m])) / sum(rate(http_requests_total[5m]))) > 0.05
for: 5m
annotations:
  summary: "Error rate above 5%"
```

#### High Latency
```yaml
alert: HighLatency
expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
for: 5m
annotations:
  summary: "95th percentile latency above 500ms"
```

#### Service Down
```yaml
alert: ServiceDown
expr: up{job="zenithstore-app"} == 0
for: 1m
annotations:
  summary: "ZenithStore service is down"
```

### Log Management

```bash
# Seguire logs in real-time
docker-compose -f docker-compose.prod.yml logs -f app

# Filtrare per errori
docker-compose -f docker-compose.prod.yml logs app | grep ERROR

# Ultimi 100 log
docker-compose -f docker-compose.prod.yml logs --tail=100 app

# Logs da timestamp specifico
docker-compose -f docker-compose.prod.yml logs --since="2024-01-20T10:00:00" app
```

---

## Troubleshooting

### Problema: Applicazione non risponde

**Diagnosi:**
```bash
# 1. Verificare container attivo
docker ps | grep zenithstore-app

# 2. Controllare logs
docker logs zenithstore-app-prod --tail=100

# 3. Verificare health
curl http://localhost:3000/api/health
```

**Soluzione:**
```bash
# Restart container
docker-compose -f docker-compose.prod.yml restart app

# Se persiste, rollback
bash scripts/rollback.sh prod v1.2.2
```

### Problema: High CPU/Memory Usage

**Diagnosi:**
```bash
# Statistiche container
docker stats zenithstore-app-prod

# Metriche Node.js
curl http://localhost:3000/metrics | grep nodejs
```

**Soluzione:**
```bash
# 1. Verificare memory leaks nei logs
# 2. Controllare numero connessioni attive
# 3. Se necessario, restart:
docker-compose -f docker-compose.prod.yml restart app
```

### Problema: Metriche non visibili in Prometheus

**Diagnosi:**
```bash
# Verificare endpoint metrics
curl http://localhost:3000/metrics

# Controllare targets Prometheus
# http://localhost:9090/targets
```

**Soluzione:**
```bash
# Verificare configurazione prometheus.yml
cat monitoring/prometheus/prometheus.yml

# Restart Prometheus
docker-compose -f docker-compose.prod.yml restart prometheus
```

### Problema: Test falliscono in CI/CD

**Diagnosi:**
1. Controllare logs GitHub Actions
2. Verificare dipendenze nel package.json
3. Testare localmente

**Soluzione:**
```bash
# Pulire e reinstallare dipendenze
cd app
rm -rf node_modules package-lock.json
npm install
npm test

# Verificare versione Node.js
node --version  # Deve essere 18+
```

---

## Procedure di Emergenza

### Rollback Immediato

In caso di deploy problematico:

```bash
# 1. STOP - Non procedere con ulteriori deploy
# 2. Identificare ultima versione stabile
docker images | grep zenithstore

# 3. Eseguire rollback
bash scripts/rollback.sh prod v1.2.2

# 4. Verificare ripristino servizio
curl http://localhost:3000/api/health

# 5. Comunicare al team
```

### Downtime Completo

In caso di downtime totale:

```bash
# 1. Verificare stato container
docker ps -a | grep zenithstore

# 2. Controllare logs
docker logs zenithstore-app-prod --tail=200

# 3. Tentare restart
docker-compose -f docker-compose.prod.yml restart

# 4. Se fallisce, rebuild completo
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Monitorare recovery
watch -n 2 curl http://localhost:3000/api/health
```

### Data Loss Prevention

**Backup Metriche:**
```bash
# Backup volume Prometheus
docker run --rm \
  -v zenithstore_prometheus-data:/source \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/prometheus-$(date +%Y%m%d).tar.gz /source

# Backup volume Grafana
docker run --rm \
  -v zenithstore_grafana-data:/source \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/grafana-$(date +%Y%m%d).tar.gz /source
```

**Restore:**
```bash
# Restore Prometheus
docker run --rm \
  -v zenithstore_prometheus-data:/target \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/prometheus-20240120.tar.gz -C /target
```

---

## Manutenzione

### Pulizia Periodica

```bash
# Rimuovere immagini Docker vecchie
docker image prune -a --filter "until=720h"

# Rimuovere volumi non utilizzati
docker volume prune -f

# Pulizia completa sistema Docker
docker system prune -a --volumes
```

### Update Dipendenze

```bash
# Controllare dipendenze outdated
cd app
npm outdated

# Update minor/patch
npm update

# Update major (con cautela)
npm install package@latest

# Eseguire test dopo update
npm test
```

### Rotazione Log

I log Docker vanno configurati con rotazione automatica:

```json
// /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Aggiornamento Stack

**Node.js:**
```dockerfile
# Nel Dockerfile, aggiornare versione
FROM node:18-alpine  # -> node:20-alpine
```

**Prometheus/Grafana:**
```yaml
# In docker-compose, aggiornare tag
image: prom/prometheus:latest  # -> prom/prometheus:v2.xx
```

---

## Comandi Rapidi

```bash
# Deploy veloce dev
./scripts/deploy.sh dev

# Test rapidi
cd app && npm test

# Logs in tempo reale
docker-compose -f docker-compose.prod.yml logs -f app

# Restart rapido
docker-compose -f docker-compose.prod.yml restart app

# Health check
curl localhost:3000/api/health

# Metriche Prometheus
curl localhost:3000/metrics

# Stop tutto
docker-compose -f docker-compose.prod.yml down

# Rebuild completo
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Contatti Emergenza

**Escalation:**
1. DevOps Team Lead
2. Infrastructure Manager
3. CTO

**Canali:**
- Slack: #zenithstore-ops
- Email: ops@zenithstore.com
- Pager: +39 XXX XXXXXXX
