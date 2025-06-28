# 🏥 NeuroDesktop - Application Médicale Complète

Une application web moderne et complète pour la gestion médicale, développée avec React/TypeScript et Node.js/Express, spécialement conçue pour le contexte médical algérien.

## 🌟 Fonctionnalités Principales

### 👨‍⚕️ **Gestion des Rôles**
- **Médecin** : Dashboard complet avec gestion des patients, ordonnances, rapports
- **Patient** : Interface dédiée pour consulter ses informations
- **Administrateur** : Gestion complète du système

### 📋 **Gestion des Patients**
- ✅ Ajout, modification et suppression de patients
- ✅ Informations complètes (nom, prénom, email, téléphone, adresse, date de naissance)
- ✅ Historique médical et sessions de suivi
- ✅ Statuts de santé (normal, anormal, suspect)
- ✅ Synchronisation automatique entre toutes les interfaces

### 🩺 **Fonctionnalités Médicales**
- 📊 **Mesures en temps réel** : Température, pression, données EMG
- 📝 **Génération d'ordonnances** : Modèles personnalisables, export PDF
- 📄 **Rapports médicaux** : Rapports d'évolution complets, export PDF
- 💊 **Gestion des traitements** : Suivi des médicaments et protocoles

### 💰 **Gestion Financière**
- 💳 **Paiements** : Enregistrement et suivi des paiements
- 📈 **Statistiques** : Graphiques de revenus et dépenses
- 📊 **Export CSV** : Export des données financières

### 📅 **Gestion des Rendez-vous**
- 📅 **Planification** : Création et gestion des rendez-vous
- ⏰ **Notifications** : Rappels automatiques
- 🔍 **Recherche** : Filtrage par patient, médecin, date

### 💬 **Communication et Collaboration**
- 💬 **Messagerie interne** : Communication entre médecins
- 📱 **Intégration WhatsApp** : Envoi direct de messages
- 📁 **Partage de dossiers** : Partage sécurisé avec consentement
- 💭 **Commentaires collaboratifs** : Feedback sur les rapports

### 👥 **Gestion des Médecins**
- 👨‍⚕️ **Profils complets** : Spécialités, coordonnées, adresses
- 🔗 **Collaboration** : Système de partage d'informations
- 📞 **Communication** : Messagerie interne intégrée

## 🛠️ Technologies Utilisées

### **Frontend**
- ⚛️ **React 18** avec TypeScript
- 🎨 **CSS3** avec design moderne et responsive
- 📊 **Chart.js** pour les graphiques
- 📄 **jsPDF** pour la génération de PDF
- 🎯 **React Router** pour la navigation

### **Backend**
- 🟢 **Node.js** avec Express
- 🔐 **JWT** pour l'authentification
- 💾 **localStorage** pour la persistance des données
- 📡 **API RESTful** pour la communication

### **Fonctionnalités Avancées**
- 🔄 **Synchronisation en temps réel** entre les interfaces
- 💾 **Persistance des données** via localStorage
- 📱 **Design responsive** pour tous les appareils
- 🎨 **Interface moderne** avec animations et transitions
- 🔍 **Recherche et filtrage** avancés

## 🚀 Installation et Démarrage

### **Prérequis**
- Node.js (version 16 ou supérieure)
- npm ou yarn

### **Installation**

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/neurodesktop.git
cd neurodesktop
```

2. **Installer les dépendances Frontend**
```bash
cd frontend
npm install
```

3. **Installer les dépendances Backend**
```bash
cd ../backend
npm install
```

4. **Démarrer l'application**

**Frontend :**
```bash
cd frontend
npm start
```
L'application sera accessible sur `http://localhost:3000`

**Backend :**
```bash
cd backend
npm start
```
Le serveur sera accessible sur `http://localhost:5000`

## 📱 Utilisation

### **Première Connexion**
1. Accédez à l'application via `http://localhost:3000`
2. Connectez-vous avec les identifiants par défaut :
   - **Médecin** : `medecin@neurodesktop.dz` / `password123`
   - **Patient** : `patient@neurodesktop.dz` / `password123`
   - **Admin** : `admin@neurodesktop.dz` / `password123`

### **Gestion des Données**
- **Ajout de patients** : Utilisez le bouton "Ajouter un patient" dans le dashboard
- **Gestion des médecins** : Accédez à la page "Médecins"
- **Rendez-vous** : Utilisez la page "Rendez-vous"
- **Communication** : Accédez à "Communication et collaboration"

### **Fonctionnalités Avancées**
- **Nettoyage des données** : Bouton "Nettoyer toutes les données" pour repartir de zéro
- **Export PDF** : Génération automatique d'ordonnances et rapports
- **Intégration WhatsApp** : Envoi direct de messages aux patients

## 🏗️ Architecture du Projet

```
neurodesktop/
├── frontend/                 # Application React/TypeScript
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── pages/           # Pages principales
│   │   ├── hooks/           # Hooks personnalisés
│   │   ├── services/        # Services API
│   │   ├── types/           # Types TypeScript
│   │   └── utils/           # Utilitaires
│   └── public/              # Assets statiques
├── backend/                  # Serveur Node.js/Express
│   ├── src/
│   │   ├── controllers/     # Contrôleurs
│   │   ├── models/          # Modèles de données
│   │   ├── routes/          # Routes API
│   │   └── middlewares/     # Middlewares
│   └── server.js            # Point d'entrée
└── README.md               # Documentation
```

## 🎨 Interface Utilisateur

### **Design Moderne**
- 🎨 Interface épurée et professionnelle
- 🌈 Palette de couleurs médicales (bleus, verts, gris)
- 📱 Design responsive pour mobile, tablette et desktop
- ⚡ Animations fluides et transitions

### **Expérience Utilisateur**
- 🎯 Navigation intuitive
- 🔍 Recherche et filtrage rapides
- 📊 Visualisations de données claires
- 💡 Messages d'aide contextuels

## 🔒 Sécurité

- 🔐 Authentification JWT sécurisée
- 🛡️ Validation des données côté client et serveur
- 🔒 Protection contre les injections
- 📝 Logs d'activité complets

## 📊 Fonctionnalités de Données

### **Persistance**
- 💾 Stockage local sécurisé
- 🔄 Synchronisation automatique
- 📤 Export des données (CSV, PDF)
- 🔄 Sauvegarde automatique

### **Statistiques**
- 📈 Graphiques de performance
- 📊 Analyses médicales
- 💰 Rapports financiers
- 📅 Suivi des rendez-vous

## 🌍 Contexte Algérien

L'application est spécialement adaptée au contexte médical algérien :
- 🇩🇿 Interface en français
- 📞 Numéros de téléphone algériens
- 🏥 Adresses et établissements locaux
- 💰 Devise en Dinars Algériens (DA)
- 📱 Intégration WhatsApp populaire

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- 📧 Email : support@neurodesktop.dz
- 🐛 Issues : [GitHub Issues](https://github.com/votre-username/neurodesktop/issues)
- 📖 Documentation : [Wiki du projet](https://github.com/votre-username/neurodesktop/wiki)

## 🙏 Remerciements

- 🏥 Communauté médicale algérienne
- 💻 Développeurs open source
- 🎨 Designers et UX experts
- 📚 Documentation et tutoriels

---

**NeuroDesktop** - Révolutionner la gestion médicale en Algérie 🏥✨

*Développé avec ❤️ pour la communauté médicale algérienne* 