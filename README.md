# PayrollPro - Système de Gestion de Paie

Un système complet de gestion de paie moderne construit avec Node.js, Express, React et Prisma.

## 📋 Table des Matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [API Documentation](#-api-documentation)
- [Guide Utilisateur](#-guide-utilisateur)
- [Architecture](#-architecture)
- [Déploiement](#-déploiement)

## 🎯 À propos

PayrollPro est une solution complète de gestion de paie conçue pour les entreprises. Elle permet de gérer les employés, les cycles de paie, les bulletins de salaire et les paiements de manière efficace et sécurisée.

## ✨ Fonctionnalités

### Gestion des Utilisateurs
- Authentification JWT
- Rôles multiples (Super Admin, Admin, Caissier)
- Gestion des entreprises

### Gestion des Employés
- CRUD complet des employés
- Filtres avancés (statut, poste, type de contrat)
- Activation/désactivation des employés
- Export PDF des listes d'émargement

### Gestion des Cycles de Paie
- Création de cycles de paie (mensuel, hebdomadaire, journalier)
- Workflow d'approbation et clôture
- Calcul automatique des salaires

### Gestion des Bulletins de Paie
- Génération automatique des bulletins
- Calcul des déductions et avantages
- Export PDF individuel et en lot

### Gestion des Paiements
- Enregistrement des paiements
- Support multiple modes de paiement
- Génération de reçus PDF
- Suivi des paiements partiels

### Tableaux de Bord
- KPIs en temps réel
- Graphiques d'évolution de la masse salariale
- Tableaux des prochains paiements
- Vues spécialisées par rôle

## 🚀 Installation

### Prérequis

- Node.js (version 18 ou supérieure)
- npm
- MySQL
- Git

### Étapes d'installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd gessalaire
   ```

2. **Installation des dépendances backend**
   ```bash
   cd backend
   npm install
   ```

3. **Installation des dépendances frontend**
   ```bash
   cd ../frontend
   npm install
   cd ..
   ```

4. **Configuration de la base de données**
   ```bash
   cd backend
   # Copier le fichier .env.example vers .env et configurer
   cp .env.example .env
   ```

5. **Configuration des variables d'environnement**
   Éditer le fichier `backend/.env` :
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/payrollpro"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```

6. **Migration de la base de données**
   ```bash
   npm run migrate
   npm run seed
   ```

7. **Démarrage du serveur backend**
   ```bash
   npm run dev:watch
   ```

8. **Démarrage du frontend (dans un nouveau terminal)**
   ```bash
   cd ../frontend
   npm run dev
   ```

L'application sera accessible sur :
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion à la base de données | - |
| `JWT_SECRET` | Clé secrète pour JWT | "secret" |
| `PORT` | Port du serveur backend | 3000 |
| `NODE_ENV` | Environnement (development/production) | development |

### Base de données

Le projet utilise Prisma avec PostgreSQL. Le schéma est défini dans `backend/prisma/schema.prisma`.

## 📖 Utilisation

### Démarrage rapide

1. S'assurer que la base de données est démarrée
2. Lancer le backend: `cd backend && npm run dev:watch`
3. Lancer le frontend: `cd frontend && npm run dev`
4. Accéder à http://localhost:5173

### Comptes de test

Après le seeding, les comptes suivants sont disponibles :
- **Super Admin**: admin@example.com / password123
- **Admin**: admin@company.com / password123
- **Caissier**: cashier@company.com / password123

## 📚 API Documentation

### Authentification

Toutes les requêtes API (sauf login/register) nécessitent un token JWT dans l'en-tête Authorization.

```
Authorization: Bearer <token>
```

### Endpoints Principaux

#### Authentification
```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

#### Utilisateurs
```
GET    /api/users
POST   /api/users/inscription
PUT    /api/users/:id
DELETE /api/users/:id
```

#### Employés
```
GET    /api/employees
POST   /api/employees
GET    /api/employees/:id
PUT    /api/employees/:id
DELETE /api/employees/:id
PATCH  /api/employees/:id/toggle-active
GET    /api/employees/attendance/pdf
```

#### Cycles de Paie
```
GET    /api/payruns
POST   /api/payruns
GET    /api/payruns/:id
PUT    /api/payruns/:id
DELETE /api/payruns/:id
PATCH  /api/payruns/:id/approve
PATCH  /api/payruns/:id/close
```

#### Bulletins de Paie
```
GET    /api/payslips
POST   /api/payslips
GET    /api/payslips/:id
PUT    /api/payslips/:id
DELETE /api/payslips/:id
GET    /api/payslips/:id/pdf
GET    /api/payslips/bulk/pdf
```

#### Paiements
```
GET    /api/payments
POST   /api/payments
GET    /api/payments/:id
PUT    /api/payments/:id
DELETE /api/payments/:id
GET    /api/payments/:id/receipt
GET    /api/payments/list/pdf
```

#### Tableaux de Bord
```
GET /api/dashboard/data
GET /api/dashboard/kpis
GET /api/dashboard/payroll-evolution
GET /api/dashboard/upcoming-payments
GET /api/dashboard/global-stats
```

#### Entreprises
```
GET    /api/entreprises
POST   /api/entreprises
GET    /api/entreprises/:id
PUT    /api/entreprises/:id
DELETE /api/entreprises/:id
```

### Exemples d'utilisation

#### Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "motDePasse": "password123"}'
```

#### Créer un employé
```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nomComplet": "John Doe",
    "poste": "Développeur",
    "typeContrat": "FIXE",
    "tauxSalaire": 50000,
    "entrepriseId": 1
  }'
```

## 👥 Guide Utilisateur

### Premiers pas

1. **Connexion**: Utilisez vos identifiants pour vous connecter
2. **Tableau de bord**: Vue d'ensemble avec KPIs et graphiques
3. **Navigation**: Utilisez la sidebar pour accéder aux différentes sections

### Gestion des Employés

#### Ajouter un employé
1. Aller dans "Employés" > "Ajouter un employé"
2. Remplir le formulaire avec les informations requises
3. Sauvegarder

#### Filtrer les employés
- Utiliser les filtres par statut, poste, type de contrat
- La recherche se fait en temps réel

#### Activer/Désactiver un employé
- Cliquer sur le statut dans la liste des employés
- Confirmer l'action

### Gestion des Cycles de Paie

#### Créer un cycle de paie
1. Aller dans "Cycles de Paie"
2. Cliquer sur "Créer un cycle de paie"
3. Sélectionner la période et le type
4. Approuver puis clôturer le cycle

### Gestion des Paiements

#### Enregistrer un paiement
1. Aller dans "Paiements"
2. Sélectionner un bulletin
3. Cliquer sur "Enregistrer un paiement"
4. Choisir le mode de paiement et le montant
5. Télécharger le reçu si nécessaire

### Exports PDF

#### Documents disponibles
- Bulletins de paie individuels
- Bulletins en lot par cycle
- Listes d'émargement
- Reçus de paiement
- Listes de paiements par période

### Rôles et Permissions

#### Super Admin
- Gestion de toutes les entreprises
- Accès à tous les utilisateurs
- Statistiques globales

#### Admin
- Gestion des employés de son entreprise
- Gestion des cycles de paie
- Accès limité aux paiements

#### Caissier
- Consultation des employés
- Enregistrement des paiements
- Accès en lecture seule aux bulletins

## 🏗️ Architecture

### Structure du projet

```
gessalaire/
├── backend/
│   ├── src/
│   │   ├── controller/     # Logique métier
│   │   ├── middleware/     # Middleware Express
│   │   ├── repository/     # Accès données
│   │   ├── route/         # Définition des routes
│   │   ├── service/       # Services métier
│   │   └── validation/    # Validation des données
│   ├── prisma/            # Schéma base de données
│   └── uploads/           # Fichiers uploadés
├── frontend/
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── context/       # Context React
│   │   ├── pages/         # Pages de l'application
│   │   └── validation/    # Validation frontend
│   └── public/            # Assets statiques
```

### Technologies utilisées

#### Backend
- **Node.js** avec **Express.js**
- **TypeScript** pour le typage
- **Prisma** ORM
- **JWT** pour l'authentification
- **PDFKit** pour la génération de PDF
- **bcryptjs** pour le hashage des mots de passe

#### Frontend
- **React** avec **Vite**
- **Tailwind CSS** pour le styling
- **Recharts** pour les graphiques
- **Axios** pour les requêtes HTTP
- **React Router** pour la navigation

#### Base de données
- **PostgreSQL** ou **MySQL**
- **Prisma Migrate** pour les migrations

## 🚀 Déploiement

### Préparation pour la production

1. **Build du frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build du backend**
   ```bash
   cd ../backend
   npm run build
   ```

3. **Configuration production**
   - Variables d'environnement
   - Base de données production
   - Serveur web (nginx/apache)

### Déploiement recommandé

#### Avec Docker
```dockerfile
# Dockerfile pour le backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### Services cloud
- **Frontend**: Vercel, Netlify
- **Backend**: Heroku, Railway, Render
- **Base de données**: PostgreSQL sur Supabase, PlanetScale

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**PayrollPro** - Simplifiez la gestion de votre paie ! 💼