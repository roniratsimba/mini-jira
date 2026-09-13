<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'membres')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read', 'project:read', 'task:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 150, unique: true)]
    #[Assert\NotBlank(message: "L'adresse email est requise.")]
    #[Assert\Email(message: "L'adresse email n'est pas valide.")]
    #[Groups(['user:read', 'user:write'])]
    private ?string $email = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: "Le nom complet est requis.")]
    #[Groups(['user:read', 'user:write', 'project:read', 'task:read'])]
    private ?string $nom = null;

    #[ORM\Column]
    private ?string $motDePasse = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['user:read', 'user:write', 'project:read', 'task:read'])]
    private ?string $avatarUrl = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['user:read'])]
    private ?\DateTimeInterface $dateCreation = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var Collection<int, ProjectAssignment>
     */
    #[ORM\OneToMany(targetEntity: ProjectAssignment::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $affectations;

    /**
     * @var Collection<int, Task>
     */
    #[ORM\ManyToMany(targetEntity: Task::class, mappedBy: 'assignees')]
    private Collection $assignedTasks;

    /**
     * @var Collection<int, WorkSession>
     */
    #[ORM\OneToMany(targetEntity: WorkSession::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $workSessions;

    /**
     * @var Collection<int, Notification>
     */
    #[ORM\OneToMany(targetEntity: Notification::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $notifications;

    public function __construct()
    {
        $this->affectations = new ArrayCollection();
        $this->assignedTasks = new ArrayCollection();
        $this->workSessions = new ArrayCollection();
        $this->notifications = new ArrayCollection();
        $this->dateCreation = new \DateTime();
        $this->roles = ['ROLE_USER'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->motDePasse;
    }

    public function setPassword(string $motDePasse): static
    {
        $this->motDePasse = $motDePasse;
        return $this;
    }

    public function getAvatarUrl(): ?string
    {
        return $this->avatarUrl;
    }

    public function setAvatarUrl(?string $avatarUrl): static
    {
        $this->avatarUrl = $avatarUrl;
        return $this;
    }

    public function getDateCreation(): ?\DateTimeInterface
    {
        return $this->dateCreation;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    public function eraseCredentials(): void
    {
        // Pas d'information sensible en clair
    }

    /**
     * @return Collection<int, ProjectAssignment>
     */
    public function getAffectations(): Collection
    {
        return $this->affectations;
    }

    /**
     * @return Collection<int, Task>
     */
    public function getAssignedTasks(): Collection
    {
        return $this->assignedTasks;
    }

    /**
     * @return Collection<int, WorkSession>
     */
    public function getWorkSessions(): Collection
    {
        return $this->workSessions;
    }

    /**
     * @return Collection<int, Notification>
     */
    public function getNotifications(): Collection
    {
        return $this->notifications;
    }
}
