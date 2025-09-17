# 🚀 Guide de Déploiement Railway - Application Next.js avec Authentification

## 📋 Configuration Automatique du Déploiement

### Étape 1 : Connecter votre Repository Git

1. **Connecter à Railway** :
   - Allez sur [Railway.app](https://railway.app)
   - Cliquez sur "New Project"
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez votre repository

2. **Configuration automatique** :
   - Railway détectera automatiquement votre application Next.js
   - Les fichiers de configuration ont été modifiés pour Next.js :
     - ✅ `railway.toml` - Configuration Railway
     - ✅ `nixpacks.toml` - Configuration de build
     - ✅ `Procfile` - Commande de démarrage
     - ✅ `package.json` - Scripts optimisés

### Étape 2 : Configurer les Variables d'Environnement

Dans le dashboard Railway, allez dans **Settings > Environment** et ajoutez :

```env
AUTH_PASSWORD=BrockLesnar77
SESSION_SECRET=votre-cle-secrete-super-forte-pour-railway
SESSION_DURATION=86400000
MAX_LOGIN_ATTEMPTS=5
BLOCK_DURATION=3600000
NODE_ENV=production
```

⚠️ **Important** : Changez `SESSION_SECRET` par une clé aléatoirement générée forte !

### Étape 3 : Activer le Déploiement Automatique

1. **Dans Railway Dashboard** :
   - Allez dans **Settings > Service**
   - Vérifiez que "Auto Deploy" est activé
   - Branche par défaut : `main` ou `master`

2. **Configuration Git** :
   - Chaque push sur la branche principale déclenchera automatiquement un déploiement
   - Railway construira et déploiera votre application automatiquement

### Étape 4 : Vérifier la Configuration de Build

Railway utilisera automatiquement :

```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
```

```toml
# nixpacks.toml
providers = ["node"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

## 🔄 Processus de Déploiement Automatique

### Quand vous faites un push :

1. **Détection** : Railway détecte le nouveau commit
2. **Build** : 
   - Installation des dépendances (`npm ci`)
   - Construction de l'application (`npm run build`)
3. **Deploy** : 
   - Démarrage du serveur (`npm start`)
   - Attribution d'une URL publique
4. **Live** : Votre application est accessible publiquement

### Logs de Déploiement

Vous pouvez suivre le déploiement en temps réel dans :
- **Railway Dashboard > Deployments**
- Logs détaillés de chaque étape
- Messages d'erreur si problème

## 🛠️ Dépannage

### Problèmes Courants

1. **Build échoue** :
   ```bash
   # Vérifiez localement
   npm ci
   npm run build
   ```

2. **Variables d'environnement manquantes** :
   - Vérifiez dans Railway Settings > Environment
   - Redéployez après ajout de variables

3. **Port non configuré** :
   - Railway utilise automatiquement la variable `$PORT`
   - Notre `package.json` est configuré : `"start": "next start -p $PORT"`

4. **Erreur de mémoire** :
   - Railway alloue automatiquement la mémoire nécessaire
   - Next.js optimise automatiquement pour la production

### Commandes de Vérification

```bash
# Test local de production
npm run build
npm start

# Vérification des dépendances
npm audit
npm update
```

## 📊 Monitoring

### Métriques Railway

Railway fournit automatiquement :
- **CPU Usage** : Utilisation du processeur
- **Memory Usage** : Utilisation de la mémoire
- **Network** : Trafic entrant/sortant
- **Response Times** : Temps de réponse

### Logs d'Application

Accédez aux logs via :
- Railway Dashboard > Service > Logs
- Filtrage par niveau (error, warn, info)
- Recherche dans les logs

## 🔐 Sécurité en Production

### Variables Sensibles

✅ **Configuré automatiquement** :
- Cookies sécurisés (HttpOnly, Secure, SameSite)
- Sessions avec expiration
- Protection anti-bruteforce
- Hachage des mots de passe

### Recommandations

1. **HTTPS** : Railway fournit automatiquement HTTPS
2. **Variables d'environnement** : Jamais dans le code
3. **Logs** : Ne pas logger les mots de passe
4. **Monitoring** : Surveillez les tentatives de connexion

## 🚀 Optimisations Railway

### Performance

1. **Build Cache** : Railway met en cache les `node_modules`
2. **Static Files** : Next.js optimise automatiquement
3. **Compression** : Gzip activé automatiquement
4. **CDN** : Railway utilise un CDN global

### Scaling

- **Auto-scaling** : Railway scale automatiquement selon le trafic
- **Zero-downtime** : Déploiements sans interruption
- **Health checks** : Vérification automatique de l'état

## 📝 Checklist de Déploiement

- [x] Repository connecté à Railway
- [x] Variables d'environnement configurées
- [x] Auto-deploy activé
- [x] Configuration Next.js validée
- [x] Test local réussi
- [ ] Premier déploiement testé
- [ ] Authentification testée en production
- [ ] Anti-bruteforce testé

## 🎯 Résultat Final

Après configuration, vous aurez :

✅ **Déploiement automatique** à chaque push  
✅ **Application Next.js** avec authentification sécurisée  
✅ **Protection anti-bruteforce** opérationnelle  
✅ **HTTPS** automatique  
✅ **URL publique** accessible  
✅ **Monitoring** intégré  

---

## 🔧 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Railway
2. Testez localement avec `npm run build && npm start`
3. Vérifiez les variables d'environnement
4. Consultez la documentation Railway

Votre application sera automatiquement déployée à chaque push sur votre branche principale ! 🎉