<?php

namespace App\DataFixtures;

use App\Entity\Notification;
use App\Entity\Project;
use App\Entity\ProjectAssignment;
use App\Entity\Task;
use App\Entity\User;
use App\Entity\WorkSession;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $hasher)
    {
    }

    public function load(ObjectManager $manager): void
    {
        // 1. Membres
        $admin = new User();
        $admin->setNom('Sarah Connor');
        $admin->setEmail('sarah@minijira.io');
        $admin->setPassword($this->hasher->hashPassword($admin, 'password123'));
        $admin->setRoles(['ROLE_USER', 'ROLE_ADMIN']);
        $manager->persist($admin);

        $dev1 = new User();
        $dev1->setNom('Thomas Anderson');
        $dev1->setEmail('thomas@minijira.io');
        $dev1->setPassword($this->hasher->hashPassword($dev1, 'password123'));
        $manager->persist($dev1);

        $dev2 = new User();
        $dev2->setNom('Ada Lovelace');
        $dev2->setEmail('ada@minijira.io');
        $dev2->setPassword($this->hasher->hashPassword($dev2, 'password123'));
        $manager->persist($dev2);

        // 2. Projet
        $project = new Project();
        $project->setCode('JIRA-V3');
        $project->setNom('Mini-Jira Platform 2025');
        $project->setDescription('Refonte moderne en React 18 et backend Symfony 7 avec API RESTful et PostgreSQL.');
        $project->setDateDebut(new \DateTime('2025-01-01'));
        $project->setDateFin(new \DateTime('2025-12-31'));
        $manager->persist($project);

        // 3. Affectations
        $aff1 = new ProjectAssignment();
        $aff1->setProject($project);
        $aff1->setUser($admin);
        $aff1->setRole(ProjectAssignment::ROLE_ADMIN);
        $manager->persist($aff1);

        $aff2 = new ProjectAssignment();
        $aff2->setProject($project);
        $aff2->setUser($dev1);
        $aff2->setRole(ProjectAssignment::ROLE_MEMBER);
        $manager->persist($aff2);

        $aff3 = new ProjectAssignment();
        $aff3->setProject($project);
        $aff3->setUser($dev2);
        $aff3->setRole(ProjectAssignment::ROLE_MEMBER);
        $manager->persist($aff3);

        // 4. Tâches
        $task1 = new Task();
        $task1->setProject($project);
        $task1->setTitre('Architecture de la base de données PostgreSQL & Migrations Doctrine');
        $task1->setDescription('Établir le schéma 3FN avec clés étrangères ON DELETE CASCADE et index b-tree.');
        $task1->setPriorite(Task::PRIORITY_HIGH);
        $task1->setStatut(Task::STATUS_DONE);
        $task1->setTempsEstime(240);
        $task1->addAssignee($admin);
        $task1->addAssignee($dev2);
        $manager->persist($task1);

        $task2 = new Task();
        $task2->setProject($project);
        $task2->setTitre('Sécurisation de l’API REST avec LexikJWTAuthenticationBundle');
        $task2->setDescription('Configurer les paires de clés RSA (private.pem / public.pem) et le firewall stateless.');
        $task2->setPriorite(Task::PRIORITY_HIGH);
        $task2->setStatut(Task::STATUS_IN_PROGRESS);
        $task2->setTempsEstime(180);
        $task2->addAssignee($dev1);
        $manager->persist($task2);

        $task3 = new Task();
        $task3->setProject($project);
        $task3->setTitre('Intégration du Kanban drag-and-drop & Synchronisation des états');
        $task3->setDescription('Connecter l’interface React avec les routes PATCH /api/tasks/{id}/status.');
        $task3->setPriorite(Task::PRIORITY_MEDIUM);
        $task3->setStatut(Task::STATUS_TODO);
        $task3->setTempsEstime(300);
        $task3->addAssignee($dev1);
        $manager->persist($task3);

        // 5. WorkSession
        $session = new WorkSession();
        $session->setTask($task1);
        $session->setUser($admin);
        $session->setDebut(new \DateTime('-2 hours'));
        $session->setFin(new \DateTime('-30 minutes'));
        $session->setDureeMinutes(90);
        $manager->persist($session);

        // 6. Notifications
        $notif = new Notification();
        $notif->setUser($admin);
        $notif->setType('ASSIGNATION');
        $notif->setTitre('Projet initialisé');
        $notif->setMessage('Bienvenue sur votre espace Mini-Jira avec backend Symfony 7 !');
        $manager->persist($notif);

        $manager->flush();
    }
}
