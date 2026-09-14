<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api', name: 'api_')]
class AuthController extends AbstractController
{
    /**
     * Connexion utilisateur (JWT)
     */
    #[Route('/login_check', name: 'login_check', methods: ['POST'])]
    public function login(
        Request $request,
        UserRepository $userRepo,
        UserPasswordHasherInterface $hasher,
        JWTTokenManagerInterface $jwtManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];
        
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            return $this->json(['error' => 'Veuillez fournir email et mot de passe.'], Response::HTTP_BAD_REQUEST);
        }

        $user = $userRepo->findOneBy(['email' => $email]);
        
        if (!$user || !$hasher->isPasswordValid($user, $password)) {
            return $this->json(['error' => 'Identifiants invalides.'], Response::HTTP_UNAUTHORIZED);
        }

        $token = $jwtManager->create($user);

        return $this->json([
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'nom' => $user->getNom(),
                'avatarUrl' => $user->getAvatarUrl(),
                'dateCreation' => $user->getDateCreation()?->format(\DateTimeInterface::ATOM),
            ]
        ]);
    }

    /**
     * Inscription d'un nouvel utilisateur
     */
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher,
        UserRepository $userRepo,
        JWTTokenManagerInterface $jwtManager,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];

        $email = trim($data['email'] ?? '');
        $nom = trim($data['nom'] ?? '');
        $password = $data['motDePasse'] ?? $data['password'] ?? '';

        if (empty($email) || empty($nom) || empty($password)) {
            return $this->json(['error' => 'Veuillez remplir tous les champs obligatoires (nom, email, mot de passe).'], Response::HTTP_BAD_REQUEST);
        }

        if (strlen($password) < 6) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins 6 caractères.'], Response::HTTP_BAD_REQUEST);
        }

        if ($userRepo->findByEmail($email)) {
            return $this->json(['error' => 'Un compte existe déjà avec cette adresse email.'], Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setNom($nom);
        $user->setPassword($hasher->hashPassword($user, $password));
        $user->setAvatarUrl($data['avatarUrl'] ?? null);

        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            return $this->json(['error' => (string) $errors[0]->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $em->persist($user);
        $em->flush();

        $token = $jwtManager->create($user);

        return $this->json([
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'nom' => $user->getNom(),
                'avatarUrl' => $user->getAvatarUrl(),
                'dateCreation' => $user->getDateCreation()?->format(\DateTimeInterface::ATOM),
            ]
        ], Response::HTTP_CREATED);
    }

    /**
     * Récupère le profil de l'utilisateur connecté via JWT
     */
    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(#[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'nom' => $user->getNom(),
            'avatarUrl' => $user->getAvatarUrl(),
            'dateCreation' => $user->getDateCreation()?->format(\DateTimeInterface::ATOM),
            'roles' => $user->getRoles(),
        ]);
    }

    /**
     * Mise à jour du profil utilisateur (nom, avatar)
     */
    #[Route('/profile', name: 'update_profile', methods: ['PUT'])]
    public function updateProfile(
        Request $request,
        #[CurrentUser] ?User $user,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (isset($data['nom']) && !empty(trim($data['nom']))) {
            $user->setNom(trim($data['nom']));
        }

        if (array_key_exists('avatarUrl', $data)) {
            $user->setAvatarUrl($data['avatarUrl']);
        }

        $em->flush();

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'nom' => $user->getNom(),
            'avatarUrl' => $user->getAvatarUrl(),
        ]);
    }

    /**
     * Modification du mot de passe avec validation de l'ancien
     */
    #[Route('/change-password', name: 'change_password', methods: ['POST'])]
    public function changePassword(
        Request $request,
        #[CurrentUser] ?User $user,
        UserPasswordHasherInterface $hasher,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $currentPassword = $data['currentPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        if (!$hasher->isPasswordValid($user, $currentPassword)) {
            return $this->json(['error' => 'Le mot de passe actuel est incorrect.'], Response::HTTP_BAD_REQUEST);
        }

        if (strlen($newPassword) < 6) {
            return $this->json(['error' => 'Le nouveau mot de passe doit comporter au moins 6 caractères.'], Response::HTTP_BAD_REQUEST);
        }

        $user->setPassword($hasher->hashPassword($user, $newPassword));
        $em->flush();

        return $this->json(['message' => 'Mot de passe modifié avec succès.']);
    }

    /**
     * Suppression définitive du compte utilisateur (RGPD)
     */
    #[Route('/account', name: 'delete_account', methods: ['DELETE'])]
    public function deleteAccount(
        Request $request,
        #[CurrentUser] ?User $user,
        UserPasswordHasherInterface $hasher,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $password = $data['password'] ?? '';

        if (!$hasher->isPasswordValid($user, $password)) {
            return $this->json(['error' => 'Le mot de passe saisi est incorrect. Confirmation requise pour supprimer le compte.'], Response::HTTP_FORBIDDEN);
        }

        $em->remove($user);
        $em->flush();

        return $this->json(['message' => 'Compte supprimé définitivement avec succès.']);
    }
}
