import type { AuthUser } from '../types';

export const displayName = (user: AuthUser): string => {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return user.email.split('@')[0] ?? 'User';
}

export const avatarLetter = (user: AuthUser): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.firstName) {
    return user.firstName[0]!.toUpperCase();
  }
  return (user.email[0] ?? 'U').toUpperCase();
}
