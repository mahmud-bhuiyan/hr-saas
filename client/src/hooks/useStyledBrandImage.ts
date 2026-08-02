import { useEffect, useState } from 'react';
import { buildDefaultBrandImageUrl, buildStyledBrandImageUrl } from '../utils/favicon';

export const useStyledBrandImage = (
  sourceUrl: string | null,
  label: string,
  enabled = true,
  size = 64
): string | null => {
  const [styledUrl, setStyledUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setStyledUrl(null);
      return;
    }

    if (!sourceUrl) {
      setStyledUrl(buildDefaultBrandImageUrl(label, size));
      return;
    }

    let cancelled = false;

    void buildStyledBrandImageUrl(sourceUrl, label, size).then((url) => {
      if (!cancelled) {
        setStyledUrl(url);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [sourceUrl, label, enabled, size]);

  return styledUrl;
};
