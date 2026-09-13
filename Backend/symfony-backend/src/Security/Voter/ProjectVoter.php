<?php

namespace App\Security\Voter;

use App\Entity\Project;
use App\Entity\ProjectAssignment;
use App\Entity\User;
use App\Repository\ProjectAssignmentRepository;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ProjectVoter extends Voter
{
    public const VIEW = 'PROJECT_VIEW';
    public const EDIT = 'PROJECT_EDIT';
    public const DELETE = 'PROJECT_DELETE';
    public const MANAGE_MEMBERS = 'PROJECT_MANAGE_MEMBERS';

    public function __construct(private ProjectAssignmentRepository $assignmentRepo)
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::VIEW, self::EDIT, self::DELETE, self::MANAGE_MEMBERS], true)
            && $subject instanceof Project;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token, ?Vote $vote = null): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Project $project */
        $project = $subject;

        $assignment = $this->assignmentRepo->findOneByProjectAndUser($project, $user);
        if (!$assignment) {
            return false;
        }

        return match ($attribute) {
            self::VIEW => true, // Tout membre assigné peut voir le projet
            self::EDIT, self::DELETE, self::MANAGE_MEMBERS => $assignment->getRole() === ProjectAssignment::ROLE_ADMIN,
            default => false,
        };
    }
}