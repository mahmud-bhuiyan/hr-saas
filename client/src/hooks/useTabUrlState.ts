import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseTabUrlStateOptions<T extends string> {
  param?: string;
  defaultTab?: T;
}

export const useTabUrlState = <T extends string>(
  validTabs: readonly T[],
  options?: UseTabUrlStateOptions<T>
) => {
  const param = options?.param ?? 'tab';
  const defaultTab = options?.defaultTab ?? validTabs[0];
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = useMemo(() => {
    const fromUrl = searchParams.get(param);
    if (fromUrl && (validTabs as readonly string[]).includes(fromUrl)) {
      return fromUrl as T;
    }
    return defaultTab;
  }, [searchParams, param, validTabs, defaultTab]);

  useEffect(() => {
    if (searchParams.get(param) === defaultTab) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(param);
          return next;
        },
        { replace: true }
      );
    }
  }, [searchParams, param, defaultTab, setSearchParams]);

  const setActiveTab = useCallback(
    (id: T) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id === defaultTab) {
            next.delete(param);
          } else {
            next.set(param, id);
          }
          return next;
        },
        { replace: true }
      );
    },
    [defaultTab, param, setSearchParams]
  );

  return { activeTab, setActiveTab };
};
