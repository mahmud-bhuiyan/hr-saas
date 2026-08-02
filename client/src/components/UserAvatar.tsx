import type { AuthUser } from '../types';
import { avatarLetter } from '../utils/user';

interface UserAvatarProps {
  user: AuthUser;
  className?: string;
  textClassName?: string;
  variant?: 'default' | 'onBrand';
}

export const UserAvatar = ({
  user,
  className = 'h-9 w-9',
  textClassName = 'text-sm',
  variant = 'default',
}: UserAvatarProps) => {
  if (user.avatarUrl) {
    const ringClass = variant === 'onBrand' ? 'ring-2 ring-white/30' : '';

    return (
      <img
        src={user.avatarUrl}
        alt=""
        className={`shrink-0 rounded-full object-cover ${ringClass} ${className}`}
      />
    );
  }

  const fallbackClass =
    variant === 'onBrand'
      ? 'bg-white font-semibold text-brand-600'
      : 'bg-brand-100 font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300';

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${fallbackClass} ${className} ${textClassName}`}
    >
      {avatarLetter(user)}
    </span>
  );
};
