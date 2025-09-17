# Guide de Déploiement sur Vercel

## 🎯 Architecture
- **Frontend** : Vercel (kozaki.fr)
- **Backend** : Railway (stressertool-production.up.railway.app)

## 📋 Étapes de déploiement

### 1. Créer un compte Vercel
1. Allez sur https://vercel.com
2. Connectez-vous avec votre compte GitHub
3. Autorisez l'accès à votre repository `StresserTool`

### 2. Importer le projet
1. Cliquez sur "New Project"
2. Sélectionnez votre repository `eliaslotfi/StresserTool`
3. Vercel détectera automatiquement Next.js

### 3. Configurer les variables d'environnement
Dans les paramètres du projet Vercel, ajoutez :

```
NEXT_PUBLIC_STRESS_API_BASE=https://stressertool-production.up.railway.app
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://kozaki.fr
```

### 4. Déployer
1. Cliquez sur "Deploy"
2. Vercel va automatiquement :
   - Installer les dépendances
   - Builder le projet
   - Déployer sur leur CDN global

### 5. Configurer le domaine custom (kozaki.fr)
1. Dans les paramètres Vercel → "Domains"
2. Ajoutez `kozaki.fr` et `www.kozaki.fr`
3. Suivez les instructions DNS

### 6. Configuration DNS chez votre registrar
Pointez votre domaine vers Vercel :
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

## 🚀 Avantages de cette architecture

### Frontend (Vercel)
- ✅ CDN global ultra-rapide
- ✅ Déploiement automatique à chaque push
- ✅ Optimisations Next.js natives
- ✅ Analytics intégrés
- ✅ HTTPS automatique

### Backend (Railway)
- ✅ API Python FastAPI
- ✅ Base de données SQLite
- ✅ Scaling automatique
- ✅ Logs en temps réel

## 🔧 Configuration CORS sur Railway

N'oubliez pas de configurer CORS sur Railway :
```
STRESS_ALLOW_ORIGINS=https://kozaki.fr,https://www.kozaki.fr,https://votre-app.vercel.app
```

## 📊 Monitoring

### Vercel Analytics
- Visiteurs en temps réel
- Performance des pages
- Erreurs JavaScript

### Railway Logs
- Logs API en temps réel
- Métriques de performance
- Monitoring des erreurs

## 🐛 Résolution de problèmes

### Erreur CORS
- Vérifiez `STRESS_ALLOW_ORIGINS` sur Railway
- Incluez tous vos domaines (kozaki.fr, www.kozaki.fr, vercel.app)

### Build Failed
- Vérifiez les variables d'environnement
- Consultez les logs de build Vercel

### API non accessible
- Vérifiez que Railway est en ligne
- Testez l'URL API directement

## ✅ Checklist finale

- [ ] Compte Vercel créé et connecté à GitHub
- [ ] Variables d'environnement configurées
- [ ] Premier déploiement réussi
- [ ] Domaine custom configuré
- [ ] CORS configuré sur Railway
- [ ] Tests de fonctionnement complets