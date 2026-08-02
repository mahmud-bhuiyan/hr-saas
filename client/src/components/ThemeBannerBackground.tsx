import type { ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { themeBannerUrl } from '../utils/theme-colors';

interface ThemeBannerBackgroundProps {
  children: ReactNode;
  className?: string;
}

export const ThemeBannerBackground = ({ children, className = '' }: ThemeBannerBackgroundProps) => {
  const { themeColor } = useTheme();
  const banner = themeBannerUrl(themeColor);

  return (
    <div
      className={`relative overflow-hidden bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${banner})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
};
