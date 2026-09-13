<?php

namespace App\Controller\Api;

use App\Entity\Project;
use App\Entity\ProjectAssignment;
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

#[Route('/api/projects', name: 'api_projects_')]
class ProjectController extends AbstractController
{
    /**
     * Liste des projets du membre connecté
     */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(#[CurrentUser] ?User $user, ProjectRepository $projectRepo): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $projects = $projectRepo->findByUser($user);
        $data = [];

        foreach ($projects as $p) {
            $myAssignment = null;
            $members = [];
            foreach ($p->getAffectations() as $aff) {
                $u = $aff->getUser();
                if ($u->getId() === $user->getId()) {
                    $myAssignment = $aff;
                }
                $members[] = [
                    'id' => $u->getId(),
                    'nom' => $u->getNom(),
                    'email' => $u->getEmail(),
                    'avatarUrl' => $u->getAvatarUrl(),
                    'role' => $aff->getRole(),
                ];
            }

            $tasks = $p->getTasks();
            $totalTasks = count($tasks);
            $doneTasks = 0;
            foreach ($tasks as $t) {
                if ($t->getStatut() === 'TERMINE') {
                    $doneTasks++;
                }
            }

            $data[] = [
                'id' => $p->getId(),
                'code' => $p->getCode(),
                'nom' => $p->getNom(),
                'description' => $p->getDescription(),
                'dateDebut' => $p->getDateDebut()?->format('Y-m-d'),
                'dateFin' => $p->getDateFin()?->format('Y-m-d'),
                'dateCreation' => $p->getDateCreation()?->format(\DateTimeInterface::ATOM),
                'currentUserRole' => $myAssignment ? $myAssignment->getRole() : 'MEMBRE',
                'membresCount' => count($members),
                'membres' => $members,
                'totalTasks' => $totalTasks,
                'doneTasks' => $doneTasks,
            ];
        }

        return $this->json($data);
    }

    /**
     * Création d'un nouveau projet
     */
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(
        Request $request,
        #[CurrentUser] ?User $user,
        EntityManagerInterface $em,
        ProjectRepository $projectRepo
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $code = strtoupper(trim($data['code'] ?? ''));
        $nom = trim($data['nom'] ?? '');

        if (empty($code) || empty($nom)) {
            return $this->json(['error' => 'Le code et le nom du projet sont obligatoires.'], Response::HTTP_BAD_REQUEST);
        }

        if ($projectRepo->findByCode($code)) {
            return $this->json(['error' => "Le code projet '$code' est déjà utilisé."], Response::HTTP_CONFLICT);
        }

        $project = new Project();
        $project->setCode($code);
        $project->setNom($nom);
        $project->setDescription($data['description'] ?? null);

        if (!empty($data['dateDebut'])) {
            $project->setDateDebut(new \DateTime($data['dateDebut']));
        }
        if (!empty($data['dateFin'])) {
            $project->setDateFin(new \DateTime($data['dateFin']));
        }

        // Créateur devient automatiquement ADMIN
        $assignment = new ProjectAssignment();
        $assignment->setProject($project);
        $assignment->setUser($user);
        $assignment->setRole(ProjectAssignment::ROLE_ADMIN);

        $em->persist($project);
        $em->persist($assignment);
        $em->flush();

        return $this->json([
            'id' => $project->getId(),
            'code' => $project->getCode(),
            'nom' => $project->getNom(),
            'description' => $project->getDescription(),
            'currentUserRole' => ProjectAssignment::ROLE_ADMIN,
        ], Response::HTTP_CREATED);
    }

    /**
     * Rejoindre un projet via son code unique
     */
    #[Route('/join', name: 'join', methods: ['POST'])]
    public function join(
        Request $request,
        #[CurrentUser] ?User $user,
        ProjectRepository $projectRepo,
        ProjectAssignmentRepository $assignmentRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $code = strtoupper(trim($data['code'] ?? ''));

        if (empty($code)) {
            return $this->json(['error' => 'Le code du projet est requis.'], Response::HTTP_BAD_REQUEST);
        }

        $project = $projectRepo->findByCode($code);
        if (!$project) {
            return $this->json(['error' => "Aucun projet trouvé avec le code '$code'."], Response::HTTP_NOT_FOUND);
        }

        $existing = $assignmentRepo->findOneByProjectAndUser($project, $user);
        if ($existing) {
            return $this->json(['error' => 'Vous êtes déjà membre de ce projet.'], Response::HTTP_CONFLICT);
        }

        $assignment = new ProjectAssignment();
        $assignment->setProject($project);
        $assignment->setUser($user);
        $assignment->setRole(ProjectAssignment::ROLE_MEMBER);

        $em->persist($assignment);
        $em->flush();

        return $this->json([
            'message' => "Vous avez rejoint le projet '{$project->getNom()}' avec succès.",
            'project' => [
                'id' => $project->getId(),
                'code' => $project->getCode(),
                'nom' => $project->getNom(),
                'role' => ProjectAssignment::ROLE_MEMBER,
            ]
        ]);
    }

    /**
     * Obtenir les détails d'un projet
     */
    #[Route('/{id}', name: 'detail', methods: ['GET'])]
    public function detail(int $id, #[CurrentUser] ?User $user, ProjectRepository $projectRepo): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $project = $projectRepo->find($id);
        if (!$project) {
            return $this->json(['error' => 'Projet introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $currentUserRole = null;
        $members = [];
        foreach ($project->getAffectations() as $aff) {
            $u = $aff->getUser();
            if ($u->getId() === $user->getId()) {
                $currentUserRole = $aff->getRole();
            }
            $members[] = [
                'id' => $u->getId(),
                'nom' => $u->getNom(),
                'email' => $u->getEmail(),
                'avatarUrl' => $u->getAvatarUrl(),
                'role' => $aff->getRole(),
                'dateAffectation' => $aff->getDateAffectation()?->format(\DateTimeInterface::ATOM),
            ];
        }

        if (!$currentUserRole) {
            return $this->json(['error' => 'Accès interdit : vous ne faites pas partie de ce projet.'], Response::HTTP_FORBIDDEN);
        }

        return $this->json([
            'id' => $project->getId(),
            'code' => $project->getCode(),
            'nom' => $project->getNom(),
            'description' => $project->getDescription(),
            'dateDebut' => $project->getDateDebut()?->format('Y-m-d'),
            'dateFin' => $project->getDateFin()?->format('Y-m-d'),
            'dateCreation' => $project->getDateCreation()?->format(\DateTimeInterface::ATOM),
            'currentUserRole' => $currentUserRole,
            'membres' => $members,
        ]);
    }
}
