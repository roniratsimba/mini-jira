# Mini-Jira Frontend

Application React 19 avec TypeScript pour l'interface utilisateur de Mini-Jira.

## 🚀 Installation

```bash
npm install
```

## 🏃 Scripts disponibles

- `npm run dev` - Lancer le serveur de développement (Express + Vite)
- `npm run build` - Compiler pour la production
- `npm run start` - Lancer le serveur de production
- `npm run preview` - Prévisualiser le build de production
- `npm run lint` - Vérifier les types TypeScript

## ⚙️ Configuration

Les variables d'environnement doivent être configurées dans un fichier `.env` :

```env
GEMINI_API_KEY="votre_cle_api_gemini_ici"
```

Si aucune clé n'est fournie, l'application utilisera un moteur heuristique intelligent pour le Sprint Planner IA.

## 📦 Technologies

- React 19
- TypeScript 5.8
- Vite 6
- Tailwind CSS v4
- Express 4
- @google/genai (Gemini)
- Lucide React
- Motion

## 🔗 Backend API

Le frontend communique avec le backend Symfony 7 situé dans `../Backend/symfony-backend` via des endpoints REST API.

L'application sera accessible sur `http://localhost:3000` lors du développement.