# 🚀 Configuration Manuelle Railway - Solution TOML

## ❌ Problème : Erreur TOML persistante

Si vous avez toujours l'erreur : `Failed to parse TOML file railway.toml: keys cannot contain < character`

## ✅ Solution : Configuration Manuelle (RECOMMANDÉE)

### Étape 1 : Supprimer les fichiers TOML
Les fichiers `railway.toml` et `nixpacks.toml` ont été supprimés pour éviter les conflits.

### Étape 2 : Configuration via Railway Dashboard

1. **Connectez votre repository** à Railway
2. **Dans Settings → Build** :
   - Build Command : `npm run build`
   - Install Command : `npm ci`

3. **Dans Settings → Deploy** :
   - Start Command : `npm start`
   - Port : `3000` (Railway utilisera automatiquement $PORT)

4. **Variables d'environnement** (Settings → Environment) :
   ```env
   AUTH_PASSWORD=BrockLesnar77
   SESSION_SECRET=votre-cle-secrete-forte-pour-production
   NODE_ENV=production
   ```

### Étape 3 : Railway détectera automatiquement Next.js

Railway reconnaîtra votre projet comme Next.js grâce à :
- ✅ `package.json` avec dépendance `next`
- ✅ Scripts `build` et `start` configurés
- ✅ Structure de projet Next.js standard

### Étape 4 : Activer Auto-Deploy

Dans **Settings → Service** :
- ✅ Auto Deploy : ON
- ✅ Branche : `main` (ou votre branche principale)

## 🎯 Configuration Automatique Alternative

Si Railway ne détecte pas automatiquement, utilisez ces commandes exactes dans le dashboard :

### Build Settings :
```bash
# Install Command
npm ci

# Build Command  
npm run build

# Start Command
npm start
```

### Environment Variables :
```env
AUTH_PASSWORD=BrockLesnar77
SESSION_SECRET=changez-cette-cle-en-production
NODE_ENV=production
PORT=3000
```

## 🔧 Dépannage Avancé

### Option A : Redéploiement forcé
1. Dans Railway, allez dans **Deployments**
2. Cliquez sur **Redeploy** du dernier déploiement
3. Railway ignorera les fichiers TOML et utilisera la détection automatique

### Option B : Nouveau service
1. Créez un nouveau service Railway
2. Connectez le même repository
3. Configuration manuelle dès le début

### Option C : Variables d'environnement pour build
Ajoutez dans Railway Environment :
```env
NIXPACKS_BUILD_CMD=npm run build
NIXPACKS_START_CMD=npm start
NIXPACKS_INSTALL_CMD=npm ci
```

## 📋 Checklist de Vérification

- [x] Fichiers TOML supprimés
- [x] package.json optimisé
- [x] Scripts npm corrects
- [x] next.config.mjs simplifié
- [x] .railwayignore créé
- [ ] Configuration manuelle Railway
- [ ] Variables d'environnement ajoutées
- [ ] Auto-deploy activé
- [ ] Test de déploiement

## 🎉 Résultat Attendu

Après configuration manuelle :
1. ✅ Railway détecte Next.js automatiquement
2. ✅ Build réussit avec `npm run build`
3. ✅ Démarrage avec `npm start`
4. ✅ Application accessible avec authentification
5. ✅ Auto-deploy fonctionnel

## 🚨 Important

**Cette méthode est plus fiable** que les fichiers TOML car :
- Pas de problèmes d'encodage
- Configuration directe dans Railway
- Détection automatique du framework
- Moins de conflits potentiels

---

## ➡️ Action Suivante

1. **Push votre code** (sans fichiers TOML) :
   ```bash
   git add .
   git commit -m "Remove TOML files - use Railway auto-detection"
   git push origin main
   ```

2. **Configurez manuellement** dans Railway Dashboard selon ce guide

3. **Testez le déploiement** - il devrait maintenant fonctionner ! 🚀