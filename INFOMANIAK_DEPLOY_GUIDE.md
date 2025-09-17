# Guide de Déploiement sur kozaki.fr avec Infomaniak

## 🎯 Objectif
Déployer le frontend Next.js sur votre domaine kozaki.fr hébergé chez Infomaniak.

## 📋 Prérequis

1. **URL Railway Backend** : Récupérez l'URL de votre backend déployé sur Railway
2. **Accès Infomaniak** : Panel d'administration de votre hébergement
3. **Domaine configuré** : kozaki.fr pointant vers votre hébergement Infomaniak

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
STRESS_ALLOW_ORIGINS=https://kozaki.fr,https://www.kozaki.fr
```

### Étape 3: Build du Frontend

Exécutez ces commandes :
```bash
npm install
npm run build
```

### Étape 4: Préparer les Fichiers pour Infomaniak

Après le build, vous aurez un dossier `out/` (si export statique) ou vous devrez configurer Node.js sur Infomaniak.

## 🚀 Options de Déploiement Infomaniak

### Option A: Site Statique (Recommandé)
Si Infomaniak supporte les sites statiques :
1. Configurez Next.js pour l'export statique
2. Uploadez le contenu du dossier `out/`

### Option B: Node.js
Si Infomaniak supporte Node.js :
1. Uploadez tous les fichiers du projet
2. Configurez les variables d'environnement
3. Démarrez avec `npm start`

## 📁 Structure des Fichiers à Uploader

```
kozaki.fr/
├── _next/          # Assets Next.js
├── api/           # Routes API (si applicable)
├── images/        # Images optimisées
├── index.html     # Page d'accueil
├── *.html         # Autres pages
└── ...
```

## 🔒 Variables d'Environnement

Sur Infomaniak, configurez :
```
NEXT_PUBLIC_STRESS_API_BASE=https://votre-app-railway.railway.app
NODE_ENV=production
```

## ✅ Vérification Post-Déploiement

1. Visitez https://kozaki.fr
2. Testez la connexion au backend Railway
3. Vérifiez que les tests de stress fonctionnent
4. Contrôlez les logs d'erreur CORS

## 🐛 Résolution de Problèmes

- **Erreur CORS** : Vérifiez `STRESS_ALLOW_ORIGINS` sur Railway
- **API non accessible** : Vérifiez l'URL dans `.env.production`
- **Pages 404** : Configurez les redirections sur Infomaniak
- **Ressources manquantes** : Vérifiez le chemin des assets Next.js