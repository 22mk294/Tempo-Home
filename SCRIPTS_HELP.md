# 🔧 SCRIPTS DE DIAGNOSTIC ET DÉPANNAGE TEMPO/HOME

Ces scripts permettent d'identifier et résoudre rapidement les problèmes de la plateforme Tempo/Home.

## 🚀 COMMANDES PRINCIPALES

### Démarrage intelligent
```bash
npm run fix:smart start
```
**Description :** Démarre automatiquement backend et frontend avec diagnostic en temps réel et messages d'erreur explicites.

**Pourquoi l'utiliser :**
- ✅ Nettoie automatiquement les processus conflictuels
- ✅ Démarre les services dans le bon ordre
- ✅ Vérifie que chaque service fonctionne avant de passer au suivant
- ✅ Fournit des solutions concrètes en cas d'erreur

### Diagnostic complet
```bash
npm run diagnostic
```
**Description :** Vérifie l'état de tous les composants (base de données, backend, frontend, API).

**Messages d'erreur typiques et solutions :**

#### ❌ "Base de données : Unknown database 'tempo_home'"
**Cause :** La base de données n'a pas été créée
**Solution :** 
```bash
npm run db:init
```

#### ❌ "Port 8888 inaccessible"
**Cause :** Le serveur backend n'est pas démarré
**Solution :** 
```bash
npm run dev:server
# ou
npm run fix:smart start
```

#### ❌ "Port 5173 inaccessible"
**Cause :** Le serveur frontend n'est pas démarré
**Solution :** 
```bash
npm run dev:client
# ou
npm run fix:smart start
```

### Diagnostic base de données
```bash
npm run check:db
```
**Description :** Analyse détaillée de la base de données MySQL.

**Messages d'erreur typiques :**

#### ❌ "Connexion MySQL échouée: ECONNREFUSED"
**Cause :** XAMPP/MySQL n'est pas démarré
**Solution :** 
1. Ouvrir XAMPP Control Panel
2. Démarrer MySQL
3. Relancer le diagnostic

#### ❌ "Tables manquantes: users, maisons, messages"
**Cause :** Base de données vide ou corrompue
**Solution :** 
```bash
npm run db:init
```

#### ❌ "Aucun compte admin trouvé"
**Cause :** Données d'exemple non insérées
**Solution :** 
```bash
npm run db:init
```

### Test API backend
```bash
npm run test:api
```
**Description :** Teste tous les endpoints de l'API backend.

**Messages d'erreur typiques :**

#### ❌ "API /api/maisons erreur: ECONNREFUSED"
**Cause :** Backend non démarré
**Solution :** 
```bash
npm run dev:server
```

#### ❌ "Status non-success: 500"
**Cause :** Erreur interne du serveur (souvent base de données)
**Solution :** 
1. Vérifier que MySQL est démarré
2. Vérifier que la base existe : `npm run check:db`
3. Réinitialiser si nécessaire : `npm run db:init`

#### ❌ "Proxy Vite ne fonctionne pas: ECONNREFUSED"
**Cause :** Vite n'arrive pas à contacter le backend
**Solution :** 
1. Démarrer backend AVANT frontend
2. Vérifier vite.config.ts
3. Redémarrer dans l'ordre : `npm run fix:smart start`

## 🆘 RÉSOLUTION DES PROBLÈMES COURANTS

### Problème : "Erreurs de proxy Vite (ECONNREFUSED)"

**Diagnostic :**
```bash
npm run diagnostic
```

**Solutions par ordre de priorité :**

1. **Backend non démarré :**
   ```bash
   npm run fix:smart start
   ```

2. **Backend démarré mais ne répond pas :**
   ```bash
   npm run test:api
   npm run check:db
   ```

3. **Problème de configuration proxy :**
   - Vérifier `vite.config.ts`
   - Redémarrer Vite : `npm run dev:client`

4. **Processus fantômes :**
   ```bash
   npm run fix:smart kill
   npm run fix:smart start
   ```

### Problème : "Base de données non accessible"

**Étapes de résolution :**

1. **Vérifier XAMPP :**
   - Ouvrir XAMPP Control Panel
   - Démarrer Apache et MySQL
   - Vérifier que MySQL est en vert

2. **Tester la connexion :**
   ```bash
   npm run check:db
   ```

3. **Initialiser la base :**
   ```bash
   npm run db:init
   ```

4. **Vérifier la configuration :**
   - Ouvrir `server/config/database.js`
   - Vérifier : host: 'localhost', user: 'root', password: ''

### Problème : "Frontend ne se lance pas"

**Diagnostic :**
```bash
npm run dev:client
```

**Solutions courantes :**

1. **Erreurs TypeScript :**
   - Lire les erreurs dans la console
   - Corriger les imports manquants
   - Vérifier les types

2. **Port occupé :**
   - Vite va automatiquement essayer un autre port
   - Ou nettoyer : `npm run fix:smart kill`

3. **Problèmes de dépendances :**
   ```bash
   npm install
   npm run dev:client
   ```

## 📊 WORKFLOW DE DÉPANNAGE RECOMMANDÉ

### 1. Diagnostic initial
```bash
npm run diagnostic
```

### 2. Si problème de base de données
```bash
npm run check:db
npm run db:init
```

### 3. Si problème de services
```bash
npm run fix:smart start
```

### 4. Si problème persiste
```bash
npm run test:api
```

### 5. En dernier recours
```bash
npm run fix:smart kill
# Redémarrer XAMPP
npm run db:init
npm run fix:smart start
```

## 🔍 COMPRENDRE LES MESSAGES D'ERREUR

### Messages de succès ✅
- `✅ Base de données opérationnelle` : Tout va bien
- `✅ Backend démarré avec succès` : Serveur API prêt
- `✅ Frontend démarré avec succès` : Interface utilisateur prête
- `✅ API backend opérationnelle` : Toutes les routes fonctionnent

### Messages d'avertissement ⚠️
- `⚠️ Tables manquantes` : Base partiellement initialisée
- `⚠️ Port 5173 occupé` : Vite va utiliser un autre port
- `⚠️ Certains processus n'ont pas pu être arrêtés` : Redémarrer Windows

### Messages d'erreur ❌
- `❌ Erreur base de données: ECONNREFUSED` : MySQL arrêté
- `❌ Port 8888 inaccessible` : Backend non démarré
- `❌ API /api/maisons erreur` : Problème backend/base
- `❌ Proxy Vite ne fonctionne pas` : Configuration ou ordre de démarrage

### Messages de solution 💡
- `💡 Démarrer XAMPP` : Action requise
- `💡 Exécuter: npm run db:init` : Commande à lancer
- `💡 Vérifier vite.config.ts` : Fichier à examiner

## 🎯 COMMANDES PAR SITUATION

### "Je commence le développement"
```bash
npm run diagnostic
npm run fix:smart start
```

### "L'application ne charge pas les données"
```bash
npm run test:api
npm run check:db
```

### "Erreurs de proxy dans Vite"
```bash
npm run diagnostic
npm run fix:smart kill
npm run fix:smart start
```

### "Problème de base de données"
```bash
npm run check:db
npm run db:init
```

### "Tout semble cassé"
```bash
npm run fix:smart kill
# Redémarrer XAMPP
npm run db:init
npm run fix:smart start
```

## 📝 LOGS ET DÉBOGAGE

Tous les scripts fournissent des messages explicites sur :
- ✅ Ce qui fonctionne
- ❌ Ce qui ne fonctionne pas
- 💡 Comment le réparer
- 🔧 Quelle commande utiliser

Les messages sont conçus pour être auto-explicatifs et donner immédiatement la solution.
