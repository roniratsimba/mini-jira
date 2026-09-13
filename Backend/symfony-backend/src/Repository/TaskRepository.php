<?php

namespace App\Repository;

use App\Entity\Project;
use App\Entity\Task;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Task>
 */
class TaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Task::class);
    }

    /**
     * @return Task[]
     */
    public function findByProject(Project $project): array
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.assignees', 'u')
            ->addSelect('u')
            ->leftJoin('t.workSessions', 's')
            ->addSelect('s')
            ->where('t.project = :project')
            ->setParameter('project', $project)
            ->orderBy('t.dateCreation', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Task[]
     */
    public function findByAssignee(User $user): array
    {
        return $this->createQueryBuilder('t')
            ->innerJoin('t.assignees', 'u')
            ->where('u = :user')
            ->setParameter('user', $user)
            ->orderBy('t.dateCreation', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
