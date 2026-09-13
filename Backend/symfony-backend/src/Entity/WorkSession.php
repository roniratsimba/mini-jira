<?php

namespace App\Entity;

use App\Repository\WorkSessionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: WorkSessionRepository::class)]
#[ORM\Table(name: 'sessions_travail')]
class WorkSession
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['task:read', 'session:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Task::class, inversedBy: 'workSessions')]
    #[ORM\JoinColumn(name: 'tache_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private ?Task $task = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'workSessions')]
    #[ORM\JoinColumn(name: 'membre_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['task:read', 'session:read'])]
    private ?User $user = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['task:read', 'session:read'])]
    private ?\DateTimeInterface $debut = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['task:read', 'session:read'])]
    private ?\DateTimeInterface $fin = null;

    #[ORM\Column(type: Types::INTEGER, options: ['default' => 0])]
    #[Groups(['task:read', 'session:read'])]
    private int $dureeMinutes = 0;

    public function __construct()
    {
        $this->debut = new \DateTime();
        $this->dureeMinutes = 0;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTask(): ?Task
    {
        return $this->task;
    }

    public function setTask(?Task $task): static
    {
        $this->task = $task;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getDebut(): ?\DateTimeInterface
    {
        return $this->debut;
    }

    public function setDebut(\DateTimeInterface $debut): static
    {
        $this->debut = $debut;
        return $this;
    }

    public function getFin(): ?\DateTimeInterface
    {
        return $this->fin;
    }

    public function setFin(?\DateTimeInterface $fin): static
    {
        $this->fin = $fin;
        if ($fin && $this->debut) {
            $diffSeconds = $fin->getTimestamp() - $this->debut->getTimestamp();
            $this->dureeMinutes = max(1, (int) round($diffSeconds / 60));
        }
        return $this;
    }

    public function getDureeMinutes(): int
    {
        return $this->dureeMinutes;
    }

    public function setDureeMinutes(int $dureeMinutes): static
    {
        $this->dureeMinutes = $dureeMinutes;
        return $this;
    }
}
