<?php

namespace App\Controller\Api;

use App\Entity\Task;
use App\Entity\User;
use App\Entity\WorkSession;
use App\Repository\TaskRepository;
use App\Repository\WorkSessionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/sessions', name: 'api_sessions_')]
class WorkSessionController extends AbstractController
{
    /**
     * Démarrer une session de chronométrage sur une tâche
     */
    #[Route('/start/{taskId}', name: 'start', methods: ['POST'])]
    public function start(
        int $taskId,
        #[CurrentUser] ?User $user,
        TaskRepository $taskRepo,
        WorkSessionRepository $sessionRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $task = $taskRepo->find($taskId);
        if (!$task) {
            return $this->json(['error' => 'Tâche introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // Si l'utilisateur a déjà une session active, on la clôture automatiquement
        $activeSession = $sessionRepo->findActiveSessionByUser($user);
        if ($activeSession) {
            $activeSession->setFin(new \DateTime());
        }

        $session = new WorkSession();
        $session->setTask($task);
        $session->setUser($user);
        $session->setDebut(new \DateTime());

        // Si la tâche est A_FAIRE, on la passe automatiquement à EN_COURS
        if ($task->getStatut() === Task::STATUS_TODO) {
            $task->setStatut(Task::STATUS_IN_PROGRESS);
        }

        $em->persist($session);
        $em->flush();

        return $this->json([
            'id' => $session->getId(),
            'tacheId' => $task->getId(),
            'tacheTitre' => $task->getTitre(),
            'debut' => $session->getDebut()?->format(\DateTimeInterface::ATOM),
        ], Response::HTTP_CREATED);
    }

    /**
     * Arrêter la session en cours et enregistrer le temps cumulé
     */
    #[Route('/stop', name: 'stop', methods: ['POST'])]
    public function stop(
        #[CurrentUser] ?User $user,
        WorkSessionRepository $sessionRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $activeSession = $sessionRepo->findActiveSessionByUser($user);
        if (!$activeSession) {
            return $this->json(['message' => 'Aucune session active en cours.'], Response::HTTP_OK);
        }

        $activeSession->setFin(new \DateTime());
        $em->flush();

        return $this->json([
            'id' => $activeSession->getId(),
            'dureeMinutes' => $activeSession->getDureeMinutes(),
            'fin' => $activeSession->getFin()?->format(\DateTimeInterface::ATOM),
            'tacheId' => $activeSession->getTask()?->getId(),
            'tempsTotalTache' => $activeSession->getTask()?->getTotalMinutesPassees(),
        ]);
    }

    /**
     * Obtenir la session active de l'utilisateur connecté
     */
    #[Route('/active', name: 'active', methods: ['GET'])]
    public function getActive(
        #[CurrentUser] ?User $user,
        WorkSessionRepository $sessionRepo
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $activeSession = $sessionRepo->findActiveSessionByUser($user);
        if (!$activeSession) {
            return $this->json(null);
        }

        return $this->json([
            'id' => $activeSession->getId(),
            'tacheId' => $activeSession->getTask()?->getId(),
            'tacheTitre' => $activeSession->getTask()?->getTitre(),
            'debut' => $activeSession->getDebut()?->format(\DateTimeInterface::ATOM),
        ]);
    }
}
