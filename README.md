# Plateforme de Location de Maisons - HomeRent

> **Résumé pour exécuter le projet localement :**
> 1. Cloner le dépôt et se placer dans le dossier du projet  
> 2. Installer les dépendances : `npm install`  
> 3. Configurer la base de données MySQL et le fichier `.env`  
> 4. Initialiser la base : `npm run db:init`  
> 5. Lancer l'application : `npm run dev`  
> 6. Accéder à [http://localhost:5173](http://localhost:5173)

Une plateforme web moderne permettant la mise en relation entre propriétaires et locataires pour la location de maisons et appartements.

## 🚀 Fonctionnalités

### Utilisateurs
- **Inscription/Connexion** : Création de compte avec validation des champs
- **Types d'utilisateurs** : Propriétaire (bailleur) et Locataire
- **Gestion du profil** : Modification des informations personnelles
- **Sécurité** : Authentification JWT et hashage des mots de passe

### Annonces
- **Création d'annonce** : Interface intuitive pour les propriétaires
- **Consultation** : Liste paginée avec détails complets
- **Recherche avancée** : Filtres par localisation, prix, nombre de pièces, superficie
- **Gestion** : Modification et suppression pour les propriétaires

### Messagerie
- **Contact direct** : Formulaire de contact pour chaque annonce
- **Historique** : Messages reçus/envoyés selon le type d'utilisateur
- **Notifications** : Gestion des échanges propriétaires/locataires

### Tableaux de bord
- **Propriétaires** : Statistiques, gestion des annonces et messages
- **Locataires** : Historique des messages et recherches

## 🛠 Technologies

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le design
- **React Router** pour la navigation
- **Context API** pour la gestion d'état
- **Lucide React** pour les icônes

### Backend
- **Node.js** avec Express
- **MySQL** pour la base de données
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe
- **express-validator** pour la validation

## 📦 Installation et Configuration

### Prérequis
- Node.js (v16 ou supérieur)
- MySQL (v8 ou supérieur)
- npm ou yarn

### Installation locale

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd rental-platform
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de la base de données**
```bash
# Démarrer MySQL
# Créer une base de données 'rental_platform'
mysql -u root -p
CREATE DATABASE rental_platform;
exit
```

4. **Initialiser la base de données**
```bash
npm run db:init
```

5. **Démarrer l'application**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Variables d'environnement (optionnel)

Créer un fichier `.env` à la racine :
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=rental_platform
JWT_SECRET=votre_secret_jwt
PORT=3001
```

## 📊 Base de données

### Structure

#### Table `users`
- `id` : Identifiant unique
- `name` : Nom complet
- `email` : Adresse email (unique)
- `password` : Mot de passe hashé
- `phone` : Numéro de téléphone
- `type` : Type de compte (owner/tenant)
- `createdAt` : Date de création

#### Table `maisons`
- `id` : Identifiant unique
- `title` : Titre de l'annonce
- `description` : Description détaillée
- `price` : Prix mensuel
- `location` : Localisation
- `nbRooms` : Nombre de pièces
- `surface` : Superficie en m²
- `images` : URLs des images (JSON)
- `ownerId` : Référence vers le propriétaire
- `available` : Disponibilité
- `createdAt` : Date de création

#### Table `messages`
- `id` : Identifiant unique
- `maisonId` : Référence vers l'annonce
- `name` : Nom de l'expéditeur
- `email` : Email de l'expéditeur
- `phone` : Téléphone de l'expéditeur
- `message` : Contenu du message
- `date` : Date d'envoi

## 🎨 Design

- **Design moderne** : Interface épurée et professionnelle
- **Responsive** : Optimisé pour mobile, tablette et desktop
- **Couleurs** : Palette cohérente (bleu primaire, vert secondaire, orange accent)
- **Animations** : Transitions fluides et micro-interactions
- **Accessibilité** : Contraste approprié et navigation clavier

## 🔒 Sécurité

- **Authentification JWT** : Tokens sécurisés avec expiration
- **Hashage bcrypt** : Mots de passe protégés
- **Validation** : Vérification côté client et serveur
- **CORS** : Configuration pour les requêtes cross-origin
- **Sanitisation** : Protection contre les injections

## 📋 API Endpoints

### Authentification
- `POST /api/auth/register` : Inscription
- `POST /api/auth/login` : Connexion
- `GET /api/auth/profile` : Profil utilisateur
- `PUT /api/auth/profile` : Modification du profil

### Annonces
- `GET /api/maisons` : Liste des annonces
- `GET /api/maisons/:id` : Détail d'une annonce
- `POST /api/maisons` : Créer une annonce (propriétaire)
- `PUT /api/maisons/:id` : Modifier une annonce (propriétaire)
- `DELETE /api/maisons/:id` : Supprimer une annonce (propriétaire)
- `GET /api/maisons/my-properties` : Mes annonces (propriétaire)
- `GET /api/maisons/stats` : Statistiques (propriétaire)

### Messages
- `POST /api/messages` : Envoyer un message
- `GET /api/messages/received` : Messages reçus (propriétaire)
- `GET /api/messages/sent` : Messages envoyés (locataire)

## 🧪 Données de test

Après l'initialisation de la base de données, les comptes suivants sont disponibles :

**Propriétaires :**
- Email : `marie@example.com` / Mot de passe : `password`
- Email : `pierre@example.com` / Mot de passe : `password`

**Locataire :**
- Email : `sophie@example.com` / Mot de passe : `password`

## 🚀 Déploiement

### Développement
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :
1. Fork le projet
2. Créer une branche feature
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement

---

Développé avec ❤️ pour simplifier la location entre particuliers.