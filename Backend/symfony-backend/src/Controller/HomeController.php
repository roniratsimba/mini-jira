<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'api_root', methods: ['GET'])]
    public function index(): JsonResponse
    {
        return $this->json([
            'status' => 'online',
            'name' => 'Mini-Jira API REST (Symfony 7 + PostgreSQL + JWT)',
            'version' => '1.0.0',
            'endpoints' => [
                'POST /api/register' => 'Inscription utilisateur',
                'POST /api/login_check' => 'Authentification JWT',
                'GET  /api/me' => 'Profil de l\'utilisateur connecté',
                'GET  /api/projects' => 'Liste des projets',
                'POST /api/projects' => 'Créer un projet',
                'GET  /api/tasks/project/{projectId}' => 'Tâches d\'un projet',
                'POST /api/tasks' => 'Créer une tâche',
                'POST /api/sessions/start/{taskId}' => 'Chronométrer une tâche',
                'POST /api/sprint/decompose' => 'Découpage IA de sprint',
                'GET  /api/notifications' => 'Centre de notifications',
            ],
            'client_url' => 'http://localhost:3000',
        ]);
    }
}