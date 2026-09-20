<?php

namespace App\Controller\Api;

use App\Entity\Project;
use App\Entity\Task;
use App\Entity\User;
use App\Repository\ProjectAssignmentRepository;
use App\Repository\ProjectRepository;
use App\Repository\TaskRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api', name: 'api_tasks_')]
class TaskController extends AbstractController
{
    /**
     * Liste des tâches d'un projet
     */
    #[Route('/projects/{projectId}/tasks', name: 'list_by_project', methods: ['GET'])]
    public function listByProject(
        int $projectId,
        #[CurrentUser] ?User $user,
        ProjectRepository $projectRepo,
        TaskRepository $taskRepo
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $project = $projectRepo->find($projectId);
        if (!$project) {
            return $this->json(['error' => 'Projet introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $tasks = $taskRepo->findByProject($project);
        $data = [];

        foreach ($tasks as $t) {
            $assignees = [];
            foreach ($t->getAssignees() as $u) {
                $assignees[] = [
                    'id' => $u->getId(),
                    'nom' => $u->getNom(),
                    'email' => $u->getEmail(),
                    'avatarUrl' => $u->getAvatarUrl(),
                ];
            }

            $data[] = [
                'id' => $t->getId(),
                'projetId' => $project->getId(),
                'titre' => $t->getTitre(),
                'description' => $t->getDescription(),
                'priorite' => $t->getPriorite(),
                'statut' => $t->getStatut(),
                'tempsEstime' => $t->getTempsEstime(),
                'tempsPasse' => $t->getTotalMinutesPassees(),
                'dateEcheance' => $t->getDateEcheance()?->format('Y-m-d'), 
                'dateCreation' => $t->getDateCreation()?->format(\DateTimeInterface::ATOM),
                'assignes' => $assignees,
            ];
        }

        return $this->json($data);
    }

    /**
     * Création d'une nouvelle tâche dans un projet
     */
    #[Route('/projects/{projectId}/tasks', name: 'create', methods: ['POST'])]
    public function create(
        int $projectId,
        Request $request,
        #[CurrentUser] ?User $user,
        ProjectRepository $projectRepo,
        UserRepository $userRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $project = $projectRepo->find($projectId);
        if (!$project) {
            return $this->json(['error' => 'Projet introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $titre = trim($data['titre'] ?? '');

        if (empty($titre)) {
            return $this->json(['error' => 'Le titre de la tâche est obligatoire.'], Response::HTTP_BAD_REQUEST);
        }

        $task = new Task();
        $task->setProject($project);
        $task->setTitre($titre);
        $task->setDescription($data['description'] ?? null);
        $task->setPriorite($data['priorite'] ?? Task::PRIORITY_MEDIUM);
        $task->setStatut($data['statut'] ?? Task::STATUS_TODO);
        $task->setTempsEstime((int) ($data['tempsEstime'] ?? 0));

        if (!empty($data['dateEcheance'])) {
            try {
                $task->setDateEcheance(new \DateTime($data['dateEcheance']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Format de date d\'échéance invalide.'], Response::HTTP_BAD_REQUEST);
            }
        }
        // Assignations initiales
        if (!empty($data['assigneIds']) && is_array($data['assigneIds'])) {
            foreach ($data['assigneIds'] as $uid) {
                $assignee = $userRepo->find($uid);
                if ($assignee) {
                    $task->addAssignee($assignee);
                }
            }
        }

        $em->persist($task);
        $em->flush();

        return $this->json([
            'id' => $task->getId(),
            'projetId' => $project->getId(),
            'titre' => $task->getTitre(),
            'statut' => $task->getStatut(),
            'priorite' => $task->getPriorite(),
            'tempsEstime' => $task->getTempsEstime(),
            'dateEcheance' => $task->getDateEcheance()?->format('Y-m-d'), 
        ], Response::HTTP_CREATED);
    }

    /**
     * Mise à jour rapide du statut Kanban d'une tâche (drag & drop)
     */
    #[Route('/tasks/{id}/status', name: 'update_status', methods: ['PATCH'])]
    public function updateStatus(
        int $id,
        Request $request,
        #[CurrentUser] ?User $user,
        TaskRepository $taskRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $task = $taskRepo->find($id);
        if (!$task) {
            return $this->json(['error' => 'Tâche introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $statut = $data['statut'] ?? '';

        if (!in_array($statut, [Task::STATUS_TODO, Task::STATUS_IN_PROGRESS, Task::STATUS_DONE], true)) {
            return $this->json(['error' => 'Statut non valide. Valeurs autorisées: A_FAIRE, EN_COURS, TERMINE.'], Response::HTTP_BAD_REQUEST);
        }

        $task->setStatut($statut);
        $em->flush();

        return $this->json([
            'id' => $task->getId(),
            'statut' => $task->getStatut(),
        ]);
    }

    /**
     * Suppression d'une tâche
     */
    #[Route('/tasks/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        #[CurrentUser] ?User $user,
        TaskRepository $taskRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $task = $taskRepo->find($id);
        if (!$task) {
            return $this->json(['error' => 'Tâche introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($task);
        $em->flush();

        return $this->json(['message' => 'Tâche supprimée avec succès.']);
    }
}
