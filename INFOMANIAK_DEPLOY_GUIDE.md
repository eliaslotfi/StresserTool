# Guide de Déploiement Vercel (Frontend Next.js)

## 🎯 Objectif
Déployer le frontend Next.js sur Vercel.

## 📋 Prérequis

1. **URL Railway Backend** : Récupérez l'URL de votre backend déployé sur Railway
2. **Compte Vercel** : Connectez-vous sur https://vercel.com/
3. **Repository GitHub** : Votre code doit être sur GitHub

## 🔧 Configuration

### Étape 1: Configurer l'URL du Backend

1. Ouvrez le fichier `.env.production`
2. Remplacez `YOUR-RAILWAY-APP-URL` par votre vraie URL Railway :
   ```
   NEXT_PUBLIC_STRESS_API_BASE=https://votre-app-railway.railway.app
   ```

### Étape 2: Configurer CORS sur Railway

Dans votre dashboard Railway, ajoutez cette variable d'environnement :
```
STRESS_ALLOW_ORIGINS=https://votre-domaine-vercel.app,https://www.votre-domaine-vercel.app
```

### Étape 3: Déploiement sur Vercel

1. Allez sur https://vercel.com/
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Sélectionnez la branche `main`
5. Donnez un nom au projet (ex: stresser-tool)
6. Framework Preset : Next.js
7. Root Directory : ./
8. Build Command : `npm run build` ou `next build`
9. Output Directory : (laisser par défaut)
10. Install Command : `npm install` (ou yarn/pnpm/bun si vous préférez)
11. Ajoutez la variable d'environnement :
    - `NEXT_PUBLIC_STRESS_API_BASE=https://votre-app-railway.railway.app`
12. Lancez le déploiement

## ✅ Vérification Post-Déploiement

1. Visitez votre URL Vercel
2. Testez la connexion au backend Railway
3. Vérifiez que les tests de stress fonctionnent
4. Contrôlez les logs d'erreur CORS

## 🐛 Résolution de Problèmes

- **Erreur CORS** : Vérifiez `STRESS_ALLOW_ORIGINS` sur Railway
- **API non accessible** : Vérifiez l'URL dans `.env.production`
- **Pages 404** : Vérifiez la configuration Next.js
- **Ressources manquantes** : Vérifiez le chemin des assets Next.js
