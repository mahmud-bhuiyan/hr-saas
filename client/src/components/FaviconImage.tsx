import { useStyledBrandImage } from '../hooks/useStyledBrandImage';
import { buildDefaultBrandImageUrl } from '../utils/favicon';

interface FaviconImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export const FaviconImage = ({
  src,
  alt = '',
  className = 'h-4 w-4',
}: FaviconImageProps) => {
  const sizeMatch = className.match(/(?:^|\s)h-(\d+)/);
  const sizePx = sizeMatch ? Number(sizeMatch[1]) * 4 : 16;
  const renderSize = Math.max(sizePx * 2, 64);
  const styledSrc = useStyledBrandImage(src, alt.slice(0, 2) || 'HR', true, renderSize);

  return (
    <img
      src={styledSrc ?? buildDefaultBrandImageUrl(alt.slice(0, 2) || 'HR', renderSize)}
      alt={alt}
      className={`inline-block shrink-0 rounded-full ${className}`}
    />
  );
};
