<?php

namespace App\Repository;

use App\Entity\Project;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Project>
 */
class ProjectRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Project::class);
    }

    /**
     * Récupère tous les projets auxquels un utilisateur est affecté
     * @return Project[]
     */
    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('p')
            ->innerJoin('p.affectations', 'a')
            ->where('a.user = :user')
            ->setParameter('user', $user)
            ->orderBy('p.dateCreation', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByCode(string $code): ?Project
    {
        return $this->createQueryBuilder('p')
            ->where('UPPER(p.code) = UPPER(:code)')
            ->setParameter('code', trim($code))
            ->getQuery()
            ->getOneOrNullResult();
    }
}
