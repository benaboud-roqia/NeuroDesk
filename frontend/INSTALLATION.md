# Guide d'Installation - Gant Neuro Frontend

## Problème : npm non reconnu dans PowerShell

Si vous obtenez l'erreur `'npm' is not recognized`, cela signifie que Node.js n'est pas installé ou pas dans le PATH.

## Solutions

### Solution 1 : Installer Node.js (Recommandée)

1. **Téléchargez Node.js** depuis le site officiel :
   - Allez sur https://nodejs.org/
   - Téléchargez la version **LTS** (Long Term Support)
   - Choisissez la version Windows (x64)

2. **Installez Node.js** :
   - Exécutez le fichier téléchargé
   - Suivez les instructions d'installation
   - **Important** : Cochez la case "Add to PATH" pendant l'installation

3. **Redémarrez PowerShell** :
   - Fermez PowerShell
   - Rouvrez PowerShell
   - Vérifiez l'installation : `node --version` et `npm --version`

### Solution 2 : Utiliser l'invite de commandes (cmd)

Si PowerShell pose problème, utilisez cmd :
1. Appuyez sur `Windows + R`
2. Tapez `cmd` et appuyez sur Entrée
3. Naviguez vers votre projet : `cd C:\Users\Roqia\OneDrive\Bureau\desktop-back\frontend`
4. Exécutez : `npm install`

### Solution 3 : Utiliser VS Code Terminal

1. Ouvrez VS Code
2. Ouvrez le dossier `desktop-back`
3. Appuyez sur `Ctrl + `` (backtick) pour ouvrir le terminal
4. Exécutez les commandes npm

### Solution 4 : Utiliser le chemin complet de npm

Si Node.js est installé mais pas dans le PATH :
```powershell
C:\Program Files\nodejs\npm install
```

## Installation des dépendances

Une fois Node.js installé, exécutez dans le dossier `frontend` :

```bash
npm install
```

## Démarrage de l'application

```bash
npm start
```

L'application sera accessible sur http://localhost:3000

## Dépendances installées

- React 18.2.0
- React Router DOM 6.3.0
- Axios 1.4.0
- Chart.js 4.3.0
- React Chart.js 2 5.2.0
- Bootstrap 5.3.0
- React Bootstrap 2.8.0
- React Icons 4.10.1
- Date-fns 2.30.0

## Structure du projet

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Layout.css
│   │   ├── ProtectedRoute.tsx
│   │   └── ProtectedRoute.css
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── LoginPage.css
│   │   ├── RegisterPage.tsx
│   │   ├── RegisterPage.css
│   │   ├── DashboardPage.tsx
│   │   ├── DashboardPage.css
│   │   ├── PatientDashboard.tsx
│   │   └── PatientDashboard.css
│   ├── hooks/
│   │   └── useAuth.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
└── README.md
```

## Fonctionnalités

- ✅ Authentification JWT
- ✅ Gestion des rôles (patient, médecin, admin)
- ✅ Pages de connexion et inscription
- ✅ Tableau de bord principal
- ✅ Tableau de bord patient
- ✅ Design responsive
- ✅ Navigation protégée
- ✅ Styles CSS personnalisés (sans Bootstrap)

## Support

Si vous rencontrez des problèmes :
1. Vérifiez que Node.js est bien installé : `node --version`
2. Vérifiez que npm est disponible : `npm --version`
3. Redémarrez votre terminal/IDE
4. Utilisez cmd au lieu de PowerShell si nécessaire 