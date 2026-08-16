import { BrandAssetImage } from './BrandAssetImage';
import type { LogoShape } from '../types';

interface FaviconImageProps {
  src: string;
  alt?: string;
  className?: string;
  shape?: LogoShape;
}

/** Favicon mark — CSS-clipped BrandAssetImage (defaults to circle). */
export const FaviconImage = ({
  src,
  alt = '',
  className = 'h-4 w-4',
  shape = 'circle',
}: FaviconImageProps) => {
  const sizeMatch = className.match(/(?:^|\s)h-(\d+)/);
  const sizePx = sizeMatch ? Number(sizeMatch[1]) * 4 : 16;

  return (
    <BrandAssetImage
      src={src}
      alt={alt}
      shape={shape}
      size={sizePx}
      className={className}
    />
  );
};
