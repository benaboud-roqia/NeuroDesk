# 🧠 Gant Neuro - Système Temporaire

## ✅ Système d'authentification temporaire activé

Votre application **Gant Neuro** fonctionne maintenant **sans backend** ! Vous pouvez tester l'inscription et la connexion immédiatement.

## 🚀 Comment utiliser

### 1. **Utilisateurs de test disponibles**

Vous pouvez vous connecter avec ces comptes de test :

#### 👤 Compte Patient
- **Email** : `patient@test.com`
- **Mot de passe** : `n'importe quoi` (pour la démo)
- **Rôle** : Patient

#### 👨‍⚕️ Compte Médecin
- **Email** : `medecin@test.com`
- **Mot de passe** : `n'importe quoi` (pour la démo)
- **Rôle** : Médecin

### 2. **Créer un nouveau compte**

1. Allez sur la page d'inscription
2. Remplissez le formulaire avec vos informations
3. Cliquez sur "Créer mon compte"
4. Vous serez redirigé vers la page de connexion
5. Connectez-vous avec votre nouveau compte

### 3. **Fonctionnalités disponibles**

#### ✅ **Authentification**
- Inscription de nouveaux utilisateurs
- Connexion avec email/mot de passe
- Gestion des rôles (patient/médecin)
- Déconnexion

#### ✅ **Tableau de bord**
- Affichage des données de test
- Statistiques simulées
- Historique des mesures
- Actions rapides

#### ✅ **Profil Patient**
- Mesures de température, humidité, pression
- Statut normal/anormal
- Statistiques personnelles
- Actions spécifiques patient

#### ✅ **Navigation**
- Menu responsive
- Routes protégées selon les rôles
- Redirection automatique

## 💾 Stockage des données

Les données sont sauvegardées dans le **localStorage** de votre navigateur :
- **Utilisateurs** : `gant_neuro_users`
- **Utilisateur connecté** : `gant_neuro_current_user`
- **Token** : `token`

## 🔧 Données de test

Le système génère automatiquement :
- **10 sessions de test** avec données EMG, température, pression
- **5 mesures patient** avec statuts variés
- **Statistiques simulées** pour les tableaux de bord

## 🎯 Avantages du système temporaire

- ✅ **Fonctionne immédiatement** sans installation
- ✅ **Pas besoin de Node.js** ou backend
- ✅ **Données persistantes** dans le navigateur
- ✅ **Interface complète** et fonctionnelle
- ✅ **Gestion des rôles** opérationnelle
- ✅ **Design responsive** et moderne

## 🔄 Passage au système complet

Quand vous serez prêt à utiliser le vrai backend :

1. **Installez Node.js** depuis https://nodejs.org/
2. **Remplacez les services locaux** par les vrais services API
3. **Configurez MongoDB** ou une autre base de données
4. **Démarrez le backend** avec `npm start`

## 🆘 Support

Si vous rencontrez des problèmes :
- **Vérifiez la console** du navigateur (F12)
- **Videz le localStorage** si nécessaire
- **Rechargez la page** pour réinitialiser

## 🎉 Profitez de votre application !

Votre application **Gant Neuro** est maintenant entièrement fonctionnelle pour la démonstration ! 🧠✨ 