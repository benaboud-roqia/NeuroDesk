# 🤝 Guide de Contribution - NeuroDesktop

Merci de votre intérêt pour contribuer à NeuroDesktop ! Ce document vous guidera à travers le processus de contribution.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Configuration de l'Environnement](#configuration-de-lenvironnement)
- [Standards de Code](#standards-de-code)
- [Processus de Pull Request](#processus-de-pull-request)
- [Rapport de Bugs](#rapport-de-bugs)
- [Demande de Fonctionnalités](#demande-de-fonctionnalités)

## 📜 Code de Conduite

### Notre Engagement

En participant à ce projet, vous acceptez de respecter notre code de conduite. Nous nous engageons à maintenir un environnement ouvert et accueillant pour tous.

### Nos Standards

- Utiliser un langage accueillant et inclusif
- Respecter les différents points de vue et expériences
- Accepter gracieusement les critiques constructives
- Se concentrer sur ce qui est le mieux pour la communauté
- Faire preuve d'empathie envers les autres membres

## 🚀 Comment Contribuer

### Types de Contributions

Nous accueillons plusieurs types de contributions :

- 🐛 **Rapports de bugs**
- 💡 **Demandes de fonctionnalités**
- 📝 **Amélioration de la documentation**
- 🎨 **Améliorations de l'interface utilisateur**
- ⚡ **Optimisations de performance**
- 🧪 **Tests et corrections**

### Avant de Commencer

1. **Vérifiez les issues existantes** pour éviter les doublons
2. **Lisez la documentation** du projet
3. **Testez l'application** localement
4. **Familiarisez-vous** avec l'architecture

## ⚙️ Configuration de l'Environnement

### Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn
- Git

### Installation

1. **Fork le repository**
```bash
git clone https://github.com/votre-username/neurodesktop.git
cd neurodesktop
```

2. **Installer les dépendances**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Démarrer en mode développement**
```bash
# Frontend (dans un terminal)
cd frontend
npm start

# Backend (dans un autre terminal)
cd backend
npm run dev
```

## 📏 Standards de Code

### JavaScript/TypeScript

- Utilisez **TypeScript** pour tous les nouveaux fichiers
- Respectez les conventions de nommage :
  - `camelCase` pour les variables et fonctions
  - `PascalCase` pour les composants React
  - `UPPER_SNAKE_CASE` pour les constantes
- Limitez la longueur des lignes à 80 caractères
- Ajoutez des commentaires pour le code complexe

### React

- Utilisez les **hooks** plutôt que les classes
- Préférez les **composants fonctionnels**
- Utilisez **PropTypes** ou **TypeScript** pour la validation
- Suivez les conventions de nommage React

### CSS

- Utilisez des **noms de classes descriptifs**
- Évitez les sélecteurs trop spécifiques
- Organisez le CSS par composant
- Utilisez des variables CSS pour les couleurs et dimensions

### Git

- Utilisez des **messages de commit descriptifs**
- Suivez le format : `type(scope): description`
- Exemples :
  - `feat(patients): ajouter fonctionnalité de recherche`
  - `fix(auth): corriger problème de connexion`
  - `docs(readme): mettre à jour la documentation`

## 🔄 Processus de Pull Request

### 1. Préparation

- Créez une branche depuis `main`
- Nommez votre branche : `feature/nom-de-la-fonctionnalite` ou `fix/nom-du-bug`
- Assurez-vous que votre code fonctionne localement

### 2. Développement

- Écrivez du code propre et bien documenté
- Ajoutez des tests si applicable
- Mettez à jour la documentation si nécessaire
- Respectez les standards de code

### 3. Tests

- Testez votre code sur différents navigateurs
- Vérifiez que les tests existants passent
- Ajoutez de nouveaux tests si nécessaire
- Testez les fonctionnalités liées

### 4. Soumission

- Créez une Pull Request
- Remplissez le template de PR
- Décrivez clairement les changements
- Ajoutez des captures d'écran si applicable

### Template de Pull Request

```markdown
## Description
Brève description des changements apportés.

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Amélioration de la documentation
- [ ] Refactoring
- [ ] Test

## Tests
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Testé manuellement

## Captures d'écran (si applicable)
Ajoutez des captures d'écran pour les changements UI.

## Checklist
- [ ] Mon code suit les standards du projet
- [ ] J'ai testé mon code
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de nouveaux warnings
```

## 🐛 Rapport de Bugs

### Avant de Signaler un Bug

1. **Vérifiez les issues existantes**
2. **Testez sur la dernière version**
3. **Vérifiez la documentation**

### Template de Rapport de Bug

```markdown
## Description du Bug
Description claire et concise du bug.

## Étapes pour Reproduire
1. Aller à '...'
2. Cliquer sur '...'
3. Faire défiler jusqu'à '...'
4. Voir l'erreur

## Comportement Attendu
Description de ce qui devrait se passer.

## Comportement Actuel
Description de ce qui se passe actuellement.

## Captures d'écran
Ajoutez des captures d'écran si applicable.

## Environnement
- OS: [ex: Windows 10, macOS, Linux]
- Navigateur: [ex: Chrome, Firefox, Safari]
- Version: [ex: 22]

## Informations Supplémentaires
Toute autre information pertinente.
```

## 💡 Demande de Fonctionnalités

### Avant de Demander une Fonctionnalité

1. **Vérifiez les issues existantes**
2. **Assurez-vous que c'est pertinent**
3. **Préparez une description détaillée**

### Template de Demande de Fonctionnalité

```markdown
## Problème
Description claire du problème que cette fonctionnalité résoudrait.

## Solution Proposée
Description claire de la solution souhaitée.

## Alternatives Considérées
Description des alternatives considérées.

## Contexte Supplémentaire
Toute autre information pertinente.
```

## 🏷️ Labels et Milestones

### Labels Utilisés

- `bug` : Problème à corriger
- `enhancement` : Amélioration de fonctionnalité
- `documentation` : Amélioration de la documentation
- `good first issue` : Bon pour les débutants
- `help wanted` : Besoin d'aide
- `priority: high` : Priorité élevée
- `priority: low` : Priorité faible

## 📞 Support

Si vous avez des questions :

- 📧 **Email** : support@neurodesktop.dz
- 💬 **Discussions** : [GitHub Discussions](https://github.com/votre-username/neurodesktop/discussions)
- 🐛 **Issues** : [GitHub Issues](https://github.com/votre-username/neurodesktop/issues)

## 🙏 Remerciements

Merci à tous les contributeurs qui rendent NeuroDesktop meilleur chaque jour !

---

**NeuroDesktop** - Ensemble pour une meilleure gestion médicale 🏥✨ 