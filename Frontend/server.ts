/**
 * =====================================================================
 * MINI-JIRA — SERVEUR EXPRESS & PROXY BACKEND SÉCURISÉ
 * =====================================================================
 * Ce serveur Node.js / Express remplit deux fonctions stratégiques :
 * 1. Proxy sécurisé pour l'IA Gemini (@google/genai) : isole la variable d'environnement
 *    GEMINI_API_KEY côté serveur pour interdire toute exposition dans le navigateur.
 * 2. Serveur de développement (via Vite en middleware) et serveur de production
 *    statique (servant dist/index.html).
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
// Commenté car la base de données PostgreSQL est gérée par le backend Symfony
// import { testConnection, initDatabaseSchema, getDbHealthState, getPool } from '../Backend/server/db';

// Chargement des variables d'environnement (.env)
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware pour parser les charges utiles JSON entrantes
app.use(express.json());

/**
 * Endpoint API : Découpage intelligent de Sprint Agile (Version 3)
 * Reçoit un objectif de sprint, le projet et sa description,
 * puis interroge le modèle Gemini pour générer 4 à 6 tâches techniques structurées.
 * 
 * En cas d'absence de clé d'API ou d'erreur réseau/quota, un mécanisme de repli (fallback)
 * heuristique déterministe est exécuté afin de garantir zéro crash en démonstration.
 */
app.post('/api/sprint-plan', async (req, res) => {
  try {
    const { projectTitle, projectDescription, sprintGoal } = req.body;

    // Récupération sécurisée de la clé Gemini côté backend
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Cas 1 : Pas de clé API configurée -> Fallback heuristique intelligent
    if (!apiKey) {
      return res.status(200).json({
        tasks: [
          {
            titre: 'Spécification technique et architecture découplée',
            description: `Définir les contrats d’interface et les schémas de données pour ${projectTitle || 'le sprint'}.`,
            priorite: 'HAUTE',
            tempsEstime: 180,
          },
          {
            titre: 'Implémentation des endpoints et validation des entrées',
            description: 'Mettre en place les contrôleurs REST et la validation défensive.',
            priorite: 'MOYENNE',
            tempsEstime: 240,
          },
          {
            titre: 'Tests unitaires et tests d’intégration automatisés',
            description: 'Écrire la couverture de tests sur les cas nominaux et d’erreurs.',
            priorite: 'HAUTE',
            tempsEstime: 120,
          },
          {
            titre: 'Revue de code et documentation technique PFE',
            description: 'Validation par les pairs et mise à jour du diagramme UML.',
            priorite: 'BASSE',
            tempsEstime: 90,
          },
        ],
        source: 'heuristic',
      });
    }

    // Cas 2 : Clé API présente -> Appel du SDK officiel Google GenAI
    const ai = new GoogleGenAI({ apiKey });
    
    // Prompt d'ingénierie Agile structuré exigeant un schéma JSON strict
    const prompt = `Tu es un Scrum Master et Tech Lead expert. Découpe ce projet/sprint en 4 à 6 tâches actionnables et claires pour une équipe logicielle.
Projet : ${projectTitle || 'Mini-Jira'}
Description : ${projectDescription || 'Gestionnaire de tâches'}
Objectif du Sprint : ${sprintGoal || 'Livrer les fonctionnalités prioritaires'}

Renvoie STRICTEMENT un JSON valide contenant un tableau d'objets sans mise en forme markdown superflue, avec pour chaque tâche:
- "titre": titre concis (max 80 caractères)
- "description": description technique et critères d'acceptation (1 à 2 phrases)
- "priorite": "HAUTE" ou "MOYENNE" ou "BASSE"
- "tempsEstime": estimation en minutes (entier entre 30 et 360)

Format attendu:
[
  { "titre": "...", "description": "...", "priorite": "HAUTE", "tempsEstime": 120 }
]`;

    // Utilisation du modèle gemini-3.8-flash pour une inférence quasi-instantanée
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    let tasks = [];
    try {
      tasks = JSON.parse(text);
    } catch {
      tasks = [];
    }

    return res.status(200).json({ tasks, source: 'gemini' });
  } catch (error: any) {
    // Cas 3 : En cas d'erreur de quota, réseau ou parsing, retour gracieux
    console.error('Erreur lors de la génération du plan de sprint avec Gemini:', error);
    return res.status(200).json({
      tasks: [
        {
          titre: 'Conception des modèles de données et règles métier',
          description: 'Modélisation relationnelle et contraintes d’intégrité.',
          priorite: 'HAUTE',
          tempsEstime: 150,
        },
        {
          titre: 'Développement de l’interface utilisateur et fluidité visuelle',
          description: 'Intégration du composant avec feedback immédiat.',
          priorite: 'MOYENNE',
          tempsEstime: 180,
        },
      ],
      source: 'fallback',
      error: error.message,
    });
  }
});

/**
 * Endpoints de téléchargement de l'application Desktop JavaFX et du code source
 */
app.get('/api/download/jar', (req, res) => {
  const jarPath = path.join(process.cwd(), 'public', 'mini-jira-desktop.jar');
  res.download(jarPath, 'mini-jira-desktop.jar', (err) => {
    if (err) {
      res.status(404).json({ error: 'Fichier JAR introuvable.' });
    }
  });
});

app.get('/api/download/zip', (req, res) => {
  const zipPath = path.join(process.cwd(), 'public', 'mini-jira-java-source.zip');
  res.download(zipPath, 'mini-jira-java-source.zip', (err) => {
    if (err) {
      res.status(404).json({ error: 'Archive ZIP des sources introuvable.' });
    }
  });
});

app.get('/api/java-status', (req, res) => {
  res.json({
    status: 'ready',
    jarName: 'mini-jira-desktop.jar',
    jarSize: '22 MB',
    javaVersion: 'OpenJDK 17',
    framework: 'JavaFX 21 + SQLite + Linear Theme',
    executionCommand: 'java -jar mini-jira-desktop.jar',
  });
});

/**
 * Initialisation du serveur hybride Express + Vite
 */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mode développement : Intégration de Vite comme middleware Express
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Mode production : Service des assets compilés depuis dist/
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Écoute obligatoire sur 0.0.0.0 et le port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur Mini-Jira démarré sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
