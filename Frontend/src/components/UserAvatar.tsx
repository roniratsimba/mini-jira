import React, { useState } from 'react';

interface UserAvatarProps {
  nom?: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses: Record<string, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-24 h-24',
};

const iconSizes: Record<string, string> = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-10 h-10',
  '2xl': 'w-12 h-12',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  nom = 'Utilisateur',
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // If a valid URL is provided and has not failed to load
  const hasValidPhoto = avatarUrl && avatarUrl.trim().length > 0 && !imageError;

  if (hasValidPhoto) {
    return (
      <img
        src={avatarUrl}
        alt={nom}
        onError={() => setImageError(true)}
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover border border-slate-200/80 shadow-xs shrink-0 ${className}`}
      />
    );
  }

  // Silhouette par défaut (style Facebook / réseau social standard lorsque aucune photo n'est choisie)
  return (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} rounded-full bg-slate-200 text-slate-400 border border-slate-300/80 flex items-center justify-center shrink-0 overflow-hidden select-none shadow-xs ${className}`}
      title={nom}
      aria-label={`Photo de profil par défaut pour ${nom}`}
    >
      <svg
        className={`${iconSizes[size] || iconSizes.md} fill-current translate-y-0.5`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    </div>
  );
};
