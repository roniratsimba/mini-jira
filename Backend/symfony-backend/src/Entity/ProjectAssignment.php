<?php

namespace App\Entity;

use App\Repository\ProjectAssignmentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ProjectAssignmentRepository::class)]
#[ORM\Table(name: 'affectations')]
#[ORM\UniqueConstraint(name: 'uq_projet_membre', columns: ['projet_id', 'membre_id'])]
class ProjectAssignment
{
    public const ROLE_ADMIN = 'ADMIN';
    public const ROLE_MEMBER = 'MEMBRE';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['project:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Project::class, inversedBy: 'affectations')]
    #[ORM\JoinColumn(name: 'projet_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private ?Project $project = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'affectations')]
    #[ORM\JoinColumn(name: 'membre_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['project:read'])]
    private ?User $user = null;

    #[ORM\Column(length: 20)]
    #[Groups(['project:read'])]
    private string $role = self::ROLE_MEMBER;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['project:read'])]
    private ?\DateTimeInterface $dateAffectation = null;

    public function __construct()
    {
        $this->dateAffectation = new \DateTime();
        $this->role = self::ROLE_MEMBER;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;
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

    public function getRole(): string
    {
        return $this->role;
    }

    public function setRole(string $role): static
    {
        if (!in_array($role, [self::ROLE_ADMIN, self::ROLE_MEMBER], true)) {
            throw new \InvalidArgumentException("Rôle non valide : $role");
        }
        $this->role = $role;
        return $this;
    }

    public function getDateAffectation(): ?\DateTimeInterface
    {
        return $this->dateAffectation;
    }
}
