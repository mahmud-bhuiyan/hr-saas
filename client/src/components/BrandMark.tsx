import { useSiteConfig } from '../contexts/SiteConfigContext';
import { BrandAssetImage } from './BrandAssetImage';
import { FaviconImage } from './FaviconImage';
import type { LogoDisplaySettings } from '../types';

interface BrandMarkProps {
  className?: string;
  textClassName?: string;
  /** Hide site name — used when the header/sidebar is collapsed to icon width. */
  compact?: boolean;
}

interface LogoImageProps {
  src: string;
  alt: string;
  display: LogoDisplaySettings;
}

export const LogoImage = ({ src, alt, display }: LogoImageProps) => (
  <BrandAssetImage
    src={src}
    alt={alt}
    shape={display.shape}
    size={display.heightPx}
    maxWidth={display.maxWidthPx}
    objectFit={display.objectFit}
  />
);

export const BrandMark = ({
  className = 'inline-flex items-center gap-2',
  textClassName = 'text-lg font-semibold text-brand-700',
  compact = false,
}: BrandMarkProps) => {
  const { config, displayName } = useSiteConfig();

  if (config.logoUrl) {
    const logoDisplay = compact
      ? {
          ...config.logoDisplay,
          heightPx: Math.min(config.logoDisplay.heightPx, 28),
          maxWidthPx: Math.min(config.logoDisplay.maxWidthPx, 36),
          showSiteName: false,
        }
      : config.logoDisplay;

    return (
      <span className={`${className}${compact ? ' max-w-full justify-center' : ''}`}>
        <LogoImage src={config.logoUrl} alt={displayName} display={logoDisplay} />
        {!compact && config.logoDisplay.showSiteName && (
          <span className={textClassName}>{displayName}</span>
        )}
      </span>
    );
  }

  if (compact) {
    const iconSrc = config.faviconUrl ?? '/favicon.png';

    return (
      <span className={`${className} max-w-full justify-center`} title={displayName}>
        <FaviconImage
          src={iconSrc}
          alt={displayName}
          className="h-7 w-7"
          shape={config.faviconDisplay.shape}
        />
      </span>
    );
  }

  return <span className={textClassName}>{displayName}</span>;
};
