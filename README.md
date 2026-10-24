#  Gestion de Contacts — Application Full-Stack

Application web complète de gestion de contacts, développée dans le cadre d'un projet universitaire de **Licence 3 Informatique de Gestion**.

##  Fonctionnalités

-  **Authentification sécurisée** (inscription, connexion, déconnexion par token)
-  **Tableau de bord** avec statistiques en temps réel
-  **CRUD complet** des contacts (créer, lire, modifier, supprimer)
-  **Recherche multi-critères** (nom, email, entreprise, ville, téléphone)
-  **Filtres** par catégorie, favoris, corbeille
-  **Tri** par nom, date de création, ville
-  **Pagination** (10 contacts par page)
-  **Favoris** pour marquer les contacts importants
-  **Corbeille** avec restauration et suppression définitive
-  **Catégories colorées** pour classer les contacts
-  **Import / Export CSV** avec détection de doublons
-  **Photo de contact** (upload)
-  **Profil utilisateur** modifiable
-  **Interface responsive** et moderne

##  Stack technique

### Backend
- **Python 3.14**
- **Django 5** — Framework web
- **Django REST Framework** — API REST
- **SQLite** — Base de données
- **Token Authentication** — Sécurité

### Frontend
- **React 19** + **TypeScript**
- **Vite** — Build tool ultra-rapide
- **React Router v6** — Routage
- **Axios** — Client HTTP
- **Lucide React** — Icônes
- **CSS3** — Styles

##  Structure du projet

gestion-contacts/
├── backend/ # API Django
│ ├── config/ # Configuration du projet
│ ├── accounts/ # App principale (modèles, vues, tests)
│ ├── media/ # Photos uploadées
│ ├── db.sqlite3 # Base de données
│ └── requirements.txt
│
├── frontend/ # App React
│ ├── src/
│ │ ├── api/ # Services Axios
│ │ ├── components/ # Composants réutilisables
│ │ ├── context/ # AuthContext
│ │ ├── hooks/ # Hooks personnalisés
│ │ ├── pages/ # Pages de l'app
│ │ └── types/ # Types TypeScript
│ └── package.json
│
└── README.md


## Installation et démarrage en local

### Prérequis
- Python 3.11+
- Node.js 20+

### 1. Backend (Django)

```cmd
cd backend
python -m venv venv
venv\Scripts\Activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver


### 2. Frontend (React)
npm install
npm run dev