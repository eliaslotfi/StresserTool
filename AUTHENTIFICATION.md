# 🔐 Système d'Authentification avec Protection Anti-Bruteforce

## 📋 Vue d'ensemble

Ce système d'authentification sécurisé a été implémenté avec les caractéristiques suivantes :

- **Mot de passe unique** : `BrockLesnar77`
- **Protection anti-bruteforce** : Blocage automatique après 5 tentatives échouées
- **Durée de blocage** : 1 heure par adresse IP
- **Sessions sécurisées** : Cookies HttpOnly avec expiration automatique
- **Interface utilisateur** : Formulaire de connexion moderne avec indicateurs visuels

## 🏗️ Architecture du Système

### Fichiers Créés/Modifiés

1. **`/lib/auth-storage.ts`** - Système de stockage des tentatives de connexion
2. **`/lib/auth.ts`** - Utilitaires d'authentification et gestion des sessions
3. **`/app/api/auth/login/route.ts`** - API de connexion
4. **`/app/api/auth/logout/route.ts`** - API de déconnexion
5. **`/app/api/auth/status/route.ts`** - API de vérification du statut
6. **`/components/login-form.tsx`** - Composant de formulaire de connexion
7. **`/components/auth-header.tsx`** - En-tête avec bouton de déconnexion
8. **`/hooks/use-auth.ts`** - Hook React pour l'authentification
9. **`/middleware.ts`** - Middleware de protection des routes
10. **`/app/page.tsx`** - Page principale modifiée avec authentification

## 🔧 Configuration

### Variables d'Environnement (Optionnelles)

Créez un fichier `.env.local` pour personnaliser la configuration :

```env
# Mot de passe principal
AUTH_PASSWORD=BrockLesnar77

# Clé secrète pour les sessions (changez en production)
SESSION_SECRET=your-super-secret-key-change-this-in-production

# Durée de validité des sessions (24h = 86400000ms)
SESSION_DURATION=86400000

# Nombre maximum de tentatives avant blocage
MAX_LOGIN_ATTEMPTS=5

# Durée de blocage (1h = 3600000ms)
BLOCK_DURATION=3600000
```

## 🚀 Fonctionnement

### 1. Protection Anti-Bruteforce

- **Suivi par IP** : Chaque adresse IP est suivie individuellement
- **Compteur de tentatives** : Incrémenté à chaque échec de connexion
- **Blocage automatique** : Après 5 tentatives échouées
- **Durée de blocage** : 1 heure complète
- **Nettoyage automatique** : Les anciennes tentatives sont supprimées

### 2. Gestion des Sessions

- **Cookies sécurisés** : HttpOnly, Secure, SameSite=Strict
- **Tokens temporaires** : Expiration automatique après 24h
- **Vérification continue** : Validation à chaque requête

### 3. Interface Utilisateur

- **Formulaire responsive** : Design moderne avec Tailwind CSS
- **Indicateurs visuels** : Alertes pour les erreurs et le statut
- **Compteur de tentatives** : Affichage du nombre de tentatives restantes
- **Timer de blocage** : Indication du temps restant lors d'un blocage

## 🛡️ Sécurité

### Mesures Implémentées

1. **Hachage des mots de passe** : Utilisation de bcryptjs
2. **Protection CSRF** : Cookies SameSite=Strict
3. **Sessions temporaires** : Expiration automatique
4. **Limitation de débit** : Blocage par IP
5. **Nettoyage automatique** : Suppression des données anciennes

### Recommandations de Production

1. **Variables d'environnement** : Utilisez des secrets forts
2. **HTTPS obligatoire** : Pour la sécurité des cookies
3. **Base de données** : Remplacez le stockage en mémoire
4. **Logs de sécurité** : Surveillez les tentatives suspectes
5. **Rate limiting** : Implémentez au niveau du serveur web

## 🔄 Flux d'Authentification

### Connexion Réussie
```
1. Utilisateur saisit le mot de passe
2. Vérification du mot de passe
3. Génération du token de session
4. Création du cookie sécurisé
5. Redirection vers l'application
```

### Connexion Échouée
```
1. Utilisateur saisit un mauvais mot de passe
2. Enregistrement de la tentative échouée
3. Incrémentation du compteur pour l'IP
4. Affichage du message d'erreur
5. Si 5 tentatives : blocage de l'IP pendant 1h
```

### Vérification de Session
```
1. Extraction du token du cookie
2. Validation de la signature
3. Vérification de l'expiration
4. Autorisation ou refus d'accès
```

## 🧪 Test du Système

### Test de Connexion Normale
1. Accédez à votre site
2. Saisissez le mot de passe : `BrockLesnar77`
3. Vérifiez l'accès à l'application

### Test de Protection Anti-Bruteforce
1. Saisissez 5 fois un mauvais mot de passe
2. Vérifiez le message de blocage
3. Attendez ou testez avec une autre IP

### Test de Déconnexion
1. Cliquez sur le bouton "Déconnexion"
2. Vérifiez le retour au formulaire de connexion

## 📊 Monitoring

### Données Stockées (En Mémoire)
- Adresse IP du client
- Nombre de tentatives échouées
- Horodatage de la dernière tentative
- Date de fin de blocage (si applicable)

### Nettoyage Automatique
- Toutes les 10 minutes
- Suppression des tentatives > 24h
- Libération de la mémoire

## ⚡ Performance

### Optimisations
- Stockage en mémoire pour la rapidité
- Nettoyage automatique pour éviter la fuite mémoire
- Validation côté client et serveur
- Chargement conditionnel des composants

## 🔧 Maintenance

### Surveillance Recommandée
1. **Tentatives de connexion** : Logs des échecs répétés
2. **Utilisation mémoire** : Monitoring du stockage des tentatives
3. **Performance** : Temps de réponse des API d'authentification
4. **Sécurité** : Détection des patterns d'attaque

### Mise à Jour
- Changement du mot de passe : Modifier `AUTH_PASSWORD`
- Ajustement des seuils : Variables d'environnement
- Amélioration de l'UI : Composants React modulaires

## 🚨 Dépannage

### Problèmes Courants

1. **"Accès bloqué"** : Attendez 1h ou changez d'IP
2. **Session expirée** : Reconnectez-vous
3. **Erreur serveur** : Vérifiez les logs de l'application
4. **Cookie non défini** : Vérifiez HTTPS en production

### Réinitialisation
- Redémarrez le serveur pour vider le cache des tentatives
- Supprimez les cookies du navigateur pour les sessions

---

## 📞 Support

Ce système est maintenant opérationnel et sécurisé. Pour toute question ou amélioration, consultez la documentation du code source.