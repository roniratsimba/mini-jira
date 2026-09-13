<?php

namespace App\Controller\Api;

use App\Entity\Notification;
use App\Entity\User;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/notifications', name: 'api_notifications_')]
class NotificationController extends AbstractController
{
    /**
     * Liste des notifications du membre connecté
     */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(#[CurrentUser] ?User $user, NotificationRepository $notifRepo): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $notifications = $notifRepo->findByUser($user);
        $data = [];

        foreach ($notifications as $n) {
            $data[] = [
                'id' => $n->getId(),
                'type' => $n->getType(),
                'titre' => $n->getTitre(),
                'message' => $n->getMessage(),
                'lu' => $n->isLu(),
                'dateCreation' => $n->getDateCreation()?->format(\DateTimeInterface::ATOM),
            ];
        }

        return $this->json($data);
    }

    /**
     * Marquer une notification comme lue
     */
    #[Route('/{id}/read', name: 'mark_read', methods: ['PATCH'])]
    public function markRead(int $id, #[CurrentUser] ?User $user, NotificationRepository $notifRepo, EntityManagerInterface $em): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $notification = $notifRepo->find($id);
        if (!$notification || $notification->getUser()?->getId() !== $user->getId()) {
            return $this->json(['error' => 'Notification introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $notification->setLu(true);
        $em->flush();

        return $this->json(['id' => $notification->getId(), 'lu' => true]);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    #[Route('/read-all', name: 'mark_all_read', methods: ['POST'])]
    public function markAllRead(#[CurrentUser] ?User $user, NotificationRepository $notifRepo, EntityManagerInterface $em): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $notifications = $notifRepo->findByUser($user);
        foreach ($notifications as $n) {
            $n->setLu(true);
        }
        $em->flush();

        return $this->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
    }
}
