<?php

namespace App\Repository;

use App\Entity\Task;
use App\Entity\User;
use App\Entity\WorkSession;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<WorkSession>
 */
class WorkSessionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WorkSession::class);
    }

    /**
     * Trouve la session active (en cours, sans fin) d'un utilisateur
     */
    public function findActiveSessionByUser(User $user): ?WorkSession
    {
        return $this->createQueryBuilder('s')
            ->where('s.user = :user')
            ->andWhere('s.fin IS NULL')
            ->setParameter('user', $user)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return WorkSession[]
     */
    public function findByUser(User $user, int $limit = 20): array
    {
        return $this->createQueryBuilder('s')
            ->innerJoin('s.task', 't')
            ->addSelect('t')
            ->where('s.user = :user')
            ->setParameter('user', $user)
            ->orderBy('s.debut', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
