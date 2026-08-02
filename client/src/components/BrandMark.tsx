import { useSiteConfig } from '../contexts/SiteConfigContext';
import { useStyledBrandImage } from '../hooks/useStyledBrandImage';
import { buildDefaultBrandImageUrl } from '../utils/favicon';
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

interface LogoImageProps {
  src: string;
  alt: string;
  display: LogoDisplaySettings;
}

export const LogoImage = ({ src, alt, display }: LogoImageProps) => {
  const styledSrc = useStyledBrandImage(
    src,
    alt.slice(0, 2) || 'HR',
    display.shape === 'circle',
    Math.max(display.heightPx * 2, 64)
  );

  if (display.shape === 'circle') {
    const size = display.heightPx;

    return (
      <img
        src={styledSrc ?? buildDefaultBrandImageUrl(alt.slice(0, 2) || 'HR', Math.max(size * 2, 64))}
        alt={alt}
        className="inline-block shrink-0 rounded-full"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-0.5 dark:bg-white/95">
      <img src={src} alt={alt} style={getLogoImageStyle(display)} />
    </span>
  );
};

export const BrandMark = ({
  className = 'inline-flex items-center gap-2',
  textClassName = 'text-lg font-semibold text-brand-700',
}: BrandMarkProps) => {
  const { config, displayName } = useSiteConfig();

  if (config.logoUrl) {
    return (
      <span className={className}>
        <LogoImage src={config.logoUrl} alt={displayName} display={config.logoDisplay} />
        {config.logoDisplay.showSiteName && (
          <span className={textClassName}>{displayName}</span>
        )}
      </span>
    );
  }

  return <span className={textClassName}>{displayName}</span>;
};
