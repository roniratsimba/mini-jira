<?php

namespace App\Entity;

use App\Repository\TaskRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TaskRepository::class)]
#[ORM\Table(name: 'taches')]
class Task
{
    public const PRIORITY_LOW = 'BASSE';
    public const PRIORITY_MEDIUM = 'MOYENNE';
    public const PRIORITY_HIGH = 'HAUTE';

    public const STATUS_TODO = 'A_FAIRE';
    public const STATUS_IN_PROGRESS = 'EN_COURS';
    public const STATUS_DONE = 'TERMINE';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]   
    #[Groups(['task:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Project::class, inversedBy: 'tasks')]
    #[ORM\JoinColumn(name: 'projet_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['task:read'])]
    private ?Project $project = null;

    #[ORM\Column(length: 200)]
    #[Assert\NotBlank(message: "Le titre de la tâche est requis.")]
    #[Groups(['task:read', 'task:write'])]
    private ?string $titre = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['task:read', 'task:write'])]
    private ?string $description = null;

    #[ORM\Column(length: 20)]
    #[Groups(['task:read', 'task:write'])]
    private string $priorite = self::PRIORITY_MEDIUM;

    #[ORM\Column(length: 20)]
    #[Groups(['task:read', 'task:write'])]
    private string $statut = self::STATUS_TODO;

    #[ORM\Column(type: Types::INTEGER)]
    #[Groups(['task:read', 'task:write'])]
    private int $tempsEstime = 0; // Durée en minutes

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(['task:read', 'task:write'])]
    private ?\DateTimeInterface $dateEcheance = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['task:read'])]
    private ?\DateTimeInterface $dateCreation = null;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'assignedTasks')]
    #[ORM\JoinTable(
        name: 'assignations_taches',
        joinColumns: [new ORM\JoinColumn(name: 'tache_id', referencedColumnName: 'id', onDelete: 'CASCADE')],
        inverseJoinColumns: [new ORM\JoinColumn(name: 'membre_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    )]
    #[Groups(['task:read'])]
    private Collection $assignees;

    /**
     * @var Collection<int, WorkSession>
     */
    #[ORM\OneToMany(targetEntity: WorkSession::class, mappedBy: 'task', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(['task:read'])]
    private Collection $workSessions;

    public function __construct()
    {
        $this->assignees = new ArrayCollection();
        $this->workSessions = new ArrayCollection();
        $this->dateCreation = new \DateTime();
        $this->statut = self::STATUS_TODO;
        $this->priorite = self::PRIORITY_MEDIUM;
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

    public function getTitre(): ?string
    {
        return $this->titre;
    }

    public function setTitre(string $titre): static
    {
        $this->titre = $titre;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getPriorite(): string
    {
        return $this->priorite;
    }

    public function setPriorite(string $priorite): static
    {
        $this->priorite = $priorite;
        return $this;
    }

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;
        return $this;
    }

    public function getTempsEstime(): int
    {
        return $this->tempsEstime;
    }

    public function setTempsEstime(int $tempsEstime): static
    {
        $this->tempsEstime = $tempsEstime;
        return $this;
    }

    public function getDateEcheance(): ?\DateTimeInterface
    {
        return $this->dateEcheance;
    }

    public function setDateEcheance(?\DateTimeInterface $dateEcheance): static
    {
        $this->dateEcheance = $dateEcheance;
        return $this;
    }

    public function getDateCreation(): ?\DateTimeInterface
    {
        return $this->dateCreation;
    }

    /**
     * @return Collection<int, User>
     */
    public function getAssignees(): Collection
    {
        return $this->assignees;
    }

    public function addAssignee(User $user): static
    {
        if (!$this->assignees->contains($user)) {
            $this->assignees->add($user);
        }
        return $this;
    }

    public function removeAssignee(User $user): static
    {
        $this->assignees->removeElement($user);
        return $this;
    }

    /**
     * @return Collection<int, WorkSession>
     */
    public function getWorkSessions(): Collection
    {
        return $this->workSessions;
    }

    /**
     * Calcule le temps total passé en minutes sur cette tâche
     */
    #[Groups(['task:read'])]
    public function getTotalMinutesPassees(): int
    {
        $total = 0;
        foreach ($this->workSessions as $session) {
            $total += $session->getDureeMinutes();
        }
        return $total;
    }
}
