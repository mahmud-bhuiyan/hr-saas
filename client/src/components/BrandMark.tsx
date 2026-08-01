import { useSiteConfig } from '../contexts/SiteConfigContext';
import type { LogoDisplaySettings } from '../types';

interface BrandMarkProps {
  className?: string;
  textClassName?: string;
}

export const getLogoImageStyle = (display: LogoDisplaySettings): React.CSSProperties => ({
  height: `${display.heightPx}px`,
  maxWidth: `${display.maxWidthPx}px`,
  objectFit: display.objectFit,
});

export const BrandMark = ({
  className = 'inline-flex items-center gap-2',
  textClassName = 'text-lg font-semibold text-brand-700',
}: BrandMarkProps) => {
  const { config, displayName } = useSiteConfig();
  const logoStyle = getLogoImageStyle(config.logoDisplay);

  if (config.logoUrl) {
    return (
      <span className={className}>
        <img src={config.logoUrl} alt={displayName} style={logoStyle} />
        {config.logoDisplay.showSiteName && (
          <span className={textClassName}>{displayName}</span>
        )}
      </span>
    );
  }

  return <span className={textClassName}>{displayName}</span>;
};
