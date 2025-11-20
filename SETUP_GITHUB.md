# Setup GitHub Repository - Istruzioni Complete

Seguire questi passi per configurare il repository GitHub e attivare la pipeline CI/CD.

## Parte 1: Creare Repository GitHub

### Passo 1: Creare nuovo repository

1. Andare su **https://github.com**
2. Cliccare sul pulsante **"+"** in alto a destra
3. Selezionare **"New repository"**

### Passo 2: Configurare repository

**Impostazioni:**
- **Repository name**: `zenithstore-devops`
- **Description**: `E-commerce CI/CD platform with zero-downtime deployment strategy`
- **Visibility**:
  - ✅ **Public** (consigliato per GitHub Actions gratuito)
  - ⚠️ Private (richiede piano a pagamento per Actions)
- **NON** selezionare:
  - ❌ Add a README file
  - ❌ Add .gitignore
  - ❌ Choose a license

4. Cliccare **"Create repository"**

### Passo 3: Copia URL del repository

Dopo la creazione vedrai una pagina con istruzioni. Copia l'URL HTTPS:

```
https://github.com/TUO_USERNAME/zenithstore-devops.git
```

---

## Parte 2: Connettere Repository Locale a GitHub

Tornare al terminale nella directory del progetto:

```bash
# Verificare di essere nella directory corretta
pwd
# Dovrebbe mostrare: .../8-devops

# Aggiungere remote GitHub (sostituisci TUO_USERNAME)
git remote add origin https://github.com/TUO_USERNAME/zenithstore-devops.git

# Verificare remote configurato
git remote -v
```

**Output atteso:**
```
origin  https://github.com/TUO_USERNAME/zenithstore-devops.git (fetch)
origin  https://github.com/TUO_USERNAME/zenithstore-devops.git (push)
```

---

## Parte 3: Push Codice su GitHub

### Opzione A: Con credenziali HTTPS

```bash
# Rinominare branch da master a main (se necessario)
git branch -M main

# Push codice
git push -u origin main
```

Ti verrà chiesto di autenticarti:
- **Username**: tuo username GitHub
- **Password**: **Personal Access Token** (NON la password GitHub!)

#### Come creare Personal Access Token:

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Nome: `zenithstore-devops-token`
4. Scadenza: 90 days
5. Scope da selezionare:
   - ✅ `repo` (full control)
   - ✅ `workflow` (update workflows)
   - ✅ `write:packages` (per Container Registry)
6. Generate token
7. **COPIARE E SALVARE IL TOKEN** (non sarà più visibile!)

### Opzione B: Con SSH (alternativa)

Se preferisci SSH:

```bash
# Generare chiave SSH (se non esiste)
ssh-keygen -t ed25519 -C "tua-email@example.com"

# Copiare chiave pubblica
cat ~/.ssh/id_ed25519.pub

# Aggiungere a GitHub:
# Settings → SSH and GPG keys → New SSH key

# Cambiare remote a SSH
git remote set-url origin git@github.com:TUO_USERNAME/zenithstore-devops.git

# Push
git push -u origin main
```

---

## Parte 4: Verificare Push su GitHub

1. Andare su `https://github.com/TUO_USERNAME/zenithstore-devops`
2. Verificare che tutti i file siano presenti:
   - ✅ app/
   - ✅ .github/workflows/
   - ✅ monitoring/
   - ✅ README.md
   - ✅ docker-compose.yml
   - etc.

---

## Parte 5: Configurare GitHub Actions

### Verificare Pipeline Attiva

1. Andare su repository GitHub
2. Cliccare tab **"Actions"**
3. Dovresti vedere workflow **"CI/CD Pipeline"** in esecuzione

### Abilitare Actions (se disabilitato)

Se vedi messaggio "Workflows aren't being run":
1. Settings → Actions → General
2. Actions permissions: **Allow all actions**
3. Workflow permissions: **Read and write permissions**
4. Salvare

### Monitorare Prima Esecuzione

1. Actions → CI/CD Pipeline → ultimo workflow run
2. Verificare jobs:
   - ✅ **Test** - Esegue npm test
   - ✅ **Build** - Crea immagine Docker
   - ⚠️ **Push Image** - Potrebbe fallire (normale se repo privato)

---

## Parte 6: Configurare Container Registry (Opzionale)

Per abilitare push delle immagini Docker:

### GitHub Container Registry (ghcr.io)

1. Settings → Developer settings → Personal access tokens
2. Creare token con scope:
   - ✅ `write:packages`
   - ✅ `delete:packages`
   - ✅ `read:packages`

3. Nel repository → Settings → Secrets and variables → Actions
4. New repository secret:
   - Name: `GHCR_TOKEN`
   - Value: il token appena creato

5. Aggiornare workflow (già configurato di default)

### DockerHub (alternativa)

1. Creare account su https://hub.docker.com
2. Settings → Security → New Access Token
3. Nel repository GitHub → Settings → Secrets:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`

4. Modificare `.github/workflows/ci-cd.yml`:
```yaml
env:
  REGISTRY: docker.io
  IMAGE_NAME: tuo-username/zenithstore
```

---

## Parte 7: Test Pipeline Completa

### Trigger manuale workflow

1. Actions → CI/CD Pipeline
2. "Run workflow" → selezionare branch `main`
3. "Run workflow"

### Verificare jobs

**Job 1: Test**
```
✅ Checkout code
✅ Setup Node.js
✅ Install dependencies
✅ Run tests
✅ Upload coverage
```

**Job 2: Build**
```
✅ Checkout code
✅ Set up Docker Buildx
✅ Build Docker image
✅ Run smoke test
```

**Job 3: Push Image** (se configurato)
```
✅ Login to Container Registry
✅ Extract metadata
✅ Build and push Docker image
```

---

## Parte 8: Configurare Branch Protection (Opzionale)

Per ambienti più robusti:

1. Settings → Branches → Add branch protection rule
2. Branch name pattern: `main`
3. Configurazioni consigliate:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass
     - Selezionare: `Test`, `Build`
   - ✅ Require branches to be up to date
   - ⚠️ Include administrators (opzionale)

---

## Parte 9: Creare Branch Develop

Per workflow GitFlow:

```bash
# Creare branch develop
git checkout -b develop

# Push develop
git push -u origin develop

# Tornare a main
git checkout main
```

Aggiornare workflow per triggerare anche su `develop`:

```yaml
on:
  push:
    branches: [main, develop]  # ← già configurato!
```

---

## Parte 10: Primo Deploy (Simulato)

### Creare un cambiamento

```bash
# Modificare qualcosa (esempio)
echo "v1.0.1" >> version.txt

# Commit
git add .
git commit -m "chore: add version file"

# Push
git push origin main
```

### Monitorare Pipeline

1. Actions → Workflow run appena creato
2. Verificare passaggio di tutti i job
3. Controllare logs dettagliati

---

## Troubleshooting

### Errore: Permission denied (push)

**Soluzione:**
```bash
# Verificare remote
git remote -v

# Verificare credenziali
git config --list | grep user

# Rigenerare token e riprovare
```

### Errore: Actions workflow non parte

**Soluzione:**
1. Settings → Actions → General
2. Verificare "Allow all actions"
3. Verificare "Read and write permissions"

### Errore: Docker build fails in Actions

**Soluzione:**
Verificare Dockerfile e dipendenze. Testare build locale:
```bash
docker build -t test ./app
```

### Errore: Test falliscono in CI ma passano localmente

**Soluzione:**
Verificare versione Node.js:
```yaml
# .github/workflows/ci-cd.yml
- uses: actions/setup-node@v4
  with:
    node-version: '18'  # ← deve corrispondere a locale
```

---

## Checklist Finale

Verificare che tutto sia configurato:

- [ ] Repository GitHub creato
- [ ] Codice pushato su GitHub
- [ ] Tutti i file visibili su GitHub
- [ ] GitHub Actions abilitato
- [ ] Pipeline CI/CD eseguita con successo
- [ ] Job Test ✅ passato
- [ ] Job Build ✅ passato
- [ ] (Opzionale) Container Registry configurato
- [ ] (Opzionale) Branch protection configurato
- [ ] (Opzionale) Branch develop creato

---

## Prossimi Passi

Dopo il setup GitHub:

1. **Test locale**: Eseguire `bash scripts/deploy.sh dev`
2. **Documentazione**: Leggere [README.md](README.md) per utilizzo
3. **Demo**: Seguire [DEMO.md](DEMO.md) per valutazione
4. **Operazioni**: Consultare [docs/OPERATIONS.md](docs/OPERATIONS.md)

---

## Link Utili

- Repository: `https://github.com/TUO_USERNAME/zenithstore-devops`
- Actions: `https://github.com/TUO_USERNAME/zenithstore-devops/actions`
- Packages: `https://github.com/TUO_USERNAME?tab=packages`
- Settings: `https://github.com/TUO_USERNAME/zenithstore-devops/settings`

---

## Supporto

In caso di problemi:
1. Controllare [Troubleshooting](#troubleshooting)
2. Leggere GitHub Actions logs
3. Verificare [GitHub Actions documentation](https://docs.github.com/en/actions)

Buon deploy! 🚀
