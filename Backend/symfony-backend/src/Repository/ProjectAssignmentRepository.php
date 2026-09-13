<?php

namespace App\Repository;

use App\Entity\Project;
use App\Entity\ProjectAssignment;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ProjectAssignment>
 */
class ProjectAssignmentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ProjectAssignment::class);
    }

    public function findOneByProjectAndUser(Project $project, User $user): ?ProjectAssignment
    {
        return $this->createQueryBuilder('a')
            ->where('a.project = :project')
            ->andWhere('a.user = :user')
            ->setParameter('project', $project)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
