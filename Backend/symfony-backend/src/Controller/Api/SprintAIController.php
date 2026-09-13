<?php

namespace App\Controller\Api;

use App\Entity\Project;
use App\Entity\Task;
use App\Entity\User;
use App\Repository\ProjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/api/sprint', name: 'api_sprint_')]
class SprintAIController extends AbstractController
{
    /**
     * Découpe un objectif de sprint en tâches techniques structurées
     */
    #[Route('/decompose', name: 'decompose', methods: ['POST'])]
    public function decompose(
        Request $request,
        #[CurrentUser] ?User $user,
        ProjectRepository $projectRepo,
        ?HttpClientInterface $httpClient = null
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $goal = trim($data['goal'] ?? '');
        $projectId = (int) ($data['projectId'] ?? 0);

        if (empty($goal)) {
            return $this->json(['error' => "L'objectif du sprint est obligatoire."], Response::HTTP_BAD_REQUEST);
        }

        $project = $projectRepo->find($projectId);
        $projectName = $project ? $project->getNom() : 'Projet';

        $apiKey = $_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY');

        // Si une clé Gemini est disponible, on interroge l'API Gemini
        if (!empty($apiKey) && $httpClient) {
            try {
                $prompt = "Tu es un Scrum Master et Tech Lead expert. Découpe cet objectif de sprint en 4 à 6 tâches techniques précises pour le projet '$projectName'.
Objectif du sprint : '$goal'.
Réponds UNIQUEMENT avec un tableau JSON valide au format :
[
  {
    \"titre\": \"Titre court et clair\",
    \"description\": \"Description technique détaillée avec critères d'acceptation\",
    \"priorite\": \"HAUTE|MOYENNE|BASSE\",
    \"tempsEstime\": 120
  }
]";

                $response = $httpClient->request('POST', "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey", [
                    'json' => [
                        'contents' => [
                            ['parts' => [['text' => $prompt]]]
                        ]
                    ]
                ]);

                $result = $response->toArray();
                $rawText = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

                // Nettoyage Markdown ```json ... ```
                $cleanJson = preg_replace('/^```(?:json)?\s*/i', '', trim($rawText));
                $cleanJson = preg_replace('/\s*```$/i', '', $cleanJson);

                $tasks = json_decode($cleanJson, true);
                if (is_array($tasks) && count($tasks) > 0) {
                    return $this->json(['success' => true, 'tasks' => $tasks]);
                }
            } catch (\Throwable $e) {
                // Fallback heuristique en cas d'indisponibilité de l'API externe
            }
        }

        // Découpage heuristique expert si aucune clé API n'est configurée
        $tasks = [
            [
                'titre' => "Conception technique & schéma BDD : $goal",
                'description' => "Rédiger les spécifications d'API, définir le schéma relationnel et valider les contraintes 3FN pour : $goal.",
                'priorite' => 'HAUTE',
                'tempsEstime' => 120,
            ],
            [
                'titre' => "Implémentation des Endpoints REST & Contrôleurs Symfony",
                'description' => "Créer les routes d'API, les formulaires de validation DTO, et les contrôleurs dédiés avec gestion des codes HTTP.",
                'priorite' => 'HAUTE',
                'tempsEstime' => 180,
            ],
            [
                'titre' => "Intégration Frontend React & Composants d'interface",
                'description' => "Développer les écrans React, connecter les requêtes API via le client REST et gérer les états de chargement / erreurs.",
                'priorite' => 'MOYENNE',
                'tempsEstime' => 240,
            ],
            [
                'titre' => "Tests unitaires, validation QA et sécurisation RBAC",
                'description' => "Vérifier la couverture des tests (PHPUnit / Vitest), auditer les règles de sécurité et valider la conformité avant release.",
                'priorite' => 'MOYENNE',
                'tempsEstime' => 150,
            ]
        ];

        return $this->json(['success' => true, 'tasks' => $tasks]);
    }
}
