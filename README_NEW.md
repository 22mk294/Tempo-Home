# 🏡 Tempo/Home - Plateforme de Location Immobilière

Une plateforme moderne et intuitive pour la location de maisons et appartements, offrant une expérience utilisateur optimale pour les propriétaires et locataires.

## ✨ Fonctionnalités Principales

### 🏠 **Pour les Propriétaires**
- **Dashboard dynamique** avec statistiques en temps réel
- **Gestion complète des annonces** (Créer, Modifier, Supprimer)
- **Système d'images avancé** (jusqu'à 10 photos par annonce)
- **Gestion de disponibilité** (Disponible/Indisponible en un clic)
- **Messagerie intégrée** pour communiquer avec les locataires
- **Interface de modification intuitive** avec aperçu en temps réel

### 🔍 **Pour les Locataires**
- **Recherche avancée** avec filtres (prix, localisation, nombre de pièces)
- **Carrousel d'images interactif** pour visualiser les propriétés
- **Système de contact direct** avec les propriétaires
- **Interface responsive** optimisée mobile et desktop

### 📸 **Système d'Images Révolutionnaire**
- **Carrousel interactif** avec navigation fluide
- **Bande de miniatures** pour accès rapide
- **10 images suggérées** prêtes à utiliser
- **Support URLs personnalisées** pour vos propres photos
- **Indication photo principale** et compteur d'images
- **Gestion intuitive** avec glisser-déposer visuel

## 🚀 Installation et Configuration

### Prérequis
- Node.js (v16+)
- MySQL (v8+)
- npm ou yarn

### Installation Rapide

```bash
# Cloner le repository
git clone [url-du-repo]
cd Tempo-Home

# Installer les dépendances
npm install

# Configurer la base de données
cp .env.example .env
# Modifier .env avec vos paramètres MySQL

# Initialiser la base de données
npm run db:init

# Démarrer l'application
npm run dev
```

### Configuration Base de Données

Créez un fichier `.env` avec :

```env
# Configuration MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=rental_platform

# JWT Secret
JWT_SECRET=votre_secret_jwt_super_secure

# Port serveur (optionnel)
PORT=3001
```

## 🎯 Comptes de Test

Après `npm run db:init`, utilisez ces comptes :

**Propriétaires :**
- 📧 marie@example.com | 🔑 password
- 📧 pierre@example.com | 🔑 password

**Locataire :**
- 📧 sophie@example.com | 🔑 password

## 📱 Guide d'Utilisation

### Créer une Annonce (Propriétaire)

1. **Connexion** → Dashboard → "Créer une annonce"
2. **Informations de base** : Titre, description, prix ($), localisation
3. **Détails** : Nombre de pièces, superficie
4. **Photos** : 
   - Minimum 6 images recommandé
   - Cliquez sur les images suggérées OU ajoutez vos URLs
   - La première image devient la photo de couverture
5. **Publication** → Votre annonce est en ligne !

### Gestion des Annonces

- **👁️ Voir** : Aperçu public de l'annonce
- **✏️ Modifier** : Édition complète (texte + images)  
- **🗑️ Supprimer** : Suppression définitive
- **✅/❌ Disponibilité** : Basculer disponible/loué

### Navigation Images

- **Flèches ← →** : Navigation entre images
- **Miniatures** : Accès direct à une image
- **Compteur** : Position actuelle (ex: 3/7)
- **Responsive** : Optimisé mobile et desktop

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** pour le design
- **Lucide React** pour les icônes
- **React Router** pour la navigation

### Backend  
- **Node.js** + Express
- **MySQL2** pour la base de données
- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe
- **Express Validator** pour la validation

### DevOps
- **Vite** pour le bundling
- **Nodemon** pour le développement
- **Concurrently** pour lancer frontend + backend

## 📁 Structure du Projet

```
Tempo-Home/
├── src/                    # Frontend React
│   ├── components/         # Composants réutilisables
│   ├── pages/             # Pages principales
│   ├── contexts/          # Contextes React (Auth)
│   └── main.tsx           # Point d'entrée
├── server/                # Backend Node.js
│   ├── routes/            # Routes API
│   ├── middleware/        # Middlewares Express
│   ├── config/            # Configuration DB
│   └── scripts/           # Scripts utilitaires
├── public/                # Assets statiques
└── docs/                  # Documentation
```

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev              # Lance frontend + backend
npm run dev:client       # Frontend uniquement
npm run dev:server       # Backend uniquement

# Base de données
npm run db:init          # Initialise la DB avec données test

# Production
npm run build            # Build de production
npm run preview          # Aperçu du build
npm run server           # Serveur de production
```

## 🎨 Fonctionnalités UI/UX

### Design System
- **Couleurs** : Palette bleu professionnel
- **Typographie** : Inter font, hiérarchie claire
- **Espacement** : Grid système Tailwind
- **Responsive** : Mobile-first design

### Animations
- **Transitions fluides** sur toutes les interactions
- **Hover effects** sur boutons et cartes
- **Loading states** pour les actions asynchrones
- **Carrousel animé** avec navigation douce

### Accessibilité
- **Navigation clavier** complète
- **Contrastes optimisés** pour la lisibilité
- **Labels descriptifs** pour screen readers
- **Focus indicators** visibles

## 🔒 Sécurité

- **Authentification JWT** sécurisée
- **Validation côté client et serveur**
- **Protection des routes** selon les rôles
- **Hachage bcrypt** pour les mots de passe
- **Sanitization** des données utilisateur

## 📊 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Propriétés
- `GET /api/maisons` - Liste des propriétés
- `GET /api/maisons/:id` - Détail d'une propriété  
- `POST /api/maisons` - Créer une propriété
- `PUT /api/maisons/:id` - Modifier une propriété
- `DELETE /api/maisons/:id` - Supprimer une propriété
- `PATCH /api/maisons/:id/availability` - Changer disponibilité

### Messages
- `POST /api/messages` - Envoyer un message
- `GET /api/messages/received` - Messages reçus (propriétaire)
- `GET /api/messages/sent` - Messages envoyés (locataire)

## 🌟 Roadmap

### Version Actuelle (v1.0)
- ✅ CRUD complet des annonces
- ✅ Système d'images avancé
- ✅ Dashboard propriétaire dynamique
- ✅ Messagerie intégrée
- ✅ Recherche et filtres

### Prochaines Versions
- 📅 **v1.1** : Système de favoris
- 🔔 **v1.2** : Notifications en temps réel  
- 💳 **v1.3** : Système de paiement
- 📱 **v1.4** : Application mobile
- 🤖 **v1.5** : Chat bot IA intégré

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📞 Support

- 📧 **Email** : support@tempo-home.com
- 📚 **Documentation** : Voir `/docs` ou `GUIDE_IMAGES.md`
- 🐛 **Issues** : Utilisez l'onglet Issues GitHub

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Tempo/Home** - *Votre maison, notre passion* 🏡✨
