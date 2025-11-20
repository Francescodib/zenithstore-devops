# ZenithStore - Quick Start Guide

Guida rapida per iniziare subito con il progetto.

## 🚀 Setup in 5 Minuti

### 1. Verifica Prerequisiti

```bash
# Verifica Docker
docker --version
# Richiesto: >= 20.10

# Verifica Docker Compose
docker-compose --version
# Richiesto: >= 2.0

# Verifica Node.js (opzionale, per test locali)
node --version
# Richiesto: >= 18.0
```

### 2. Clone Repository (se non fatto)

```bash
# Se stai leggendo questo file, probabilmente hai già il codice!
pwd
# Dovresti essere in: .../8-devops
```

### 3. Setup GitHub (Prima Volta)

```bash
# Seguire le istruzioni complete in SETUP_GITHUB.md
# Riassunto veloce:

# 1. Creare repo su GitHub.com
# 2. Aggiungere remote
git remote add origin https://github.com/TUO_USERNAME/zenithstore-devops.git

# 3. Push codice
git push -u origin main
```

**Dettagli completi:** Vedi [SETUP_GITHUB.md](SETUP_GITHUB.md)

### 4. Test Locale

```bash
# Testare l'applicazione
cd app
npm install
npm test

# Dovresti vedere:
# ✅ Test Suites: 4 passed
# ✅ Tests: 20 passed
# ✅ Coverage: > 80%
```

### 5. Deploy Locale

```bash
# Tornare alla root
cd ..

# Deploy ambiente development
bash scripts/deploy.sh dev

# Attendi il messaggio:
# [INFO] ✓ Application is healthy!
# [INFO] Application: http://localhost:3000
```

### 6. Test API

```bash
# In un nuovo terminale

# Health check
curl http://localhost:3000/api/health

# Lista prodotti
curl http://localhost:3000/api/products

# Singolo prodotto
curl http://localhost:3000/api/products/1
```

### 7. Monitoring

Aprire browser:
- **Applicazione**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

---

## 🎯 Workflow Giornaliero

### Sviluppo Feature

```bash
# 1. Creare branch
git checkout -b feature/nuova-funzionalita

# 2. Sviluppare e testare
cd app
npm test

# 3. Commit
git add .
git commit -m "feat: descrizione feature"

# 4. Push
git push origin feature/nuova-funzionalita

# 5. Creare Pull Request su GitHub
```

### Deploy Staging

```bash
# 1. Merge su main (via PR)

# 2. Pull ultima versione
git checkout main
git pull origin main

# 3. Deploy staging
bash scripts/deploy.sh staging

# 4. Verificare
curl http://localhost:3000/api/health
```

### Deploy Production

```bash
# 1. Creare tag versione
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# 2. Deploy production
bash scripts/deploy.sh prod v1.0.0

# 3. Monitorare metriche
# Aprire Grafana e controllare dashboard
```

### Rollback (Emergenza)

```bash
# Rollback a versione precedente
bash scripts/rollback.sh prod v0.9.0

# Verificare
curl http://localhost:3000/api/health
```

---

## 📁 File Importanti

### Leggere Prima di Iniziare

1. **[README.md](README.md)** - Overview progetto completo
2. **[SETUP_GITHUB.md](SETUP_GITHUB.md)** - Setup repository GitHub
3. **[DEMO.md](DEMO.md)** - Guida demo per valutazione

### Documentazione Operativa

4. **[docs/OPERATIONS.md](docs/OPERATIONS.md)** - Procedure operative
5. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architettura tecnica

### Configurazioni

6. **[.env.example](.env.example)** - Template variabili ambiente
7. **[docker-compose.yml](docker-compose.yml)** - Orchestrazione base
8. **[.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)** - Pipeline CI/CD

---

## 🛠️ Comandi Essenziali

### Sviluppo

```bash
# Test applicazione
cd app && npm test

# Test in watch mode
cd app && npm run test:watch

# Avviare development server (locale, senza Docker)
cd app && npm run dev
```

### Docker

```bash
# Deploy ambiente
bash scripts/deploy.sh <env>

# Vedere logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop ambiente
docker-compose -f docker-compose.dev.yml down

# Rebuild forzato
docker-compose -f docker-compose.dev.yml up -d --build
```

### Git

```bash
# Status
git status

# Commit
git add .
git commit -m "message"

# Push
git push

# Pull
git pull origin main

# Creare tag
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

---

## 🔍 Debugging

### Applicazione non parte

```bash
# Controllare logs
docker logs zenithstore-app-dev

# Verificare porta libera
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Linux/Mac

# Rebuild completo
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build
```

### Test falliscono

```bash
cd app
rm -rf node_modules package-lock.json
npm install
npm test
```

### Metriche non visibili

```bash
# Verificare endpoint
curl http://localhost:3000/metrics

# Verificare Prometheus targets
# Aprire: http://localhost:9090/targets
# Stato deve essere "UP"

# Restart Prometheus
docker-compose -f docker-compose.dev.yml restart prometheus
```

---

## 📊 Metriche da Monitorare

### In Grafana (http://localhost:3001)

**Query Prometheus utili:**

```promql
# Request rate
sum(rate(http_requests_total[5m])) by (route)

# Error rate
sum(rate(http_request_errors_total[5m])) / sum(rate(http_requests_total[5m])) * 100

# Latency p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Uptime
up{job="zenithstore-app"}
```

---

## 📝 Checklist Pre-Consegna

Prima di consegnare il progetto, verificare:

### Funzionalità
- [ ] Test passano tutti (npm test)
- [ ] Docker build funziona
- [ ] Deploy dev/staging/prod funzionano
- [ ] API endpoints rispondono
- [ ] Health check funziona
- [ ] Metriche Prometheus visibili
- [ ] Grafana accessibile

### GitHub
- [ ] Repository pubblico/privato creato
- [ ] Codice pushato
- [ ] GitHub Actions funziona
- [ ] Pipeline CI/CD completa
- [ ] README completo

### Documentazione
- [ ] README.md compilato
- [ ] OPERATIONS.md presente
- [ ] ARCHITECTURE.md presente
- [ ] DEMO.md con esempi
- [ ] File .env.example presente

### Extra
- [ ] Script deploy.sh funzionante
- [ ] Script rollback.sh funzionante
- [ ] Docker-compose per 3 ambienti
- [ ] Coverage test > 80%

---

## 🎓 Risorse Aggiuntive

### Documentazione Tecnologie

- [Express.js](https://expressjs.com/)
- [Docker](https://docs.docker.com/)
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)
- [GitHub Actions](https://docs.github.com/en/actions)

### Tutorial Utili

- [Docker Compose Tutorial](https://docs.docker.com/compose/gettingstarted/)
- [Prometheus Node.js Tutorial](https://prometheus.io/docs/guides/node-exporter/)
- [GitHub Actions CI/CD](https://docs.github.com/en/actions/automating-builds-and-tests)

---

## 💡 Tips & Tricks

### Sviluppo Veloce

```bash
# Alias utili (aggiungi a .bashrc o .zshrc)
alias zs-test="cd app && npm test"
alias zs-deploy-dev="bash scripts/deploy.sh dev"
alias zs-logs="docker-compose -f docker-compose.dev.yml logs -f app"
alias zs-down="docker-compose -f docker-compose.dev.yml down"
```

### Pulizia Periodica

```bash
# Rimuovere container, volumi e immagini non usate
docker system prune -a --volumes

# Attenzione: rimuove TUTTO, anche da altri progetti!
```

### Performance

```bash
# Vedere statistiche container
docker stats

# Vedere size immagini
docker images | grep zenithstore
```

---

## 🆘 Aiuto

### Problemi Comuni

**Q: "Port 3000 already in use"**
A: Killare il processo: `lsof -ti:3000 | xargs kill -9`

**Q: "Docker build è lento"**
A: Normale la prima volta. Usa cache: `--build-arg BUILDKIT_INLINE_CACHE=1`

**Q: "GitHub Actions fallisce ma locale funziona"**
A: Verificare versione Node.js in workflow corrisponda a locale

**Q: "Metriche non appaiono in Prometheus"**
A: Verificare target UP in http://localhost:9090/targets

### Dove Chiedere

1. Controllare [docs/OPERATIONS.md](docs/OPERATIONS.md) - Troubleshooting
2. Leggere logs: `docker logs <container_name>`
3. GitHub Issues del progetto
4. Stack Overflow con tag: docker, prometheus, express

---

## ✅ Prossimi Step

Dopo aver completato il Quick Start:

1. ✅ **Eseguito test locali** → Vai a [DEMO.md](DEMO.md)
2. ✅ **Configurato GitHub** → Vai a [SETUP_GITHUB.md](SETUP_GITHUB.md)
3. ✅ **Studiare architettura** → Vai a [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
4. ✅ **Preparare consegna** → Segui checklist pre-consegna sopra

---

Buon lavoro! 🚀
